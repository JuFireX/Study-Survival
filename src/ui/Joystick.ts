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

        // 总是触发事件，以便系统每帧都能获取输入状态（或者只在变化时触发？）
        // CharacterSystem 需要每帧持续移动，所以最好是持续触发或者由 CharacterSystem 自己持有状态
        // 既然 CharacterSystem 每一帧都跑，它只需要知道当前的 Input 值。
        // 但如果我们想完全解耦，Joystick 可以每帧广播 'input:move'，或者 CharacterSystem 每一帧来问（但这又耦合了）。
        // 这种情况下，Joystick 更新一个全局的 InputState 单例，或者广播事件是比较好的。
        // 为了避免每帧产生事件对象，我们只在值变化时广播，或者 CharacterSystem 自己缓存状态。
        // 但是 CharacterSystem 的 update 是每帧跑的，如果 Joystick 停了，CharacterSystem 也得知道停了。

        // 方案：Joystick 依然负责产生数据，通过 EventBus 广播 'input:joystick'
        // 为了性能，只在值变化时广播。如果没变化，接收方保持上一次的值？
        // 不，如果是键盘，你按住不放，值是不变的 (1, 0)，CharacterSystem 每一帧都要用这个 (1, 0) 来移动。
        // 所以 CharacterSystem 需要缓存这个值。

        if (Math.abs(x - oldX) > 0.001 || Math.abs(y - oldY) > 0.001) {
            GameContext.getInstance().getEventBus().fire('input:joystick', x, y);
        }
    }

    public setVisible(visible: boolean) {
        this.component.setVisible(visible);
    }

    public destroy() {
        this.component.destroy();
        this.app.off('update', this.update, this);
    }
}
