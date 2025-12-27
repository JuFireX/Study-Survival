import { JoystickComponent } from './components/JoystickComponent';

/**
 * 虚拟摇杆 (Joystick)
 * 
 * 职责:
 * 1. 处理触摸屏上的虚拟摇杆输入。
 * 2. 计算摇杆的偏移量和方向向量。
 * 3. 将输入转换为游戏内的移动指令。
 */
export class Joystick {
    private component: JoystickComponent;

    // 对外暴露的输入值 (-1 到 1)
    public value = { x: 0, y: 0 };

    // 内部状态
    private touchInput = { x: 0, y: 0 };
    private keyboardInput = { x: 0, y: 0 };
    private keyState = { w: false, a: false, s: false, d: false };

    // 外部回调
    private _onMove: ((x: number, y: number) => void) | null = null;

    private boundKeyDown: (e: KeyboardEvent) => void;
    private boundKeyUp: (e: KeyboardEvent) => void;

    constructor() {
        this.component = new JoystickComponent();

        // 1. 处理触摸输入
        this.component.onMove = (x, y) => {
            this.touchInput.x = x;
            this.touchInput.y = y;
            this.updateOutput();
        };

        // 2. 处理键盘输入 (WASD)
        this.boundKeyDown = this.onKeyDown.bind(this);
        this.boundKeyUp = this.onKeyUp.bind(this);

        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);
    }

    private onKeyDown(e: KeyboardEvent) {
        this.updateKeyState(e.key, true);
    }

    private onKeyUp(e: KeyboardEvent) {
        this.updateKeyState(e.key, false);
    }

    private updateKeyState(key: string, isPressed: boolean) {
        const lowerKey = key.toLowerCase();
        let changed = false;

        if (lowerKey === 'w' || lowerKey === 'arrowup') { this.keyState.w = isPressed; changed = true; }
        if (lowerKey === 'a' || lowerKey === 'arrowleft') { this.keyState.a = isPressed; changed = true; }
        if (lowerKey === 's' || lowerKey === 'arrowdown') { this.keyState.s = isPressed; changed = true; }
        if (lowerKey === 'd' || lowerKey === 'arrowright') { this.keyState.d = isPressed; changed = true; }

        if (changed) {
            this.updateKeyboardInput();
        }
    }

    private updateKeyboardInput() {
        let x = 0;
        let y = 0;

        if (this.keyState.w) y -= 1;
        if (this.keyState.s) y += 1;
        if (this.keyState.a) x -= 1;
        if (this.keyState.d) x += 1;

        const len = Math.sqrt(x * x + y * y);
        if (len > 0) {
            this.keyboardInput.x = x / len;
            this.keyboardInput.y = y / len;
        } else {
            this.keyboardInput.x = 0;
            this.keyboardInput.y = 0;
        }

        this.updateOutput();
    }

    private updateOutput() {
        // 合并触摸和键盘输入
        const x = this.touchInput.x + this.keyboardInput.x;
        const y = this.touchInput.y + this.keyboardInput.y;

        this.value.x = x;
        this.value.y = y;

        this._onMove?.(x, y);
    }

    public set onMove(callback: (x: number, y: number) => void) {
        this._onMove = callback;
    }

    public destroy() {
        this.component.destroy();
        window.removeEventListener('keydown', this.boundKeyDown);
        window.removeEventListener('keyup', this.boundKeyUp);
    }
}
