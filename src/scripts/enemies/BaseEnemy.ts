import * as pc from 'playcanvas';
import { EnemyStats } from '../../data/types';
import { EventBus } from '../../core/EventBus';
// import { PlayerController } from '../components/PlayerController';

export class BaseEnemy extends pc.ScriptType {
    public stats!: EnemyStats;
    public player: pc.Entity | null = null;

    // Visuals
    private material!: pc.StandardMaterial;
    private originalColor: pc.Color = new pc.Color(1, 0, 0);

    // Health Bar
    private healthBarBg!: pc.Entity;
    private healthBarFill!: pc.Entity;

    initialize() {
        // Default stats if not set
        if (!this.stats) {
            this.stats = {
                currentHealth: 20,
                maxHealth: 20,
                damage: 5,
                defense: 0,
                moveSpeed: 3,
                expValue: 10
            };
        }

        this.setupVisuals();
        this.createHealthBar();
    }

    setupVisuals() {
        // Clone material so we can flash it on hit
        const model = this.entity.model;
        if (model && model.meshInstances && model.meshInstances.length > 0) {
            const meshInstance = model.meshInstances[0];
            this.material = meshInstance.material.clone() as pc.StandardMaterial;
            meshInstance.material = this.material;
            this.originalColor.copy(this.material.diffuse);
        }
    }

    createHealthBar() {
        // Create a simple health bar above the enemy
        // Using World Space UI, we need to be careful with scale.
        // Option 1: Use small width/height values (World Units)
        // Option 2: Use pixel values and scale down the entity

        // Let's go with Option 1 for simplicity: 0.8m wide, 0.1m high
        const width = 0.8;
        const height = 0.1;

        this.healthBarBg = new pc.Entity('HealthBarBg');
        this.healthBarBg.addComponent('element', {
            type: 'image',
            anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
            pivot: new pc.Vec2(0.5, 0.5),
            width: width,
            height: height,
            color: new pc.Color(0, 0, 0, 1),
            useInput: false
        });

        this.healthBarFill = new pc.Entity('HealthBarFill');
        this.healthBarFill.addComponent('element', {
            type: 'image',
            anchor: new pc.Vec4(0, 0.5, 0, 0.5), // Anchor Left-Center to respect height
            pivot: new pc.Vec2(0, 0.5),
            width: width - 0.04, // Margin
            height: height - 0.04,
            color: new pc.Color(1, 0, 0, 1),
            useInput: false
        });

        this.healthBarBg.addChild(this.healthBarFill);
        this.entity.addChild(this.healthBarBg);
        this.healthBarBg.setPosition(0, 1.5, 0); // Position above head

        // Ensure it faces camera (Billboard) - implemented in update
    }

    setup(player: pc.Entity, stats?: Partial<EnemyStats>) {
        this.player = player;
        if (stats) {
            this.stats = { ...this.stats, ...stats };
            this.stats.currentHealth = this.stats.maxHealth;
        }
    }

    update(dt: number) {
        if (!this.player) return;

        // Movement Logic
        const pos = this.entity.getPosition();
        const target = this.player.getPosition();
        const dist = pos.distance(target);

        if (dist > 0.5) {
            const dir = new pc.Vec3().sub2(target, pos).normalize();
            dir.y = 0; // Keep on ground

            this.entity.translate(dir.mulScalar(this.stats.moveSpeed * dt));
            this.entity.lookAt(target.x, pos.y, target.z);
        } else {
            // Attack logic (simple collision/distance based)
            // Ideally handled by CombatSystem, but we can do simple tick damage here
        }

        // Update Health Bar Rotation
        // Use global app reference instead of casting this.app
        const app = pc.Application.getApplication();
        if (app) {
            const cameraEntity = app.root.findByName('Camera'); // Assuming 'Camera' is the main camera
            if (cameraEntity) {
                this.healthBarBg.lookAt(cameraEntity.getPosition());
                this.healthBarBg.rotateLocal(0, 180, 0); // Fix text/UI orientation
            }
        }
    }

    takeDamage(amount: number) {
        // Flash white
        if (this.material) {
            this.material.diffuse.set(1, 1, 1);
            this.material.update();
            setTimeout(() => {
                if (this.material) {
                    this.material.diffuse.copy(this.originalColor);
                    this.material.update();
                }
            }, 100);
        }

        // Apply Defense
        const damage = Math.max(1, amount - this.stats.defense);
        this.stats.currentHealth -= damage;

        // Update Health Bar
        if (this.healthBarFill && this.healthBarFill.element) {
            const width = 0.8; // Match the new width
            const pct = Math.max(0, this.stats.currentHealth / this.stats.maxHealth);
            this.healthBarFill.element.width = (width - 0.04) * pct;
        }

        EventBus.getInstance().fire('combat:damage', damage, this.entity.getPosition(), 'white');

        if (this.stats.currentHealth <= 0) {
            this.die();
        }
    }

    die() {
        // Drop XP
        EventBus.getInstance().fire('enemy:death', this.entity.getPosition(), this.stats.expValue);

        this.entity.destroy();
    }
}
