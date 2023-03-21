// CRIAR COLLECTION NO MONGO DB
// front -> api -> api bate numa fila -> receiver calcula o imc e retorna --> MODO DESAFIO
// handler, service, model

const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
const rabbitmqPort = process.env.RABBITMQ_PORT || 5672;
const rabbitmqUser = process.env.RABBITMQ_USER || "guest";
const rabbitmqPassword = process.env.RABBITMQ_PASSWORD || "guest";
const rabbitmqQueue = process.env.RABBITMQ_QUEUE || "imc_queue";

async function sendToQueue(data) {
  const connection = await amqp.connect({
    hostname: rabbitmqHost,
    port: rabbitmqPort,
    username: rabbitmqUser,
    password: rabbitmqPassword,
  });

  const channel = await connection.createChannel();
  await channel.assertQueue(rabbitmqQueue);
  console.log(`Mensagem enviada para a fila`);

  const payload = JSON.stringify(data);
  channel.sendToQueue(rabbitmqQueue, Buffer.from(payload));

  setTimeout(() => {
    connection.close();
  }, 500);
}

app.post("/calcular-imc", async (req, res) => {
  const { peso, altura, name } = req.body;
  if (name == null || name == undefined) {
    console.log("oi");
  }
  console.log(req.body);
  const data = { peso, altura, name };

  try {
    await sendToQueue(data);
    res.json({ message: "Payload enviado para a fila do RabbitMQ." });
  } catch (err) {
    console.error("Erro ao enviar payload para a fila do RabbitMQ:", err);
    res
      .status(500)
      .json({ error: "Erro ao enviar payload para a fila do RabbitMQ." });
  }
});

app.listen(3000, () => {
  console.log("API rodando em http://localhost:3000");
});
