// src/pixi-extensions.d.ts
import * as PIXI from 'pixi.js';

declare module 'pixi.js' {
  interface Text {
    buttonMode: boolean;
  }
}
