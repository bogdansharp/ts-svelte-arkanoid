import GameLogger from './GameLogger';
const { debugMsg, errorMsg } = GameLogger;


class GameModel {
    // const MIN_WIDTH = 128;
    // const MIN_HEIGHT = 64;

    // states: 0 - init, 1 - active, 2 - pause, 3 - missed, 4 - wait to start, 6 - game over, 7 - level complete
    state = 0; // INITIALIZATION

    title = 'Arkanoid';
    statusTitle = 'ts-svelte-arkanoid';
    err = 0; // OK
    errMsg = ''; // OK
    score = 0;
    scoreInterval = 1000; // 1 score for speed 0.1 each 1s
    SCORE_BRICK_DESTROY = 100;
    speedInterval = 20 * 1000; // speed up each 20s

    // Game Area parameters
    BRICK_WIDTH = 40;
    BRICK_HEIGHT = 20;
    width = this.BRICK_WIDTH * 16 + 1; // fixed
    height = 700; // fixed 
    footerHeight = 48;
    mainHeight = this.height - this.footerHeight; 
    
    // ball
    ballRadius = 8;
    ballDiam = this.ballRadius * 2;
    // paddle
    paddleHeight = 16;
    paddleHalf = 32;
    paddleWidth = this.paddleHalf * 2;
    paddleTop = this.mainHeight;
    paddleX = this.width / 2;
    paddleLeft = this.paddleX - this.paddleHalf;
    paddleRight = this.paddleX + this.paddleHalf;
    paddleAngle1 = 0.2;
    paddleAngle2 = 0.4;
    paddleAngle3 = 0.6;
    // bricks
    // format: [x1, x2, y1, y2, id, type, color]; starts with game area
    bricks = [[0, this.width, 0, this.height, 0, 1, 0xdcdcdc]]; 
    // levels
    levels = [];
    level = -1;

    // Current game variables
    time: number;
    speed: number;
    speedExtra: number;
    angle: number;
    ballOnPaddle: boolean;
    // ballX: number;
    // ballY: number;
    ballX = this.width / 2;
    ballY = this.mainHeight - this.ballRadius;
    ballTop: number;
    ballBottom: number;
    ballLeft: number;
    ballRight: number;
    // game events queue
    eq: GameEvent[];
    // sound effects queue
    sq: GameEvent[];
    // flag to redraw bricks array
    toUpdateBricks = true;

    newGame() {
        this.time = 0;
        this.ballOnPaddle = true;
        // paddle
        this.paddleX = this.width / 2;
        this.paddleLeft = this.paddleX - this.paddleHalf;
        this.paddleRight = this.paddleX + this.paddleHalf;
        // ball
        this.speed = 0.15;
        this.speedExtra = 0.0;
        this.angle = Math.PI / 3.0;
        this.ballX = this.width / 2;
        this.ballY = this.mainHeight - this.ballRadius;
        this.moveBall(0);
        this.eq = [];
        this.sq = [];
            // start game <- action moved to controller
            // this.state = 1; // ACTIVE 
    }

    async loadGameData() {
        return new Promise( async (resolve) => {
            if (this.err) {
                resolve(null);
                return;
            }
            try {
                const response = await fetch('game.json');
                const data = await response.json();
                if (data && ('title' in data))
                    this.title = data.title;
                if (data && ('levels' in data))
                    this.levels = data.levels;
            } catch (error) {
                this.err = 2; // ERROR
                this.errMsg = 'Error loading game data:' + error;
            } finally {
                resolve(null);
            }
        });
    }

