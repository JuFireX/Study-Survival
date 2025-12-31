import * as pc from 'playcanvas';
import { BaseDrop } from './BaseDrop';
import { VFXConfig } from '../../config/game';
/**
 * 经验球 (ExpOrb)
 * 
 * 职责:
 * 1. 代表一个经验值掉落物。
 * 2. 被拾取时给玩家增加经验。
 */
type PickState = 'idle' | 'fly';

export class ExpOrb extends BaseDrop {
    private expValue: number;

    private state: PickState = 'idle';
    private t = 0;
    private flyDur = 0;

    private cameraEntity: pc.Entity | null = null;
    private cam: pc.CameraComponent | null = null;
    private playerEntity: pc.Entity | null = null;

    private startScr = new pc.Vec3();
    private retreatScr = new pc.Vec3();
    private playerScr = new pc.Vec3();
    private tmpWorld = new pc.Vec3();

    private startDepth = 0;
    private playerDepth = 0;
    private curveSide = 1;
    private wavePhase = 0;

    private startScale = 0.3;
    private counted = false;

    private static activeAnims = 0;

    constructor(expValue: number) {
        super();
        this.expValue = expValue;
        this.setupModel();
    }

    private setupModel() {
        this.entity.addComponent('model', { type: 'sphere' });
        const m = new pc.StandardMaterial();
        m.diffuse = new pc.Color(0, 0.5, 1);
        m.emissive = new pc.Color(0, 0.2, 0.8);
        m.update();
        if (this.entity.model) this.entity.model.material = m;
        this.startScale = 0.3;
        this.entity.setLocalScale(this.startScale, this.startScale, this.startScale);
    }

    public override update(dt: number) {
        if (this.destroyed) return;
        if (this.state === 'idle') {
            super.update(dt);
            return;
        }
        this.updatePick(dt);
    }

    public onPickUp(): void {
        if (this.isPicked) return;
        this.isPicked = true;

        const playerEntity = this.context.getPlayer();

        const cfg = VFXConfig;
        if (!cfg.enabled || !cfg.expOrb.enabled) {
            this.finish();
            return;
        }

        if (ExpOrb.activeAnims >= cfg.expOrb.maxConcurrentAnimations) {
            this.finish();
            return;
        }

        const cameraEntity = this.context.getCamera();
        const cam = cameraEntity?.camera ?? null;
        if (!cameraEntity || !cam || !playerEntity) {
            this.finish();
            return;
        }

        const flyCfg = cfg.expOrb.fly;

        this.cameraEntity = cameraEntity;
        this.cam = cam;
        this.playerEntity = playerEntity;

        this.flyDur = Math.max(0.001, this.rand(flyCfg.durationMin, flyCfg.durationMax));

        this.curveSide = Math.random() < 0.5 ? -1 : 1;
        this.wavePhase = Math.random() * Math.PI * 2;

        const myPos = this.entity.getPosition();
        const pPos = playerEntity.getPosition();

        cam.worldToScreen(myPos, this.startScr);
        cam.worldToScreen(pPos, this.playerScr);

        this.retreatScr.copy(this.startScr);

        const camPos = cameraEntity.getPosition();
        this.startDepth = camPos.distance(myPos);
        this.playerDepth = camPos.distance(pPos);

        this.counted = true;
        ExpOrb.activeAnims++;

        this.state = 'fly';
        this.t = 0;
    }

    private updatePick(dt: number) {
        const cam = this.cam;
        const cameraEntity = this.cameraEntity;
        const playerEntity = this.playerEntity;
        if (!cam || !cameraEntity || !playerEntity) {
            this.finish();
            return;
        }

        this.t += dt;

        const cfg = VFXConfig.expOrb;
        const flyCfg = cfg.fly;

        const t = Math.min(1, this.t / this.flyDur);
        const e = this.easeOutQuad(t);

        const pPos = playerEntity.getPosition();
        cam.worldToScreen(pPos, this.playerScr);
        this.playerDepth = cameraEntity.getPosition().distance(pPos);

        const sx = this.retreatScr.x;
        const sy = this.retreatScr.y;
        const ex = this.playerScr.x;
        const ey = this.playerScr.y;

        const dx = ex - sx;
        const dy = ey - sy;
        const len = Math.hypot(dx, dy) || 1;
        const nx = dx / len;
        const ny = dy / len;
        const px = -ny;
        const py = nx;

        const mx = (sx + ex) * 0.5;
        const my = (sy + ey) * 0.5;
        const cx = mx + px * flyCfg.curvePixels * this.curveSide;
        const cy = my + py * flyCfg.curvePixels * this.curveSide;

        const u = 1 - e;
        let x = u * u * sx + 2 * u * e * cx + e * e * ex;
        let y = u * u * sy + 2 * u * e * cy + e * e * ey;
        const wave = Math.sin(this.wavePhase + e * flyCfg.waveFrequency * Math.PI * 2) * flyCfg.wavePixels;
        x += px * wave;
        y += py * wave;

        const depth = pc.math.lerp(this.startDepth, this.playerDepth, e);
        cam.screenToWorld(x, y, depth, this.tmpWorld);
        this.entity.setPosition(this.tmpWorld);

        const endScale = this.startScale * cfg.scaleEndRatio;
        const s = pc.math.lerp(this.startScale, endScale, e);
        this.entity.setLocalScale(s, s, s);

        if (t >= 1) this.finish();
    }

    private finish() {
        const playerEntity = this.playerEntity ?? this.context.getPlayer();
        playerEntity?.fire('exp', this.expValue);

        if (this.counted) {
            this.counted = false;
            ExpOrb.activeAnims = Math.max(0, ExpOrb.activeAnims - 1);
        }

        this.destroy();
    }


    private rand(min: number, max: number): number {
        const a = Math.min(min, max);
        const b = Math.max(min, max);
        return a + Math.random() * (b - a);
    }

    private easeOutQuad(t: number): number {
        return 1 - (1 - t) * (1 - t);
    }
}
