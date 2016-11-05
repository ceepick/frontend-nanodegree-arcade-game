/**
*   INITIALIZATION
*/

// Create Enemies and Players
var allEnemies = []; // dynamic based on level
var player = null; // user will pick character in menus
var gems = [];

/**
*   EVENT LISTENERS
*/

// Listen for user input and call to handle player movement
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    // only call handleInput if a player has been selected
    if (player !== null && player.state === player.State.PLAYING && Engine.currentGame() === Engine.Game.FROGGER) {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});

// Listen for user input and call to handle player movement
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    // only call handleInput if a player has been selected
    if (player !== null && player.state === player.State.PLAYING && Engine.currentGame() === Engine.Game.GEM_COLLECTOR) {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});

// Clicks tracked for character selection
document.addEventListener('click', function(e) {
    // Signal engine that click has occured
    Engine.onClick(ctx.canvas, e);
});
