import { Vector } from 'p5';
import config from './config';

export default class Drop {
  /**
   * @param {import('p5')} p5
   * @param {import('p5').Image} image
   */
  constructor(p5, image, name) {
    this.p5 = p5;
    this.image = image;
    this.name = name;
    this.textSize = 20;
    this.landed = false;
    this.wobble = p5.random(p5.TAU);
    this.position = p5.createVector(
      p5.random(0, p5.windowWidth - image.width),
      -100,
    );
    this.velocity = Vector.fromAngle(
      p5.random(p5.PI * 0.1, p5.PI * 0.9),
      p5.random(3, 7),
    );
  }

  draw(now) {
    this.p5.push();

    // translate to the point we want to rotate around, which is the top center of the drop
    this.p5.translate(this.position.x, this.position.y - this.image.height / 2);
    // rotate by the drops wobble value mapped between -PI/16 and PI/16
    this.p5.rotate(this.p5.map(this.p5.sin(this.wobble), -1, 1, -this.p5.QUARTER_PI / 2, this.p5.QUARTER_PI / 2));
    // translate down from the rotate point to the draw point (center)
    this.p5.translate(0, this.image.height / 2);
    this.p5.image(this.image, 0, 0,);

    // Draw name
    this.p5.fill(255);
    this.p5.stroke(0);
    this.p5.strokeWeight(2);
    this.p5.textAlign(this.p5.CENTER);

    this.p5.translate(0, - this.image.height + this.textSize/2);
    this.p5.textSize(this.textSize);
    this.p5.text(this.name, this.textSize, 32);
    this.p5.pop();
  }

  update() {
    const {
      position, velocity, p5, image, landed,
    } = this;
    
    position.add(velocity);
    if (position.x <= 0) {
      velocity.mult(-1, 1);
    } else if ((position.x + image.width) >= p5.windowWidth) {
      velocity.mult(-1, 1);
      position.x = p5.windowWidth - image.width;
    }

    this.wobble += p5.random(0.05, 0.1);
    if (landed){
      velocity.mult(0.9999, 0);
      this.wobble *= 0.9999;
    };

    if (position.y + image.height >= p5.windowHeight) {
      position.y = p5.windowHeight - image.height;
      this.landed = true;
      this.landTime = Date.now();
    }
  }
}
