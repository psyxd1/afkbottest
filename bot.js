const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalBlock } = goals;
const vec3 = require('vec3');

function createBot() {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    username: 'PSY_Bot',
  });

  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    console.log('✅ PSY_Bot spawned and ready!');

    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    beginLoop(bot);
  });

  bot.on('error', (err) => {
    console.log('❌ Error:', err.message);
    setTimeout(createBot, 60000);
  });

  bot.on('end', () => {
    console.log('⚠️ Disconnected. Reconnecting in 60 seconds...');
    setTimeout(createBot, 60000);
  });
}

function beginLoop(bot) {
  const center = bot.entity.position.clone();
  let angle = 0;
  const radius = 5;

  setInterval(async () => {
    // 1. Move in a circle
    angle += Math.PI / 4;
    const x = center.x + radius * Math.cos(angle);
    const z = center.z + radius * Math.sin(angle);
    const y = center.y;

    const goal = new GoalBlock(Math.floor(x), Math.floor(y), Math.floor(z));
    bot.pathfinder.setGoal(goal);

    // 2. Wait to reach destination
    await wait(5000);

    // 3. Randomly look around
    const yaw = Math.random() * Math.PI * 2;
    const pitch = (Math.random() - 0.5) * 0.5;
    await bot.look(yaw, pitch, true);

    // 4. Switch hotbar slot
    const slot = Math.floor(Math.random() * 9);
    bot.setQuickBarSlot(slot);

    // 5. Try placing a block (creative mode only)
    try {
      const refBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      if (refBlock && bot.heldItem && bot.heldItem.name.includes('block')) {
        await bot.placeBlock(refBlock, vec3(0, 1, 0));
        console.log('🧱 Block placed!');
      }
    } catch (err) {
      console.log('❌ Block placement failed:', err.message);
    }
  }, 8000);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

createBot();
