import * as pc from 'playcanvas';
import { GameContext } from '../../core/GameContext';

/**
 * 掉落物基类 (BaseDrop)
 * 
 * 职责:
 * 1. 定义掉落物的基本属性和行为。
 * 2. 管理掉落物的生命周期。
 */
export abstract class BaseDrop {
    public entity: pc.Entity;
    protected context: GameContext;
    protected isPicked: boolean = false;
    protected destroyed: boolean = false;

    constructor() {
        this.context = GameContext.getInstance();
        this.entity = new pc.Entity();
        
        // 添加到场景
        this.context.getApp().root.addChild(this.entity);
        
        // 标记
        this.entity.tags.add('drop');
        (this.entity as any).baseDrop = this;
    }

    public setPosition(x: number, y: number, z: number) {
        this.entity.setPosition(x, y, z);
    }

    public getPosition(): pc.Vec3 {
        return this.entity.getPosition();
    }

    public update(dt: number) {
        if (this.destroyed) return;
        this.entity.rotate(0, 90 * dt, 0);
    }

    /**
     * 当被拾取时调用
     */
    public abstract onPickUp(): void;

    public isPickedUp(): boolean {
        return this.isPicked;
    }

    public isDestroyed(): boolean {
        return this.destroyed;
    }

    public destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        this.entity.destroy();
    }
}
