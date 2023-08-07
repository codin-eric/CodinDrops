import config from './config';
import UserManager from './UserManager';
import ImageManager from './ImageManager';
import Drop from './Drop';
import clipImage from './white_circle.png';
import gardenImage from './grass-target.png';

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
    this.p5.loadImage(gardenImage, (image) => {
      this.gardenImage = image;
      this.gardenWidth = image.width / 1.25;
    });
  }

  draw() {
    const { p5, trailing, dropQueue } = this;
    let { drops } = this;
    if (trailing) {
      p5.background('rgba(0, 0, 0, 0.05)');
    } else {
      p5.clear();
    }
    if (this.gardenImage) {
      this.p5.push();
      this.p5.imageMode(p5.CENTER);
      this.p5.image(
        this.gardenImage,
        p5.windowWidth / 2,
        p5.windowHeight + 12,
        this.gardenWidth,
        this.gardenImage.height / 1.25,
      );
      this.p5.pop();
    }
    const now = Date.now();
    drops = drops.filter((drop) => {
      drop.update();
      if (drop.landed) {
        const leftEdge = this.p5.windowWidth / 2 - this.gardenWidth / 2;
        const rightEdge = this.p5.windowWidth / 2 + this.gardenWidth / 2;
        if (drop.position.x >= leftEdge && drop.position.x <= rightEdge) {
          drop.inGarden = true;
        }
      }
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
    console.log(tags['display-name']);
    const image = await this.imageManager.getImage(clipImage);
    this.queueDrop(image, tags['display-name']);
  }

  queueDrop(image, name) {
    if (this.drops.length <= config.maxVisibleDrops) {
      this.drops.push(new Drop(this.p5, image, name));
    } else {
      this.dropQueue.push(new Drop(this.p5, image, name));
    }
  }
}
