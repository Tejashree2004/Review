import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  name,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="form-group">
      <label>{label}</label>

      <div
        style={{
          position: "relative",
        }}
      >
        <input
          className="form-control"
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
        />

        <span
          onClick={() => setShow(!show)}
          style={{
            position: "absolute",
            right: "18px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: "#bdbdbd",
            fontSize: "18px",
          }}
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>
    </div>
  );
}

export default PasswordInput;