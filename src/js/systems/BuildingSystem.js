import Phaser from "phaser";

export class BuildingSystem {
  constructor(scene) {
    this.scene = scene;
    this.buildings = scene.add.group();

    // Building definitions (health, special properties)
    this.buildingTypes = {
      castle: {
        health: 20,
        width: 200,
        height: 200,
        onDestroy: () => this.onCastleDestroyed(),
      },
      wall: {
        health: 10,
        width: 60,
        height: 120,
      },
      tower: {
        health: 8,
        width: 80,
        height: 150,
        onUpdate: (building) => this.updateTower(building),
      },
      farm: {
        health: 5,
        width: 120,
        height: 80,
        onUpdate: (building) => this.updateFarm(building),
      },
      mine: {
        health: 6,
        width: 100,
        height: 100,
        onUpdate: (building) => this.updateMine(building),
      },
      "recruitment-hut": {
        health: 5,
        width: 80,
        height: 80,
        onUpdate: (building) => this.updateRecruitmentHut(building),
      },
      "archer-tower": {
        health: 7,
        width: 80,
        height: 180,
        onUpdate: (building) => this.updateArcherTower(building),
      },
    };
  }

  createBuilding(type, x, y) {
    if (!this.buildingTypes[type]) {
      console.error(`Unknown building type: ${type}`);
      return null;
    }

    // Create building as a sprite
    const building = this.scene.physics.add.sprite(x, y, type);

    // Set origin to bottom center so it sits on the ground
    building.setOrigin(0.5, 1);

    // Set as immovable (doesn't get pushed)
    building.setImmovable(true);
    building.body.allowGravity = false;

    // Add building properties
    building.type = type;
    building.health = this.buildingTypes[type].health;
    building.maxHealth = this.buildingTypes[type].health;
    building.buildingWidth = this.buildingTypes[type].width;
    building.buildingHeight = this.buildingTypes[type].height;
    building.onUpdate = this.buildingTypes[type].onUpdate;
    building.onDestroy = this.buildingTypes[type].onDestroy;

    // Add custom takeDamage method to building
    building.takeDamage = (amount) => this.damageBuildng(building, amount);

    // Add to buildings group
    this.buildings.add(building);

    // Create health bar for the building
    building.healthBar = this.createHealthBar(building);

    // Add collision with ground
    const grounds = this.scene.children.list.filter(
      (child) => child.texture && child.texture.key === "ground",
    );
    this.scene.physics.add.collider(building, grounds);

    return building;
  }

