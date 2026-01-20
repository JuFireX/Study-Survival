import * as pc from 'playcanvas';
import { GameContext } from '../GameContext';
import { ResourceManager } from './ResourceManager';

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
        this.clearScene();
        this.createGround(100, 20);
        this.createLight();
        this.createTestPoster();
        return this.createCamera();
    }

    public buildLobbyScene(): { camera: pc.Entity; portal: pc.Entity; halfSize: number } {
        this.clearScene();
        const halfSize = 20;
        this.createGround(halfSize * 2, 8);
        this.createLight();
        this.createLobbyWalls(halfSize);
        const portal = this.createPortal();
        const camera = this.createCamera();
        camera.setPosition(0, 12, 16);
        camera.lookAt(0, 0, 0);
        return { camera, portal, halfSize };
    }

    private clearScene() {
        const children = this.app.root.children.slice();
        children.forEach(child => child.destroy());
    }

    /**
     * 创建测试海报 (用于验证纹理加载)
     */
    private createTestPoster() {
        const resourceManager = ResourceManager.getInstance();
        const texture = resourceManager.getTexture('test');

        if (texture) {
            const poster = new pc.Entity('TestPoster');

            // 创建一个立着的平面
            poster.addComponent('model', { type: 'plane' });
            poster.setLocalEulerAngles(90, 0, 0); // 竖起来
            poster.setLocalScale(10, 1, 10); // 放大
            poster.setPosition(-40, 5, -40); // 放在角落

            const material = new pc.StandardMaterial();
            material.diffuse = new pc.Color(1, 1, 1);
            material.diffuseMap = texture;
            material.blendType = pc.BLEND_NORMAL; // 支持透明度
            material.update();

            poster.model!.material = material;

            this.app.root.addChild(poster);
            console.log('[SceneManager] Test poster created with texture "test".');
        } else {
            console.warn('[SceneManager] Texture "test" not found. Make sure test.jpeg exists in assets/image.');
        }
    }

    /**
     * 创建地面
     */
    private createGround(size: number, tiling: number) {
        const ground = new pc.Entity('Ground');
        ground.addComponent('model', { type: 'plane' });
        ground.setLocalScale(size, 1, size);

        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(0.8, 0.8, 0.8);

        const texture = this.createGridTexture();
        material.diffuseMap = texture;
        material.diffuseMapTiling = new pc.Vec2(tiling, tiling);
        material.update();

        ground.model!.material = material;

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
        this.app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.25);

        const mainLight = new pc.Entity('Main Light');
        mainLight.addComponent('light', {
            type: pc.LIGHTTYPE_DIRECTIONAL,
            color: new pc.Color(1, 0.95, 0.9),
            intensity: 1.0,
            castShadows: false,
            shadowBias: 0.2,
            shadowDistance: 60,
            normalOffsetBias: 0.05,
            shadowResolution: 2048
        });
        mainLight.setEulerAngles(45, 135, 0);
        this.app.root.addChild(mainLight);

        const fillLight = new pc.Entity('Fill Light');
        fillLight.addComponent('light', {
            type: pc.LIGHTTYPE_DIRECTIONAL,
            color: new pc.Color(0.4, 0.5, 0.6),
            intensity: 0.4,
            castShadows: false
        });
        fillLight.setEulerAngles(45, -45, 0);
        this.app.root.addChild(fillLight);
    }

    private createPortal(): pc.Entity {
        const portal = new pc.Entity('LobbyPortal');
        portal.setPosition(6, 0.1, 0);

        const base = new pc.Entity('PortalBase');
        base.addComponent('model', { type: 'cylinder' });
        base.setLocalScale(2.6, 0.25, 2.6);
        const baseMaterial = new pc.StandardMaterial();
        baseMaterial.diffuse = new pc.Color(0.15, 0.15, 0.18);
        baseMaterial.update();
        base.model!.material = baseMaterial;

        const ring = new pc.Entity('PortalRing');
        ring.addComponent('model', { type: 'cylinder' });
        ring.setLocalScale(2.6, 0.18, 2.6);
        ring.setLocalEulerAngles(90, 0, 0);
        ring.setLocalPosition(0, 2.5, 0);
        const ringMaterial = new pc.StandardMaterial();
        ringMaterial.diffuse = new pc.Color(0.1, 0.6, 1.0);
        ringMaterial.emissive = new pc.Color(0.1, 0.6, 1.0);
        ringMaterial.emissiveIntensity = 1.2;
        ringMaterial.update();
        ring.model!.material = ringMaterial;

        const core = new pc.Entity('PortalCore');
        core.addComponent('model', { type: 'plane' });
        core.setLocalScale(2.2, 1, 3.2);
        core.setLocalEulerAngles(90, 0, 0);
        core.setLocalPosition(0, 2.5, 0);
        const coreMaterial = new pc.StandardMaterial();
        coreMaterial.diffuse = new pc.Color(0.05, 0.3, 0.6);
        coreMaterial.emissive = new pc.Color(0.05, 0.3, 0.6);
        coreMaterial.emissiveIntensity = 1.5;
        coreMaterial.update();
        core.model!.material = coreMaterial;

        portal.addChild(base);
        portal.addChild(ring);
        portal.addChild(core);
        this.app.root.addChild(portal);
        return portal;
    }

    private createLobbyWalls(halfSize: number) {
        const wallHeight = 3;
        const wallThickness = 1;
        const wallMaterial = new pc.StandardMaterial();
        wallMaterial.diffuse = new pc.Color(0.1, 0.1, 0.15);
        wallMaterial.update();

        const north = new pc.Entity('LobbyWallNorth');
        north.addComponent('model', { type: 'box' });
        north.setLocalScale(halfSize * 2, wallHeight, wallThickness);
        north.setPosition(0, wallHeight / 2, -halfSize);
        north.model!.material = wallMaterial;

        const south = new pc.Entity('LobbyWallSouth');
        south.addComponent('model', { type: 'box' });
        south.setLocalScale(halfSize * 2, wallHeight, wallThickness);
        south.setPosition(0, wallHeight / 2, halfSize);
        south.model!.material = wallMaterial;

        const west = new pc.Entity('LobbyWallWest');
        west.addComponent('model', { type: 'box' });
        west.setLocalScale(wallThickness, wallHeight, halfSize * 2);
        west.setPosition(-halfSize, wallHeight / 2, 0);
        west.model!.material = wallMaterial;

        const east = new pc.Entity('LobbyWallEast');
        east.addComponent('model', { type: 'box' });
        east.setLocalScale(wallThickness, wallHeight, halfSize * 2);
        east.setPosition(halfSize, wallHeight / 2, 0);
        east.model!.material = wallMaterial;

        this.app.root.addChild(north);
        this.app.root.addChild(south);
        this.app.root.addChild(west);
        this.app.root.addChild(east);
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

        // 添加音频监听器，确保能听到声音
        camera.addComponent('audiolistener');

        // 初始位置，后续会被 Controller 接管
        camera.setPosition(0, 15, 15); // 稍微拉高一点视角
        camera.lookAt(0, 0, 0);

        this.app.root.addChild(camera);
        return camera;
    }
}
