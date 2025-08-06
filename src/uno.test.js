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

describe("UNO Game Logic - Extended Test Suite", () => {
  const colors = ["red", "green", "blue", "yellow"];
  let discardPile = [];
  let deck = [];

  beforeEach(() => {
    discardPile = [];
    deck = [];
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

    test("should have 8 wild cards", () => {
      const deck = createDeck();
      const wildCount = deck.filter((card) => card.color === "wild").length;
      expect(wildCount).toBe(8);
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
  });

  // --- Card Playability ---
  describe("isCardPlayable", () => {
    test("should return true for wild card", () => {
      discardPile.push({ color: "yellow", value: "2" });
      expect(isCardPlayable({ color: "wild", value: "wild" })).toBe(true);
    });

    test("should return false for non-matching card", () => {
      discardPile.push({ color: "green", value: "6" });
      expect(isCardPlayable({ color: "red", value: "9" })).toBe(false);
    });
  });

  // --- Game Logic Extensions ---
  describe("Gameplay Actions", () => {
    test("should reshuffle discard pile into deck when empty", () => {
      discardPile = [
        { color: "red", value: "5" },
        { color: "blue", value: "7" },
        { color: "yellow", value: "reverse" },
      ];
      deck = [];
      const card = drawCard();
      expect(card).toBeDefined();
    });
  });
});
