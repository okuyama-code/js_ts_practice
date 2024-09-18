// クエリオブジェクトの型定義
interface QueryType {
  forecastVersionType: string;
  confirmationStatus: string;
  parkingId: number;
  transportType: string;
  transportOperationCount: number;
  freeTimeDurationMin: number;
  freeTimeDurationMax: number;
  beginFreeDateTimeMax: Date;
  endFreeDateTimeMin: Date;
  waitingParkingId: number;
  carrierTypeId: number;
  beginDateTimeBegin: Date;
  beginDateTimeEnd: Date;
  endDateTimeBegin: Date;
  endDateTimeEnd: Date;
  operationTimeRateMin: number;
  operationTimeRateMax: number;
  loadingTimeRateMin: number;
  loadingTimeRateMax: number;
}

// 日付をISOStringに変換した結果の型を定義
type DateToISOString<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

// オブジェクト内のDate型プロパティをISO文字列に変換する関数
export function convertDatesToIsoStrings<T extends object>(obj: T): DateToISOString<T> {
  // Object.keys(obj)でオブジェクトのキーを配列として取得
  // as Array<keyof T>でTypeScriptに型を教える
  return (Object.keys(obj) as Array<keyof T>).reduce((acc, key) => {
    // 現在のキーの値を取得
    const value = obj[key];

    // 値がDate型かどうかをチェック
    if (value instanceof Date) {
      console.log(`${String(key)}はDate型です。ISO文字列に変換します。`);
      // Date型の場合、ISO文字列に変換して新しいオブジェクトに追加
      return { ...acc, [key]: value.toISOString() };
    }

    console.log(`${String(key)}はDate型ではありません。そのまま保持します。`);
    // Date型でない場合、値をそのまま新しいオブジェクトに追加
    return { ...acc, [key]: value };
  }, {} as DateToISOString<T>); // 空のオブジェクトから開始し、最終的な型をDateToISOString<T>とする
}


const query: QueryType = {
  forecastVersionType: 'FINAL',
  confirmationStatus: 'CONFIRMED',
  parkingId: 1,
  transportType: 'LOCAL',
  transportOperationCount: 1,
  freeTimeDurationMin: 0,
  freeTimeDurationMax: 2,
  beginFreeDateTimeMax: new Date('2024-02-03T17:00:00Z'),
  endFreeDateTimeMin: new Date('2024-02-03T18:00:00Z'),
  waitingParkingId: 1,
  carrierTypeId: 1,
  beginDateTimeBegin: new Date('2024-02-02'),
  beginDateTimeEnd: new Date('2024-02-05'),
  endDateTimeBegin: new Date('2024-02-02'),
  endDateTimeEnd: new Date('2024-02-05'),
  operationTimeRateMin: 0.3,
  operationTimeRateMax: 0.4,
  loadingTimeRateMin: 0.3,
  loadingTimeRateMax: 0.4,
};

const convertedQuery = convertDatesToIsoStrings(query);
console.log(convertedQuery);


// // DateToISOString<T> 型の定義
// type DateToISOString<T> = {
//   // T のすべてのプロパティ K に対して
//   [K in keyof T]: T[K] extends Date ? string : T[K];
// }

// この型定義について、順を追って説明します：

// type DateToISOString<T>: これは、ジェネリック型 T を受け取る新しい型を定義しています。
// { ... }: この中かっこは、新しいオブジェクト型を作成することを示しています。
// [K in keyof T]: これは、型 T のすべてのプロパティキーを反復処理することを意味します。

// keyof T は、T のすべてのプロパティ名を取得します。
// K in ... は、それらのプロパティ名を一つずつ K として扱うことを示します。


// T[K] extends Date ? string : T[K]: これは条件付き型（Conditional Type）です。

// T[K] は、型 T のプロパティ K の型を表します。
// extends Date は、その型が Date 型かどうかをチェックします。
// ? と : は、三項演算子のように動作します。
// Date 型の場合は string 型に変換し、そうでない場合は元の型 T[K] をそのまま使用します。



// この型定義の目的は、オブジェクト内のすべての Date 型のプロパティを string 型に変換することです。これは、例えばJSONシリアライズを行う際に、Date オブジェクトを ISO 文字列形式に変換するのに役立ちます。