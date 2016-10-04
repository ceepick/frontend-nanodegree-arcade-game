// GLOBAL CONSTANTS

const SPRITE_X_OFFSET = 101;
const SPRITE_Y_INITIAL_POSITION = -20;
const SPRITE_Y_OFFSET = 83;

const PLAYER_SPRITE_COLLISION_X_OFFSET = 17;
const PLAYER_SPRITE_COLLISION_Y_OFFSET = 62;
const PLAYER_SPRITE_COLLISION_WIDTH = 67;
const PLAYER_SPRITE_COLLISION_HEIGHT = 76;

const ENEMY_BUG_SPRITE_COLLISION_X_OFFSET = 1;
const ENEMY_BUG_SPRITE_COLLISION_Y_OFFSET = 77;
const ENEMY_BUG_SPRITE_COLLISION_WIDTH = 98;
const ENEMY_BUG_SPRITE_COLLISION_HEIGHT = 66;

const LEFT_BOUNDS = 0;
const UPPER_BOUNDS = -20;
const RIGHT_BOUNDS = 404;
const LOWER_BOUNDS = 395;

/**
*	Models incapulates the logic to create, update, render, and interact with Character objects.
*/
var Models = {
	CharacterType: {
	    BOY: 0,
	    GIRL_CAT: 1,
	    GIRL_HORN: 2,
	    GIRL_PINK: 3,
	    GIRL_PRINCESS: 4,
	    BUG: 5
	}
};

