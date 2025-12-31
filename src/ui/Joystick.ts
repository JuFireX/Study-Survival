import * as pc from 'playcanvas';
import { GameContext } from '../core/GameContext';
import { JoystickComponent } from './components/JoystickComponent';

/**
 * 虚拟摇杆 (Joystick)
 * 
 * 职责:
 * 1. 处理触摸屏上的虚拟摇杆输入。
 * 2. 监听键盘输入 (WASD/方向键)。
 * 3. 统一输出移动向量。
 */
export class Joystick {
    private component: JoystickComponent;
    private app: pc.Application;

    public value = { x: 0, y: 0 };
    private touchInput = { x: 0, y: 0 };
    private _onMove: ((x: number, y: number) => void) | null = null;

    constructor() {
        this.component = new JoystickComponent();
        this.app = GameContext.getInstance().getApp();

        // 1. 处理触摸输入
        this.component.onMove = (x, y) => {
            this.touchInput.x = x;
            this.touchInput.y = y;
        };

        // 2. 注册每帧更新，处理键盘输入并合并结果
        this.app.on('update', this.update, this);
    }

    private update() {
        // 处理键盘输入
        let kx = 0;
        let ky = 0;
        const keyboard = this.app.keyboard;

        if (keyboard) {
            if (keyboard.isPressed(pc.KEY_W) || keyboard.isPressed(pc.KEY_UP)) ky -= 1;
            if (keyboard.isPressed(pc.KEY_S) || keyboard.isPressed(pc.KEY_DOWN)) ky += 1;
            if (keyboard.isPressed(pc.KEY_A) || keyboard.isPressed(pc.KEY_LEFT)) kx -= 1;
            if (keyboard.isPressed(pc.KEY_D) || keyboard.isPressed(pc.KEY_RIGHT)) kx += 1;
        }

        // 归一化键盘输入
        if (kx !== 0 || ky !== 0) {
            const len = Math.sqrt(kx * kx + ky * ky);
            kx /= len;
            ky /= len;
        }

        // 合并触摸和键盘输入
        const x = this.touchInput.x + kx;
        const y = this.touchInput.y + ky;

        // 检查值是否变化
        const oldX = this.value.x;
        const oldY = this.value.y;

        this.value.x = x;
        this.value.y = y;

        // 如果值有显著变化，触发回调
        if (Math.abs(x - oldX) > 0.001 || Math.abs(y - oldY) > 0.001) {
            this._onMove?.(x, y);
        }
    }

    public set onMove(callback: (x: number, y: number) => void) {
        this._onMove = callback;
    }

    public destroy() {
        this.component.destroy();
        this.app.off('update', this.update, this);
    }
}
