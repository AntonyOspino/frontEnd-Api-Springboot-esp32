const apiUrl =
  "https://app-9afc6e0e-91ae-4750-8774-0a5f66365117.cleverapps.io/api/v1";

// Obtener los datos del almacenamiento
const nombreUsuario = sessionStorage.getItem("nombreUsuario");

let intervaloLed; // Variable para almacenar el ID del intervalo del LED
let intervaloSensor; // Variable para almacenar el ID del intervalo del sensor

const modal = document.getElementById("myModal");
const modalMessage = document.getElementById("modalMessage");
const span = document.getElementsByClassName("close")[0];

const btnSensorOn = document.getElementById("btnSensorOn");
const btnSensorOff = document.getElementById("btnSensorOff");
const btnSensorRegistros = document.getElementById("btnSensorRegistros");
const btnLedRegistros = document.getElementById("btnLedRegistros");
const ledStatusDiv = document.getElementById("ledStatus");
const btnEnviarRegistroLed = document.getElementById("toggleButton");

// Función para mostrar mensajes en el modal
function showModal(message) {
  modalMessage.textContent = message;
  modal.style.display = "block";
  console.log("Mostrando modal con mensaje:", message); // Log adicional
}

// Función para mostrar modal de Bienvenida
function showModalBienvenida(message) {
  const welcomeMessage = "Bienvenido(a) " + message;
  modalMessage.textContent = welcomeMessage;
  modal.style.display = "block";
  console.log(welcomeMessage); // Log adicional
}

// Función para cerrar el modal
function closeModal() {
  modal.style.display = "none";
  console.log("Ocultando modal"); // Log adicional
}

// Event listeners para cerrar el modal
span.onclick = closeModal;
window.onclick = function (event) {
  if (event.target === modal) {
    closeModal();
  }
};

// Función para mostrar un mensaje de sensor activado/desactivado
function showModalSensorLed(estado) {
  // Verifica si el estado es "activado" o "desactivado" y muestra el mensaje correcto
  const mensaje = estado === "activado" ? "activados" : "desactivados";
  showModal(`Sensor & Led ${mensaje}`);
}

// Función para obtener la lista de registros del sensor
function obtenerRegistrosSensor() {
  const token = sessionStorage.getItem("token");

  fetch(`${apiUrl}/registrosSensor`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      //console.log("Registros del sensor:", data);
      mostrarRegistros(data, "sensor"); // Mostrar los registros en el frontend
    })
    .catch((error) => {
      console.error("Error al obtener los registros del SENSOR:", error);
      showModal("Error al obtener los registros del sensor");
    });
}

// Funcion para obtener la lista de registros del led
function obtenerRegistrosLed() {
  const token = sessionStorage.getItem("token");

  fetch(`${apiUrl}/registrosLed`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      //console.log("Registros del LED:", data);
      mostrarRegistros(data, "led");
    })
    .catch((error) => {
      console.error("Error al obtener los registros del LED:", error);
      showModal("Error al obtener los registros del LED");
    });
}

// Función para mostrar los registros en el frontend
function mostrarRegistros(registros, tipoValor) {
  let registrosHtml = "";
  registros.forEach((registro, index) => {
    //las propiedades de registro
    const fecha = new Date(registro.fechaHora);
    const fechaFormateada = fecha.toLocaleString(); // Esto te da un formato legible de fecha y hora
    // Obtén el valor basado en el tipoValor
    const valor =
      tipoValor === "led" ? registro.valorLed : registro.valorSensor;

    registrosHtml += `
      <tr>
        <td>${index + 1}</td>
        <td>${fechaFormateada}</td>
        <td>${valor}</td>
      </tr>
    `;
  });

  //tabla en HTML con el id 'registrosTabla'
  const tablaRegistros = document
    .getElementById("registrosTabla")
    .getElementsByTagName("tbody")[0];
  tablaRegistros.innerHTML = registrosHtml;
}

// Función para enviar el estado del sensor (activado/desactivado) al backend
function enviarEstadoSensorLed(estado) {
  const token = sessionStorage.getItem("token");

  const data = {
    estado: estado,
  };

  fetch(`${apiUrl}/registrosComunicacion/actualizarComunicacion`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json(); // Espera un JSON como respuesta
    })
    .then((data) => {
      console.log("Respuesta de la API:", data);
      showModalSensorLed(estado.toLowerCase());
    })
    .catch((error) => {
      console.error("Error:", error);
      showModal("Error al actualizar el estado del sensor");
    });
}

