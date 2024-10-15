document
  .querySelector(".signupbtn")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evitar que se recargue la página

    // Obtener los valores del formulario
    const email = document.getElementById("email").value;
    const password = document.getElementById("psw").value;

    // Estructura del objeto que se enviará
    const loginData = {
      correoElectronico: email, // Verifica que esto coincida
      contrasena: password, // Verifica que esto coincida
    };

    // Hacer la solicitud al backend
    fetch(
      "https://app-9afc6e0e-91ae-4750-8774-0a5f66365117.cleverapps.io/api/v1/public/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Credenciales incorrectas");
        }
      })
      .then((data) => {
        console.log("Usuario logueado:", data);
        sessionStorage.setItem("nombreUsuario", data.name);
        sessionStorage.setItem("token", data.token);
        window.location.href = "/SENSOR/index.html"; // Redirigir a la página principal
      })
      .catch((error) => {
        console.error("Error al iniciar sesión:", error);
        alert("Error: Usuario o contraseña incorrectos");
      });
  });
