import * as pc from 'playcanvas';
import { IGameSystem } from '../share/IGameSystem';
import { EventBus } from '../../core/EventBus';
import { GameContext } from '../../core/GameContext';
import { UIManager } from '../../core/UIManager';
import { WorldLevelConfig } from '../../config/evolution';
import { ExpOrb } from '../../entities/drops/ExpOrb';
import { FastEnemy } from '../../entities/enemies/e_fast/FastEnemy';
import { TankEnemy } from '../../entities/enemies/e_tank/TankEnemy';

export class EnemySystem implements IGameSystem {
    private app: pc.Application;
    private eventBus: EventBus;
    private ui: UIManager;

    // Spawning
    private timer: number = 0;
    private spawnInterval: number = WorldLevelConfig.Enemy.spawnInterval;

    constructor(ui: UIManager) {
        this.app = GameContext.getInstance().getApp();
        this.eventBus = EventBus.getInstance();
        this.ui = ui;

        // 注册脚本
        pc.registerScript(ExpOrb, 'expOrb');
        // FastEnemy 和 TankEnemy 可能已经在 GameManager 中注册，但这里再次注册也无妨（或者检查是否已注册）
        // pc.registerScript(FastEnemy, 'fastEnemy');
        // pc.registerScript(TankEnemy, 'tankEnemy');
    }

    initialize() {
        console.log("EnemySystem initialized");
        this.eventBus.on('enemy:death', this.onEnemyDeath, this);
        this.eventBus.on('combat:damage', this.onDamage, this);
        this.eventBus.on('combat:hit', this.onHit, this);
    }

    update(dt: number) {
        this.timer += dt;
        if (this.timer >= this.spawnInterval) {
            this.spawnEnemy();
            this.timer = 0;
        }
    }

    private onHit(target: pc.Entity, damage: number) {
        // 确认目标是敌人
        if (!target.script) return;

        let script: any = null;
        if (target.script.has('fastEnemy')) script = target.script.get('fastEnemy');
        else if (target.script.has('tankEnemy')) script = target.script.get('tankEnemy');
        else if (target.script.has('baseEnemy')) script = target.script.get('baseEnemy');

        if (script && script.takeDamage) {
            script.takeDamage(damage);
        }
    }

    // --- Spawning Logic ---
    private spawnEnemy() {
        const player = GameContext.getInstance().getPlayer();
        if (!player) return;

        const enemy = new pc.Entity('Enemy');

        // Randomly choose enemy type
        const type = Math.random() < 0.7 ? 'fast' : 'tank';

        if (type === 'fast') {
            enemy.addComponent('model', { type: 'sphere' }); // Visual distinction
        } else {
            enemy.addComponent('model', { type: 'box' });
        }

        // 在玩家周围随机生成
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 5;
        const playerPos = player.getPosition();
        const x = playerPos.x + Math.cos(angle) * dist;
        const z = playerPos.z + Math.sin(angle) * dist;

        enemy.setPosition(x, 1, z);

        // 添加脚本
        enemy.addComponent('script');

        if (type === 'fast') {
            const script = enemy.script!.create('fastEnemy') as FastEnemy;
            if (script) script.setup(player);
        } else {
            const script = enemy.script!.create('tankEnemy') as TankEnemy;
            if (script) script.setup(player);
        }

        this.app.root.addChild(enemy);
    }

    // --- Drop Logic ---
    private onEnemyDeath(position: pc.Vec3, expValue: number) {
        const orb = new pc.Entity('ExpOrb');
        orb.addComponent('model', { type: 'sphere' });
        orb.setLocalScale(0.3, 0.3, 0.3);

        // Green color for XP
        const material = new pc.StandardMaterial();
        material.diffuse.set(0, 1, 0);
        material.update();
        if (orb.model) orb.model.material = material;

        orb.setPosition(position);

        orb.addComponent('script');
        const script = orb.script!.create('expOrb') as ExpOrb;
        script.value = expValue;

        this.app.root.addChild(orb);
    }

    // --- Feedback Logic ---
    private onDamage(damage: number, pos: pc.Vec3, color: string) {
        // 如果伤害为0，可能是未命中或无敌，这里假设0也显示
        const text = damage > 0 ? damage.toString() : (color === 'lime' ? 'Correct!' : 'Wrong!');

        // 调用 UI 显示飘字
        this.ui.showFloatingText(text, pos, color);
    }
}
