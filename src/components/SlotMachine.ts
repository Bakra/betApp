import {
  Application,
  Assets,
  Container,
  Texture,
  Sprite,
  Graphics,
  Text,
  TextStyle,
  BlurFilter,
} from 'pixi.js';

interface Reel {
  container: Container;
  symbols: Sprite[];
  position: number;
  previousPosition: number;
  blur: BlurFilter;
}

interface Tween {
  object: any;
  property: string;
  propertyBeginValue: number;
  target: number;
  easing: (t: number) => number;
  time: number;
  change?: (tween: Tween) => void;
  complete?: (tween: Tween) => void;
  start: number;
}

class SlotMachine extends Container {
  private app: Application;
  private reels: Reel[] = [];
  private running: boolean = false;
  private tweening: Tween[] = [];
  private slotTextures: Texture[] = [];

  private readonly REEL_WIDTH = 160;
  private readonly SYMBOL_SIZE = 150;

  constructor(app: Application) {
    super()
    this.app = app;
    this.init();
  }

  private async init() {
    await this.loadTextures();
    this.createReels();
    this.createUI();
    this.app.ticker.add(() => this.update());
  }

  private async loadTextures() {
    const textureUrls = [
      'https://robohash.org/stefan-one.png',
      'https://robohash.org/stefan-two.png',
      'https://robohash.org/stefan-three.png',
      'https://robohash.org/stefan-four.png',
    ];

    for (const url of textureUrls) {
      const texture = await Assets.load<Texture>(url);
      this.slotTextures.push(texture);
    }
  }

  private createReels() {
    const reelContainer = new Container();
    for (let i = 0; i < 5; i++) {
      const rc = new Container();
      rc.x = i * this.REEL_WIDTH;
      reelContainer.addChild(rc);

      const reel: Reel = {
        container: rc,
        symbols: [],
        position: 0,
        previousPosition: 0,
        blur: new BlurFilter(),
      };

      reel.blur.blurX = 0;
      reel.blur.blurY = 0;
      rc.filters = [reel.blur];

      // Build the symbols
      for (let j = 0; j < 4; j++) {
        const symbol = new Sprite(
          this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)]
        );

        symbol.y = j * this.SYMBOL_SIZE;
        symbol.scale.set(
          Math.min(
            this.SYMBOL_SIZE / symbol.width,
            this.SYMBOL_SIZE / symbol.height
          )
        );
        symbol.x = Math.round((this.SYMBOL_SIZE - symbol.width) / 2);
        reel.symbols.push(symbol);
        rc.addChild(symbol);
      }
      this.reels.push(reel);
    }
    this.app.stage.addChild(reelContainer);

    const margin = (this.app.screen.height - this.SYMBOL_SIZE * 3) / 2;

    reelContainer.y = margin;
    reelContainer.x = Math.round(
      (this.app.screen.width - this.REEL_WIDTH * 5) / 2
    );
  }

  private createUI() {
    const margin = (this.app.screen.height - this.SYMBOL_SIZE * 3) / 2;

    // Top and Bottom Graphics
    const top = new Graphics();
    top.beginFill(0x0);
    top.drawRect(0, 0, this.app.screen.width, margin);
    top.endFill();

    const bottom = new Graphics();
    bottom.beginFill(0x0);
    bottom.drawRect(
      0,
      this.SYMBOL_SIZE * 3 + margin,
      this.app.screen.width,
      margin
    );
    bottom.endFill();

        // Button Background
        const buttonBackground = new Graphics();
        const buttonWidth = 250;
        const buttonHeight = 80;
        const buttonX = Math.round((this.app.screen.width - buttonWidth) / 2);
        const buttonY =
          this.app.screen.height - margin + Math.round((margin - buttonHeight) / 2);
    
        buttonBackground.beginFill(0x00ff99);
        buttonBackground.drawRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
        buttonBackground.endFill();
        buttonBackground.interactive = true;
        buttonBackground.cursor = 'pointer';
        buttonBackground.on('pointerdown', () => this.startPlay());
    
        // Play Text for Button
        const buttonTextStyle = new TextStyle({
          fontFamily: 'Arial',
          fontSize: 36,
          fontWeight: 'bold',
          fill: '#ffffff',
          dropShadow: true,
        });
    
        const playText = new Text('Play !', buttonTextStyle);
        playText.x = buttonX + (buttonWidth - playText.width) / 2;
        playText.y = buttonY + (buttonHeight - playText.height) / 2;
    
        // Add button and text to the bottom
        bottom.addChild(buttonBackground);
        bottom.addChild(playText);

    // Add to Stage
    this.app.stage.addChild(bottom);

    // Interactivity
    bottom.interactive = true;
    bottom.cursor = 'pointer';
    bottom.on('pointerdown', () => this.startPlay());
  }

  private startPlay() {
    if (this.running) return;
    this.running = true;

    for (let i = 0; i < this.reels.length; i++) {
      const r = this.reels[i];
      const extra = Math.floor(Math.random() * 3);
      const target = r.position + 10 + i * 5 + extra;
      const time = 2500 + i * 600 + extra * 600;

      this.tweenTo(
        r,
        'position',
        target,
        time,
        this.backout(0.5),
        undefined, // Replaced null with undefined
        i === this.reels.length - 1 ? () => this.reelsComplete() : undefined // Replaced null with undefined
      );
    }
  }

  private reelsComplete() {
    this.running = false;
  }

  private update() {
    // Update the reels
    for (const r of this.reels) {
      // Update blur filter
      r.blur.blurY = (r.position - r.previousPosition) * 12;
      r.previousPosition = r.position;

      // Update symbol positions
      for (let j = 0; j < r.symbols.length; j++) {
        const s = r.symbols[j];
        const prevY = s.y;
        s.y =
          ((r.position + j) % r.symbols.length) * this.SYMBOL_SIZE -
          this.SYMBOL_SIZE;
        if (s.y < 0 && prevY > this.SYMBOL_SIZE) {
          // Swap texture
          s.texture =
            this.slotTextures[
            Math.floor(Math.random() * this.slotTextures.length)
            ];
          s.scale.set(
            Math.min(
              this.SYMBOL_SIZE / s.texture.width,
              this.SYMBOL_SIZE / s.texture.height
            )
          );
          s.x = Math.round((this.SYMBOL_SIZE - s.width) / 2);
        }
      }
    }

    // Update tweens
    const now = Date.now();
    const remove: Tween[] = [];

    for (const tween of this.tweening) {
      const phase = Math.min(1, (now - tween.start) / tween.time);
      tween.object[tween.property] = this.lerp(
        tween.propertyBeginValue,
        tween.target,
        tween.easing(phase)
      );
      if (tween.change) tween.change(tween);
      if (phase === 1) {
        tween.object[tween.property] = tween.target;
        if (tween.complete) tween.complete(tween);
        remove.push(tween);
      }
    }

    // Remove completed tweens
    for (const tween of remove) {
      this.tweening.splice(this.tweening.indexOf(tween), 1);
    }
  }

  private tweenTo(
    object: any,
    property: string,
    target: number,
    time: number,
    easing: (t: number) => number,
    change?: (tween: Tween) => void,
    complete?: (tween: Tween) => void
  ) {
    const tween: Tween = {
      object,
      property,
      propertyBeginValue: object[property],
      target,
      easing,
      time,
      change,
      complete,
      start: Date.now(),
    };

    this.tweening.push(tween);
    return tween;
  }

  private lerp(a1: number, a2: number, t: number) {
    return a1 * (1 - t) + a2 * t;
  }

  private backout(amount: number) {
    return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
  }
}

export default SlotMachine

