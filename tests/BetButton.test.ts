// src/BetButton.test.ts
import { BetButton, BetButtonOptions } from '../src/components/BetButton';
import { Container, FederatedPointerEvent } from 'pixi.js';

// Mock for canvas getContext
beforeAll(() => {
  // @ts-ignore
  HTMLCanvasElement.prototype.getContext = function (type: string) {
    if (type === '2d') {
      return {
        createLinearGradient: (x0: number, y0: number, x1: number, y1: number) => ({
          addColorStop: jest.fn(),
        }),
        fillRect: jest.fn(),
        fillStyle: '',
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
      };
    }
    return null;
  };
});

describe('BetButton', () => {
  let betButton: BetButton;
  const betAmounts = [10, 20, 50, 100, 200, 500, 1000];
  const options: BetButtonOptions = {
    betAmounts,
    width: 250,
    height: 60,
    listWidth: 250,
    listHeight: 200,
  };

  beforeEach(() => {
    // Initialize BetButton before each test
    betButton = new BetButton(options);
  });

  test('should initialize correctly', () => {
    expect(betButton).toBeInstanceOf(Container);
    expect(betButton['betAmounts']).toEqual(betAmounts);
    expect(betButton['currentBetIndex']).toBe(0);
    expect(betButton['betText'].text).toBe(`$${betAmounts[0]}`);
  });

  test('should increase bet amount when plus button is clicked', () => {
    const initialBetIndex = betButton['currentBetIndex'];
    const plusButton = betButton['plusButton'];

    // Mock the on method to ensure the click handler works
    (plusButton as any).triggerEvent('pointerdown', {} as FederatedPointerEvent);

    const newBetIndex = betButton['currentBetIndex'];
    expect(newBetIndex).toBe(initialBetIndex + 1);
    expect(betButton['betText'].text).toBe(`$${betButton['betAmounts'][newBetIndex]}`);
  });

  test('should decrease bet amount when minus button is clicked', () => {
    betButton['currentBetIndex'] = 2;
    betButton['updateBetDisplay']();
    const initialBetIndex = betButton['currentBetIndex'];
    const minusButton = betButton['minusButton'];

    (minusButton as any).triggerEvent('pointerdown', {} as FederatedPointerEvent);

    const newBetIndex = betButton['currentBetIndex'];
    expect(newBetIndex).toBe(initialBetIndex - 1);
    expect(betButton['betText'].text).toBe(`$${betButton['betAmounts'][newBetIndex]}`);
  });

  test('should not decrease bet amount below minimum', () => {
    betButton['currentBetIndex'] = 0;
    betButton['updateBetDisplay']();
    const initialBetIndex = betButton['currentBetIndex'];
    const minusButton = betButton['minusButton'];

    (minusButton as any).triggerEvent('pointerdown', {} as FederatedPointerEvent);

    const newBetIndex = betButton['currentBetIndex'];
    expect(newBetIndex).toBe(initialBetIndex);
    expect(betButton['betText'].text).toBe(`$${betButton['betAmounts'][newBetIndex]}`);
  });

  test('should not increase bet amount above maximum', () => {
    betButton['currentBetIndex'] = betButton['betAmounts'].length - 1;
    betButton['updateBetDisplay']();
    const initialBetIndex = betButton['currentBetIndex'];
    const plusButton = betButton['plusButton'];

    (plusButton as any).triggerEvent('pointerdown', {} as FederatedPointerEvent);

    const newBetIndex = betButton['currentBetIndex'];
    expect(newBetIndex).toBe(initialBetIndex);
    expect(betButton['betText'].text).toBe(`$${betButton['betAmounts'][newBetIndex]}`);
  });

  test('should toggle bet list when bet amount text is clicked', () => {
    const betText = betButton['betText'];

    // Bet list should be closed initially
    expect(betButton['isListOpen']).toBe(false);
    expect(betButton['betListContainer'].visible).toBe(false);

    // Simulate pointerdown event to open bet list
    (betText as any).triggerEvent('pointerdown', {} as FederatedPointerEvent);

    expect(betButton['isListOpen']).toBe(true);
    expect(betButton['betListContainer'].visible).toBe(true);

    // Simulate pointerdown event to close bet list
    (betText as any).triggerEvent('pointerdown', {} as FederatedPointerEvent);

    expect(betButton['isListOpen']).toBe(false);
    expect(betButton['betListContainer'].visible).toBe(false);
  });

  test('should select a bet amount from the bet list', () => {
    const betText = betButton['betText'];

    // Open bet list
    (betText as any).triggerEvent('pointerdown', {} as FederatedPointerEvent);

    // Simulate selecting the third bet amount
    const selectedBetIndex = 2;
    betButton['selectBet'](selectedBetIndex);

    expect(betButton['currentBetIndex']).toBe(selectedBetIndex);
    expect(betButton['betText'].text).toBe(`$${betButton['betAmounts'][selectedBetIndex]}`);
    expect(betButton['isListOpen']).toBe(false);
    expect(betButton['betListContainer'].visible).toBe(false);
  });
});
