import * as pc from 'playcanvas';
import { GameContext } from '../core/GameContext';
import { EventBus } from '../core/EventBus';
import { FloatingText } from './FloatingText';

/**
 * 伤害跳字管理器 (FloatingTextManager)
 * 
 * 职责:
 * 1. 集中管理所有 FloatingText 实例（对象池）。
 * 2. 监听战斗事件并触发飘字。
 * 3. 统一处理帧更新。
 */
export class FloatingTextManager {
    private pool: FloatingText[] = [];
    private activeTexts: FloatingText[] = [];
    private app: pc.Application;
    private eventBus: EventBus;

    constructor() {
        this.app = GameContext.getInstance().getApp();
        this.eventBus = EventBus.getInstance();

        // 统一监听 update
        this.app.on('update', this.update, this);
        // 监听伤害事件
        this.eventBus.on('combat:damage', this.onDamage, this);
    }

    private onDamage(damage: number, worldPos: pc.Vec3, color: string = 'white') {
        console.log(`[FloatingTextManager] onDamage: ${damage}`);
        this.spawn(Math.floor(damage).toString(), worldPos, color);
    }

    /**
     * 生成一个新的飘字
     */
    public spawn(text: string, worldPos: pc.Vec3, color: string) {
        let ft = this.pool.pop();
        if (!ft) {
            ft = new FloatingText();
        }
        ft.spawn(text, worldPos, color);
        this.activeTexts.push(ft);
    }

    private update(dt: number) {
        // 倒序遍历，方便删除
        for (let i = this.activeTexts.length - 1; i >= 0; i--) {
            const ft = this.activeTexts[i];
            if (!ft.update(dt)) {
                // 如果 update 返回 false，说明生命周期结束
                this.pool.push(ft);
                this.activeTexts.splice(i, 1);
            }
        }
    }

    public destroy() {
        this.app.off('update', this.update, this);
        this.eventBus.off('combat:damage', this.onDamage, this);

        this.activeTexts.forEach(ft => ft.destroy());
        this.pool.forEach(ft => ft.destroy());
        this.activeTexts = [];
        this.pool = [];
    }
}
