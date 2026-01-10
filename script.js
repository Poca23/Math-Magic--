let currentLevel = "";
let currentQuestion = {};
let hintsUsed = 0;
let score = 0;
let totalQuestions = 0;

const levels = {
  CP: {
    operations: ["addition", "subtraction"],
    maxNumber: 10,
    allowNegative: false,
  },
  CE1: {
    operations: ["addition", "subtraction"],
    maxNumber: 20,
    allowNegative: false,
  },
  CE2: {
    operations: ["addition", "subtraction", "multiplication"],
    maxNumber: 50,
    multiplicationMax: 10,
    allowNegative: false,
  },
  CM1: {
    operations: ["addition", "subtraction", "multiplication", "division"],
    maxNumber: 100,
    multiplicationMax: 12,
    allowNegative: true,
  },
  CM2: {
    operations: ["addition", "subtraction", "multiplication", "division"],
    maxNumber: 1000,
    multiplicationMax: 15,
    allowNegative: true,
  },
};

function startLevel(level) {
  currentLevel = level;
  score = 0;
  totalQuestions = 0;
  document.getElementById("levelSelector").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  generateQuestion();
}

function backToLevels() {
  document.getElementById("levelSelector").style.display = "grid";
  document.getElementById("gameArea").style.display = "none";
  document.getElementById("feedback").classList.remove("show");
  document.getElementById("answer").value = "";
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  hintsUsed = 0;
  document.getElementById("hintsLeft").textContent = "3";
  document.getElementById("feedback").classList.remove("show");
  document.getElementById("answer").value = "";
  document.getElementById("answer").focus();

  const config = levels[currentLevel];
  const operation = config.operations[random(0, config.operations.length - 1)];

  let num1, num2, answer, symbol;

  if (operation === "addition") {
    num1 = random(1, config.maxNumber);
    num2 = random(1, config.maxNumber);
    answer = num1 + num2;
    symbol = "+";
  } else if (operation === "subtraction") {
    num1 = random(1, config.maxNumber);
    num2 = random(1, num1);
    if (config.allowNegative && Math.random() > 0.7) {
      num2 = random(num1, config.maxNumber);
    }
    answer = num1 - num2;
    symbol = "-";
  } else if (operation === "multiplication") {
    num1 = random(2, config.multiplicationMax || 10);
    num2 = random(2, config.multiplicationMax || 10);
    answer = num1 * num2;
    symbol = "×";
  } else if (operation === "division") {
    num2 = random(2, 10);
    answer = random(2, 15);
    num1 = num2 * answer;
    symbol = "÷";
  }

  currentQuestion = { num1, num2, answer, operation, symbol };
  document.getElementById(
    "question"
  ).textContent = `${num1} ${symbol} ${num2} = ?`;
}

function checkAnswer() {
  const userAnswer = parseInt(document.getElementById("answer").value);

  if (isNaN(userAnswer)) {
    showFeedback("error", "⚠️ Entre un nombre !", "");
    return;
  }

  totalQuestions++;

  if (userAnswer === currentQuestion.answer) {
    score++;
    updateScore();

    const emojis = ["🎉", "🌟", "👏", "🏆", "✨", "🎊"];
    const messages = [
      "Bravo champion !",
      "Excellent !",
      "Parfait !",
      "Super !",
      "Génial !",
      "Tu es incroyable !",
    ];

    const emoji = emojis[random(0, emojis.length - 1)];
    const message = messages[random(0, messages.length - 1)];

    const explanation = generateExplanation(currentQuestion, true);
    showFeedback("success", `${emoji} ${message}`, explanation);

    setTimeout(() => generateQuestion(), 3000);
  } else {
    updateScore();
    const explanation = generateExplanation(currentQuestion, false);
    showFeedback(
      "error",
      "❌ Oups ! Regardons ensemble comment faire :",
      explanation
    );
  }
}

