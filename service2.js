const mongoose = require("mongoose");

const { createChannel } = require("./queue.js");

const mongodbURI =
  "mongodb+srv://Cris:24061998@cluster0.zqw2vbl.mongodb.net/test";

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
    { noAck: false }
  );
}

consumeFromQueue().catch((err) => {
  console.error("Error consuming from queue:", err);
  process.exit(1);
});

module.exports = IMC;
