import * as pc from 'playcanvas';
import { PlayerStats } from './PlayerStats';
import { PlayerController } from './PlayerController';
import { EventBus } from '../../../core/EventBus';

/**
 * 角色基类
 * 所有可玩角色的基础脚本，处理通用逻辑如视觉反馈、组件引用等。
 */
export class BaseCharacter extends pc.ScriptType {
    protected stats: PlayerStats | null = null;
    protected controller: PlayerController | null = null;

    private materials: pc.StandardMaterial[] = [];
    private originalColors: pc.Color[] = [];
    private flashTimer: number = 0;
    private isFlashing: boolean = false;
    private eventBus: EventBus | null = null;

    initialize() {
        const scripts = (this.entity as any).script;
        this.stats = scripts ? (scripts.get('playerStats') as PlayerStats) : null;
        this.controller = scripts ? (scripts.get('playerController') as PlayerController) : null;

        this.setupVisuals();
        this.applyCharacterStyle();
        this.captureOriginalColors();

        this.eventBus = EventBus.getInstance();
        this.eventBus.on('combat:hit', this.onCombatHit, this);

        this.on('destroy', () => {
            if (this.eventBus) {
                this.eventBus.off('combat:hit', this.onCombatHit, this);
            }
        });
    }

    update(dt: number) {
        if (this.isFlashing) {
            this.flashTimer -= dt;
            if (this.flashTimer <= 0) {
                this.resetColor();
            }
        }
    }

    private setupVisuals() {
        const model = this.entity.model;
        const meshInstances = model?.meshInstances ?? [];

        this.materials = [];
        this.originalColors = [];

        for (const mi of meshInstances) {
            const mat = mi.material.clone() as pc.StandardMaterial;
            mi.material = mat;
            this.materials.push(mat);
            this.originalColors.push(mat.diffuse.clone());
        }
    }

    protected applyCharacterStyle() {}

    private captureOriginalColors() {
        for (let i = 0; i < this.materials.length; i++) {
            const mat = this.materials[i];
            const col = this.originalColors[i];
            if (mat && col) {
                col.copy(mat.diffuse);
            }
        }
    }

    private onCombatHit(target: pc.Entity, damage: number, pos: pc.Vec3) {
        damage = damage;
        pos = pos;
        if (target === this.entity) {
            this.onTakeDamage();
        }
    }

    /**
     * 受击视觉反馈
     */
    public onTakeDamage() {
        if (this.materials.length === 0) return;

        for (const mat of this.materials) {
            mat.diffuse.set(1, 0, 0);
            mat.update();
        }

        this.isFlashing = true;
        this.flashTimer = 0.1;
    }

    private resetColor() {
        for (let i = 0; i < this.materials.length; i++) {
            const mat = this.materials[i];
            const col = this.originalColors[i];
            if (mat && col) {
                mat.diffuse.copy(col);
                mat.update();
            }
        }
        this.isFlashing = false;
    }
}