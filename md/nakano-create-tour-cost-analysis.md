```ts
// 例として、545件のツアーIDがある場合を考えてみましょう
const tourIds = [1, 2, 3, ..., 545];  // 1から545までの配列
const CHUNK_SIZE = 100;

// チャンク（分割）処理
function chunk<T>(array: T[], size: number): T[][] {
  // 1. 必要な分割数を計算
  // Math.ceil(545 / 100) = Math.ceil(5.45) = 6
  const chunksNeeded = Math.ceil(array.length / size);

  return Array.from(
    { length: chunksNeeded },  // length: 6 の配列を作成
    (_, index) => {
      const start = index * size;
      const end = start + size;
      return array.slice(start, end);
    }
  );
}

const chunkedArrays = chunk(tourIds, CHUNK_SIZE);
```
この場合、以下のように分割されます：

```ts
typescriptCopychunkedArrays = [
  // 1つ目のチャンク（index = 0）
  [1, 2, 3, ..., 100],    // 1-100番目    （100件）

  // 2つ目のチャンク（index = 1）
  [101, 102, ..., 200],   // 101-200番目  （100件）

  // 3つ目のチャンク（index = 2）
  [201, 202, ..., 300],   // 201-300番目  （100件）

  // 4つ目のチャンク（index = 3）
  [301, 302, ..., 400],   // 301-400番目  （100件）

  // 5つ目のチャンク（index = 4）
  [401, 402, ..., 500],   // 401-500番目  （100件）

  // 6つ目のチャンク（index = 5）
  [501, 502, ..., 545]    // 501-545番目  （45件）
]
'''

具体的な分割の過程：

インデックス0: 0 * 100から100まで → 最初の100件
インデックス1: 100 * 1から200まで → 次の100件
インデックス2: 100 * 2から300まで → 次の100件
インデックス3: 100 * 3から400まで → 次の100件
インデックス4: 100 * 4から500まで → 次の100件
インデックス5: 100 * 5から545まで → 残りの45件

これにより：

最初の5つのチャンクは各100件ずつ
最後のチャンクは45件
合計545件のデータを6つのグループに分割

この分割されたデータは、その後のコードで以下のように処理されます：
```ts
 results = await Promise.all(
  chunkedArrays.map(async (chunkedIds) => {
    // 100件ずつ処理
    const tourSummaries = await prisma.tourSummary.findMany({
      where: { tourId: { in: chunkedIds } },
      include: { tour: true },
    });

    // ... 以降の処理 ...
  })
);
```
これにより、データベースへの負荷を分散しながら、全てのデータを効率的に処理することができます。



```ts
import {
  PrismaClient,
  TourCostAnalysis,
  TourSetType,
  TourSummary,
  TourOperation,
  CostParameters,
  Route,
} from '@prisma/client';
import { Transaction } from '../../shared/serivces/prisma/prisma.service';
import { getTourHour } from '../../shared/cost-calculation/calc-tour-duration';

// チャンクサイズの定数
const CHUNK_SIZE = 100;

// チャンク（分割）処理
function chunk<T>(array: T[], size: number): T[][] {
  // 1. 必要な分割数を計算
  // Math.ceil(545 / 100) = Math.ceil(5.45) = 6
  const chunksNeeded = Math.ceil(array.length / size);

  return Array.from(
    { length: chunksNeeded },  // length: 6 の配列を作成
    (_, index) => {
      const start = index * size;
      const end = start + size;
      return array.slice(start, end);
    }
  );
}

// 型定義の改善
interface RouteCondition {
  startLocationId: number;
  goalLocationId: number;
}

interface CalculateAnalysisParams {
  tourSummary: TourSummary;
  tourOperations: TourOperation[];
  totalDistance: number;
  costParameter: CostParameters;
  actualFare: number;
}

