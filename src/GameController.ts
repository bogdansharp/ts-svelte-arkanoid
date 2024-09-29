import { get } from 'svelte/store';

import { state, menuOn, dragMode, gameAreaShiftX, coefX } from './GameView';
import type GameModel from './GameModel.js';
import type GameSound from './GameSound.js';
import type GameView from './GameView';
import GameLogger from './GameLogger';
const { debugMsg, errorMsg } = GameLogger;


class GameController {
    // Model, Sound
    private m: GameModel;
    private s: GameSound;
    private v: GameView;

    // Settings
    LEVEL_START_DELAY = 2000;
    GAME_START_DELAY = 1000;
    toPlaySounds = false;
    toPlayMusic = false;
    active = true;
    perfTime: number;
    timer: number;
    gameAreaShift: number;
    waitTimer: number;

    // Menu btn click (close / open)
    showControls = (e) => {
        menuOn.set(! get(menuOn));
        if (get(menuOn)) { // pause
            if (this.timer) {
                window.cancelAnimationFrame(this.timer); 
            }
        } else { // resume
            this.perfTime = performance.now();
            this.timer = requestAnimationFrame(this.step);
        }
    }

    // Start new level
    startNewGame = (level) => {
        debugMsg(`control: Start level ${level}`);
        if (this.m.state == 4) {
            debugMsg(`control: Warning! Game is already waiting to start`);
            return;
        }
        if (level === null) {
            this.m.score = 0;
            state.set(0); // INIT
            if (this.waitTimer) {
                clearTimeout(this.waitTimer);
            }
            this.waitTimer = setTimeout(() => { 
                this.startNewGame(0);
            }, this.GAME_START_DELAY);
            return;
        }
        try {
            state.set(4); // WAIT
            if (this.m.levels.length > 0) { // Campain
                this.m.loadLevel(level);
            } else { // Else - Free Bounce
                this.m.newGame();
            }
            if (this.waitTimer) {
                clearTimeout(this.waitTimer);
            }
            this.waitTimer = setTimeout(() => { 
                state.set(1); // ACTIVE 
                this.perfTime = performance.now();
                this.timer = requestAnimationFrame(this.step);
            }, this.LEVEL_START_DELAY);
        } catch (e) {
            errorMsg(e);
            state.set(0); // INIT
        }
    }

    // game timeslot step 
    step = () => {
        var newTime = performance.now();
        this.m.timeStep(newTime - this.perfTime);
        this.s.processSoundEvents(this.m.sq, this.m.time);
            // this.processBricks();
        // update state variable
        if (this.m.state != get(state)) {
            state.set(this.m.state);
        }
        if (this.m.state == 6) {  // GAME OVER
            return;
        } else if (this.m.state == 7) {  // LEVEL COMPLETE
            if (this.m.level + 1 < this.m.levels.length) {
                this.startNewGame(this.m.level + 1);
            }
            return;
        }
        this.v.update();
        this.perfTime = newTime;
        this.timer = requestAnimationFrame(this.step);
    }

    // release ball if ballOnPaddle
    releaseBallIfHolding = () => {
        if (this.m.state == 1 && this.m.ballOnPaddle && ! get(menuOn)) {
            this.m.releaseBall(); 
        }
    }

    // Key press
    keyListener = (e) => {
        var key = e.keyCode;
        var delta = Math.round(performance.now() - this.perfTime);
        debugMsg(`control: ${e.key} pressed`);
        if (key == 37 || key == 65) {
            this.m.movePaddleLeft(delta);
        } else if (key == 39 || key == 68) {
            this.m.movePaddleRight(delta);
        } else if (e.key === "Escape") {
            this.showControls(null);
        } else if (e.key == " " || e.code === "Space" || e.keyCode === 32) {
            this.releaseBallIfHolding();
        }
    }
    
    // mouse, touch
    isDrag = false;

    gameAreaClick = (e) => {
        this.releaseBallIfHolding();
    }
    mouseDown = (e) => {
        this.isDrag = true;
        dragMode.set(1);  // Change cursor to pointer 
    }
    mouseUp = (e) => {
        this.isDrag = false;
        dragMode.set(0);  // Change cursor to normal
    }
    mouseMove = (e) => {
        if (this.isDrag) {
            e.preventDefault();
            var delta = Math.round(performance.now() - this.perfTime);
            if (e && ('clientX' in e || 'targetTouches' in e )) {
                var posX = e.clientX || e.targetTouches[0].pageX;
                this.m.movePaddlePos(delta, (posX - get(gameAreaShiftX)) / get(coefX));
                    //this.m.movePaddlePos(delta, (posX - this.gameAreaShift) / this.v.coef);
                    //debugMsg(`control: mouse move posx=${posX} coef=${this.v.coef} shift=${this.gameAreaShift}`);
            }
        }
    }

    newGameClick = (e) => {
        if (this.timer) {
            window.cancelAnimationFrame(this.timer); 
        }
        menuOn.set(false);
        this.startNewGame(null);
    }

    nextLevelClick = (e) => {
        if (this.timer) {
            window.cancelAnimationFrame(this.timer); 
        }
        menuOn.set(false);
        this.startNewGame((this.m.level + 1) % this.m.levels.length);
    }

    constructor(model: GameModel, sound: GameSound, view: GameView)
    {
        // ! GameController supposed to be created after m.loadGameData()
        this.m = model;
        this.s = sound;
        this.v = view;

        // New Game
        this.startNewGame(null);
        this.gameAreaShift = 0;
        debugMsg('control: created');
    }

    kill = () => { // destructor
        if (this.timer) {
            window.cancelAnimationFrame(this.timer); }
        if (this.waitTimer) {
            clearTimeout(this.waitTimer);
        }
        debugMsg('control: destroyed');
    }

}

export default GameController;