import * as pc from 'playcanvas';
import { EventBus } from '../../core/EventBus';
import { GameContext } from '../../core/GameContext';
import { GameplayConfig } from '../../config/gameplay';

export class ExpOrb extends pc.ScriptType {
    public value: number = GameplayConfig.Drops.ExpOrb.Value;
    private player!: pc.Entity;
    private moveSpeed: number = GameplayConfig.Drops.ExpOrb.MoveSpeed;
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
        const pickupRange = GameplayConfig.Drops.ExpOrb.PickupRange;

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
