// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 960;
var GAME_HEIGHT = 540;

var ENEMY_WIDTH = 77;
var ENEMY_HEIGHT = 77;
var MAX_ENEMIES = 3;

var PLAYER_WIDTH = 74;
var PLAYER_HEIGHT = 64;

var LIFE_HEIGHT = 45;
var LIFE_WIDTH = 67;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var UP_ARROW_CODE = 38;
var DOWN_ARROW_CODE = 40;
var SPACE = 32;
var ENTER = 13;
// These two constants allow us to DRY
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';
var MOVE_UP = 'up';
var MOVE_DOWN = 'down';

var MAX_LIVES = 3;
var PLAYER_LIVES = 3;
//Music variable
var myMusic;

// Preload game images
var images = {};
['sanic.png', 'grey-background.png', 'wae.png', 'rings.gif'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});


class Entity {
    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}
class Lives extends Entity {
    constructor(xPos) {
        super();
        this.x = xPos + GAME_WIDTH - 200;
        this.y = 15;
        this.sprite = images['rings.gif'];
    }

}
// This section is where you will be doing most of your coding
class Enemy extends Entity {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['sanic.png'];

        // Each enemy should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }
}

class Player extends Entity {
    constructor() {
        super();
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images['wae.png'];
    }

    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        } else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        }
        else if (direction === MOVE_UP && this.y > PLAYER_HEIGHT) {
            this.y = this.y - PLAYER_HEIGHT;
        } else if (direction === MOVE_DOWN && this.y < GAME_HEIGHT - PLAYER_HEIGHT - 10) {
            this.y = this.y + PLAYER_HEIGHT;
        }
    }
}



/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();

        // Setup enemies, making sure there are always three
        this.setupEnemies();

        //Setup lives
        this.setupLives();
        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }
    setupLives() {
        if (!this.lives) {
            this.lives = [];
        }
        for (var i = 0; i < PLAYER_LIVES; i++) {
            this.lives[i] = new Lives(i * LIFE_WIDTH);
        }
    }
    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH; // makes amount of rows based on game width and the width of the enemy

        var enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }

        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
    }

    // This method kicks off the game
    start() {
        this.score = 0;
        this.lastFrame = Date.now();

        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            } else if (e.keyCode === DOWN_ARROW_CODE) {
                this.player.move(MOVE_DOWN);
            } else if (e.keyCode === UP_ARROW_CODE) {
                this.player.move(MOVE_UP);
            }
        });

        this.gameLoop();

        myMusic = new sound("da_wae.mp3");
        myMusic.play();

    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        // Check how long it's been since last frame

        console.log("hey")
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));

        // Draw everything!
        this.ctx.drawImage(images['grey-background.png'], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.player.render(this.ctx); // draw the player
        this.ctx.font = 'bold 30px Comic Sans MS';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText("LIVES: ",650,45);
        this.lives.forEach(life => life.render(this.ctx));

        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        this.setupEnemies();

        // Check if player is dead
        console.log("Is player dead?: " + this.isPlayerDead());

        if (!this.isDead && this.isPlayerDead() && PLAYER_LIVES > 0) {
            // If they are dead, then it's game over!
            myMusic.stop("da_wae.mp3");
            var gameOverSong = new sound("ded.mp3");
            gameOverSong.play("ded.mp3");
            this.isDead = true;
            this.removeLives();
            this.ctx.font = 'bold 30px Comic Sans MS';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText("Your Score: " + this.score, 300, 210);
            this.ctx.fillStyle = 'red';
            this.ctx.fillText("YOU DID NOT KNOW DA WAE", 300, 250);
            this.ctx.fillText("PRESS SPACE TO START AGAIN", 300, 290);
            var isRestarted = true;
            document.addEventListener('keydown', e => {
                // console.log("hello")
                if (e.keyCode === SPACE && isRestarted === true) {
                    myMusic.play("da_wae.mp3")
                    gameOverSong.stop();
                    isRestarted = false;
                    this.isDead = false;
                    this.enemies = [];
                    this.score = 0;
                    this.player = new Player();
                    requestAnimationFrame(this.gameLoop);
                }
            });
        } else if (PLAYER_LIVES === 0) {
            this.ctx.font = 'bold 30px Comic Sans MS';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText("Your Score: " + this.score, 300, 210);
            this.ctx.fillStyle = 'red';
            this.ctx.fillText("GAME OVER!", 300, 250);
            this.ctx.fillText("PRESS ENTER TO RESTART GAME", 300, 290);
            var clickedEnter = true;
            document.addEventListener('keydown', e => {
                // console.log("hello")
                if (e.keyCode === ENTER) {
                    location.reload();
                }
            });
        }
        else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 30px Comic Sans MS';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText("Score:  " + this.score, 5, 30);

            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }

    }

    isPlayerDead() {
        var x;
        x = this.enemies.filter((enemy) => this.player.x < enemy.x + (ENEMY_WIDTH / 2) &&
            this.player.x + (PLAYER_WIDTH) > enemy.x &&
            this.player.y < enemy.y + (ENEMY_HEIGHT) &&
            (PLAYER_HEIGHT) + this.player.y > enemy.y + (ENEMY_HEIGHT / 1.5));

        return x.length > 0 ? true : false;
    }
    removeLives() {
        delete this.lives[MAX_LIVES - PLAYER_LIVES];
        PLAYER_LIVES--;
        console.log(PLAYER_LIVES);
    }
}
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}

// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();
