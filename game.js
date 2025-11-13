// Firebase configuration - 需要替换为你的 Firebase 项目配置
const firebaseConfig = {
  apiKey: "AIzaSyDpWLfAhTzH62dGWHI9qz7i3tXLPoBjZcQ",
  authDomain: "make24game-2f4ef.firebaseapp.com",
  databaseURL:
    "https://make24game-2f4ef-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "make24game-2f4ef",
  storageBucket: "make24game-2f4ef.firebasestorage.app",
  messagingSenderId: "1046776043398",
  appId: "1:1046776043398:web:03af87c3e0a6e0ebdbc38f",
};

// 初始化 Firebase
let database = null;
let firebaseReady = false;

try {
  console.log("Initializing Firebase with config:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  });
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  firebaseReady = true;
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization error:", error.message);
  console.log("Will use localStorage fallback (same browser only)");
  firebaseReady = false;
}

// Game state
let gameState = {
  currentRound: 0,
  totalRounds: 10,
  numbers: [],
  maxPlayers: 6,
  players: {}, // Dynamic player tracking: { 1: {score: 0, connected: true}, ... }
  roundActive: false,
  cardsUnveiled: false,
  roundWinner: null,
  startTime: null,
  timerInterval: null,
  roomCode: null,
  isHost: false,
  playerNumber: null,
  peer: null,
  connection: null,
  lastSync: 0,
  lastGameStateHash: null,
  firebaseRef: null,
  useFirebase: false,
};

// DOM elements
const elements = {
  cardsContainer: document.getElementById("cards-container"),
  currentRound: document.getElementById("current-round"),
  timer: document.getElementById("timer"),
  myInput: document.getElementById("my-input"),
  mySubmit: document.getElementById("my-submit"),
  myPlayerLabel: document.getElementById("my-player-label"),
  scoresDisplay: document.getElementById("scores-display"),
  myStatus: document.getElementById("my-status"),
  startBtn: document.getElementById("start-btn"),
  unveilCardsBtn: document.getElementById("unveil-cards-btn"),
  nextRoundBtn: document.getElementById("next-round-btn"),
  skipRoundBtn: document.getElementById("skip-round-btn"),
  finishGameBtn: document.getElementById("finish-game-btn"),
  newGameBtn: document.getElementById("new-game-btn"),
  message: document.getElementById("message"),
  gameOver: document.getElementById("game-over"),
  winnerAnnouncement: document.getElementById("winner-announcement"),
  roomCode: document.getElementById("room-code"),
  copyCodeBtn: document.getElementById("copy-code-btn"),
  joinCode: document.getElementById("join-code"),
  joinBtn: document.getElementById("join-btn"),
  connectionStatus: document.getElementById("connection-status"),
  statusText: document.getElementById("status-text"),
  playerNameInput: document.getElementById("player-name-input"),
};

// Helper functions for multi-player support
function initializePlayer(playerNum, playerName = null) {
  if (!gameState.players[playerNum]) {
    gameState.players[playerNum] = {
      score: 0,
      connected: true,
      hasAnswered: false,
      name: playerName || `Player ${playerNum}`,
    };
  } else if (playerName && !gameState.players[playerNum].name) {
    gameState.players[playerNum].name = playerName;
  }
}

function renderScoreBoard() {
  if (!elements.scoresDisplay) {
    console.warn("scoresDisplay element not found");
    return;
  }

  elements.scoresDisplay.innerHTML = "";
  const playerNumbers = Object.keys(gameState.players).sort((a, b) => a - b);

  playerNumbers.forEach((playerNum) => {
    const player = gameState.players[playerNum];
    const isCurrentPlayer = parseInt(playerNum) === gameState.playerNumber;
    const isWinner = gameState.roundWinner === parseInt(playerNum);

    const playerBox = document.createElement("div");
    playerBox.className = "player-score-box";
    if (isCurrentPlayer) playerBox.classList.add("current-player");
    if (isWinner) playerBox.classList.add("winner");

    const playerName = player.name || `Player ${playerNum}`;
    const displayName = isCurrentPlayer ? `${playerName} (You)` : playerName;

    playerBox.innerHTML = `
      <h3>${displayName}</h3>
      <div class="score-value">${player.score}</div>
      <span class="status-badge ${player.connected ? "online" : "offline"}">
        ${player.connected ? "● Online" : "○ Offline"}
      </span>
    `;

    elements.scoresDisplay.appendChild(playerBox);
  });
}

function updateScores() {
  renderScoreBoard();
}

function getPlayerScore(playerNum) {
  return gameState.players[playerNum]?.score || 0;
}

function setPlayerScore(playerNum, score) {
  if (gameState.players[playerNum]) {
    gameState.players[playerNum].score = score;
  }
}

function incrementPlayerScore(playerNum, points = 5) {
  if (gameState.players[playerNum]) {
    gameState.players[playerNum].score += points;
  }
}

function getNextPlayerNumber() {
  const existingPlayers = Object.keys(gameState.players).map(Number);
  for (let i = 1; i <= gameState.maxPlayers; i++) {
    if (!existingPlayers.includes(i)) {
      return i;
    }
  }
  return null; // Room is full
}

function init() {
  // Generate initial room code without starting the game
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  gameState.roomCode = code;

  // Update room code in the UI
  const roomCodeElement = document.getElementById("room-code");
  if (roomCodeElement) {
    roomCodeElement.value = code;
    console.log("Room code set to:", code);
  } else {
    console.error("Room code element not found!");
  }

  gameState.isHost = true;
  gameState.playerNumber = 1;

  initializePeerConnection();

  elements.startBtn.addEventListener("click", startGame);
  elements.unveilCardsBtn.addEventListener("click", unveilCards);
  elements.nextRoundBtn.addEventListener("click", nextRound);
  elements.skipRoundBtn.addEventListener("click", skipRound);
  elements.finishGameBtn.addEventListener("click", finishGame);
  elements.newGameBtn.addEventListener("click", resetGame);
  elements.copyCodeBtn.addEventListener("click", copyRoomCode);
  elements.joinBtn.addEventListener("click", joinRoom);

  // Close game over popup
  const closeGameOverBtn = document.getElementById("close-game-over");
  const newGamePopupBtn = document.getElementById("new-game-popup-btn");
  if (closeGameOverBtn) {
    closeGameOverBtn.addEventListener("click", () => {
      elements.gameOver.style.display = "none";
    });
  }
  if (newGamePopupBtn) {
    newGamePopupBtn.addEventListener("click", () => {
      elements.gameOver.style.display = "none";
      resetGame();
    });
  }

  elements.mySubmit.addEventListener("click", () =>
    handleSubmit(gameState.playerNumber)
  );

  // Allow Enter key to submit
  elements.myInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !elements.mySubmit.disabled) {
      handleSubmit(gameState.playerNumber);
    }
  });

  elements.joinCode.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  });
}

