import * as pc from "playcanvas";
import { BaseCharacter } from "../share/BaseCharacter";
import { PlayerStats } from "../../../config/types";
import { CharacterRegistry } from "../CharacterRegistry";
import { ResourceManager } from "../../../core/manager/ResourceManager";

export class CharacterBBB extends BaseCharacter {
  constructor(entity: pc.Entity, stats?: Partial<PlayerStats>) {
    const defaultStats: PlayerStats = {
      currentHealth: 90,
      maxHealth: 90,
      defense: 3,
      magicDefense: 8,
      moveSpeed: 8.2,
      pickupRange: 3.5,
      expEfficiency: 1.15,
      luck: 2,
    };
    super(entity, { ...defaultStats, ...stats });
    this.initializeVisuals();
  }

  private initializeVisuals() {
    const resourceManager = ResourceManager.getInstance();
    const modelAsset = resourceManager.getAsset("druid");

    if (modelAsset && modelAsset.resource) {
      const container = modelAsset.resource as pc.ContainerResource;
      const modelEntity = container.instantiateRenderEntity();
      modelEntity.setLocalScale(1.35, 1.35, 1.35);
      modelEntity.setLocalEulerAngles(0, 0, 0);
      this.entity.addChild(modelEntity);
      return;
    }

    this.entity.addComponent("model", { type: "capsule" });

    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(0.18, 0.55, 0.32);
    material.update();
    if (this.entity.model) {
      this.entity.model.material = material;
    }

    const orb = new pc.Entity("NatureOrb");
    orb.addComponent("model", { type: "sphere" });
    orb.setLocalScale(0.25, 0.25, 0.25);
    orb.setLocalPosition(0.35, 0.6, 0.25);
    const orbMat = new pc.StandardMaterial();
    orbMat.diffuse = new pc.Color(0.65, 0.9, 0.65);
    orbMat.update();
    if (orb.model) {
      orb.model.material = orbMat;
    }
    this.entity.addChild(orb);
  }
}

CharacterRegistry.register("c_BBB", CharacterBBB);
