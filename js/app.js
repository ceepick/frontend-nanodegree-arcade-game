// const SPRITE_X_OFFSET = 101;
// const SPRITE_Y_INITIAL_POSITION = -20;
// const SPRITE_Y_OFFSET = 83;

// functions to be moved

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isOnCanvas(xCoordinate, yCoordinate) {
    if ((xCoordinate > -SPRITE_X_OFFSET && xCoordinate < 505)
        && (yCoordinate >= SPRITE_Y_INITIAL_POSITION && yCoordinate <= 395)) {
        return true;
    } else {
        return false;
    }
}

function isValidMove(xCoordinate, yCoordinate, keyCode) {
    if (keyCode == "left" && xCoordinate == 0 ||
        keyCode == "up" && yCoordinate == -20 ||
        keyCode == "right" && xCoordinate == 404 ||
        keyCode == "down" && yCoordinate == 395) {
        return false;
    }
    return true;
}

// CLASSES

var GridPosition = function(row, column) {
    this.row = row;
    this.column = column;
};

var Position = function(xCoordinate, yCoordinate) {
    this.xCoordinate = xCoordinate;
    this.yCoordinate = yCoordinate;
};

// var CharacterType = {
//     BOY: 0,
//     GIRL_CAT: 1,
//     GIRL_HORN: 2,
//     GIRL_PINK: 3,
//     GIRL_PRINCESS: 4,
//     BUG: 5
// };

var Character = function(characterType) {
    var spritePath = function(characterType) {
        switch (characterType) {
            case CharacterType.BOY:
                return 'images/char-boy.png';
                break;
            case CharacterType.BUG:
                return 'images/enemy-bug.png';
                break;
            default:
                return undefined;
        }
    };

    this.sprite = spritePath(characterType);
}

// Enemies our player must avoid
var Enemy = function(characterType) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    // this.sprite = 'images/enemy-bug.png';
    Character.call(this, characterType);
    
    // TODO: Set enemy initial position, enemy speed
    this.x = -SPRITE_X_OFFSET; // offscreen 1 block
    this.y = SPRITE_Y_INITIAL_POSITION + (SPRITE_Y_OFFSET * getRandomInt(1, 3));
    this.velocity = getRandomInt(1,6);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // TODO: Update enemy location, handle collision
    this.x += (SPRITE_X_OFFSET * this.velocity) * dt;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    if (isOnCanvas(this.x, this.y)) { // do not render if off canvas
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);    
    } else {
        this.x = -SPRITE_X_OFFSET;
        this.y = SPRITE_Y_INITIAL_POSITION + (SPRITE_Y_OFFSET * getRandomInt(1,3));
        this.velocity = getRandomInt(1,6);
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(characterType) {
    // this.sprite = 'images/char-boy.png';
    Character.call(this, characterType);

    // TODO: Set initial position
    this.x = SPRITE_X_OFFSET * 2;
    this.y = SPRITE_Y_INITIAL_POSITION + (SPRITE_Y_OFFSET * 5);
};

Player.prototype.update = function(dt) {
    // TODO: Update player location, handle collision
    // ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.render = function() {
    if (isOnCanvas(this.x, this.y)) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

Player.prototype.handleInput = function(keyCode) {
    // TODO
    // up/down/left/right functionality
    // game board bounds checks - don't let the player leave the bounds
    // game reset functionality
    if (isValidMove(this.x, this.y, keyCode)) {
        switch (keyCode) {
            case 'left':
                this.x -= SPRITE_X_OFFSET;
                break;
            case 'up':
                this.y -= SPRITE_Y_OFFSET;
                break;
            case 'right':
                this.x += SPRITE_X_OFFSET;
                break;
            case 'down':
                this.y += SPRITE_Y_OFFSET;
                break;
            default:
                break;
        }
    }
    // console.log("x = " + this.x + ", y = " + this.y);
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var numEnemies = 4;
var allEnemies = [];
for (i = 0; i < numEnemies; ++i) {
    allEnemies.push(new Enemy(CharacterType.BUG));
}
var player = new Player(CharacterType.BOY);


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
