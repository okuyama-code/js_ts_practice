import { Injectable, Logger } from '@nestjs/common';
import { OneDayCourse, PrismaClient, Tour } from '@prisma/client';
import * as R from 'remeda';
import { TourCostSummaryModel } from '../../model/tour-cost-summary.model';
import { CacheProvider } from '../../provider/cache.provider';
import { chunk } from '../../utils/array.utils';
import { PrismaService, Transaction } from '../prisma/prisma.service';
import { RequestTransactionService } from '../prisma/request-transaction.service';
import { isNightTimeJST } from '../../../auto-dispatches/services/create-one-day-courses';

type TourCostAnalysis = {
  tourId: number;
  cost: number;
  estimatedFare: number;
  actualFare: number;
  fareDifference: number;
  profit: number;
}

type OneDayCourseCostAnalysis = {
  oneDayCourseId: number;
  cost: number;
  estimatedFare: number;
  actualFare: number;
  fareDifference: number;
  profit: number;
}

type TourOperationAnalyses = {
  tourOperationId: bigint;
  cost: number;
  estimatedFare: number;
  actualFare: number;
  fareDifference: number;
  profit: number;
}

@Injectable()
export class CostCalculationService {
  private readonly logger = new Logger(this.constructor.name);
  private logCounter = 1;
  private readonly LOG_LIMIT = 4;

