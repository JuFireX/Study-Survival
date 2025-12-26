import * as pc from 'playcanvas';
import { EventBus } from '../../core/EventBus';
import { GameContext } from '../../core/GameContext';
import { GameplayConfig } from '../../config/gameplay';

import { PlayerStats } from '../characters/share/PlayerStats';

export class ExpOrb extends pc.ScriptType {
    public value: number = GameplayConfig.Drops.expOrb.value;
    private player!: pc.Entity;
    private moveSpeed: number = GameplayConfig.Drops.expOrb.moveSpeed;
    private isCollecting: boolean = false;
    private playerStats: PlayerStats | null = null;

    initialize() {
        this.player = GameContext.getInstance().getPlayer()!;
        if (this.player && this.player.script) {
            this.playerStats = this.player.script.get('playerStats') as PlayerStats;
        }
    }

    update(dt: number) {
        if (!this.player) return;

        const pos = this.entity.getPosition();
        const playerPos = this.player.getPosition();
        const dist = pos.distance(playerPos);

        // Get pickupRange from PlayerStats (RPG stats), default to 3.0
        const pickupRange = this.playerStats?.stats.pickupRange || 3.0;

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
