/**
 * 数据管理器 (DataManager)
 * 
 * 职责:
 * 1. 管理游戏静态数据 (配置表, 关卡数据等)。
 * 2. 提供数据的查询和解析接口。
 * 3. 类似于 "只读" 数据库。
 * 
 * 目前处于占位状态，后续可扩展。
 */

export class DataManager {
    private static instance: DataManager;

    private constructor() {
        // 加载初始数据
    }

    public static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    /**
     * 示例：获取某个配置
     * @param key 配置键
     */
    public getConfig(key: string): any {
        // TODO: 实现配置读取逻辑
        // 假设配置存储在一个 JSON 文件中
        const config = require('@/assets/config.json');
        return config[key] || null;
    }
}
