import {describe, test, expect, afterAll, beforeAll } from 'bun:test';
import { app } from "../src/app/";

describe('Dado un mensaje enviado por un cliene, la respuesta debe ser ese mismo mensaje', () => {

    beforeAll(()  => {
        app.listen(3000);
    });

    test('El socket debe recibir el mismo mensaje que envio: hola bun', async() => {
        const ws = new WebSocket('ws://localhost:3000/ws');
        ws.onopen = () => {
            ws.send("hola bun");
        };

        const posibleRespuesta = new Promise((resolver) => {
            ws.onmessage = (mensaje) => resolver(mensaje.data);       
        });
        expect(await posibleRespuesta).toBe('hola bun');
;
        ws.close();
    });
    
    afterAll(async() => {
        await app.stop();
    });
});
