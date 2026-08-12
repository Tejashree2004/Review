import MainLayout from "../layouts/MainLayout";

function AdminUsers() {
  return (
    <MainLayout>
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          padding: "30px 20px",
        }}
      >
        <h1>Manage Users</h1>

        <p style={{ color: "#aaa" }}>
          Admin can manage users from here.
        </p>
      </div>
    </MainLayout>
  );
}

export default AdminUsers;