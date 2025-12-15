import * as pc from 'playcanvas';
import { Joystick } from '../ui/Joystick';

export class PlayerController extends pc.ScriptType {
    joystick: Joystick | null = null;
    speed: number = 10;

    initialize() {
        // Init logic if needed
    }

    setup(joystick: Joystick) {
        this.joystick = joystick;
    }

    update(dt: number) {
        if (!this.joystick) return;

        const x = this.joystick.value.x;
        const y = this.joystick.value.y; // Screen Y (Down is positive)

        if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
            // Map Screen Y+ (Down) to World Z+ (Backward)
            // Screen Y- (Up) to World Z- (Forward)
            const move = new pc.Vec3(x, 0, y);

            // Normalize so diagonal isn't faster
            if (move.length() > 1) {
                move.normalize();
            }

            move.mulScalar(this.speed * dt);
            this.entity.translate(move);

            // Rotate to face direction
            // const targetAngle = Math.atan2(x, y) * pc.math.RAD_TO_DEG;
            // this.entity.setEulerAngles(0, targetAngle, 0);
        }
    }
}


