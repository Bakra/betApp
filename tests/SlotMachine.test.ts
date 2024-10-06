// SlotMachine.test.ts
import { Application } from 'pixi.js';
import SlotMachine from '../src/components/SlotMachine'; // Adjust according to your file structure

jest.mock('pixi.js'); // Mock the pixi.js module

describe('SlotMachine', () => {
  let slotMachine: SlotMachine;

  beforeEach(() => {
    // Clear mock data before each test
    jest.clearAllMocks();
    const app = new Application(); // Create a new instance of Application
    // Create a new instance of SlotMachine
    slotMachine = new SlotMachine(app);
  });

  test('should create reels with symbols', () => {
    expect(slotMachine['reels'].length).toBe(5); // Expect 5 reels
    slotMachine['reels'].forEach((reel) => {
      expect(reel.symbols.length).toBe(4); // Each reel should have 4 symbols
    });
  });

  test('should handle reel completion correctly', () => {
    slotMachine['reelsComplete'](); // Manually trigger reel completion
    expect(slotMachine['running']).toBe(false); // After reels are done, running should be false
  });

  test('should tween reels correctly', () => {
    // Simulate tweening reels
    const reel = slotMachine['reels'][0];
    slotMachine['tweenTo'](reel, 'position', 10, 1000, (t) => t);

    expect(slotMachine['tweening'].length).toBe(1); // Tween should be added
  });

  test('should update reel blur based on reel position', () => {
    // Simulate an update tick
    const reel = slotMachine['reels'][0];
    reel.position = 10;
    slotMachine['update']();

    expect(reel.blur.blurY).toBeGreaterThan(0); // The blur should be adjusted based on position
  });
});
