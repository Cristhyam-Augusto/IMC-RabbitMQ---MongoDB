require("dotenv").config();
const express = require("express");
const { createChannel } = require("./queue.js");
const IMC = require("./consumer");

const app = express();
app.use(express.json());

async function sendToQueue(data) {
  const channel = await createChannel();
  console.log(`Mensagem enviada para a fila`);

  const payload = JSON.stringify(data);
  channel.sendToQueue("imc_queue", Buffer.from(payload));
}

app.post("/calcular-imc", async (req, res) => {
  const { peso, altura, name } = req.body;
  if (!name) {
    console.log("Nome não foi enviado no payload");
    return res.status(400).json({ error: "Nome não foi enviado no payload" });
  }

  console.log(`Payload recebido: ${JSON.stringify(req.body)}`);

  try {
    await sendToQueue({ peso, altura, name });
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
    const { user, min, max } = req.query;
    let imcData;
    if (user) {
      imcData = await IMC.findOne({ name: user });
    } else {
      let query = {};
      if (min && max) {
        query = { imc: { $gte: min, $lte: max } };
      }
      imcData = await IMC.find(query);
    }
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
