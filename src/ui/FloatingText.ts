import * as pc from 'playcanvas';
import { EventBus } from '../core/EventBus';
import { GameContext } from '../core/GameContext';
import { FloatingTextComponent } from './components/FloatingTextComponent';

interface ActiveText {
    component: FloatingTextComponent;
    worldPos: pc.Vec3;
    life: number;
    maxLife: number;
    velocity: pc.Vec3;
}

/**
 * 浮动文字管理器 (FloatingText)
 * 
 * 职责:
 * 1. 管理伤害数字、治疗数字等浮动文字的生成。
 * 2. 控制浮动文字的动画 (上浮, 淡出)。
 * 3. 使用对象池优化文字对象的创建和销毁。
 */
export class FloatingText {
    private eventBus: EventBus;
    private pool: FloatingTextComponent[] = [];
    private activeTexts: ActiveText[] = [];
    private app: pc.Application;

    constructor() {
        this.eventBus = EventBus.getInstance();
        this.app = GameContext.getInstance().getApp();

        // 监听伤害事件
        // 根据 BaseEnemy.ts: EventBus.getInstance().fire('combat:damage', damage, this.entity.getPosition(), 'white');
        this.eventBus.on('combat:damage', this.onDamage, this);

        // 绑定帧更新
        this.app.on('update', this.update, this);
    }

    private onDamage(damage: number, worldPos: pc.Vec3, color: string = 'white') {
        this.spawn(Math.floor(damage).toString(), worldPos, color);
    }

    public spawn(text: string, worldPos: pc.Vec3, color: string) {
        let component = this.pool.pop();
        if (!component) {
            component = new FloatingTextComponent();
        }

        component.setup(text, color);

        // 随机一点初始速度，避免重叠完全一致
        const velocity = new pc.Vec3(0, 1.5, 0); // 向上飘
        velocity.x = (Math.random() - 0.5) * 1.0; 
        velocity.z = (Math.random() - 0.5) * 1.0;

        this.activeTexts.push({
            component: component,
            worldPos: worldPos.clone().add(new pc.Vec3(0, 1, 0)), // 从受击点上方一点出现
            life: 1.0, // 存活 1 秒
            maxLife: 1.0,
            velocity: velocity
        });
    }

    private update(dt: number) {
        const cameraEntity = GameContext.getInstance().getCamera();
        if (!cameraEntity || !cameraEntity.camera) return;

        const screenPos = new pc.Vec3();

        for (let i = this.activeTexts.length - 1; i >= 0; i--) {
            const activeText = this.activeTexts[i];
            
            // 更新生命周期
            activeText.life -= dt;
            if (activeText.life <= 0) {
                // 回收
                activeText.component.setActive(false);
                this.pool.push(activeText.component);
                this.activeTexts.splice(i, 1);
                continue;
            }

            // 更新世界位置
            activeText.worldPos.add(activeText.velocity.clone().mulScalar(dt));

            // 投影到屏幕
            cameraEntity.camera.worldToScreen(activeText.worldPos, screenPos);

            // 更新组件
            activeText.component.setPosition(screenPos.x, screenPos.y);
            
            // 淡出效果 (最后 30% 时间)
            if (activeText.life < 0.3 * activeText.maxLife) {
                activeText.component.setOpacity(activeText.life / (0.3 * activeText.maxLife));
            } else {
                activeText.component.setOpacity(1);
            }
        }
    }

    public destroy() {
        this.eventBus.off('combat:damage', this.onDamage, this);
        this.app.off('update', this.update, this);
        
        // 清理所有组件
        this.activeTexts.forEach(t => t.component.destroy());
        this.pool.forEach(c => c.destroy());
        this.activeTexts = [];
        this.pool = [];
    }
}
