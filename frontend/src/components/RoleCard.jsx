import { FaArrowRight } from "react-icons/fa";

function RoleCard({
  icon,
  title,
  description,
  buttonText,
  role,
  onClick,
}) {
  const handleClick = () => {
    if (onClick) {
      onClick(role);
    }
  };

  return (
    <div className="role-card">

      {/* =========================
          Icon
      ========================= */}

      <div className="role-icon">
        {icon}
      </div>

      {/* =========================
          Content
      ========================= */}

      <div className="role-card-content">

        <h2>{title}</h2>

        <p>{description}</p>

      </div>

      {/* =========================
          Continue Button
      ========================= */}

      <button
        type="button"
        className="role-continue-btn"
        onClick={handleClick}
      >
        <span>{buttonText}</span>

        <FaArrowRight />
      </button>

    </div>
  );
}

export default RoleCard;