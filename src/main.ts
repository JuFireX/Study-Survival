import { GameApplication } from './core/GameApplication';
import { GameManager } from './core/GameManager';

const gameApp = new GameApplication();

// 启动游戏 (异步加载资源)
gameApp.start().then(() => {
    // 资源加载完成且 App 启动后，初始化游戏管理器
    GameManager.getInstance();
    console.log("Game Started with Modular Architecture - v2.0");
});
