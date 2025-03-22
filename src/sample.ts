// 問題：教室予約システム
// あなたは大学の教室予約システムを作成することになりました。各教室には予約可能な時間帯が設定されており、予約要求が来た際に、該当する教室を予約し、教室の空き時間を更新する必要があります。

// 入力形式
// 入力は複数行からなる文字列として与えられ、以下の形式となっています。

// 1行目
// n m

// n: 教室の数

// m: 予約要求の件数

// 2行目～(n+1)行目
// 各行は以下の形式で教室の情報を表します。
// roomNo capacity start end

// roomNo: 教室番号

// capacity: 定員（予約可能な最大人数）

// start: 予約可能な開始時刻

// end: 予約可能な終了時刻

// ※ 各教室は最初、予約可能な空き時間帯として [start, end] 1つの区間を持つものとします。

// (n+2)行目～(n+m+1)行目
// 各行は予約要求を表し、次の形式となっています。
// students reqStart reqEnd

// students: 予約を希望する人数

// reqStart: 予約開始時刻

// reqEnd: 予約終了時刻

// 予約処理のルール
// 各予約要求に対して、以下の条件を満たす教室を探します。

// 定員条件
// 教室の定員が予約要求の人数以上であること。

// 時間条件
// 教室の空き時間帯の中に、予約要求の時間区間 [reqStart, reqEnd] が完全に含まれていること。

// 候補が複数ある場合の選び方

// 候補となる教室が複数ある場合、予約要求が収まる空き区間の長さが最も短い教室を優先する。

// 同じ長さの場合は、教室番号が小さいものを選ぶ。

// 予約確定後の空き時間更新
// 予約が確定した教室では、もともとの空き区間から予約時間 [reqStart, reqEnd] を取り除きます。

// もし予約開始前に余裕がある場合は、[元の開始時刻, reqStart] を新たな空き区間として追加。

// もし予約終了後に余裕がある場合は、[reqEnd, 元の終了時刻] を新たな空き区間として追加。

// 出力形式
// 各予約要求に対して、以下のように出力します。

// 該当する教室が見つかり予約が確定した場合は、その教室番号を出力。

// 予約可能な教室が見つからない場合は -1 を出力。

// 出力は各予約要求ごとに1行で表し、リクエストの順番通りに出力してください。

// 入力例
// コピーする
// 2 3
// 101 15 1 6
// 102 20 4 7
// 10 1 3
// 30 5 7
// 15 4 6
// 出力例
// diff
// コピーする
// 101
// -1
// 101
// 説明
// 最初の予約要求 (10人, 1～3)

// 教室 101 は [1,6] の空き時間内に収まり、候補となる。

// 教室 102 は予約可能開始時刻が 4 なので候補外。
// → 教室 101 で予約が確定し、空き時間は [3,6] に更新される。

// 2番目の予約要求 (30人, 5～7)

// 教室 101（定員15）および教室 102（定員20）は定員不足のため、予約不可。
// → 出力は -1。

// 3番目の予約要求 (15人, 4～6)

// 教室 101 は更新後の空き区間 [3,6] で予約可能。

// 教室 102 は [4,7] の空き区間内に収まるが、候補の空き区間の長さや教室番号のルールにより教室 101 が選ばれる。
// → 教室 101 で予約が確定し、空き時間は [3,4] に更新される。


// 空いている時間帯を表す型
type FreeInterval = { start: number; end: number };

// 教室を表す型
type Room = {
  roomNo: number;          // 教室番号
  capacity: number;        // 定員
  // 予約可能な空き時間帯のリスト。最初は1つの区間のみ持つ
  freeIntervals: FreeInterval[];
};

