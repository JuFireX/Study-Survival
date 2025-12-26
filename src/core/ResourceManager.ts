import * as pc from 'playcanvas';
import { GameContext } from './GameContext';

/**
 * 资源管理类
 * 负责统一加载和管理游戏资源 (Texture, Audio, Models, etc.)
 */
export class ResourceManager {
    private static instance: ResourceManager;
    private assets: Map<string, pc.Asset> = new Map();
    private app: pc.Application;

    private constructor() {
        this.app = GameContext.getInstance().getApp();
    }

    public static getInstance(): ResourceManager {
        if (!ResourceManager.instance) {
            ResourceManager.instance = new ResourceManager();
        }
        return ResourceManager.instance;
    }

    /**
     * 加载所有预定义资源
     * 使用 Vite 的 import.meta.glob 自动扫描资源目录
     */
    public async loadAll(): Promise<void> {
        console.log("[ResourceManager] Start loading assets...");

        // 扫描 src/assets 下的图片和音频
        // eager: true 意味着直接返回解析后的模块(这里是 url 字符串), 而不是 import 函数
        const images = import.meta.glob('../assets/image/*.{png,jpg,jpeg}', { as: 'url', eager: true });
        const audio = import.meta.glob('../assets/music/*.{mp3,wav,ogg}', { as: 'url', eager: true });

        const loadPromises: Promise<void>[] = [];

        // 加载图片资源
        for (const path in images) {
            const url = images[path];
            const name = this.extractName(path);
            loadPromises.push(this.loadAsset(name, 'texture', url));
        }

        // 加载音频资源
        for (const path in audio) {
            const url = audio[path];
            const name = this.extractName(path);
            loadPromises.push(this.loadAsset(name, 'audio', url));
        }

        await Promise.all(loadPromises);
        console.log(`[ResourceManager] All assets loaded. Total: ${this.assets.size}`);
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
                    console.error(`[ResourceManager] Failed to load ${name} (${url}):`, err);
                    // 即使失败也 resolve，避免阻塞整个游戏流程，但会打印错误
                    resolve();
                    return;
                }

                if (asset) {
                    asset.name = name;
                    this.assets.set(name, asset);
                    console.log(`[ResourceManager] Loaded: ${name} (${type})`);
                }
                resolve();
            });
        });
    }

    /**
     * 获取已加载的资源
     */
    public getAsset(name: string): pc.Asset | undefined {
        return this.assets.get(name);
    }

    /**
     * 获取纹理资源 (Helper)
     */
    public getTexture(name: string): pc.Texture | null {
        const asset = this.getAsset(name);
        if (asset && asset.resource) {
            return asset.resource as pc.Texture;
        }
        return null;
    }
}
