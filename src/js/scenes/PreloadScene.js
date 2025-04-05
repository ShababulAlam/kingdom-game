import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    // Display loading screen
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add logo
    const logo = this.add.image(width / 2, height / 2 - 100, "logo");
    logo.setScale(0.5);

    // Create loading bar
    const loadingBarBg = this.add.image(
      width / 2,
      height / 2 + 100,
      "loading-bar-bg",
    );
    const loadingBar = this.add.image(
      width / 2 - 160,
      height / 2 + 100,
      "loading-bar-fill",
    );
    loadingBar.setOrigin(0, 0.5);

    // Loading progress event
    this.load.on("progress", (value) => {
      loadingBar.setScale(value, 1);
    });

    // Load all game assets

    // Character sprites
    this.load.spritesheet("monarch", "assets/images/entities/monarch.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("villager", "assets/images/entities/villager.png", {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet("builder", "assets/images/entities/builder.png", {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet("farmer", "assets/images/entities/farmer.png", {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet("archer", "assets/images/entities/archer.png", {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet("enemy", "assets/images/entities/enemy.png", {
      frameWidth: 48,
      frameHeight: 64,
    });
    this.load.spritesheet("horse", "assets/images/entities/horse.png", {
      frameWidth: 96,
      frameHeight: 64,
    });

    // Building sprites
    this.load.image("castle", "assets/images/buildings/castle.png");
    this.load.image("wall", "assets/images/buildings/wall.png");
    this.load.image("tower", "assets/images/buildings/tower.png");
    this.load.image("farm", "assets/images/buildings/farm.png");
    this.load.image("mine", "assets/images/buildings/mine.png");
    this.load.image(
      "recruitment-hut",
      "assets/images/buildings/recruitment-hut.png",
    );
    this.load.image("archer-tower", "assets/images/buildings/archer-tower.png");

    // Environment sprites
    this.load.image("sky-day", "assets/images/environment/sky-day.png");
    this.load.image("sky-night", "assets/images/environment/sky-night.png");
    this.load.image("ground", "assets/images/environment/ground.png");
    this.load.image("tree1", "assets/images/environment/tree1.png");
    this.load.image("tree2", "assets/images/environment/tree2.png");
    this.load.image("grass1", "assets/images/environment/grass1.png");
    this.load.image("grass2", "assets/images/environment/grass2.png");
    this.load.image("rock", "assets/images/environment/rock.png");
    this.load.image("coin", "assets/images/environment/coin.png");
    this.load.image("water", "assets/images/environment/water.png");

    // UI elements
    this.load.image("coin-icon", "assets/images/ui/coin-icon.png");
    this.load.image("heart-icon", "assets/images/ui/heart-icon.png");
    this.load.image("build-button", "assets/images/ui/build-button.png");
    this.load.image("menu-bg", "assets/images/ui/menu-bg.png");
    this.load.image("button", "assets/images/ui/button.png");
    this.load.image("button-hover", "assets/images/ui/button-hover.png");
    this.load.image("pause-icon", "assets/images/ui/pause-icon.png");
    this.load.image("moon-icon", "assets/images/ui/moon-icon.png");
    this.load.image("sun-icon", "assets/images/ui/sun-icon.png");

    // Audio
    this.load.audio("theme", "assets/audio/theme.mp3");
    this.load.audio("coin-pickup", "assets/audio/coin-pickup.mp3");
    this.load.audio("build", "assets/audio/build.mp3");
    this.load.audio("enemy-hit", "assets/audio/enemy-hit.mp3");
    this.load.audio("button-click", "assets/audio/button-click.mp3");
    this.load.audio("day-ambient", "assets/audio/day-ambient.mp3");
    this.load.audio("night-ambient", "assets/audio/night-ambient.mp3");
  }

  create() {
    // Create animations
    this.createAnimations();

    // Go to main menu
    this.scene.start("MainMenuScene");
  }

  createAnimations() {
    // Monarch animations
    this.anims.create({
      key: "monarch-idle",
      frames: this.anims.generateFrameNumbers("monarch", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "monarch-run",
      frames: this.anims.generateFrameNumbers("monarch", { start: 4, end: 11 }),
      frameRate: 12,
      repeat: -1,
    });

    // Villager animations
    this.anims.create({
      key: "villager-idle",
      frames: this.anims.generateFrameNumbers("villager", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: "villager-walk",
      frames: this.anims.generateFrameNumbers("villager", { start: 4, end: 9 }),
      frameRate: 10,
      repeat: -1,
    });

    // Enemy animations
    this.anims.create({
      key: "enemy-walk",
      frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "enemy-attack",
      frames: this.anims.generateFrameNumbers("enemy", { start: 6, end: 9 }),
      frameRate: 8,
      repeat: 0,
    });

    // Horse animations
    this.anims.create({
      key: "horse-idle",
      frames: this.anims.generateFrameNumbers("horse", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "horse-run",
      frames: this.anims.generateFrameNumbers("horse", { start: 4, end: 11 }),
      frameRate: 12,
      repeat: -1,
    });
  }
}