    loadLevel(level = null) {
        debugMsg(`model: loadLevel ${level}`);
        this.bricks.splice(1, this.bricks.length - 1);
        if (level === null) {
            level = 0;
            //this.score = 0;  // Logic moved to GameController
        }
        if (level >= this.levels.length) {
            throw `Can not load level ${level}`;
        }
        this.level = level;
        this.statusTitle = this.levels[level].title;
        let id = 1;
        for (let i = 0; i < this.levels[level].bricks.length; ++i) {
            let [ypos, xpos, type, color, count] = this.levels[level].bricks[i];
            while (count-- > 0) {
                let left = xpos * this.BRICK_WIDTH;
                let right = left + this.BRICK_WIDTH;
                if (right > this.width) break;
                let top = this.BRICK_HEIGHT * ypos;
                let bottom = top + this.BRICK_HEIGHT;
                this.bricks.push([left, right, top, bottom, id++, type, color]);
                ++xpos;
            }
        }
        this.newGame();
    }

    movePaddleLeft(delta) {
        this.eq.push(new GameEvent(1, this.time + delta));
    }

    movePaddleRight(delta) {
        this.eq.push(new GameEvent(2, this.time + delta));
    }

    movePaddlePos(delta, pos) {
        this.eq.push(new GameEvent(9, this.time + delta, pos));
    }

    releaseBall(delta = 0) {
        if (this.ballOnPaddle)
            this.eq.push(new GameEvent(10, this.time + delta));
    }

    queueBounce() {
        this.speed += this.speedExtra;
        this.speedExtra = 0;
        if (this.angle > Math.PI) 
            this.angle -= Math.PI + Math.PI;
        var sina = Math.sin(this.angle);
        var cosa = Math.cos(this.angle);
        var minTime = Infinity;
        var minIdx = -1;
        var minType = -1;
        var hspeed = this.speed * cosa;
        var vspeed = this.speed * sina;
        // special case : paddle line collision
        if (this.state != 3 && sina > 0 && this.ballBottom < this.mainHeight) {
            minType = 5;
            minTime = (this.mainHeight - this.ballBottom) / vspeed; // minTime > 0
        }
        // bricks collisions
        for (let i = 0; i < this.bricks.length; ++i) {
            let [x1, x2, y1, y2, id, type, color] = this.bricks[i];
            let vdist = sina > 0 ?
                y1 - this.ballBottom : // ball moves down
                this.ballTop - y2; // ball moves up
            let hdist = cosa > 0 ?
                x1 - this.ballRight : // ball moves right
                this.ballLeft - x2; // ball moves left
            if (type == 1) { // special case: game area
                vdist = sina > 0 ? y2 - this.ballBottom : this.ballTop - y1;
                hdist = cosa > 0 ? x2 - this.ballRight : this.ballLeft - x1;
            }
            if (vdist > 0) {
                var vtime = vdist / Math.abs(vspeed);
                var nextX = this.ballX + hspeed * vtime;
                if (nextX >= x1 && nextX <= x2 && vtime < minTime) {
                    minTime = vtime;
                    minType = 3; // horizontal bounce
                    minIdx = i;
                }
            }
            if (hdist > 0) {
                var htime = hdist / Math.abs(hspeed);
                var nextY = this.ballY + vspeed * htime;
                if (nextY >= y1 && nextY <= y2 && htime < minTime) {
                    minTime = htime;
                    minType = 4; // vertical bounce
                    minIdx = i;
                }
            }
            // special case: corner bounce
            if (vdist > 0 && hdist > 0) {
                let dy = sina > 0 ? y1 - nextY : nextY - y2;
                let dx = cosa > 0 ? x1 - nextX : nextX - x2;
                if (dx > 0 && dy > 0) {
                    if (dx < dy) {
                        if (vtime < minTime) {
                            minTime = vtime;
                            minType = 3; // horizontal bounce
                            minIdx = i;
                        }
                    } else {
                        if (htime < minTime) {
                            minTime = htime;
                            minType = 4; // vertical bounce
                            minIdx = i;
                        }
                    }
                }
            }
        }
        // push event
        if (minType != -1) {
            debugMsg(`model: bounce queued x=${this.ballX.toFixed(2)} y=${this.ballY.toFixed(2)} dtime=${minTime.toFixed(2)} id=${minIdx >= 0 ? this.bricks[minIdx][4] : minIdx} angle=${this.angle.toFixed(4)}`);
            this.eq.push(new GameEvent(minType, this.time + minTime, minIdx));
            // var eventObject = new GameEvent(minType, this.time + minTime, minIdx);
            if (minType != 5 && minIdx) {
                const brickType = this.bricks[minIdx][5];
                this.sq.push(new GameEvent(minType, this.time + minTime, brickType));
            }
        }
    }

