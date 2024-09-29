import type { GameEvent } from './GameModel.js';
import GameLogger from './GameLogger';
const { debugMsg, errorMsg } = GameLogger;


class GameSound {
    readonly PLAN_SOUNDS_TIME = 100;

    // Initialize Audio
    soundKeys = ['bounce', 'bounce2', 'gold', 'paddle', 'gameOver', 'win', 'music'];
        // sounds = {};
    sounds: Map<string, HTMLAudioElement> = new Map();
    soundInitialized = false;
    toPlaySounds = false;
    toPlayMusic = false;

    initSound = () => {
        for (const key of this.soundKeys) {
            let sound = new Audio(`sound/${key}.mp3`);
            sound.volume = 0;
            sound.play().then(async () => { sound.pause(); sound.volume = 1; });
            this.sounds.set(key, sound);
        }
        debugMsg('sound: created');
    }

    playSound = (sound: string) => {
        const audio = this.sounds.get(sound);
        debugMsg(`sound: play ${sound} ended=${audio && audio.ended}`);
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    }

    playMusic = (on) => {
        const audio = this.sounds.get('music');
        if (audio) {
            debugMsg(`sound: obj=${audio} on=${on}`);
            if (on) {
                audio.loop = true;
                if (audio.readyState >= 2)
                audio.play();
                else
                    audio.addEventListener('canplaythrough', this.playMusicWhenReady, false);
            } else {
                document.removeEventListener('canplaythrough', this.playMusicWhenReady, false);
                audio.pause();
            }
        }
    }

    playMusicWhenReady = (e) => {
        e.target.play();
    }
    // play sounds for current step
    processSoundEvents = (qu: GameEvent[], modelTime: number) => {
        for (let i = 0; i < qu.length; ++i) { // process sound events
            var soundEvent = qu[i];
            var delta = Math.round(soundEvent.time - modelTime);
            if (delta > this.PLAN_SOUNDS_TIME)
                continue;
            if (this.toPlaySounds) {
                let brickType = 'param' in soundEvent && soundEvent.param >= 0 ? 
                    soundEvent.param : -1;
                var sound = '';
                switch (soundEvent.type) {
                    case 3:
                    case 4: sound = brickType == 2 ? 'bounce2' : brickType == 1 ? 'bounce' : 'gold'; break;
                    case 5: sound = 'paddle'; break;
                    case 6: sound = 'gameOver'; break;
                    case 7: sound = 'win'; break;
                }
                debugMsg(`sound: plan to play ${sound} in ${delta} ms`);
                if (delta <= 0) {
                    this.playSound(sound);
                } else {
                    setTimeout(() => { this.playSound(sound); }, delta);
                }
            }
            qu.splice(i, 1);
        }
    }
    setSound = (toPlaySounds) => {
        this.toPlaySounds = toPlaySounds;
        if (this.toPlaySounds && 
            (! this.soundInitialized || this.sounds['bounce'] == null)) 
        {
            this.initSound();
            this.soundInitialized = true;
            debugMsg(`sound: initialized`);
        }
    }

    setMusic = (toPlayMusic) => {
        this.toPlayMusic = toPlayMusic;
        if (this.toPlayMusic && ! this.soundInitialized) {
            this.initSound();
            this.soundInitialized = true;
        }
        this.playMusic(this.toPlayMusic);
    }

    constructor() {}

    kill = () => { // destructor
        if (this.sounds) {
            for (const key of this.soundKeys) {
                if (key in this.sounds) {
                    delete this.sounds[key];
                }
            }
            this.sounds.clear();
        }
        debugMsg('sound: destroyed');
    }

}

export default GameSound;