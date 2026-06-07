import { useEffect } from "react"
import Phaser from "phaser"
import { MainScene } from "./scenes/MainScene"

export default function App() {
  useEffect(() => {
    new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: "arcade",
        arcade: {
          gravity: {x: 0, y: 0 }
        }
      },
      scene: [MainScene],
      parent: "game"
    })
  }, [])

  return <div id="game"></div>
}