import Phaser from "phaser";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy");

    this.scene = scene;
    this.speed = Phaser.Math.Between(60, 100);
    this.health = 3;
    this.state = "walk";
    this.attackTarget = null;
    this.attackCooldown = 0;
    this.attackRange = 40;
    this.detectionRange = 200;

    // Add the enemy to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics properties
    this.setCollideWorldBounds(true);
    this.setGravityY(500);

    // Set depth to ensure enemy appears on top of background
    this.setDepth(5);

    // Determine initial direction (towards castle)
    this.direction = x < scene.castle.x ? "right" : "left";
    this.setFlipX(this.direction === "left");

    // Start the walking animation
    this.anims.play("enemy-walk", true);
  }

  update() {
    // Decrease attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= this.scene.game.loop.delta;
    }

    // Handle state behavior
    if (this.state === "walk") {
      // Move towards the castle or current target
      this.moveTowardsTarget();

      // Check for potential targets
      this.findTargets();
    } else if (this.state === "attack") {
      // Attack the current target
      this.attackCurrentTarget();
    }
  }

  moveTowardsTarget() {
    let targetX = this.scene.castle.x; // Default target is castle

    // If there's an attack target, move towards it instead
    if (this.attackTarget && this.attackTarget.active) {
      targetX = this.attackTarget.x;
    }

    // Set direction towards target
    this.direction = targetX > this.x ? "right" : "left";
    this.setFlipX(this.direction === "left");

    // Move in that direction
    const directionMultiplier = this.direction === "left" ? -1 : 1;
    this.setVelocityX(this.speed * directionMultiplier);

    // Play walking animation
    this.anims.play("enemy-walk", true);
  }

  findTargets() {
    // First priority: Check for buildings in attack range
    const buildings = this.scene.buildingSystem.getAllBuildings();
    for (const building of buildings) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        building.x,
        building.y,
      );
      if (distance < this.attackRange) {
        this.attackTarget = building;
        this.setState("attack");
        return;
      }
    }

    // Second priority: Check for player in detection range
    const playerDistance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.scene.player.x,
      this.scene.player.y,
    );
    if (playerDistance < this.detectionRange) {
      this.attackTarget = this.scene.player;
      return;
    }

    // Third priority: Check for villagers in detection range
    if (this.scene.villagers) {
      const villagers = this.scene.villagers.getChildren();
      for (const villager of villagers) {
        const distance = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          villager.x,
          villager.y,
        );
        if (distance < this.detectionRange) {
          this.attackTarget = villager;
          return;
        }
      }
    }

    // Default target: castle
    this.attackTarget = this.scene.castle;
  }

  attackCurrentTarget() {
    if (!this.attackTarget || !this.attackTarget.active) {
      this.setState("walk");
      return;
    }

    // Check if still in range
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.attackTarget.x,
      this.attackTarget.y,
    );
    if (distance > this.attackRange) {
      this.setState("walk");
      return;
    }

    // Attack if cooldown is done
    if (this.attackCooldown <= 0) {
      // Play attack animation
      this.anims.play("enemy-attack", true);

      // Face the target
      this.direction = this.attackTarget.x > this.x ? "right" : "left";
      this.setFlipX(this.direction === "left");

      // Stop moving while attacking
      this.setVelocityX(0);

      // Deal damage
      if (this.attackTarget.takeDamage) {
        this.attackTarget.takeDamage(1);
      }

      // Reset cooldown
      this.attackCooldown = 1000;

      // Play attack sound
      this.scene.sound.play("enemy-hit");
    }
  }

  setState(newState) {
    this.state = newState;
  }

  takeDamage(amount) {
    this.health -= amount;

    // Flash red when hit
    this.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.clearTint();
    });

    // Check if dead
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    // Create death effect
    const particles = this.scene.add.particles("coin");
    const emitter = particles.createEmitter({
      x: this.x,
      y: this.y,
      speed: { min: 50, max: 100 },
      gravityY: 300,
      lifespan: 800,
      quantity: 1,
      scale: { start: 0.4, end: 0 },
      blendMode: "ADD",
    });

    // Emit particles then destroy
    emitter.explode(10);
    this.scene.time.delayedCall(100, () => {
      particles.destroy();
    });

    // Sometimes drop a coin
    if (Math.random() < 0.5) {
      this.scene.resourceSystem.createCoin(this.x, this.y - 20, 1);
    }

    // Destroy the enemy
    this.destroy();
  }
}
