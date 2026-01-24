import * as pc from "playcanvas";
import { GameContext } from "../core/GameContext";
import { EnemyHealthBar } from "./EnemyHealthBar";

import { EventBus } from "../core/EventBus";
import type { BaseEnemy } from "../entities/enemies/share/BaseEnemy";

/**
 * 敌人血条管理器 (EnemyHealthBarManager)
 *
 * 职责:
 * 1. 集中管理所有 EnemyHealthBar 实例。
 * 2. 统一处理帧更新，优化性能。
 * 3. 监听 'enemy:spawn' 事件自动创建血条。
 */
export class EnemyHealthBarManager {
  private bars: EnemyHealthBar[] = [];
  private app: pc.Application;
  private eventBus: EventBus;

  constructor() {
    this.app = GameContext.getInstance().getApp();
    this.eventBus = EventBus.getInstance();

    // 统一监听一次 update
    this.app.on("update", this.update, this);

    // 监听敌人生成事件
    this.eventBus.on("enemy:spawn", this.onEnemySpawn, this);
  }

  /**
   * 当敌人生成时自动创建血条
   */
  private onEnemySpawn(enemy: BaseEnemy) {
    this.create(enemy.entity);
  }

  /**
   * 创建一个新的血条并纳入管理
   */
  public create(target: pc.Entity, offsetY: number = 2.5): EnemyHealthBar {
    const bar = new EnemyHealthBar(target, offsetY);
    this.bars.push(bar);
    return bar;
  }

  /**
   * 移除血条 (当血条销毁时调用)
   */
  public remove(bar: EnemyHealthBar) {
    const index = this.bars.indexOf(bar);
    if (index !== -1) {
      this.bars.splice(index, 1);
    }
  }

  private update() {
    // 倒序遍历，安全删除
    for (let i = this.bars.length - 1; i >= 0; i--) {
      const bar = this.bars[i];
      if (bar.isValid()) {
        bar.manualUpdate();
      } else {
        bar.destroy(); // 确保清理 DOM
        this.bars.splice(i, 1);
      }
    }
  }

  public destroy() {
    this.app.off("update", this.update, this);
    this.eventBus.off("enemy:spawn", this.onEnemySpawn, this);
    // 清理所有血条
    this.bars.forEach((bar) => bar.destroy());
    this.bars = [];
  }
}
