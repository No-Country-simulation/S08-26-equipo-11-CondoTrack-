import PropTypes from "prop-types";
import { Icon } from "@/shared/components/Icon";

export const TopBar = ({ title, subtitle, actions }) => {
  return (
    <div className="ct-topbar">
      <div>
        <h1 className="ct-topbar-title">{title}</h1>
        {subtitle && <p className="ct-topbar-subtitle">{subtitle}</p>}
      </div>
      <div className="d-flex align-items-center gap-3">
        {actions}
        <button type="button" className="ct-icon-btn" aria-label="Notificaciones">
          <Icon name="notification" size={17} />
          <span className="ct-notif-dot" />
        </button>
      </div>
    </div>
  );
};

TopBar.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
};
