/**
 * 存档管理器 (SaveManager)
 * 
 * 职责:
 * 1. 管理玩家进度的持久化 (Save/Load)。
 * 2. 处理存档版本迁移。
 * 3. 封装 LocalStorage 或其他存储后端。
 */
export class SaveManager {
    private static instance: SaveManager;
    private readonly SAVE_KEY = 'UGH_GAME_SAVE_V1';

    private constructor() {
        // 初始化存储
    }

    public static getInstance(): SaveManager {
        if (!SaveManager.instance) {
            SaveManager.instance = new SaveManager();
        }
        return SaveManager.instance;
    }

    /**
     * 保存数据
     * @param data 要保存的对象
     */
    public save(data: any): boolean {
        try {
            const json = JSON.stringify(data);
            localStorage.setItem(this.SAVE_KEY, json);
            return true;
        } catch (e) {
            console.error("[SaveManager] Save failed:", e);
            return false;
        }
    }

    /**
     * 读取存档
     */
    public load<T>(): T | null {
        try {
            const json = localStorage.getItem(this.SAVE_KEY);
            if (!json) return null;
            return JSON.parse(json) as T;
        } catch (e) {
            console.error("[SaveManager] Load failed:", e);
            return null;
        }
    }

    /**
     * 清除存档
     */
    public clear() {
        localStorage.removeItem(this.SAVE_KEY);
    }
}
