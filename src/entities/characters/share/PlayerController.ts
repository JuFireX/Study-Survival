import * as pc from 'playcanvas';
import { Joystick } from '../../../ui/Joystick';

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
        if (!this.joystick) return;

        const x = this.joystick.value.x;
        const y = this.joystick.value.y;

        if (Math.abs(x) > 0.01 || Math.abs(y) > 0.01) {
            const pos = this.entity.getPosition();
            
            // Assume Top-Down view: X is horizontal, Z is vertical (forward/back)
            // Joystick Y+ is Up (Screen), which maps to World Z- (Forward)
            const moveX = x * this.speed * dt;
            const moveZ = -y * this.speed * dt;

            this.entity.setPosition(pos.x + moveX, pos.y, pos.z + moveZ);

            // Rotate towards movement direction
            // atan2(y, x) -> but we are mapping (x, -y)
            const angle = Math.atan2(moveX, moveZ); 
            // We can use lookAt for simplicity
            const lookTarget = new pc.Vec3(pos.x + moveX, pos.y, pos.z + moveZ);
            this.entity.lookAt(lookTarget);
        }
    }

    public setJoystick(joystick: Joystick) {
        this.joystick = joystick;
    }
}
