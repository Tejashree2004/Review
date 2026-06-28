import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash">

      <div className="logo"></div>

      <h1 className="title">
        REVIEW
      </h1>

      <p className="subtitle">
        Trusted by Communities.
        <br />
        Powered by Experiences.
      </p>

      <div className="loader">
        <div className="loader-fill"></div>
      </div>

    </div>
  );
}

export default Splash;