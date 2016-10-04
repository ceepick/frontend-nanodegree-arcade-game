var Models = {};

// GLOBAL CONSTS AND ENUMS

const SPRITE_X_OFFSET = 101;
const SPRITE_Y_INITIAL_POSITION = -20;
const SPRITE_Y_OFFSET = 83;

var CharacterType = {
    BOY: 0,
    GIRL_CAT: 1,
    GIRL_HORN: 2,
    GIRL_PINK: 3,
    GIRL_PRINCESS: 4,
    BUG: 5
};

(function () {

	// UTILS

	var getRandomInt = function(min, max) {
	    min = Math.ceil(min);
	    max = Math.floor(max);
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	var isOnCanvas = function(xCoordinate, yCoordinate) {
	    if ((xCoordinate > -SPRITE_X_OFFSET && xCoordinate < 505)
	        && (yCoordinate >= SPRITE_Y_INITIAL_POSITION && yCoordinate <= 395)) {
	        return true;
	    } else {
	        return false;
	    }
	};

	var isValidMove = function(xCoordinate, yCoordinate, keyCode) {
	    if (keyCode == "left" && xCoordinate == 0 ||
	        keyCode == "up" && yCoordinate == -20 ||
	        keyCode == "right" && xCoordinate == 404 ||
	        keyCode == "down" && yCoordinate == 395) {
	        return false;
	    }
	    return true;		
	};

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

	// CLASSES

	var GridPosition = function(row, column) {
	    this.row = row;
	    this.column = column;
	};

	var Position = function(xCoordinate, yCoordinate) {
	    this.xCoordinate = xCoordinate;
	    this.yCoordinate = yCoordinate;
	};

	Models.Character = function(characterType) {
		this.sprite = spritePath(characterType);
	};

	Models.Enemy = function(characterType) {
		Models.Character.call(this, characterType);
    
	    // TODO: Set enemy initial position, enemy speed
	    this.x = -SPRITE_X_OFFSET; // offscreen 1 block
	    this.y = SPRITE_Y_INITIAL_POSITION + (SPRITE_Y_OFFSET * getRandomInt(1, 3));
	    this.velocity = getRandomInt(1,6);
	};

	Models.Enemy.prototype.update = function(dt) {
		this.x += (SPRITE_X_OFFSET * this.velocity) * dt;
	};

	Models.Enemy.prototype.render = function() {
		if (isOnCanvas(this.x, this.y)) { // do not render if off canvas
	        console.log("x = " + this.x);
	        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);    
	    } else {
	        this.x = -SPRITE_X_OFFSET;
	        this.y = SPRITE_Y_INITIAL_POSITION + (SPRITE_Y_OFFSET * getRandomInt(1,3));
	        this.velocity = getRandomInt(1,6);
	    }
	};

	Models.Player = function(characterType) {
		Models.Character.call(this, characterType);

		this.x = SPRITE_X_OFFSET * 2;
	    this.y = SPRITE_Y_INITIAL_POSITION + (SPRITE_Y_OFFSET * 5);
	};

	Models.Player.prototype.update = function(dt) {
		// TODO?
	};

	Models.Player.prototype.handleInput = function(keyCode) {
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
	    console.log("x = " + this.x + ", y = " + this.y);
	};

})();














