import { BaseEnemy } from './share/BaseEnemy';

export type EnemyConstructor = new () => BaseEnemy;

/**
 * 敌人注册表 (EnemyRegistry)
 */
export class EnemyRegistry {
    private static registry = new Map<string, EnemyConstructor>();

    /**
     * 注册敌人类型
     */
    public static register(type: string, ctor: EnemyConstructor) {
        if (this.registry.has(type)) {
            console.warn(`[EnemyRegistry] Enemy type '${type}' is already registered. Overwriting.`);
        }
        this.registry.set(type, ctor);
        console.log(`[EnemyRegistry] Registered: ${type}`);
    }

    /**
     * 创建敌人实例
     */
    public static create(type: string): BaseEnemy | null {
        const Ctor = this.registry.get(type);
        if (!Ctor) {
            console.error(`[EnemyRegistry] Unknown enemy type: ${type}`);
            return null;
        }
        return new Ctor();
    }

    public static getRegisteredTypes(): string[] {
        return Array.from(this.registry.keys());
    }
}
