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
	    BUG: 5,
	    GEM_GREEN: 6
	},

	GemType: {
		GREEN: 0,
		BLUE: 1,
		ORANGE: 2
	},

	// These are duplicated to reduce the load on the menu screen.
	// I.e. we don't create player objects, just provide enough 
	// information to render the sprites for character selection.
	get SPRITE_WIDTH() {
		return 101
	},
	get SPRITE_Y_INITIAL_POSITION() {
		return -30
	},
	get SPRITE_Y_OFFSET() {
		return 83
	},
	get PLAYER_SPRITE_COLLISION_HEIGHT() {
		return 76
	}
};

(function () {
    // For collision detection
    var froggerLevel = new Levels.Frogger();

	/**
	*	PRIVATE UTILS
	*/

	/**
	*	Generates random integer in min/max range inclusive.
	*	Used for variation in enemy initial position and velocity.
	*	@param min inclusive min value
	*	@param max inclusive max value
	* 	@return random integer value
	*/
	function getRandomInt(min, max) {
	    min = Math.ceil(min);
	    max = Math.floor(max);
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	/**
	*	Provides sprite image asset path.
	*	This function is used in conjunction with resources.js for image caching.
	*	@param characterType enumeration value
	* 	@return path of image asset
	*/
	function spritePath(characterType) {
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
           	case Models.CharacterType.GEM_GREEN:
           		imagePath = 'images/gem-green.png';
           		break;
            default:
                imagePath = undefined;
        }
        return imagePath;
    };

    /**
    *	Determines next position for character animation.
    *	This function is used when a player loses or wins to animate them back to initial position.
    *	@param initPos initial position for animation
    *	@param endPos final position for animation
    *	@param percent complete for animation
    */
    function getNewPosition(initPos, endPos, percent) {
    	var dx = endPos.x - initPos.x,
    		dy = endPos.y - initPos.y;
    	return {
    		x: initPos.x + (dx * percent),
    		y: initPos.y + (dy * percent)
    	}
    }

	/**
	*	PROTOTYPAL OBJECTS
	*/

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
	};

	/**
	*	Returns the rect of the sprite to be used in collision detection.
	*	@return rect that fits the character dimensions in the sprite rect
	*/
	Models.Character.prototype.collisionRect = function() {
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
			(y >= (-30) && y <= ((froggerLevel.map.images.length - 1) * this.blockOffset.y) - 30)) { // vertical bounds
	        return true;
	    } else {
	        return false;
	    }
	};

	/**
	*	Enemy base object.
	*	@param characterType enumeration value that signals proper configuration
	*	@constructor
	*/
	Models.Enemy = function(characterType) {
		Models.Character.call(this, characterType);

		this.collisionOffset = {x: 1, y: 77};
		this.collisionSize = {width: 98, height: 66};
	    this.velocity = getRandomInt(1,6);
	};
	Models.Enemy.prototype = Object.create(Models.Character.prototype);

	/**
	*	Update the enemy's position.
	*	@param dt time delta between ticks
	*/
	Models.Enemy.prototype.update = function(dt) {
		// Multiply by dt for normalization
		this.origin.x += this.spriteSize.width * this.velocity * dt;
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
	*	Frogger enemy.
	*	@param characterType enumeration value that signals proper configuration
	* 	@constructor
	*/
	Models.FroggerEnemy = function(characterType) {
		Models.Enemy.call(this, characterType);

		Object.defineProperty(this, "initialOrigin", {
			get: function() {
				var x = -this.blockOffset.x; // offscreen 1 grid position
				var y = this.spriteOffset.y + (this.blockOffset.y * getRandomInt(1, 3));
				return {x, y};
			}
		});

		this.origin = this.initialOrigin;
	};
	Models.FroggerEnemy.prototype = Object.create(Models.Enemy.prototype);

	/**
	*	Collector enemy.
	*	@param characterType enumeration value that signals proper configuration
	* 	@constructor
	*/
	Models.GemCollectorEnemy = function(characterType) {
		Models.Enemy.call(this, characterType);

		Object.defineProperty(this, "initialOrigin", {
			get: function() {
				var x = -this.blockOffset.x; // offscreen 1 grid position
				var y = this.spriteOffset.y + (this.blockOffset.y * getRandomInt(0, 5));
				return {x, y};
			}
		});

		this.origin = this.initialOrigin;
	};
	Models.GemCollectorEnemy.prototype = Object.create(Models.Enemy.prototype);


	/**
	*	Player character base object.
	*	@param characterType enumeration value that signals proper configuration
	*	@constructor
	*/
	Models.Player = function(characterType) {
		Models.Character.call(this, characterType);

		this.State = {
			PLAYING: 0,
			WON: 1,
			RESET: 3
		},
		this.state = this.State.PLAYING;

		this.collisionOffset = {x: 30, y: 62};
		this.collisionSize = {width: 40, height: 70};

		this.chatBubbleSprite = Resources.get('images/obj-speech-bubble.png');

		this.lAnimationDuration = 300; // 0.3s
		this.lInitialTime = null;
		this.lPercentComplete = null;
		this.lInitialPosition = null;
	};
	Models.Player.prototype = Object.create(Models.Character.prototype);

	/**
	*	Called to update the model during the level reset animation.
	*	The player will animate on a straight path back to the origin.
	*/
	Models.Player.prototype.updateResetAnimation = function() {
		// clear canvas to avoid render behind game board when transitioning from State.WON
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		var now = Date.now();
		// start animation
		if (this.lInitialTime === null) {
			// set initial time and initial position for progress calculations
			this.lInitialTime = now;
			this.lInitialPosition = this.origin;
		} else {
			this.lPercentComplete = ((now - this.lInitialTime)) / this.lAnimationDuration;
			// update position on path until duration reached
			if (this.lPercentComplete <= 1) {
				this.origin = getNewPosition(this.lInitialPosition, this.initialOrigin, this.lPercentComplete);
			} else {
				// reset state for next collision animation, assign final position
				this.state = this.State.PLAYING;
				this.lInitialTime = this.lPercentComplete = this.lInitialPosition = null;
				this.origin = this.initialOrigin;
			}
		}
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
		    	var size = this.collisionSize;
		    	ctx.drawImage(this.chatBubbleSprite, origin.x + size.width, origin.y + size.height/2);
		    	// prepare text and render
		    	ctx.fillText(this.chatBubbleText(), origin.x + this.spriteSize.width, origin.y + size.height);
			}
		}
	};

	/**
	*	Updates the character model data before a render.
	*/
	Models.Player.prototype.update = function() {
		if (this.state === this.State.WON) {
			ctx.font = "20px VT323", ctx.fillStyle = "black", ctx.textAlign = "center";
		}
		// Animate player back to start upon collision
		else if (this.state === this.State.RESET) {
			this.updateResetAnimation();
		}
	};

	/**
	*	Returns the "indices" of the player ont he gameboard.
	* 	This method is used to help validate moves.
	*/
	Models.Player.prototype.mapLocationIndices = function() {
		return {
			x: this.origin.x/this.blockOffset.x,
			y: (this.origin.y + 30)/this.blockOffset.y
		}
	};

	/**
	*	Determines which text string should be displayed for the player winning the level.
	*	@return appropriate string or an empty string for an undefined player
	*/
	Models.Player.prototype.chatBubbleText = function() {
		var types = Models.CharacterType;
		switch (this.characterType) {
			case types.BOY:
				return "Bummer";
			case types.GIRL_CAT:
				return "NYAN!!!";
			case types.GIRL_HORN:
				return "No problem";
			case types.GIRL_PINK:
				return "*headbangs*";
			case types.GIRL_PRINCESS:
				return "Bless you!";
			default:
				return "";
		}
	};

	/**
	*	Handles keyboard input in order to move character around canvas.
	*	@param keyCode the key pressed
	*/	
	Models.Player.prototype.handleInput = function(keyCode) {
		var state = Engine.currentState();
		var _ = Engine.State; // enum
		if (state === _.LEVEL_FROGGER || state === _.LEVEL_GEM_COLLECTOR) {
			if (this.state === this.State.PLAYING && this.isValidMove(keyCode)) {
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
		}
	};

	/**
	*	Frogger player character.
	*	@param characterType enumeration value that signals proper configuration
	*	@constructor
	*/	
	Models.FroggerPlayer = function(characterType) {
		Models.Player.call(this, characterType);

		Object.defineProperty(this, "initialOrigin", {
			get: function() {
				var x = this.blockOffset.x * 2;
		    	var y = this.spriteOffset.y + (this.blockOffset.y * 5);
		    	return {x, y};
		    }
		});
		this.origin = this.initialOrigin;
	};
	Models.FroggerPlayer.prototype = Object.create(Models.Player.prototype);

	/**
	*	Determines if sprite should be able to move in a particular direction on the canvas.
	*	@param keyCode code associated with key press
	* 	@return true if valid move, false if invalid move
	*/
	Models.FroggerPlayer.prototype.isValidMove = function(keyCode) {
		var indices = this.mapLocationIndices();
		var x = indices.x,
			y = indices.y;

		// inc/dec x or y
		switch (keyCode) {
	        case 'left':
	        	x -= 1;
	            break;
	        case 'up':
	        	y -= 1;
	            break;
	        case 'right':
	        	x += 1;
	            break;
	        case 'down':
	        	y += 1;
	            break;
	        default:
	            break;
        }
		// check boundaries
		if (x < 0 || x > 4 || y < 0 || y > 5) {
			return false;
		}
		// check destination tile type
		if (froggerLevel.map.images[y][x] === Levels.MapSpriteUrl.W) {
			return false;
		}

		// valid move
		return true;
	};

	/**
	*	Determines if user has reached the winning destination square of the game board.
	*	Used to determine if user has won the basic game by reaching the top unscathed.
	*	@return true if on the winning square, false if not on the winning square
	*/
	Models.FroggerPlayer.prototype.isWinningMove = function() {
		var indices = this.mapLocationIndices();
		return (indices.x === 2 && indices.y === 0) ? true : false;
	};

		/**
	*	Handles keyboard input in order to move character around canvas.
	*	@param keyCode the key pressed
	*/	
	Models.FroggerPlayer.prototype.handleInput = function(keyCode) {
		Models.Player.prototype.handleInput.call(this, keyCode);

	    if (this.isWinningMove()) {
	    	this.state = this.State.WON;
	    	setTimeout( () => {
	    		this.state = this.State.RESET;
	    	}, 1200);
	    }
	};

	/**
	*	Collector player character.
	*	@param characterType enumeration value that signals proper configuration
	*	@constructor
	*/	
	Models.GemCollectorPlayer = function(characterType) {
		Models.Player.call(this, characterType);

		Object.defineProperty(this, "initialOrigin", {
			get: function() {
				var x = this.blockOffset.x * 2;
		    	var y = this.spriteOffset.y + (this.blockOffset.y * 3);
		    	return {x, y};
		    }
		});
		this.origin = this.initialOrigin;
	};
	Models.GemCollectorPlayer.prototype = Object.create(Models.Player.prototype);

	/**
	*	Determines if sprite should be able to move in a particular direction on the canvas.
	*	@param keyCode code associated with key press
	* 	@return true if valid move, false if invalid move
	*/
	Models.GemCollectorPlayer.prototype.isValidMove = function(keyCode) {
		var indices = this.mapLocationIndices();
		var x = indices.x,
			y = indices.y;

		// inc/dec x or y
		switch (keyCode) {
	        case 'left':
	        	x -= 1;
	            break;
	        case 'up':
	        	y -= 1;
	            break;
	        case 'right':
	        	x += 1;
	            break;
	        case 'down':
	        	y += 1;
	            break;
	        default:
	            break;
        }
		// check boundaries
		if (x < 0 || x > 4 || y < 0 || y > 5) {
			return false;
		}

		// valid move
		return true;
	};

	Models.Gem = function(characterType) {
		Models.Character.call(this, characterType);

		this.State = {
			SPAWNED: 0,
			COLLECTED: 1,
			DESPAWNED: 2
		},
		this.state = this.State.SPAWNED;

		this.lLifespan = 0;
		this.lInitialTime = null;
		this.lPercentComplete = null;

		this.origin = {
			x: this.blockOffset.x * getRandomInt(0,4),
			y: this.spriteOffset.y + (this.blockOffset.y * getRandomInt(0,5))
		};
	};

	Models.Gem.prototype.update = function() {
				// clear canvas to avoid render behind game board when transitioning from State.WON
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		var now = Date.now();
		// start animation
		if (this.lInitialTime === null) {
			// set initial time and initial position for progress calculations
			this.lInitialTime = now;
		} else {
			this.lPercentComplete = ((now - this.lInitialTime)) / this.lLifespan;
			// update position on path until duration reached
			if (this.lPercentComplete > 1) {
				this.state = this.State.DESPAWNED;
				// remove
			}
		}
	};

	Models.Gem.prototype.render = function() {
		var origin = this.origin;
		ctx.drawImage(Resources.get(this.sprite), origin.x, origin.y);
	};

	Models.GreenGem = function(characterType) {
		Models.Gem.call(this, characterType);
		this.lLifespan = getRandomInt(3, 7) * 1000; // 3 - 7s
		this.value = 1;
	};
	Models.GreenGem.prototype = Object.create(Models.Gem.prototype);

})();

































