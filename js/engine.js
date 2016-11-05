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
    var gameSelectMenu = new Menus.GameSelect(),
        characterSelectMenu = new Menus.CharacterSelect(),
        froggerLevel = new Levels.Frogger(),
        gemCollectorLevel = new Levels.GemCollector();

    // Enum for game selection
    var Game = {
        FROGGER: 0,
        GEM_COLLECTOR: 1,
        UNSELECTED: 2
    }
    var game = Game.UNSELECTED;

    // State enum to transition between different screens in the game
    var State = {
        MENU_GAME_SELECT: 0,
        MENU_CHARACTER_SELECT: 1,
        LEVEL_FROGGER: 2,
        LEVEL_GEM_COLLECTOR: 3
    }
    var state = State.MENU_GAME_SELECT; // initial state
    
    // This object is used to assist in the selection of a character
    // TODO: Revisit
    var gameSelectTitleInfo = gameSelectTitleInfo();
    var characterSelectSpriteInfo = populateCharacterSelectInfo(characterSelectMenu);

    var score = 0;


    // define canvas dimensions and append to document body
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


         /* Call our update/render functions dependent on game stats, pass along the time
         *  delta if needed to our update function since it may be used for smooth animation.
         */
        switch (state) {
            case State.MENU_GAME_SELECT:
                renderGameSelect(gameSelectMenu);
                break;
            case State.MENU_CHARACTER_SELECT:
                renderCharacterSelect(characterSelectMenu);
                break;
            case State.LEVEL_FROGGER:
                update(dt);
                renderFrogger(froggerLevel);
                break;
            case State.LEVEL_GEM_COLLECTOR:
                ctx.clearRect(0, 0, canvas.width, canvas.height); // for top row artifacting
                update(dt);
                renderGemCollector(gemCollectorLevel);
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
        reset(); // TODO if needed
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
        if (game === Game.GEM_COLLECTOR) {
            if (shouldSpawnGem()) {
                spawnGem();
            }
            gems.forEach((gem, idx) => {
                gem.update(dt);
                var state = gem.state;
                if (state === gem.State.COLLECTED || state === gem.State.DESPAWNED) {
                    gems.splice(idx, 1);
                }
            });
        }

        allEnemies.forEach(enemy => {
            enemy.update(dt);
        });

        player.update();
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

    function gameSelectTitleInfo() {
        return {
            froggerHitBox: {
                x: Models.SPRITE_WIDTH,
                y: (Models.SPRITE_Y_OFFSET * 2) + Models.SPRITE_Y_INITIAL_POSITION,
                width: Models.SPRITE_WIDTH * 3,
                height: Models.SPRITE_Y_OFFSET
            },
            gemCollectorHitBox: {
                x: Models.SPRITE_WIDTH,
                y: (Models.SPRITE_Y_OFFSET * 5) + Models.SPRITE_Y_INITIAL_POSITION,
                width: Models.SPRITE_WIDTH * 3,
                height: Models.SPRITE_Y_OFFSET
            }   
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
        var row, col;
        for (row = 0; row < chars.numRows; ++row) {
            for (col = 0; col < chars.numCols; ++col) {
                var sprite = chars.images[row][col];
                if (sprite !== null) {
                    spriteInfos.push({
                        characterType: characterType(sprite),
                        collisionRect: {
                            x: col * Models.SPRITE_WIDTH,
                            y: row * Models.SPRITE_Y_OFFSET - Models.SPRITE_Y_INITIAL_POSITION,
                            width: Models.SPRITE_WIDTH,
                            height: Models.PLAYER_SPRITE_COLLISION_HEIGHT
                        }
                    });
                }
            }
        }
        return spriteInfos;
    }

    /**
    *   Retrieves the current value of the state variable.
    *   @return the current value of state
    */
    function currentState() {
        return state;
    }

    function currentGame() {
        return game;
    }

    /**
    *   This method changes the game state between screens.
    *   @param nextState the state to transition to
    *   @param metadata information needed for pre-state-change logic
    */
    function changeState(nextState, metadata) {
        // execute work before state change
        switch (nextState) {
            case State.MENU_GAME_SELECT:
            case State.MENU_CHARACTER_SELECT:
                break;
            case State.LEVEL_FROGGER:
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (player === null) {
                    player = new Models.FroggerPlayer(metadata.characterType);
                }
                break;
            case State.LEVEL_GEM_COLLECTOR:
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (player === null) {
                    player = new Models.GemCollectorPlayer(metadata.characterType);
                }
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
    function checkCollisions() {
        var playerRect = player.collisionRect();

        // check collisions with gems
        var gemRect;
        gems.forEach(gem => {
            gemRect = gem.collisionRect();
            if (isCollision(playerRect, gemRect)) {
                gem.state = gem.State.COLLECTED;
                score += gem.value;
            }
        });

        var enemyRect;
        allEnemies.forEach(enemy => {
            enemyRect = enemy.collisionRect();
            if (player.state === player.State.PLAYING && isCollision(playerRect, enemyRect)) {
                // collision detected, animate player to initial position
                player.state = player.State.RESET;
            }
        });
    }

    /**
    *   Determines if a new gem should be spawned
    */
    function shouldSpawnGem() {
        var min = Math.ceil(0);
        var max = Math.floor(100);
        var rand = Math.floor(Math.random() * (max - min + 1)) + min;
        return (rand < 1 && gems.length <= 3) ? true : false;
    }

    function spawnGem() {
        var min = Math.ceil(0);
        var max = Math.floor(100);
        var rand = Math.floor(Math.random() * (max - min + 1)) + min;

        var gem;
        if (rand < 5) {
            gem = new Models.OrangeGem(Models.CharacterType.GEM_ORANGE);
        } else if (rand >= 5 && rand < 20) {
            gem = new Models.BlueGem(Models.CharacterType.GEM_BLUE);
        } else {
            gem = new Models.GreenGem(Models.CharacterType.GEM_GREEN);
        }
        gems.push(gem);
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
        var row, col;
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
    function renderGameSelect(menu) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // draw scene
        renderLayer(menu.map, 0, 0);

        // render text
        ctx.font = "54px VT323", ctx.fillStyle = "green", ctx.strokeStyle = "blue", ctx.textAlign = "center";
        var x = ctx.canvas.width / 2;
        var y = ctx.canvas.height / 16;
        ctx.fillText("CHOOSE A GAME!", x, y)
        ctx.strokeText("CHOOSE A GAME!", x, y);

        y = ctx.canvas.height/3.2;
        ctx.fillStyle = "white", ctx.strokeStyle = "green";
        ctx.fillText("FROGGER", x, y)
        ctx.strokeText("FROGGER", x, y);

        y = ctx.canvas.height/1.39;
        ctx.fillStyle = "white", ctx.strokeStyle = "blue";
        ctx.fillText("INDIANA GEMS", x, y)
        ctx.strokeText("INDIANA GEMS", x, y);
    }

    /**
    *   This function handles rendering the character select menu.
    *   @param menu the content data for a menu screen
    */
    function renderCharacterSelect(menu) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // draw scene
        renderLayer(menu.map, 0, 0);
        renderLayer(menu.characters, 0, Models.SPRITE_Y_INITIAL_POSITION);

        // render text
        ctx.font = "54px VT323", ctx.fillStyle = "green", ctx.strokeStyle = "blue", ctx.textAlign = "center";
        var x = ctx.canvas.width / 2;
        var y = ctx.canvas.height / 16;
        ctx.fillText("CHOOSE A TOON!", x, y)
        ctx.strokeText("CHOOSE A TOON!", x, y);
    }

    /**
    *   This function handles rendering the Frogger game level.
    *   @param level the content data for the frogger level
    */
    function renderFrogger(level) {
        renderLayer(level.map, 0, 0);
        renderEntities();
    }

    /**
    *   This function handles rendering the Gem Collector game level.
    *   @param level the content data for the frogger level
    */
    function renderGemCollector(level) {
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
        gems.forEach(gem => { // gems on the bottom
            gem.render();
        });

        player.render(); // render player before enemies so beatles "run over" player :P

        allEnemies.forEach(enemy => {
            enemy.render();
        });
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop - possible TODO
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
        var clickRect = {x: x, y: y, width: 1, height: 1};

        switch (state) {
            case State.MENU_GAME_SELECT:
                if (isCollision(clickRect, gameSelectTitleInfo.froggerHitBox)) {
                    game = Game.FROGGER;
                    for (var i = 0; i < 4; ++i) {
                        allEnemies.push(new Models.FroggerEnemy(Models.CharacterType.BUG));
                    }
                }
                if (isCollision(clickRect, gameSelectTitleInfo.gemCollectorHitBox)) {
                    game = Game.GEM_COLLECTOR;
                    for (var i = 0; i < 5; ++i) {
                        allEnemies.push(new Models.GemCollectorEnemy(Models.CharacterType.BUG));
                    }
                }

                if (game !== Game.UNSELECTED) {
                    changeState(State.MENU_CHARACTER_SELECT, null);
                }
                break;
            case State.MENU_CHARACTER_SELECT:
                characterSelectSpriteInfo.forEach(spriteInfo => {
                    if (isCollision(clickRect, spriteInfo.collisionRect)) {
                        switch (game) {
                            case Game.FROGGER:
                                changeState(State.LEVEL_FROGGER, {characterType: spriteInfo.characterType});
                                break;
                            case Game.GEM_COLLECTOR:
                                changeState(State.LEVEL_GEM_COLLECTOR, {characterType: spriteInfo.characterType});
                                break;
                            default:
                        }
                    }
                }); 
                break;
            default:
        }
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
        'images/char-princess-girl.png',
        'images/gem-green.png',
        'images/gem-blue.png',
        'images/gem-orange.png'
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
        currentState: currentState,
        State: State,
        currentGame: currentGame,
        Game: Game
    };
})(this);
