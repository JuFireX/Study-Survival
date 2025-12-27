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
    private static instance: SceneManager;
    private context: GameContext;
    private app: pc.Application;

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
        ground.setLocalScale(100, 1, 100); // 扩大地面

        // 创建程序化网格材质
        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(0.8, 0.8, 0.8);

        // 生成网格纹理
        const texture = this.createGridTexture();
        material.diffuseMap = texture;
        material.diffuseMapTiling = new pc.Vec2(20, 20); // 纹理重复
        material.update();

        ground.model!.material = material;

        // 启用物理碰撞（如果有物理系统，这里暂仅作为视觉地面）
        // ground.addComponent('collision', { type: 'box', halfExtents: new pc.Vec3(50, 0.5, 50) });
        // ground.addComponent('rigidbody', { type: 'static' });

        this.app.root.addChild(ground);
    }

    /**
     * 生成网格纹理
     */
    private createGridTexture(): pc.Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // 深色背景
            ctx.fillStyle = '#222222';
            ctx.fillRect(0, 0, 512, 512);

            // 主网格线
            ctx.strokeStyle = '#3e3e3e';
            ctx.lineWidth = 4;
            ctx.beginPath();
            const step = 64; // 8x8 格子
            for (let i = 0; i <= 512; i += step) {
                ctx.moveTo(i, 0);
                ctx.lineTo(i, 512);
                ctx.moveTo(0, i);
                ctx.lineTo(512, i);
            }
            ctx.stroke();

            // 细网格线 (可选)
            // ctx.strokeStyle = '#333333';
            // ctx.lineWidth = 1;
            // ...
        }

        const texture = new pc.Texture(this.app.graphicsDevice, {
            width: 512,
            height: 512,
            format: pc.PIXELFORMAT_R8_G8_B8_A8,
            minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
            magFilter: pc.FILTER_LINEAR,
            addressU: pc.ADDRESS_REPEAT,
            addressV: pc.ADDRESS_REPEAT,
            anisotropy: 4 // 提高倾斜视角下的清晰度
        });
        texture.setSource(canvas);
        return texture;
    }

    /**
     * 创建灯光
     */
    private createLight() {
        // 1. 设置全局环境光
        this.app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.25); // 微微偏蓝的暗色

        // 2. 主平行光 (模拟太阳，暖色)
        const mainLight = new pc.Entity('Main Light');
        mainLight.addComponent('light', {
            type: pc.LIGHTTYPE_DIRECTIONAL,
            color: new pc.Color(1, 0.95, 0.9), // 暖白
            intensity: 1.0,
            castShadows: true,
            shadowBias: 0.2,
            shadowDistance: 60, // 增加阴影距离
            normalOffsetBias: 0.05,
            shadowResolution: 2048 // 提高阴影质量
        });
        // 设置更好的光照角度
        mainLight.setEulerAngles(45, 135, 0);
        this.app.root.addChild(mainLight);

        // 3. 补光 (Fill Light, 模拟天光反射，冷色，无阴影)
        const fillLight = new pc.Entity('Fill Light');
        fillLight.addComponent('light', {
            type: pc.LIGHTTYPE_DIRECTIONAL,
            color: new pc.Color(0.4, 0.5, 0.6), // 冷蓝
            intensity: 0.4,
            castShadows: false
        });
        // 与主光相对的角度
        fillLight.setEulerAngles(45, -45, 0);
        this.app.root.addChild(fillLight);
    }

    /**
     * 创建主摄像机
     */
    private createCamera(): pc.Entity {
        const camera = new pc.Entity('Main Camera');
        camera.addComponent('camera', {
            clearColor: new pc.Color(0.1, 0.12, 0.15), // 深灰蓝色背景，更有质感
            farClip: 1000, // 增加可视距离
            fov: 45
        });

        // 初始位置，后续会被 Controller 接管
        camera.setPosition(0, 15, 15); // 稍微拉高一点视角
        camera.lookAt(0, 0, 0);

        this.app.root.addChild(camera);
        return camera;
    }
}
