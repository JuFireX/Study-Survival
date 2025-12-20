import * as pc from 'playcanvas';
import { IGameSystem } from './IGameSystem';
import { GameContext } from '../core/GameContext';
import { EventBus } from '../core/EventBus';

/**
 * DebugSystem
 * - 按 P 键或触发事件 `debug:printPlayer` 将玩家状态打印到控制台
 */
export class DebugSystem implements IGameSystem {
    private eventBus: EventBus;
    private app: pc.Application | null = null;
    // private pDown = false;
    private autoLog = false; // 连续打印开关
    private lastLog = 0;
    private logInterval = 500; // ms

    constructor() {
        this.eventBus = EventBus.getInstance();
    }

    initialize(): void {
        try {
            this.app = GameContext.getInstance().getApp();
        } catch (e) {
            this.app = null;
        }

        this.eventBus.on('debug:printPlayer', this.printPlayerStatus, this);
        // 监听玩家状态相关事件，发生变化时立即打印
        this.eventBus.on('player:statsChanged', this.printPlayerStatus, this);
        this.eventBus.on('ui:updateHealth', this.printPlayerStatus, this);
        this.eventBus.on('ui:updateExp', this.printPlayerStatus, this);
        this.eventBus.on('player:levelUp', this.printPlayerStatus, this);
    }

    update(dt: number): void {
        void dt;
        if (!this.app || !this.app.keyboard) return;
        // 使用 L 键切换自动连续打印（节流）
        const isL = this.app.keyboard.isPressed(pc.KEY_L);
        if (isL && !this.autoLog) {
            this.autoLog = true;
            console.log('DebugSystem: autoLog ON');
        } else if (isL && this.autoLog) {
            // 当检测到 L 被按下且之前已开启时，这里也会再次触发；用简单方式切换状态
            this.autoLog = false;
            console.log('DebugSystem: autoLog OFF');
        }

        if (this.autoLog) {
            const now = Date.now();
            if (now - this.lastLog >= this.logInterval) {
                this.printPlayerStatus();
                this.lastLog = now;
            }
        }
    }

    private printPlayerStatus() {
        const ctx = GameContext.getInstance();
        const player = ctx.getPlayer();

        if (!player) {
            console.log('DebugSystem: no player entity set in GameContext');
            return;
        }

        const pos = player.getPosition();

        // 尝试读取常见脚本组件（按项目约定）
        const scripts = (player as any).script;
        const statsComp = scripts ? scripts.get('playerStats') : null;
        const controllerComp = scripts ? scripts.get('playerController') : null;

        const out: any = {
            position: { x: pos.x, y: pos.y, z: pos.z }
        };

        if (statsComp) {
            // statsComp 的类型来自 PlayerStats 脚本，使用 any 安全读取
            const sc = statsComp as any;
            const s = sc.stats ?? {};
            out.playerStats = {
                // 快速摘要
                currentHealth: s.currentHealth ?? null,
                maxHealth: s.maxHealth ?? null,
                tempShield: s.tempShield ?? null,
                // 经验/等级
                level: sc.level ?? null,
                currentExp: sc.currentExp ?? null,
                expToNextLevel: sc.expToNextLevel ?? null,
                // 全量属性（原始 stats 对象）
                fullStats: s
            };
        }
        console.log(statsComp);
        if (controllerComp) {
            out.controller = {
                speed: (controllerComp as any).speed ?? null
            };
        }

        // 打印并同时触发事件以便其他系统可监听
        console.log('--- Player Status ---\n', out);
        this.eventBus.fire('debug:playerStatus', out);
    }
}
