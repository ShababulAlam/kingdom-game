import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Load loading screen assets
    this.load.image("logo", "assets/images/ui/logo.png");
    this.load.image("loading-bar-bg", "assets/images/ui/loading-bar-bg.png");
    this.load.image(
      "loading-bar-fill",
      "assets/images/ui/loading-bar-fill.png",
    );
  }

  create() {
    // Set up any configuration needed before the main preload
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    // Go to the preload scene
    this.scene.start("PreloadScene");
  }
}