    processEvent(ev) {
        switch (ev.type) {
            case 10: // release ball
                this.eq.push(new GameEvent(3, this.time)); // horizontal bounce
                this.eq.push(new GameEvent(7, this.time + this.scoreInterval)); // score for time
                this.eq.push(new GameEvent(8, this.time + this.speedInterval));  // speed up 
                this.ballOnPaddle = false;
                break;
            case 1: // paddle left
                this.paddleLeft -= 32;
                if (this.paddleLeft < 0) {
                    this.paddleLeft = 0; }
                this.paddleX = this.paddleLeft + this.paddleHalf;
                this.paddleRight = this.paddleLeft + this.paddleWidth;
                if (this.ballOnPaddle) {
                    this.ballX = this.paddleX;
                    this.moveBall(0);
                }
                break;
            case 2: // paddle right
                this.paddleRight += 32;
                if (this.paddleRight > this.width) {
                    this.paddleRight = this.width; }
                this.paddleLeft = this.paddleRight - this.paddleWidth;
                this.paddleX = this.paddleLeft + this.paddleHalf;
                if (this.ballOnPaddle) {
                    this.ballX = this.paddleX;
                    this.moveBall(0);
                }
                break;
            case 9: // paddle move to pos (mouse or touch)
                var newX = ev.param;
                if (newX + this.paddleHalf > this.width) {
                    newX = this.width - this.paddleHalf; }
                if (newX - this.paddleHalf < 0) {
                    newX = this.paddleHalf; }
                // if (newX > this.paddleX) {
                //     if (newX - this.paddleX > 10)
                //         newX = this.paddleX + 10;
                // } else {
                //     if (this.paddleX - newX > 10)
                //         newX = this.paddleX - 10;
                // }
                this.paddleX = newX;
                this.paddleLeft = newX - this.paddleHalf;
                this.paddleRight = newX + this.paddleHalf;
                if (this.ballOnPaddle) {
                    this.ballX = this.paddleX;
                    this.moveBall(0);
                }
                break;
            case 3: // horizontal bounce
            case 5: // horizontal paddle bounce
            case 4: // vertical bounce
                this.moveBall(ev.time - this.time);
                if (ev.type == 3) { // horizontal bounce
                    this.angle = - this.angle;
                } else if (ev.type == 5) { // horizontal paddle bounce
                    if (this.ballX <= this.paddleRight && this.ballX >= this.paddleLeft) {
                        let paddleEight = this.paddleHalf * 0.25;
                        if (this.ballX <= this.paddleLeft + paddleEight) {
                            this.angle = - this.angle - this.paddleAngle3;
                        } else if (this.ballX <= this.paddleLeft + paddleEight + paddleEight) {
                            this.angle = - this.angle - this.paddleAngle2;
                        } else if (this.ballX <= this.paddleLeft + paddleEight + paddleEight + paddleEight) {
                            this.angle = - this.angle - this.paddleAngle1;
                        } else if (this.ballX >= this.paddleRight - paddleEight) {
                            this.angle = - this.angle + this.paddleAngle3;
                        } else if (this.ballX >= this.paddleRight - paddleEight - paddleEight) {
                            this.angle = - this.angle + this.paddleAngle2;
                        } else if (this.ballX >= this.paddleRight - paddleEight - paddleEight - paddleEight) {
                            this.angle = - this.angle + this.paddleAngle1;
                        } else {
                            this.angle = - this.angle;
                        }
                        this.sq.push(new GameEvent(5, this.time)); // paddle sound
                    } else {
                        // paddle misses the ball
                        var sina = Math.sin(this.angle);
                        var vspeed = (this.speed + this.speedExtra) * sina;
                        var gameEndTime = Math.round(this.time + this.footerHeight / vspeed);
                        debugMsg(`model: ball missed @${this.time} endTime=${gameEndTime}`);
                        var eventObject = new GameEvent(6, gameEndTime);
                        this.eq.push(eventObject);
                        this.sq.push(eventObject); // gameOver sound
                        this.state = 3; // BALL MISSED
                    }
                } else if (ev.type == 4) { // vertical bounce 
                    this.angle = Math.PI - this.angle;
                }
                let brickIdx = ev.param;
                if (brickIdx > 0) {  // brickIdx == 0 - game area
                    let type = this.bricks[brickIdx][5];
                    this.toUpdateBricks = true;  // redraw
                    if (type == 3) {  // silver -> change color
                        this.bricks[brickIdx][5] = 2; // type
                        this.bricks[brickIdx][6] = 333333; // color
                    } else if (type == 2) {  // regular
                        this.bricks.splice(brickIdx, 1);
                        this.score += this.SCORE_BRICK_DESTROY;
                            // debugMsg(`model: Score ${this.score}`);
                        this.checkForVictory();
                    }
                    // type == 4 gold - persistent
                }
                this.queueBounce();
                break;
            case 6: // game over
                this.state = 6; // GAME LOST
                this.statusTitle = 'Game Over!';
                break;
            case 7: // score for time
                this.moveBall(ev.time - this.time);
                if (! this.ballOnPaddle) {
                    this.score += Math.round(this.speed * 10);
                        // debugMsg(`model: Score ${this.score}`);
                }
                this.eq.push(new GameEvent(7, this.time + this.scoreInterval)); 
                break;
            case 8: // speed up
                this.moveBall(ev.time - this.time);
                this.speedExtra += 0.025;
                this.eq.push(new GameEvent(8, this.time + this.speedInterval)); 
                break;
        }
    }

