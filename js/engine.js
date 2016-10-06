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

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    var characterSelectMenu = new Menus.CharacterSelect(),
        froggerLevel = new Levels.Frogger();

    var State = {
        CHARACTER_SELECT: 1,
        LEVEL_FROGGER: 2,
        LEVEL_COLLECTOR: 3
    }

    var state = State.CHARACTER_SELECT;

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
            case State.CHARACTER_SELECT:
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
        reset();
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

    // TODO - animate char before reset
    function checkCollisions() {
        var playerRect = {
            x: player.position.x + PLAYER_SPRITE_COLLISION_X_OFFSET,
            y: player.position.y + PLAYER_SPRITE_COLLISION_Y_OFFSET,
            width: PLAYER_SPRITE_COLLISION_WIDTH ,
            height: PLAYER_SPRITE_COLLISION_HEIGHT
        };
        var enemyRect;
        allEnemies.forEach(function(enemy) {
            enemyRect = {
                x: enemy.position.x + ENEMY_BUG_SPRITE_COLLISION_X_OFFSET,
                y: enemy.position.y + ENEMY_BUG_SPRITE_COLLISION_Y_OFFSET,
                width: ENEMY_BUG_SPRITE_COLLISION_WIDTH,
                height: ENEMY_BUG_SPRITE_COLLISION_HEIGHT
            };

            if (playerRect.x < enemyRect.x + enemyRect.width &&
                playerRect.x + playerRect.width > enemyRect.x &&
                playerRect.y < enemyRect.y + enemyRect.height &&
                playerRect.height + playerRect.y > enemyRect.y) {
                // collision detected, reset player position
                player.position = player.initialConfig.position;
            }
        });
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

    function renderLayer(layer, xOffset, yOffset) {
        for (row = 0; row < layer.numRows; ++row) {
            for (col = 0; col < layer.numCols; ++col) {
                var sprite = layer.images[row][col];
                if (sprite != null) {
                    ctx.drawImage(Resources.get(sprite), (col * 101) + xOffset, (row * 83) + yOffset);
                }
            }
        }
    }

    function renderCharacterSelect(menu) {
        // draw scene
        renderLayer(menu.map, 0, 0);
        renderLayer(menu.characters, 0, SPRITE_Y_INITIAL_POSITION);

        // render text
        ctx.font = "48px serif";
        ctx.fillStyle = "green";
        ctx.strokeStyle = "blue";
        ctx.textAlign = "center";
        var x = ctx.canvas.width / 2;
        var y = ctx.canvas.height / 16;
        ctx.fillText("CHOOSE A TOON!", x, y)
        ctx.strokeText("CHOOSE A TOON!", x, y);
    }

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

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/block-stone.png',
        'images/block-water.png',
        'images/block-grass.png',
        'images/obj-char-selector.png',
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
})(this);
