import * as pc from 'playcanvas';
import { FloatingTextComponent } from './components/FloatingTextComponent';
import { GameContext } from '../core/GameContext';

/**
 * 单个浮动文字实例
 */
export class FloatingText {
    private component: FloatingTextComponent;
    private worldPos: pc.Vec3 = new pc.Vec3();
    private velocity: pc.Vec3 = new pc.Vec3();
    private life: number = 0;
    private maxLife: number = 0;
    private _isActive: boolean = false;
    private screenPos: pc.Vec3 = new pc.Vec3();
    private app: pc.Application;

    constructor() {
        this.component = new FloatingTextComponent();
        this.app = GameContext.getInstance().getApp();
    }

    public spawn(text: string, worldPos: pc.Vec3, color: string) {
        this.component.setup(text, color);
        // 从受击点上方一点出现
        this.worldPos.copy(worldPos).add(new pc.Vec3(0, 1, 0));

        // 随机初始速度
        this.velocity.set(0, 1.5, 0); // 向上
        this.velocity.x = (Math.random() - 0.5) * 1.0;
        this.velocity.z = (Math.random() - 0.5) * 1.0;

        this.life = 1.0;
        this.maxLife = 1.0;
        this._isActive = true;
    }

    /**
     * 更新状态
     * @returns 是否存活
     */
    public update(dt: number): boolean {
        if (!this._isActive) return false;

        this.life -= dt;
        if (this.life <= 0) {
            this.despawn();
            return false;
        }

        // 更新物理位置
        this.worldPos.add(this.velocity.clone().mulScalar(dt));

        // 投影到屏幕
        const cameraEntity = GameContext.getInstance().getCamera();
        if (cameraEntity && cameraEntity.camera) {
            cameraEntity.camera.worldToScreen(this.worldPos, this.screenPos);
            // 确保在屏幕前方才显示
            if (this.screenPos.z > 0) {
                this.component.setActive(true);

                // Robust coordinate conversion:
                // 1. Normalize to 0..1 based on backbuffer size
                // 2. Flip Y (PlayCanvas is Bottom-Left, DOM is Top-Left)
                // 3. Scale to Canvas CSS size

                const device = this.app.graphicsDevice;
                // @ts-ignore - canvas is an HTMLCanvasElement
                const canvas = device.canvas as HTMLCanvasElement;

                const nX = this.screenPos.x / device.width;
                const nY = this.screenPos.y / device.height; // PlayCanvas worldToScreen returns Top-Left based coords, no need to flip

                const finalX = nX * canvas.clientWidth;
                const finalY = nY * canvas.clientHeight;

                this.component.setPosition(finalX, finalY);
            } else {
                this.component.setActive(false);
            }
        }

        // 淡出效果 (最后 30% 时间)
        if (this.life < 0.3 * this.maxLife) {
            this.component.setOpacity(this.life / (0.3 * this.maxLife));
        } else {
            this.component.setOpacity(1);
        }

        return true;
    }

    public despawn() {
        this._isActive = false;
        this.component.setActive(false);
    }

    public isValid(): boolean {
        return this._isActive;
    }

    public destroy() {
        this.component.destroy();
    }
}
