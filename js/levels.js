/**
*	Levels provides the data necessary to render a particular level for the game.
*/
var Levels = {
	MapSpriteUrl: {
		W: 'images/block-water.png',
		S: 'images/block-stone.png',
		G: 'images/block-grass.png'
	}
};

(function () {

	// CLASSES

	Levels.Simple = function() {
		var _ = Levels.MapSpriteUrl;
		this.mapImages = [
        	[_.W, _.W, _.W, _.W, _.W],
        	[_.S, _.S, _.S, _.S, _.S],
        	[_.S, _.S, _.S, _.S, _.S],
        	[_.S, _.S, _.S, _.S, _.S],
        	[_.G, _.G, _.G, _.G, _.G],
        	[_.G, _.G, _.G, _.G, _.G]
        ];
        this.numRows = 6;
        this.numCols = 5;
	};

})();