    checkForVictory() {
        for (let i = 0; i < this.bricks.length; ++i) 
            if (this.bricks[i][5] == 2 || this.bricks[i][5] == 3) // type
                return;
        this.statusTitle = 'Victory!';
        this.state = 7; // COMPLETE
        this.sq.push(new GameEvent(7, this.time)); // Victory sound
    }

    moveBall(delta) {
        if (! this.ballOnPaddle) {
            this.ballX += delta * this.speed * Math.cos(this.angle);
            this.ballY += delta * this.speed * Math.sin(this.angle);
        }
        this.ballTop = this.ballY - this.ballRadius;
        this.ballBottom = this.ballY + this.ballRadius;
        this.ballLeft = this.ballX - this.ballRadius;
        this.ballRight = this.ballX + this.ballRadius;
        this.time += delta;
    }

    timeStep(increment) {
        var endTime = this.time + increment;
        this.toUpdateBricks = false;
        while (true) {
            var minIdx = -1; 
            var minTime = Infinity;
            for (let i = 0; i < this.eq.length; ++i) {
                if (this.eq[i].time < minTime) {
                    minTime = this.eq[i].time;
                    minIdx = i;
                }
            }
            if (minTime <= endTime) {
                const ev = this.eq[minIdx];
                this.eq.splice(minIdx, 1);
                this.processEvent(ev);
            } else {
                break;
            }
        }
        this.moveBall(endTime - this.time);
    }
}

class GameEvent {
    constructor( type: number, time: number, param: number = 0) {
        this.type = type;
        this.time = time;
        this.param = param;
    }
    type: number;
    time: number;
    param: number;
}

export { GameEvent };
export default GameModel;