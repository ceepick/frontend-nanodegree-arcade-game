/**
*   INITIALIZATION
*/

// Create Enemies and Players
var numEnemies = 4;
var allEnemies = [];
var i;
for (i = 0; i < numEnemies; ++i) {
    allEnemies.push(new Models.GemCollectorEnemy(Models.CharacterType.BUG));
}
var player = null; // user will pick character in menus


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
    if (player !== null && player.state === player.State.PLAYING) {
        player.handleInput(allowedKeys[e.keyCode]); // TODO: fix handleinput call before player is set
    }
});

// Clicks tracked for character selection
document.addEventListener('click', function(e) {
    // Signal engine that click has occured
    Engine.onClick(ctx.canvas, e);
});
