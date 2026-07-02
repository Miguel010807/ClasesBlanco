import { useEffect, useRef, useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native"

const SERVER_PORT = 3000

export default function App() {
  const [ip, setIp] = useState("")
  const [conectando, setConectando] = useState(false)
  const [error, setError] = useState("")
  const [connected, setConnected] = useState(false)
  const [miColor, setMiColor] = useState<string | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const myIdRef = useRef<string | null>(null)

  const conectar = () => {
    if (!ip.trim()) {
      setError("Ingresá la IP del servidor")
      return
    }

    setConectando(true)
    setError("")

    const socket = new WebSocket(`ws://${ip.trim()}:${SERVER_PORT}/ws`)

    const timeout = setTimeout(() => {
      socket.close()
      setConectando(false)
      setError("No se pudo conectar. Verificá la IP y que el servidor esté corriendo.")
    }, 5000)

    socket.onopen = () => {
      clearTimeout(timeout)
      setConectando(false)
      setConnected(true)
      socketRef.current = socket
    }

    socket.onclose = () => {
      clearTimeout(timeout)
      setConectando(false)
      setConnected(false)
      socketRef.current = null
    }

    socket.onerror = () => {
      clearTimeout(timeout)
      setConectando(false)
      setError("No se pudo conectar. Verificá la IP y que el servidor esté corriendo.")
    }

    socket.onmessage = (event) => {
      const [id, accion, color] = String(event.data).split(",")

      if (accion === "tu-id") {
        myIdRef.current = id
        if (color) setMiColor(color)
      }

      if (accion === "sala-llena") {
        setError("Ya hay 4 jugadores conectados. Esperá que se libere un lugar.")
        socket.close()
      }
    }
  }

  useEffect(() => {
    return () => {
      socketRef.current?.close()
    }
  }, [])

  const enviar = (accion: string) => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(accion)
  }

  const desconectar = () => {
    socketRef.current?.close()
    setConnected(false)
    myIdRef.current = null
  }

  // ─── PANTALLA DE LOGIN ───────────────────────────────────────────────
  if (!connected) {
    return (
      <KeyboardAvoidingView
        style={styles.loginContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar barStyle="light-content" />

        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>PICO PARK</Text>
          <Text style={styles.loginSubtitle}>Conectate al servidor</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>IP del servidor</Text>
            <TextInput
              style={styles.input}
              value={ip}
              onChangeText={(text) => {
                setIp(text)
                setError("")
              }}
              placeholder="ej: 10.56.2.8"
              placeholderTextColor="#4b5563"
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!conectando}
            />
            <Text style={styles.inputHint}>Puerto: {SERVER_PORT}</Text>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Pressable
            onPress={conectar}
            style={[styles.conectarButton, conectando && styles.conectarButtonDisabled]}
            disabled={conectando}
          >
            <Text style={styles.conectarText}>
              {conectando ? "Conectando..." : "Conectar"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    )
  }

  // ─── PANTALLA DEL MANDO (HORIZONTAL) ────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden />

      {/* COLUMNA IZQUIERDA: header + dpad */}
      <View style={styles.left}>

        <View style={styles.header}>
          <Text style={styles.title}>PICO PARK</Text>
          <View style={styles.connectionContainer}>
            <View style={[styles.connectionDot, { backgroundColor: miColor ?? "#22c55e" }]} />
            <Text style={[styles.connectionText, { color: "#22c55e" }]}>
              online
            </Text>
          </View>
          {miColor ? (
            <Text style={styles.colorText}>Tu personaje: {miColor}</Text>
          ) : null}
          <Pressable onPress={desconectar}>
            <Text style={styles.desconectarText}>Desconectar</Text>
          </Pressable>
        </View>

        {/* DPAD */}
        <View style={styles.dpad}>
          <View style={styles.middleRow}>
            <Pressable
              onPressIn={() => enviar("left")}
              onPressOut={() => enviar("stop")}
              style={styles.dpadButton}
            >
              <Text style={styles.arrow}>←</Text>
            </Pressable>

            <View style={styles.centerGap} />

            <Pressable
              onPressIn={() => enviar("right")}
              onPressOut={() => enviar("stop")}
              style={styles.dpadButton}
            >
              <Text style={styles.arrow}>→</Text>
            </Pressable>
          </View>
        </View>

      </View>

      {/* COLUMNA DERECHA: info + saltar */}
      <View style={styles.right}>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Servidor</Text>
          <Text style={styles.serverText}>{ip}:{SERVER_PORT}</Text>
        </View>

        <Pressable
          onPressIn={() => enviar("jump")}
          style={[styles.jumpButton, miColor ? { backgroundColor: miColor } : null]}
        >
          <Text style={styles.jumpText}>SALTAR</Text>
        </Pressable>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // ── LOGIN ──
  loginContainer: {
    flex: 1,
    backgroundColor: "#050816",
    justifyContent: "center",
    alignItems: "center",
    padding: 30
  },

  loginCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#111827",
    borderRadius: 30,
    padding: 35,
    gap: 20
  },

  loginTitle: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center"
  },

  loginSubtitle: {
    color: "#9ca3af",
    fontSize: 18,
    textAlign: "center",
    marginTop: -10
  },

  inputContainer: {
    gap: 8
  },

  inputLabel: {
    color: "#d1d5db",
    fontSize: 16,
    fontWeight: "600"
  },

  input: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 16,
    color: "white",
    fontSize: 20,
    borderWidth: 1,
    borderColor: "#374151"
  },

  inputHint: {
    color: "#6b7280",
    fontSize: 13
  },

  errorText: {
    color: "#f87171",
    fontSize: 14,
    textAlign: "center"
  },

  conectarButton: {
    backgroundColor: "#9333ea",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 5
  },

  conectarButtonDisabled: {
    backgroundColor: "#6b21a8",
    opacity: 0.7
  },

  conectarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold"
  },

  // ── MANDO ──
  container: {
    flex: 1,
    backgroundColor: "#050816",
    flexDirection: "row",
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "space-between"
  },

  left: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "flex-start",
    height: "100%",
    paddingVertical: 10
  },

  right: {
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
    paddingVertical: 10
  },

  header: {
    gap: 6
  },

  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold"
  },

  connectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },

  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 999
  },

  connectionText: {
    fontSize: 18,
    fontWeight: "600"
  },

  desconectarText: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 2
  },

  colorText: {
    color: "#9ca3af",
    fontSize: 13
  },

  infoCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 16,
    alignItems: "center"
  },

  infoLabel: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 4
  },

  serverText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold"
  },

  dpad: {
    alignItems: "center"
  },

  middleRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  centerGap: {
    width: 16
  },

  dpadButton: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center"
  },

  arrow: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold"
  },

  jumpButton: {
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: "#9333ea",
    justifyContent: "center",
    alignItems: "center"
  },

  jumpText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold"
  }
})
