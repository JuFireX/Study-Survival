import * as pc from 'playcanvas';
import { BaseDrop } from './BaseDrop';
import { BaseCharacter } from '../characters';

/**
 * 经验球 (ExpOrb)
 * 
 * 职责:
 * 1. 代表一个经验值掉落物。
 * 2. 被拾取时给玩家增加经验。
 */
export class ExpOrb extends BaseDrop {
    private expValue: number;

    constructor(expValue: number) {
        super();
        this.expValue = expValue;
        this.setupModel();
    }

    private setupModel() {
        this.entity.addComponent('model', {
            type: 'sphere'
        });

        // 材质
        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(0, 0.5, 1); // 蓝色
        material.emissive = new pc.Color(0, 0.2, 0.8); // 发光
        material.update();

        if (this.entity.model) {
            this.entity.model.material = material;
        }

        // 缩放
        this.entity.setLocalScale(0.3, 0.3, 0.3);
    }

    public onPickUp(): void {
        if (this.isPicked) return;
        this.isPicked = true;

        const playerEntity = this.context.getPlayer();
        if (playerEntity) {
            // 获取绑定在实体上的 BaseCharacter 实例
            // 假设我们在 BaseCharacter 中做了类似 (entity as any).baseCharacter = this 的绑定
            // 或者我们需要一种方式从 entity 获取到 Logic Class
            const player = (playerEntity as any).baseCharacter as BaseCharacter;

            if (player && typeof player.addExp === 'function') {
                console.log(`[ExpOrb] Picked up! +${this.expValue} exp`);
                player.addExp(this.expValue);
            } else {
                console.warn("[ExpOrb] Player entity found but no 'addExp' method or baseCharacter binding!");
            }
        }

        this.destroy();
    }
}
