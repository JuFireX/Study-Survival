import * as pc from 'playcanvas';
import { Joystick } from '../../ui/Joystick';

/**
 * 玩家控制器
 * 处理玩家的移动输入和旋转。
 */
export class PlayerController extends pc.ScriptType {
    joystick: Joystick | null = null;
    speed: number = 10;

    initialize() {
        // 初始化逻辑
    }

    /**
     * 设置依赖
     * @param joystick 虚拟摇杆实例
     */
    setup(joystick: Joystick) {
        this.joystick = joystick;
    }

    update(dt: number) {
        let x = 0;
        let y = 0;

        // Joystick Input
        if (this.joystick) {
            x += this.joystick.value.x;
            y += this.joystick.value.y;
        }

        // Keyboard Input (WASD / Arrows)
        if (this.app.keyboard) {
            if (this.app.keyboard.isPressed(pc.KEY_LEFT) || this.app.keyboard.isPressed(pc.KEY_A)) {
                x -= 1;
            }
            if (this.app.keyboard.isPressed(pc.KEY_RIGHT) || this.app.keyboard.isPressed(pc.KEY_D)) {
                x += 1;
            }
            if (this.app.keyboard.isPressed(pc.KEY_UP) || this.app.keyboard.isPressed(pc.KEY_W)) {
                y -= 1;
            }
            if (this.app.keyboard.isPressed(pc.KEY_DOWN) || this.app.keyboard.isPressed(pc.KEY_S)) {
                y += 1;
            }
        }

        if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
            // 映射输入到世界坐标：
            // 屏幕 Y+ (下) -> 世界 Z+ (后)
            // 屏幕 Y- (上) -> 世界 Z- (前)
            const move = new pc.Vec3(x, 0, y);

            // 归一化向量，防止对角线移动速度过快
            if (move.length() > 1) {
                move.normalize();
            }

            move.mulScalar(this.speed * dt);
            this.entity.translate(move);

            // 简单的朝向控制
            // this.entity.lookAt(this.entity.getPosition().clone().add(move));
        }
    }
}
