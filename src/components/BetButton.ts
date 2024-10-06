import {
  Container,
  Graphics,
  Text,
  TextStyle,
  FederatedPointerEvent,
  Sprite,
  Texture,
  Rectangle,
} from 'pixi.js';

export interface BetButtonOptions {
  betAmounts: number[];
  width?: number;
  height?: number;
  listWidth?: number;
  listHeight?: number;
}

export class BetButton extends Container {
  private betAmounts: number[];
  private currentBetIndex: number = 0;
  private betText!: Text;
  private minusButton!: Graphics;
  private plusButton!: Graphics;
  private betListContainer!: Container;
  private isListOpen: boolean = false;
  private options: BetButtonOptions;

  private drawMinusButton(graphics: Graphics, color: number) {
    const size = 20;
    graphics.clear();
    graphics.beginFill(color);
    graphics.drawRect(0, 2, size, 4);
    graphics.endFill();
    graphics.hitArea = new Rectangle(-size / 2, -size / 2, size, size);
  }

  private drawPlusButton(graphics: Graphics, color: number) {
    const size = 20;
    graphics.clear();
    graphics.beginFill(color);
    graphics.drawRect(-size / 2, -2, size, 4); // Horizontal bar
    graphics.drawRect(-2, -size / 2, 4, size); // Vertical bar
    graphics.endFill();
    graphics.hitArea = new Rectangle(0, -size / 2, size, size);
  }

  private createGradientTexture(width: number, height: number, color1: number, color2: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `#${color1.toString(16).padStart(6, '0')}`);
    gradient.addColorStop(1, `#${color2.toString(16).padStart(6, '0')}`);

