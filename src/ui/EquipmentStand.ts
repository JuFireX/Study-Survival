import * as pc from 'playcanvas';
import { GameContext } from '../core/GameContext';

export class EquipmentStand {
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
        const stand = new pc.Entity('EquipmentStand');
        stand.setPosition(0, 0.1, -6);

        const pedestal = new pc.Entity('EquipmentPedestal');
        pedestal.addComponent('model', { type: 'cylinder' });
        pedestal.setLocalScale(2.2, 0.4, 2.2);
        const pedestalMaterial = new pc.StandardMaterial();
        pedestalMaterial.diffuse = new pc.Color(0.2, 0.18, 0.22);
        pedestalMaterial.update();
        pedestal.model!.material = pedestalMaterial;

        const gear = new pc.Entity('EquipmentCore');
        gear.addComponent('model', { type: 'box' });
        gear.setLocalPosition(0, 1.35, 0);
        gear.setLocalScale(0.9, 0.9, 0.9);
        const gearMaterial = new pc.StandardMaterial();
        gearMaterial.diffuse = new pc.Color(0.85, 0.55, 0.2);
        gearMaterial.update();
        gear.model!.material = gearMaterial;

        stand.addChild(pedestal);
        stand.addChild(gear);
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
