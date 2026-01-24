import * as pc from "playcanvas";
import { BaseWeapon } from "../share/BaseWeapon";
import { PistolBullet } from "./PistolBullet";
import { WeaponRegistry } from "../WeaponRegistry";

export class Pistol extends BaseWeapon {
  private bullets: PistolBullet[] = [];

  public update(dt: number) {
    // 1. 处理基础冷却和自动攻击
    super.update(dt);

    // 2. 更新所有子弹
    // 倒序遍历以便安全删除
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(dt);

      if (bullet.isDead) {
        this.bullets.splice(i, 1);
      }
    }
  }

  protected attack(): void {
    const app = pc.Application.getApplication();
    if (!app) return;

    // 寻找最近的敌人
    const enemies = app.root.findByTag("enemy") as pc.Entity[];
    const ownerPos = this.owner.getPosition();
    let targetDir = this.owner.forward.clone(); // 默认朝向前方

    if (enemies.length > 0) {
      let minDistSq = Infinity;
      let nearestEnemy: pc.Entity | null = null;

      for (const enemy of enemies) {
        const distSq = enemy.getPosition().clone().sub(ownerPos).lengthSq();
        if (distSq < minDistSq) {
          minDistSq = distSq;
          nearestEnemy = enemy;
        }
      }

      if (nearestEnemy) {
        // 计算指向敌人的向量
        targetDir = nearestEnemy.getPosition().clone().sub(ownerPos);
        targetDir.y = 0; // 强制水平射击，避免打地或飞天
        targetDir.normalize();
      }
    }

    // 1. 创建子弹实体
    const bulletEntity = new pc.Entity("PistolBullet");

    // 2. 添加模型 (简单的球体)
    bulletEntity.addComponent("model", { type: "sphere" });
    bulletEntity.setLocalScale(0.3, 0.3, 0.3);

    const material = new pc.StandardMaterial();
    material.emissive = new pc.Color(1, 1, 0); // 发黄光
    material.update();
    bulletEntity.model!.material = material;

    // 3. 设置初始位置 (在角色位置 + 偏移)
    // 使用计算出的方向来确定起始位置偏移，稍微美观一点
    const startPos = ownerPos.clone().add(targetDir.clone().mulScalar(1.0));
    startPos.y += 1.0; // 抬高一点，保持在腰部/胸部高度
    bulletEntity.setPosition(startPos);

    // 4. 创建子弹管理对象 (不再使用 script 组件)
    const bullet = new PistolBullet(
      bulletEntity,
      this.stats.projectileSpeed || 20,
      this.stats.damage,
      this.stats.range || 20,
      targetDir,
    );

    this.bullets.push(bullet);

    // 5. 添加到场景 (必须添加后才能显示，但逻辑由 Pistol 管理)
    app.root.addChild(bulletEntity);
  }
}

WeaponRegistry.register("w_pistol", Pistol);
