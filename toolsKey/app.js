const HISTORY_KEY = "toolsKey.sessions.v1";
const HISTORY_LIMIT = 50;

const $ = (selector) => document.querySelector(selector);

const elements = {
  setupScreen: $("#setup-screen"),
  vocabularyScreen: $("#vocabulary-screen"),
  historyScreen: $("#history-screen"),
  studyScreen: $("#study-screen"),
  setupForm: $("#setup-form"),
  pageList: $("#page-list"),
  pageSelectionNote: $("#page-selection-note"),
  togglePages: $("#toggle-pages"),
  vocabularyList: $("#vocabulary-list"),
  printVocabulary: $("#print-vocabulary"),
  wordCount: $("#word-count"),
  allWords: $("#all-words"),
  availableCount: $("#available-count"),
  totalWords: $("#total-words"),
  sessionSummary: $("#session-summary"),
  setupError: $("#setup-error"),
  startButton: $("#start-button"),
  loadError: $("#load-error"),
  navStudy: $("#nav-study"),
  navList: $("#nav-list"),
  navHistory: $("#nav-history"),
  directorySearch: $("#directory-search"),
  directoryPage: $("#directory-page"),
  directorySummary: $("#directory-summary"),
  directoryTitle: $("#directory-print-title"),
  directoryList: $("#vocabulary-directory"),
  directoryEmpty: $("#directory-empty"),
  printDirectory: $("#print-directory"),
  historyCount: $("#history-count"),
  historySummary: $("#history-summary"),
  historyList: $("#history-list"),
  clearHistory: $("#clear-history"),
  studyStage: $("#study-stage"),
  progressText: $("#progress-text"),
  progressPercent: $("#progress-percent"),
  progressValue: $("#progress-value"),
  modeTag: $("#mode-tag"),
  promptLanguage: $("#prompt-language"),
  promptPage: $("#prompt-page"),
  promptType: $("#prompt-type"),
  promptWord: $("#prompt-word"),
  answerForm: $("#answer-form"),
  answerInput: $("#answer-input"),
  answerFeedback: $("#answer-feedback"),
  answerReveal: $("#answer-reveal"),
  answerLanguage: $("#answer-language"),
  answerType: $("#answer-type"),
  answerWord: $("#answer-word"),
  exampleContext: $("#example-context"),
  exampleText: $("#example-text"),
  revealAnswer: $("#reveal-answer"),
  ratingSection: $("#rating-section"),
  ratingPrompt: $("#rating-prompt"),
  completionPanel: $("#completion-panel"),
  completionTitle: $("#completion-title"),
  completionSummary: $("#completion-summary"),
  completionErrors: $("#completion-errors"),
  completionErrorList: $("#completion-error-list"),
};

const state = {
  pages: [],
  history: readHistory(),
  session: null,
  completedRecord: null,
};

function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  state.history = state.history.slice(0, HISTORY_LIMIT);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
  } catch {
    elements.historySummary.textContent = "Le navigateur n’a pas pu enregistrer l’historique.";
  }
  renderHistory();
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function makePool(pageIds = null) {
  return state.pages
    .filter((page) => !pageIds || pageIds.includes(page.id))
    .flatMap((page) => page.words.map((word) => ({
      ...word,
      key: `${page.id}:${word.id}`,
      pageId: page.id,
      pageTitle: page.title,
    })));
}

function selectedPageIds() {
  return [...elements.pageList.querySelectorAll('input[name="page"]:checked')]
    .map((input) => input.value);
}

function renderPageChoices() {
  elements.pageList.replaceChildren();

  state.pages.forEach((page) => {
    const label = document.createElement("label");
    label.className = "page-choice";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "page";
    checkbox.value = page.id;
    checkbox.checked = false;
    checkbox.addEventListener("change", updateSetupSummary);

    const copy = document.createElement("span");
    copy.className = "page-choice-copy";
    const title = document.createElement("strong");
    title.textContent = page.title.replace(/^page\s*/i, "");
    const count = document.createElement("small");
    count.textContent = `${page.words.length} mots`;
    copy.append(title, count);
    label.append(checkbox, copy);
    elements.pageList.append(label);
  });

  updateSetupSummary();
}

