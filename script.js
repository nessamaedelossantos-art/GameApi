// DOM
const gameContainer = document.querySelector(".container");
const userResult = document.querySelector(".user_result img");
const botResult = document.querySelector(".bot_result img");
const resultDiv = document.querySelector('.result');
const optionImages = document.querySelectorAll(".option_image");
const restartBtn = document.getElementById('restart-btn');
const registerSection = document.getElementById('register-section');
const registerBtn = document.getElementById('register-btn');
const usernameInput = document.getElementById('username-input');

const userScoreSpan = document.getElementById('user-score');
const botScoreSpan = document.getElementById('bot-score');
const roundSpan = document.getElementById('round');

// Game data
const botImages = ["image/rock.png", "image/paper.png", "image/scissors.png"];
const outcomes = { RR:"Draw", RP:"BOT", RS:"YOU", PP:"Draw", PR:"YOU", PS:"BOT", SS:"Draw", SR:"BOT", SP:"YOU" };

let userScore = 0;
let botScore = 0;
let round = 0;
const maxRounds = 5;

// API
const API_URL = "http://localhost:3000";
let username = null;

// Disable game until registered
optionImages.forEach(opt => opt.style.pointerEvents = 'none');

// Register
registerBtn.addEventListener('click', async () => {
  const enteredUsername = usernameInput.value.trim();
  if (!enteredUsername) {
    alert("Please enter a username!");
    return;
  }

  const res = await fetch(`${API_URL}/player/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: enteredUsername })
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "Registration failed");
    return;
  }

  const data = await res.json();
  username = data.username;

  registerSection.style.display = "none";
  optionImages.forEach(opt => opt.style.pointerEvents = 'auto');
  resultDiv.textContent = `Welcome, ${username}! Let's Play!`;
});

// Update stats
async function updatePlayerStats(result) {
  if (!username) return;
  await fetch(`${API_URL}/player/${username}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result })
  });
}

// Fetch stats
async function fetchPlayerStats() {
  if (!username) return;
  const res = await fetch(`${API_URL}/player/${username}/stats`);
  const data = await res.json();
  console.log("Player Stats:", data);
  return data;
}

// Scoreboard
function updateScoreboard() {
  userScoreSpan.textContent = userScore;
  botScoreSpan.textContent = botScore;
  roundSpan.textContent = round;
}

// End Game
function endGame() {
  if (userScore > botScore) {
    resultDiv.textContent = 'Game Over! You are the Winner!';
    updatePlayerStats("win");
  } else if (botScore > userScore) {
    resultDiv.textContent = 'Game Over! BOT Wins!';
    updatePlayerStats("loss");
  } else {
    resultDiv.textContent = 'Game Over! It\'s a Draw!';
    updatePlayerStats("draw");
  }

  fetchPlayerStats();
  optionImages.forEach(opt => opt.style.pointerEvents = 'none');
  restartBtn.style.display = 'block';
}

// Restart
restartBtn.addEventListener('click', () => {
  userScore = 0; botScore = 0; round = 0;
  updateScoreboard();
  resultDiv.textContent = "Let's Play!";
  userResult.src = "image/rock.png";
  botResult.src = "image/rock.png";
  optionImages.forEach(opt => opt.style.pointerEvents = 'auto');
  optionImages.forEach(opt => opt.classList.remove('active'));
  restartBtn.style.display = 'none';
});

// Game Click
function handleOptionClick(event) {
  if (round >= maxRounds) return;

  const clickedImage = event.currentTarget;
  const clickedIndex = Array.from(optionImages).indexOf(clickedImage);

  userResult.src = botResult.src = "image/rock.png";
  resultDiv.textContent = "Wait...";

  optionImages.forEach((img, idx) => {
    img.classList.toggle("active", idx === clickedIndex);
  });

  gameContainer.classList.add("start");

  setTimeout(() => {
    gameContainer.classList.remove("start");

    userResult.src = clickedImage.querySelector("img").src;
    const randomNumber = Math.floor(Math.random() * botImages.length);
    botResult.src = botImages[randomNumber];

    const userValue = ["R", "P", "S"][clickedIndex];
    const botValue = ["R", "P", "S"][randomNumber];
    const outcomeKey = userValue + botValue;
    const outcome = outcomes[outcomeKey] || "Unknown";

    if (userValue !== botValue) {
      if (outcome === "YOU") userScore++;
      else if (outcome === "BOT") botScore++;
    }

    resultDiv.textContent = userValue === botValue ? "Match Draw" : `${outcome} WON!`;

    round++;
    updateScoreboard();

    if (round === maxRounds) {
      endGame();
    }
  }, 2000);
}

optionImages.forEach(image => {
  image.addEventListener("click", handleOptionClick);
});

updateScoreboard();