// rentClassroom 関数は、内部で入力を定義し、予約処理を実施して結果を出力する
function rentClassroom(): void {
  // 入力例をベタ書きする（1行目は「教室の数 n」と「リクエストの数 m」）
  const input = `2 3
101 15 1 6
102 20 4 7
10 1 3
30 5 7
15 4 6`;

  // 入力全体を改行で分割し、各行ごとの配列にする
  const lines = input.trim().split('\n');

  // 1行目から教室の数 (n) とリクエストの数 (m) を取得
  const [n, m] = lines[0].split(' ').map(Number);

  // 教室情報を格納する配列を作成する
  const rooms: Room[] = [];
  // 2行目から n+1 行目までが教室情報
  // 各行は「教室番号 roomNo 定員 capacity 予約可能開始時刻 start 予約可能終了時刻 end」
  for (let i = 1; i <= n; i++) {
    const [roomNo, capacity, start, end] = lines[i].split(' ').map(Number);
    rooms.push({
      roomNo,
      capacity,
      freeIntervals: [{ start, end }],
    });
  }

  // リクエスト情報を格納する配列を作成する
  const requests = [];
  // 教室情報の後、n+1 行目から m 件のリクエストが続く
  // 各リクエストは「予約する人数 students 予約開始時刻 reqStart 予約終了時刻 reqEnd」
  for (let i = n + 1; i < n + 1 + m; i++) {
    const [students, reqStart, reqEnd] = lines[i].split(' ').map(Number);
    requests.push({ students, reqStart, reqEnd });
  }

  // 結果を格納する配列。各リクエストに対して、予約成功なら教室番号、失敗なら -1 を保存する
  const result: number[] = [];

  // 各リクエストごとに予約可能な教室を探す
  for (const request of requests) {
    // 候補となる教室情報を一時的に保持するための型 Candidate を定義する
    // Candidate には、対象の教室、対象の空き区間、その空き区間の長さを持たせる
    type Candidate = { room: Room; interval: FreeInterval; intervalLength: number };
    const candidates: Candidate[] = [];

    // すべての教室を順番に確認する
    for (const room of rooms) {
      // まず、教室の定員がリクエストの人数に足りているかチェック
      if (room.capacity < request.students) continue; // 定員不足なら次の教室へ

      // 教室が持つ各空き区間について確認する
      for (const interval of room.freeIntervals) {
        // リクエストの開始時刻と終了時刻が、この空き区間内に収まるかチェック
        if (interval.start <= request.reqStart && interval.end >= request.reqEnd) {
          // 収まる場合は、候補として追加する
          candidates.push({
            room,
            interval,
            intervalLength: interval.end - interval.start, // 空き区間の長さを計算
          });
          // この教室については、1つの適合する区間があれば十分なのでループを抜ける
          break;
        }
      }
    }

    // 複数候補がある場合、以下の基準でソートする:
    // 1. 空き区間の長さが短いものを優先（余裕が少ないほうが、後の予約に利用しやすい）
    // 2. 同じ長さなら、教室番号が小さいものを優先する
    candidates.sort((a, b) => {
      if (a.intervalLength !== b.intervalLength)
        return a.intervalLength - b.intervalLength;
      return a.room.roomNo - b.room.roomNo;
    });

    // 候補が見つかった場合は予約処理を実施する
    if (candidates.length > 0) {
      const chosen = candidates[0];
      const { room, interval } = chosen;
      // 選ばれた空き区間から予約区間 [reqStart, reqEnd] を取り除くため、
      // まずその空き区間を教室の freeIntervals から削除する
      room.freeIntervals = room.freeIntervals.filter(iv => iv !== interval);
      // 予約開始前に余裕がある場合、その部分を新たな空き区間として追加する
      if (interval.start < request.reqStart) {
        room.freeIntervals.push({ start: interval.start, end: request.reqStart });
      }
      // 予約終了後に余裕がある場合、その部分も新たな空き区間として追加する
      if (request.reqEnd < interval.end) {
        room.freeIntervals.push({ start: request.reqEnd, end: interval.end });
      }
      // 予約成功の場合は、結果に教室番号を追加する
      result.push(room.roomNo);
    } else {
      // どの教室でも予約できなかった場合は、結果に -1 を追加する
      result.push(-1);
    }
  }

  // 結果の配列を改行区切りの文字列に変換し、コンソールに出力する
  console.log(result.join('\n'));
}

// 関数を実行する
rentClassroom();

const input = `2 4
101 12 1 6
102 20 4 7
10 1 3
12 4 6
20 5 6
21 4 6`;

// これが例題
// const input = `2 3
// 101 15 1 6
// 102 20 4 7
// 10 1 3
// 30 5 7
// 15 4 6`;