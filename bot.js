const mineflayer = require('mineflayer');

function createBot() {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    port: 25565,
    username: process.env.MC_USERNAME
  });

  bot.on('error', (err) => {
    console.log("Bot error:", err.message);
    if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
      console.log("Retrying in 60 seconds...");
      setTimeout(createBot, 60000);
    }
  });

  bot.on('end', () => {
    console.log("Bot disconnected. Reconnecting in 60 seconds...");
    setTimeout(createBot, 60000);
  });

  // Load plugins and actions here...
}

createBot();
