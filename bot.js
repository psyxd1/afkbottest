const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear } = goals;

function createBot() {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    port: Number(process.env.MC_PORT || 25565),
    username: 'PSY_Bot',
  });

  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    console.log("✅ PSY_Bot spawned");

    const defaultMove = new Movements(bot);
    bot.pathfinder.setMovements(defaultMove);

    startCircularWalk(bot);
    startInventoryShuffle(bot);
    startLookAround(bot);
    startBlockPlacing(bot); // Only works in Creative
  });

  bot.on('error', (err) => {
    console.log("❌ Bot error:", err.message);
    if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
      console.log("Reconnecting in 60 seconds...");
      setTimeout(createBot, 60000);
    }
  });

  bot.on('end', () => {
    console.log("⚠️ Disconnected. Reconnecting in 60 seconds...");
    setTimeout(createBot, 60000);
  });
}

function startCircularWalk(bot) {
  const radius = 5;
  const center = bot.entity.position.clone();
  let angle = 0;

  setInterval(() => {
    angle += Math.PI / 6;
    const x = center.x + radius * Math.cos(angle);
    const z = center.z + radius * Math.sin(angle);
    const y = center.y;

    const goal = new GoalNear(Math.floor(x), Math.floor(y), Math.floor(z), 1);
    bot.pathfinder.setGoal(goal, false);
  }, 6000);
}

function startInventoryShuffle(bot) {
  setInterval(() => {
    const slot = Math.floor(Math.random() * 9);
    bot.setQuickBarSlot(slot);
  }, 4000);
}

function startLookAround(bot) {
  setInterval(() => {
    const yaw = Math.random() * Math.PI * 2;
    const pitch = (Math.random() - 0.5) * 0.5;
    bot.look(yaw, pitch, true);
  }, 7000);
}

function startBlockPlacing(bot) {
  setInterval(() => {
    const refBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (!refBlock) return;

    const hand = 'right';
    bot.activateItem(); // simulate use
    bot.placeBlock(refBlock, vec3(0, 1, 0)).catch(() => {});
  }, 10000); // place block every 10 sec
}

createBot();