function renderVocabularyList() {
  elements.vocabularyList.replaceChildren();
  state.pages.forEach((page) => {
    page.words.forEach((word) => {
      elements.vocabularyList.append(createVocabularyEntry(word, "vocabulary-entry"));
    });
  });
}

function createVocabularyEntry(word, className, includeExample = false) {
  const item = document.createElement("li");
  item.className = className;

  const english = document.createElement("strong");
  english.className = "vocabulary-english";
  english.textContent = word.anglais;

  const french = document.createElement("span");
  french.className = "vocabulary-french";
  french.textContent = word.francais;

  item.append(english, french);
  if (word.type) {
    const type = document.createElement("small");
    type.className = "vocabulary-type";
    type.textContent = word.type;
    item.append(type);
  }
  if (includeExample && word.exemple) {
    const example = document.createElement("span");
    example.className = "vocabulary-example";
    example.textContent = `Exemple : ${word.exemple}`;
    item.append(example);
  }
  return item;
}

function renderVocabularyDirectory() {
  elements.directoryList.replaceChildren();
  elements.directoryPage.replaceChildren(new Option("Toutes les pages", "all"));

  state.pages.forEach((page) => {
    const option = new Option(`${page.title} · ${page.words.length} mots`, page.id);
    elements.directoryPage.add(option);
    page.words.forEach((word) => {
      const item = createVocabularyEntry(word, "vocabulary-entry directory-entry", true);
      item.dataset.page = page.id;
      item.dataset.search = normalizeAnswer([
        word.anglais,
        word.francais,
        word.type,
        word.exemple,
      ].filter(Boolean).join(" "));
      elements.directoryList.append(item);
    });
  });

  updateVocabularyDirectory();
}

function updateVocabularyDirectory() {
  const pageId = elements.directoryPage.value;
  const query = normalizeAnswer(elements.directorySearch.value);
  const visibleWords = [...elements.directoryList.children].filter((item) => {
    const visible = (pageId === "all" || item.dataset.page === pageId)
      && (!query || item.dataset.search.includes(query));
    item.hidden = !visible;
    return visible;
  });
  const selectedPage = state.pages.find((page) => page.id === pageId);
  const scope = selectedPage ? selectedPage.title : "Toutes les pages";
  const searchLabel = elements.directorySearch.value.trim();
  elements.directoryTitle.textContent = searchLabel
    ? `Recherche : ${searchLabel}`
    : scope === "Toutes les pages" ? "Tout le vocabulaire" : scope;
  elements.directorySummary.textContent = `${visibleWords.length} mot${visibleWords.length === 1 ? "" : "s"} · ${scope}`;
  elements.directoryEmpty.hidden = visibleWords.length > 0;
  elements.printDirectory.disabled = visibleWords.length === 0;
  elements.printDirectory.innerHTML = `<span aria-hidden="true">▤</span> ${query ? "Imprimer les résultats" : selectedPage ? "Imprimer la page" : "Imprimer la liste"}`;
}

function currentDirection() {
  return $("input[name='direction']:checked").value;
}

function currentMode() {
  return $("input[name='mode']:checked").value;
}

function updateSetupSummary() {
  const pageIds = selectedPageIds();
  const available = makePool(pageIds).length;
  const selectedCount = pageIds.length;
  const allPagesSelected = selectedCount === state.pages.length && state.pages.length > 0;
  elements.totalWords.textContent = String(makePool().length);
  elements.availableCount.textContent = `${available} mot${available === 1 ? "" : "s"} disponible${available === 1 ? "" : "s"}`;
  elements.pageSelectionNote.textContent = selectedCount === 0
    ? "Aucune page sélectionnée."
    : `${selectedCount} page${selectedCount === 1 ? "" : "s"} sélectionnée${selectedCount === 1 ? "" : "s"} · ${available} mot${available === 1 ? "" : "s"}`;
  elements.togglePages.textContent = allPagesSelected ? "Tout désélectionner" : "Tout sélectionner";
  elements.wordCount.max = String(Math.max(1, available));
  elements.wordCount.disabled = elements.allWords.checked || available === 0;

  if (available > 0 && Number(elements.wordCount.value) > available) {
    elements.wordCount.value = String(available);
  }

  const direction = currentDirection() === "en-fr" ? "Anglais vers français" : "Français vers anglais";
  const mode = currentMode() === "oral" ? "Oral" : "Écrit";
  const quantity = elements.allWords.checked ? "Tous les mots" : `${elements.wordCount.value || 0} mots`;
  elements.sessionSummary.textContent = `${quantity} · ${direction} · ${mode}`;
  elements.startButton.disabled = available === 0 || state.pages.length === 0;
}

