

function AuthLayout({ children }) {
  return (
    <div className="page fadeIn">
      <div className="auth-card">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;