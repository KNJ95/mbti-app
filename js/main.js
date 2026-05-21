import { questions } from './questions.js';
import { types } from './types.js';
import { computeScores, determineType, getAxisBreakdown } from './scoring.js';

// ───── 状態管理 ─────
const state = {
  current: 0,
  // 各質問の回答を -2〜+2 で保存(未回答は null)
  answers: new Array(questions.length).fill(null),
};

// ───── DOM参照 ─────
const $ = (id) => document.getElementById(id);
const els = {
  intro: $('intro'),
  quiz: $('quiz'),
  result: $('result'),
  startBtn: $('start-btn'),
  restartBtn: $('restart-btn'),
  prevBtn: $('prev-btn'),
  questionCard: $('question-card'),
  qLabel: $('q-label'),
  qText: $('q-text'),
  qLikert: $('q-likert'),
  qCurrent: $('q-current'),
  qPercent: $('q-percent'),
  progressFill: $('progress-fill'),
  resultType: $('result-type'),
  resultNickname: $('result-nickname'),
  resultDesc: $('result-desc'),
  scoreBreakdown: $('score-breakdown'),
};

// ───── リッカート尺度の選択肢定義 ─────
// 値が小さい(マイナス)= そう思わない / 大きい(プラス)= そう思う
const LIKERT_OPTIONS = [
  { value: -2, label: '全くそう思わない' },
  { value: -1, label: 'あまりそう思わない' },
  { value:  0, label: 'どちらでもない' },
  { value:  1, label: 'ややそう思う' },
  { value:  2, label: 'とてもそう思う' },
];

// ───── 画面遷移 ─────
function startQuiz() {
  els.intro.classList.add('hidden');
  els.quiz.classList.remove('hidden');
  els.quiz.classList.add('fade-in');
  renderQuestion();
}

function renderQuestion() {
  const q = questions[state.current];
  const savedAnswer = state.answers[state.current];

  // フェードアニメをリセット
  els.questionCard.classList.remove('fade-in');
  void els.questionCard.offsetWidth;
  els.questionCard.classList.add('fade-in');

  els.qLabel.textContent = `QUESTION ${String(state.current + 1).padStart(2, '0')}`;
  els.qText.textContent = q.text;
  els.qCurrent.textContent = state.current + 1;

  // プログレス計算(現在の質問番号ベース)
  const pct = Math.round((state.current / questions.length) * 100);
  els.progressFill.style.width = pct + '%';
  els.qPercent.textContent = pct + '%';

  // リッカートボタンを描画
  els.qLikert.innerHTML = '';
  LIKERT_OPTIONS.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'likert-btn';
    btn.dataset.value = opt.value;
    btn.setAttribute('aria-label', opt.label);
    btn.title = opt.label;
    if (savedAnswer === opt.value) btn.classList.add('selected');
    btn.addEventListener('click', () => selectAnswer(opt.value));
    els.qLikert.appendChild(btn);
  });

  // 戻るボタンの活性化
  els.prevBtn.disabled = state.current === 0;
}

function selectAnswer(value) {
  state.answers[state.current] = value;

  // 視覚フィードバック(選択を強調)後に少し遅延して次へ
  const buttons = els.qLikert.querySelectorAll('.likert-btn');
  buttons.forEach((b) => {
    b.classList.toggle('selected', Number(b.dataset.value) === value);
  });

  setTimeout(() => {
    state.current++;
    if (state.current >= questions.length) {
      showResult();
    } else {
      renderQuestion();
    }
  }, 200);
}

function goPrev() {
  if (state.current === 0) return;
  state.current--;
  renderQuestion();
}

function showResult() {
  // 判定ロジック呼び出し
  const scores = computeScores(questions, state.answers);
  const typeKey = determineType(scores);
  const breakdown = getAxisBreakdown(scores);
  const result = types[typeKey];

  // プログレス完了
  els.progressFill.style.width = '100%';
  els.qPercent.textContent = '100%';

  // 画面切り替え
  els.quiz.classList.add('hidden');
  els.result.classList.remove('hidden');
  els.result.classList.add('fade-in');

  // 結果表示
  els.resultType.textContent = typeKey;
  els.resultNickname.textContent = result.nickname;
  els.resultDesc.textContent = result.desc;

  // スコア内訳の描画
  renderBreakdown(breakdown);
}

function renderBreakdown(breakdown) {
  els.scoreBreakdown.innerHTML = '';
  breakdown.forEach(({ left, right, leftPct, rightPct, dominant }) => {
    const row = document.createElement('div');
    row.className = 'score-row';

    const isLeftDominant = dominant === left;

    row.innerHTML = `
      <span class="score-label ${isLeftDominant ? 'active' : ''}">${left}</span>
      <span class="score-pct ${isLeftDominant ? 'active' : ''}">${leftPct}%</span>
      <div class="score-bar">
        <div class="score-bar-fill" style="width: ${isLeftDominant ? leftPct : rightPct}%; ${isLeftDominant ? 'left: 0' : 'right: 0'};"></div>
      </div>
      <span class="score-pct ${!isLeftDominant ? 'active' : ''}">${rightPct}%</span>
      <span class="score-label ${!isLeftDominant ? 'active' : ''}">${right}</span>
    `;

    els.scoreBreakdown.appendChild(row);
  });
}

function restart() {
  state.current = 0;
  state.answers = new Array(questions.length).fill(null);
  els.result.classList.add('hidden');
  els.intro.classList.remove('hidden');
  els.intro.classList.add('fade-in');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ───── イベント登録 ─────
function init() {
  els.startBtn.addEventListener('click', startQuiz);
  els.restartBtn.addEventListener('click', restart);
  els.prevBtn.addEventListener('click', goPrev);
}

document.addEventListener('DOMContentLoaded', init);
