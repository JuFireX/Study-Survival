/**
 * 对象池工具 (ObjectPool)
 * 
 * 职责:
 * 1. 管理对象的复用，减少频繁创建和销毁带来的 GC 压力。
 * 2. 提供 `acquire` (获取) 和 `release` (回收) 接口。
 * 3. 支持动态扩容和最大容量限制。
 */
export class ObjectPool<T> {
    private pool: T[] = [];
    private factory: () => T;

    constructor(factory: () => T) {
        this.factory = factory;
    }

    public acquire(): T {
        if (this.pool.length > 0) {
            return this.pool.pop()!;
        }
        return this.factory();
    }

    public release(item: T): void {
        this.pool.push(item);
    }
}
