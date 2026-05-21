import { questions } from './questions.js';
import { types } from './types.js';

// ───── 状態管理 ─────
const state = {
  current: 0,
  answers: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
};

// ───── DOM参照 ─────
const $ = (id) => document.getElementById(id);
const els = {
  intro: $('intro'),
  quiz: $('quiz'),
  result: $('result'),
  startBtn: $('start-btn'),
  restartBtn: $('restart-btn'),
  questionCard: $('question-card'),
  qLabel: $('q-label'),
  qText: $('q-text'),
  qOptions: $('q-options'),
  qCurrent: $('q-current'),
  qPercent: $('q-percent'),
  progressFill: $('progress-fill'),
  resultType: $('result-type'),
  resultNickname: $('result-nickname'),
  resultDesc: $('result-desc'),
};

// ───── ロジック ─────
function calculateType(answers) {
  // 各軸で多いほうを採用(同数の場合は左側=E/S/T/Jを優先)
  return (
    (answers.E >= answers.I ? 'E' : 'I') +
    (answers.S >= answers.N ? 'S' : 'N') +
    (answers.T >= answers.F ? 'T' : 'F') +
    (answers.J >= answers.P ? 'J' : 'P')
  );
}

function resetState() {
  state.current = 0;
  Object.keys(state.answers).forEach((k) => (state.answers[k] = 0));
}

// ───── 画面遷移 ─────
function startQuiz() {
  els.intro.classList.add('hidden');
  els.quiz.classList.remove('hidden');
  els.quiz.classList.add('fade-in');
  renderQuestion();
}

function renderQuestion() {
  const q = questions[state.current];

  // フェードアニメをリセット
  els.questionCard.classList.remove('fade-in');
  void els.questionCard.offsetWidth;
  els.questionCard.classList.add('fade-in');

  els.qLabel.textContent = `QUESTION ${String(state.current + 1).padStart(2, '0')}`;
  els.qText.textContent = q.text;
  els.qCurrent.textContent = state.current + 1;

  const pct = Math.round((state.current / questions.length) * 100);
  els.progressFill.style.width = pct + '%';
  els.qPercent.textContent = pct + '%';

  els.qOptions.innerHTML = '';

  [
    { ...q.a, marker: 'A' },
    { ...q.b, marker: 'B' },
  ].forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.innerHTML = `<span class="option-marker">${opt.marker}.</span><span>${opt.text}</span>`;
    btn.addEventListener('click', () => selectAnswer(opt.type));
    els.qOptions.appendChild(btn);
  });
}

function selectAnswer(type) {
  state.answers[type]++;
  state.current++;

  if (state.current >= questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  const typeKey = calculateType(state.answers);
  const result = types[typeKey];

  els.progressFill.style.width = '100%';
  els.qPercent.textContent = '100%';

  els.quiz.classList.add('hidden');
  els.result.classList.remove('hidden');
  els.result.classList.add('fade-in');

  els.resultType.textContent = typeKey;
  els.resultNickname.textContent = result.nickname;
  els.resultDesc.textContent = result.desc;
}

function restart() {
  resetState();
  els.result.classList.add('hidden');
  els.intro.classList.remove('hidden');
  els.intro.classList.add('fade-in');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ───── イベント登録 ─────
function init() {
  els.startBtn.addEventListener('click', startQuiz);
  els.restartBtn.addEventListener('click', restart);
}

document.addEventListener('DOMContentLoaded', init);
