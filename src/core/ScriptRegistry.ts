import * as pc from 'playcanvas';

/**
 * 脚本注册器 (ScriptRegistry)
 * 
 * 职责:
 * 1. 提供一个安全的脚本注册机制，解耦脚本定义与 App 初始化时机。
 * 2. 允许脚本在文件加载时"自我注册"到队列中。
 * 3. 在 App 启动后统一执行注册。
 */
export class ScriptRegistry {
    private static queue: { cls: typeof pc.Script, name: string }[] = [];
    private static initialized: boolean = false;

    /**
     * 将脚本加入注册队列
     * @param cls 脚本类
     * @param name 脚本名称 (在 Editor/Component 中使用的名称)
     */
    public static register(cls: typeof pc.Script, name: string) {
        if (this.initialized) {
            try {
                pc.registerScript(cls as any, name);
                console.log(`[ScriptRegistry] Registered (Late): ${name}`);
            } catch (e) {
                console.error(`[ScriptRegistry] Failed to register (Late) ${name}:`, e);
            }
        } else {
            this.queue.push({ cls, name });
        }
    }

    /**
     * 初始化所有排队的脚本
     * 必须在 pc.Application 创建后调用
     */
    public static init() {
        if (this.initialized) return;

        console.log(`[ScriptRegistry] Initializing ${ScriptRegistry.queue.length} scripts...`);
        ScriptRegistry.queue.forEach(({ cls, name }) => {
            try {
                pc.registerScript(cls as any, name);
                console.log(`[ScriptRegistry] Registered: ${name}`);
            } catch (e) {
                console.error(`[ScriptRegistry] Failed to register ${name}:`, e);
            }
        });

        // 清空队列 (或者保留以备查询?)
        ScriptRegistry.queue = [];
        this.initialized = true;
    }
}
