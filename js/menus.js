/**
*	Menus provides the data necessary to render a particular menu for the game.
*/
var Menus = {
	MapSpriteUrl: {
		W: 'images/block-water.png',
		S: 'images/block-stone.png',
		G: 'images/block-grass.png',
		_: undefined
	},
	CharacterSptireUrl: {
		B: 'images/char-boy.png',
		C: 'images/char-cat-girl.png',
		H: 'images/char-horn-girl.png',
		P: 'images/char-pink-girl.png',
		_: undefined
	}
};

(function () {

	// CLASSES

	Menus.CharacterSelect = function() {
		var _ = Levels.MapSpriteUrl;
		this.mapImages = [
        	[_.G, _.G, _.G, _.G, _.G, _.G],
        	[_.G, _.G, _.G, _.G, _.G, _.G],
        	[_.G, _.G, _.G, _.G, _.G, _.G],
        	[_.G, _.G, _.G, _.G, _.G, _.G],
        	[_.G, _.G, _.G, _.G, _.G, _.G],
        	[_.G, _.G, _.G, _.G, _.G, _.G]
        ];

        _ = Levels.CharacterSptireUrl;
 		this.charImages = [
        	[_._, _._, _._, _._, _._, _._],
        	[_._, _._, _._, _._, _._, _._],
        	[_._, _._, _._, _._, _._, _._],
        	[_._, _.H, _.P, _.B, _.C, _._],
        	[_._, _._, _._, _._, _._, _._],
        	[_._, _._, _._, _._, _._, _._]
        ];

        this.numRows = 6;
        this.numCols = 6;
	};

})();