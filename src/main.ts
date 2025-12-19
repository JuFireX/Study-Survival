import { GameApplication } from './core/GameApplication';
import { GameManager } from './systems/GameManager';

// 启动游戏
// 1. 初始化 Application 封装
const gameApp = new GameApplication();

// 2. 启动 PlayCanvas 引擎
gameApp.start();

// 3. 初始化游戏管理器
// GameManager 会从 GameContext 中获取 App 实例，因此不需要显式传递
new GameManager();

console.log("Game Started with Modular Architecture - v2.0");
