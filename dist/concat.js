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

/**
*	Menus provides the data necessary to render a particular menu for the game.
*/
var Menus = {
	MapSpriteUrl: {
		W: 'images/block-water.png',
		S: 'images/block-stone.png',
		G: 'images/block-grass.png',
		_: null
	},
	CharacterSpriteUrl: {
		B: 'images/char-boy.png',
		C: 'images/char-cat-girl.png',
		H: 'images/char-horn-girl.png',
		P: 'images/char-pink-girl.png',
		R: 'images/char-princess-girl.png',
		_: null
	},
};

(function () {

	// CLASSES

	Menus.CharacterSelect = function() {
		var _ = Menus.MapSpriteUrl;
		this.map = {
			images: [
				[_.G, _.G, _.G, _.G, _.G],
	        	[_.G, _.G, _.G, _.G, _.G],
	        	[_.W, _.S, _.S, _.S, _.W],
	        	[_.W, _.W, _.S, _.W, _.W],
	        	[_.W, _.S, _.S, _.S, _.W],
	        	[_.G, _.G, _.G, _.G, _.G]
			],
			numRows: 6,
			numCols: 5
		};

        _ = Menus.CharacterSpriteUrl;
        this.characters = {
        	images: [
        		[_._, _._, _._, _._, _._],
	        	[_._, _._, _._, _._, _._],
	        	[_._, _.H, _._, _.B, _._],
	        	[_._, _._, _.R, _._, _._],
	        	[_._, _.P, _._, _.C, _._],
	        	[_._, _._, _._, _._, _._]
        	],
        	numRows: 6,
        	numCols: 5
        };
	};

})();
/**
*	Levels provides the data necessary to render a particular level for the game.
*/
var Levels = {
	MapSpriteUrl: {
		W: 'images/block-water.png',
		S: 'images/block-stone.png',
		G: 'images/block-grass.png',
		_: null
	}
};

(function () {

	// CLASSES

	Levels.Frogger = function() {
		var _ = Levels.MapSpriteUrl;
		this.map = {
			images: [
				[_.W, _.W, _.S, _.W, _.W],
	        	[_.S, _.S, _.S, _.S, _.S],
	        	[_.S, _.S, _.S, _.S, _.S],
	        	[_.S, _.S, _.S, _.S, _.S],
	        	[_.G, _.G, _.G, _.G, _.G],
	        	[_.G, _.G, _.G, _.G, _.G]
			],
			numRows: 6,
			numCols: 5
		};
	};

	Levels.Collector = function() {
		var _ = Levels.MapSpriteUrl;
		this.map = {
			images: [
				[_.S, _.G, _.G, _.G, _.S],
	        	[_.G, _.G, _.G, _.G, _.G],
	        	[_.G, _.G, _.G, _.G, _.G],
	        	[_.G, _.G, _.G, _.G, _.G],
	        	[_.G, _.G, _.G, _.G, _.G],
	        	[_.S, _.G, _.G, _.G, _.S]
	        ],
	        numRows: 6,
	        numCols: 5
		};
	};

})();
/* Resources.js
 * This is simply an image loading utility. It eases the process of loading
 * image files so that they can be used within your game. It also includes
 * a simple "caching" layer so it will reuse cached images if you attempt
 * to load the same image multiple times.
 */
