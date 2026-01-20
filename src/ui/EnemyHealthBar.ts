import * as pc from 'playcanvas';
import { GameContext } from '../core/GameContext';
import { EnemyHealthBarComponent } from './components/EnemyHealthBarComponent';

/**
 * 敌人血条逻辑控制器 (EnemyHealthBar)
 * 
 * 职责:
 * 1. 实例化 UI 视图组件。
 * 2. 计算世界坐标到屏幕坐标的转换。
 * 3. 控制血条的显示位置和可见性。
 * 4. 被 Manager 统一调度，不再自我管理生命周期事件。
 */
export class EnemyHealthBar {
    private component: EnemyHealthBarComponent;
    private targetEntity: pc.Entity;
    private offset: pc.Vec3;
    private screenPos: pc.Vec3 = new pc.Vec3();
    private app: pc.Application;
    private _isValid: boolean = true;

    constructor(target: pc.Entity, offsetY: number = 2.5) {
        this.component = new EnemyHealthBarComponent();
        this.targetEntity = target;
        this.offset = new pc.Vec3(0, offsetY, 0);
        this.app = GameContext.getInstance().getApp();

        // 监听实体事件
        this.targetEntity.on('health:change', this.onHealthChange, this);
        this.targetEntity.once('destroy', this.onDestroyEntity, this);
    }

    private onHealthChange(percent: number) {
        this.updateHealth(percent);
    }

    private onDestroyEntity() {
        // 实体销毁时，标记自己无效，Manager 会在下一帧清理
        this._isValid = false;
        this.component.setVisible(false);
    }

    /**
     * 更新血量显示
     * @param percent 0-1
     */
    public updateHealth(percent: number) {
        this.component.updateHealth(percent);
    }

    /**
     * 检查是否有效 (目标是否存在)
     */
    public isValid(): boolean {
        return this._isValid && !!(this.targetEntity && this.targetEntity.parent);
    }

    /**
     * 手动更新 (由 Manager 调用)
     */
    public manualUpdate() {
        if (!this.isValid()) {
            return;
        }

        const camera = GameContext.getInstance().getCamera();
        if (!camera || !camera.camera) return;

        // 计算世界坐标
        const worldPos = this.targetEntity.getPosition().clone().add(this.offset);

        // 转换到屏幕坐标
        camera.camera.worldToScreen(worldPos, this.screenPos);

        const x = this.screenPos.x;
        const y = this.screenPos.y;

        // 简单的可见性判断
        const isVisible = (
            x > 0 &&
            x < this.app.graphicsDevice.width &&
            y > 0 &&
            y < this.app.graphicsDevice.height
        );

        if (isVisible) {
            // 进一步检查是否在相机前方
            const vecToTarget = new pc.Vec3().sub2(worldPos, camera.getPosition());
            const dot = vecToTarget.dot(camera.forward);

            if (dot > 0) {
                this.component.setVisible(true);
                this.component.setPosition(x, y);
            } else {
                this.component.setVisible(false);
            }
        } else {
            this.component.setVisible(false);
        }
    }

    public destroy() {
        this._isValid = false;
        // 解绑事件
        if (this.targetEntity) {
            this.targetEntity.off('health:change', this.onHealthChange, this);
            this.targetEntity.off('destroy', this.onDestroyEntity, this);
        }
        this.component.destroy();
    }
}
