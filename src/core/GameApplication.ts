import * as pc from 'playcanvas';
import { GameContext } from './GameContext';
import { ResourceManager } from './manager/ResourceManager';

/**
 * 游戏应用程序封装 (GameApplication)
 * 
 * 职责:
 * 1. 初始化 PlayCanvas Application 实例。
 * 2. 配置全局设置 (分辨率, 填充模式等)。
 * 3. 负责资源的预加载。
 * 4. 管理应用程序的生命周期 (启动, 销毁)。
 * 5. 处理全局窗口事件 (如 Resize)。
 */
export class GameApplication {
    private app: pc.Application;
    private canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = document.getElementById('application-canvas') as HTMLCanvasElement;

        if (!this.canvas) {
            throw new Error("[GameApplication] Canvas element not found!");
        }

        // 创建 PlayCanvas 应用实例
        // 启用常用输入设备
        this.app = new pc.Application(this.canvas, {
            mouse: new pc.Mouse(document.body),
            touch: new pc.TouchDevice(document.body),
            elementInput: new pc.ElementInput(this.canvas),
            keyboard: new pc.Keyboard(window),
            // 可选: 图形设备选项
            graphicsDeviceOptions: {
                alpha: false,
                antialias: true,
                powerPreference: 'high-performance'
            }
        });

        // 注册到 Context
        GameContext.getInstance().setApp(this.app);

        this.configure();
        this.bindEvents();
    }

    /**
     * 配置应用设置
     */
    private configure() {
        // 设置全屏填充
        this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        // 自动调整分辨率以匹配像素比
        this.app.setCanvasResolution(pc.RESOLUTION_AUTO);

        // 可以在此处配置物理引擎、本地化等
    }

    /**
     * 绑定全局事件
     */
    private bindEvents() {
        // 处理窗口大小调整
        window.addEventListener('resize', () => this.app.resizeCanvas());
    }

    /**
     * 启动应用
     * 包括资源加载和启动主循环
     */
    public async start() {
        console.log("[GameApplication] Starting...");

        try {
            // 注册 ResourceManager 到 Context
            const resourceManager = ResourceManager.getInstance();
            GameContext.getInstance().setResourceManager(resourceManager);

            // 加载所有核心资源
            await resourceManager.loadAll();

            // 启动 PlayCanvas 循环
            this.app.start();
            console.log("[GameApplication] Started successfully.");

        } catch (error) {
            console.error("[GameApplication] Failed to start:", error);
        }
    }

    /**
     * 获取原始 PlayCanvas Application 实例
     */
    public getApp(): pc.Application {
        return this.app;
    }

    /**
     * 销毁应用
     * 用于清理资源
     */
    public destroy() {
        this.app.destroy();
        // 移除事件监听等
    }
}
