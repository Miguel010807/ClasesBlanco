import Phaser from "phaser"

export class MainScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite

  constructor() {
    super("main")
  }

  preload() {}

  create() {
    this.player = this.physics.add.sprite(400, 300, "")
      .setDisplaySize(50, 50)
      .setTint(0x00ff00)

    this.player.setGravityY(500)

    const ground = this.add.rectangle(400, 550, 800, 50, 0xffffff)

    this.physics.add.existing(ground, true)

    this.physics.add.collider(this.player, ground)
    
    socket = new WebSocket("ws://localhost:3000/ws")

    socket.onmessage = (event) => {
    const data = event.data

    if(data === "left"){
        this.player.setVelocityX(-200)
    }

    if(data === "right"){
        this.player.setVelocityX(200)
    }

    if(data === "stop"){
        this.player.setVelocityX(0)
    }

    if(data === "jump"){
        this.player.setVelocityY(-300)
    }
    }

}

  update() {}
}
let socket: WebSocket