(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    /* This is the publicly accessible image loading function. It accepts
     * an array of strings pointing to image files or a string for a single
     * image. It will then call our private image loading function accordingly.
     */
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            /* If the developer passed in an array of images
             * loop through each value and call our image
             * loader on that image file
             */
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        } else {
            /* The developer did not pass an array to this function,
             * assume the value is a string and call our image loader
             * directly.
             */
            _load(urlOrArr);
        }
    }

    /* This is our private image loader function, it is
     * called by the public image loader function.
     */
    function _load(url) {
        if(resourceCache[url]) {
            /* If this URL has been previously loaded it will exist within
             * our resourceCache array. Just return that image rather
             * re-loading the image.
             */
            return resourceCache[url];
        } else {
            /* This URL has not been previously loaded and is not present
             * within our cache; we'll need to load this image.
             */
            var img = new Image();
            img.onload = function() {
                /* Once our image has properly loaded, add it to our cache
                 * so that we can simply return this image if the developer
                 * attempts to load this file in the future.
                 */
                resourceCache[url] = img;

                /* Once the image is actually loaded and properly cached,
                 * call all of the onReady() callbacks we have defined.
                 */
                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };

            /* Set the initial cache value to false, this will change when
             * the image's onload event handler is called. Finally, point
             * the image's src attribute to the passed in URL.
             */
            resourceCache[url] = false;
            img.src = url;
        }
    }

    /* This is used by developers to grab references to images they know
     * have been previously loaded. If an image is cached, this functions
     * the same as calling load() on that URL.
     */
    function get(url) {
        return resourceCache[url];
    }

    /* This function determines if all of the images that have been requested
     * for loading have in fact been properly loaded.
     */
    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    /* This function will add a function to the callback stack that is called
     * when all requested images are properly loaded.
     */
    function onReady(func) {
        readyCallbacks.push(func);
    }

    /* This object defines the publicly accessible functions available to
     * developers by creating a global Resources object.
     */
    window.Resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();

// Create Enemies and Players
var numEnemies = 4;
var allEnemies = [];
for (i = 0; i < numEnemies; ++i) {
    allEnemies.push(new Models.Enemy(Models.CharacterType.BUG));
}
var player = null; // user will pick character in menus

// Listen for user input and call to handle player movement
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    // only call handleInput if a player has been selected
    if (player !== null) {
        player.handleInput(allowedKeys[e.keyCode]); // TODO: fix handleinput call before player is set
    }
});

// Clicks tracked for character selection
document.addEventListener('click', function(e) {
    // Signal engine that click has occured
    Engine.onClick(ctx.canvas, e);
});
/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

