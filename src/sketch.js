/* eslint-disable no-param-reassign */

import tmi from 'tmi.js';
import Drop from './Drop';
import config from './config';
import World from './World';

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: [config.channelName],
});

client.connect();

const validDropCommands = new Set(config.dropCommands);

/**
 * @param {import('p5')} p5
 */
export default function sketch(p5) {
  const world = new World(p5);

  client.on('message', async (channel, tags, message, self) => {
    if (self) return;
    if (!message.startsWith(config.commandPrefix)) return;
    const args = message.split(' ');
    const command = args.shift().slice(config.commandPrefix.length);
    if (validDropCommands.has(command)) {
      world.doDrop({ args, tags, message });
    } else if (tags.badges && tags.badges.broadcaster) {
      if (command === 'trail') world.trailing = !world.trailing;
      else if (['start-trail', 'trail-start'].includes(command)) world.trailing = true;
      else if (['end-trail', 'trail-end'].includes(command)) world.trailing = false;
      else if (command === 'drop-timeout') {
        const timeout = Number(message.split(' ')[1]);
        if (!isNaN(timeout)) {
          config.dropTimeout = timeout * 1000;
        }
      }
    }
  });

  p5.setup = async () => {
    p5.frameRate(60);
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.P2D);
    if (config.test) {
      const images = await Promise.all(
        [
          'https://static-cdn.jtvnw.net/emoticons/v1/303046121/2.0',
          'https://static-cdn.jtvnw.net/emoticons/v1/302039277/2.0',
          'https://static-cdn.jtvnw.net/emoticons/v1/301988022/2.0',
        ].map((url) => world.imageManager.getImage(url)),
      );
      world.drops = Array.from({ length: 10 }).reduce(
        (drops) => drops.concat(images.map((image) => new Drop(p5, image))),
        [],
      );
    }
  };
  p5.draw = world.draw;
}
