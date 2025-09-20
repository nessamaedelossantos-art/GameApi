const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory "database"
let players = {};
let gameHistory = {}; // store match history

// ✅ GET /rules
app.get('/rules', (req, res) => {
  res.json({
    rules: "Rock beats Scissors, Scissors beats Paper, Paper beats Rock."
  });
});

// ✅ Register Player
app.post('/player/register', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }
  if (players[username]) {
    return res.status(409).json({ error: "Username already exists" });
  }

  players[username] = { wins: 0, losses: 0, draws: 0 };
  gameHistory[username] = []; // init empty history

  res.json({ username });
});

// ✅ Player Stats
app.get('/player/:username/stats', (req, res) => {
  const { username } = req.params;
  if (!players[username]) {
    return res.status(404).json({ error: "Player not found" });
  }
  res.json({ username, ...players[username] });
});

// ✅ Update Stats + Record History
app.post('/player/:username/update', (req, res) => {
  const { username } = req.params;
  const { result, opponent = "Computer" } = req.body;

  if (!players[username]) {
    return res.status(404).json({ error: "Player not found" });
  }

  if (result === "win") players[username].wins++;
  if (result === "loss") players[username].losses++;
  if (result === "draw") players[username].draws++;

  const match = {
    opponent,
    result,
    timestamp: new Date().toISOString()
  };
  gameHistory[username].push(match);

  res.json({ username, stats: players[username], lastMatch: match });
});

// ✅ Player Match History
app.get('/player/history/:username', (req, res) => {
  const { username } = req.params;
  if (!players[username]) {
    return res.status(404).json({ error: "Player not found" });
  }
  res.json({ username, history: gameHistory[username] || [] });
});

// ✅ Global Matches
app.get('/matches', (req, res) => {
  let allMatches = [];
  for (let username in gameHistory) {
    const matches = (gameHistory[username] || []).map(m => ({
      username,
      ...m
    }));
    allMatches = allMatches.concat(matches);
  }
  res.json(allMatches);
});

// ✅ Leaderboard
app.get('/leaderboard', (req, res) => {
  const sorted = Object.entries(players)
    .map(([username, stats]) => ({ username, ...stats }))
    .sort((a, b) => b.wins - a.wins);
  res.json(sorted);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
