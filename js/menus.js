/**
*	Menus provides the data necessary to render a particular menu for the game.
*/
var Menus = {
	MapSpriteUrl: {
		W: 'images/block-water.png',
		S: 'images/block-stone.png',
		G: 'images/block-grass.png',
		_: null
	},
	CharacterSpriteUrl: {
		B: 'images/char-boy.png',
		C: 'images/char-cat-girl.png',
		H: 'images/char-horn-girl.png',
		P: 'images/char-pink-girl.png',
		_: null
	}
};

(function () {

	// CLASSES

	Menus.CharacterSelect = function() {
		var _ = Menus.MapSpriteUrl;
		this.mapImages = [
        	[_.G, _.G, _.G, _.G, _.G],
        	[_.G, _.G, _.G, _.G, _.G],
        	[_.G, _.G, _.G, _.G, _.G],
        	[_.G, _.G, _.G, _.G, _.G],
        	[_.G, _.G, _.G, _.G, _.G],
        	[_.G, _.G, _.G, _.G, _.G]
        ];

        _ = Menus.CharacterSpriteUrl;
 		this.charImages = [
        	[_._, _._, _._, _._, _._],
        	[_._, _._, _._, _._, _._],
        	[_._, _._, _._, _._, _._],
        	[_._, _.H, _.P, _.B, _.C],
        	[_._, _._, _._, _._, _._],
        	[_._, _._, _._, _._, _._]
        ];

        this.numRows = 6;
        this.numCols = 5;
	};

})();