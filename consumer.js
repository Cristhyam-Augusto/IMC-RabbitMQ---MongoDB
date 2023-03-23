require("dotenv").config();
const mongoose = require("mongoose");
const { createChannel } = require("./queue.js");

const mongodbURI = process.env.DB_URI;

async function connectToMongoDB() {
  try {
    await mongoose.connect(mongodbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB Atlas!");
  } catch (error) {
    console.log("não foi possivel conectar ao mongoDB");
  }
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
  try {
    const channel = await createChannel();
    console.log(`Esperando mensagem da fila: IMC_QUEUE`);

    channel.consume(
      "imc_queue",
      async (msg) => {
        const data = JSON.parse(msg.content.toString());

        const { name, peso, altura } = data;
        const imc = Number(peso / (altura * altura)).toFixed();
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
      { noAck: false } //confirmação de mensagem
    );
  } catch (error) {
    console.error("Error consuming from queue:", error);
    process.exit(1);
  }
}
consumeFromQueue();

module.exports = IMC;
