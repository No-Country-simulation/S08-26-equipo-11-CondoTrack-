import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Html5Qrcode } from "html5-qrcode";

const READER_ID = "ct-qr-reader";

// Escáner de QR con la cámara (librería html5-qrcode).
// Al leer un código válido llama onScan(token) y se detiene.
export const QrScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const onScanRef = useRef(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(READER_ID, { verbose: false });
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (cancelled || !decodedText) return;
          cancelled = true;
          onScanRef.current?.(decodedText);
        },
        () => {
          // ignore por frame: no hay QR a la vista
        },
      )
      .then(() => {
        if (!cancelled) setStarting(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "No se pudo abrir la cámara. Revisá los permisos del navegador.",
          );
          setStarting(false);
        }
      });

    return () => {
      cancelled = true;
      scanner
        .stop()
        .catch(() => {})
        .finally(() => {
          scanner.clear().catch(() => {});
        });
    };
  }, []);

  const handleClose = async () => {
    try {
      await scannerRef.current?.stop();
    } catch {
      // ignore
    } finally {
      try {
        await scannerRef.current?.clear();
      } catch {
        // ignore
      }
      onClose?.();
    }
  };

  return (
    <div className="mt-3">
      <div
        id={READER_ID}
        style={{ width: "100%", borderRadius: "0.5rem", overflow: "hidden" }}
      />
      {starting && !error && (
        <p className="ct-text-muted mt-2 mb-0" style={{ fontSize: "0.75rem" }}>
          Abriendo cámara…
        </p>
      )}
      {error && (
        <div className="alert alert-danger py-2 small mt-2 mb-0">{error}</div>
      )}
      <div className="d-flex justify-content-end mt-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={handleClose}
        >
          Cerrar cámara
        </button>
      </div>
      <p className="ct-font-mono ct-text-faint mt-2 mb-0" style={{ fontSize: "0.6875rem" }}>
        Apuntá al QR del visitante para validar el ingreso.
      </p>
    </div>
  );
};

QrScanner.propTypes = {
  onScan: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};