// Generate a unique room code and initialize player
function generateRoomCode() {
  // Validate name input
  const playerName = elements.playerNameInput.value.trim();
  if (!playerName) {
    alert("Please enter your name before starting the game!");
    elements.playerNameInput.focus();
    return false;
  }

  // Initialize Player 1 with name
  initializePlayer(1, playerName);

  elements.myPlayerLabel.textContent = `${playerName} (You)`;
  updateConnectionStatus("offline", "Waiting for other players...");
  updateScores();

  // 设置 Firebase 实时监听
  setupFirebaseListener(gameState.roomCode);
  return true;
}

// 设置 Firebase 监听
function setupFirebaseListener(code) {
  // 如果 Firebase 未就绪，使用 localStorage 监听
  if (!firebaseReady || !database) {
    console.log("⚠️ Firebase not ready, using localStorage polling");
    console.log(
      "This works in the same browser only. For cross-device, set up Firebase Realtime Database."
    );
    gameState.useFirebase = false;
    return;
  }

  console.log("✅ Firebase ready, setting up listener for room:", code);
  gameState.firebaseRef = database.ref(`games/${code}`);
  gameState.useFirebase = true;

  // 立即写入初始数据，确保房间存在
  database
    .ref(`games/${code}`)
    .set({
      roomCode: code,
      maxPlayers: gameState.maxPlayers,
      createdAt: Date.now(),
      players: gameState.players,
      gameState: {
        currentRound: 0,
        numbers: [0, 0, 0, 0],
        roundActive: false,
        roundWinner: null,
      },
    })
    .then(() => {
      console.log("✅ Firebase room created successfully");
    })
    .catch((error) => {
      console.error("❌ Firebase room creation error:", error);
      console.log("Falling back to localStorage");
      gameState.useFirebase = false;
    });

  // 监听游戏状态变化
  gameState.firebaseRef.on(
    "value",
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(
          "🔥 Firebase update received by Player",
          gameState.playerNumber,
          ":",
          data
        );

        // Player connection detection
        if (data.players) {
          Object.keys(data.players).forEach((playerNum) => {
            const num = parseInt(playerNum);
            if (!gameState.players[num]) {
              initializePlayer(num);
              gameState.players[num] = data.players[num];
              if (gameState.isHost && num !== gameState.playerNumber) {
                const playerName = data.players[num].name || `Player ${num}`;
                showMessage(`${playerName} has joined the game!`, "success");
              }
            } else {
              // Update connection status and name
              if (gameState.players[num]) {
                gameState.players[num].connected = data.players[num].connected;
                if (data.players[num].name) {
                  gameState.players[num].name = data.players[num].name;
                }
              }
            }
          });
          updateScores();
        }

        // 应用游戏状态更新
        if (data.gameState) {
          applyRemoteGameState(data.gameState, data.players);
        }

        // 处理提交
        if (data.lastSubmit && data.lastSubmit.timestamp > gameState.lastSync) {
          gameState.lastSync = data.lastSubmit.timestamp;
          applyRemoteSubmit(data.lastSubmit);
        }
      }
    },
    (error) => {
      console.error("Firebase error:", error);
    }
  );
}

