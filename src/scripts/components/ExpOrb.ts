import * as pc from 'playcanvas';
import { EventBus } from '../../core/EventBus';
import { GameContext } from '../../core/GameContext';

export class ExpOrb extends pc.ScriptType {
    public value: number = 10;
    private player!: pc.Entity;
    private moveSpeed: number = 8;
    private isCollecting: boolean = false;

    initialize() {
        this.player = GameContext.getInstance().getPlayer()!;
    }

    update(dt: number) {
        if (!this.player) return;

        const pos = this.entity.getPosition();
        const playerPos = this.player.getPosition();
        const dist = pos.distance(playerPos);

        // Magnet range (hardcoded or from stats)
        // We can get pickupRange from PlayerStats if we want to be precise
        const pickupRange = 3.0;

        if (dist < pickupRange) {
            this.isCollecting = true;
        }

        if (this.isCollecting) {
            const dir = new pc.Vec3().sub2(playerPos, pos).normalize();
            this.entity.translate(dir.mulScalar(this.moveSpeed * dt));

            if (dist < 0.5) {
                this.collect();
            }
        }
    }

    collect() {
        EventBus.getInstance().fire('player:gainExp', this.value);
        this.entity.destroy();
    }
}
