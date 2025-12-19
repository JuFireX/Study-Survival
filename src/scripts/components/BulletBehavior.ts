import * as pc from 'playcanvas';

export class BulletBehavior extends pc.ScriptType {
    target: pc.Entity | null = null;
    speed: number = 20;
    damage: number = 10;

    initialize() {
    }

    update(dt: number) {
        if (!this.target || !this.target.parent) { // Target dead/removed
            this.entity.destroy();
            return;
        }

        const pos = this.entity.getPosition();
        const targetPos = this.target.getPosition();

        const dir = new pc.Vec3().sub2(targetPos, pos);
        const dist = dir.length();

        if (dist < 0.5) {
            // Hit
            const gm = (window as any).gameManager;
            if (gm && gm.floatingText) {
                gm.floatingText.spawn(Math.floor(this.damage).toString(), targetPos, 'yellow');
            }

            this.target.destroy(); // Simple kill
            this.entity.destroy();
            return;
        }

        dir.normalize().mulScalar(this.speed * dt);
        this.entity.translate(dir);
    }
}


