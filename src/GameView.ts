import { get, writable, derived } from 'svelte/store';

import type GameModel from './GameModel.js';
import GameLogger from './GameLogger';
const { debugMsg, errorMsg } = GameLogger;


const createFrameStore = () => {
	const { subscribe, set, update } = writable(0);
	return {
		subscribe,
		increment: () => update((n) => n + 1),
		reset: () => set(0)
	};
}

export const menuOn = writable(false);  // set in GameModel.ts
export const state = writable(0);  // set in GameModel.ts
export const dragMode = writable(0);  // set in GameModel.ts

export const gameAreaShiftX = writable(0);  // set in Game.svelte
export const gameAreaShiftY = writable(0);  // set in Game.svelte
export const coefX = writable(1);  // set in Game.svelte
export const coefY = writable(1);  // set in Game.svelte

export const frame = createFrameStore();
export const score = writable(0);
export const mainTitle = writable("");
export const ballX = writable(0);
export const ballY = writable(0);
export const paddleLeft = writable(0);
export const bricksFrame = createFrameStore();

export const xScale = derived(coefX, $coefX => (x: number) => x * $coefX);
export const yScale = derived(coefY, $coefY => (y: number) => y * $coefY);

class GameView {
    // Model
    private m: GameModel;

    constructor(model: GameModel)
    {
        this.m = model;
        debugMsg('view: created');
    }

    kill = () => { // destructor
        debugMsg('view: destroyed');
    }

    update = () => {
        if (this.m.ballX != get(ballX)) {
            ballX.set(this.m.ballX)
        }
        if (this.m.ballY != get(ballY)) {
            ballY.set(this.m.ballY)
        }
        if (this.m.paddleLeft != get(paddleLeft)) {
            paddleLeft.set(this.m.paddleLeft)
        }
        if (this.m.score != get(score)) {
            score.set(this.m.score)
        }
        if (this.m.statusTitle != get(mainTitle)) {
            mainTitle.set(this.m.statusTitle)
        }
        if (this.m.toUpdateBricks) {
            bricksFrame.increment()
        }
        frame.increment();
    }

}

export default GameView;