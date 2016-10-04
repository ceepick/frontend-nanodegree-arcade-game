// Create Enemies and Players
var numEnemies = 4;
var allEnemies = [];
for (i = 0; i < numEnemies; ++i) {
    allEnemies.push(new Models.Enemy(Models.CharacterType.BUG));
}
var player = new Models.Player(Models.CharacterType.GIRL_HORN);

// Listen for user input and call to handle player movement
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