// Firebase 同步游戏状态
function syncGameStateFirebase(action, data) {
  if (!gameState.roomCode || !gameState.useFirebase) return;

  const syncData = {
    timestamp: Date.now(),
    action: action,
    data: data,
    gameState: {
      currentRound: gameState.currentRound,
      numbers: [...gameState.numbers],
      roundActive: gameState.roundActive,
      cardsUnveiled: gameState.cardsUnveiled,
      roundWinner: gameState.roundWinner,
    },
  };

  console.log(
    "🔄 Syncing to Firebase from Player",
    gameState.playerNumber,
    "- Action:",
    action,
    "State:",
    syncData.gameState
  );

  database
    .ref(`games/${gameState.roomCode}`)
    .update({
      players: gameState.players,
      gameState: syncData.gameState,
      lastAction: action,
      lastUpdate: Date.now(),
      [`player${gameState.playerNumber}LastUpdate`]: Date.now(),
    })
    .then(() => {
      console.log("✅ Firebase sync successful:", action);
    })
    .catch((error) => console.error("❌ Firebase sync error:", error));
}

// 处理 Firebase 提交
function applyRemoteSubmit(submitData) {
  if (submitData.player && submitData.correct && !gameState.roundWinner) {
    gameState.roundWinner = submitData.player;

    if (submitData.player === gameState.playerNumber) {
      showPlayerStatus("🎉 Correct! +5 points", true);
    } else {
      showPlayerStatus(`Player ${submitData.player} got it first!`, false);
      showMessage(`Player ${submitData.player} wins this round!`, "success");
    }

    // Update player score using the new system
    setPlayerScore(submitData.player, submitData.score);

    updateScores();
    stopTimer();
    disableInputs();
    gameState.roundActive = false;
    elements.nextRoundBtn.style.display = gameState.isHost
      ? "inline-block"
      : "none";
    elements.skipRoundBtn.style.display = "none";
    elements.finishGameBtn.style.display = "none";
  }
}

// Copy room code to clipboard
function copyRoomCode() {
  elements.roomCode.select();
  document.execCommand("copy");
  elements.copyCodeBtn.textContent = "Copied!";
  setTimeout(() => {
    elements.copyCodeBtn.textContent = "Copy Code";
  }, 2000);
}

// Initialize peer connection (simplified for demo - in production use WebRTC/WebSocket)
function initializePeerConnection() {
  // For this demo, we'll use localStorage to simulate multiplayer
  // In production, you'd use a real-time service like Firebase, WebSocket, or PeerJS

  // Check for updates from other player every 300ms
  setInterval(() => {
    if (gameState.roomCode) {
      checkForRemoteUpdates();
    }
  }, 300);
}

// Join a room
function joinRoom() {
  // Validate name input
  const playerName = elements.playerNameInput.value.trim();
  if (!playerName) {
    alert("Please enter your name before joining the game!");
    elements.playerNameInput.focus();
    return;
  }

  const code = elements.joinCode.value.trim().toUpperCase();
  if (!code) {
    alert("Please enter a room code");
    return;
  }

  gameState.roomCode = code;
  gameState.isHost = false;
  elements.roomCode.value = code;
  updateConnectionStatus("connecting", "Connecting...");

  // 先尝试从 Firebase 加载
  if (firebaseReady && database) {
    console.log("🔥 Trying to join Firebase room:", code);
    gameState.firebaseRef = database.ref(`games/${code}`);

    gameState.firebaseRef.once(
      "value",
      (snapshot) => {
        console.log("📊 Firebase snapshot exists:", snapshot.exists());
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Loading Firebase game state:", data);

          // Load existing players first to check available slots
          if (data.players) {
            Object.keys(data.players).forEach((playerNum) => {
              const num = parseInt(playerNum);
              initializePlayer(num);
              gameState.players[num] = data.players[num];
            });
          }

          // Determine next available player number based on Firebase data
          const nextPlayerNum = getNextPlayerNumber();
          if (nextPlayerNum === null) {
            alert("Room is full! Maximum 6 players allowed.");
            updateConnectionStatus("offline", "Room is full");
            return;
          }

          gameState.playerNumber = nextPlayerNum;

          // Use the validated player name
          elements.myPlayerLabel.textContent = `${playerName} (You)`;

          // Initialize this player with connected status and name
          initializePlayer(nextPlayerNum, playerName);
          gameState.players[nextPlayerNum].connected = true;

          if (data.gameState) {
            gameState.currentRound = data.gameState.currentRound;
            gameState.numbers = [...data.gameState.numbers];
            gameState.roundActive = data.gameState.roundActive;
            gameState.roundWinner = data.gameState.roundWinner;

            // Only display cards if game has started (currentRound > 0)
            if (gameState.currentRound > 0) {
              displayCards();
            }
            updateScores();
            elements.currentRound.textContent = gameState.currentRound;

            if (gameState.roundActive) {
              enableInputs();
              startTimer();
              showMessage("Joined active game!", "success");
            } else if (gameState.currentRound > 0) {
              disableInputs();
              showMessage("Joined game - waiting for next round", "success");
            } else {
              elements.startBtn.style.display = "none";
              showMessage("Joined game - waiting to start", "success");
            }
          }

          updateConnectionStatus("online", "Connected to game!");
          updateScores();
          gameState.useFirebase = true;

          // Notify others that this player joined
          const updatedPlayers = {
            ...data.players,
            [nextPlayerNum]: gameState.players[nextPlayerNum],
          };
          database.ref(`games/${code}`).update({
            players: updatedPlayers,
            [`player${nextPlayerNum}JoinTime`]: Date.now(),
          });

          // 设置监听以获取后续更新
          gameState.firebaseRef.on("value", (snapshot) => {
            if (snapshot.exists()) {
              const gameData = snapshot.val();

              // Update players
              if (gameData.players) {
                Object.keys(gameData.players).forEach((playerNum) => {
                  const num = parseInt(playerNum);
                  if (!gameState.players[num]) {
                    initializePlayer(num);
                  }
                  gameState.players[num] = gameData.players[num];
                });
              }

              if (gameData.gameState) {
                applyRemoteGameState(gameData.gameState, gameData.players);
              }

              // Handle specific actions
              if (
                gameData.lastAction === "finish" &&
                gameData.lastUpdate > gameState.lastSync
              ) {
                console.log("🏁 Received finish action from host");
                gameState.lastSync = gameData.lastUpdate;
                endGame();
              }

              if (
                gameData.lastSubmit &&
                gameData.lastSubmit.timestamp > gameState.lastSync
              ) {
                gameState.lastSync = gameData.lastSubmit.timestamp;
                applyRemoteSubmit(gameData.lastSubmit);
              }
            }
          });
        } else {
          // Firebase 中找不到房间，尝试 localStorage
          console.log("❌ Room not found in Firebase, trying localStorage");
          joinRoomLocalStorage(code);
        }
      },
      (firebaseError) => {
        console.error("❌ Firebase error:", firebaseError);
        console.error("Error code:", firebaseError.code);
        console.error("Error message:", firebaseError.message);
        // Firebase 出错，回退到 localStorage
        console.log("📦 Firebase error, falling back to localStorage");
        joinRoomLocalStorage(code);
      }
    );
  } else {
    // Firebase 未就绪，使用 localStorage
    console.log("Firebase not ready, using localStorage");
    joinRoomLocalStorage(code);
  }
}