function showView(view) {
  elements.setupScreen.hidden = view !== "setup";
  elements.vocabularyScreen.hidden = view !== "list";
  elements.historyScreen.hidden = view !== "history";
  elements.studyScreen.hidden = view !== "study";
  elements.navStudy.classList.toggle("is-active", view === "setup");
  if (view === "setup") elements.navStudy.setAttribute("aria-current", "page");
  else elements.navStudy.removeAttribute("aria-current");
  elements.navList.classList.toggle("is-active", view === "list");
  if (view === "list") elements.navList.setAttribute("aria-current", "page");
  else elements.navList.removeAttribute("aria-current");
  elements.navHistory.classList.toggle("is-active", view === "history");
  if (view === "history") elements.navHistory.setAttribute("aria-current", "page");
  else elements.navHistory.removeAttribute("aria-current");
}

function normalizeAnswer(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function acceptedAnswers(value) {
  return value
    .split(/[,;/]/)
    .map((answer) => answer.replace(/\s*\([^)]*\)\s*$/, "").trim())
    .filter(Boolean)
    .map(normalizeAnswer);
}

function getPrompt(card, direction) {
  return direction === "en-fr"
    ? { prompt: card.anglais, answer: card.francais, promptLanguage: "Anglais", answerLanguage: "Français" }
    : { prompt: card.francais, answer: card.anglais, promptLanguage: "Français", answerLanguage: "Anglais" };
}

function setAnswer(card, direction) {
  const values = getPrompt(card, direction);
  elements.answerLanguage.textContent = values.answerLanguage;
  elements.answerWord.textContent = values.answer;
  elements.answerType.textContent = card.type || "";
  elements.answerType.hidden = direction !== "fr-en" || !card.type;
  const example = card.exemple?.trim() || "";
  elements.exampleText.textContent = example;
  elements.exampleContext.hidden = !example;
  elements.answerReveal.hidden = false;
}

function renderCurrentCard() {
  const session = state.session;
  if (!session) return;

  if (session.queue.length === 0) {
    completeSession();
    return;
  }

  const current = session.queue[0];
  const values = getPrompt(current.card, session.direction);
  const total = session.answered + session.queue.length;
  const progress = Math.round((session.answered / total) * 100);

  elements.progressText.textContent = `Carte ${session.answered + 1} sur ${total}`;
  elements.progressPercent.textContent = `${progress}%`;
  elements.progressValue.style.width = `${progress}%`;
  elements.modeTag.textContent = session.mode === "oral" ? "Oral" : "Écrit";
  elements.promptLanguage.textContent = values.promptLanguage;
  elements.promptPage.textContent = current.card.pageTitle;
  elements.promptType.textContent = current.card.type || "";
  elements.promptType.hidden = values.promptLanguage !== "Anglais" || !current.card.type;
  elements.promptWord.textContent = values.prompt;
  elements.answerFeedback.hidden = true;
  elements.answerFeedback.textContent = "";
  elements.answerFeedback.className = "answer-feedback";
  elements.answerReveal.hidden = true;
  elements.ratingSection.hidden = true;
  elements.revealAnswer.hidden = session.mode !== "oral";
  elements.answerForm.hidden = session.mode !== "written";
  elements.answerInput.value = "";
  elements.answerInput.disabled = false;
  elements.answerForm.querySelector("button").disabled = false;

  if (session.mode === "written") {
    requestAnimationFrame(() => elements.answerInput.focus());
  } else {
    requestAnimationFrame(() => elements.revealAnswer.focus());
  }
}

