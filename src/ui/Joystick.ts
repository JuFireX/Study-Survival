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

    constructor() {
        this.component = new JoystickComponent();
        this.component.onMove = (x, y) => {
            this.value.x = x;
            this.value.y = y;
        };
    }

    public destroy() {
        this.component.destroy();
    }
}
