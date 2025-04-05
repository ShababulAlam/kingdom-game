import Phaser from "phaser";

export class Villager extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "villager");

    this.scene = scene;
    this.speed = 100;
    this.direction = Math.random() > 0.5 ? "left" : "right";
    this.state = "idle";
    this.idleTimer = 0;
    this.maxIdleTime = Phaser.Math.Between(2000, 5000);
    this.walkTimer = 0;
    this.maxWalkTime = Phaser.Math.Between(2000, 5000);
    this.homeX = x;
    this.wanderRange = 200;
    this.role = "villager"; // Default role

    // Add the villager to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics properties
    this.setCollideWorldBounds(true);
    this.setGravityY(500);

    // Set depth to ensure villager appears on top of background
    this.setDepth(5);

    // Start in idle state
    this.setState("idle");
  }

  update() {
    // Update state timers
    if (this.state === "idle") {
      this.idleTimer += this.scene.game.loop.delta;
      if (this.idleTimer >= this.maxIdleTime) {
        this.setState("walk");
      }
    } else if (this.state === "walk") {
      this.walkTimer += this.scene.game.loop.delta;
      if (this.walkTimer >= this.maxWalkTime) {
        this.setState("idle");
      }

      // If villager walks too far from home, turn around
      if (Math.abs(this.x - this.homeX) > this.wanderRange) {
        if (
          (this.x > this.homeX && this.direction === "right") ||
          (this.x < this.homeX && this.direction === "left")
        ) {
          this.direction = this.direction === "left" ? "right" : "left";
        }
      }
    }

    // Handle movement based on state
    if (this.state === "walk") {
      const directionMultiplier = this.direction === "left" ? -1 : 1;
      this.setVelocityX(this.speed * directionMultiplier);
      this.setFlipX(this.direction === "left");
      this.anims.play("villager-walk", true);
    } else {
      this.setVelocityX(0);
      this.anims.play("villager-idle", true);
    }

    // Special behavior based on role
    this.performRoleSpecificBehavior();

    // Run from enemies at night
    if (this.scene.timeSystem && this.scene.timeSystem.isNight()) {
      this.runFromEnemies();
    }
  }

  setState(newState) {
    this.state = newState;

    if (newState === "idle") {
      this.idleTimer = 0;
      this.maxIdleTime = Phaser.Math.Between(2000, 5000);
    } else if (newState === "walk") {
      this.walkTimer = 0;
      this.maxWalkTime = Phaser.Math.Between(2000, 5000);
      // Randomly change direction sometimes
      if (Math.random() < 0.5) {
        this.direction = this.direction === "left" ? "right" : "left";
      }
    }
  }

  setRole(role) {
    this.role = role;

    // Change texture based on role
    switch (role) {
      case "builder":
        this.setTexture("builder");
        break;
      case "farmer":
        this.setTexture("farmer");
        break;
      case "archer":
        this.setTexture("archer");
        break;
      default:
        this.setTexture("villager");
    }
  }

  performRoleSpecificBehavior() {
    switch (this.role) {
      case "builder":
        // Find buildings to repair
        break;
      case "farmer":
        // Work on farms
        break;
      case "archer":
        // Defend against enemies
        const nearbyEnemies = this.getNearbyEnemies(300);
        if (nearbyEnemies.length > 0) {
          this.setState("idle");
          // Face the nearest enemy
          const nearest = nearbyEnemies[0];
          this.direction = nearest.x > this.x ? "right" : "left";
          this.setFlipX(this.direction === "left");
          // In a full game, would handle shooting here
        }
        break;
    }
  }

  runFromEnemies() {
    const nearbyEnemies = this.getNearbyEnemies(200);

    if (nearbyEnemies.length > 0) {
      // Run from the nearest enemy
      const nearest = nearbyEnemies[0];
      this.setState("walk");
      this.direction = nearest.x > this.x ? "left" : "right";
      this.speed = 150; // Run faster
    } else {
      this.speed = 100; // Normal speed
    }
  }

  getNearbyEnemies(radius) {
    if (!this.scene.enemies) return [];

    const enemies = this.scene.enemies.getChildren();
    const nearbyEnemies = enemies.filter((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        enemy.x,
        enemy.y,
      );
      return distance < radius;
    });

    // Sort by distance
    nearbyEnemies.sort((a, b) => {
      const distA = Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y);
      const distB = Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y);
      return distA - distB;
    });

    return nearbyEnemies;
  }
}
