export class MapGenerator {
  constructor(scene) {
    this.scene = scene;
  }

  generate(worldSize) {
    // Create the ground
    this.createGround(worldSize);

    // Create background elements
    this.createBackgroundElements(worldSize);
  }

  createGround(worldSize) {
    // Create the ground as a series of ground tiles
    const groundHeight = 100;
    const groundY = this.scene.cameras.main.height;
    const groundTileWidth = 128; // Assuming ground.png is 128px wide

    const numTiles = Math.ceil(worldSize / groundTileWidth);

    for (let i = 0; i < numTiles; i++) {
      const ground = this.scene.add
        .image(i * groundTileWidth, groundY, "ground")
        .setOrigin(0, 0);

      // Add a collision body for the ground
      const groundBody = this.scene.physics.add.existing(ground, true);
      groundBody.body.setSize(groundTileWidth, groundHeight);
      groundBody.body.setOffset(0, 0);

      // Set depth so ground is below other elements
      ground.setDepth(1);
    }
  }

  createBackgroundElements(worldSize) {
    // Add trees, rocks, grass, etc.
    this.addTrees(worldSize);
    this.addRocks(worldSize);
    this.addGrass(worldSize);
    this.addWater(worldSize);
  }

  addTrees(worldSize) {
    // Add large trees at a medium density
    const treeCount = Math.floor(worldSize / 300); // One tree per 300px on average

    for (let i = 0; i < treeCount; i++) {
      const x = Phaser.Math.Between(100, worldSize - 100);
      const y = this.scene.cameras.main.height;

      // 50% chance of each tree type
      const treeType = Math.random() > 0.5 ? "tree1" : "tree2";

      const tree = this.scene.add.image(x, y, treeType).setOrigin(0.5, 1);

      // Random scale for variety
      tree.setScale(0.8 + Math.random() * 0.4);

      // Set depth based on y-position for proper layering
      tree.setDepth(y);
    }
  }

  addRocks(worldSize) {
    // Add rocks at a low density
    const rockCount = Math.floor(worldSize / 500); // One rock per 500px on average

    for (let i = 0; i < rockCount; i++) {
      const x = Phaser.Math.Between(100, worldSize - 100);
      const y = this.scene.cameras.main.height;

      const rock = this.scene.add.image(x, y, "rock").setOrigin(0.5, 1);

      // Random scale for variety
      rock.setScale(0.6 + Math.random() * 0.4);

      // Set depth based on y-position
      rock.setDepth(y - 10);
    }
  }

  addGrass(worldSize) {
    // Add grass at a high density
    const grassCount = Math.floor(worldSize / 100); // One grass tuft per 100px on average

    for (let i = 0; i < grassCount; i++) {
      const x = Phaser.Math.Between(50, worldSize - 50);
      const y = this.scene.cameras.main.height;

      // 50% chance of each grass type
      const grassType = Math.random() > 0.5 ? "grass1" : "grass2";

      const grass = this.scene.add.image(x, y, grassType).setOrigin(0.5, 1);

      // Random scale for variety
      grass.setScale(0.5 + Math.random() * 0.3);

      // Set depth based on y-position
      grass.setDepth(y - 20);
    }
  }

  addWater(worldSize) {
    // Add small water ponds at specific locations
    // In a full game, this would be more sophisticated

    // For now, just add a couple ponds at fixed positions
    const pondLocations = [worldSize * 0.2, worldSize * 0.7];

    for (const x of pondLocations) {
      // Create water surface
      const waterWidth = Phaser.Math.Between(200, 400);
      const water = this.scene.add.image(
        x,
        this.scene.cameras.main.height - 10,
        "water",
      );
      water.setOrigin(0.5, 0);
      water.setScale(waterWidth / water.width, 0.5);
      water.setDepth(2);

      // Add some grass around the water
      for (let i = 0; i < 10; i++) {
        const grassX =
          x + Phaser.Math.Between(-waterWidth / 2 - 20, waterWidth / 2 + 20);
        const grassY = this.scene.cameras.main.height;
        const grassType = Math.random() > 0.5 ? "grass1" : "grass2";

        const grass = this.scene.add
          .image(grassX, grassY, grassType)
          .setOrigin(0.5, 1);
        grass.setScale(0.5 + Math.random() * 0.3);
        grass.setDepth(grassY - 20);
      }
    }
  }
}
