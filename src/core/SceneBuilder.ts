import * as pc from 'playcanvas';
import { GameContext } from './GameContext';

/**
 * 场景构建器
 * 负责初始化 3D 场景，包括灯光、地面、摄像机等环境元素。
 */
export class SceneBuilder {
    private app: pc.Application;
    private context: GameContext;

    constructor() {
        this.context = GameContext.getInstance();
        this.app = this.context.getApp();
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
        // 添加碰撞体（如果需要物理）
        // ground.addComponent('collision', { type: 'box', halfExtents: new pc.Vec3(25, 0.5, 25) });
        // ground.addComponent('rigidbody', { type: 'static' });
        this.app.root.addChild(ground);
    }

    /**
     * 创建环境光
     */
    private createLight() {
        const light = new pc.Entity('Light');
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
     * 创建摄像机
     */
    private createCamera(): pc.Entity {
        const camera = new pc.Entity('Camera');
        camera.addComponent('camera', {
            clearColor: new pc.Color(0.2, 0.2, 0.2),
            farClip: 100
        });
        this.app.root.addChild(camera);
        return camera;
    }
}