    // Fill with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Create texture from canvas
    return Texture.from(canvas);
  }

  constructor(options: BetButtonOptions) {
    super();
    this.betAmounts = options.betAmounts;
    this.options = options;
    this.createComponents();
    this.updateBetDisplay();
  }

  private createComponents() {
    const width = this.options.width || 200;
    const height = this.options.height || 50;

    // Create gradient texture
    const gradientTexture = this.createGradientTexture(width, height, 0x1f2833, 0x0b0c10);

    // Create background sprite with the gradient texture
    const background = new Sprite(gradientTexture);

    // Apply rounded corners using a mask
    const mask = new Graphics();
    mask.beginFill(0xffffff);
    mask.drawRoundedRect(0, 0, width, height, 10);
    mask.endFill();

    background.mask = mask;

    // Add an outline to the mask for the border
    mask.lineStyle(2, 0x66fcf1);
    mask.drawRoundedRect(0, 0, width, height, 10);
    mask.endFill();

    // Optionally, add a glow effect
    const glow = new Graphics();
    glow.beginFill(0x66fcf1, 0.2); // Adjust alpha for subtlety
    glow.drawRoundedRect(-5, -5, width + 10, height + 10, 15);
    glow.endFill();
    this.addChild(glow);

    this.addChild(background);
    this.addChild(mask);


    // Minus Button
    this.minusButton = new Graphics();
    this.drawMinusButton(this.minusButton, 0xffffff);
    this.minusButton.interactive = true;
    this.minusButton.x = 10;
    this.minusButton.y = height / 2 - this.minusButton.height / 2;
    this.minusButton.cursor = 'pointer';
    this.minusButton.on('pointerdown', () => this.changeBet(-1));
    this.minusButton.on('pointerover', () => {
      this.drawMinusButton(this.minusButton, 0x66fcf1);
      this.minusButton.scale.set(1.1);
    });
    this.minusButton.on('pointerout', () => {
      this.drawMinusButton(this.minusButton, 0xffffff);
      this.minusButton.scale.set(1);
    });
    this.addChild(this.minusButton);

    // Plus Button
    this.plusButton = new Graphics();
    this.drawPlusButton(this.plusButton, 0xffffff);
    this.plusButton.interactive = true;
    this.plusButton.x = width - this.plusButton.width;
    this.plusButton.y = height / 2 - this.plusButton.height / 2 + 10;
    this.plusButton.cursor = 'pointer';
    this.plusButton.on('pointerdown', () => this.changeBet(1));
    this.plusButton.on('pointerover', () => {
      this.drawPlusButton(this.plusButton, 0x66fcf1);
      this.plusButton.scale.set(1.1);
    });
    this.plusButton.on('pointerout', () => {
      this.drawPlusButton(this.plusButton, 0xffffff);
      this.plusButton.scale.set(1);
    });
    this.addChild(this.plusButton);

    // TextStyle for bet amount
    const betAmountTextStyle = new TextStyle({
      fill: '#c5c6c7',
      fontSize: 24,
      fontWeight: 'bold',
    });

    // Bet Amount Text
    this.betText = new Text('', betAmountTextStyle);
    this.betText.anchor.set(0.5);
    this.betText.x = width / 2;
    this.betText.y = height / 2;
    this.betText.interactive = true;
    this.betText.buttonMode = true;
    this.betText.on('pointerdown', () => this.toggleBetList());
    this.addChild(this.betText);

    // Bet List Container
    this.betListContainer = new Container();
    this.betListContainer.visible = false;
    this.betListContainer.y = height;
    this.addChild(this.betListContainer);
  }

  private updateBetDisplay() {
    this.betText.text = `$${this.betAmounts[this.currentBetIndex]}`;
  }

  private changeBet(delta: number) {
    this.currentBetIndex = Math.min(
      Math.max(this.currentBetIndex + delta, 0),
      this.betAmounts.length - 1
    );
    this.updateBetDisplay();
  }

  private toggleBetList() {
    this.isListOpen ? this.closeBetList() : this.openBetList();
  }

  private openBetList() {
    this.isListOpen = true;
    this.populateBetList();
    this.betListContainer.visible = true;
  }

  private closeBetList() {
    this.isListOpen = false;
    this.betListContainer.visible = false;
    this.betListContainer.removeChildren();
  }

  private populateBetList() {
    const listWidth = this.options.listWidth || this.options.width || 200;
    const listHeight = this.options.listHeight || 150;
    const itemHeight = 30;

    // Background
    const background = new Graphics();
    background.beginFill(0x333333);
    background.drawRect(0, 0, listWidth, listHeight);
    background.endFill();
    this.betListContainer.addChild(background);

    // Scrollable Container
    const contentContainer = new Container();

    // Add Bet Items
    for (let i = 0; i < this.betAmounts.length; i++) {
      const betItemStyle = new TextStyle({
        fill: i === this.currentBetIndex ? 0xffcc00 : 0xffffff,
        fontSize: 18,
      });

      const betItem = new Text(`$${this.betAmounts[i].toString()}`, betItemStyle);
      betItem.y = i * itemHeight;
      betItem.x = 10;
      betItem.interactive = true;
      betItem.cursor = 'pointer';
      betItem.buttonMode = true;
      betItem.on('pointerdown', () => this.selectBet(i));
      contentContainer.addChild(betItem);
    }

    // Mask for scrolling
    const mask = new Graphics();
    mask.beginFill(0xffffff);
    mask.drawRect(0, 0, listWidth, listHeight);
    mask.endFill();

    // Add contentContainer and mask to betListContainer before setting the mask
    this.betListContainer.addChild(contentContainer);
    this.betListContainer.addChild(mask);

    // Assign the mask after both are added to the display list
    this.betListContainer.mask = mask;

    // Enable scrolling if necessary
    if (contentContainer.height > listHeight) {
      contentContainer.interactive = true;
      contentContainer.on('pointerdown', this.onDragStart, this)
        .on('pointerup', this.onDragEnd, this)
        .on('pointerupoutside', this.onDragEnd, this)
        .on('pointermove', this.onDragMove, this);
    }
  }

  private selectBet(index: number) {
    this.currentBetIndex = index;
    this.updateBetDisplay();
    this.closeBetList();
  }

  // Scroll Handling
  private dragging = false;
  private dragStartY = 0;
  private contentStartY = 0;

  private onDragStart(event: FederatedPointerEvent) {
    this.dragging = true;
    this.dragStartY = event.global.y;
    this.contentStartY = event.currentTarget.y;
    event.stopPropagation();
  }

  private onDragEnd(event: FederatedPointerEvent) {
    this.dragging = false;
    event.stopPropagation();
  }

  private onDragMove(event: FederatedPointerEvent) {
    if (this.dragging) {
      const newPosition = event.global.y;
      const deltaY = newPosition - this.dragStartY;
      const contentContainer = event.currentTarget as Container;
      contentContainer.y = this.contentStartY + deltaY;
      event.stopPropagation();
    }
  }
}
