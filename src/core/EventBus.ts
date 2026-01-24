import * as pc from "playcanvas";

/**
 * 全局事件总线 (EventBus)
 *
 * 职责:
 * 1. 封装 PlayCanvas 的 `pc.EventHandler`，提供统一的事件发布/订阅机制。
 * 2. 用于系统间 (`System` <-> `System`)、层级间 (`UI` <-> `Logic`) 以及组件间 (`Entity` <-> `System`) 的解耦通信。
 *
 * 使用单例模式确保全局唯一性。
 */
export class EventBus {
  private static instance: EventBus;
  private eventHandler: pc.EventHandler;

  private constructor() {
    this.eventHandler = new pc.EventHandler();
  }

  /**
   * 获取 EventBus 单例实例
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * 订阅事件
   * @param name 事件名称
   * @param callback 回调函数
   * @param scope 回调函数的作用域（通常是 `this`）
   * @returns 返回 handler 对象，可用于取消订阅
   */
  public on(name: string, callback: (...args: any[]) => void, scope: any): any {
    return this.eventHandler.on(name, callback, scope);
  }

  /**
   * 订阅一次性事件
   * 事件触发一次后会自动取消订阅
   * @param name 事件名称
   * @param callback 回调函数
   * @param scope 回调函数的作用域
   */
  public once(
    name: string,
    callback: (...args: any[]) => void,
    scope: any,
  ): any {
    return this.eventHandler.once(name, callback, scope);
  }

  /**
   * 取消订阅事件
   * @param name 事件名称
   * @param callback 回调函数
   * @param scope 回调函数的作用域
   */
  public off(
    name: string,
    callback: (...args: any[]) => void,
    scope: any,
  ): any {
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

  /**
   * 检查是否监听了某个事件
   * @param name 事件名称
   */
  public hasEvent(name: string): boolean {
    return this.eventHandler.hasEvent(name);
  }
}
