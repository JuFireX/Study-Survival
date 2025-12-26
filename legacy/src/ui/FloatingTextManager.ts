import * as pc from 'playcanvas';
import { FloatingTextComponent } from './components/FloatingTextComponent';

/**
 * 飘字管理器
 * 负责在屏幕上显示伤害数字、提示信息等。
 * 使用 DOM 元素覆盖在 Canvas 之上。
 */
export class FloatingTextManager {
    app: pc.Application;
    camera: pc.Entity | null = null;
    private component: FloatingTextComponent;

    constructor(app: pc.Application) {
        this.app = app;
        this.component = new FloatingTextComponent();
    }

    /**
     * 设置参考摄像机（用于坐标转换）
     */
    setCamera(camera: pc.Entity) {
        this.camera = camera;
    }

    /**
     * 生成飘字
     * @param text 显示文本
     * @param worldPos 世界坐标位置
     * @param color 文本颜色
     */
    spawn(text: string, worldPos: pc.Vec3, color: string = 'white') {
        if (!this.camera) return;

        const screenPos = new pc.Vec3();
        this.camera.camera!.worldToScreen(worldPos, screenPos);

        // 如果在摄像机背后则不显示
        // PlayCanvas worldToScreen z 分量表示距离
        if (screenPos.z < 0) return;

        this.component.spawn(text, screenPos.x, screenPos.y, color);
    }
}
