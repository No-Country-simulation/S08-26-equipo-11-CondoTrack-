// components/Loading.jsx
import PropTypes from "prop-types";

const Loading = ({ text = "Cargando..." }) => (
  <div
    className="d-flex flex-column align-items-center justify-content-center gap-3"
    style={{ minHeight: "200px" }}
  >
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">{text}</span>
    </div>
    <p className="text-muted small mb-0">{text}</p>
  </div>
);

Loading.propTypes = {
  text: PropTypes.string,
};

export default Loading;
