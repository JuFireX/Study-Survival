import * as pc from 'playcanvas';
import { Joystick } from '../ui/Joystick';
import { PlayerController } from '../scripts/components/PlayerController';
import { EnemyBehavior } from '../scripts/components/EnemyBehavior';
import { WeaponController } from '../scripts/components/WeaponController';
import { BulletBehavior } from '../scripts/components/BulletBehavior';
import { FloatingTextManager } from '../ui/FloatingTextManager';
import { QuestionManager } from './QuizSystem';

export class GameManager {
    app: pc.Application;
    joystick: Joystick;
    player: pc.Entity;
    floatingText: FloatingTextManager;
    questionManager: QuestionManager;
    spawnTimer: number = 0;
    questionTimer: number = 0;

    constructor(app: pc.Application) {
        (window as any).gameManager = this;
        this.app = app;
        this.registerScripts();

        this.joystick = new Joystick();
        this.floatingText = new FloatingTextManager(app);

        this.player = this.createPlayer();
        this.setupScene();
        this.questionManager = new QuestionManager(app);
        this.app.on('update', this.update, this);
    }

    registerScripts() {
        pc.registerScript(PlayerController, 'playerController');
        pc.registerScript(EnemyBehavior, 'enemyBehavior');
        pc.registerScript(WeaponController, 'weaponController');
        pc.registerScript(BulletBehavior, 'bulletBehavior');
    }

    createPlayer() {
        const player = new pc.Entity('Player');
        player.addComponent('model', { type: 'capsule' });

        // Add script component
        player.addComponent('script');
        // Create the script instance
        const scriptInstance = player.script!.create('playerController', {
            attributes: {
                // If we had attributes
            }
        }) as PlayerController;

        // Setup dependency
        if (scriptInstance) {
            scriptInstance.setup(this.joystick);
        }

        // Add Weapon
        player.script!.create('weaponController');

        player.setPosition(0, 1, 0);
        this.app.root.addChild(player);
        return player;
    }

    setupScene() {
        // 地面
        const ground = new pc.Entity('Ground');
        ground.addComponent('model', { type: 'plane' });
        ground.setLocalScale(50, 1, 50);
        this.app.root.addChild(ground);

        // 主摄像机
        const camera = new pc.Entity('Camera');
        camera.addComponent('camera', {
            clearColor: new pc.Color(0.2, 0.2, 0.2)
        });
        this.app.root.addChild(camera);
        this.floatingText.setCamera(camera);

        // 环境光
        const light = new pc.Entity('Light');
        light.addComponent('light', {
            type: pc.LIGHTTYPE_DIRECTIONAL,
            intensity: 1
        });
        light.setEulerAngles(45, 45, 0);
        this.app.root.addChild(light);

        // 摄像机跟随玩家
        this.app.on('update', () => {
            const pos = this.player.getPosition();
            // 摄像机位置固定在玩家位置的 (0, 20, 15) 偏移量
            camera.setPosition(pos.x, 20, pos.z + 15);
            camera.lookAt(pos.x, 0, pos.z);
        });
    }

    update(dt: number) {
        this.spawnTimer += dt;
        if (this.spawnTimer > 2) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }

        this.questionTimer += dt;
        if (this.questionTimer > 10) {
            this.questionManager.triggerQuestion();
            this.questionTimer = 0;
        }
    }

    spawnEnemy() {
        const enemy = new pc.Entity('Enemy');
        enemy.addComponent('model', { type: 'box' });

        // Random pos around player
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 5;
        const playerPos = this.player.getPosition();
        const x = playerPos.x + Math.cos(angle) * dist;
        const z = playerPos.z + Math.sin(angle) * dist;

        enemy.setPosition(x, 1, z);

        enemy.addComponent('script');
        const script = enemy.script!.create('enemyBehavior') as EnemyBehavior;
        if (script) {
            script.setup(this.player);
        }

        // Set Color Red
        const material = new pc.StandardMaterial();
        material.diffuse.set(1, 0, 0);
        material.update();
        if (enemy.model) {
            enemy.model.material = material;
        }

        this.app.root.addChild(enemy);
    }
}
