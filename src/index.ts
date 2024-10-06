// src/index.ts
import { Application, Renderer } from 'pixi.js';
import { BetButton } from './components/BetButton';
import SlotMachine from './components/SlotMachine';


(
  async () => {
    const app = new Application<Renderer>();

    // Initialize the application
    await app.init({ resizeTo: window,   width: 800,
      height: 600,
      backgroundColor: '#1099bb', });
    document.body.appendChild(app.canvas as HTMLCanvasElement);

    // Initialize the bet button
    const betAmounts = [10, 20, 50, 100, 200, 500, 1000];
    const betButton = new BetButton({
      betAmounts,
      width: 260,
      height: 60,
      listWidth: 250,
      listHeight: 200,
    });
    betButton.x = app.screen.width -( betButton.width + 10);
    betButton.y = app.screen.height / 6 - betButton.height / 2;
    app.stage.addChild(betButton);

    // Initialize the slot machine
    new SlotMachine(app);
  }
)();