  damageBuildng(building, amount) {
    building.health -= amount;

    // Update health bar
    this.updateHealthBar(building);

    // Flash red when damaged
    building.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      building.clearTint();
    });

    // Check if destroyed
    if (building.health <= 0) {
      this.destroyBuilding(building);
    }
  }

  destroyBuilding(building) {
    // Call onDestroy function if it exists
    if (building.onDestroy) {
      building.onDestroy(building);
    }

    // Create destruction effect
    const particles = this.scene.add.particles("ground");
    const emitter = particles.createEmitter({
      x: building.x,
      y: building.y - building.height / 2,
      speed: { min: 50, max: 150 },
      angle: { min: 230, max: 310 },
      gravityY: 300,
      lifespan: 800,
      quantity: 3,
      scale: { start: 0.4, end: 0 },
    });

    // Emit particles then destroy
    emitter.explode(20);
    this.scene.time.delayedCall(800, () => {
      particles.destroy();
    });

    // Remove health bar
    if (building.healthBar) {
      building.healthBar.destroy();
    }

    // Destroy the building
    building.destroy();
  }

  createHealthBar(building) {
    const bar = this.scene.add.group();

    // Background
    const barWidth = 50;
    const barHeight = 8;
    const background = this.scene.add.rectangle(
      building.x,
      building.y - building.height - 15,
      barWidth,
      barHeight,
      0x000000,
    );
    background.setOrigin(0.5, 0.5);

    // Health fill
    const fill = this.scene.add.rectangle(
      building.x - barWidth / 2,
      building.y - building.height - 15,
      barWidth,
      barHeight,
      0x00ff00,
    );
    fill.setOrigin(0, 0.5);

    // Add to bar group
    bar.add(background);
    bar.add(fill);

    // Store fill reference for updates
    bar.fill = fill;

    return bar;
  }

  updateHealthBar(building) {
    if (!building.healthBar || !building.healthBar.fill) return;

    const healthPercent = building.health / building.maxHealth;
    const barWidth = 50;

    // Update width and color
    building.healthBar.fill.width = barWidth * healthPercent;

    // Change color based on health
    if (healthPercent > 0.6) {
      building.healthBar.fill.fillColor = 0x00ff00; // Green
    } else if (healthPercent > 0.3) {
      building.healthBar.fill.fillColor = 0xffff00; // Yellow
    } else {
      building.healthBar.fill.fillColor = 0xff0000; // Red
    }
  }

  getAllBuildings() {
    return this.buildings.getChildren();
  }

  update(time, delta) {
    // Update all buildings
    const buildings = this.buildings.getChildren();
    for (const building of buildings) {
      if (building.onUpdate) {
        building.onUpdate(building);
      }
    }
  }

  // Building-specific update functions
  updateTower(tower) {
    // In a full game, towers would attack nearby enemies
    const enemies = this.scene.enemies ? this.scene.enemies.getChildren() : [];

    if (enemies.length === 0) return;

    // Find enemies in range
    const attackRange = 250;
    const enemiesInRange = enemies.filter((enemy) => {
      return (
        Phaser.Math.Distance.Between(tower.x, tower.y, enemy.x, enemy.y) <
        attackRange
      );
    });

    // Attack nearest enemy
    if (
      enemiesInRange.length > 0 &&
      tower.lastAttack + 1000 < this.scene.time.now
    ) {
      tower.lastAttack = this.scene.time.now;

      // In a full game, would create projectile and damage enemy
    }
  }

  updateFarm(farm) {
    // Farms produce coins over time
    if (!farm.lastProduction) {
      farm.lastProduction = this.scene.time.now;
    }

    // Produce coin every 10 seconds
    const productionInterval = 10000;
    if (farm.lastProduction + productionInterval < this.scene.time.now) {
      farm.lastProduction = this.scene.time.now;

      // Create a coin
      this.scene.resourceSystem.createCoin(farm.x, farm.y - 40, 1);
    }
  }

  updateMine(mine) {
    // Mines produce coins over time (more than farms)
    if (!mine.lastProduction) {
      mine.lastProduction = this.scene.time.now;
    }

    // Produce coin every 15 seconds
    const productionInterval = 15000;
    if (mine.lastProduction + productionInterval < this.scene.time.now) {
      mine.lastProduction = this.scene.time.now;

      // Create coins (mines produce 2 coins)
      this.scene.resourceSystem.createCoin(mine.x - 10, mine.y - 40, 2);
    }
  }

  updateRecruitmentHut(hut) {
    // Recruitment huts spawn villagers over time
    if (!hut.lastProduction) {
      hut.lastProduction = this.scene.time.now;
    }

    // Produce a villager every 20 seconds
    const productionInterval = 20000;
    if (hut.lastProduction + productionInterval < this.scene.time.now) {
      hut.lastProduction = this.scene.time.now;

      // Create a villager if there aren't too many
      const maxVillagers =
        10 + (this.scene.timeSystem ? this.scene.timeSystem.getDayCount() : 0);
      const currentVillagers = this.scene.villagers
        ? this.scene.villagers.getChildren().length
        : 0;

      if (currentVillagers < maxVillagers) {
        const villager = new this.scene.villagers.classType(
          this.scene,
          hut.x,
          hut.y,
        );
        this.scene.villagers.add(villager);

        // Show spawn effect
        const text = this.scene.add
          .text(hut.x, hut.y - 60, "New Villager!", {
            fontSize: "16px",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3,
          })
          .setOrigin(0.5);

        // Fade out text
        this.scene.tweens.add({
          targets: text,
          alpha: 0,
          y: text.y - 50,
          duration: 2000,
          onComplete: () => {
            text.destroy();
          },
        });
      }
    }
  }

  updateArcherTower(tower) {
    // Similar to towers but with longer range and automatic firing
    // This is just a stub - would be expanded in full game
  }

  onCastleDestroyed() {
    // Game over when castle is destroyed
    // In a full game, would show game over screen
    this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        "GAME OVER\nYour Kingdom has fallen!",
        {
          fontSize: "48px",
          fill: "#ff0000",
          stroke: "#000000",
          strokeThickness: 6,
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    // Pause the game
    this.scene.paused = true;
  }
}
