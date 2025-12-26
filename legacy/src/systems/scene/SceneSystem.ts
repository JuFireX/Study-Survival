import * as pc from 'playcanvas';
import { IGameSystem } from '../share/IGameSystem';
import { GameContext } from '../../core/GameContext';

export class SceneSystem implements IGameSystem {
    private app: pc.Application;
    private ground: pc.Entity | null = null;

    constructor() {
        this.app = GameContext.getInstance().getApp();
    }

    initialize() {
        console.log("SceneSystem initialized");
        this.adjustLighting();
        this.findGround();
    }

    update(dt: number) {
        this.updateInfiniteMap();
    }

    private adjustLighting() {
        const light = this.app.root.findByName('Light');
        if (light && light.light) {
            // 削弱光照和阴影配置
            light.light.intensity = 0.8;
            light.light.shadowDistance = 30; // 减小阴影距离以提高性能
            light.light.shadowResolution = 1024;
        }
    }

    private findGround() {
        this.ground = this.app.root.findByName('Ground') as pc.Entity;
    }

    private updateInfiniteMap() {
        const player = GameContext.getInstance().getPlayer();
        if (!player || !this.ground) return;

        const pPos = player.getPosition();
        const gPos = this.ground.getPosition();

        // 地面移动逻辑 (简单的无限地图实现: 移动地面以跟随玩家)
        // 假设地面是 scale = 50 的平面
        const size = 50;
        
        // 当玩家超出中心一定距离时，移动地面
        let newX = gPos.x;
        let newZ = gPos.z;

        if (pPos.x - gPos.x > size / 2) {
            newX += size;
        } else if (gPos.x - pPos.x > size / 2) {
            newX -= size;
        }

        if (pPos.z - gPos.z > size / 2) {
            newZ += size;
        } else if (gPos.z - pPos.z > size / 2) {
            newZ -= size;
        }

        if (newX !== gPos.x || newZ !== gPos.z) {
            this.ground.setPosition(newX, 0, newZ);
        }
    }
}
