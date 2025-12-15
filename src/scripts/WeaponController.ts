import * as pc from 'playcanvas';
import { BulletBehavior } from './BulletBehavior';

export class WeaponController extends pc.ScriptType {
    range: number = 10;
    cooldown: number = 0.5;
    timer: number = 0;
    damage: number = 10;

    update(dt: number) {
        this.timer += dt;
        if (this.timer >= this.cooldown) {
            this.shoot();
            this.timer = 0;
        }
    }

    shoot() {
        const children = this.app.root.children;
        let closest: pc.Entity | null = null;
        let minDst = Infinity;
        const myPos = this.entity.getPosition();

        for (const child of children) {
            if (child.name === 'Enemy') {
                const dst = myPos.distance(child.getPosition());
                if (dst < this.range && dst < minDst) {
                    minDst = dst;
                    closest = child as pc.Entity;
                }
            }
        }

        if (closest) {
            this.spawnProjectile(closest);
        }
    }

    spawnProjectile(target: pc.Entity) {
        const bullet = new pc.Entity('Bullet');
        bullet.addComponent('model', { type: 'sphere' });
        bullet.setLocalScale(0.2, 0.2, 0.2);
        bullet.setPosition(this.entity.getPosition());

        // Yellow color
        const material = new pc.StandardMaterial();
        material.emissive.set(1, 1, 0);
        material.update();
        if (bullet.model) bullet.model.material = material;

        this.app.root.addChild(bullet);

        // Add Bullet Script
        bullet.addComponent('script');
        const script = bullet.script!.create('bulletBehavior') as BulletBehavior;
        if (script) {
            script.target = target;
            script.damage = this.damage;
        }
    }
}


