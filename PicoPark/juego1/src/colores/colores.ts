// /* CSS HEX */
// --atomic-tangerine: #fd9678ff;
// --burnt-sienna: #d97c65ff;
// --bright-pink-crayola: #f54768ff;
// --quinacridone-magenta: #974063ff;
// --delft-blue: #41436aff;
// --jet: #3e3638ff;

export const atomicTangerineColor = "#fd9678ff";
export const brightPinkCrayolaColor = "#f54768ff";
export const quinacridoneMagentaColor = "#974063ff";
export const delftBlueColor = "#41436aff";

// Orden en el que se reparten los colores a los jugadores.
// Tiene que coincidir con el orden que usa el servidor al asignar colores.
export const coloresDeJugadores = [
	atomicTangerineColor,
	brightPinkCrayolaColor,
	quinacridoneMagentaColor,
	delftBlueColor,
] as const;
