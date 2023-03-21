const form = document.getElementById("imc-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const peso = document.getElementById("peso").value;
  const altura = document.getElementById("altura").value;
  const name = document.getElementById("name").value;
  //ESTUDAR
  try {
    const response = await fetch("http://localhost:3000/calcular-imc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ peso, altura, name }),
    });
    //ESTUDAR
    const data = await response.json();
    const resultado = document.getElementById("resultado");
    resultado.textContent = `Seu IMC é ${data.imc.toFixed(2)}`;
  } catch (error) {
    (error) => console.error(error);
  }
});
