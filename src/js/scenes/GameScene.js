import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Villager } from "../entities/Villager";
import { Enemy } from "../entities/Enemy";
import { BuildingSystem } from "../systems/BuildingSystem";
import { TimeSystem } from "../systems/TimeSystem";
import { ResourceSystem } from "../systems/ResourceSystem";
import { MapGenerator } from "../utils/MapGenerator";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.worldSize = 10000; // Total world width
    this.dayDuration = 180; // Day duration in seconds
    this.coins = 10; // Starting coins
    this.paused = false;
  }

  create() {
    // Set world bounds
    this.physics.world.setBounds(
      0,
      0,
      this.worldSize,
      this.cameras.main.height,
    );

    // Generate the map
    this.mapGenerator = new MapGenerator(this);
    this.mapGenerator.generate(this.worldSize);

    // Create the time system
    this.timeSystem = new TimeSystem(this, this.dayDuration);

    // Create resource system
    this.resourceSystem = new ResourceSystem(this);

    // Create building system
    this.buildingSystem = new BuildingSystem(this);

    // Create player
    this.player = new Player(this, 400, this.cameras.main.height - 200);

    // Camera follows player
    this.cameras.main.setBounds(0, 0, this.worldSize, this.cameras.main.height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Create initial villagers
    this.villagers = this.add.group({
      classType: Villager,
      runChildUpdate: true,
    });

    // Castle is the starting building
    this.castle = this.buildingSystem.createBuilding(
      "castle",
      400,
      this.cameras.main.height - 200,
    );

    // Create initial villagers around castle
    for (let i = 0; i < 3; i++) {
      const x = this.castle.x + Phaser.Math.Between(-100, 100);
      const villager = new Villager(this, x, this.cameras.main.height - 180);
      this.villagers.add(villager);
    }

    // Create UI
    this.createUI();

    // Setup enemy spawning
    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });
    this.timeSystem.onNightStart(() => this.spawnEnemies());

    // Set up audio
    this.dayAmbient = this.sound.add("day-ambient", {
      volume: 0.3,
      loop: true,
    });
    this.nightAmbient = this.sound.add("night-ambient", {
      volume: 0.3,
      loop: true,
    });

    this.timeSystem.onDayStart(() => {
      this.nightAmbient.stop();
      this.dayAmbient.play();
    });

    this.timeSystem.onNightStart(() => {
      this.dayAmbient.stop();
      this.nightAmbient.play();
    });

    // Add collision between player and ground
    const grounds = this.children.list.filter(
      (child) => child.texture && child.texture.key === "ground",
    );
    this.physics.add.collider(this.player, grounds);

    // Start with day
    this.dayAmbient.play();
  }

  update(time, delta) {
    if (this.paused) return;

    // Update time system
    this.timeSystem.update(delta);

    // Update player
    this.player.update();

    // Update villagers
    this.villagers.getChildren().forEach((villager) => villager.update());

    // Update enemies
    this.enemies.getChildren().forEach((enemy) => enemy.update());

    // Update UI
    this.updateUI();
  }

  createUI() {
    // Fixed UI elements that don't scroll with camera
    this.uiScene = this.scene.get("UIScene");

    // Coin display
    this.coinIcon = this.add
      .image(50, 50, "coin-icon")
      .setScrollFactor(0)
      .setScale(0.5);
    this.coinText = this.add
      .text(80, 40, this.coins.toString(), {
        fontSize: "32px",
        fill: "#fff",
        fontFamily: "Arial",
        stroke: "#000",
        strokeThickness: 4,
      })
      .setScrollFactor(0);

    // Time indicator
    this.timeIcon = this.add
      .image(this.cameras.main.width - 50, 50, "sun-icon")
      .setScrollFactor(0)
      .setScale(0.5);

    // Build button
    this.buildButton = this.add
      .image(
        this.cameras.main.width - 50,
        this.cameras.main.height - 50,
        "build-button",
      )
      .setScrollFactor(0)
      .setScale(0.7)
      .setInteractive();

    this.buildButton.on("pointerdown", () => {
      this.sound.play("button-click");
      this.toggleBuildMenu();
    });

    // Build menu (initially hidden)
    this.buildMenu = this.add
      .container(this.cameras.main.width / 2, this.cameras.main.height / 2)
      .setScrollFactor(0)
      .setVisible(false);

    const menuBg = this.add.image(0, 0, "menu-bg").setScale(0.8);
    this.buildMenu.add(menuBg);

    // Add building options to menu
    const buildings = [
      { key: "wall", name: "Wall", cost: 5 },
      { key: "tower", name: "Tower", cost: 15 },
      { key: "farm", name: "Farm", cost: 10 },
      { key: "mine", name: "Mine", cost: 20 },
      { key: "recruitment-hut", name: "Recruit", cost: 8 },
    ];

    const buttonWidth = 150;
    const buttonHeight = 60;
    const buttonsPerRow = 3;
    const padding = 20;

    buildings.forEach((building, index) => {
      const row = Math.floor(index / buttonsPerRow);
      const col = index % buttonsPerRow;

      const x = (col - Math.floor(buttonsPerRow / 2)) * (buttonWidth + padding);
      const y = row * (buttonHeight + padding) - 50;

      const button = this.add.image(x, y, "button").setScale(0.4);
      const text = this.add
        .text(x, y - 10, building.name, {
          fontSize: "20px",
          fill: "#fff",
          fontFamily: "Arial",
        })
        .setOrigin(0.5);

      const costText = this.add
        .text(x, y + 15, `Cost: ${building.cost}`, {
          fontSize: "16px",
          fill: "#fff",
          fontFamily: "Arial",
        })
        .setOrigin(0.5);

      // Make button interactive
      button.setInteractive();

      button.on("pointerover", () => {
        button.setTexture("button-hover");
      });

      button.on("pointerout", () => {
        button.setTexture("button");
      });

      button.on("pointerdown", () => {
        this.sound.play("button-click");
        this.startPlacingBuilding(building.key, building.cost);
      });

      this.buildMenu.add([button, text, costText]);
    });

    // Close button for build menu
    const closeButton = this.add
      .image(menuBg.width / 2 - 30, -menuBg.height / 2 + 30, "button")
      .setScale(0.3);

    const closeText = this.add
      .text(closeButton.x, closeButton.y, "X", {
        fontSize: "20px",
        fill: "#fff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    closeButton.setInteractive();

    closeButton.on("pointerdown", () => {
      this.sound.play("button-click");
      this.buildMenu.setVisible(false);
    });

    this.buildMenu.add([closeButton, closeText]);

    // Pause button
    this.pauseButton = this.add
      .image(this.cameras.main.width - 120, 50, "pause-icon")
      .setScrollFactor(0)
      .setScale(0.5)
      .setInteractive();

    this.pauseButton.on("pointerdown", () => {
      this.sound.play("button-click");
      this.togglePause();
    });
  }

  updateUI() {
    // Update coin display
    this.coinText.setText(this.coins.toString());

    // Update time indicator
    if (this.timeSystem.isNight()) {
      this.timeIcon.setTexture("moon-icon");
    } else {
      this.timeIcon.setTexture("sun-icon");
    }
  }

  toggleBuildMenu() {
    this.buildMenu.setVisible(!this.buildMenu.visible);
  }

  startPlacingBuilding(buildingKey, cost) {
    // Check if player has enough coins
    if (this.coins < cost) {
      // Show "not enough coins" message
      return;
    }

    // Hide build menu
    this.buildMenu.setVisible(false);

    // Create a preview of the building that follows mouse
    const worldPoint = this.cameras.main.getWorldPoint(
      this.input.x,
      this.input.y,
    );
    this.buildingPreview = this.add
      .image(worldPoint.x, this.cameras.main.height - 180, buildingKey)
      .setAlpha(0.7);

    // Listen for click to place building
    this.input.once("pointerdown", () => {
      if (this.canPlaceBuilding(this.buildingPreview.x)) {
        // Place the building
        this.buildingSystem.createBuilding(
          buildingKey,
          this.buildingPreview.x,
          this.cameras.main.height - 180,
        );
        // Pay the cost
        this.coins -= cost;
        // Play build sound
        this.sound.play("build");
      }
      // Remove preview
      this.buildingPreview.destroy();
      this.buildingPreview = null;
    });

    // Listen for movement to update preview position
    this.input.on("pointermove", (pointer) => {
      if (this.buildingPreview) {
        const worldPoint = this.cameras.main.getWorldPoint(
          pointer.x,
          pointer.y,
        );
        this.buildingPreview.x = worldPoint.x;

        // Change preview alpha based on whether placement is valid
        if (this.canPlaceBuilding(worldPoint.x)) {
          this.buildingPreview.setAlpha(0.7);
        } else {
          this.buildingPreview.setAlpha(0.3);
        }
      }
    });

    // Listen for right click to cancel
    this.input.on("pointerup", (pointer) => {
      if (pointer.rightButtonReleased() && this.buildingPreview) {
        this.buildingPreview.destroy();
        this.buildingPreview = null;
      }
    });
  }

  canPlaceBuilding(x) {
    // Check if too close to another building
    const minDistance = 150;
    const buildings = this.buildingSystem.getAllBuildings();

    for (const building of buildings) {
      if (Math.abs(building.x - x) < minDistance) {
        return false;
      }
    }

    return true;
  }

  togglePause() {
    this.paused = !this.paused;

    if (this.paused) {
      // Show pause menu
      // In a full game, you would create a pause menu here
      this.pauseButton.setTint(0xff0000);
    } else {
      // Hide pause menu
      this.pauseButton.clearTint();
    }
  }

  spawnEnemies() {
    // Determine number of enemies based on game progress
    const enemyCount = Math.min(
      5 + Math.floor(this.timeSystem.getDayCount() / 2),
      20,
    );

    // Spawn enemies from both sides
    for (let i = 0; i < enemyCount; i++) {
      // Determine side (left or right)
      const side = Math.random() > 0.5 ? "left" : "right";
      let x;

      if (side === "left") {
        x = Math.max(this.player.x - 1000, 100);
      } else {
        x = Math.min(this.player.x + 1000, this.worldSize - 100);
      }

      // Create enemy
      const enemy = new Enemy(this, x, this.cameras.main.height - 180);
      this.enemies.add(enemy);
    }
  }

  addCoins(amount) {
    this.coins += amount;

    // Show floating text
    const text = this.add
      .text(this.player.x, this.player.y - 50, `+${amount}`, {
        fontSize: "20px",
        fill: "#ffff00",
        fontFamily: "Arial",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Animate the text
    this.tweens.add({
      targets: text,
      y: text.y - 100,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        text.destroy();
      },
    });

    // Play coin pickup sound
    this.sound.play("coin-pickup");
  }
}
