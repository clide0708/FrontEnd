export default function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario"); // limpa os dados do usuário
    window.location.reload(); // reinicia a tela
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "10px 20px",
        backgroundColor: "#bf2c71",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "20px"
      }}
    >
      Logout
    </button>
  );
}
