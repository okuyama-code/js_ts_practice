// 配列を指定されたサイズのチャンク（部分配列）に分割する関数
function chunkArray(array: number[], size: number): number[][] {
  // Array.from() を使用して新しい配列を作成
  return Array.from(
    // 作成する配列の長さを指定。Math.ceil() を使用して、
    // 必要なチャンクの数を計算（小数点以下を切り上げ）
    { length: Math.ceil(array.length / size) },

    // 各チャンクを生成するコールバック関数
    (_, index) => {
      // 現在のチャンクの開始位置を計算
      const start = index * size;
      // 現在のチャンクの終了位置を計算
      const end = start + size;
      // array.slice() を使用して、開始位置から終了位置までの要素を取得
      return array.slice(start, end);
    }
  );
}

// 使用例
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
console.log(chunkArray(numbers, 2));
