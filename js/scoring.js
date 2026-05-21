/**
 * 判定ロジック(重みづけ合計方式)
 *
 * ───── 仕組み ─────
 * 各質問は次の3要素を持つ:
 *   - axis: その質問が測る軸 ('EI' | 'SN' | 'TF' | 'JP')
 *   - direction: 「そう思う」と答えたときに振れる方向 (例 'E')
 *   - 回答値: ユーザーが選んだ -2〜+2 のスコア
 *
 * direction の対義の文字(E→I, S→N, T→F, J→P)は OPPOSITE で定義。
 *
 * 各回答について:
 *   value >= 0  → direction 側にスコア加算 (value 分)
 *   value <  0  → 反対側にスコア加算 (|value| 分)
 *
 * 全32問終了後、各軸で「左側(E/S/T/J)」と「右側(I/N/F/P)」の
 * 合計スコアを比較し、大きいほうを採用。同点の場合は左側を優先。
 *
 * ───── スコアレンジ ─────
 * 各軸8問 × 最大重み2点 = 各サイド最大16点
 * 例) E=14, I=2 のように 0〜16 の範囲に収まる
 *
 * ───── パーセンテージ ─────
 * 結果画面では「E 87% / I 13%」のような割合表示も計算する
 */

const OPPOSITE = {
  E: 'I', I: 'E',
  S: 'N', N: 'S',
  T: 'F', F: 'T',
  J: 'P', P: 'J',
};

const AXES = [
  { key: 'EI', left: 'E', right: 'I' },
  { key: 'SN', left: 'S', right: 'N' },
  { key: 'TF', left: 'T', right: 'F' },
  { key: 'JP', left: 'J', right: 'P' },
];

/**
 * 質問とその回答(-2〜+2)から、各文字ごとのスコアを集計
 * @param {Array} questions
 * @param {Array<number>} answers  questions と同じ長さ・順序
 * @returns {Object} { E:n, I:n, S:n, N:n, T:n, F:n, J:n, P:n }
 */
export function computeScores(questions, answers) {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  questions.forEach((q, i) => {
    const value = answers[i];
    if (typeof value !== 'number' || value === 0) return; // 0=どちらでもない は加算なし

    if (value > 0) {
      // direction 側に value 分加算
      scores[q.direction] += value;
    } else {
      // 反対側に |value| 分加算
      scores[OPPOSITE[q.direction]] += Math.abs(value);
    }
  });

  return scores;
}

/**
 * スコアから16タイプの文字列を決定
 * 同点の場合は左側(E/S/T/J)を優先
 * @param {Object} scores
 * @returns {string} 例 'INTJ'
 */
export function determineType(scores) {
  return AXES.map(({ left, right }) =>
    scores[left] >= scores[right] ? left : right
  ).join('');
}

/**
 * 結果画面用に、各軸のスコアをパーセンテージ化
 * @param {Object} scores
 * @returns {Array} [{ axis, left, right, leftScore, rightScore, leftPct, rightPct, dominant }]
 */
export function getAxisBreakdown(scores) {
  return AXES.map(({ key, left, right }) => {
    const leftScore = scores[left];
    const rightScore = scores[right];
    const total = leftScore + rightScore;

    // どちらも0(全て「どちらでもない」)の場合は50/50
    const leftPct = total === 0 ? 50 : Math.round((leftScore / total) * 100);
    const rightPct = 100 - leftPct;
    const dominant = leftScore >= rightScore ? left : right;

    return { axis: key, left, right, leftScore, rightScore, leftPct, rightPct, dominant };
  });
}
