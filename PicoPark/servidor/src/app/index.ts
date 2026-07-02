import Elysia from "elysia";

// Tiene que coincidir con el orden de `coloresDeJugadores` en
// juego1/src/colores/colores.ts, así el jugador 1 siempre es el mismo
// color en ambos lados.
const COLORES_DE_JUGADORES = ["#fd9678ff", "#f54768ff", "#974063ff", "#41436aff"] as const;
type ColorDeJugador = (typeof COLORES_DE_JUGADORES)[number];

// Colores todavía sin asignar a ningún jugador conectado
const colaDeColoresLibres: ColorDeJugador[] = [...COLORES_DE_JUGADORES];

// id de conexión -> color que le tocó
const colorPorJugador = new Map<string, ColorDeJugador>();

const asignarColor = (): ColorDeJugador | null => colaDeColoresLibres.shift() ?? null;

const liberarColor = (idJugador: string): void => {
  const color = colorPorJugador.get(idJugador);
  if (!color) return;

  colorPorJugador.delete(idJugador);
  colaDeColoresLibres.push(color);
};

export const app = new Elysia();

app.onStart(({ server }) => {
  console.log(
    `estoy escuchando en ws://${server?.hostname}:${server?.port}/ws`,
  );
});

app.ws("/ws", {
  open(ws) {
    const color = asignarColor();

    if (!color) {
      // Ya hay 4 jugadores conectados, no entra un 5to
      console.log(`Sala llena, se rechaza a ${ws.id}`);
      ws.send(`${ws.id},sala-llena`);
      ws.close();
      return;
    }

    colorPorJugador.set(ws.id, color);
    console.log(`Nuevo cliente conectado ${ws.id} con color ${color}`);
    ws.subscribe("piko-park");

    // Le avisamos al propio cliente cuál es su id y su color
    // (ws.publish no le llega a uno mismo, por eso usamos ws.send)
    ws.send(`${ws.id},tu-id,${color}`);

    ws.publish("piko-park", `${ws.id},nuevo,${color}`);
  },
  message(ws, mensaje) {
    ws.send(mensaje);
    console.log(`Mensaje recibido de ${ws.id},${mensaje}`);
    ws.publish("piko-park", `${ws.id},${mensaje}`);
  },
  close(ws) {
    liberarColor(ws.id);
    console.log(`Cliente desconectado ${ws.id}`);
    ws.publish("piko-park", `${ws.id},se-fue`);
  },
});

// El Host (juego1) se conecta acá en vez de "/ws": solo escucha lo que
// pasa en la sala, pero no cuenta como jugador ni le sacamos un color
// del pool (si no, el Host se comería 1 de los 4 cupos).
app.ws("/ws-host", {
  open(ws) {
    console.log(`Host conectado ${ws.id}`);
    ws.subscribe("piko-park");
  },
});

export default app;
