import { useEffect } from "react";
import { Alert, Badge, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { useUnits } from "@/modules/units/context/UnitsContext";

export const UnitsModal = ({ building, show, onHide }) => {
  const { forBuilding, fetchUnits, isUnitsLoading, unitsError } = useUnits();

  useEffect(() => {
    if (show && building?.id) {
      fetchUnits(building.id);
    }
  }, [show, building, fetchUnits]);

  if (!building) return null;

  const units = forBuilding(building.id);
  const loading = isUnitsLoading(building.id);
  const error = unitsError(building.id);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>
          Unidades — {building.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <p className="ct-text-muted">Cargando unidades...</p>}
        {error && (
          <Alert variant="danger" className="py-2 small">
            {error}
          </Alert>
        )}
        {!loading && !error && (
          <div className="d-flex flex-wrap gap-2 mb-4">
            {units.length === 0 && (
              <span className="ct-text-muted">
                Todavía no hay unidades cargadas.
              </span>
            )}
            {units.map((unit) => (
              <Badge
                key={unit.id}
                bg="light"
                text="dark"
                className="border px-2 py-2"
              >
                {unit.label}
              </Badge>
            ))}
          </div>
        )}
        <p className="ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
          La carga de unidades estará disponible próximamente.
        </p>
      </Modal.Body>
    </Modal>
  );
};

UnitsModal.propTypes = {
  building: PropTypes.shape({ id: PropTypes.string, name: PropTypes.string }),
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};
