import MainLayout from "../layouts/MainLayout";

function AdminDashboard() {
  return (
    <MainLayout>
      <div style={{ color: "#fff", padding: "30px" }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: "#aaa" }}>
          Manage the REVIO platform.
        </p>
      </div>
    </MainLayout>
  );
}

export default AdminDashboard;