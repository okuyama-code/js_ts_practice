// 完全なランダムではなく、要素のWeight（重み）によって選ばれる確率が異なるランダム

/**
 * 指定された重みに基づいて、ランダムに `items` の中から 1 つを選択する関数
 *
 * @param items 選択対象のアイテムの配列（例: `['A', 'B', 'C', 'D']`）
 * @param weights 各アイテムの選択確率を示す数値の配列（例: `[60, 30]`）
 *    - `weights` を指定しない場合、すべての `items` が均等確率で選ばれる
 *    - `weights` の合計が 100% 未満の場合、残りの確率は未指定のアイテムに均等配分される
 * @returns ランダムに選ばれた `items` の要素
 *
 * @example
 * A(60%)、B(30%)、C, D(5%ずつ)
 * weightedRandom(['A', 'B', 'C', 'D'], [60, 30]);
 *
 * A(40%)、B(30%)、C(20%)、D(10%)
 * weightedRandom(['A', 'B', 'C', 'D'], [40, 30, 20, 10]);
 *
 * A, B, C, D の確率が均等 (25%ずつ)
 * weightedRandom(['A', 'B', 'C', 'D']);
 */

export function weightedRandom<T>(items: T[], weights?: number[]): T {
  const TOTAL_PERCENTAGE = 100;
  const DEFAULT_WEIGHT = 1;
  const MIN_WEIGHT = 0;

  if (!weights || weights.length === 0) {
    // weights が未指定または空なら、全アイテムを均等にする
    weights = Array(items.length).fill(DEFAULT_WEIGHT);
  }

  const totalSpecifiedWeight = weights.reduce((sum, weight) => sum + weight, MIN_WEIGHT);
  const remainingItemsCount = items.length - weights.length;

  // 残りの割合を計算（TOTAL_PERCENTAGE から既存の合計を引く）
  const remainingWeight = Math.max(TOTAL_PERCENTAGE - totalSpecifiedWeight, MIN_WEIGHT);

  // 残りのアイテムがある場合、それぞれに均等に配分
  const remainingItemWeight = remainingItemsCount > 0 ? remainingWeight / remainingItemsCount : MIN_WEIGHT;

  // 残りのアイテムに均等な重みを設定
  const adjustedWeights = [...weights, ...Array(remainingItemsCount).fill(remainingItemWeight)];
  const totalWeight = adjustedWeights.reduce((sum, weight) => sum + weight, MIN_WEIGHT);

  let random = Math.random() * totalWeight;

  // random が現在の adjustedWeights[i] 未満なら、そのアイテムを返す（選択される）。
  // そうでない場合、random から adjustedWeights[i] を引いて次の候補へ。
  for (let i = 0; i < items.length; i++) {
    if (random < adjustedWeights[i]) {
        return items[i];
    }
    random -= adjustedWeights[i];
  }

  return items[items.length - 1]; // 理論上ほぼ起こらないが、念のため最後の要素を返す
}

// A, B, C, D, E, F の確率が均等 (1/6ずつ)
console.log(weightedRandom(['A', 'B', 'C', 'D', 'E', 'F', 'G']));

// A(60%), B(30%), C, D, E, F(均等に10%)
console.log(weightedRandom(['A', 'B', 'C', 'D', 'E'], [60, 30]));

// A(50%), B(20%), C, D, E, F(均等に7.5%)
console.log(weightedRandom(['A', 'B', 'C', 'D', 'E', 'F'], [50, 20]));

// A(80%), B, C, D, E, F(均等に4%)
console.log(weightedRandom(['A', 'B', 'C', 'D', 'E', 'F', 'G'], [80]));