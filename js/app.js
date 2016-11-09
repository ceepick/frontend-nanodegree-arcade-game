/**
*   INITIALIZATION
*/

// Create Enemies, Players, and Gems global objects
var allEnemies = []; // dynamic based on level
var player = null; // user will pick player in menus
var gems = []; // generated when gem collector level loads

var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};

/**
*   GLOBAL UTILS
*/

/**
*   Generates random integer in min/max range inclusive.
*   Used for variation in enemy initial position and velocity.
*   @param min inclusive min value
*   @param max inclusive max value
*   @return random integer value
*/
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
*   EVENT LISTENERS
*/

/**
*   Listens for keyup events to handle player movmement.
*   This method is used for the Frogger game.
*   @param keyup the keyup event
*   @param function(e) the event handling function
*/
document.addEventListener('keyup', function(e) {
    if (player !== null // player must be selected before accepting movement
        && player.state === player.State.PLAYING 
        && Engine.currentGame() === Engine.Game.FROGGER) {
        // signal model object keyup has occured
        player.handleInput(allowedKeys[e.keyCode]);
    }
});

/**
*   Listens for keydown events to handle player movmement.
*   This method is used for the Gem Collector game.
*   @param keydown the keydown event
*   @param function(e) the event handling function
*/
document.addEventListener('keydown', function(e) {
    if (player !== null // player must be selected before accepting movement
        && (player.state === player.State.PLAYING || player.state === player.State.INVINCIBILITY) 
        && Engine.currentGame() === Engine.Game.GEM_COLLECTOR) {
        // signal model object keydown has occured
        player.handleInput(allowedKeys[e.keyCode]);
    }
});

/**
*   Listens for click events to handle player selection.
*   @param click the click event
*   @param function(e) the event handling function
*/
document.addEventListener('click', function(e) {
    // signal engine that click has occured
    Engine.onClick(ctx.canvas, e);
});
