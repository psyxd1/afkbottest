const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals: { GoalBlock } } = require('mineflayer-pathfinder');
const Vec3 = require('vec3');
require('dotenv').config();

const bot = mineflayer.createBot({
  host: process.env.MC_HOST, // e.g. "yourserver.aternos.me"
  port: 25565,
  username: process.env.MC_USERNAME || 'AFK_BOT'
});

bot.loadPlugin(pathfinder);

bot.once('spawn', async () => {
  const mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMove);

  const basePos = bot.entity.position.floored();

  try {
    await placeSoulSand(basePos);
    await placeWater(basePos.offset(0, 1, 0));
    await placeKelp(basePos.offset(0, 1, 0), 5);
    await breakKelp(basePos.offset(0, 5, 0));
    jumpInAFK();
  } catch (err) {
    console.error("AFK setup failed:", err);
  }
});

async function placeSoulSand(pos) {
  const item = bot.inventory.items().find(i => i.name === 'soul_sand');
  if (!item) throw new Error("Soul Sand missing!");
  await bot.equip(item, 'hand');
  await bot.placeBlock(bot.blockAt(pos.offset(0, -1, 0)), new Vec3(0, 1, 0));
  bot.chat('Soul sand placed.');
}

async function placeWater(pos) {
  const item = bot.inventory.items().find(i => i.name === 'water_bucket');
  if (!item) throw new Error("Water bucket missing!");
  await bot.equip(item, 'hand');
  await bot.placeBlock(bot.blockAt(pos.offset(0, -1, 0)), new Vec3(0, 1, 0));
  bot.chat('Water placed.');
}

async function placeKelp(start, height) {
  const kelp = bot.inventory.items().find(i => i.name === 'kelp');
  if (!kelp) throw new Error("Kelp missing!");
  await bot.equip(kelp, 'hand');
  for (let i = 1; i < height; i++) {
    const under = bot.blockAt(start.offset(0, i - 1, 0));
    await bot.placeBlock(under, new Vec3(0, 1, 0));
    await bot.waitForTicks(4);
  }
  bot.chat('Kelp placed.');
}

async function breakKelp(pos) {
  const block = bot.blockAt(pos);
  if (block.name === 'kelp') {
    await bot.dig(block);
    bot.chat('Kelp broken. Bubble column ready.');
  }
}

function jumpInAFK() {
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  bot.chat('AFKing...');
  setInterval(() => {
    bot.setControlState('jump', true);
    bot.setControlState('forward', true);
    setTimeout(() => {
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }, 1500);
  }, 30000);
}

bot.on('end', () => {
  console.log('Bot disconnected. Railway will auto-restart.');
});
