// Create Enemies and Players
var numEnemies = 4;
var allEnemies = [];
for (i = 0; i < numEnemies; ++i) {
    allEnemies.push(new Models.Enemy(Models.CharacterType.BUG));
}
var player = null; // user will pick character in menus

// test

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