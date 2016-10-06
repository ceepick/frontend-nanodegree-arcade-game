/**
*	Levels provides the data necessary to render a particular level for the game.
*/
var Levels = {
	MapSpriteUrl: {
		W: 'images/block-water.png',
		S: 'images/block-stone.png',
		G: 'images/block-grass.png',
		_: null
	}
};

(function () {

	// CLASSES

	Levels.Frogger = function() {
		var _ = Levels.MapSpriteUrl;
		this.map = {
			images: [
				[_.W, _.W, _.S, _.W, _.W],
	        	[_.S, _.S, _.S, _.S, _.S],
	        	[_.S, _.S, _.S, _.S, _.S],
	        	[_.S, _.S, _.S, _.S, _.S],
	        	[_.G, _.G, _.G, _.G, _.G],
	        	[_.G, _.G, _.G, _.G, _.G]
			],
			numRows: 6,
			numCols: 5
		};
	};

	Levels.Collector = function() {
		var _ = Levels.MapSpriteUrl;
		this.map = {
			images: [
				[_.S, _.G, _.G, _.G, _.S],
	        	[_.G, _.G, _.G, _.G, _.G],
	        	[_.G, _.G, _.G, _.G, _.G],
	        	[_.G, _.G, _.G, _.G, _.G],
	        	[_.G, _.G, _.G, _.G, _.G],
	        	[_.S, _.G, _.G, _.G, _.S]
	        ],
	        numRows: 6,
	        numCols: 5
		};
	};

})();