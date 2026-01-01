import * as pc from 'playcanvas';
import { GameContext } from '../GameContext';

/**
 * 资源管理类 (ResourceManager)
 * 
 * 职责:
 * 1. 负责统一加载和管理游戏资源 (Texture, Audio, Models 等)。
 * 2. 使用 Vite 的 `import.meta.glob` 功能自动扫描和加载资源。
 * 3. 提供按名称获取资源的接口。
 */
export class ResourceManager {
    private static instance: ResourceManager;
    private assets: Map<string, pc.Asset> = new Map();
    private context: GameContext;
    private app: pc.Application;

    private constructor() {
        this.context = GameContext.getInstance();
        this.app = this.context.getApp();
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): ResourceManager {
        if (!ResourceManager.instance) {
            ResourceManager.instance = new ResourceManager();
        }
        return ResourceManager.instance;
    }

    /**
     * 加载所有预定义资源
     * 自动扫描 `src/assets` 目录下的图片和音频文件
     */
    public async loadAll(): Promise<void> {
        console.log("[资源管理器] 加载资源...");

        try {
            // 扫描 src/assets 下的图片和音频
            // eager: true 意味着直接返回解析后的模块(这里是 url 字符串), 而不是 import 函数
            // 注意: 相对路径基于当前文件位置 (src/core/manager/)
            const images = import.meta.glob('../../assets/image/*.{png,jpg,jpeg}', { query: '?url', import: 'default', eager: true });
            const audio = import.meta.glob('../../assets/music/*.{mp3,wav,ogg}', { query: '?url', import: 'default', eager: true });

            const loadPromises: Promise<void>[] = [];

            // 加载图片资源
            for (const path in images) {
                const url = images[path] as string;
                const name = this.extractName(path);
                loadPromises.push(this.loadAsset(name, 'texture', url));
            }

            // 加载音频资源
            for (const path in audio) {
                const url = audio[path] as string;
                const name = this.extractName(path);
                loadPromises.push(this.loadAsset(name, 'audio', url));
            }

            await Promise.all(loadPromises);
            console.log(`[资源管理器] 所有资源加载完成. 总数: ${this.assets.size}`);

        } catch (error) {
            console.error("[资源管理器] 加载资源时发生致命错误:", error);
            throw error;
        }
    }

    /**
     * 从路径中提取文件名作为资源 ID
     * @example "../assets/image/test.jpeg" -> "test"
     */
    private extractName(path: string): string {
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        // 移除扩展名
        return filename.split('.')[0];
    }

    /**
     * 实际加载单个资源
     */
    private loadAsset(name: string, type: string, url: string): Promise<void> {
        return new Promise((resolve) => {
            this.app.assets.loadFromUrl(url, type, (err, asset) => {
                if (err) {
                    console.error(`[资源管理器] 加载 ${name} (${url}) 失败:`, err);
                    // 即使失败也 resolve，避免阻塞整个游戏流程，但会打印错误
                    resolve();
                    return;
                }

                if (asset) {
                    asset.name = name;
                    this.assets.set(name, asset);
                    console.log(`[资源管理器] 加载成功: ${name} (${type})`);
                }
                resolve();
            });
        });
    }

    /**
     * 获取已加载的资源
     * @param name 资源名称 (不含扩展名)
     */
    public getAsset(name: string): pc.Asset | undefined {
        return this.assets.get(name);
    }

    /**
     * 获取纹理资源 (Helper)
     * @param name 资源名称
     */
    public getTexture(name: string): pc.Texture | null {
        const asset = this.getAsset(name);
        if (asset && asset.resource) {
            return asset.resource as pc.Texture;
        }
        return null;
    }
}
