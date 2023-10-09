# tetris-js

![Tetris Gameplay 1](/readme/tetris-1.png)

![Tetris Gameplay 2](/readme/tetris-2.png)

A simple implementation of the game Tetris using Vanilla Javascript, HTML, and CSS.

- Super Rotation System (SRS)
- Lock Delay
- Customizable keybinds
- Customizable game parameters
- ARR and DAS

## How to Play

Go to [https://khusyasy.com/tetris-js/](https://khusyasy.com/tetris-js/) to play the game.

You can also play locally, clone this repository and opening `index.html` in your browser or by using `npx serve .` in the project directory.

### Default Controls

| Action     | Name       | Keybind          |
| ---------- | ---------- | ---------------- |
| Move Left  | `mv_left`  | <kbd>a</kdb>     |
| Move Right | `mv_right` | <kbd>d</kdb>     |
| Soft Drop  | `softdrop` | <kbd>w</kdb>     |
| Hard Drop  | `harddrop` | <kbd>s</kdb>     |
| Rotate CCW | `rot_ccw`  | <kbd>←</kdb>     |
| Rotate CW  | `rot_cw`   | <kbd>→</kdb>     |
| Rotate 180 | `rot_180`  | <kbd>↑</kdb>     |
| Hold       | `hold`     | <kbd>Shift</kdb> |

You can open the keybinds menu by clicking the `Change Keybinds` button on the bottom of the screen.

![Open Keybinds Menu](/readme/keybinds-1.png)

Change the Keybinds mode to `Custom` to change the keybinds. And click on the keybinds you want to change, then press the key you want to bind to that action.

![Change Keybinds](/readme/keybinds-2.png)

The keybinds will be saved to your browser's local storage. Even when you change it back to `Default`, the keybinds will still be saved.

### Custom Game Parameters

Advanced players should be familiar.

![Custom Game Parameters](/readme/parameters-1.png)
