// Array(150) について

// Array(150) は「スパース配列」を作成します。長さは150ですが、実際の要素は存在しません。そのため、map のような操作が期待通りに動作しません。
const arr1 = Array(150)
console.log(arr1.length); // 出力: 150
console.log(arr1[0]); // 出力: undefined
console.log(arr1.map(x => x + 1)); // 出力: [ <150 empty items> ]


const arr2 = [...Array(150)];
console.log(arr2.length); // 出力: 150
console.log(arr2[0]); // 出力: undefined
console.log(arr2.map(x => x + 1)); // 出力: [NaN, NaN, ..., NaN] (150個のNaN)