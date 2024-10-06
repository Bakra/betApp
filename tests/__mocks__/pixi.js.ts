// src/__mocks__/pixi.js
export class Application {
  constructor(options: any) {}
  stage = new Container();
  ticker = {
    add: jest.fn(),
  };
  screen = {
    width: 800,
    height: 600,
  };
  view = document.createElement('canvas');
}

export class Container {
  children: any[] = [];
  addChild(child: any) {
    this.children.push(child);
  }
  removeChild(child: any) {
    this.children = this.children.filter((c) => c !== child);
  }
  removeChildren() {
    this.children = [];
  }
}

export class Graphics extends Container {
  interactive = true;
  buttonMode = true;
  clear() {}
  beginFill(color: number, alpha?: number) {}
  endFill() {}
  drawRect(x: number, y: number, width: number, height: number) {}
  drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {}
  lineStyle(width: number, color: number) {}

  eventHandlers: Record<string, (...args: any[]) => void> = {};

  constructor() {
    super();
  }

  on = jest.fn((event: string, handler: (...args: any[]) => void) => {
    this.eventHandlers[event] = handler;
  });

  triggerEvent(event: string, ...args: any[]) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event](...args);
    }
  }
}

export class Text extends Container {
  style: any;
  text: string;
  anchor: { set: jest.Mock }; // Mocking anchor with a `set` function
  eventHandlers: Record<string, (...args: any[]) => void>;

  constructor(text: string, style: any) {
    super();
    this.text = text;
    this.style = style;
    
    this.anchor = {
      set: jest.fn(), // Mock the `set` method to avoid errors
    };
    this.eventHandlers = {};
  }

  on = jest.fn((event: string, handler: (...args: any[]) => void) => {
    this.eventHandlers[event] = handler;
  });

  triggerEvent(event: string, ...args: any[]) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event](...args);
    }
  }
}

export class TextStyle {
  constructor(style: any) {}
}

export class Sprite extends Container {
  texture: any;
  width = 100;
  height = 100;
  scale = {
    set: jest.fn(), // Mocking scale.set function
  };

  constructor(texture: any) {
    super();
    this.texture = texture;
  }
}

export class Texture {
  static from(source: any) {
    return new Texture();
  }
}

export class Rectangle {
  constructor(x: number, y: number, width: number, height: number) {}
}

export class FederatedPointerEvent {
  stopPropagation() {}
}

export class Assets {
  static load = jest.fn(() => Promise.resolve({}));
}

export class InteractionEvent {}

export const utils = {
  EventEmitter: class {},
};

export class BlurFilter {
  blurX = 0;
  blurY = 0;
}

export const Loader = {
  shared: {
    add() {
      return this;
    },
    load(callback: () => void) {
      callback();
    },
    resources: {},
  },
};
