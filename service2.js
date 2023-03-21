const amqp = require("amqplib");
const mongoose = require("mongoose");

const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
const rabbitmqPort = process.env.RABBITMQ_PORT || 5672;
const rabbitmqUser = process.env.RABBITMQ_USER || "guest";
const rabbitmqPassword = process.env.RABBITMQ_PASSWORD || "guest";
const rabbitmqQueue = process.env.RABBITMQ_QUEUE || "imc_queue";

const mongodbURI = "";

async function connectToMongoDB() {
  await mongoose.connect(mongodbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("Connected to MongoDB Atlas!");
}

const imcSchema = new mongoose.Schema({
  name: String,
  peso: Number,
  altura: Number,
  imc: Number,
});

const IMC = mongoose.model("IMC", imcSchema);

async function consumeFromQueue() {
  await connectToMongoDB();

  const connection = await amqp.connect({
    hostname: rabbitmqHost,
    port: rabbitmqPort,
    username: rabbitmqUser,
    password: rabbitmqPassword,
  });

  const channel = await connection.createChannel();
  await channel.assertQueue(rabbitmqQueue);
  console.log(`Waiting for messages in queue: ${rabbitmqQueue}`);

  channel.consume(
    rabbitmqQueue,
    async (msg) => {
      const data = JSON.parse(msg.content.toString());

      const { name, peso, altura } = data;
      const imc = peso / (altura * altura);
      console.log(`Received message from queue: ${JSON.stringify(data)}`);
      console.log(`Ola ${name}, eu calculei o seu IMC e ele é IMC: ${imc}`);
      const savedIMC = await IMC.create({
        name,
        peso,
        altura,
        imc,
      });
      console.log("Saved IMC data to MongoDB:", savedIMC);
      channel.ack(msg);
    },
    { noAck: false }
  );
}

consumeFromQueue().catch((err) => {
  console.error("Error consuming from queue:", err);
  process.exit(1);
});
