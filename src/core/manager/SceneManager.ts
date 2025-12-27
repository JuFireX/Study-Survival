import * as pc from 'playcanvas';
import { GameContext } from '../GameContext';

/**
 * 场景构建器 (SceneManager)
 * 
 * 职责:
 * 1. 负责初始化 3D 场景的基础环境 (地面, 灯光, 天空盒等)。
 * 2. 负责创建和配置主摄像机。
 * 3. (未来) 负责场景切换和动态环境加载。
 */
export class SceneManager {
    private app: pc.Application;
    private context: GameContext;
    private static instance: SceneManager;

    constructor() {
        this.context = GameContext.getInstance();
        this.app = this.context.getApp();
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): SceneManager {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager();
        }
        return SceneManager.instance;
    }

    /**
     * 构建基础场景
     * @returns 返回摄像机实体，供其他系统使用
     */
    public buildScene(): pc.Entity {
        this.createGround();
        this.createLight();
        return this.createCamera();
    }

    /**
     * 创建地面
     */
    private createGround() {
        const ground = new pc.Entity('Ground');
        ground.addComponent('model', { type: 'plane' });
        ground.setLocalScale(50, 1, 50);

        this.app.root.addChild(ground);
    }

    /**
     * 创建环境光
     */
    private createLight() {
        // 主平行光
        const light = new pc.Entity('Directional Light');
        light.addComponent('light', {
            type: pc.LIGHTTYPE_DIRECTIONAL,
            intensity: 1,
            castShadows: true,
            shadowBias: 0.2,
            shadowDistance: 40,
            normalOffsetBias: 0.05
        });
        light.setEulerAngles(45, 45, 0);

        this.app.root.addChild(light);
    }

    /**
     * 创建主摄像机
     */
    private createCamera(): pc.Entity {
        const camera = new pc.Entity('Main Camera');
        camera.addComponent('camera', {
            clearColor: new pc.Color(0.2, 0.2, 0.2),
            farClip: 100,
            fov: 45
        });

        // 初始位置，后续会被 Controller 接管
        camera.setPosition(0, 10, 10);
        camera.lookAt(0, 0, 0);

        this.app.root.addChild(camera);
        return camera;
    }
}
