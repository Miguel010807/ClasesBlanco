import { Bodies, Composites } from "matter-js";

export const crearUnCirculo = ({
	x,
	y,
	radio,
	colorDeRelleno,
}: {
	x: number;
	y: number;
	radio: number;
	colorDeRelleno: string;
}): Matter.Body => Bodies.circle(x, y, radio, { render: { fillStyle: colorDeRelleno } });

export const crearUnRectangulo = ({
	x,
	y,
	ancho,
	alto,
	colorDeRelleno,
	estaQuieto = false,
	anguloDeInclinacion = 0,
}: {
	x: number;
	y: number;
	ancho: number;
	alto: number;
	colorDeRelleno: string;
	estaQuieto?: boolean;
	anguloDeInclinacion?: number;
}): Matter.Body =>
	Bodies.rectangle(x, y, ancho, alto, {
		isStatic: estaQuieto,
		render: { fillStyle: colorDeRelleno },
		angle: anguloDeInclinacion,
	});

export const createTrapezoid = ({
	x,
	y,
	ancho,
	alto,
	inclinacion,
	colorDeRelleno,
	estaQuieto,
}: {
	x: number;
	y: number;
	ancho: number;
	alto: number;
	inclinacion: number;
	colorDeRelleno: string;
	estaQuieto?: boolean;
}): Matter.Body =>
	Bodies.trapezoid(x, y, ancho, alto, inclinacion, {
		isStatic: estaQuieto,
		render: { fillStyle: colorDeRelleno },
	});

export const crearFigurasApiladas = ({
	x,
	y,
	filas = 1,
	columnas = 1,
	separacionEntreColumnas = 0,
	separacionEntreFilas = 0,
	fabricaDeFiguraParaApilar,
}: {
	x: number;
	y: number;
	filas?: number;
	columnas?: number;
	separacionEntreColumnas?: number;
	separacionEntreFilas?: number;
	fabricaDeFiguraParaApilar: (x: number, y: number) => Matter.Body;
}): Composites =>
	Composites.stack(
		x,
		y,
		columnas,
		filas,
		separacionEntreColumnas,
		separacionEntreFilas,
		fabricaDeFiguraParaApilar,
	);

export const crearMarco = (lienzo: HTMLCanvasElement): Matter.Body[] => {
	const limitesDelLienzo = lienzo.getBoundingClientRect();
	const grosorDeLosLimites = 10;
	const piso = crearUnRectangulo({
		x: limitesDelLienzo.width / 2,
		y: limitesDelLienzo.height,
		ancho: limitesDelLienzo.width,
		alto: grosorDeLosLimites,
		colorDeRelleno: "transparent",
		estaQuieto: true,
	});
	const paredeIzquierda = crearUnRectangulo({
		x: 0,
		y: limitesDelLienzo.height / 2,
		ancho: grosorDeLosLimites,
		alto: limitesDelLienzo.height,
		colorDeRelleno: "transparent",
		estaQuieto: true,
	});
	const paredDerecha = crearUnRectangulo({
		x: limitesDelLienzo.width,
		y: limitesDelLienzo.height / 2,
		ancho: grosorDeLosLimites,
		alto: limitesDelLienzo.height,
		colorDeRelleno: "transparent",
		estaQuieto: true,
	});

	return [paredDerecha, paredeIzquierda, piso];
};