// localStorage 备用方案
function joinRoomLocalStorage(code) {
  console.log("📦 Using localStorage to join room:", code);
  const stored = localStorage.getItem(`game24_${code}`);
  console.log("localStorage data found:", stored ? "YES" : "NO");

  if (stored) {
    try {
      const data = JSON.parse(stored);
      console.log("Loading localStorage game state:", data);
      if (data.gameState) {
        gameState.currentRound = data.gameState.currentRound;
        gameState.numbers = [...data.gameState.numbers];
        gameState.player1Score = data.gameState.player1Score;
        gameState.player2Score = data.gameState.player2Score;
        gameState.roundActive = data.gameState.roundActive;
        gameState.roundWinner = data.gameState.roundWinner;

        displayCards();
        updateScores();
        elements.currentRound.textContent = gameState.currentRound;

        if (gameState.roundActive) {
          enableInputs();
          startTimer();
          showMessage("Joined active game!", "success");
        } else if (gameState.currentRound > 0) {
          disableInputs();
          showMessage("Joined game - waiting for next round", "success");
        } else {
          elements.startBtn.style.display = "none";
          showMessage("Joined game - waiting to start", "success");
        }
      }

      updateConnectionStatus("online", "Connected to game!");
      gameState.useFirebase = false;

      // 标记 Player 2 加入
      localStorage.setItem(`game24_${code}_player2`, Date.now().toString());
    } catch (e) {
      console.error("Error loading localStorage game state:", e);
      showMessage("Failed to join game: " + e.message, "error");
    }
  } else {
    showMessage(
      "Room not found - Player 1 needs to create game first",
      "error"
    );
  }
}

// Update connection status
function updateConnectionStatus(status, text) {
  const indicator =
    elements.connectionStatus.querySelector(".status-indicator");
  indicator.className = `status-indicator ${status}`;
  elements.statusText.textContent = text;
}

// Send game state to other player
function syncGameState(action, data) {
  if (!gameState.roomCode) return;

  const syncData = {
    roomCode: gameState.roomCode,
    timestamp: Date.now(),
    action: action,
    data: data,
    players: gameState.players,
    gameState: {
      currentRound: gameState.currentRound,
      numbers: [...gameState.numbers], // Clone array
      roundActive: gameState.roundActive,
      cardsUnveiled: gameState.cardsUnveiled,
      roundWinner: gameState.roundWinner,
    },
  };

  console.log(
    "Syncing state:",
    action,
    "useFirebase:",
    gameState.useFirebase,
    "firebaseRef:",
    !!gameState.firebaseRef
  );

  // 使用 Firebase 同步
  if (gameState.useFirebase && gameState.firebaseRef) {
    syncGameStateFirebase(action, data);
  } else {
    // 备用方案：使用 localStorage (仅当 Firebase 不可用时)
    console.log("📦 Using localStorage sync (Firebase not available)");
    localStorage.setItem(
      `game24_${gameState.roomCode}`,
      JSON.stringify(syncData)
    );
  }
}

