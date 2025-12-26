# UI Module API Documentation

This document describes the public interfaces and usage of the UI components in `src/ui`.

## 1. Joystick (Virtual Stick)

**Class:** `Joystick` (Wrapper) / `JoystickComponent` (Implementation)
**Path:** `src/ui/Joystick.ts`

Controls player movement input.

### Public Methods

- **constructor()**: Creates the joystick DOM elements.
- **destroy()**: Removes DOM elements and event listeners.

### Properties

- **value**: `{ x: number, y: number }`
  - Current input vector.
  - Normalized to length 0 or 1 (Direction only, no linear speed variation).
  - `x`: -1 to 1
  - `y`: -1 to 1

### Usage

```typescript
const joystick = new Joystick();
// In game loop:
const moveDir = joystick.value;
player.move(moveDir.x, moveDir.y);
```

---

## 2. HUD (Heads-Up Display)

**Class:** `HUD`
**Path:** `src/ui/HUD.ts`

Manages the main game interface (Health, Exp, Inventory).

### Components

- **StatusBars**: Top-left. Shows Experience (Top) and Health (Bottom).
- **Inventory**: Top-right. Shows acquired Buffs and Weapons.

### Public Methods

- **constructor()**: Initializes HUD and binds to EventBus events.
- **destroy()**: Cleans up DOM and listeners.
- **addItem(id: string, icon: string, rarity: string)**: Adds an item to the inventory display.
  - `id`: Unique item ID.
  - `icon`: Display character (e.g. 'A', 'S').
  - `rarity`: 'common' | 'rare' | 'epic' | 'legendary'.
- **removeItem(id: string)**: Removes an item from inventory.

### Event Listeners (via EventBus)

- `ui:updateHealth`: Updates Health Bar.
- `ui:updateExp`: Updates Experience Bar.
- `player:statsChanged`: Updates Health (Stats panel removed).
- `player:levelUp`: Updates Level display.

---

## 3. SkillSelectUI (Card Selection)

**Class:** `SkillSelectUI`
**Path:** `src/ui/SkillSelectUI.ts`

Displays the Level Up reward selection screen with 3D flip cards.

### Card Types

1.  **Buff**: Front shows buff details. Back shows Challenge Question. Buttons: Flip, Select, Discard.
2.  **Weapon**: Front shows weapon details. Back shows Challenge Question. Buttons: Flip, Select, Discard.
3.  **Question**: Front shows Question difficulty. Back shows Reward info. Buttons: Select, Discard.

### Public Methods

- **show(cards: Card[], callback: (card: Card | null) => void)**:
  - Displays the UI with the given cards.
  - `callback`: Called when user selects a card or skips (null).
- **hide()**: Hides the UI.

### Interaction Flow

- **Flip**: Toggles card side (Buff/Weapon only).
- **Select**: Triggers callback with selected card and closes UI.
- **Discard**: Removes the specific card from view. If all cards discarded, closes UI with `null`.

---

## 4. FloatingTextManager

**Class:** `FloatingTextManager`
**Path:** `src/ui/FloatingTextManager.ts`

Manages damage numbers and other floating text.

### Public Methods

- **createDamageText(x: number, y: number, damage: number, isCrit: boolean)**: Spawns damage number.
- **createHealText(x: number, y: number, amount: number)**: Spawns healing number.
- **update(cameraX: number, cameraY: number)**: Updates positions of all active texts based on camera.

---

## Directory Structure

```
src/ui/
├── components/          # DOM Implementation details
│   ├── FloatingTextComponent.ts
│   ├── HUDStatusBars.ts # HP & Exp Bars
│   ├── HUDInventory.ts  # Buff/Weapon Icons
│   ├── JoystickComponent.ts
│   ├── QuestionUIComponent.ts
│   └── SkillSelectUIComponent.ts
├── API.md               # This file
├── FloatingTextManager.ts
├── HUD.ts
├── Joystick.ts
├── QuestionUI.ts
├── SkillSelectUI.ts
└── ...
```
