// Constants and game state variables
const colors = ["red", "green", "blue", "yellow"];
const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const actionCards = ["skip", "reverse", "draw2"];
const wildCards = ["wild", "wildDraw4"];

let deck = [];
let discardPile = [];
let playerHand = [];
let opponentHand = [];
let currentPlayer = "player";
let direction = 1; // 1 for clockwise, -1 for counter-clockwise
let unoCalled = false;
let gameActive = false;

// DOM elements
const drawDeckEl = document.getElementById("draw-deck");
const discardPileEl = document.getElementById("discard-pile");
const playerHandEl = document.getElementById("player-hand");
const opponentHandEl = document.getElementById("opponent-hand");
const messageBoxEl = document.getElementById("message-box");
const unoBtnEl = document.getElementById("uno-btn");
const turnDisplayEl = document.getElementById("turn-display");
const colorPickerModal = document.getElementById("color-picker-modal");

// Event Listeners
if (drawDeckEl) {
  drawDeckEl.addEventListener("click", handleDrawCard);
}
if (unoBtnEl) {
  unoBtnEl.addEventListener("click", handleUnoCall);
}
if (playerHandEl) {
  playerHandEl.addEventListener("click", handlePlayCard);
}
if (colorPickerModal) {
  colorPickerModal.addEventListener("click", handleColorSelection);
}

// Game Initialization
document.addEventListener("DOMContentLoaded", startGame);

function startGame() {
  gameActive = true;
  deck = createDeck();
  shuffleDeck(deck);

  // Clear hands and discard pile from previous game
  playerHand = [];
  opponentHand = [];
  discardPile = [];

  dealCards();
  unoCalled = false;
  if (unoBtnEl) {
    unoBtnEl.disabled = true;
  }

  removeRestartButton();

  // Start discard pile with a non-wild card
  let initialCard = drawCard();
  while (
    initialCard &&
    (initialCard.value === "wild" || initialCard.value === "wildDraw4")
  ) {
    deck.push(initialCard);
    shuffleDeck(deck);
    initialCard = drawCard();
  }
  if (initialCard) {
    discardPile.push(initialCard);
  } else {
    // Fallback in case deck is empty after shuffling wild cards back
    deck = createDeck();
    shuffleDeck(deck);
    initialCard = drawCard();
    discardPile.push(initialCard);
  }

  renderGame();
  displayMessage("Game started! Your turn.");
}

