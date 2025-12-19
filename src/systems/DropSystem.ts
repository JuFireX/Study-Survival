import * as pc from 'playcanvas';
import { IGameSystem } from './IGameSystem';
import { EventBus } from '../core/EventBus';
import { GameContext } from '../core/GameContext';
import { ExpOrb } from '../scripts/components/ExpOrb';

export class DropSystem implements IGameSystem {
    private app: pc.Application;
    private eventBus: EventBus;

    constructor() {
        this.app = GameContext.getInstance().getApp();
        this.eventBus = EventBus.getInstance();

        // Register script
        pc.registerScript(ExpOrb, 'expOrb');
    }

    initialize() {
        this.eventBus.on('enemy:death', this.onEnemyDeath, this);
    }

    update() { }

    private onEnemyDeath(position: pc.Vec3, expValue: number) {
        const orb = new pc.Entity('ExpOrb');
        orb.addComponent('model', { type: 'sphere' });
        orb.setLocalScale(0.3, 0.3, 0.3);

        // Green color for XP
        const material = new pc.StandardMaterial();
        material.diffuse.set(0, 1, 0);
        material.update();
        orb.model!.material = material;

        orb.setPosition(position);

        orb.addComponent('script');
        const script = orb.script!.create('expOrb') as ExpOrb;
        script.value = expValue;

        this.app.root.addChild(orb);
    }
}
