import * as pc from 'playcanvas';

/**
 * 飘字管理器
 * 负责在屏幕上显示伤害数字、提示信息等。
 * 使用 DOM 元素覆盖在 Canvas 之上。
 */
export class FloatingTextManager {
    app: pc.Application;
    container: HTMLElement;
    camera: pc.Entity | null = null;

    constructor(app: pc.Application) {
        this.app = app;
        // 创建容器
        this.container = document.createElement('div');
        this.container.id = 'floating-text-container';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none'; // 确保不阻挡鼠标事件
        this.container.style.overflow = 'hidden';
        this.container.style.zIndex = '900'; // 层级低于 Joystick/UI
        document.body.appendChild(this.container);
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

        const el = document.createElement('div');
        el.textContent = text;
        el.style.position = 'absolute';
        el.style.left = `${screenPos.x}px`;
        el.style.top = `${screenPos.y}px`;
        el.style.color = color;
        el.style.fontSize = '24px';
        el.style.fontWeight = 'bold';
        el.style.textShadow = '2px 2px 0 #000';
        el.style.transition = 'top 1s ease-out, opacity 1s ease-out';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.opacity = '1';
        
        this.container.appendChild(el);

        // 强制重绘以触发 transition
        el.offsetHeight;

        // 动画：向上飘并消失
        el.style.top = `${screenPos.y - 100}px`;
        el.style.opacity = '0';

        // 动画结束后移除元素
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1000);
    }
}
