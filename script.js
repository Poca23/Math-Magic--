// Import des configurations de niveaux
import { CP_CONFIG } from "./levels/cp.js";
import { CE1_CONFIG } from "./levels/ce1.js";
import { CE2_CONFIG } from "./levels/ce2.js";
import { CM1_CONFIG } from "./levels/cm1.js";
import { CM2_CONFIG } from "./levels/cm2.js";

// Variables globales
let currentLevel = "";
let currentQuestion = {};
let hintsUsed = 0;
let score = 0;
let totalQuestions = 0;
let deferredPrompt;

// Configuration des niveaux
const LEVELS = {
  CP: CP_CONFIG,
  CE1: CE1_CONFIG,
  CE2: CE2_CONFIG,
  CM1: CM1_CONFIG,
  CM2: CM2_CONFIG,
};

// Messages de félicitations
const SUCCESS_EMOJIS = ["🎉", "🌟", "👏", "🏆", "✨", "🎊"];
const SUCCESS_MESSAGES = [
  "Bravo champion !",
  "Excellent !",
  "Parfait !",
  "Super !",
  "Génial !",
  "Tu es incroyable !",
];

// Utilitaires
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getElement = (id) => document.getElementById(id);
const hideElement = (element) => (element.style.display = "none");
const showElement = (element, display = "block") =>
  (element.style.display = display);

// PWA - Gestion de l'installation
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

function showInstallButton() {
  const container = document.querySelector(".container");
  const installBtn = document.createElement("button");
  installBtn.className = "install-btn";
  installBtn.textContent = "📱 Installer l'app";
  installBtn.onclick = installApp;
  container.insertBefore(installBtn, container.firstChild);
}

function installApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === "accepted") {
      console.log("✅ Application installée");
    }
    deferredPrompt = null;
    document.querySelector(".install-btn")?.remove();
  });
}

// Gestion du score
function resetScore() {
  score = 0;
  totalQuestions = 0;
  updateScore();
  showFeedback("hint", "🔄 Score remis à zéro !", "");
}

function updateScore() {
  getElement("scoreText").textContent = `Score: ${score} / ${totalQuestions}`;
}

// Navigation
function startLevel(level) {
  currentLevel = level;
  score = 0;
  totalQuestions = 0;
  hideElement(getElement("levelSelector"));
  showElement(getElement("gameArea"));
  generateQuestion();
}

function backToLevels() {
  showElement(getElement("levelSelector"), "grid");
  hideElement(getElement("gameArea"));
  getElement("feedback").classList.remove("show");
  getElement("answer").value = "";
}

// Génération de questions
function generateQuestion() {
  hintsUsed = 0;
  getElement("hintsLeft").textContent = "3";
  getElement("feedback").classList.remove("show");
  getElement("answer").value = "";
  getElement("answer").focus();

  const config = LEVELS[currentLevel];
  const operation = config.operations[random(0, config.operations.length - 1)];

  currentQuestion = createQuestion(operation, config);
  displayQuestion();
}

function createQuestion(operation, config) {
  let num1, num2, answer, symbol;

  switch (operation) {
    case "addition":
      num1 = random(1, config.maxNumber);
      num2 = random(1, config.maxNumber);
      answer = num1 + num2;
      symbol = "+";
      break;

    case "subtraction":
      num1 = random(1, config.maxNumber);
      num2 = random(1, num1);
      if (config.allowNegative && Math.random() > 0.7) {
        num2 = random(num1, config.maxNumber);
      }
      answer = num1 - num2;
      symbol = "-";
      break;

    case "multiplication":
      num1 = random(2, config.multiplicationMax || 10);
      num2 = random(2, config.multiplicationMax || 10);
      answer = num1 * num2;
      symbol = "×";
      break;

    case "division":
      num2 = random(2, 10);
      answer = random(2, 15);
      num1 = num2 * answer;
      symbol = "÷";
      break;
  }

  return { num1, num2, answer, operation, symbol };
}

function displayQuestion() {
  const { num1, symbol, num2 } = currentQuestion;
  getElement("question").textContent = `${num1} ${symbol} ${num2} = ?`;
}

// Vérification de la réponse
function checkAnswer() {
  const userAnswer = parseInt(getElement("answer").value);

  if (isNaN(userAnswer)) {
    showFeedback("error", "⚠️ Entre un nombre !", "");
    return;
  }

  totalQuestions++;

  if (userAnswer === currentQuestion.answer) {
    handleCorrectAnswer();
  } else {
    handleIncorrectAnswer();
  }
}

function handleCorrectAnswer() {
  score++;
  updateScore();

  const emoji = SUCCESS_EMOJIS[random(0, SUCCESS_EMOJIS.length - 1)];
  const message = SUCCESS_MESSAGES[random(0, SUCCESS_MESSAGES.length - 1)];
  const explanation = generateExplanation(currentQuestion, true);

  showFeedback("success", `${emoji} ${message}`, explanation);
  setTimeout(generateQuestion, 3000);
}

