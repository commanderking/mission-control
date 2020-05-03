// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6

/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */

// Spritesheet from: https://marmoset.co/posts/sprite-sheet-creation-in-hexels/
// https://www.spriters-resource.com/pc_computer/stranded/sheet/116217/

// https://www.reddit.com/r/RPGMaker/comments/bvzi4t/astronaut_character_sprites_finished_please_help/
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
};

const game = new Phaser.Game(config);
let controls;

function preload() {
  this.load.image("tiles", "./assets/scifi_space_rpg_tiles.png");
  this.load.image("scifiObjects", "./assets/scifi_objects.png");
  this.load.tilemapTiledJSON("map", "/assets/space_map_48.json");
  // 513 x 770 (130 x 192)
  this.load.spritesheet("player", "./assets/astronaut_spritesheet.png", {
    frameWidth: 127,
    frameHeight: 191,
  });
}

const animationKeys = {
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  DOWN: "DOWN",
  UP: "UP",
};

const animationMap = [
  {
    key: animationKeys.LEFT,
    frames: [4, 5, 6, 7],
  },
  {
    key: animationKeys.DOWN,
    frames: [0, 1, 2, 3],
  },
  {
    key: animationKeys.RIGHT,
    frames: [8, 9, 10, 11],
  },
  {
    key: animationKeys.UP,
    frames: [12, 13, 14, 15],
  },
];

function create() {
  const map = this.make.tilemap({
    key: "map",
    tileHeight: 48,
    tileWidth: 48,
    width: 1440,
    height: 1200,
  });

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const scifiObjectsTileset = map.addTilesetImage(
    "scifi_objects",
    "scifiObjects"
  );
  const scifiSpaceRpg = map.addTilesetImage(
    "scifi_space_rpg_tiles_48",
    "tiles"
  );

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const floorLayer = map.createStaticLayer("Spaceship Floor", scifiSpaceRpg);
  const baseLayer = map.createStaticLayer("Base Layer", scifiSpaceRpg, 0, 0);
  const wallLayer = map.createStaticLayer("Wall Decoration", scifiSpaceRpg);
  const objectsLayer = map.createStaticLayer(
    "Interactive Objects",
    scifiObjectsTileset
  );
  // objectsLayer.setDepth(10);

  baseLayer.setCollisionByProperty({ collides: true });
  objectsLayer.setCollisionByProperty({ collides: true });

  // Set up the arrows to control the camera
  this.cursors = this.input.keyboard.createCursorKeys();

  this.player = this.physics.add
    .sprite(500, 500, "player")
    .setSize(100, 100)
    .setOffset(10, 70);
  this.player.displayWidth = 48;
  this.player.displayHeight = 72;

  animationMap.forEach((animation) => {
    this.anims.create({
      key: animation.key,
      frames: this.anims.generateFrameNumbers("player", {
        frames: animation.frames,
      }),
      frameRate: 8,
      repeat: -1,
    });
  });

  this.physics.add.collider(this.player, objectsLayer);
  this.physics.add.collider(this.player, baseLayer);

  // Phaser supports multiple cameras, but you can access the default camera like this:
  const camera = this.cameras.main;
  camera.startFollow(this.player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  // <<<<<<<<<<<<<<<<<<<< Debugging references

  // debugging world layer
  // const debugGraphics = this.add.graphics().setAlpha(0.75);
  // baseLayer.renderDebug(debugGraphics, {
  //   tileColor: null, // Color of non-colliding tiles
  //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
  //   faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
  // });

  // To see tilemap
  // image = this.add.image(32, 32, "player", "__BASE").setOrigin(0);
  // image.displayHeight = 0;
  // image.displayWidth = 0;
}

const playerSpeed = 175;

function update(time, delta) {
  // Stop any previous movement from the last frame
  this.player.body.setVelocity(0);

  // Horizontal movement
  if (this.cursors.left.isDown) {
    this.player.body.setVelocityX(-playerSpeed);
  } else if (this.cursors.right.isDown) {
    this.player.body.setVelocityX(playerSpeed);
  }

  // Vertical movement
  if (this.cursors.up.isDown) {
    this.player.body.setVelocityY(-playerSpeed);
  } else if (this.cursors.down.isDown) {
    this.player.body.setVelocityY(playerSpeed);
  }

  if (this.cursors.left.isDown) {
    this.player.anims.play(animationKeys.LEFT, true);
  } else if (this.cursors.up.isDown) {
    this.player.anims.play(animationKeys.UP, true);
  } else if (this.cursors.down.isDown) {
    this.player.anims.play(animationKeys.DOWN, true);
  } else if (this.cursors.right.isDown) {
    this.player.anims.play(animationKeys.RIGHT, true);
  } else {
    this.player.anims.stop();
  }
}
