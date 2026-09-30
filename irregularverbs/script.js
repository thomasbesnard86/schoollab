const questions = [
  { verb: "avoir", answers: { infinitive: ["have"], simplePast: ["had"], pastParticiple: ["had"] } },
  { verb: "rêver", answers: { infinitive: ["dream"], simplePast: ["dreamt", "dreamed"], pastParticiple: ["dreamt", "dreamed"] } },
  { verb: "lire", answers: { infinitive: ["read"], simplePast: ["read"], pastParticiple: ["read"] } },
  { verb: "aller", answers: { infinitive: ["go"], simplePast: ["went"], pastParticiple: ["gone"] } },
  { verb: "manger", answers: { infinitive: ["eat"], simplePast: ["ate"], pastParticiple: ["eaten"] } },
  { verb: "perdre", answers: { infinitive: ["lose"], simplePast: ["lost"], pastParticiple: ["lost"] } },
  { verb: "casser", answers: { infinitive: ["break"], simplePast: ["broke"], pastParticiple: ["broken"] } },
  { verb: "nager", answers: { infinitive: ["swim"], simplePast: ["swam"], pastParticiple: ["swum"] } },
  { verb: "voir", answers: { infinitive: ["see"], simplePast: ["saw"], pastParticiple: ["seen"] } },
  { verb: "être", answers: { infinitive: ["be"], simplePast: ["was", "were"], pastParticiple: ["been"] } },
  { verb: "tomber", answers: { infinitive: ["fall"], simplePast: ["fell"], pastParticiple: ["fallen"] } },
  { verb: "faire", answers: { infinitive: ["do"], simplePast: ["did"], pastParticiple: ["done"] } },
  { verb: "gagner", answers: { infinitive: ["win"], simplePast: ["won"], pastParticiple: ["won"] } },
  { verb: "couper", answers: { infinitive: ["cut"], simplePast: ["cut"], pastParticiple: ["cut"] } },
  { verb: "boire", answers: { infinitive: ["drink"], simplePast: ["drank"], pastParticiple: ["drunk"] } },
  { verb: "acheter", answers: { infinitive: ["buy"], simplePast: ["bought"], pastParticiple: ["bought"] } },
  { verb: "écrire", answers: { infinitive: ["write"], simplePast: ["wrote"], pastParticiple: ["written"] } },
  { verb: "chanter", answers: { infinitive: ["sing"], simplePast: ["sang"], pastParticiple: ["sung"] } },
  { verb: "parler", answers: { infinitive: ["speak"], simplePast: ["spoke"], pastParticiple: ["spoken"] } },
  { verb: "comprendre", answers: { infinitive: ["understand"], simplePast: ["understood"], pastParticiple: ["understood"] } },
  { verb: "donner", answers: { infinitive: ["give"], simplePast: ["gave"], pastParticiple: ["given"] } },
  { verb: "dire", answers: { infinitive: ["say"], simplePast: ["said"], pastParticiple: ["said"] } },
  { verb: "prendre", answers: { infinitive: ["take"], simplePast: ["took"], pastParticiple: ["taken"] } },
  { verb: "rencontrer", answers: { infinitive: ["meet"], simplePast: ["met"], pastParticiple: ["met"] } },
  { verb: "réveiller", answers: { infinitive: ["wake up"], simplePast: ["woke up"], pastParticiple: ["woken up"] } },
];

const questionEl = document.getElementById("question");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submit-btn");
const nextBtn = document.getElementById("next-btn");
const feedbackEl = document.getElementById("feedback");
const form = document.getElementById("quiz-form");
const infinitiveInput = document.getElementById("infinitive");
const simplePastInput = document.getElementById("simple-past");
const pastParticipleInput = document.getElementById("past-participle");

const speakVerbBtn = document.getElementById("speak-verb");
const speakInfinitiveBtn = document.getElementById("speak-infinitive");
const speakSimplePastBtn = document.getElementById("speak-simple-past");
const speakPastParticipleBtn = document.getElementById("speak-past-participle");
const historyCard = document.getElementById("history-card");
const historySummary = document.getElementById("history-summary");
const retryErrorsBtn = document.getElementById("retry-errors-btn");
const timerEl = document.getElementById("timer");

let shuffledQuestions = [];
let currentQuizQuestions = [];
let currentQuizType = "full";
let failedQuestions = [];
let history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
let currentIndex = 0;
let score = 0;
let totalAnswers = questions.length * 3;
let quizStarted = false;
let questionAnswered = false;
let answerValidated = false;
let currentAnswers = {};
let timerInterval = null;
let elapsedSeconds = 0;