// Check for updates from other player
function checkForRemoteUpdates() {
  // Skip if using Firebase
  if (gameState.useFirebase) {
    return;
  }

  // Check if player 2 joined
  if (gameState.playerNumber === 1) {
    const player2Joined = localStorage.getItem(
      `game24_${gameState.roomCode}_player2`
    );
    if (player2Joined && !gameState.player2Connected) {
      gameState.player2Connected = true;
      updateConnectionStatus("online", "Player 2 connected!");
      showMessage("Player 2 has joined the game!", "success");
      elements.statusText.textContent = "Player 2 connected!";
    }
  }

  const stored = localStorage.getItem(`game24_${gameState.roomCode}`);
  if (!stored) return;

  try {
    const data = JSON.parse(stored);

    // Update game state if newer
    if (data.gameState && data.timestamp > (gameState.lastSync || 0)) {
      gameState.lastSync = data.timestamp;

      console.log("Received update:", data.action, data.gameState);

      if (data.action === "start") {
        applyRemoteGameState(data.gameState);
        elements.startBtn.style.display = "none";
        showMessage("Game started!", "success");
      } else if (data.action === "unveil") {
        applyRemoteGameState(data.gameState);
        showMessage("Cards unveiled!", "success");
      } else if (data.action === "submit") {
        applyRemoteSubmit(data.data);
      } else if (data.action === "nextRound") {
        applyRemoteGameState(data.gameState);
        showMessage(`Round ${data.gameState.currentRound} started!`, "success");
      } else if (data.action === "skip") {
        applyRemoteGameState(data.gameState);
        stopTimer();
        gameState.roundActive = false;
        disableInputs();
        elements.skipRoundBtn.style.display = "none";
        elements.finishGameBtn.style.display = "none";
        elements.nextRoundBtn.style.display = "none";
        showMessage("Round skipped - no points awarded", "error");
      } else if (data.action === "finish") {
        endGame();
      }
    }
  } catch (e) {
    console.error("Error parsing remote data:", e);
  }
}

// Apply remote game state
function applyRemoteGameState(
  remoteState,
  remotePlayers = null,
  force = false
) {
  console.log(
    "🔄 Player",
    gameState.playerNumber,
    "applying remote state:",
    remoteState
  );

  // Create new state hash
  const newHash = JSON.stringify(remoteState);
  if (!force && newHash === gameState.lastGameStateHash) {
    console.log("⏭️  State unchanged, skipping update");
    return;
  }
  console.log("✅ State changed, updating UI");

  gameState.lastGameStateHash = newHash;
  gameState.currentRound = remoteState.currentRound;

  // Defensive check for numbers array
  if (
    remoteState.numbers &&
    Array.isArray(remoteState.numbers) &&
    remoteState.numbers.length === 4
  ) {
    gameState.numbers = [...remoteState.numbers]; // Clone array
  } else {
    console.warn("Invalid numbers array in remote state:", remoteState.numbers);
    gameState.numbers = [0, 0, 0, 0];
  }

  // Update players if provided
  if (remotePlayers) {
    Object.keys(remotePlayers).forEach((playerNum) => {
      const num = parseInt(playerNum);
      if (!gameState.players[num]) {
        initializePlayer(num);
      }
      gameState.players[num] = remotePlayers[num];
    });
  }

  gameState.roundActive = remoteState.roundActive;
  gameState.cardsUnveiled =
    remoteState.cardsUnveiled !== undefined
      ? remoteState.cardsUnveiled
      : gameState.cardsUnveiled;
  gameState.roundWinner = remoteState.roundWinner || null;

  // Update UI - only display cards if game has started
  if (gameState.currentRound > 0) {
    displayCards();
  }
  updateScores();
  clearInputs();
  clearPlayerStatuses();
  elements.currentRound.textContent = gameState.currentRound;

  if (gameState.roundActive) {
    enableInputs();
    // Show control buttons only for host
    if (gameState.isHost) {
      elements.skipRoundBtn.style.display = "inline-block";
      elements.finishGameBtn.style.display = "inline-block";
    } else {
      elements.skipRoundBtn.style.display = "none";
      elements.finishGameBtn.style.display = "none";
    }
    elements.unveilCardsBtn.style.display = "none";
    elements.nextRoundBtn.style.display = "none";
    if (!gameState.timerInterval) {
      startTimer();
    }
  } else {
    disableInputs();
    elements.skipRoundBtn.style.display = "none";
    elements.finishGameBtn.style.display = "none";
    // Show unveil button if cards not unveiled yet
    if (!gameState.cardsUnveiled && gameState.currentRound > 0) {
      elements.unveilCardsBtn.style.display = gameState.isHost
        ? "inline-block"
        : "none";
      if (!gameState.isHost) {
        showMessage("Waiting for host to unveil cards...", "success");
      }
    } else {
      elements.unveilCardsBtn.style.display = "none";
    }
  }
}

