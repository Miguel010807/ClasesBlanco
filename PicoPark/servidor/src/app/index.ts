import Elysia from "elysia";

const COLORES_DE_JUGADORES = ["#fd9678ff", "#f54768ff", "#974063ff", "#41436aff"] as const;
type ColorDeJugador = (typeof COLORES_DE_JUGADORES)[number];

const colaDeColoresLibres: ColorDeJugador[] = [...COLORES_DE_JUGADORES];
const colorPorJugador = new Map<string, ColorDeJugador>();

interface Inputs {
  izquierda: boolean;
  derecha: boolean;
  saltar: boolean;
}
const inputsPorJugador: Record<string, Inputs> = {};

const asignarColor = (): ColorDeJugador | null => colaDeColoresLibres.shift() ?? null;

const liberarColor = (idJugador: string): void => {
  const color = colorPorJugador.get(idJugador);
  if (!color) return;
  colorPorJugador.delete(idJugador);
  delete inputsPorJugador[idJugador];
  colaDeColoresLibres.push(color);
};

export const app = new Elysia();

app.onStart(({ server }) => {
  console.log(` Servidor iniciado. Escuchando en ws://${server?.hostname}:${server?.port}/ws`);
});

app.ws("/ws", {
  open(ws) {
    const color = asignarColor();
    if (!color) {
      console.log(`⚠️ Intento de conexión rechazado: Sala llena.`);
      ws.send(JSON.stringify({ tipo: "sala-llena" }));
      ws.close();
      return;
    }

    colorPorJugador.set(ws.id, color);
    inputsPorJugador[ws.id] = { izquierda: false, derecha: false, saltar: false };
    
    ws.subscribe("piko-park");

    // 🟢 TESTEO: Saber quién se conecta
    console.log(`\n🟩 JUGADOR CONECTADO`);
    console.log(`   └─ ID: ${ws.id}`);
    console.log(`   └─ Color Asignado: ${color}`);
    console.log(`   └─ Total Jugadores actuales: ${colorPorJugador.size}`);

    ws.send(JSON.stringify({ tipo: "bienvenida", id: ws.id, color }));
    ws.publish("piko-park", JSON.stringify({ tipo: "nuevo-jugador", id: ws.id, color }));
  },
  
  message(ws, mensaje) {
    try {
      const msgStr = (mensaje as string).trim();
      
      if (msgStr === "left" || msgStr === "right" || msgStr === "jump" || msgStr === "stop") {
        const currentInputs = inputsPorJugador[ws.id] || { izquierda: false, derecha: false, saltar: false };

        if (msgStr === "left") {
          currentInputs.izquierda = true;
          currentInputs.derecha = false;
        } else if (msgStr === "right") {
          currentInputs.derecha = true;
          currentInputs.izquierda = false;
        } else if (msgStr === "jump") {
          currentInputs.saltar = true;
        } else if (msgStr === "stop") {
          currentInputs.izquierda = false;
          currentInputs.derecha = false;
          currentInputs.saltar = false;
        }

        inputsPorJugador[ws.id] = currentInputs;

        // 🕹️ TESTEO: Ver qué botón se presionó en tiempo real
        console.log(`🎮 [Input - ${ws.id.substring(0,6)}...]: Comando recibido -> "${msgStr}"`);

        ws.publish("piko-park", JSON.stringify({
          tipo: "actualizar-input",
          id: ws.id,
          inputs: inputsPorJugador[ws.id]
        }));

        if (msgStr === "jump") {
          inputsPorJugador[ws.id].saltar = false;
        }
        return;
      }

      const data = JSON.parse(msgStr);
      if (data.tipo === "input") {
        inputsPorJugador[ws.id] = {
          izquierda: !!data.izquierda,
          derecha: !!data.derecha,
          saltar: !!data.saltar
        };
        
        ws.publish("piko-park", JSON.stringify({
          tipo: "actualizar-input",
          id: ws.id,
          inputs: inputsPorJugador[ws.id]
        }));
      }
    } catch (e) {
      console.error("❌ Error procesando input:", e);
    }
  },
  
  close(ws) {
    // 🟥 TESTEO: Saber quién se va
    console.log(`\n🟥 JUGADOR DESCONECTADO`);
    console.log(`   └─ ID: ${ws.id}`);
    
    liberarColor(ws.id);
    ws.publish("piko-park", JSON.stringify({ tipo: "jugador-desconectado", id: ws.id }));
    
    console.log(`   └─ Total Jugadores restantes: ${colorPorJugador.size}`);
  },
});

app.ws("/ws-host", {
  open(ws) {
    console.log(`\n🖥️ Host (Astro) conectado al WebSocket central`);
    ws.subscribe("piko-park");
    
    ws.send(JSON.stringify({
      tipo: "estado-inicial",
      jugadores: Array.from(colorPorJugador.entries()).map(([id, color]) => ({ id, color }))
    }));
  },
});

export default app;