// Función para actualizar el estado del LED
function actualizarEstadoLed(estado) {
  if (estado === "encendido") {
    ledStatusDiv.classList.add("led-on");
    ledStatusDiv.textContent = "Encendido";
  } else {
    ledStatusDiv.classList.remove("led-on");
    ledStatusDiv.textContent = "Apagado";
  }
}

// Función para obtener el último registro del LED
async function obtenerUltimoRegistroLed() {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(`${apiUrl}/registrosLed/ultimo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Detalles del error:", response);
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    const estado = data.valorLed; // Suponiendo que `valorLed` devuelve "encendido" o "apagado"

    // Actualizar el estado del LED en la interfaz de usuario
    actualizarEstadoLed(estado.toLowerCase()); // Asegúrate de que el estado esté en minúsculas
    console.log(estado.toLowerCase());

    return estado; // Devolver el estado del LED
  } catch (error) {
    console.error("Error al obtener el último registro del LED:", error);
    return null; // Puedes devolver null o un valor predeterminado en caso de error
  }
}

// funcion para hacer un nuevo registro contrario al ultimo registrado pasar el objeto con el estado ya cambiado
function registrarValorLed(dataRequest) {
  const token = sessionStorage.getItem("token");

  fetch(`${apiUrl}/registrosLed/registrarValorLedWeb`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dataRequest),
  })
    .then((response) => {
      if (response.ok) {
        return response.text(); // Cambiado a `response.text()` para obtener el mensaje
      } else {
        showModal("Active el Sensor y Led");
        //throw new Error("Error al registrar el valor del LED");
      }
    })
    .then((message) => {
      console.log(message); // Manejar el mensaje de éxito
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al registrar el LED");
    });
}

//obtener registros sensor
btnSensorRegistros.onclick = function () {
  obtenerRegistrosSensor(); // Llama a la función para obtener los registros sensor
  console.log("Botón obtener registros sensor presionado");

  // Detener intervalo del LED si está activo
  if (intervaloLed) {
    clearInterval(intervaloLed); // Detener el intervalo del LED
    intervaloLed = null; // Reiniciar la variable
  }

  // Iniciar el intervalo para obtener registros del sensor cada 5 segundos si no está ya en ejecución
  if (!intervaloSensor) {
    intervaloSensor = setInterval(obtenerRegistrosSensor, 1500);
  }
};

//otener registros led
btnLedRegistros.onclick = function () {
  obtenerRegistrosLed(); // Llama a la función para obtener los registros led
  console.log("Botón obtener registros led presionado");

  // Detener intervalo del sensor si está activo
  if (intervaloSensor) {
    clearInterval(intervaloSensor); // Detener el intervalo del sensor
    intervaloSensor = null; // Reiniciar la variable
  }

  // Iniciar el intervalo para obtener registros del LED cada 5 segundos si no está ya en ejecución
  if (!intervaloLed) {
    intervaloLed = setInterval(obtenerRegistrosLed, 1500);
  }
};

// Botones de encender y apagar el sensor
btnSensorOn.onclick = function () {
  enviarEstadoSensorLed("activado");
};

btnSensorOff.onclick = function () {
  enviarEstadoSensorLed("desactivado");
};

btnEnviarRegistroLed.onclick = async function () {
  let valor = await obtenerUltimoRegistroLed(); // Espera a que la función asíncrona termine
  console.log("valor obtenido: " + valor);

  if (valor) {
    let estado = valor === "encendido" ? "apagado" : "encendido"; // Cambiar el estado

    console.log("nuevo valor: " + estado);
    const dataRequest = {
      estado: estado,
    };

    // Llama a la función para registrar el nuevo estado del LED
    registrarValorLed(dataRequest);
  } else {
    console.error("No se pudo obtener el último registro del LED.");
  }
};

// Configura un intervalo para comprobar el estado del LED cada 5 segundos (5000 ms)
setInterval(obtenerUltimoRegistroLed, 1000);

//bienvenida
showModalBienvenida(nombreUsuario);
