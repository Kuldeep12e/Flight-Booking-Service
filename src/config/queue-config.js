const amqplib = require('amqplib');
let channel,connection;
async function connectQueue(){
    try {
    connection = await amqplib.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('notification-queue');
    return channel;
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
}

async function sendData(data){
    try {
        await channel.sendToQueue('notification-queue',Buffer.from(JSON.stringify(data)));
    } catch (error) {
        console.error('Error sending data to queue:', error);
        throw error;
    }
}


module.exports = {
    connectQueue,
    sendData
};