// Apply remote submit
function applyRemoteSubmit(data) {
  if (data.player && data.correct && !gameState.roundWinner) {
    gameState.roundWinner = data.player;

    if (data.player === gameState.playerNumber) {
      showPlayerStatus("🎉 Correct! +5 points", true);
    } else {
      showPlayerStatus(`Player ${data.player} got it first!`, false);
      showMessage(`Player ${data.player} wins this round!`, "success");
    }

    // Update player score using the new system
    setPlayerScore(data.player, data.score);

    updateScores();
    stopTimer();
    disableInputs();
    gameState.roundActive = false;
    elements.nextRoundBtn.style.display = gameState.isHost
      ? "inline-block"
      : "none";
    elements.skipRoundBtn.style.display = "none";
    elements.finishGameBtn.style.display = "none";
  }
}

// Start a new game
function startGame() {
  if (!gameState.isHost) {
    showMessage("Only Player 1 can start the game", "error");
    return;
  }

  // Initialize player with name if not already done
  if (!gameState.players[1] || !gameState.players[1].name) {
    if (!generateRoomCode()) {
      return; // Name validation failed
    }
  }

  resetGame();
  gameState.currentRound = 1;
  gameState.numbers = generateNumbers();
  gameState.cardsUnveiled = false;
  gameState.roundActive = false;

  console.log("🎮 START GAME - cardsUnveiled set to:", gameState.cardsUnveiled);

  // Hide cards initially
  hideCards();
  disableInputs();

  elements.startBtn.style.display = "none";
  elements.unveilCardsBtn.style.display = gameState.isHost
    ? "inline-block"
    : "none";
  elements.currentRound.textContent = gameState.currentRound;

  showMessage("Waiting for host to unveil cards...", "success");

  console.log(
    "🎮 START GAME - About to sync. cardsUnveiled:",
    gameState.cardsUnveiled
  );
  syncGameState("start", null);
  console.log(
    "🎮 START GAME - After sync. cardsUnveiled:",
    gameState.cardsUnveiled
  );
}

// Unveil cards - called by host when ready to start
function unveilCards() {
  if (!gameState.isHost) {
    showMessage("Only the host can unveil cards", "error");
    return;
  }

  gameState.cardsUnveiled = true;
  gameState.roundActive = true;
  displayCards();
  enableInputs();
  clearPlayerStatuses();

  elements.unveilCardsBtn.style.display = "none";
  elements.skipRoundBtn.style.display = "inline-block";
  elements.finishGameBtn.style.display = "inline-block";
  elements.message.textContent = "";

  startTimer();
  console.log("🎴 Cards unveiled!", gameState.numbers);
  syncGameState("unveil", null);
}

// Skip current round
function skipRound() {
  if (!gameState.isHost) {
    showMessage("Only Player 1 can skip rounds", "error");
    return;
  }

  if (!gameState.roundActive) return;

  stopTimer();
  gameState.roundActive = false;
  showMessage("Round skipped - no points awarded", "error");
  disableInputs();
  elements.nextRoundBtn.style.display = "inline-block";
  elements.skipRoundBtn.style.display = "none";
  elements.finishGameBtn.style.display = "none";

  syncGameState("skip", null);
}

// Finish game early
function finishGame() {
  if (!gameState.isHost) {
    showMessage("Only Player 1 can finish the game", "error");
    return;
  }

  if (confirm("Are you sure you want to finish the game early?")) {
    stopTimer();
    gameState.currentRound = gameState.totalRounds;
    endGame();
    syncGameState("finish", null);
  }
}

// Reset game state
function resetGame() {
  // Reset player scores but keep players
  Object.keys(gameState.players).forEach((playerNum) => {
    gameState.players[playerNum].score = 0;
    gameState.players[playerNum].hasAnswered = false;
  });

  gameState.currentRound = 0;
  gameState.numbers = [];
  gameState.roundActive = false;
  gameState.roundWinner = null;
  gameState.startTime = null;
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
  gameState.lastSync = 0;
  gameState.lastGameStateHash = null;

  updateScores();
  elements.gameOver.style.display = "none";
  elements.startBtn.style.display = "inline-block";
  elements.nextRoundBtn.style.display = "none";
  elements.skipRoundBtn.style.display = "none";
  elements.finishGameBtn.style.display = "none";
  elements.newGameBtn.style.display = "none";
  elements.message.textContent = "";
  elements.message.className = "message";
  clearPlayerStatuses();

  // Clear localStorage for this room
  if (gameState.roomCode) {
    localStorage.removeItem(`game24_${gameState.roomCode}`);
  }
}

// Start next round
function nextRound() {
  if (!gameState.isHost) {
    showMessage("Only Player 1 can advance to next round", "error");
    return;
  }

  console.log(
    `Current round: ${gameState.currentRound}, Total rounds: ${gameState.totalRounds}`
  );

  if (gameState.currentRound >= gameState.totalRounds) {
    console.log("Game completed! Showing end game screen...");
    endGame();
    syncGameState("finish", null);
    return;
  }

  gameState.currentRound++;
  gameState.roundActive = false;
  gameState.cardsUnveiled = false;
  gameState.roundWinner = null;
  gameState.numbers = generateNumbers();

  hideCards();
  clearInputs();
  clearPlayerStatuses();
  disableInputs();

  elements.currentRound.textContent = gameState.currentRound;
  elements.nextRoundBtn.style.display = "none";
  elements.unveilCardsBtn.style.display = gameState.isHost
    ? "inline-block"
    : "none";
  elements.skipRoundBtn.style.display = "none";
  elements.finishGameBtn.style.display = "none";
  elements.message.textContent = "";
  elements.message.className = "message";

  showMessage("Waiting for host to unveil cards...", "success");
  console.log(
    "🎮 Starting round",
    gameState.currentRound,
    "with numbers:",
    gameState.numbers
  );
  syncGameState("nextRound", null);
}

