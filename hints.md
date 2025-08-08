# 🃏 UNO Game Development Hints

## 📋 Code Structure Overview

### Key Global Variables
- `deck[]` - Main draw pile
- `discardPile[]` - Cards that have been played
- `playerHand[]` & `opponentHand[]` - Player card collections
- `currentPlayer` - Tracks whose turn it is ("player" or "opponent")
- `direction` - Play direction (1 = clockwise, -1 = counter-clockwise)
- `gameActive` - Boolean flag to control game state
- `unoCalled` - Tracks if player called UNO

### Card Object Structure
```javascript
{
  color: "red|green|blue|yellow|wild",
  value: "0-9|skip|reverse|draw2|wild|wildDraw4"
}
```

## 🎯 Key Game Logic Functions

### `isCardPlayable(card)`
- Checks if a card can be played against the top discard card
- Returns `true` for wild cards, matching colors, or matching values
- **Hint**: This is your core validation function

### `handlePlayCard(e)`
- Main player interaction handler
- Validates playability before allowing moves
- **Important**: Checks UNO call requirement for second-to-last card
- Handles wild card color selection flow

### `nextTurn()`
- Switches between player and opponent
- Triggers opponent AI after 2-second delay
- **Key**: Only proceeds if `gameActive` is true

## 🤖 AI Opponent Logic

### `opponentTurn()`
- First tries to play any matching card
- If no match, draws a card and tries to play it
- Randomly selects colors for wild cards
- Automatically calls UNO when at 1 card

## 🎨 UI Rendering Tips

### Card Display
- Player cards show actual values with `data-testid` attributes
- Opponent cards are face-down (`.back` class)
- Playable cards get `.playable` class for visual feedback

### Event Handling
- Use event delegation on card containers
- Check for `.card` class and avoid `.back` cards
- Array.indexOf() to find card position in hand

## ⚠️ Common Pitfalls & Solutions

### 1. Empty Deck Handling
```javascript
if (deck.length === 0) {
  // Reshuffle discard pile (except top card)
  const topCard = discardPile.pop();
  deck = discardPile;
  discardPile = [topCard];
  shuffleDeck(deck);
}
```

### 2. Wild Card Flow
- Playing wild cards triggers color picker modal
- Game flow pauses until color selection
- `topCard.color` gets updated with chosen color

### 3. UNO Button Logic
```javascript
unoBtnEl.disabled = playerHand.length !== 2 || unoCalled;
```
- Only enabled when exactly 2 cards remain
- Disabled after being pressed once

### 4. Game End Conditions
- Check for empty hands after each card play
- Set `gameActive = false` to stop further actions
- Add restart button dynamically

## 🧪 Testing Considerations

### Unit Test Focus Areas
- Deck creation (108 cards, correct distribution)
- Card shuffle randomization
- Card playability logic
- Game state transitions

### Integration Testing
- Complete game flow from start to finish
- Action card effects (skip, reverse, draw2/4)
- Wild card color selection
- UNO call mechanics

## 🔧 Debugging Tips

### Console Logging
```javascript
console.log("Current player:", currentPlayer);
console.log("Top card:", discardPile[discardPile.length - 1]);
console.log("Player hand:", playerHand.map(c => `${c.color}-${c.value}`));
```

### Common Issues
1. **Cards not playing**: Check `isCardPlayable()` logic
2. **Turn not switching**: Verify `gameActive` flag
3. **Wild cards stuck**: Ensure color picker modal is properly handled
4. **Opponent not playing**: Check `setTimeout` in `nextTurn()`

## 📱 Browser Compatibility Notes

- Uses modern ES6+ features (arrow functions, const/let)
- DOM manipulation with `querySelector` and `addEventListener`
- No localStorage usage (good for embedding)
- Responsive CSS classes for mobile support

## 🎯 Performance Optimization

### Efficient Rendering
- Only call `renderGame()` after state changes
- Use `innerHTML = ""` to clear containers before rebuilding
- Cache DOM element references globally

### Memory Management
- Clear event listeners when restarting game
- Remove dynamically created elements (restart button)
- Avoid creating new arrays unnecessarily

## 🚀 Extension Ideas

### Easy Additions
- Score tracking across multiple games
- Sound effects for card plays
- Animation transitions
- Different difficulty AI levels

### Advanced Features
- Multiplayer support (WebSocket)
- Custom house rules
- Tournament mode
- Card play history

## 📝 Code Quality Guidelines

### Best Practices Used
- Separation of game logic and UI rendering
- Event delegation for dynamic content
- Consistent naming conventions
- Error handling for edge cases

### Maintainability
- Functions are focused and single-purpose
- Global state is well-organized
- Clear comments for complex logic
- Modular structure allows easy testing

---

*Happy coding! Remember to test edge cases thoroughly and keep the user experience smooth.* 🎮