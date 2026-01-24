import { IGameSystem } from "../../config/types";
import { GameContext } from "../../core/GameContext";
import { BaseDrop, ExpOrb } from "../../entities/drops";
import { BaseEnemy } from "../../entities/enemies";

/**
 * 掉落物系统 (DropSystem)
 *
 * 职责:
 * 1. 监听敌人死亡事件，生成掉落物。
 * 2. 管理掉落物的更新和拾取检测。
 */
export class DropSystem implements IGameSystem {
  private static instance: DropSystem;
  private drops: BaseDrop[] = [];
  private context: GameContext;

  constructor() {
    DropSystem.instance = this;
    this.context = GameContext.getInstance();
  }

  public static getInstance(): DropSystem {
    return DropSystem.instance;
  }

  initialize(): void {
    console.log("[掉落物系统] 初始化...");
    // 监听敌人死亡事件
    this.context.getEventBus().on("enemy:die", this.onEnemyDie, this);
  }

  /**
   * 获取所有活跃的掉落物
   */
  public getDrops(): BaseDrop[] {
    return this.drops;
  }

  /**
   * 敌人死亡时触发
   */
  private onEnemyDie(enemy: BaseEnemy, expDrop: number) {
    if (expDrop > 0) {
      const pos = enemy.getPosition();
      // 掉落物生成在网格表面
      this.spawnExpOrb(pos.x, pos.y - 0.7, pos.z, expDrop);
    }
  }

  /**
   * 生成经验 orb
   */
  private spawnExpOrb(x: number, y: number, z: number, amount: number) {
    const orb = new ExpOrb(amount);
    orb.setPosition(x, y, z);
    this.drops.push(orb);
  }

  update(dt: number): void {
    // 优化：如果没有掉落物，直接返回
    if (this.drops.length === 0) return;

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];

      // 更新掉落物 (自转等)
      drop.update(dt);

      if (drop.isDestroyed()) {
        this.drops.splice(i, 1);
      }
    }
  }
}
