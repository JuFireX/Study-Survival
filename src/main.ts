import { GameApplication } from "./core/GameApplication";

const gameApp = new GameApplication();

gameApp.start().then(() => {
  console.log("游戏启动完成");
});