function addError(session, card, reason, given = "") {
  const existing = session.errors.get(card.key);
  if (existing) {
    if (given) existing.given = given;
    if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
    return;
  }

  session.errors.set(card.key, {
    id: card.key,
    anglais: card.anglais,
    francais: card.francais,
    type: card.type,
    given,
    reasons: [reason],
  });
}

function checkWrittenAnswer(event) {
  event.preventDefault();
  const session = state.session;
  const current = session.queue[0];
  const given = elements.answerInput.value.trim();
  if (!given) {
    elements.answerFeedback.textContent = "Écris une réponse avant de vérifier.";
    elements.answerFeedback.classList.add("is-incorrect");
    elements.answerFeedback.hidden = false;
    elements.answerInput.focus();
    return;
  }

  const target = session.direction === "en-fr" ? current.card.francais : current.card.anglais;
  const normalized = normalizeAnswer(given);
  const isCorrect = acceptedAnswers(target).includes(normalized) || normalizeAnswer(target) === normalized;
  if (!isCorrect) {
    addError(session, current.card, "Réponse à corriger", given);
  }

  elements.answerFeedback.textContent = isCorrect ? "Bonne réponse." : "Pas tout à fait. Voici la réponse attendue.";
  elements.answerFeedback.classList.add(isCorrect ? "is-correct" : "is-incorrect");
  elements.answerFeedback.hidden = false;
  elements.answerInput.disabled = true;
  elements.answerForm.querySelector("button").disabled = true;
  setAnswer(current.card, session.direction);
  elements.ratingPrompt.textContent = isCorrect ? "Comment as-tu retenu ce mot ?" : "Comment veux-tu retravailler ce mot ?";
  elements.ratingSection.hidden = false;
}

function revealOralAnswer() {
  const session = state.session;
  const current = session.queue[0];
  setAnswer(current.card, session.direction);
  elements.revealAnswer.hidden = true;
  elements.ratingPrompt.textContent = "Comment as-tu trouvé ce mot ?";
  elements.ratingSection.hidden = false;
}

function rateCurrentCard(rating) {
  const session = state.session;
  if (!session || session.queue.length === 0) return;

  const current = session.queue.shift();
  session.answered += 1;

  if (rating === "again") {
    addError(session, current.card, "Again");
  }

  if (rating === "easy") {
    session.eased.add(current.card.key);
    session.queue = session.queue.filter((item) => item.card.key !== current.card.key);
  } else if (!session.eased.has(current.card.key)) {
    const targetRepeats = rating === "again" ? 2 : 1;
    const alreadyScheduled = session.scheduled[current.card.key] || 0;
    const newRepeats = Math.max(0, targetRepeats - alreadyScheduled);
    session.scheduled[current.card.key] = alreadyScheduled + newRepeats;

    for (let index = 0; index < newRepeats; index += 1) {
      session.queue.push({ card: current.card, round: alreadyScheduled + index + 1 });
    }
  }

  renderCurrentCard();
}

function shuffleAndStart({ replay = null } = {}) {
  const pageIds = replay ? replay.pageIds : selectedPageIds();
  let pool = makePool(pageIds);
  let selected;

  if (replay) {
    const byKey = new Map(pool.map((card) => [card.key, card]));
    selected = replay.wordIds.map((id) => byKey.get(id)).filter(Boolean);
  } else {
    const requested = elements.allWords.checked
      ? pool.length
      : Number.parseInt(elements.wordCount.value, 10);
    if (!Number.isInteger(requested) || requested < 1) {
      elements.setupError.textContent = "Indique un nombre de mots supérieur à zéro.";
      elements.setupError.hidden = false;
      return;
    }
    selected = shuffle(pool).slice(0, Math.min(requested, pool.length));
  }

  if (selected.length === 0) {
    elements.setupError.textContent = "Sélectionne au moins une page contenant des mots.";
    elements.setupError.hidden = false;
    return;
  }

  elements.setupError.hidden = true;
  const direction = replay ? replay.direction : currentDirection();
  const mode = replay ? replay.mode : currentMode();
  state.session = {
    pageIds,
    pageTitles: state.pages.filter((page) => pageIds.includes(page.id)).map((page) => page.title),
    wordCount: replay ? replay.wordCount : (elements.allWords.checked ? "all" : selected.length),
    wordIds: selected.map((card) => card.key),
    direction,
    mode,
    initialTotal: selected.length,
    answered: 0,
    queue: shuffle(selected).map((card) => ({ card, round: 0 })),
    scheduled: Object.create(null),
    eased: new Set(),
    errors: new Map(),
  };
  state.completedRecord = null;
  elements.studyStage.hidden = false;
  elements.completionPanel.hidden = true;
  showView("study");
  renderCurrentCard();
}

