import * as pc from 'playcanvas';

/**
 * 全局事件总线
 * 用于在系统的不同部分（UI、Systems、ECS 组件）之间进行解耦通信。
 * 包装了 PlayCanvas 的事件系统。
 */
export class EventBus {
    private static instance: EventBus;
    private eventHandler: pc.EventHandler;

    private constructor() {
        this.eventHandler = new pc.EventHandler();
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * 监听事件
     * @param name 事件名称
     * @param callback 回调函数
     * @param scope 回调函数的作用域（通常是 `this`）
     */
    public on(name: string, callback: (...args: any[]) => void, scope: any): any {
        return this.eventHandler.on(name, callback, scope);
    }

    /**
     * 监听一次性事件
     * @param name 事件名称
     * @param callback 回调函数
     * @param scope 回调函数的作用域
     */
    public once(name: string, callback: (...args: any[]) => void, scope: any): any {
        return this.eventHandler.once(name, callback, scope);
    }

    /**
     * 取消监听事件
     * @param name 事件名称
     * @param callback 回调函数
     * @param scope 回调函数的作用域
     */
    public off(name: string, callback: (...args: any[]) => void, scope: any): any {
        return this.eventHandler.off(name, callback, scope);
    }

    /**
     * 触发事件
     * @param name 事件名称
     * @param args 传递给回调函数的参数
     */
    public fire(name: string, ...args: any[]): any {
        return this.eventHandler.fire(name, ...args);
    }
}
