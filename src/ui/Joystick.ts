import { JoystickComponent } from './components/JoystickComponent';

/**
 * 虚拟摇杆
 * 提供触摸和鼠标输入的模拟摇杆，用于控制角色移动。
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
