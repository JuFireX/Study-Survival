import * as pc from 'playcanvas';
import { GameContext } from '../core/GameContext';

export class SkillStand {
    private app: pc.Application;
    private stand: pc.Entity | null = null;

    constructor() {
        this.app = GameContext.getInstance().getApp();
    }

    public ensureStand(): pc.Entity {
        if (this.stand && this.stand.parent) return this.stand;
        this.stand = this.createStand();
        return this.stand;
    }

    public getStand(): pc.Entity | null {
        if (this.stand && this.stand.parent) return this.stand;
        return null;
    }

    private createStand(): pc.Entity {
        const stand = new pc.Entity('SkillStand');
        stand.setPosition(0, 0.1, 6);

        const pedestal = new pc.Entity('SkillPedestal');
        pedestal.addComponent('model', { type: 'cylinder' });
        pedestal.setLocalScale(2.2, 0.4, 2.2);
        const pedestalMaterial = new pc.StandardMaterial();
        pedestalMaterial.diffuse = new pc.Color(0.18, 0.2, 0.28);
        pedestalMaterial.update();
        pedestal.model!.material = pedestalMaterial;

        const orb = new pc.Entity('SkillOrb');
        orb.addComponent('model', { type: 'sphere' });
        orb.setLocalPosition(0, 1.4, 0);
        orb.setLocalScale(0.7, 0.7, 0.7);
        const orbMaterial = new pc.StandardMaterial();
        orbMaterial.diffuse = new pc.Color(0.3, 0.7, 1.0);
        orbMaterial.emissive = new pc.Color(0.2, 0.6, 0.9);
        orbMaterial.emissiveIntensity = 1.1;
        orbMaterial.update();
        orb.model!.material = orbMaterial;

        stand.addChild(pedestal);
        stand.addChild(orb);
        this.app.root.addChild(stand);
        return stand;
    }

    public destroy() {
        if (this.stand) {
            this.stand.destroy();
            this.stand = null;
        }
    }
}
