const amqp = require("amqplib");

async function createChannel() {
  const connection = await amqp.connect({
    hostname: "localhost",
    port: 5672,
    username: "guest",
    password: "guest",
  });

  const channel = await connection.createChannel();
  await channel.assertQueue("imc_queue");

  return channel;
}

module.exports = {
  createChannel,
};