async function getTourCostSummary(
  prisma: Transaction<PrismaClient>,
  tourSummary: TourSummary,
): Promise<TourCostAnalysis> {
  try {
    const [tourOperations, tourOperationsWithTransport, costParameter] = await Promise.all([
      prisma.tourOperation.findMany({
        where: { tourId: tourSummary.tourId },
      }),
      prisma.tourOperation.findMany({
        where: {
          tourId: tourSummary.tourId,
          transportOperationId: { not: null },
        },
      }),
      prisma.costParameters.findFirst({
        where: { carrierTypeId: tourSummary.carrierTypeId },
      }),
    ]);

    if (!costParameter || !tourOperations.length) {
      return createNullAnalysis(tourSummary.tourId);
    }

    const transportOperationIds = tourOperationsWithTransport
      .map(op => op.transportOperationId)
      .filter((id): id is bigint => id !== null);

    const detailViews = await prisma.transportOperationDetailView.findMany({
      where: {
        transportOperationId: {
          in: transportOperationIds,
        },
      },
    });

    const actualFare = detailViews.reduce((sum, view) => sum + view.actualFare, 0);

    const uniqueRouteConditions = getUniqueRouteConditions(tourOperations);
    const routes = await prisma.route.findMany({
      where: {
        OR: uniqueRouteConditions,
      },
    });

    const routeMap = new Map(
      routes.map(route => [
        `${route.startLocationId}-${route.goalLocationId}`,
        route
      ])
    );

    const totalDistance = calculateTotalDistance(uniqueRouteConditions, routeMap);

    if (totalDistance === null) {
      return createNullAnalysis(tourSummary.tourId);
    }

    return calculateAnalysis({
      tourSummary,
      tourOperations,
      totalDistance,
      costParameter,
      actualFare,
    });

  } catch (error) {
    console.error('Error in getTourCostSummary:', error);
    return createNullAnalysis(tourSummary.tourId);
  }
}

function calculateAnalysis({
  tourSummary,
  tourOperations,
  totalDistance,
  costParameter,
  actualFare,
}: CalculateAnalysisParams): TourCostAnalysis {
  if (!tourSummary.transportType) {
    throw new Error('ERROR: TransportTypeが存在しません。');
  }

  const tourHour = getTourHour(
    tourSummary.transportType,
    tourOperations[0].tourHourType,
  );

  const personnelCost =
    tourOperations[0].tourSetType === TourSetType.BACK
      ? costParameter.nightShiftDailyLaborCost
      : costParameter.dayShiftDailyLaborCost;

  const fixedUnitCost = costParameter.fixedCostPerHour;
  const fixedCost = fixedUnitCost * tourHour;

  const variableUnitCost = costParameter.variableCostPerKm;
  const variableCost = variableUnitCost;

  const profitMargin = costParameter.profitMargin;

  const totalCost = variableCost * totalDistance + personnelCost + fixedCost;
  const estimatedFare = totalCost / (1 - profitMargin);

  return {
    tourId: tourSummary.tourId,
    cost: totalCost,
    estimatedFare: estimatedFare,
    actualFare: actualFare,
    fareDifference: actualFare - estimatedFare,
    profit: actualFare - totalCost,
    variableCost: variableCost,
    variableUnitCost: variableUnitCost,
    fixedCost: fixedCost,
    fixedUnitCost: fixedUnitCost,
    laborCost: personnelCost,
    profitMargin: profitMargin,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function getUniqueRouteConditions(tourOperations: TourOperation[]): RouteCondition[] {
  const seen = new Set<string>();
  return tourOperations
    .filter(op => op.startLocationId !== op.goalLocationId)
    .filter(op => {
      const key = `${op.startLocationId}-${op.goalLocationId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(op => ({
      startLocationId: op.startLocationId,
      goalLocationId: op.goalLocationId,
    }));
}

function calculateTotalDistance(
  conditions: RouteCondition[],
  routeMap: Map<string, Route>
): number | null {
  let totalDistance = 0;
  for (const condition of conditions) {
    const route = routeMap.get(`${condition.startLocationId}-${condition.goalLocationId}`);
    if (route == null || route.distance == null) return null;
    totalDistance += route.distance;
  }
  return totalDistance;
}

function createNullAnalysis(tourId: number): TourCostAnalysis {
  return {
    tourId,
    cost: null,
    estimatedFare: null,
    actualFare: 0,
    fareDifference: null,
    profit: null,
    variableCost: null,
    variableUnitCost: null,
    fixedCost: null,
    fixedUnitCost: null,
    laborCost: null,
    profitMargin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function saveTourCostAnalysisByTourIds(
  prisma: Transaction<PrismaClient>,
  tourIds: number[],
): Promise<TourCostAnalysis[]> {
  try {
    // chunk関数で100件ずつに分割
    // [[1...100], [101...200], ..., [901...1000]] のような配列になります
    const chunkedArrays = chunk(tourIds, CHUNK_SIZE);
    const results = await Promise.all(
      chunkedArrays.map(async (chunkedIds) => {
        const tourSummaries = await prisma.tourSummary.findMany({
          where: { tourId: { in: chunkedIds } },
          include: { tour: true },
        });

        const analyses = await Promise.all(
          tourSummaries.map(summary => getTourCostSummary(prisma, summary))
        );

        await prisma.tourCostAnalysis.createMany({
          data: analyses,
        });

        return analyses;
      })
    );

    return results.flat();
  } catch (error) {
    console.error('Error in saveTourCostAnalysisByTourIds:', error);
    throw error;
  }
}
```