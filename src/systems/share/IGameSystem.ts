/**
 * 游戏系统接口
 * 所有游戏逻辑系统（如生成系统、战斗系统、Quiz系统）都应实现此接口。
 */
export interface IGameSystem {
    /**
     * 初始化系统
     */
    initialize(): void;

    /**
     * 更新系统
     * @param dt 上一帧的时间间隔（秒）
     */
    update(dt: number): void;
}
