// Un KPI sin datos no debe mostrar 0 ni un guion: 0 es un valor real y el
// guion no explica nada. En su lugar el valor dice qué falta, que es más
// útil que un número que el administrador tomaría por cierto.
export const NO_DATA = "sin datos";
export const NO_UNITS = "sin unidades";

// KPIs que dependen de las unidades del edificio. Sin unidades no hay nada
// que medir, así que se informa la causa en vez de mostrar un 0 engañoso.
export const kpiByUnits = (count, hasUnits, sub) =>
  hasUnits ? { value: count, sub } : { value: NO_UNITS };

// KPIs cuyo origen de datos todavía no existe en el backend. El motivo
// técnico va en el subtítulo para que quede claro que es una limitación
// conocida y no un error de carga.
export const kpiWithoutSource = (sub) => ({ value: NO_DATA, sub });
