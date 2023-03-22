const express = require("express");
const cors = require("cors");
const { createChannel } = require("./queue.js");
const IMC = require("./service2");

const app = express();
app.use(cors());
app.use(express.json());

async function sendToQueue(data) {
  const channel = await createChannel();
  console.log(`Mensagem enviada para a fila`);

  const payload = JSON.stringify(data);
  channel.sendToQueue("imc_queue", Buffer.from(payload));

  setTimeout(() => {
    channel.close();
  }, 500);
}

app.post("/calcular-imc", async (req, res) => {
  const { peso, altura, name } = req.body;
  if (!name) {
    console.log("Nome não foi enviado no payload");
    return res.status(400).json({ error: "Nome não foi enviado no payload" });
  }

  console.log(`Payload recebido: ${JSON.stringify(req.body)}`);
  const data = { peso, altura, name };

  try {
    await sendToQueue(data);
    console.log("Payload enviado para a fila do RabbitMQ");
    res.json({ message: "Payload enviado para a fila do RabbitMQ." });
  } catch (err) {
    console.error("Erro ao enviar payload para a fila do RabbitMQ:", err);
    res
      .status(500)
      .json({ error: "Erro ao enviar payload para a fila do RabbitMQ." });
  }
});

app.get("/imc", async (req, res) => {
  try {
    const imcData = await IMC.find();
    console.log(`Dados do IMC retornados: ${JSON.stringify(imcData)}`);
    res.json(imcData);
  } catch (err) {
    console.error("Erro ao buscar dados do banco de dados:", err);
    res.status(500).json({ error: "Erro ao buscar dados do banco de dados." });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
