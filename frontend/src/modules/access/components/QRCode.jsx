import PropTypes from "prop-types";

const GRID_SIZE = 21;
const SEED =
  "10110010101101100101011011001010110110010101101100101011011001010110110010101101100101011011001010110110010101101100101011011001";

const isFinderZone = (row, col) =>
  (row < 8 && col < 8) ||
  (row < 8 && col >= GRID_SIZE - 8) ||
  (row >= GRID_SIZE - 8 && col < 8);

const buildModules = () => {
  const modules = [];
  let seedIndex = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (isFinderZone(row, col)) continue;
      if (SEED[seedIndex % SEED.length] === "1") modules.push({ row, col });
      seedIndex++;
    }
  }
  return modules;
};

const FinderMark = ({ x, y, cell }) => (
  <>
    <rect x={x} y={y} width={7 * cell} height={7 * cell} fill="#111827" rx={cell * 0.3} />
    <rect x={x + cell} y={y + cell} width={5 * cell} height={5 * cell} fill="white" />
    <rect x={x + 2 * cell} y={y + 2 * cell} width={3 * cell} height={3 * cell} fill="#111827" rx={cell * 0.2} />
  </>
);

FinderMark.propTypes = { x: PropTypes.number.isRequired, y: PropTypes.number.isRequired, cell: PropTypes.number.isRequired };

// Patrón visual de código QR (no decodificable): sirve como placeholder de diseño
// hasta que exista una integración real de generación de QR de acceso.
export const QRCode = ({ size = 140 }) => {
  const cell = size / GRID_SIZE;
  const pad = 10;
  const total = size + pad * 2;
  const modules = buildModules();
  const timingCount = GRID_SIZE - 16;

  return (
    <svg width={total} height={total} viewBox={`0 0 ${total} ${total}`}>
      <rect width={total} height={total} fill="white" rx={6} />
      <g transform={`translate(${pad},${pad})`}>
        {modules.map(({ row, col }) => (
          <rect
            key={`${row}-${col}`}
            x={col * cell + 0.3}
            y={row * cell + 0.3}
            width={cell - 0.6}
            height={cell - 0.6}
            fill="#4f46e5"
            rx={1}
          />
        ))}
        <FinderMark x={0} y={0} cell={cell} />
        <FinderMark x={(GRID_SIZE - 7) * cell} y={0} cell={cell} />
        <FinderMark x={0} y={(GRID_SIZE - 7) * cell} cell={cell} />
        {Array.from({ length: timingCount }, (_, i) =>
          i % 2 === 0 ? (
            <rect key={`th${i}`} x={(8 + i) * cell} y={6 * cell} width={cell} height={cell} fill="#111827" />
          ) : null,
        )}
        {Array.from({ length: timingCount }, (_, i) =>
          i % 2 === 0 ? (
            <rect key={`tv${i}`} x={6 * cell} y={(8 + i) * cell} width={cell} height={cell} fill="#111827" />
          ) : null,
        )}
      </g>
    </svg>
  );
};

QRCode.propTypes = { size: PropTypes.number };
