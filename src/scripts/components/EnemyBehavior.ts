import * as pc from 'playcanvas';

export class EnemyBehavior extends pc.ScriptType {
    player: pc.Entity | null = null;
    speed: number = 3;

    initialize() {
    }

    setup(player: pc.Entity) {
        this.player = player;
    }

    update(dt: number) {
        if (!this.player) return;

        const pos = this.entity.getPosition();
        const target = this.player.getPosition();

        const dir = new pc.Vec3().sub2(target, pos);
        dir.y = 0; // Don't fly/sink

        if (dir.length() > 0.1) {
            dir.normalize().mulScalar(this.speed * dt);
            this.entity.translate(dir);
            this.entity.lookAt(target.x, pos.y, target.z);
        }
    }
}