  constructor(
    private readonly requestTx: RequestTransactionService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * ツアーを受け取り、コストを計算してTourCostSummaryModelを返す。
   * @param prisma
   * @param tour Tour
   * @returns Promise<TourCostSummaryModel>
   */
  // 計算式のドキュメント
  // https://docs.google.com/spreadsheets/d/1SKPBM8C7rxRW3Fc4kqlszTvPXsG53TqNKNPamrtJlr4/edit?gid=0#gid=0
  async getTourCostSummary(
    prisma: Transaction<PrismaClient>,
    tour: Tour,
  ): Promise<TourCostSummaryModel> {
    // cost_parameterを取得する
    const costParameterProvider = new CacheProvider(
      async (carrierTypeId: number) => {
        return await prisma.costParameters.findFirst({
          // コストのマスターデータが準備できたらコメントを解消する
          // where: {
          //   carrierTypeId: carrierTypeId,
          // },
        });
      },
    );

    const costParameter = await costParameterProvider.provide(
      tour.carrierTypeId,
    );

    // 対象のcost_parameterが見つからなかった場合、空のデータを返す
    if (!costParameter) {
      return {
        cost: null,
        estimatedFare: null,
        actualFare: null,
        fareDifference: null,
        profit: null,
      };
    }

    const tourOperations = await prisma.tourOperation.findMany({
      where: {
        tourId: tour.tourId,
      },
    });

    const tourOperationsWithTransport = await prisma.tourOperation.findMany({
      where: {
        tourId: tour.tourId,
        transportOperationId: {
          not: null,
        },
      },
    });

    const transportOperationIds = tourOperationsWithTransport
      .map((transportOperation) => transportOperation.transportOperationId)
      .filter((id): id is bigint => id !== null); // nullを確実に除外し、型を保証

    const detailViews = await prisma.transportOperationDetailView.findMany({
      where: {
        transportOperationId: {
          in: transportOperationIds,
        },
      },
    });

    const actualFare = detailViews.reduce((sum, detailView) => {
      return sum + (detailView.actualFare ?? 0);
    }, 0);

    // 対象のrouteを探すための条件文をまとめる
    const conditions = [];
    const locations: string[] = [];
    for (const tourOperation of tourOperations) {
      if (tourOperation.startLocationId == tourOperation.goalLocationId) {
        // スタートとゴールが同じ位置のものは対象外
        continue;
      }
      const str =
        tourOperation.startLocationId + ',' + tourOperation.goalLocationId;
      if (!locations.includes(str)) {
        locations.push(str);
        conditions.push({
          startLocationId: tourOperation.startLocationId,
          goalLocationId: tourOperation.goalLocationId,
        });
      }
    }

    // prismaに投げて総距離を取得する
    const result = await prisma.route.aggregate({
      _sum: {
        distance: true,
      },
      where: {
        OR: conditions,
      },
    });

    const totalDistance = result._sum.distance || 0;

    const tourSummary = await prisma.tourSummary.findUniqueOrThrow({
      where: {
        tourId: tour.tourId
      }
    })

    // TODO この二つの値の条件はまだサンプル。特にLINEHAULの場合24, 48時間になるはずなのでtourの時間で判定できるようにする
    const TOUR_HOUR = tourSummary.transportType === 'LOCAL' ? 12 : 24
    // 人件費は1日あたりで登録されてるのでツアーによって計算する必要がある
    const DAILY_LABOR_COST_DIVISOR = tourSummary.transportType === 'LOCAL' ? 2 : 1;

    const variableCost = costParameter.totalVariableCost;

    // TODO tour.isNightTourに値を格納できるようになるまで仮でこちらを使う
    const personnelCost =
      (isNightTimeJST(tourSummary.beginDateTime)
        ? costParameter.nightShiftMonthlyLaborCost
        : costParameter.dayShiftMonthlyLaborCost) / DAILY_LABOR_COST_DIVISOR;

    // TODO tour.isNightTourに値を格納できるようになったらこっちに切り替える
    // const personnelCost =
    //   // TODO tour.isNightTour　こんごはこれでOK
    //   (tour.isNightTour
    //     ? costParameter.nightShiftMonthlyLaborCost
    //     : costParameter.dayShiftMonthlyLaborCost) / DAILY_LABOR_COST_DIVISOR;

    const fixedCost = costParameter.hourlyFixedCost * TOUR_HOUR;
    const totalCost = Math.round(
      variableCost * totalDistance + personnelCost + fixedCost,
    );
    const profitMargin = 0.92; // 利率（固定値）
    const tourEstimatedFare = Math.round(totalCost / profitMargin);

    return {
      cost: totalCost,                                 // 運送原価
      estimatedFare: tourEstimatedFare,                // 想定売価 (運送原価 / 0.92)
      actualFare: actualFare,                          // 実売価 (運賃)
      fareDifference: actualFare - tourEstimatedFare,  // 売価差額 (実売価 - 想定売価)
      profit: actualFare - totalCost,                  // 売上総利益 (実売価 - 原価)
    };
  }

  async getAndSaveTourOperationCostSummary(
    prisma: Transaction<PrismaClient>,
    tour: Tour,
  ) {

    // tourに含まれている地場または幹線のoperationを取得する
    const tourOperationsWithTransport = await prisma.tourOperation.findMany({
      where: {
        tourId: tour.tourId,
        transportOperationId: {
          not: null,
        },
      },
    });

    // それらの総距離を出し定数に格納する。
    // 地場と幹線のみのrouteを探すための条件文をまとめる
    const conditions = [];
    const tourOperationsDistance: number[] = [];

    for (const tourOperation of tourOperationsWithTransport) {
      conditions.push({
        startLocationId: tourOperation.startLocationId,
        goalLocationId: tourOperation.goalLocationId,
      })

      try {
        const route = await prisma.route.findFirstOrThrow({
          where: {
            startLocationId: tourOperation.startLocationId,
            goalLocationId: tourOperation.goalLocationId,
          }
        });

        tourOperationsDistance.push(route.distance);
      } catch (error) {
        tourOperationsDistance.push(0);
      }
    }

    const totalDistance = tourOperationsDistance.reduce((sum, distance) => sum + distance, 0);

    const tourCostAnalysis = await prisma.tourCostAnalysis.findUnique({
      where: {
        tourId: tour.tourId
      }
    })


    const TourOperationAnalysesConditions: TourOperationAnalyses[] = [];

    // ツアーに含まれている地場、幹線のそれぞれの構成比を出し、
    tourOperationsWithTransport.forEach((tourOperation, index) => {
      const tourOperationDistansh = tourOperationsDistance[index]

      // 0.15.4 小数点以下1桁に丸める (四捨五入)
      const tourOperationCompositionRatio = Math.round((tourOperationDistansh / totalDistance) * 10) / 10;

      const tourOperationCost = tourCostAnalysis.cost * tourOperationCompositionRatio
      const tourOperationEstimatedFare = tourCostAnalysis.estimatedFare * tourOperationCompositionRatio
      const tourOperationActualFare = tourCostAnalysis.actualFare * tourOperationCompositionRatio
      const tourOperationFareDifference = tourCostAnalysis.fareDifference * tourOperationCompositionRatio
      const tourOperationProfit = tourCostAnalysis.profit * tourOperationCompositionRatio

      const tourOperationAnalysis = {
        tourOperationId: tourOperation.tourOperationId,
        cost: tourOperationCost || 0,
        estimatedFare: tourOperationEstimatedFare || 0,
        actualFare: tourOperationActualFare || 0,
        fareDifference: tourOperationFareDifference || 0,
        profit: tourOperationProfit || 0
      }

      TourOperationAnalysesConditions.push(tourOperationAnalysis)
    })

    if (TourOperationAnalysesConditions.length === 0) {
      return
    }

    // 運行あたりの原価などをDBに保存する
    await prisma.tourOperationCostAnalysis.createMany({
      data: TourOperationAnalysesConditions
    })
  }


  async saveTourOperationCostAnalysisByTourIds(
    prisma: Transaction<PrismaClient>,
    tourIds: number[],
  ) {
    await R.pipe(
      tourIds,
      chunk(),
      R.map(async (chunkedTourIds: number[]) => {
        // 対象のツアーを取得する
        const tours = await prisma.tour.findMany({
          where: {
            tourId: {
              in: chunkedTourIds,
            },
          },
        });

        // ここで運行あたりの原価などをDBに保存している
        await Promise.all(
          tours.map((tour) => {
            return this.getAndSaveTourOperationCostSummary(prisma, tour)
          })
        )
      }),
      (x) => Promise.all(x),
    );
  }

}


