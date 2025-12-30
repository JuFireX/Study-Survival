import * as pc from 'playcanvas';
import { BaseCharacter } from '../share/BaseCharacter';
import { PlayerStats } from '../../../config/types';
import { CharacterSystem } from '../../../systems/character/CharacterSystem';
import { GameContext } from '../../../core/GameContext';

export class CharacterAAA extends BaseCharacter {
    constructor(entity: pc.Entity, stats?: Partial<PlayerStats>) {
        const defaultStats: PlayerStats = {
            currentHealth: 100,
            maxHealth: 100,
            defense: 5,
            magicDefense: 0,
            moveSpeed: 8, // 稍微快一点
            pickupRange: 3,
            expEfficiency: 1.0,
            luck: 0
        };
        super(entity, { ...defaultStats, ...stats });
        this.initializeVisuals();

        // 订阅事件
        GameContext.getInstance().getEventBus().on('player:hit', this.onPlayerHit, this);
    }

    private initializeVisuals() {
        // 如果实体没有模型，添加一个简单的胶囊体作为占位
        if (!this.entity.model) {
            this.entity.addComponent('model', {
                type: 'capsule',
            });

            // 添加材质颜色区分
            const material = new pc.StandardMaterial();
            material.diffuse = new pc.Color(0.2, 0.6, 1.0); // 蓝色
            material.update();
            this.entity.model!.material = material;
        }
    }

    private onPlayerHit(damage: number) {
        this.takeDamage(damage);
    }

    public update(dt: number) {
        super.update(dt);

        // 获取输入并移动
        const system = CharacterSystem.getInstance();
        if (system) {
            const input = system.getJoystickInput();
            const inputLenSq = input.lengthSq();

            if (inputLenSq > 0.0001) {
                const moveDir = new pc.Vec3(input.x, 0, input.y);
                if (inputLenSq > 1) {
                    moveDir.normalize();
                }
                this.move(moveDir, dt);
            }
        }

        // AAA 特有的逻辑
    }

    public destroy() {
        GameContext.getInstance().getEventBus().off('player:hit', this.onPlayerHit, this);
        super.destroy();
    }
}
