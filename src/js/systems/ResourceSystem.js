export class ResourceSystem {
  constructor(scene) {
    this.scene = scene;
    this.coins = scene.add.group();
  }

  preload() {
    // Preload is handled in the main scene
  }

  create() {
    // Create initial resources
    this.createInitialResources();
  }

  createInitialResources() {
    // Create some initial coins scattered around the world
    const worldSize = this.scene.worldSize || 5000;
    const numCoins = Math.floor(worldSize / 500); // One coin per 500px of world

    for (let i = 0; i < numCoins; i++) {
      const x = Phaser.Math.Between(100, worldSize - 100);
      const y = this.scene.cameras.main.height - 150;
      this.createCoin(x, y, 1);
    }
  }

  createCoin(x, y, value = 1) {
    // Create a coin sprite
    const coin = this.scene.physics.add.sprite(x, y, "coin");

    // Set up physics for the coin
    coin.setGravityY(300);
    coin.setBounce(0.4);
    coin.setCollideWorldBounds(true);

    // Set custom properties
    coin.value = value;

    // Scale based on value
    coin.setScale(0.3 + value * 0.1);

    // Add a slight random velocity for a more natural drop
    coin.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-100, -50),
    );

    // Make coins glow slightly
    coin.setTint(0xffff00);

    // Add to coins group
    this.coins.add(coin);

    // Add a slight bobbing animation
    this.scene.tweens.add({
      targets: coin,
      y: coin.y - 10,
      duration: 1000 + Phaser.Math.Between(0, 500),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return coin;
  }

  removeCoin(coin) {
    // Create a small sparkle effect
    const particles = this.scene.add.particles("coin");
    const emitter = particles.createEmitter({
      x: coin.x,
      y: coin.y,
      speed: { min: 20, max: 60 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      lifespan: 500,
      blendMode: "ADD",
    });

    // Emit particles then destroy
    emitter.explode(5);
    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });

    // Remove the coin
    coin.destroy();
  }

  getCoinsWithinRadius(x, y, radius) {
    const coins = this.coins.getChildren();
    return coins.filter((coin) => {
      const distance = Phaser.Math.Distance.Between(x, y, coin.x, coin.y);
      return distance <= radius;
    });
  }

  createRandomResource(x, y) {
    // In a full game, would create different types of resources
    // For now, just create a coin
    return this.createCoin(x, y, 1);
  }

  update(time, delta) {
    // Update resources behavior if needed
    // For now, coins are static and just bob up and down via the tween
  }
}
