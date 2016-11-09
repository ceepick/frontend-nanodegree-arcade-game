/* 
*   Engine.js
* 
*   This file provides the game loop functionality (update entities and render),
*   draws the game boards on the screen, and calls the update and
*   render methods on your entity objects.
*
*   This engine is available globally via the Engine variable and it also makes
*   the canvas' context (ctx) object globally available to make writing app.js
*   a little simpler to work with.
*/

(function(global) {
    /**
    *   Private variables
    */

    // Predefine the variables we'll be using within this scope,
    // create the canvas element, grab the 2D context for that canvas
    // set the canvas elements height/width and add it to the DOM.
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    // define canvas dimensions and append to document body
    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    // Cache menus and levels to prevent redeclaration in rendering loop
    var gameSelectMenu = new Menus.GameSelect(),
        playerSelectMenu = new Menus.PlayerSelect(),
        froggerLevel = new Levels.Frogger(),
        gemCollectorLevel = new Levels.GemCollector();

    // State enum for game selection
    var Game = {
        FROGGER: 0,
        GEM_COLLECTOR: 1,
        UNSELECTED: 2
    }
    var game = Game.UNSELECTED; // initial state

    // State enum to transition between different screens in the game
    var State = {
        MENU_GAME_SELECT: 0,
        MENU_PLAYER_SELECT: 1,
        LEVEL_FROGGER: 2,
        LEVEL_GEM_COLLECTOR: 3
    }
    var state = State.MENU_GAME_SELECT; // initial state
    
    // This object is used to assist in the selection of a player
    var gameSelectTitleInfo = gameSelectTitleInfo();
    var playerSelectSpriteInfo = populatePlayerSelectInfo(playerSelectMenu);

    // Variables used to track the player's score and remaining lives    
    var score = 0,
        lives = 5;

    /**
    *   Rendering loop function.
    *   This function is recursively called indefinitely until the browser window is closed.
    */
    function main() {
        // Time delta calculation
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        // Determine state and then update and render as appropriate
        // *note - dt is used to create consistent fps across computers/browsers
        switch (state) {
            case State.MENU_GAME_SELECT:
                renderGameSelect(gameSelectMenu);
                break;
            case State.MENU_PLAYER_SELECT:
                renderPlayerSelect(playerSelectMenu);
                break;
            case State.LEVEL_FROGGER:
                update(dt);
                renderFrogger(froggerLevel);
                break;
            case State.LEVEL_GEM_COLLECTOR:
                ctx.clearRect(0, 0, canvas.width, canvas.height); // prevents top row artifacting
                update(dt);
                renderGemCollector(gemCollectorLevel);
                break;
            default:
        }

        // Set our lastTime variable which is used to determine the time 
        // delta for the next time this function is called.
        lastTime = now;

        // Use the browser's requestAnimationFrame function to call this
        // function again as soon as the browser is able to draw another frame.
        win.requestAnimationFrame(main);
    }

    /**
    *   Generates initial timestamp and begins the render loop.
    */
    function init() {
        lastTime = Date.now(); // initial
        main(); // begin render loop
    }

    /*  
    *   This function is called by main (our game loop) and itself calls all
    *   of the functions which may need to update entity's data.
    *   @param dt time delta since the last frame was updated
    */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }

    /*
    *   This function updates all entity data before a render.
    *   @param dt time delta since the last frame was updated
    */
    function updateEntities(dt) {
        // Update gems if playing Gem Collector game
        if (game === Game.GEM_COLLECTOR) {
            if (shouldSpawnGem()) {
                spawnGem();
            }
            gems.forEach((gem, idx) => {
                gem.update(dt);
                var state = gem.state;
                // Remove gem if it has been collected by player or its lifespan has elapsed
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
    *   Convenience function to determine which entity type corresonds to a particular sprite.
    *   @param sprite the entity sprite that was selected
    *   @return the entity type or undefined if the path is not defined
    */
    function entityType(sprite) {
        var type = Models.EntityType;
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
    *   Convenience function that returns the game title hit boxes for game selection.
    *   @return frogger and gem collector title hit boxes for collision detection
    */
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
    *   Convenience function that generates an array of player sprite info.
    *   The application caches this information to use for player selection.
    *   @param playerSelectMenu the content data for the player select menu screen
    *   @return an object that contains the player type and location information of the sprite
    */
    function populatePlayerSelectInfo(playerSelectMenu) {
        var spriteInfos = [];
        var players = playerSelectMenu.players;
        var row, col;
        // loop through player array and generate hit boxes for each player
        for (row = 0; row < players.numRows; ++row) {
            for (col = 0; col < players.numCols; ++col) {
                var sprite = players.images[row][col];
                if (sprite !== null) {
                    spriteInfos.push({
                        entityType: entityType(sprite),
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

    /**
    *   Retrieves the current value of the game variable.
    *   @return the current value of game
    */
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
            case State.MENU_PLAYER_SELECT:
                break;
            case State.LEVEL_FROGGER:
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // create player
                if (player === null) {
                    player = new Models.FroggerPlayer(metadata.entityType);
                }
                break;
            case State.LEVEL_GEM_COLLECTOR:
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // create player
                if (player === null) {
                    player = new Models.GemCollectorPlayer(metadata.entityType);
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
            // collision detected
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
        gems.forEach(gem => {
            if (gem.state === gem.State.SPAWNED && isCollision(playerRect, gem.collisionRect())) {
                gem.state = gem.State.SCORING;
                gem.resetUpdate();
                score += gem.value;
            }
        });

        // check collisions with enemies
        allEnemies.forEach(enemy => {
            if (player.state === player.State.PLAYING && isCollision(playerRect, enemy.collisionRect())) {
                // collision detected
                // decrement lives until zero, then reset score and lives to initial values
                if (lives > 0) {
                    --lives;
                } else {
                    lives = 5;
                    score = 0;
                }
                player.state = player.State.RESET;
            }
        });
    }

    /**
    *   Determines if a new gem should be spawned.
    *   Max number of gems on screen is 4. 1% chance of spawn per call.
    */
    function shouldSpawnGem() {
        var min = Math.ceil(0);
        var max = Math.floor(100);
        var rand = Math.floor(Math.random() * (max - min + 1)) + min;
        return (rand < 1 && gems.length < 4) ? true : false;
    }

    /**
    *   Spawns a gem on screen.
    *   5% chance of orange gem, 15% chance of blue gem, 80% chance of green gem.
    */
    function spawnGem() {
        var min = Math.ceil(0);
        var max = Math.floor(100);
        var rand = Math.floor(Math.random() * (max - min + 1)) + min;

        var gem;
        if (rand < 5) {
            gem = new Models.OrangeGem(Models.EntityType.GEM_ORANGE);
        } else if (rand >= 5 && rand < 20) {
            gem = new Models.BlueGem(Models.EntityType.GEM_BLUE);
        } else {
            gem = new Models.GreenGem(Models.EntityType.GEM_GREEN);
        }
        gems.push(gem);
    }

    /**
    *   Renders a "layer" of content on the canvas. (Layers can be 2d arrays of levels, menus, and entities)
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
    *   This function handles rendering text to the screen.
    *   @param x x-coordinate for text
    *   @param y y-coordinate for text
    *   @param fillStyle the fillStyle for the text
    *   @param strokeStyle the stroke style for the text
    *   @param text the text to be rendered
    */
    function renderText(x, y, fillStyle, strokeStyle, text) {
        ctx.font = "54px VT323",
        ctx.fillStyle = fillStyle,
        ctx.strokeStyle = strokeStyle,
        ctx.textAlign = "center";

        ctx.fillText(text, x, y);
        ctx.strokeText(text, x, y);
    }

    /**
    *   This function handles rendering the player select menu.
    *   @param menu the content data for a menu screen
    */
    function renderGameSelect(menu) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // draw scene
        renderLayer(menu.map, 0, 0);

        // render text
        renderText(canvas.width/2, canvas.height/16, "green", "blue", "CHOOSE A GAME!");
        renderText(canvas.width/2, canvas.height/3.2, "white", "green", "FROGGER");
        renderText(canvas.width/2, canvas.height/1.39, "white", "blue", "GEM HUNTER");
    }

    /**
    *   This function handles rendering the player select menu.
    *   @param menu the content data for a menu screen
    */
    function renderPlayerSelect(menu) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // draw scene
        renderLayer(menu.map, 0, 0);
        renderLayer(menu.players, 0, Models.SPRITE_Y_INITIAL_POSITION);

        // render text
        renderText(canvas.width/2, canvas.height/16, "green", "blue", "CHOOSE A TOON!");
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

        // render text
        var text = "LIVES: " + lives + "  SCORE: " + score;
        renderText(canvas.width/2, canvas.height/16, "green", "blue", text);
    }

    /**
    *   This method renders all entities to the screen on a given render loop.
    */
    function renderEntities() {
        // render gems first so they will be on the bottom
        gems.forEach(gem => {
            gem.render();
        });

        // render player before enemies so beatles "run over" player :P
        player.render();

        // render enemies last so they are on the top
        allEnemies.forEach(enemy => {
            enemy.render();
        });
    }

    /**
    *   Click event listener handler function. This function is used for player selection.
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
                // player chooses frogger game
                if (isCollision(clickRect, gameSelectTitleInfo.froggerHitBox)) {
                    game = Game.FROGGER;
                    for (var i = 0; i < 4; ++i) {
                        allEnemies.push(new Models.FroggerEnemy(Models.EntityType.BUG));
                    }
                }
                // player chooses gem hunter game
                if (isCollision(clickRect, gameSelectTitleInfo.gemCollectorHitBox)) {
                    game = Game.GEM_COLLECTOR;
                    for (var i = 0; i < 5; ++i) {
                        allEnemies.push(new Models.GemCollectorEnemy(Models.EntityType.BUG));
                    }
                }
                // load player select after game is chosen
                if (game !== Game.UNSELECTED) {
                    changeState(State.MENU_PLAYER_SELECT, null);
                }
                break;
            case State.MENU_PLAYER_SELECT:
                // used cached character select sprite info for collisions
                playerSelectSpriteInfo.forEach(spriteInfo => {
                    if (isCollision(clickRect, spriteInfo.collisionRect)) {
                        switch (game) {
                            case Game.FROGGER:
                                changeState(State.LEVEL_FROGGER, {entityType: spriteInfo.entityType});
                                break;
                            case Game.GEM_COLLECTOR:
                                changeState(State.LEVEL_GEM_COLLECTOR, {entityType: spriteInfo.entityType});
                                break;
                            default:
                        }
                    }
                }); 
                break;
            default:
        }
    }

    // Go ahead and load all of the images we know we're going to need to
    // draw our game level. Then set init as the callback method, so that when
    // all of these images are properly loaded our game will start.
    Resources.load([
        'images/block-stone.png',
        'images/block-water.png',
        'images/block-grass.png',
        'images/obj-speech-bubble.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-boy-inv.png',
        'images/char-cat-girl.png',
        'images/char-cat-girl-inv.png',
        'images/char-horn-girl.png',
        'images/char-horn-girl-inv.png',
        'images/char-pink-girl.png',
        'images/char-pink-girl-inv.png',
        'images/char-princess-girl.png',
        'images/char-princess-girl-inv.png',
        'images/gem-green.png',
        'images/gem-blue.png',
        'images/gem-orange.png'
    ]);
    Resources.onReady(init);


    // Assign the canvas' context object to the global variable (the window
    // object when run in a browser) so that developers can use it more easily
    // from within their app.js files.
    global.ctx = ctx;

    // define publically accessible properties
    window.Engine = {
        onClick: onClick,
        currentState: currentState,
        State: State,
        currentGame: currentGame,
        Game: Game
    };
})(this);
