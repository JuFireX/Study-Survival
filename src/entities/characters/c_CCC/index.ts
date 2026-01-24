import * as pc from "playcanvas";
import { BaseCharacter } from "../share/BaseCharacter";
import { PlayerStats } from "../../../config/types";
import { CharacterRegistry } from "../CharacterRegistry";
import { ResourceManager } from "../../../core/manager/ResourceManager";

export class CharacterCCC extends BaseCharacter {
  constructor(entity: pc.Entity, stats?: Partial<PlayerStats>) {
    const defaultStats: PlayerStats = {
      currentHealth: 110,
      maxHealth: 110,
      defense: 8,
      magicDefense: 2,
      moveSpeed: 7,
      pickupRange: 2.8,
      expEfficiency: 1.0,
      luck: 1,
    };
    super(entity, { ...defaultStats, ...stats });
    this.initializeVisuals();
  }

  private initializeVisuals() {
    const resourceManager = ResourceManager.getInstance();
    const modelAsset = resourceManager.getAsset("engineer");

    if (modelAsset && modelAsset.resource) {
      const container = modelAsset.resource as pc.ContainerResource;
      const modelEntity = container.instantiateRenderEntity();
      modelEntity.setLocalScale(1.25, 1.25, 1.25);
      modelEntity.setLocalEulerAngles(0, 0, 0);
      this.entity.addChild(modelEntity);
      return;
    }

    this.entity.addComponent("model", { type: "box" });

    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(0.55, 0.6, 0.65);
    material.update();
    if (this.entity.model) {
      this.entity.model.material = material;
    }

    const backpack = new pc.Entity("Backpack");
    backpack.addComponent("model", { type: "box" });
    backpack.setLocalScale(0.5, 0.6, 0.3);
    backpack.setLocalPosition(0, 0.5, -0.35);
    const packMat = new pc.StandardMaterial();
    packMat.diffuse = new pc.Color(0.25, 0.3, 0.35);
    packMat.update();
    if (backpack.model) {
      backpack.model.material = packMat;
    }
    this.entity.addChild(backpack);

    const visor = new pc.Entity("Visor");
    visor.addComponent("model", { type: "box" });
    visor.setLocalScale(0.45, 0.15, 0.1);
    visor.setLocalPosition(0, 0.75, 0.55);
    const visorMat = new pc.StandardMaterial();
    visorMat.diffuse = new pc.Color(0.9, 0.75, 0.2);
    visorMat.update();
    if (visor.model) {
      visor.model.material = visorMat;
    }
    this.entity.addChild(visor);
  }
}

CharacterRegistry.register("c_CCC", CharacterCCC);
