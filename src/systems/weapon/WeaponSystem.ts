import * as pc from "playcanvas";
import {
  IGameSystem,
  WeaponStats,
  Card,
  CardType,
  BuffCard,
  CardEffect,
} from "../../config/types";
import { GameContext } from "../../core/GameContext";
import { EventBus } from "../../core/EventBus";
import { BaseWeapon } from "../../entities/weapons";
import { WeaponRegistry } from "../../entities/weapons/WeaponRegistry";
import { WeaponCards } from "../../config/cards";

// 导入以触发注册
import "../../entities/weapons/w_Pistol";
import "../../entities/weapons/w_Sword";

/**
 * 武器系统 (WeaponSystem)
 *
 * 职责:
 * 1. 管理所有激活的武器实例。
 * 2. 负责武器的生命周期 (创建, 升级, 销毁)。
 * 3. 驱动武器的帧更新。
 */
export class WeaponSystem implements IGameSystem {
  private context: GameContext;
  private eventBus: EventBus;
  private player: pc.Entity | null = null;
  private activeWeapons: BaseWeapon[] = [];
  private globalEffects: CardEffect[] = []; // 全局武器增益缓存

  constructor() {
    this.context = GameContext.getInstance();
    this.eventBus = this.context.getEventBus();

    this.eventBus.on("card:selected", this.onCardSelected, this);
  }

  private onCardSelected(_id: string, card: Card) {
    if (card.type === CardType.Weapon) {
      this.addWeapon(card.id);
    } else if (card.type === CardType.Buff) {
      const buffCard = card as BuffCard;
      buffCard.effects.forEach((effect) => {
        // 检查是否作用于武器
        if (effect.target.startsWith("w_")) {
          this.applyEffect(effect);
        }
      });
    }
  }

  private applyEffect(effect: CardEffect) {
    // 如果是全局武器增益，缓存下来以应用到未来新增的武器
    if (effect.target === "w_*") {
      this.globalEffects.push(effect);
      // 应用到当前所有武器
      this.activeWeapons.forEach((w) => w.applyEffect(effect));
      console.log(
        `[武器系统] 应用全局 Buff: ${effect.stat} ${effect.type} ${effect.value}`,
      );
    } else {
      // 特定武器增益 (e.g., w_pistol)
      // 注意：effect.target 可能是 "w_pistol" 这样的 ID
      this.activeWeapons.forEach((w) => {
        // 这里假设武器 ID 包含类型前缀或者我们需要根据类型匹配
        // 目前 BaseWeapon.id 是唯一的实例 ID (e.g. w_pistol_123456)
        // 而 effect.target 是类型 ID (e.g. w_pistol)
        // 所以我们需要检查武器实例的类型是否匹配
        // 由于 BaseWeapon 没有显式存储 type，我们可以通过构造函数名或者增加 type 字段
        // 现在的 id 格式是 type_timestamp，所以可以用 startWith
        if (w.id.startsWith(effect.target)) {
          w.applyEffect(effect);
          console.log(
            `[武器系统] 应用特定 Buff: ${w.id} ${effect.stat} ${effect.type} ${effect.value}`,
          );
        }
      });
    }
  }

  public addWeapon(type: string) {
    const player = this.player ?? this.context.getPlayer();
    if (!player) {
      console.warn("[武器系统] Player 未就绪，无法添加武器");
      return;
    }
    this.player = player;

    // 从配置查找武器卡牌
    const card = WeaponCards.find((c) => c.id === type);
    if (!card) {
      console.warn(`[武器系统] 未知武器类型 (无对应卡牌): ${type}`);
      return;
    }

    const id = `${type}_${Date.now()}`;

    // 使用卡牌定义的属性
    const stats: WeaponStats = { ...card.stats };

    // 创建武器实例
    const weapon = WeaponRegistry.create(type, id, player, stats);

    if (weapon) {
      this.activeWeapons.push(weapon);
      console.log(`[武器系统] 添加武器: ${type}`);

      // 1. 应用武器卡自带的效果
      if (card.effects && card.effects.length > 0) {
        card.effects.forEach((effect) => weapon.applyEffect(effect));
      }

      // 2. 应用已有的全局增益
      this.globalEffects.forEach((effect) => weapon.applyEffect(effect));

      this.eventBus.fire("weapon:added", weapon);
    } else {
      console.warn(`[武器系统] WeaponRegistry 无法创建类型为 ${type} 的武器`);
    }
  }

  /**
   * 获取当前所有武器
   */
  public getWeapons(): BaseWeapon[] {
    return this.activeWeapons;
  }

  initialize(): void {
    console.log("[武器系统] 初始化...");

    this.player = this.context.getPlayer();
    if (this.player) {
      this.addWeapon("w_pistol");
      return;
    }

    this.eventBus.once(
      "player:init",
      () => {
        this.addWeapon("w_pistol");
      },
      this,
    );
  }

  update(dt: number): void {
    this.activeWeapons.forEach((weapon) => {
      weapon.update(dt);
    });
  }
}