(function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    // Cache menus and levels to prevent redeclaration in rendering loop
    var characterSelectMenu = new Menus.CharacterSelect(),
        froggerLevel = new Levels.Frogger(),
        collectorLevel = new Levels.Collector();

    // State enum to transition between different screens on the game
    var State = {
        MENU_CHARACTER_SELECT: 1,
        LEVEL_FROGGER: 2,
        LEVEL_COLLECTOR: 3
    }
    var state = State.MENU_CHARACTER_SELECT; // initial state
    
    // This object is used to assist in the selection of a character
    var characterSelectSpriteInfo = populateCharacterSelectInfo(characterSelectMenu);

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;


         /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        switch (state) {
            case State.MENU_CHARACTER_SELECT:
                renderCharacterSelect(characterSelectMenu);
                break;
            case State.LEVEL_FROGGER:
                update(dt);
                renderFrogger(froggerLevel);
                break;
            case State.LEVEL_COLLECTOR:
                break;
            default:
        }

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset(); // TODO
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /**
    *   Retrieves the current value of the state variable.
    *   @return the current value of state
    */
    function currentState() {
        return state;
    }

    /**
    *   This method changes the game state between screens.
    *   @param nextState the state to transition to
    *   @param metadata information needed for pre-state-change logic
    */
    function changeState(nextState, metadata) {
        // execute work before state change
        switch (nextState) {
            case State.MENU_CHARACTER_SELECT:
                break;
            case State.LEVEL_FROGGER:
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (player === null) {
                    player = new Models.Player(metadata.characterType);
                }
                break;
            case State.LEVEL_COLLECTOR:
                break;
            default:
        }

        state = nextState;
    }

    /**
    *   Determins if there is a collision between to rectangles.
    *   @param rect1 the first rectangle to be compared
    *   @param rect2 the second rectangle to be compared
    *   @return true if collions detected, false if no collision detected
    */
    function isCollision(rect1, rect2) {
        if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height && rect1.height + rect1.y > rect2.y) {
            // collision detected, reset player position
            return true;
        } else {
            return false;
        }
    }

    /**
    *   Checks for collisions between the player and enemy sprites.
    */
    // TODO - animate char before reset
    function checkCollisions() {
        var playerRect = player.rect();

        var enemyRect;
        allEnemies.forEach(function(enemy) {
            enemyRect = enemy.rect();
            if (isCollision(playerRect, enemyRect)) {
                // collision detected, reset player position
                player.origin = player.initialOrigin;
            }
        });
    }

    /**
    *   Renders a "layer" of content on the canvas.
    *   NOTE: via HTML5 documentation, multiple canvas' for layers optimizes performance.
    *         This is a possible future enchancement.
    *   @param layer the content data to be rendered
    *   @param xOffset the number of pixels to offset the x-axis coordinate
    *   @param yOffset the number of pixels to offset the y-axis coordinate
    */
    function renderLayer(layer, xOffset, yOffset) {
        for (row = 0; row < layer.numRows; ++row) {
            for (col = 0; col < layer.numCols; ++col) {
                var sprite = layer.images[row][col];
                if (sprite !== null) {
                    ctx.drawImage(Resources.get(sprite), (col * 101) + xOffset, (row * 83) + yOffset);
                }
            }
        }
    }

    /**
    *   This function handles rendering the character select menu.
    *   @param menu the content data for a menu screen
    */
    function renderCharacterSelect(menu) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // draw scene
        renderLayer(menu.map, 0, 0);
        renderLayer(menu.characters, 0, SPRITE_Y_INITIAL_POSITION);

        // render text
        ctx.font = "54px VT323", ctx.fillStyle = "green", ctx.strokeStyle = "blue", ctx.textAlign = "center";
        var x = ctx.canvas.width / 2;
        var y = ctx.canvas.height / 16;
        ctx.fillText("CHOOSE A TOON!", x, y)
        ctx.strokeText("CHOOSE A TOON!", x, y);
    }

    /**
    *   This function handles rendering the frogger game level.
    *   @param level the content data for the frogger level
    */
    function renderFrogger(level) {
        renderLayer(level.map, 0, 0);
        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /**
    *   Click event listener function. This function is used for character selection.
    *   @param canvas the canvas the click occured on
    *   @param event the click event
    */
    function onClick(canvas, event) {
        // Determine click coordinates on canvas
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        // Determine which character has been selected and change state to the selected game
        if (state === State.MENU_CHARACTER_SELECT) {
            var clickRect = {x: x, y: y, width: 1, height: 1};
            characterSelectSpriteInfo.forEach(function(spriteInfo) {
                if (isCollision(clickRect, spriteInfo.rect)) {
                    changeState(State.LEVEL_FROGGER, {characterType: spriteInfo.characterType}); // TODO: Dynamic game selection
                }
            });       
        }
    }

    /**
    *   Convenience function to determine which character type corresonds to a particular sprite.
    *   @param sprite the character sprite that was selected
    *   @return the character type or undefined if the path is not defined
    */
    function characterType(sprite) {
        var type = Models.CharacterType;
        switch (sprite) {
            case 'images/char-boy.png':
                return type.BOY;
            case 'images/char-cat-girl.png':
                return type.GIRL_CAT;
            case 'images/char-horn-girl.png':
                return type.GIRL_HORN;
            case 'images/char-pink-girl.png':
                return type.GIRL_PINK;
            case 'images/char-princess-girl.png':
                return type.GIRL_PRINCESS;
            default:
                return undefined;
        }
    }

    /**
    *   Convenience function that generates an array of character sprite info.
    *   The application caches this information to use for character selection.
    *   @param characterSelectMenu the content data for the character select menu screen
    *   @return an object that contains the character type and location information of the sprite
    */
    function populateCharacterSelectInfo(characterSelectMenu) {
        var spriteInfos = [];
        var chars = characterSelectMenu.characters;
        for (row = 0; row < chars.numRows; ++row) {
            for (col = 0; col < chars.numCols; ++col) {
                var sprite = chars.images[row][col];
                if (sprite !== null) {
                    spriteInfos.push({
                        characterType: characterType(sprite),
                        rect: {
                            x: col * SPRITE_WIDTH,
                            y: row * SPRITE_Y_OFFSET - SPRITE_Y_INITIAL_POSITION,
                            width: SPRITE_WIDTH,
                            height: PLAYER_SPRITE_COLLISION_HEIGHT
                        }
                    });
                }
            }
        }
        return spriteInfos;
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/block-stone.png',
        'images/block-water.png',
        'images/block-grass.png',
        'images/obj-speech-bubble.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

    /*
    *   Define public functions
    */
    window.Engine = {
        onClick: onClick,
        currentState: currentState,  // current state
        State: State // Enum
    };
})(this);
