import * as pc from 'playcanvas';
import { Joystick } from '../../../ui/Joystick';
import { ScriptRegistry } from '../../../core/ScriptRegistry';

/**
 * 玩家控制器 (PlayerController)
 * 
 * 职责:
 * 1. 监听玩家输入 (键盘, 虚拟摇杆)，控制玩家移动。
 * 2. 处理玩家的动画状态机切换 (Idle, Run, Attack)。
 * 3. 与 CharacterSystem 交互，更新玩家状态。
 * 4. 处理与环境和敌人的碰撞逻辑。
 */
export class PlayerController extends pc.ScriptType {
    private joystick: Joystick | null = null;
    private speed: number = 8; // Default speed

    initialize() {
        // Script initialization
    }

    update(dt: number) {
        let x = 0;
        let y = 0;

        if (this.joystick) {
            x += this.joystick.value.x;
            y += this.joystick.value.y;
        }

        const keyboard = this.app?.keyboard;
        if (keyboard) {
            if (keyboard.isPressed(pc.KEY_LEFT) || keyboard.isPressed(pc.KEY_A)) {
                x -= 1;
            }
            if (keyboard.isPressed(pc.KEY_RIGHT) || keyboard.isPressed(pc.KEY_D)) {
                x += 1;
            }
            if (keyboard.isPressed(pc.KEY_UP) || keyboard.isPressed(pc.KEY_W)) {
                y -= 1;
            }
            if (keyboard.isPressed(pc.KEY_DOWN) || keyboard.isPressed(pc.KEY_S)) {
                y += 1;
            }
        }

        if (Math.abs(x) <= 0.1 && Math.abs(y) <= 0.1) return;

        const len = Math.hypot(x, y);
        const nx = len > 1 ? x / len : x;
        const ny = len > 1 ? y / len : y;

        const pos = this.entity.getPosition();
        const moveX = nx * this.speed * dt;
        const moveZ = ny * this.speed * dt;

        this.entity.setPosition(pos.x + moveX, pos.y, pos.z + moveZ);

        const lookAhead = 0.5;
        this.entity.lookAt(pos.x + nx * lookAhead, pos.y, pos.z + ny * lookAhead);
    }

    public setup(joystick: Joystick) {
        this.joystick = joystick;
    }

    public setJoystick(joystick: Joystick) {
        this.setup(joystick);
    }
}

ScriptRegistry.register(PlayerController as any, 'playerController');