function shuffle(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function normalize(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function updateTimer() {
  elapsedSeconds += 1;
  timerEl.textContent = `Durée : ${formatTime(elapsedSeconds)}`;
}

function startTimer() {
  clearInterval(timerInterval);
  elapsedSeconds = 0;
  timerEl.textContent = `Durée : ${formatTime(elapsedSeconds)}`;
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function speak(text, language = "fr") {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "en" ? "en-US" : "fr-FR";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

function startQuiz(questionsSet = [...questions], type = "full") {
  currentQuizQuestions = [...questionsSet];
  shuffledQuestions = shuffle([...questionsSet]);
  currentQuizType = type;
  currentIndex = 0;
  score = 0;
  failedQuestions = [];
  quizStarted = true;
  answerValidated = false;
  form.hidden = false;
  submitBtn.textContent = "Valider";
  nextBtn.hidden = true;
  totalAnswers = currentQuizQuestions.length * 3;
  enableInputs(true);
  statusEl.textContent = `Score : ${score} / ${totalAnswers}`;
  timerEl.textContent = `Durée : 00:00`;
  feedbackEl.innerHTML = "";
  startTimer();
  renderQuestion();
}

function renderQuestion() {
  const current = shuffledQuestions[currentIndex];
  questionEl.textContent = current.verb;
  currentAnswers = current.answers;
  form.reset();
  clearFieldStates();
  feedbackEl.innerHTML = "";
  answerValidated = false;
  enableInputs(true);
  speakVerbBtn.disabled = false;
  speakInfinitiveBtn.disabled = false;
  speakSimplePastBtn.disabled = false;
  speakPastParticipleBtn.disabled = false;
  infinitiveInput.focus();
}

function enableInputs(enabled) {
  [infinitiveInput, simplePastInput, pastParticipleInput].forEach((input) => {
    input.disabled = !enabled;
  });
}

function checkField(value, accepted) {
  const normalized = normalize(value);
  return accepted.some((answer) => normalize(answer) === normalized);
}

function answerLabel(key) {
  if (key === "infinitive") return "Infinitif";
  if (key === "simplePast") return "Simple past";
  return "Past participle";
}

function buildAcceptList(accepted) {
  return accepted.map((text) => `« ${text} »`).join(" ou ");
}

function clearFieldStates() {
  [infinitiveInput, simplePastInput, pastParticipleInput].forEach((input) => {
    input.classList.remove("correct", "wrong");
  });
}

function checkAnswer() {
  if (!quizStarted) {
    startQuiz();
    return;
  }

  const infinitiveValue = infinitiveInput.value;
  const simplePastValue = simplePastInput.value;
  const pastParticipleValue = pastParticipleInput.value;

  if (!infinitiveValue.trim() || !simplePastValue.trim() || !pastParticipleValue.trim()) {
    statusEl.textContent = "Remplis les trois champs avant de valider.";
    return;
  }

  const results = {
    infinitive: checkField(infinitiveValue, currentAnswers.infinitive),
    simplePast: checkField(simplePastValue, currentAnswers.simplePast),
    pastParticiple: checkField(pastParticipleValue, currentAnswers.pastParticiple),
  };

  clearFieldStates();
  enableInputs(false);
  speakVerbBtn.disabled = true;
  speakInfinitiveBtn.disabled = true;
  speakSimplePastBtn.disabled = true;
  speakPastParticipleBtn.disabled = true;

  let correctCount = 0;
  const feedbackLines = [];

  Object.entries(results).forEach(([key, isCorrect]) => {
    const input =
      key === "infinitive" ? infinitiveInput : key === "simplePast" ? simplePastInput : pastParticipleInput;
    if (isCorrect) {
      correctCount += 1;
      input.classList.add("correct");
      feedbackLines.push(`${answerLabel(key)} : correct`);
    } else {
      input.classList.add("wrong");
      feedbackLines.push(
        `${answerLabel(key)} : incorrect — réponses possibles ${buildAcceptList(currentAnswers[key])}`
      );
    }
  });

  const hadError = correctCount < 3;
  if (hadError) {
    const current = shuffledQuestions[currentIndex];
    if (!failedQuestions.some((item) => item.verb === current.verb)) {
      failedQuestions.push({ verb: current.verb, answers: current.answers });
    }
  }

  score += correctCount;
  answerValidated = true;
  feedbackEl.innerHTML = feedbackLines.map((line) => `<p>${line}</p>`).join("");
  statusEl.innerHTML = `Réponse : ${correctCount} / 3 | Score : ${score} / ${totalAnswers}` +
    `<br>Cliquez encore sur <strong>${currentIndex === currentQuizQuestions.length - 1 ? "Terminer" : "Suivant"}</strong> pour passer à la question suivante.`;
  submitBtn.textContent = currentIndex === currentQuizQuestions.length - 1 ? "Terminer" : "Suivant";
  nextBtn.hidden = true;
  submitBtn.focus();
}

function nextQuestion() {
  if (!quizStarted) {
    startQuiz();
    return;
  }

  currentIndex += 1;

  if (currentIndex >= currentQuizQuestions.length) {
    showResult();
    return;
  }

  renderQuestion();
  statusEl.textContent = `Score : ${score} / ${totalAnswers}`;
  submitBtn.textContent = "Valider";
  nextBtn.hidden = true;
}

function showResult() {
  stopTimer();
  form.hidden = true;
  nextBtn.hidden = true;
  questionEl.textContent = "Quiz terminé !";
  feedbackEl.innerHTML = `<p>Ton score final est <strong>${score} / ${totalAnswers}</strong>.</p>`;
  statusEl.textContent =
    score === totalAnswers
      ? "Bravo ! Tu as tout juste."
      : score >= totalAnswers * 0.75
      ? "Très bien, continue comme ça !"
      : "Reprends le quiz pour t'améliorer.";
  submitBtn.textContent = "Rejouer";
  quizStarted = false;
  questionAnswered = false;

  const errors = [...new Set(failedQuestions.map((item) => item.verb))];
  const record = {
    date: new Date().toISOString(),
    type: currentQuizType,
    score,
    total: totalAnswers,
    duration: elapsedSeconds,
    errors,
  };
  saveHistory(record);
  renderHistory();
}

function saveHistory(record) {
  history.unshift(record);
  if (history.length > 30) {
    history.pop();
  }
  localStorage.setItem("quizHistory", JSON.stringify(history));
}

function renderHistory() {
  if (!history.length) {
    historyCard.hidden = true;
    return;
  }

  historyCard.hidden = false;
  const last = history[0];
  const errorCount = last.errors.length;
  const typeLabel = last.type === "errors" ? "Reprise erreurs" : "Quiz complet";
  const date = new Date(last.date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  const duration = last.duration !== undefined ? formatTime(last.duration) : "00:00";
  const verbs = errorCount ? last.errors.join(", ") : "Aucun";
  historySummary.innerHTML = `Dernière partie (${typeLabel}) : ${last.score} / ${last.total} — durée : ${duration} — erreurs : ${errorCount} verbes.<br>Liste : ${verbs}`;
  retryErrorsBtn.hidden = errorCount === 0;
}

function findQuestionsByVerbs(verbs) {
  return verbs.map((verb) => questions.find((item) => item.verb === verb)).filter(Boolean);
}

retryErrorsBtn.addEventListener("click", () => {
  if (!history.length || !history[0].errors.length) {
    return;
  }
  const errors = history[0].errors;
  const errorQuestions = findQuestionsByVerbs(errors);
  if (!errorQuestions.length) {
    statusEl.textContent = "Aucun verbe à relancer.";
    return;
  }
  statusEl.textContent = `Relance des ${errorQuestions.length} verbes en erreur.`;
  startQuiz(errorQuestions, "errors");
});

submitBtn.addEventListener("click", () => {
  if (!quizStarted) {
    startQuiz();
  } else if (!answerValidated) {
    checkAnswer();
  } else {
    nextQuestion();
  }
});

nextBtn.addEventListener("click", nextQuestion);

// Empêcher l'envoi natif du formulaire et gérer la touche Entrée
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!quizStarted) return;
  if (!answerValidated) {
    checkAnswer();
  } else {
    nextQuestion();
  }
});

form.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (!quizStarted) return;
  if (e.target === infinitiveInput || e.target === simplePastInput || e.target === pastParticipleInput) {
    return;
  }
  e.preventDefault();
  if (!answerValidated) {
    checkAnswer();
  } else {
    nextQuestion();
  }
});

speakVerbBtn.addEventListener("click", () => {
  speak(questionEl.textContent, "fr");
});

speakInfinitiveBtn.addEventListener("click", () => {
  if (currentAnswers.infinitive) {
    speak(currentAnswers.infinitive[0], "en");
  }
});

speakSimplePastBtn.addEventListener("click", () => {
  if (currentAnswers.simplePast) {
    speak(currentAnswers.simplePast[0], "en");
  }
});

speakPastParticipleBtn.addEventListener("click", () => {
  if (currentAnswers.pastParticiple) {
    speak(currentAnswers.pastParticiple[0], "en");
  }
});

infinitiveInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    simplePastInput.focus();
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    simplePastInput.focus();
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    simplePastInput.focus();
  }
});

simplePastInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    pastParticipleInput.focus();
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    pastParticipleInput.focus();
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    infinitiveInput.focus();
  }
});

pastParticipleInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!quizStarted) return;
    if (!answerValidated) {
      checkAnswer();
    } else {
      nextQuestion();
    }
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!quizStarted) return;
    if (!answerValidated) {
      checkAnswer();
    } else {
      nextQuestion();
    }
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    simplePastInput.focus();
  }
});

renderHistory();
