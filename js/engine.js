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
                // collision detected, animate player to initial position
                player.state = player.State.LOST;
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
