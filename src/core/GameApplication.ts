import * as pc from 'playcanvas';
import { GameContext } from './GameContext';

/**
 * 游戏应用程序封装
 * 负责 PlayCanvas Application 的初始化、配置、资源加载和生命周期管理。
 */
export class GameApplication {
    private app: pc.Application;
    private canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = document.getElementById('application-canvas') as HTMLCanvasElement;

        // 创建 PlayCanvas 应用实例
        this.app = new pc.Application(this.canvas, {
            mouse: new pc.Mouse(document.body),
            touch: new pc.TouchDevice(document.body),
            elementInput: new pc.ElementInput(this.canvas),
            keyboard: new pc.Keyboard(window)
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
        this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
        // 这里可以加载资源包或设置其他全局配置
    }

    /**
     * 绑定全局事件
     */
    private bindEvents() {
        window.addEventListener('resize', () => this.app.resizeCanvas());
    }

    /**
     * 启动应用
     */
    public start() {
        this.app.start();
        console.log("Game Application Started");
    }

    /**
     * 获取原始 PlayCanvas Application 实例
     */
    public getApp(): pc.Application {
        return this.app;
    }
}