// Generate 4 random numbers between 1 and 10
function generateNumbers() {
  const numbers = [];
  for (let i = 0; i < 4; i++) {
    numbers.push(Math.floor(Math.random() * 10) + 1);
  }
  return numbers;
}

// Display cards
function displayCards() {
  const cards = elements.cardsContainer.querySelectorAll(".card");
  console.log(
    "🎴 DISPLAY CARDS called - cardsUnveiled:",
    gameState.cardsUnveiled,
    "numbers:",
    gameState.numbers
  );
  gameState.numbers.forEach((num, index) => {
    if (cards[index]) {
      if (gameState.cardsUnveiled) {
        console.log(`  Card ${index}: Showing number ${num}`);
        cards[index].textContent = num;
        cards[index].style.background =
          "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)";
      } else {
        console.log(`  Card ${index}: Hiding as ?`);
        cards[index].textContent = "?";
        cards[index].style.background =
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      }
    }
  });
}

// Hide cards
function hideCards() {
  console.log("🎴 HIDE CARDS called");
  const cards = elements.cardsContainer.querySelectorAll(".card");
  cards.forEach((card) => {
    card.textContent = "?";
    card.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  });
  console.log("🎴 HIDE CARDS completed - all cards set to ?");
}

// Start timer
function startTimer() {
  gameState.startTime = Date.now();

  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }

  gameState.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    elements.timer.textContent = `Time: ${elapsed}s`;
  }, 1000);
}

// Stop timer
function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}

// Handle player submission
function handleSubmit(player) {
  if (!gameState.roundActive) {
    showPlayerStatus("Round is not active", false);
    return;
  }

  if (gameState.roundWinner) {
    showPlayerStatus("This round is already won", false);
    return;
  }

  const expression = elements.myInput.value.trim();

  if (!expression) {
    showPlayerStatus("Please enter an expression!", false);
    return;
  }

  const result = validateExpression(expression, gameState.numbers);

  if (result.valid && result.equals24) {
    // Correct answer!
    gameState.roundWinner = player;
    incrementPlayerScore(player, 5);

    updateScores();
    showPlayerStatus("🎉 Correct! +5 points", true);
    showMessage("You win this round!", "success");

    disableInputs();
    stopTimer();
    gameState.roundActive = false;

    // Hide control buttons temporarily
    elements.nextRoundBtn.style.display = "none";
    elements.skipRoundBtn.style.display = "none";
    elements.finishGameBtn.style.display = "none";

    // Sync with remote player
    const submitData = {
      player: player,
      correct: true,
      score: getPlayerScore(player),
      timestamp: Date.now(),
    };

    if (gameState.useFirebase && gameState.firebaseRef) {
      database.ref(`games/${gameState.roomCode}`).update({
        lastSubmit: submitData,
        players: gameState.players,
        gameState: {
          currentRound: gameState.currentRound,
          numbers: [...gameState.numbers],
          roundActive: gameState.roundActive,
          roundWinner: gameState.roundWinner,
        },
      });
    } else {
      syncGameState("submit", submitData);
    }

    // Auto advance to next round after 2 seconds (host initiates)
    setTimeout(() => {
      if (gameState.isHost && !gameState.roundActive) {
        nextRound();
      }
    }, 2000);
  } else if (!result.valid) {
    showPlayerStatus(result.error, false);
  } else {
    showPlayerStatus(`Incorrect! Result is ${result.value}, not 24`, false);
  }
}

// Update applyRemoteSubmit for multi-player
function applyRemoteSubmit(data) {
  if (data.player && data.correct && !gameState.roundWinner) {
    gameState.roundWinner = data.player;

    if (data.player === gameState.playerNumber) {
      showPlayerStatus("🎉 Correct! +5 points", true);
    } else {
      showPlayerStatus(`Player ${data.player} got it first!`, false);
      showMessage(`Player ${data.player} wins this round!`, "success");
    }

    setPlayerScore(data.player, data.score);

    updateScores();
    stopTimer();
    disableInputs();
    gameState.roundActive = false;
    elements.nextRoundBtn.style.display = "none";
    elements.skipRoundBtn.style.display = "none";
    elements.finishGameBtn.style.display = "none";

    // Non-hosts will see the round auto-advance when host triggers nextRound
    // Show a brief message
    if (!gameState.isHost) {
      showMessage("Moving to next round...", "success");
    }
  }
}