function handleIncorrectAnswer() {
  updateScore();
  const explanation = generateExplanation(currentQuestion, false);
  showFeedback(
    "error",
    "❌ Oups ! Regardons ensemble comment faire :",
    explanation
  );
}

// Explications
function generateExplanation(q, isCorrect) {
  const explanations = {
    addition: () => `
      <div class="step">📝 On additionne ${q.num1} et ${q.num2}</div>
      <div class="step">🧮 ${q.num1} + ${q.num2} = ${q.answer}</div>
      ${
        !isCorrect
          ? `<div class="step">💡 Imagine que tu as ${q.num1} bonbons et qu'on te donne ${q.num2} bonbons de plus. Tu en as maintenant ${q.answer} !</div>`
          : ""
      }
    `,
    subtraction: () => `
      <div class="step">📝 On retire ${q.num2} de ${q.num1}</div>
      <div class="step">🧮 ${q.num1} - ${q.num2} = ${q.answer}</div>
      ${
        !isCorrect
          ? `<div class="step">💡 Imagine que tu as ${q.num1} billes et que tu en donnes ${q.num2}. Il t'en reste ${q.answer} !</div>`
          : ""
      }
    `,
    multiplication: () => {
      let steps = [];
      for (let i = 1; i <= Math.min(q.num2, 5); i++) {
        steps.push(q.num1 * i);
      }
      return `
        <div class="step">📝 On multiplie ${q.num1} par ${q.num2}</div>
        <div class="step">🧮 C'est comme additionner ${q.num1} un total de ${
        q.num2
      } fois</div>
        <div class="step">📊 ${
          q.num2 <= 5
            ? `${steps.join(" + ")} = ${q.answer}`
            : `${q.num1} × ${q.num2} = ${q.answer}`
        }</div>
        ${
          !isCorrect
            ? `<div class="step">💡 C'est la table de ${q.num1} !</div>`
            : ""
        }
      `;
    },
    division: () => `
      <div class="step">📝 On divise ${q.num1} par ${q.num2}</div>
      <div class="step">🧮 Combien de fois ${q.num2} rentre dans ${
      q.num1
    } ?</div>
      <div class="step">✅ Réponse : ${q.answer} fois</div>
      <div class="step">🔍 Vérification : ${q.num2} × ${q.answer} = ${
      q.num1
    }</div>
      ${
        !isCorrect
          ? `<div class="step">💡 Si tu partages ${q.num1} bonbons entre ${q.num2} personnes, chacun en aura ${q.answer} !</div>`
          : ""
      }
    `,
  };

  return `<div class="explanation">${explanations[q.operation]()}</div>`;
}

// Indices
function getHint() {
  if (hintsUsed >= 3) {
    showFeedback(
      "hint",
      "😅 Tu as déjà utilisé tous tes indices ! Essaie de deviner !",
      ""
    );
    return;
  }

  hintsUsed++;
  getElement("hintsLeft").textContent = 3 - hintsUsed;

  const hintText = generateHint(currentQuestion, hintsUsed);
  showFeedback("hint", hintText, "");
}

function generateHint(q, hintLevel) {
  const hints = {
    1: {
      addition: `💡 Indice 1 : Le résultat est plus grand que ${q.num1} !`,
      subtraction: `💡 Indice 1 : Le résultat est plus petit que ${q.num1} !`,
      multiplication: `💡 Indice 1 : C'est dans la table de ${q.num1} !`,
      division: `💡 Indice 1 : Pense aux tables de multiplication !`,
    },
    2: () => {
      const range = Math.ceil(q.answer / 5);
      const lower = Math.max(0, q.answer - range);
      const upper = q.answer + range;
      return `💡 Indice 2 : Le résultat est entre ${lower} et ${upper} !`;
    },
    3: () => {
      const digitCount = q.answer.toString().length;
      return `💡 Indice 3 : Le résultat a ${digitCount} chiffre${
        digitCount > 1 ? "s" : ""
      } et commence par ${q.answer.toString()[0]} !`;
    },
  };

  return hintLevel === 1 ? hints[1][q.operation] : hints[hintLevel]();
}

// Feedback
function showFeedback(type, message, explanation) {
  const feedback = getElement("feedback");
  feedback.className = `feedback ${type} show`;
  feedback.innerHTML = message + explanation;
}

// Event listeners
getElement("answer").addEventListener("keypress", (e) => {
  if (e.key === "Enter") checkAnswer();
});

// Export des fonctions pour l'usage global (appelées depuis le HTML)
window.startLevel = startLevel;
window.checkAnswer = checkAnswer;
window.getHint = getHint;
window.resetScore = resetScore;
window.backToLevels = backToLevels;
