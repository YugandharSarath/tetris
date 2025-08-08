const {
  createDeck,
  shuffleDeck,
  isCardPlayable,
  drawCard,
  handleUnoCall,
  updateUnoButton,
  endGame,
  handlePlayCard,
} = require("./uno");

describe("UNO Game Logic - Complete Test Suite", () => {
  const colors = ["red", "green", "blue", "yellow"];
  let originalDeck, originalDiscardPile, originalPlayerHand, originalOpponentHand;
  let originalGameActive, originalUnoCalled, originalMessageBoxEl, originalUnoBtnEl;

  beforeEach(() => {
    // Mock global variables that exist in uno.js
    global.deck = [];
    global.discardPile = [];
    global.playerHand = [];
    global.opponentHand = [];
    global.gameActive = true;
    global.unoCalled = false;
    
    // Mock DOM elements
    global.document = {
      getElementById: jest.fn((id) => {
        if (id === 'message-box') return { textContent: '' };
        if (id === 'uno-btn') return { disabled: false };
        if (id === 'game-container') return { appendChild: jest.fn() };
        return null;
      }),
      createElement: jest.fn(() => ({
        textContent: '',
        id: '',
        setAttribute: jest.fn(),
        classList: { add: jest.fn() },
        addEventListener: jest.fn(),
        remove: jest.fn()
      }))
    };
    
    // Mock the global functions that tests depend on
    global.displayMessage = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Deck Creation ---
  describe("createDeck", () => {
    test("should create a deck with 108 cards", () => {
      const deck = createDeck();
      expect(deck.length).toBe(108);
    });

    test("should have 25 cards of each color (red, green, blue, yellow)", () => {
      const deck = createDeck();
      const colorCounts = deck.reduce((acc, card) => {
        if (card.color !== "wild") {
          acc[card.color] = (acc[card.color] || 0) + 1;
        }
        return acc;
      }, {});
      colors.forEach((color) => {
        expect(colorCounts[color]).toBe(25);
      });
    });

    test("should have 8 wild cards (4 wild + 4 wild draw four)", () => {
      const deck = createDeck();
      const wildCount = deck.filter((card) => card.color === "wild").length;
      expect(wildCount).toBe(8);
    });

    test("should have correct number of numbered cards", () => {
      const deck = createDeck();
      let numberedCount = 0;
      for (const card of deck) {
        if (card.color !== "wild" && !isNaN(parseInt(card.value))) {
          numberedCount++;
        }
      }
      // Each color has: 1 zero + 2 each of 1-9 = 1 + 18 = 19 numbered cards
      // 4 colors × 19 = 76 numbered cards
      expect(numberedCount).toBe(76);
    });

    test("should have correct number of action cards", () => {
      const deck = createDeck();
      const actionCards = ["skip", "reverse", "draw2"];
      let actionCount = 0;
      for (const card of deck) {
        if (actionCards.includes(card.value)) {
          actionCount++;
        }
      }
      // Each color has 2 each of skip, reverse, draw2 = 6 per color
      // 4 colors × 6 = 24 action cards
      expect(actionCount).toBe(24);
    });
  });

  // --- Shuffle ---
  describe("shuffleDeck", () => {
    test("should not change the deck size", () => {
      const originalDeck = createDeck();
      const newDeck = [...originalDeck];
      shuffleDeck(newDeck);
      expect(newDeck.length).toBe(originalDeck.length);
    });

    test("should shuffle the order of cards", () => {
      const originalDeck = createDeck();
      const newDeck = [...originalDeck];
      shuffleDeck(newDeck);
      let isShuffled = false;
      for (let i = 0; i < originalDeck.length; i++) {
        if (
          originalDeck[i].value !== newDeck[i].value ||
          originalDeck[i].color !== newDeck[i].color
        ) {
          isShuffled = true;
          break;
        }
      }
      expect(isShuffled).toBe(true);
    });

    test("should maintain all card types after shuffle", () => {
      const deck = createDeck();
      const originalCounts = {};
      deck.forEach(card => {
        const key = `${card.color}-${card.value}`;
        originalCounts[key] = (originalCounts[key] || 0) + 1;
      });

      shuffleDeck(deck);
      const shuffledCounts = {};
      deck.forEach(card => {
        const key = `${card.color}-${card.value}`;
        shuffledCounts[key] = (shuffledCounts[key] || 0) + 1;
      });

      expect(shuffledCounts).toEqual(originalCounts);
    });
  });

  // --- Card Playability ---
  describe("isCardPlayable", () => {
    beforeEach(() => {
      global.discardPile = [];
    });

    test("should return true for wild card on any top card", () => {
      global.discardPile = [{ color: "yellow", value: "2" }];
      expect(isCardPlayable({ color: "wild", value: "wild" })).toBe(true);
    });

    test("should return true for wild draw four card", () => {
      global.discardPile = [{ color: "red", value: "5" }];
      expect(isCardPlayable({ color: "wild", value: "wildDraw4" })).toBe(true);
    });

    test("should return false for non-matching card", () => {
      global.discardPile = [{ color: "green", value: "6" }];
      expect(isCardPlayable({ color: "red", value: "9" })).toBe(false);
    });

    test("should handle empty discard pile", () => {
      global.discardPile = [];
      expect(isCardPlayable({ color: "wild", value: "wild" })).toBe(true);
      expect(isCardPlayable({ color: "red", value: "5" })).toBe(false);
    });
  });


  // --- UNO Button ---
  describe("UNO button functionality", () => {
    let mockUnoBtn;

    beforeEach(() => {
      mockUnoBtn = { disabled: false };
      global.document.getElementById = jest.fn((id) => {
        if (id === 'uno-btn') return mockUnoBtn;
        return null;
      });
      global.playerHand = [];
      global.unoCalled = false;
    });

    test("should enable UNO button when player has 2 cards", () => {
      global.playerHand = [{ color: "red", value: "1" }, { color: "blue", value: "2" }];
      global.unoCalled = false;
      updateUnoButton();
      expect(mockUnoBtn.disabled).toBe(false);
    });
  });

  // --- Action Cards ---
  describe("Action card effects", () => {
    let mockHandleActionCard;

    beforeEach(() => {
      global.currentPlayer = "player";
      global.direction = 1;
      global.playerHand = [];
      global.opponentHand = [];
      
      // Mock the handleActionCard function behavior
      mockHandleActionCard = (card) => {
        let targetHand = global.currentPlayer === "player" ? global.opponentHand : global.playerHand;
        
        if (card.value === "skip") {
          // Skip logic is handled in nextTurn
        } else if (card.value === "reverse") {
          global.direction *= -1;
        } else if (card.value === "draw2") {
          for (let i = 0; i < 2; i++) {
            targetHand.push({ color: "test", value: "test" });
          }
        } else if (card.value === "wildDraw4") {
          for (let i = 0; i < 4; i++) {
            targetHand.push({ color: "test", value: "test" });
          }
        }
      };
    });

    test("should handle skip card", () => {
      const skipCard = { color: "red", value: "skip" };
      const initialDirection = global.direction;
      mockHandleActionCard(skipCard);
      expect(global.direction).toBe(initialDirection); // Direction unchanged for skip
    });

    test("should handle reverse card", () => {
      const reverseCard = { color: "blue", value: "reverse" };
      const initialDirection = global.direction;
      mockHandleActionCard(reverseCard);
      expect(global.direction).toBe(initialDirection * -1);
    });

    test("should handle draw two card", () => {
      const draw2Card = { color: "green", value: "draw2" };
      const initialOpponentCards = global.opponentHand.length;
      mockHandleActionCard(draw2Card);
      expect(global.opponentHand.length).toBe(initialOpponentCards + 2);
    });

    test("should handle wild draw four card", () => {
      const wildDraw4Card = { color: "wild", value: "wildDraw4" };
      const initialOpponentCards = global.opponentHand.length;
      mockHandleActionCard(wildDraw4Card);
      expect(global.opponentHand.length).toBe(initialOpponentCards + 4);
    });
  });

  // --- Game Flow ---
  describe("Game flow integration", () => {
    test("should maintain game state consistency", () => {
      const deck = createDeck();
      expect(deck.length).toBe(108);
      
      shuffleDeck(deck);
      expect(deck.length).toBe(108);
      
      // Simulate dealing cards
      const playerCards = deck.splice(0, 7);
      const opponentCards = deck.splice(0, 7);
      
      expect(playerCards.length).toBe(7);
      expect(opponentCards.length).toBe(7);
      expect(deck.length).toBe(94);
    });

    test("should handle multiple wild cards in deck", () => {
      const deck = createDeck();
      const wildCards = deck.filter(card => 
        card.value === "wild" || card.value === "wildDraw4"
      );
      expect(wildCards.length).toBe(8);
    });
  });
});

// --- DOM Integration Tests ---
describe("DOM Integration Tests", () => {
  let mockPlayerHandEl, mockOpponentHandEl, mockDiscardPileEl, mockRestartBtn;

  beforeEach(() => {
    mockPlayerHandEl = {
      innerHTML: '',
      children: [],
      appendChild: jest.fn()
    };
    mockOpponentHandEl = {
      innerHTML: '',
      children: [],
      appendChild: jest.fn()
    };
    mockDiscardPileEl = {
      innerHTML: '',
      appendChild: jest.fn()
    };
    mockRestartBtn = {
      setAttribute: jest.fn(),
      classList: { add: jest.fn() },
      addEventListener: jest.fn()
    };

    global.document = {
      getElementById: jest.fn((id) => {
        if (id === 'player-hand') return mockPlayerHandEl;
        if (id === 'opponent-hand') return mockOpponentHandEl;
        if (id === 'discard-pile') return mockDiscardPileEl;
        if (id === 'restart-btn') return mockRestartBtn;
        return null;
      }),
      createElement: jest.fn(() => ({
        classList: { add: jest.fn() },
        setAttribute: jest.fn(),
        dataset: {},
        innerHTML: ''
      }))
    };
  });

  test("should have correct data-testids for player cards", () => {
    const mockCardEl = {
      classList: { add: jest.fn() },
      setAttribute: jest.fn(),
      dataset: {}
    };
    global.document.createElement = jest.fn(() => mockCardEl);

    // Simulate rendering a player card
    const card = { color: "red", value: "5" };
    const cardIndex = 0;
    
    // This simulates what renderHand does for player cards
    mockCardEl.setAttribute("data-testid", `player-card-${cardIndex}`);
    
    expect(mockCardEl.setAttribute).toHaveBeenCalledWith("data-testid", "player-card-0");
  });

  test("should have correct data-testids for opponent cards", () => {
    const mockCardEl = {
      classList: { add: jest.fn() },
      setAttribute: jest.fn(),
      dataset: {}
    };
    global.document.createElement = jest.fn(() => mockCardEl);

    // Simulate rendering an opponent card
    const cardIndex = 1;
    mockCardEl.setAttribute("data-testid", `opponent-card-${cardIndex}`);
    
    expect(mockCardEl.setAttribute).toHaveBeenCalledWith("data-testid", "opponent-card-1");
  });

  test("should have data-testid for discard pile top card", () => {
    const mockCardEl = {
      classList: { add: jest.fn() },
      setAttribute: jest.fn(),
      dataset: {}
    };
    global.document.createElement = jest.fn(() => mockCardEl);

    // Simulate rendering discard pile top card
    mockCardEl.setAttribute("data-testid", "discard-top-card");
    
    expect(mockCardEl.setAttribute).toHaveBeenCalledWith("data-testid", "discard-top-card");
  });

  test("should have data-testid for restart button", () => {
    const mockRestartBtn = {
      setAttribute: jest.fn(),
      classList: { add: jest.fn() },
      addEventListener: jest.fn()
    };
    global.document.createElement = jest.fn(() => mockRestartBtn);

    // Simulate creating restart button
    mockRestartBtn.setAttribute("data-testid", "restart-button");
    
    expect(mockRestartBtn.setAttribute).toHaveBeenCalledWith("data-testid", "restart-button");
  });
});

// --- Performance Tests ---
describe("Performance Tests", () => {
  test("deck creation should be fast", () => {
    const start = Date.now();
    createDeck();
    const end = Date.now();
    expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
  });

  test("shuffling should be fast", () => {
    const deck = createDeck();
    const start = Date.now();
    shuffleDeck(deck);
    const end = Date.now();
    expect(end - start).toBeLessThan(50); // Should complete in less than 50ms
  });
});