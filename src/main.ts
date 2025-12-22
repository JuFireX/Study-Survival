import { GameApplication } from './core/GameApplication';
import { GameManager } from './core/GameManager';

const gameApp = new GameApplication();
gameApp.start();

GameManager.getInstance();

console.log("Game Started with Modular Architecture - v2.0");
