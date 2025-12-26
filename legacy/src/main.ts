import { GameApplication } from './core/GameApplication';
import { GameManager } from './core/GameManager';

const gameApp = new GameApplication();

gameApp.start().then(() => {
    GameManager.getInstance();
    console.log("游戏启动完成");
});
