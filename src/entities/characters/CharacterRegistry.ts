import * as pc from "playcanvas";
import { BaseCharacter } from "./share/BaseCharacter";

// 定义构造函数类型
export type CharacterConstructor = new (entity: pc.Entity) => BaseCharacter;

/**
 * 角色注册表 (CharacterRegistry)
 *
 * 职责:
 * 1. 提供角色类的注册机制，解耦 System 和具体 Character 实现。
 * 2. 提供统一的工厂方法来创建角色实例。
 */
export class CharacterRegistry {
  private static registry = new Map<string, CharacterConstructor>();

  /**
   * 注册一个角色类
   * @param type 角色类型标识符 (如 'c_AAA')
   * @param ctor 角色类的构造函数
   */
  public static register(type: string, ctor: CharacterConstructor) {
    if (this.registry.has(type)) {
      console.warn(`[角色注册表] 角色类型 '${type}' 已注册. 覆盖.`);
    }
    this.registry.set(type, ctor);
    console.log(`[角色注册表] 注册: ${type}`);
  }

  /**
   * 创建角色实例
   * @param type 角色类型标识符
   * @param entity 绑定的实体
   * @returns 角色实例，如果未找到则返回 null
   */
  public static create(type: string, entity: pc.Entity): BaseCharacter | null {
    const Ctor = this.registry.get(type);
    if (!Ctor) {
      console.error(`[角色注册表] 未知角色类型: ${type}`);
      return null;
    }
    return new Ctor(entity);
  }

  /**
   * 获取所有注册的角色类型
   */
  public static getRegisteredTypes(): string[] {
    return Array.from(this.registry.keys());
  }
}
