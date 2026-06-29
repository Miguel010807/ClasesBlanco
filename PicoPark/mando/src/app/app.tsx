import { useEffect, useState } from "react"
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native"

const socket = new WebSocket("ws://10.56.2.22:3000/ws")

export default function App() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socket.onopen = () => {
      console.log("conectado")
      setConnected(true)
    }

    socket.onclose = () => {
      console.log("desconectado")
      setConnected(false)
    }

    socket.onerror = () => {
      setConnected(false)
    }
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>PICO PARK</Text>

        <View style={styles.connectionContainer}>
          <View
            style={[
              styles.connectionDot,
              {
                backgroundColor: connected
                  ? "#22c55e"
                  : "#6b7280"
              }
            ]}
          />

          <Text
            style={[
              styles.connectionText,
              {
                color: connected
                  ? "#22c55e"
                  : "#9ca3af"
              }
            ]}
          >
            {connected ? "Conectado" : "Desconectado"}
          </Text>
        </View>
      </View>

      {/* INFO */}
      <View style={styles.infoCard}>
        <View>
          <Text style={styles.infoLabel}>
            Jugador
          </Text>

          <Text style={styles.playerText}>
            Jugador 1
          </Text>
        </View>

        <View style={styles.separator} />

        <View>
          <Text style={styles.infoLabel}>
            Servidor
          </Text>

          <Text style={styles.serverText}>
            0.0.0.0
          </Text>
        </View>
      </View>

      {/* CONTROLES */}
      <View style={styles.controlsContainer}>
        {/* DPAD */}
        <View style={styles.dpad}>
          <Pressable
            onPressIn={() =>
              socket.send("up")
            }
            onPressOut={() =>
              socket.send("stop")
            }
            style={styles.dpadButton}
          >
            <Text style={styles.arrow}>
              ↑
            </Text>
          </Pressable>

          <View style={styles.middleRow}>
            <Pressable
              onPressIn={() =>
                socket.send("left")
              }
              onPressOut={() =>
                socket.send("stop")
              }
              style={styles.dpadButton}
            >
              <Text style={styles.arrow}>
                ←
              </Text>
            </Pressable>

            <View style={styles.centerGap} />

            <Pressable
              onPressIn={() =>
                socket.send("right")
              }
              onPressOut={() =>
                socket.send("stop")
              }
              style={styles.dpadButton}
            >
              <Text style={styles.arrow}>
                →
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPressIn={() =>
              socket.send("down")
            }
            onPressOut={() =>
              socket.send("stop")
            }
            style={styles.dpadButton}
          >
            <Text style={styles.arrow}>
              ↓
            </Text>
          </Pressable>
        </View>

        {/* BOTON SALTO */}
        <Pressable
          onPress={() => socket.send("jump")}
          style={styles.jumpButton}
        >
          <Text style={styles.jumpText}>
            SALTAR
          </Text>
        </Pressable>
      </View>

      {/* BOTONES EXTRA */}
      <View style={styles.bottomButtons}>
        <Pressable style={styles.blueButton}>
          <Text style={styles.bottomText}>
            ACCIÓN 1
          </Text>
        </Pressable>

        <Pressable style={styles.yellowButton}>
          <Text style={styles.bottomText}>
            ACCIÓN 2
          </Text>
        </Pressable>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>
          Instrucciones
        </Text>

        <Text style={styles.footerText}>
          Usa los controles para mover
          a tu personaje y colaborar
          con los demás jugadores.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
    paddingTop: 70,
    paddingHorizontal: 20,
    justifyContent: "space-between"
  },

  header: {
    alignItems: "center",
    gap: 10
  },

  title: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold"
  },

  connectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },

  connectionDot: {
    width: 14,
    height: 14,
    borderRadius: 999
  },

  connectionText: {
    fontSize: 22,
    fontWeight: "600"
  },

  infoCard: {
    backgroundColor: "#111827",
    borderRadius: 30,
    padding: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  infoLabel: {
    color: "#9ca3af",
    fontSize: 18
  },

  playerText: {
    color: "#a855f7",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8
  },

  serverText: {
    color: "white",
    fontSize: 20,
    marginTop: 8
  },

  separator: {
    width: 1,
    height: 70,
    backgroundColor: "#374151"
  },

  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  dpad: {
    gap: 10,
    alignItems: "center"
  },

  middleRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  centerGap: {
    width: 20
  },

  dpadButton: {
    width: 90,
    height: 90,
    borderRadius: 25,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center"
  },

  arrow: {
    color: "white",
    fontSize: 38,
    fontWeight: "bold"
  },

  jumpButton: {
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "#9333ea",
    justifyContent: "center",
    alignItems: "center"
  },

  jumpText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold"
  },

  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  blueButton: {
    width: 150,
    height: 80,
    borderRadius: 25,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center"
  },

  yellowButton: {
    width: 150,
    height: 80,
    borderRadius: 25,
    backgroundColor: "#eab308",
    justifyContent: "center",
    alignItems: "center"
  },

  bottomText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold"
  },

  footer: {
    backgroundColor: "#111827",
    borderRadius: 30,
    padding: 25,
    marginBottom: 30
  },

  footerTitle: {
    color: "#a855f7",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10
  },

  footerText: {
    color: "#d1d5db",
    fontSize: 18,
    lineHeight: 28
  }
})
