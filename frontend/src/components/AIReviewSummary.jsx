import { FaRobot } from "react-icons/fa";

function AIReviewSummary() {
  return (
    <div
      className="ai-card"
      style={{
        background: "#171717",
        border: "1px solid #2d2d2d",
        borderRadius: "18px",
        padding: "20px",
        color: "#ffffff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
      }}
    >

      <div
        className="ai-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "18px",
        }}
      >

        <FaRobot
          size={24}
          color="#ffffff"
        />

        <h3
          style={{
            margin:0,
            fontSize:"20px",
            fontWeight:"700",
          }}
        >
          AI Review Summary
        </h3>

      </div>


      <ul
        style={{
          listStyle:"none",
          padding:0,
          margin:0,
          display:"flex",
          flexDirection:"column",
          gap:"12px",
        }}
      >

        <li
          style={{
            color:"#bdbdbd",
            fontSize:"15px",
          }}
        >
          ⭐ Excellent Food Quality
        </li>


        <li
          style={{
            color:"#bdbdbd",
            fontSize:"15px",
          }}
        >
          😊 Friendly Staff
        </li>


        <li
          style={{
            color:"#bdbdbd",
            fontSize:"15px",
          }}
        >
          🚗 Parking Available
        </li>


        <li
          style={{
            color:"#bdbdbd",
            fontSize:"15px",
          }}
        >
          🧹 Clean Environment
        </li>


      </ul>

    </div>
  );
}

export default AIReviewSummary;