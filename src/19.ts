// TypeScript でのサンプルコード
type Data = {
  id: number;
  name: string;
  age: number;
  city: string;
};

// 変更を監視するカラム（name と city だけを対象にする）
const monitoredColumns: string[] = ["name", "city"];

// サンプルデータ
const data: Data = {
  id: 1,
  name: "Alice",
  age: 25,
  city: "Tokyo",
};

// `Object.entries(data)` を使ってオブジェクトを配列化
const entries = Object.entries(data);

console.log("data:", data); // キーと値の配列を確認
console.log("entries:", entries); // キーと値の配列を確認

// `monitoredColumns` に含まれるキーだけをフィルタリング
// const filteredEntries = entries.map(([key, value]) => console.log(key, value));
// console.log("filteredEntries:", filteredEntries); // フィルタ後のデータ確認
const filteredEntries = entries.filter(([key]) => monitoredColumns.includes(key));
console.log("filteredEntries:", filteredEntries); // フィルタ後のデータ確認

// // `Object.fromEntries()` を使ってオブジェクトに戻す
const auditedChanges = Object.fromEntries(filteredEntries);
console.log("auditedChanges:", auditedChanges); // 最終的なオブジェクトを確認

