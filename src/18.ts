// TypeScriptのオブジェクト展開と上書きを学ぶ問題集

// 問題 1: 基本的なオブジェクトの展開
// 次のコードを実行すると newObj の出力はどうなりますか？
const obj1 = { x: 10, y: 20 };
const newObj1 = { ...obj1, y: 50 };
console.log(newObj1);
// 期待値: { x: 10, y: 50 }

// 問題 2: 動的キーを持つオブジェクトの展開
// 次のコードを修正して、"keyName" の値が "updated" になるようにしてください。
const keyName = "dynamicKey";
const obj2 = { [keyName]: "original" };
const newObj2 = { ...obj2, [keyName]: "updated" };
console.log(newObj2);
// 期待値: { dynamicKey: "updated" }

// 問題 3: ネストされたオブジェクトの展開と上書き
// obj3 の中のネストされたオブジェクトを正しく更新するには？
const obj3 = { a: { b: 10, c: 20 }, d: 30 };
const newObj3 = { ...obj3, a: { ...obj3.a, c: 50 } };
console.log(newObj3);
// 期待値: { a: { b: 10, c: 50 }, d: 30 }

// 問題 4: 配列を含むオブジェクトの展開
// 次のコードを修正して、配列の内容を変更しつつ、元の配列を変更しないようにしてください。
const obj4 = { arr: [1, 2, 3], num: 100 };
const newObj4 = { ...obj4, arr: [...obj4.arr, 4] };
console.log(newObj4);
// 期待値: { arr: [1, 2, 3, 4], num: 100 }

// 問題 5: 関数を用いた動的なオブジェクトの展開
// updateObject関数を実装して、指定されたキーの値を更新できるようにしてください。
function updateObject<T extends Record<string, any>>(obj: T, key: keyof T, value: any): T {
    return { ...obj, [key]: value };
}

const obj5 = { name: "Alice", age: 25 };
const updatedObj5 = updateObject(obj5, "age", 30);
console.log(updatedObj5);
// 期待値: { name: "Alice", age: 30 }
