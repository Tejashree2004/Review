import React from "react";

function MainLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default MainLayout;