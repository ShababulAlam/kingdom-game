import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    // Get screen dimensions
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add background
    this.add.image(width / 2, height / 2, "sky-day").setScale(1.2);

    // Add some trees for decoration
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(100, width - 100);
      const treeType = Math.random() > 0.5 ? "tree1" : "tree2";
      const tree = this.add.image(x, height - 100, treeType);
      tree.setScale(1 + Math.random() * 0.5);
      tree.setDepth(tree.y);
    }

    // Add ground
    this.add
      .image(width / 2, height, "ground")
      .setOrigin(0.5, 0)
      .setScale(10, 1);

    // Add game logo
    const logo = this.add.image(width / 2, height / 3, "logo");
    logo.setScale(0.7);

    // Add menu background
    const menuBg = this.add.image(width / 2, height / 2 + 100, "menu-bg");
    menuBg.setScale(0.5);

    // Add buttons
    const buttonY = height / 2 + 70;
    const spacing = 70;

    // Start game button
    const startButton = this.add.image(width / 2, buttonY, "button");
    startButton.setScale(0.5);

    const startText = this.add
      .text(width / 2, buttonY, "Start Game", {
        fontSize: "28px",
        fill: "#fff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    // Make button interactive
    startButton.setInteractive();

    startButton.on("pointerover", () => {
      startButton.setTexture("button-hover");
    });

    startButton.on("pointerout", () => {
      startButton.setTexture("button");
    });

    startButton.on("pointerdown", () => {
      this.sound.play("button-click");
      this.scene.start("GameScene");
    });

    // Options button
    const optionsButton = this.add.image(
      width / 2,
      buttonY + spacing,
      "button",
    );
    optionsButton.setScale(0.5);

    const optionsText = this.add
      .text(width / 2, buttonY + spacing, "Options", {
        fontSize: "28px",
        fill: "#fff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    optionsButton.setInteractive();

    optionsButton.on("pointerover", () => {
      optionsButton.setTexture("button-hover");
    });

    optionsButton.on("pointerout", () => {
      optionsButton.setTexture("button");
    });

    optionsButton.on("pointerdown", () => {
      this.sound.play("button-click");
      // Would navigate to options scene in a full game
      console.log("Options clicked");
    });

    // Add theme music
    // if (!this.sound.get("theme")) {
    //   const music = this.sound.add("theme", {
    //     volume: 0.5,
    //     loop: true,
    //   });
    //   music.play();
    // }
  }
}
