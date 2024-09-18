/**
 * 指定されたISOフォーマットの日付文字列を日本時間（UTC+9）に変換し、
 * YYYY/MM/DD 形式の文字列として返す関数
 *
 * @param dateString - ISOフォーマットの日付文字列
 *   例1: "2025-02-18T09:09:52.570Z" → (UTC: 2025/02/18 09:09) → 日本時間: "2025/02/18"
 *   例2: "2023-12-31T15:00:00.000Z" → (UTC: 2023/12/31 15:00) → 日本時間: "2024/01/01" (翌日)
 *   例3: "2024-07-20T18:45:00.000Z" → (UTC: 2024/07/20 18:45) → 日本時間: "2024/07/21" (翌日)
 *
 * @returns 日本時間に変換後のYYYY/MM/DD形式の日付文字列
 *   例1: "2025/02/18"
 *   例2: "2024/01/01" (UTCの15:00以上で翌日)
 *   例3: "2024/07/21" (UTCの18:45で翌日)
 */
export const formatToJapanDate = (dateString: string): string => {
  // 受け取ったISOフォーマットの日付をDateオブジェクトに変換
  const date = new Date(dateString);

  // 日本時間に変換（UTC+9）するため、9時間を加算
  const japanTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);


  // 年・月・日を取得し、2桁フォーマットに変換
  const year = japanTime.getUTCFullYear();

  const month = String(japanTime.getUTCMonth() + 1).padStart(2, '0'); // 0始まりなので+1
  const day = String(japanTime.getUTCDate()).padStart(2, '0');


  // フォーマットした日付を返す
  return `${year}/${month}/${day}`;
};

// 使用例
console.log(formatToJapanDate("2025-02-18T09:09:52.570Z")); // 出力: "2025/02/18" (同日)
console.log(formatToJapanDate("2024-06-01T23:59:59.999Z")); // 出力: "2024/06/02" (UTC 23:59 → JST 翌日)
console.log(formatToJapanDate("2023-12-31T15:00:00.000Z")); // 出力: "2024/01/01" (UTC 15:00 → JST 翌日)
console.log(formatToJapanDate("2024-03-10T15:30:00.000Z")); // 出力: "2024/03/11" (UTC 15:30 → JST 翌日)
console.log(formatToJapanDate("2024-07-20T18:45:00.000Z")); // 出力: "2024/07/21" (UTC 18:45 → JST 翌日)
