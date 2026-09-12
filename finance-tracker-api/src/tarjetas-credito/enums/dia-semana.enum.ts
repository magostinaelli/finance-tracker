export const DiaSemana = {
  DOMINGO: { valor: 'DOMINGO', numero: 0 },
  LUNES: { valor: 'LUNES', numero: 1 },
  MARTES: { valor: 'MARTES', numero: 2 },
  MIERCOLES: { valor: 'MIERCOLES', numero: 3 },
  JUEVES: { valor: 'JUEVES', numero: 4 },
  VIERNES: { valor: 'VIERNES', numero: 5 },
  SABADO: { valor: 'SABADO', numero: 6 },
} as const;
 
// Tipo que representa los valores posibles (para usar en la entidad, igual que un enum)
export type DiaSemana = (typeof DiaSemana)[keyof typeof DiaSemana]['valor'];
 
// Lista de los valores válidos, útil para el CHECK constraint o validaciones manuales
export const VALORES_DIA_SEMANA = Object.values(DiaSemana).map((d) => d.valor);
 
 