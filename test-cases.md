
---

## ✅ UNO Game – Test Cases (Sentence Format)

### TC-001: Game starts correctly

When the game is loaded, it should initialize the game board by displaying the player and opponent hands with 7 cards each. The discard pile should begin with a valid number card (not a wild or action card).

---

### TC-002: Player can play a card that matches the color

If the player selects a card that matches the color of the top card in the discard pile, the card should be played successfully, and the turn should end.

---

### TC-003: Player can play a card that matches the value

If the player selects a card that matches the number or symbol (e.g., 7, Reverse) of the top card in the discard pile, the card should be played, and the turn should end.

---

### TC-004: Player cannot play an invalid card

If the player tries to play a card that does not match the color or value of the top card and is not a wild card, the game should reject the move, show a warning, and keep the card in the player’s hand without ending the turn.

---

### TC-005: Player draws a card and cannot play it

If the player has no playable cards and clicks the draw deck, one card should be added to their hand. If that card is also unplayable, the player’s turn should end automatically.

---

### TC-006: Player draws a card and can play it

If the player draws a card and it is valid (i.e., matches color or value), they should be allowed to play it immediately during the same turn.

---

### TC-007: Player plays a Skip card

When the player plays a "Skip" card, the opponent’s turn should be skipped, and the player should retain control in the next round of play.

---

### TC-008: Player plays a Reverse card

When a "Reverse" card is played, the direction of play should change immediately. In a two-player game, this effectively works like a Skip.

---

### TC-009: Player plays a Draw Two card

When the player plays a "Draw Two" card, the opponent must draw two cards and lose their turn. The player's turn resumes afterward.

---

### TC-010: Player plays a Wild card

When a "Wild" card is played, the game should prompt the player with a color picker modal to select the next active color before continuing the game.

---

### TC-011: Player plays a Wild Draw Four card

If the player plays a "Wild Draw Four" card, a color picker should appear allowing the player to choose a new color. The opponent should draw four cards and their turn should be skipped.

---

### TC-012: Player wins the game

When the player plays their final card, the game should display a message: “Player wins the game!” and show a "Play Again" button. No further turns should be processed.

---

### TC-013: Opponent wins the game

If the opponent plays their last card, the game should show the message: “Opponent wins the game!” and a "Play Again" button should appear. Game logic should stop.

---

### TC-014: Player wins with a Wild card

If the player's final card is a Wild or Wild Draw Four card, the game should prompt them to select a color, then declare the win and end the game once that is done.

---

### TC-015: Player calls UNO correctly

When the player plays down to two cards, the "UNO!" button should become active. If the player clicks it before playing their second-last card, a message should confirm: “You called UNO!” and the button should be disabled.

---

### TC-016: Player fails to call UNO

If the player plays a second-last card but does not click the "UNO!" button beforehand, the game should show a message like: “You must call UNO!” and prevent the move or apply a penalty (to be implemented).

---

### TC-017: Draw deck runs out

If the draw pile is completely exhausted during gameplay, the discard pile (except the topmost card) should be shuffled and used to recreate the draw deck. The game should continue smoothly.

---