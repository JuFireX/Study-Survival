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
        if (!this.joystick) return;

        const x = this.joystick.value.x;
        const y = this.joystick.value.y; // 屏幕 Y 轴（向下为正）

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

            // 如果需要，可以让角色朝向移动方向
            // const targetAngle = Math.atan2(x, y) * pc.math.RAD_TO_DEG;
            // this.entity.setEulerAngles(0, targetAngle, 0);
        }
    }
}
