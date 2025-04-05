import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "monarch");

    this.scene = scene;
    this.speed = 300;
    this.jumpSpeed = -400;
    this.direction = "right";

    // Add the player to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics properties
    this.setCollideWorldBounds(true);
    this.setGravityY(500);

    // Add horse
    this.horse = scene.add.sprite(x, y + 10, "horse");
    this.horse.setOrigin(0.5, 1);

    // Set up input
    this.cursors = scene.input.keyboard.createCursorKeys();

    // Set depth to ensure player appears on top of background
    this.setDepth(10);
    this.horse.setDepth(9);
  }

  update() {
    // Handle movement
    if (this.cursors.left.isDown) {
      this.setVelocityX(-this.speed);
      this.direction = "left";
      this.setFlipX(true);
      this.horse.setFlipX(true);
      this.anims.play("monarch-run", true);
      this.horse.anims.play("horse-run", true);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(this.speed);
      this.direction = "right";
      this.setFlipX(false);
      this.horse.setFlipX(false);
      this.anims.play("monarch-run", true);
      this.horse.anims.play("horse-run", true);
    } else {
      this.setVelocityX(0);
      this.anims.play("monarch-idle", true);
      this.horse.anims.play("horse-idle", true);
    }

    // Update horse position
    this.horse.x = this.x;
    this.horse.y = this.y + 10;

    // Collect nearby coins
    this.collectNearbyCoins();
  }

  collectNearbyCoins() {
    // Find coins within collection radius
    const collectionRadius = 100;
    const coins = this.scene.resourceSystem.getCoinsWithinRadius(
      this.x,
      this.y,
      collectionRadius,
    );

    // Collect coins
    if (coins.length > 0) {
      const totalCoins = coins.reduce((sum, coin) => sum + coin.value, 0);
      this.scene.addCoins(totalCoins);

      // Remove collected coins
      coins.forEach((coin) => {
        this.scene.resourceSystem.removeCoin(coin);
      });
    }
  }
}