(function () {

	// PRIVATE UTILS

	/**
	*	Generates random integer in min/max range inclusive.
	*	Used for variation in enemy initial position and velocity.
	*	@param min inclusive min value
	*	@param max inclusive max value
	* 	@return random integer value
	*/
	var getRandomInt = function(min, max) {
	    min = Math.ceil(min);
	    max = Math.floor(max);
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	/**
	*	Determines if sprite is currently on the canvas.
	*	Used to determine if sprite should be rendered.
	*	@param xCoordinate position on the x-axis
	*	@param yCoordinate position on the y-axis
	* 	@return true if on canvas, false if off canvas
	*/
	var isOnCanvas = function(xCoordinate, yCoordinate) {
	    if ((xCoordinate > -SPRITE_X_OFFSET && xCoordinate < ctx.canvas.width) && // horizontal bounds
			(yCoordinate >= UPPER_BOUNDS && yCoordinate <= LOWER_BOUNDS)) { // vertical bounds
	        return true;
	    } else {
	        return false;
	    }
	};

	/**
	*	Determines if user has reached the top row of the gameboard.
	*	Used to determine if user has won the basic game by reaching the top unscathed.
	*	@param yCoordinate the current y-axis coordinate of the player sprite
	*	@return true if on the top row, false if not on the top row
	*/
	var hasReachedTopRow = function(yCoordinate) {
		return (yCoordinate == UPPER_BOUNDS) ? true : false;
	};

	/**
	*	Determines if sprite should be able to move in a particular direction on the canvas.
	*	@param xCoordinate position on the x-axis
	*	@param yCoordinate position on the y-axis
	*	@param keyCode code associated with key press
	* 	@return true if valid move, false if invalid move
	*/
	var isValidMove = function(xCoordinate, yCoordinate, keyCode) {
	    if (keyCode == "left" && xCoordinate == LEFT_BOUNDS || // edge left
	        keyCode == "up" && yCoordinate == UPPER_BOUNDS || // edge top
	        keyCode == "right" && xCoordinate == RIGHT_BOUNDS || // edge right
	        keyCode == "down" && yCoordinate == LOWER_BOUNDS) { // edge bottom
	        return false;
	    }
	    return true;		
	};

	/**
	*	Provides sprite image asset path.
	*	This function is used in conjunction with resources.js for image caching.
	*	@param characterType enumeration value
	* 	@return path of image asset
	*/
	var spritePath = function(characterType) {
		var imagePath;
		// assignment/breaks chosen over straight returns for convention and future customization if needed
        switch (characterType) {
            case Models.CharacterType.BOY:
                imagePath = 'images/char-boy.png';
                break;
            case Models.CharacterType.BUG:
                imagePath = 'images/enemy-bug.png';
                break;
            case Models.CharacterType.GIRL_CAT:
            	imagePath = 'images/char-cat-girl.png';
                break;
            case Models.CharacterType.GIRL_HORN:
            	imagePath = 'images/char-horn-girl.png';
            	break;
           	case Models.CharacterType.GIRL_PINK:
           		imagePath = 'images/char-pink-girl.png';
           		break;
           	case Models.CharacterType.GIRL_PRINCESS:
           		imagePath = 'images/char-princess-girl.png';
           		break;
            default:
                imagePath = undefined;
        }
        return imagePath;
    };

	// CLASSES

	/**
	*	Defines the gameboard grid position of a character sprite.
	*	TODO: Needed for collision? Future gameplay use cases?
	*	@param row
	*	@param column
	* 	@constructor
	*/
	var GridPosition = function(row, column) {
	    this.row = row;
	    this.column = column;
	};

	/**
	*	Defines the location of a sprite on the canvas.
	*	@param xCoordinate
	*	@param yCoordinate
	* 	@constructor
	*/
	var Position = function(xCoordinate, yCoordinate) {
	    this.x = xCoordinate;
	    this.y = yCoordinate;
	};

	/**
	*	Character base class. Currently only used to provide sprite.
	*	@param CharacterType enumeration that signals proper configuration
	*	@constructor
	*/
	Models.Character = function(characterType) {
		this.sprite = spritePath(characterType);
	};

	/**
	*	Enemies our player must avoid.
	*	@param characterType enumeration value that signals proper configuration
	*	@constructor
	*/
	Models.Enemy = function(characterType) {
		Models.Character.call(this, characterType);

		this.initialConfig = {
			get position() {
				var x = -SPRITE_X_OFFSET; // offscreen 1 grid position
	    		var y = SPRITE_Y_INITIAL_POSITION + (SPRITE_Y_OFFSET * getRandomInt(1, 3));
	    		return new Position(x,y);
			}
		};
    
	    this.position = this.initialConfig.position;
	    this.velocity = getRandomInt(1,6);
	};

	/**
	*	Update the enemy's position.
	*	@param dt time delta between ticks
	*/
	Models.Enemy.prototype.update = function(dt) {
		// Multiply by dt for normalization
		this.position.x += (SPRITE_X_OFFSET * this.velocity) * dt;
	};

	/**
	*	Renders the enemy sprite on the canvas.
	*	Enemies move left to right on the canvas. If they exit the right side
	*	of the canvas, their position is reset to the initial value (off screen left).
	*/
	Models.Enemy.prototype.render = function() {
		if (isOnCanvas(this.position.x, this.position.y)) { // do not render if off canvas
	        ctx.drawImage(Resources.get(this.sprite), this.position.x, this.position.y);  
	    } else {
	        this.position = this.initialConfig.position;
	        this.velocity = getRandomInt(1,6);
	    }
	};

	/**
	*	Player character.
	*	@param characterType enumeration value that signals proper configuration
	*	@constructor
	*/	
	Models.Player = function(characterType) {
		Models.Character.call(this, characterType);

		this.initialConfig = {
			get position() {
				var x = SPRITE_X_OFFSET * 2;
		    	var y = SPRITE_Y_INITIAL_POSITION + (SPRITE_Y_OFFSET * 5);
	    		return new Position(x,y);
			}
		};

		this.position = this.initialConfig.position;
	};

	Models.Player.prototype.update = function(dt) {
		// TODO? handle input seems to handle updating of character
	};

	/**
	*	Renders the player sprite on the canvas. Players move with user input.
	* 	When a player reaches the top of the game board they win and the player is reset.
	*	@param keyCode the key pressed
	*/	
	Models.Player.prototype.render = function() {
		if (isOnCanvas(this.position.x, this.position.y)) {
			ctx.drawImage(Resources.get(this.sprite), this.position.x, this.position.y);
		}
	};

	/**
	*	Handles keyboard input in order to move character around canvas.
	*	@param keyCode the key pressed
	*/	
	Models.Player.prototype.handleInput = function(keyCode) {
	    if (isValidMove(this.position.x, this.position.y, keyCode)) {
	        switch (keyCode) {
	            case 'left':
	                this.position.x -= SPRITE_X_OFFSET;
	                break;
	            case 'up':
	                this.position.y -= SPRITE_Y_OFFSET;
	                break;
	            case 'right':
	                this.position.x += SPRITE_X_OFFSET;
	                break;
	            case 'down':
	                this.position.y += SPRITE_Y_OFFSET;
	                break;
	            default:
	                break;
	        }
	    }
	    // TODO: Winning graphic and better experience of reset
	    if (hasReachedTopRow(this.position.y)) {
	    	this.position = this.initialConfig.position;
	    }
	    // console.log("x = " + this.position.x + ", y = " + this.position.y);
	};
})();
