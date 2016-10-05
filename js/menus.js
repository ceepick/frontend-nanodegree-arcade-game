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
		R: 'images/char-princess-girl.png',
		_: null
	},
	ObjectSpriteUrl: {
		C: 'images/obj-char-selector.png',
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
        	[_.W, _.S, _.S, _.S, _.W],
        	[_.W, _.W, _.S, _.W, _.W],
        	[_.W, _.S, _.S, _.S, _.W],
        	[_.G, _.G, _.G, _.G, _.G]
        ];

        _ = Menus.CharacterSpriteUrl;
 		this.charImages = [
        	[_._, _._, _._, _._, _._],
        	[_._, _._, _._, _._, _._],
        	[_._, _.H, _._, _.B, _._],
        	[_._, _._, _.R, _._, _._],
        	[_._, _.P, _._, _.C, _._],
        	[_._, _._, _._, _._, _._]
        ];

        this.numRows = 6;
        this.numCols = 5;
	};

})();