// Deck functions
function createDeck() {
  const newDeck = [];
  // Numbered cards
  for (const color of colors) {
    newDeck.push({ color, value: "0" });
    for (let i = 1; i <= 9; i++) {
      newDeck.push({ color, value: String(i) });
      newDeck.push({ color, value: String(i) });
    }
  }
  // Action cards
  for (const color of colors) {
    for (let i = 0; i < 2; i++) {
      newDeck.push({ color, value: "skip" });
      newDeck.push({ color, value: "reverse" });
      newDeck.push({ color, value: "draw2" });
    }
  }
  // Wild cards
  for (let i = 0; i < 4; i++) {
    newDeck.push({ color: "wild", value: "wild" });
    newDeck.push({ color: "wild", value: "wildDraw4" });
  }
  return newDeck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function drawCard() {
  if (deck.length === 0) {
    if (discardPile.length <= 1) {
      displayMessage("No cards left to draw!");
      gameActive = false;
      return null;
    }
    // Take all but the top card from discard pile to form a new deck
    const topCard = discardPile.pop();
    deck = discardPile;
    discardPile = [topCard];
    shuffleDeck(deck);
    displayMessage("Shuffling discard pile to create new deck.");
  }
  return deck.pop();
}

function dealCards() {
  for (let i = 0; i < 7; i++) {
    playerHand.push(drawCard());
    opponentHand.push(drawCard());
  }
}

// Rendering functions
function renderGame() {
  if (!gameActive) return;
  renderHand(playerHand, playerHandEl, "player");
  renderHand(opponentHand, opponentHandEl, "opponent");
  renderDiscardPile();
  updateUnoButton();
  updateTurnDisplay();
}

function renderHand(hand, handEl, owner) {
  if (!handEl) return;
  handEl.innerHTML = "";
  hand.forEach((card, index) => {
    const cardEl = document.createElement("div");
    cardEl.classList.add("card", card.color);
    
    // Add data-testid for cards
    if (owner === "player") {
      cardEl.setAttribute("data-testid", `player-card-${index}`);
      cardEl.dataset.color = card.color;
      cardEl.dataset.value = card.value;
      // Add playability class for visual feedback
      if (isCardPlayable(card)) {
        cardEl.classList.add("playable");
      }
    } else {
      cardEl.setAttribute("data-testid", `opponent-card-${index}`);
    }

    let cardContent;
    if (card.value === "skip") {
      cardContent = '<div class="card-icon">🚫</div>';
    } else if (card.value === "reverse") {
      cardContent = '<div class="card-icon">🔄</div>';
    } else if (card.value === "draw2") {
      cardContent = '<div class="card-icon">+2</div>';
    } else if (card.value === "wild") {
      cardContent = '<div class="card-content">WILD</div>';
      cardEl.classList.add("wild");
    } else if (card.value === "wildDraw4") {
      cardContent = '<div class="card-content">+4</div>';
      cardEl.classList.add("wild");
    } else {
      cardContent = `<div class="card-content">${card.value}</div>`;
    }

    cardEl.innerHTML = cardContent;

    if (owner === "opponent") {
      cardEl.classList.add("back");
      cardEl.innerHTML = "";
    }
    handEl.appendChild(cardEl);
  });
}

function renderDiscardPile() {
  if (!discardPileEl) return;
  discardPileEl.innerHTML = '<div class="discard-text">Discard Pile</div>';
  if (discardPile.length > 0) {
    const topCard = discardPile[discardPile.length - 1];
    const cardEl = document.createElement("div");
    // Use the topCard.color directly to display the chosen color
    // This will be "red", "green", "blue", or "yellow" if a wild card was played
    cardEl.classList.add("card", topCard.color);
    cardEl.dataset.color = topCard.color;
    cardEl.dataset.value = topCard.value;
    cardEl.setAttribute("data-testid", "discard-top-card");

    let cardContent;
    if (topCard.value === "skip") {
      cardContent = '<div class="card-icon">🚫</div>';
    } else if (topCard.value === "reverse") {
      cardContent = '<div class="card-icon">🔄</div>';
    } else if (topCard.value === "draw2") {
      cardContent = '<div class="card-icon">+2</div>';
    } else if (topCard.value === "wild") {
      cardContent = '<div class="card-content">WILD</div>';
      // Add a visual indicator for the wild card, but the classList already has the new color
    } else if (topCard.value === "wildDraw4") {
      cardContent = '<div class="card-content">+4</div>';
      // Add a visual indicator for the wild card, but the classList already has the new color
    } else {
      cardContent = `<div class="card-content">${topCard.value}</div>`;
    }
    cardEl.innerHTML = cardContent;

    discardPileEl.appendChild(cardEl);
  }
}

// Game logic
function isCardPlayable(card) {
  const topCard = discardPile[discardPile.length - 1];

  // Check if the discard pile is empty first.
  if (!topCard) {
    return card.color === "wild";
  }

  return (
    card.color === "wild" ||
    card.color === topCard.color ||
    card.value === topCard.value
  );
}

function updateUnoButton() {
  if (unoBtnEl) {
    unoBtnEl.disabled = playerHand.length !== 2 || unoCalled;
  }
}

function updateTurnDisplay() {
  if (turnDisplayEl) {
    turnDisplayEl.textContent =
      currentPlayer === "player" ? "Your Turn" : "Opponent's Turn";
  }
}

function handlePlayCard(e) {
  if (currentPlayer !== "player" || !gameActive) return;

  const cardEl = e.target.closest(".card");
  if (!cardEl || cardEl.classList.contains("back")) return;

  const cardIndex = Array.from(playerHandEl.children).indexOf(cardEl);
  const cardToPlay = playerHand[cardIndex];

  if (!isCardPlayable(cardToPlay)) {
    displayMessage(
      "That card cannot be played. Please play a matching card or draw a new one."
    );
    return;
  }

  if (playerHand.length === 2 && !unoCalled) {
    displayMessage(
      "You must call UNO! before playing your second-to-last card."
    );
    return;
  }

  playerHand.splice(cardIndex, 1);
  discardPile.push(cardToPlay);

  // Reset unoCalled flag after a card is played
  unoCalled = false;

  // Check for winning conditions after playing the card
  if (playerHand.length === 0) {
    endGame("Player");
    return;
  }

  // Handle wild cards. The game logic continues in the color selection handler.
  if (cardToPlay.color === "wild" || cardToPlay.value === "wildDraw4") {
    showColorPicker();
    return;
  }

  // Handle action cards and proceed to the next turn
  handleActionCard(cardToPlay);
  nextTurn();
}

function handleDrawCard() {
  if (currentPlayer !== "player" || !gameActive) return;

  const card = drawCard();
  if (!card) return;

  playerHand.push(card);
  displayMessage(`You drew a card.`);

  // If the drawn card is playable, allow the player to play it
  if (isCardPlayable(card)) {
    displayMessage(`You drew a playable card. You can play it or keep it.`);
  } else {
    nextTurn();
  }
  renderGame();
}

function handleUnoCall() {
  if (playerHand.length === 2 && currentPlayer === "player" && gameActive) {
    unoCalled = true;
    displayMessage("You called UNO!");
    if (unoBtnEl) {
      unoBtnEl.disabled = true;
    }
  } else if (playerHand.length === 1) {
    displayMessage("Too late! You must call UNO when you have two cards.");
  } else {
    displayMessage("You can only call UNO when you have two cards left.");
  }
}

function handleActionCard(card) {
  let targetHand = currentPlayer === "player" ? opponentHand : playerHand;

  if (card.value === "skip") {
    displayMessage("Skip! Turn is skipped.");
    nextTurn();
  } else if (card.value === "reverse") {
    direction *= -1;
    displayMessage("Reverse! Direction of play is now reversed.");
  } else if (card.value === "draw2") {
    displayMessage("Draw Two! Opponent must draw 2 cards.");
    for (let i = 0; i < 2; i++) {
      const drawn = drawCard();
      if (drawn) {
        targetHand.push(drawn);
      }
    }
    nextTurn();
  } else if (card.value === "wildDraw4") {
    displayMessage("Wild Draw Four! Opponent must draw 4 cards.");
    for (let i = 0; i < 4; i++) {
      const drawn = drawCard();
      if (drawn) {
        targetHand.push(drawn);
      }
    }
    nextTurn();
  }
}

function showColorPicker() {
  if (colorPickerModal) {
    colorPickerModal.style.display = "flex";
  }
}

function hideColorPicker() {
  if (colorPickerModal) {
    colorPickerModal.style.display = "none";
  }
}

function handleColorSelection(e) {
  const selectedColor = e.target.dataset.color;
  if (selectedColor) {
    const topCard = discardPile[discardPile.length - 1];
    if (topCard) {
      topCard.color = selectedColor;
      renderDiscardPile();
      hideColorPicker();
      displayMessage(`Wild card played. The new color is ${selectedColor}.`);

      // Check if this was the last card and the player won
      if (playerHand.length === 0) {
        endGame("Player");
        return;
      }

      // Check for wild draw 4
      if (topCard.value === "wildDraw4") {
        handleActionCard(topCard);
      } else if (gameActive) {
        // Only call next turn if the game is still active
        nextTurn();
      }
    }
  }
}

function nextTurn() {
  if (!gameActive) {
    // If the game is not active, do not proceed with the next turn
    return;
  }

  currentPlayer = currentPlayer === "player" ? "opponent" : "player";

  // Opponent turn logic
  if (currentPlayer === "opponent") {
    setTimeout(opponentTurn, 2000);
  }

  renderGame();
  displayMessage(`${currentPlayer === "player" ? "Your" : "Opponent's"} turn.`);
}

function opponentTurn() {
  if (currentPlayer !== "opponent" || !gameActive) return;

  let playedCard = false;
  let cardToPlay;

  // Check for playable cards
  for (let i = 0; i < opponentHand.length; i++) {
    if (isCardPlayable(opponentHand[i])) {
      cardToPlay = opponentHand.splice(i, 1)[0];
      discardPile.push(cardToPlay);
      playedCard = true;
      break;
    }
  }

  // If no playable card, draw one
  if (!playedCard) {
    const newCard = drawCard();
    if (newCard) {
      opponentHand.push(newCard);
      displayMessage("Opponent drew a card.");
      // If the drawn card is playable, play it
      if (isCardPlayable(newCard)) {
        cardToPlay = opponentHand.pop();
        discardPile.push(cardToPlay);
        playedCard = true;
        displayMessage("Opponent drew and played a card.");
      } else {
        displayMessage("Opponent drew and kept a card.");
      }
    }
  }

  // Check for UNO
  if (opponentHand.length === 1) {
    displayMessage("Opponent called UNO!");
  }

  // Check for opponent win
  if (opponentHand.length === 0) {
    endGame("Opponent");
    return;
  }

  // Handle action cards played by opponent only if a card was played
  if (playedCard) {
    if (cardToPlay.color === "wild" || cardToPlay.value === "wildDraw4") {
      const newColor = colors[Math.floor(Math.random() * colors.length)];
      discardPile[discardPile.length - 1].color = newColor;
      displayMessage(`Opponent played a wild card. New color is ${newColor}.`);
    }
    handleActionCard(cardToPlay);
  }

  renderGame();
  if (gameActive) {
    nextTurn();
  }
}

function endGame(winner) {
  gameActive = false;
  displayMessage(`${winner} wins the game!`);

  // Add a 'Play Again' button
  const restartBtn = document.createElement("button");
  restartBtn.textContent = "Play Again";
  restartBtn.id = "restart-btn";
  restartBtn.setAttribute("data-testid", "restart-button");
  restartBtn.classList.add("control-btn");
  restartBtn.addEventListener("click", startGame);

  const gameContainer = document.getElementById("game-container");
  if (gameContainer) {
    gameContainer.appendChild(restartBtn);
  }
}

function removeRestartButton() {
  const restartBtn = document.getElementById("restart-btn");
  if (restartBtn) {
    restartBtn.remove();
  }
}

function displayMessage(msg) {
  if (messageBoxEl) {
    messageBoxEl.textContent = msg;
  }
}

if (typeof module !== "undefined") {
  module.exports = {
    createDeck,
    shuffleDeck,
    isCardPlayable,
    drawCard,
    handleUnoCall,
    updateUnoButton,
    endGame,
    handlePlayCard,
  };
}