// Validate expression
function validateExpression(expression, numbers) {
  try {
    // Extract numbers from expression
    const usedNumbers = [];
    let sanitized = expression.replace(/[\d]+/g, (match) => {
      usedNumbers.push(parseInt(match));
      return match;
    });

    // Check if all numbers are used exactly once
    const sortedUsed = usedNumbers.slice().sort((a, b) => a - b);
    const sortedRequired = numbers.slice().sort((a, b) => a - b);

    if (sortedUsed.length !== sortedRequired.length) {
      return {
        valid: false,
        error: "You must use all 4 numbers exactly once!",
      };
    }

    for (let i = 0; i < sortedUsed.length; i++) {
      if (sortedUsed[i] !== sortedRequired[i]) {
        return {
          valid: false,
          error: "You must use the exact numbers shown on the cards!",
        };
      }
    }

    // Check for invalid characters
    if (!/^[\d\s\+\-\*\/\(\)\.]+$/.test(expression)) {
      return {
        valid: false,
        error: "Only use numbers, +, -, *, /, and parentheses!",
      };
    }

    // Evaluate the expression
    const result = eval(expression);

    if (!isFinite(result)) {
      return { valid: false, error: "Invalid expression!" };
    }

    // Check if result equals 24 (with small tolerance for floating point)
    const equals24 = Math.abs(result - 24) < 0.0001;

    return { valid: true, equals24, value: result };
  } catch (error) {
    return { valid: false, error: "Invalid expression!" };
  }
}

// Show player status
function showPlayerStatus(message, isCorrect) {
  elements.myStatus.textContent = message;
  elements.myStatus.className = isCorrect
    ? "player-status correct"
    : "player-status incorrect";

  if (!isCorrect) {
    setTimeout(() => {
      elements.myStatus.textContent = "";
      elements.myStatus.className = "player-status";
    }, 3000);
  }
}

// Show message
function showMessage(text, type) {
  elements.message.textContent = text;
  elements.message.className = `message ${type}`;
}

// Update scores
function updateScores() {
  renderScoreBoard();
}

// Clear inputs
function clearInputs() {
  elements.myInput.value = "";
}

// Clear player statuses
function clearPlayerStatuses() {
  elements.myStatus.textContent = "";
  elements.myStatus.className = "player-status";
}

// Enable inputs
function enableInputs() {
  elements.myInput.disabled = false;
  elements.mySubmit.disabled = false;
}

// Disable inputs
function disableInputs() {
  elements.myInput.disabled = true;
  elements.mySubmit.disabled = true;
}

// End game
function endGame() {
  console.log("🏁 endGame() called!");
  stopTimer();
  gameState.roundActive = false;

  // Find winner(s) with highest score
  const playerNumbers = Object.keys(gameState.players).map(Number);
  console.log("Players:", playerNumbers);
  const scores = playerNumbers.map((num) => ({
    player: num,
    name: gameState.players[num].name || `Player ${num}`,
    score: getPlayerScore(num),
  }));

  console.log("Scores:", scores);
  scores.sort((a, b) => b.score - a.score);
  const maxScore = scores[0]?.score || 0;
  const winners = scores.filter((s) => s.score === maxScore);

  // Create congratulations message
  let congratsMessage = "";
  if (winners.length === 1) {
    congratsMessage = `🏆 Congratulations ${winners[0].name}! 🏆<br><span class="winner-subtitle">You are the champion with ${maxScore} points!</span>`;
  } else if (winners.length > 1) {
    const winnerNames = winners.map((w) => w.name).join(" & ");
    congratsMessage = `🤝 It's a tie! 🤝<br><span class="winner-subtitle">${winnerNames} tied with ${maxScore} points!</span>`;
  }

  elements.winnerAnnouncement.innerHTML = congratsMessage;
  console.log("Winner announcement set:", congratsMessage);

  // Display rankings
  const rankingsContainer = document.getElementById("final-rankings");
  console.log("Rankings container found:", !!rankingsContainer);
  if (rankingsContainer) {
    rankingsContainer.innerHTML = "";

    scores.forEach((player, index) => {
      const rankBox = document.createElement("div");
      rankBox.className = "rank-item";
      if (index === 0) rankBox.classList.add("first-place");
      if (index === 1) rankBox.classList.add("second-place");
      if (index === 2) rankBox.classList.add("third-place");

      const medal =
        index === 0
          ? "🥇"
          : index === 1
          ? "🥈"
          : index === 2
          ? "🥉"
          : `#${index + 1}`;

      rankBox.innerHTML = `
        <div class="rank-position">${medal}</div>
        <div class="rank-details">
          <div class="rank-name">${player.name}</div>
          <div class="rank-score">${player.score} points</div>
        </div>
      `;

      rankingsContainer.appendChild(rankBox);
    });
    console.log(`Added ${scores.length} rank items to rankings`);
  }

  console.log("Setting game over display to block");
  elements.gameOver.style.display = "block";
  elements.nextRoundBtn.style.display = "none";
  elements.skipRoundBtn.style.display = "none";
  elements.finishGameBtn.style.display = "none";
  elements.newGameBtn.style.display = gameState.isHost
    ? "inline-block"
    : "none";

  disableInputs();
}

// Initialize the game when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
