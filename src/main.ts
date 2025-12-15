import * as pc from 'playcanvas';
import { GameManager } from './systems/GameManager';

// Create the application and start the update loop
const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
const app = new pc.Application(canvas, {
    mouse: new pc.Mouse(document.body),
    touch: new pc.TouchDevice(document.body),
    elementInput: new pc.ElementInput(canvas),
});

app.start();

// Fill the available space at full resolution
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);

// Ensure canvas is resized when window changes size
window.addEventListener('resize', () => app.resizeCanvas());

// Initialize Game Manager
new GameManager(app);

console.log("Game Started with Manager");
