require("dotenv").config();
const amqp = require("amqplib");

async function createChannel() {
  const AMQP_HOSTNAME = process.env.AMQP_HOSTNAME;
  const AMQP_PORT = process.env.AMQP_PORT;
  const AMPQ_USERNAME = process.env.AMPQ_USERNAME;
  const AMQP_PASSWORD = process.env.AMQP_PASSWORD;
  const connection = await amqp.connect({
    hostname: AMQP_HOSTNAME,
    port: AMQP_PORT,
    username: AMPQ_USERNAME,
    password: AMQP_PASSWORD,
  });

  const channel = await connection.createChannel();
  await channel.assertQueue("imc_queue");

  return channel;
}

module.exports = {
  createChannel,
};
