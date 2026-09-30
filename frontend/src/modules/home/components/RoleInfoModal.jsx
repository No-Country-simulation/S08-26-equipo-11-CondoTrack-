import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { Icon } from "@/shared/components/Icon";

export const RoleInfoModal = ({ profile, show, onHide, onEnter }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title
        className="d-flex align-items-center gap-2"
        style={{ fontSize: "1.1rem" }}
      >
        {profile && (
          <span
            className="d-inline-flex align-items-center justify-content-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: "0.5rem",
              background: profile.tileBackground,
            }}
          >
            <Icon name={profile.icon} size={17} style={{ color: profile.accent }} />
          </span>
        )}
        {profile?.title}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p className="ct-text-muted mb-0" style={{ fontSize: "0.875rem" }}>
        {profile?.description}
      </p>
      {profile && !profile.available && (
        <p className="mt-3 mb-0 fw-medium" style={{ fontSize: "0.875rem", color: "var(--color-ink)" }}>
          Este acceso estará disponible próximamente.
        </p>
      )}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="outline-secondary" size="sm" onClick={onHide}>
        {profile?.available ? "Cancelar" : "Entendido"}
      </Button>
      {profile?.available && (
        <Button
          type="button"
          size="sm"
          className="text-white"
          style={{ background: "var(--color-accent)", borderColor: "var(--color-accent)" }}
          onClick={() => {
            onHide();
            onEnter?.();
          }}
        >
          Ingresar
        </Button>
      )}
    </Modal.Footer>
  </Modal>
);

RoleInfoModal.propTypes = {
  profile: PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
    tileBackground: PropTypes.string.isRequired,
    available: PropTypes.bool.isRequired,
  }),
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onEnter: PropTypes.func,
};
