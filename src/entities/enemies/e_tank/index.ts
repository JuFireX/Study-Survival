import * as pc from "playcanvas";
import { BaseEnemy } from "../share/BaseEnemy";
import { EnemyRegistry } from "../EnemyRegistry";
import { ResourceManager } from "../../../core/manager/ResourceManager";

export class TankEnemy extends BaseEnemy {
  constructor() {
    super({
      maxHealth: 100,
      health: 100,
      speed: 1.5,
      damage: 10,
      expDrop: 50,
    });
  }

  protected setupModel() {
    const resourceManager = ResourceManager.getInstance();
    const modelAsset = resourceManager.getAsset("dragon1");

    if (modelAsset && modelAsset.resource) {
      const container = modelAsset.resource as pc.ContainerResource;
      const modelEntity = container.instantiateRenderEntity();
      modelEntity.setLocalScale(0.6, 0.6, 0.6);
      modelEntity.setLocalEulerAngles(0, 180, 0);

      this.entity.addChild(modelEntity);
      return;
    }

    this.entity.addComponent("model", {
      type: "box",
    });

    // 大一点
    this.entity.setLocalScale(1.0, 1.5, 1.0);

    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(0, 0, 1);
    material.update();
    this.entity.model!.material = material;
  }
}

EnemyRegistry.register("e_Tank", TankEnemy);
