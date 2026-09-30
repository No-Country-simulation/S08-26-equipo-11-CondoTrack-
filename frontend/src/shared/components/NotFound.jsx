import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const NotFound = ({
  message = "La página que buscas no existe.",
  homePath = "/",
}) => (
  <div
    className="d-flex flex-column align-items-center justify-content-center text-center gap-3"
    style={{ minHeight: "60vh" }}
  >
    <h1 className="display-1 fw-bold text-primary mb-0">404</h1>
    <p className="lead text-muted mb-0">{message}</p>
    <Link to={homePath} className="btn btn-primary">
      Volver al inicio
    </Link>
  </div>
);

NotFound.propTypes = {
  message: PropTypes.string,
  homePath: PropTypes.string,
};

export default NotFound;
