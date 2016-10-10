// GLOBAL CONSTANTS - TODO: Remove with dynamic object properties

const SPRITE_WIDTH = 101;
const SPRITE_HEIGHT = 171;

const SPRITE_Y_INITIAL_POSITION = -30;
const SPRITE_Y_OFFSET = 83;

const PLAYER_SPRITE_COLLISION_X_OFFSET = 30; 	// exact box: 17
const PLAYER_SPRITE_COLLISION_Y_OFFSET = 62; 	// exact box: 62
const PLAYER_SPRITE_COLLISION_WIDTH = 40; 		// exact box: 67
const PLAYER_SPRITE_COLLISION_HEIGHT = 76;

const LEFT_BOUNDS = 0;
const UPPER_BOUNDS = -30;
const RIGHT_BOUNDS = 404;
const LOWER_BOUNDS = 385;

/**
*	Models incapulates the logic to create, update, render, and interact with Character objects.
*/
var Models = {
	// Enumeration of all character types
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
	*	Determines if user has reached the top row of the gameboard.
	*	Used to determine if user has won the basic game by reaching the top unscathed.
	*	@param yCoordinate the current y-axis coordinate of the player sprite
	*	@return true if on the top row, false if not on the top row
	*/
	var hasReachedTopRow = function(yCoordinate) {
		return (yCoordinate === UPPER_BOUNDS) ? true : false;
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
	*	Character base class. Currently only used to provide sprite.
	*	@param CharacterType enumeration that signals proper configuration
	*	@constructor
	*/
	Models.Character = function(characterType) {
		this.characterType = characterType;
		this.sprite = spritePath(characterType);
		this.spriteSize = {width: 101, height: 171};
		this.spriteOffset = {x: 0, y: -30};
		this.blockOffset = {x: 101, y: 83};

		this.isMobile = true; // allows and prevents character to move on keyup
	};

	/**
	*
	*/
	Models.Character.prototype.rect = function() {
		return {
			x: this.origin.x + this.collisionOffset.x, 
			y: this.origin.y + this.collisionOffset.y,
			width: this.collisionSize.width,
			height: this.collisionSize.height
		}
	};

	/**
	*	Determines if sprite is currently on the canvas.
	*	Used to determine if sprite should be rendered.
	* 	@return true if on canvas, false if off canvas
	*/
	Models.Character.prototype.isOnCanvas = function() {
		var x = this.origin.x, y = this.origin.y;
		if ((x > -this.spriteSize.width && x < ctx.canvas.width) && // horizontal bounds
			(y >= UPPER_BOUNDS && y <= LOWER_BOUNDS)) { // vertical bounds
	        return true;
	    } else {
	        return false;
	    }
	};

	/**
	*	Enemies our player must avoid.
	*	@param characterType enumeration value that signals proper configuration
	*	@constructor
	*/
	Models.Enemy = function(characterType) {
		Models.Character.call(this, characterType);

		this.collisionOffset = {x: 1, y: 77};
		this.collisionSize = {width: 98, height: 66};
		Object.defineProperty(this, "initialOrigin", {
			get: function() {
				var x = -this.blockOffset.x; // offscreen 1 grid position
				var y = this.spriteOffset.y + (this.blockOffset.y * getRandomInt(1, 3));
				return {x: x, y: y};
			}
		});
	    this.origin = this.initialOrigin;
	    this.velocity = getRandomInt(1,6);
	};
	Models.Enemy.prototype = Object.create(Models.Character.prototype);

	/**
	*	Update the enemy's position.
	*	@param dt time delta between ticks
	*/
	Models.Enemy.prototype.update = function(dt) {
		// Multiply by dt for normalization
		this.origin.x += (this.spriteSize.width * this.velocity) * dt;
	};

	/**
	*	Renders the enemy sprite on the canvas.
	*	Enemies move left to right on the canvas. If they exit the right side
	*	of the canvas, their position is reset to the initial value (off screen left).
	*/
	Models.Enemy.prototype.render = function() {
		if (this.isOnCanvas()) { // do not render if off canvas
	        ctx.drawImage(Resources.get(this.sprite), this.origin.x, this.origin.y);  
	    } else {
	        this.origin = this.initialOrigin;
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

		this.State = {
			PLAYING: 0,
			WON: 1,
			LOST: 2
		},
		this.state = this.State.PLAYING;

		this.collisionOffset = {x: 30, y: 62};
		this.collisionSize = {width: 40, height: 70};
		Object.defineProperty(this, "initialOrigin", {
			get: function() {
				var x = this.blockOffset.x * 2;
		    	var y = this.spriteOffset.y + (this.blockOffset.y * 5);
		    	return {x: x, y: y};
		    }
		});
		this.origin = this.initialOrigin;
	};
	Models.Player.prototype = Object.create(Models.Character.prototype);

	Models.Player.prototype.update = function(dt) {
		// TODO? handle input seems to handle updating of character
	};

	/**
	*	Renders the player sprite on the canvas. Players move with user input.
	* 	When a player reaches the top of the game board they win and the player is reset.
	*	@param keyCode the key pressed
	*/	
	Models.Player.prototype.render = function() {
		if (this.isOnCanvas()) {
			var origin = this.origin;
			ctx.drawImage(Resources.get(this.sprite), origin.x, origin.y);
			if (this.state === this.State.WON) {
				// prepare chat bubble and render
		    	var chatBubbleSprite = Resources.get('images/obj-speech-bubble.png');
		    	var size = this.collisionSize;
		    	ctx.drawImage(chatBubbleSprite, origin.x + size.width, origin.y + size.height/2);
		    	// prepare text and render
		    	ctx.font = "20px VT323", ctx.fillStyle = "black", ctx.textAlign = "center";
		    	var text = this.chatBubbleText(this.state);
		    	ctx.fillText(text, origin.x + this.spriteSize.width, origin.y + size.height);
			}
		}
	};

	/**
	*	Determines if sprite should be able to move in a particular direction on the canvas.
	*	@param keyCode code associated with key press
	* 	@return true if valid move, false if invalid move
	*/
	Models.Player.prototype.isValidMove = function(keyCode) {
		var x = this.origin.x, y = this.origin.y;
		if (keyCode === "left" && x === LEFT_BOUNDS || // edge left
	        keyCode === "up" && y === UPPER_BOUNDS || // edge top
	        keyCode === "right" && x === RIGHT_BOUNDS || // edge right
	        keyCode === "down" && y === LOWER_BOUNDS) { // edge bottom
	        return false;
	    }
	    return true;
	};

	Models.Player.prototype.chatBubbleText = function(state) {
		var types = Models.CharacterType;
		switch (this.characterType) {
			case types.BOY:
				return "I h8 winning";
			case types.GIRL_CAT:
				return "NYAN!!!";
			case types.GIRL_HORN:
				return "No problem";
			case types.GIRL_PINK:
				return "*headbangs*";
			case types.GIRL_PRINCESS:
				return "Bless you!";
			default:
		}
	};

	/**
	*	Handles keyboard input in order to move character around canvas.
	*	@param keyCode the key pressed
	*/	
	Models.Player.prototype.handleInput = function(keyCode) {
		var state = Engine.currentState();
		var _ = Engine.State; // enum
		if (state === _.LEVEL_FROGGER || state === _.LEVEL_COLLECTOR) {
			if (this.isValidMove(keyCode) && this.state === this.State.PLAYING) {
				var origin = this.origin;
				var blockOffset = this.blockOffset;
		        switch (keyCode) {
		            case 'left':
		                origin.x -= blockOffset.x;
		                break;
		            case 'up':
		                origin.y -= blockOffset.y;
		                break;
		            case 'right':
		                origin.x += blockOffset.x;
		                break;
		            case 'down':
		                origin.y += blockOffset.y;
		                break;
		            default:
		                break;
		        }
		    }
		    // TODO: Winning graphic and better experience of reset
		    if (hasReachedTopRow(this.origin.y)) {
		    	this.state = this.State.WON;
		    	setTimeout(function() {
		    		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		    		this.origin = this.initialOrigin;
		    		this.state = this.State.PLAYING;
		    	}.bind(this), 1200);
		    }
		}
	};
})();
