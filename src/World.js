import config from './config';
import UserManager from './UserManager';
import ImageManager from './ImageManager';
import Drop from './Drop';
import clipImage from './white_circle.png';  // Drop image

export default class World {
  /**
   * @param {import('p5')} p5
   */
  constructor(p5) {
    this.p5 = p5;
    this.drops = [];
    this.dropQueue = [];
    this.trailing = false;
    this.userManager = new UserManager();
    this.imageManager = new ImageManager(p5);

    this.draw = this.draw.bind(this);
  }

  draw() {
    const { p5, trailing, dropQueue } = this;
    let { drops } = this;
    if (trailing) {
      p5.background('rgba(0, 0, 0, 0.05)');
    } else {
      p5.clear();
    }

    const now = Date.now();

    // update and draw drops
    drops = drops.filter((drop) => {
      drop.update();
      return !drop.draw(now);
    });
    if (drops.length <= config.maxVisibleDrops) {
      const end = config.maxVisibleDrops - drops.length;
      drops = drops.concat(dropQueue.slice(0, end));
      this.dropQueue = dropQueue.slice(end);
    }
    this.drops = drops;
  }

  async doDrop({ tags, message }) {
    const image = await this.imageManager.getImage(clipImage);
    this.queueDrop(image, tags['display-name']);
  }

  queueDrop(image, name) {
    // iterate over drops and if the drop is already in the drops array re-queue it
    this.drops.forEach((drop, index) => {
      if (drop.name === name) {
        this.drops.splice(index, 1);
      }
    });

    if (this.drops.length <= config.maxVisibleDrops) {
      this.drops.push(new Drop(this.p5, image, name));
    } else {
      this.dropQueue.push(new Drop(this.p5, image, name));
    }
  }
}