function recordDescription(record) {
  const direction = record.direction === "en-fr" ? "Anglais → Français" : "Français → Anglais";
  const mode = record.mode === "oral" ? "Oral" : "Écrit";
  const pages = record.pageTitles.join(", ");
  return `${record.wordTotal} mots · ${pages} · ${direction} · ${mode}`;
}

function completeSession() {
  const session = state.session;
  if (!session || session.saved) return;

  session.saved = true;
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    pageIds: [...session.pageIds],
    pageTitles: [...session.pageTitles],
    wordCount: session.wordCount,
    wordTotal: session.initialTotal,
    wordIds: [...session.wordIds],
    direction: session.direction,
    mode: session.mode,
    errors: [...session.errors.values()],
  };
  state.completedRecord = record;
  state.history.unshift(record);
  saveHistory();
  showCompletion(record);
}

function showCompletion(record) {
  elements.studyStage.hidden = true;
  elements.completionPanel.hidden = false;
  const errorCount = record.errors.length;
  elements.completionTitle.textContent = errorCount === 0 ? "Bien joué." : "Session terminée.";
  elements.completionSummary.textContent = `${record.wordTotal} mots étudiés · ${errorCount} à revoir.`;
  elements.completionErrors.hidden = errorCount === 0;
  elements.completionErrorList.replaceChildren();

  record.errors.forEach((error) => {
    const item = document.createElement("li");
    const anglais = error.anglais || error.english;
    const francais = error.francais || error.french;
    item.textContent = `${anglais} — ${francais}${error.given ? ` (ta réponse : ${error.given})` : ""}`;
    elements.completionErrorList.append(item);
  });
}

function renderHistory() {
  elements.historyList.replaceChildren();
  elements.historyCount.textContent = String(state.history.length);
  elements.clearHistory.hidden = state.history.length === 0;

  if (state.history.length === 0) {
    elements.historySummary.textContent = "Aucune session pour le moment.";
    const empty = document.createElement("p");
    empty.className = "empty-history";
    empty.textContent = "Tes sessions terminées apparaîtront ici.";
    elements.historyList.append(empty);
    return;
  }

  elements.historySummary.textContent = `${state.history.length} session${state.history.length === 1 ? "" : "s"} enregistrée${state.history.length === 1 ? "" : "s"} sur cet appareil.`;

  state.history.forEach((record) => {
    const article = document.createElement("article");
    article.className = "history-entry";
    const title = document.createElement("h2");
    title.textContent = `${record.wordTotal} mots · ${record.errors.length} à revoir`;
    const date = document.createElement("time");
    date.dateTime = record.date;
    date.textContent = new Date(record.date).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
    const meta = document.createElement("p");
    meta.className = "history-meta";
    meta.textContent = recordDescription(record);
    const replay = document.createElement("button");
    replay.className = "history-replay";
    replay.type = "button";
    replay.textContent = "Rejouer";
    replay.addEventListener("click", () => {
      applyRecordToSetup(record);
      shuffleAndStart({ replay: record });
    });

    article.append(title, date, meta, replay);
    if (record.errors.length > 0) {
      const errors = document.createElement("p");
      errors.className = "history-errors";
      errors.textContent = `À revoir : ${record.errors.map((error) => error.anglais || error.english).join(", ")}`;
      article.append(errors);
    }
    elements.historyList.append(article);
  });
}

