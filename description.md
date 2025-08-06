

---

## 🃏 UNO Game – Requirements & Test Cases

---

### ✅ Core Requirements

#### 1. **Game Initialization**

* Start with a shuffled deck of 108 UNO cards.
* Deal **7 cards** to the player and the opponent.
* Discard pile begins with **one non-action, non-wild card**.

#### 2. **Gameplay Mechanics**

* Players can play a card if it matches the **color, number, or symbol** of the top discard card.
* **Wild cards** are playable at any time.

#### 3. **Action Cards**

* **Skip**: Skips the next player's turn.
* **Reverse**: Reverses play direction.
* **Draw Two**: Next player draws two cards and skips their turn.
* **Wild**: Lets the player choose the next color.
* **Wild Draw Four**: Opponent draws four cards and skips turn. Can only be played if no playable cards are available.

#### 4. **Drawing Cards**

* If no playable card is available, draw a card from the deck.
* If playable, the drawn card may be played immediately. Otherwise, the turn ends.

#### 5. **UNO! Call**

* When a player has **2 cards**, they must click **"UNO!"**.
* If they fail, a penalty (to be implemented) is applied.

#### 6. **Winning**

* The player who plays all their cards first wins.
* A winning message and **"Play Again"** button are shown.

#### 7. **User Interface**

* Player’s cards are visible; opponent's cards are hidden (face down).
* Display discard pile and draw deck.
* Message log shows game status.
* "UNO!" button appears when the player has 2 cards.

---

### ⚠️ Edge Cases & Constraints

* **Empty Deck**: When draw deck is empty, shuffle discard pile (excluding top card) to refill it.
* **Starting Card**: Must be a valid non-action, non-wild number card.
* **Wild Play**: On wild card use, prompt player to pick a color before continuing.
* **Invalid Moves**: Disallowed via UI and game logic.
* **Game Over**: Turn-based actions stop. Show winner and restart option.
* **UNO Button Visibility**: Enabled only when 2 cards remain; disabled once pressed.

---









