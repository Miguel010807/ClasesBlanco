import Elysia from "elysia";
 
export const app = new Elysia();
 
app.onStart(({ server }) => {
  console.log(
    `estoy escuchando en ws://${server?.hostname}:${server?.port}/ws`,
  );
});
 
app.ws("/ws", {
  open(ws) {
    console.log(`Nuevo cliente conectado ${ws.id}`);
    ws.subscribe("piko-park");
 
    // Le avisamos al propio cliente cuál es su id
    // (ws.publish no le llega a uno mismo, por eso usamos ws.send)
    ws.send(`${ws.id},tu-id`);
 
    ws.publish("piko-park", `${ws.id},nuevo`);
  },
  message(ws, mensaje) {
    ws.send(mensaje);
    console.log(`Mensaje recibido de ${ws.id},${mensaje}`);
    ws.publish("piko-park", `${ws.id},${mensaje}`);
  },
});
 
export default app;