function applyRecordToSetup(record) {
  elements.pageList.querySelectorAll('input[name="page"]').forEach((input) => {
    input.checked = record.pageIds.includes(input.value);
  });
  elements.allWords.checked = record.wordCount === "all";
  elements.wordCount.value = String(record.wordTotal);
  $(`input[name="direction"][value="${record.direction}"]`).checked = true;
  $(`input[name="mode"][value="${record.mode}"]`).checked = true;
  updateSetupSummary();
}

async function loadResources() {
  try {
    const manifestResponse = await fetch("resources/pages.json");
    if (!manifestResponse.ok) throw new Error("Le manifeste des pages est introuvable.");
    const manifest = await manifestResponse.json();
    state.pages = await Promise.all(manifest.map(async (entry) => {
      const response = await fetch(`resources/${entry.file}`);
      if (!response.ok) throw new Error(`Impossible de charger ${entry.title}.`);
      const page = await response.json();
      if (!Array.isArray(page.words)) throw new Error(`Le fichier ${entry.file} n’a pas de liste de mots.`);
      return { ...page, id: entry.id, title: entry.title };
    }));
    renderPageChoices();
    renderVocabularyList();
    renderVocabularyDirectory();
    renderHistory();
  } catch (error) {
    elements.pageList.replaceChildren();
    elements.loadError.textContent = `${error.message} Ouvre cette application via un serveur web local pour charger les fichiers JSON.`;
    elements.loadError.hidden = false;
    elements.startButton.disabled = true;
  }
}

elements.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  shuffleAndStart();
});

elements.answerForm.addEventListener("submit", checkWrittenAnswer);
elements.revealAnswer.addEventListener("click", revealOralAnswer);
elements.wordCount.addEventListener("input", updateSetupSummary);
elements.allWords.addEventListener("change", updateSetupSummary);
elements.directorySearch.addEventListener("input", updateVocabularyDirectory);
elements.directoryPage.addEventListener("change", updateVocabularyDirectory);
elements.togglePages.addEventListener("click", () => {
  const selectAll = selectedPageIds().length !== state.pages.length;
  elements.pageList.querySelectorAll('input[name="page"]').forEach((input) => {
    input.checked = selectAll;
  });
  updateSetupSummary();
});
elements.printVocabulary.addEventListener("click", () => {
  document.body.classList.add("print-vocabulary-mode");
  window.print();
});
elements.printDirectory.addEventListener("click", () => {
  document.body.classList.add("print-directory-mode");
  window.print();
});
window.addEventListener("afterprint", () => {
  document.body.classList.remove("print-vocabulary-mode", "print-directory-mode");
});
document.querySelectorAll('input[name="direction"], input[name="mode"]').forEach((input) => {
  input.addEventListener("change", updateSetupSummary);
});

document.querySelectorAll(".rating-button").forEach((button) => {
  button.addEventListener("click", () => rateCurrentCard(button.dataset.rating));
});

document.addEventListener("keydown", (event) => {
  if (elements.ratingSection.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true']")) return;

  const ratings = {
    ArrowLeft: "again",
    ArrowDown: "good",
    ArrowRight: "easy",
  };
  const rating = ratings[event.key];
  if (!rating) return;

  event.preventDefault();
  document.querySelector(`.rating-button[data-rating="${rating}"]`).click();
});

elements.navStudy.addEventListener("click", () => showView("setup"));
elements.navList.addEventListener("click", () => showView("list"));
elements.navHistory.addEventListener("click", () => showView("history"));
$("#exit-study").addEventListener("click", () => {
  const leave = window.confirm("Quitter cette session ? Elle ne sera pas ajoutée à l’historique.");
  if (leave) showView("setup");
});

elements.clearHistory.addEventListener("click", () => {
  if (!window.confirm("Effacer tout l’historique enregistré sur cet appareil ?")) return;
  state.history = [];
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    localStorage.setItem(HISTORY_KEY, "[]");
  }
  renderHistory();
});

$("#replay-completed").addEventListener("click", () => {
  if (state.completedRecord) {
    applyRecordToSetup(state.completedRecord);
    shuffleAndStart({ replay: state.completedRecord });
  }
});

$("#new-session").addEventListener("click", () => {
  state.session = null;
  showView("setup");
});

renderHistory();
loadResources();