function generateExplanation(q, isCorrect) {
  let html = '<div class="explanation">';

  if (q.operation === "addition") {
    html += `<div class="step">📝 On additionne ${q.num1} et ${q.num2}</div>`;
    html += `<div class="step">🧮 ${q.num1} + ${q.num2} = ${q.answer}</div>`;
    if (!isCorrect) {
      html += `<div class="step">💡 Imagine que tu as ${q.num1} bonbons et qu'on te donne ${q.num2} bonbons de plus. Tu en as maintenant ${q.answer} !</div>`;
    }
  } else if (q.operation === "subtraction") {
    html += `<div class="step">📝 On retire ${q.num2} de ${q.num1}</div>`;
    html += `<div class="step">🧮 ${q.num1} - ${q.num2} = ${q.answer}</div>`;
    if (!isCorrect) {
      html += `<div class="step">💡 Imagine que tu as ${q.num1} billes et que tu en donnes ${q.num2}. Il t'en reste ${q.answer} !</div>`;
    }
  } else if (q.operation === "multiplication") {
    html += `<div class="step">📝 On multiplie ${q.num1} par ${q.num2}</div>`;
    html += `<div class="step">🧮 C'est comme additionner ${q.num1} un total de ${q.num2} fois</div>`;

    let steps = [];
    for (let i = 1; i <= Math.min(q.num2, 5); i++) {
      steps.push(q.num1 * i);
    }
    if (q.num2 <= 5) {
      html += `<div class="step">📊 ${steps.join(" + ")} = ${q.answer}</div>`;
    } else {
      html += `<div class="step">📊 ${q.num1} × ${q.num2} = ${q.answer}</div>`;
    }

    if (!isCorrect) {
      html += `<div class="step">💡 C'est la table de ${q.num1} !</div>`;
    }
  } else if (q.operation === "division") {
    html += `<div class="step">📝 On divise ${q.num1} par ${q.num2}</div>`;
    html += `<div class="step">🧮 Combien de fois ${q.num2} rentre dans ${q.num1} ?</div>`;
    html += `<div class="step">✅ Réponse : ${q.answer} fois</div>`;
    html += `<div class="step">🔍 Vérification : ${q.num2} × ${q.answer} = ${q.num1}</div>`;
    if (!isCorrect) {
      html += `<div class="step">💡 Si tu partages ${q.num1} bonbons entre ${q.num2} personnes, chacun en aura ${q.answer} !</div>`;
    }
  }

  html += "</div>";
  return html;
}

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
  document.getElementById("hintsLeft").textContent = 3 - hintsUsed;

  const q = currentQuestion;
  let hintText = "";

  if (hintsUsed === 1) {
    if (q.operation === "addition") {
      hintText = `💡 Indice 1 : Le résultat est plus grand que ${q.num1} !`;
    } else if (q.operation === "subtraction") {
      hintText = `💡 Indice 1 : Le résultat est plus petit que ${q.num1} !`;
    } else if (q.operation === "multiplication") {
      hintText = `💡 Indice 1 : C'est dans la table de ${q.num1} !`;
    } else if (q.operation === "division") {
      hintText = `💡 Indice 1 : Pense aux tables de multiplication !`;
    }
  } else if (hintsUsed === 2) {
    const range = Math.ceil(q.answer / 5);
    const lower = Math.max(0, q.answer - range);
    const upper = q.answer + range;
    hintText = `💡 Indice 2 : Le résultat est entre ${lower} et ${upper} !`;
  } else if (hintsUsed === 3) {
    const digitCount = q.answer.toString().length;
    hintText = `💡 Indice 3 : Le résultat a ${digitCount} chiffre${
      digitCount > 1 ? "s" : ""
    } et commence par ${q.answer.toString()[0]} !`;
  }

  showFeedback("hint", hintText, "");
}

function showFeedback(type, message, explanation) {
  const feedback = document.getElementById("feedback");
  feedback.className = `feedback ${type} show`;
  feedback.innerHTML = message + explanation;
}

function updateScore() {
  document.getElementById(
    "scoreText"
  ).textContent = `Score: ${score} / ${totalQuestions}`;
}

document.getElementById("answer").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    checkAnswer();
  }
});
