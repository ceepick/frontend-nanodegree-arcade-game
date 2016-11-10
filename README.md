# frontend-nanodegree-arcade-game - the ceepick fork!

frontend-nanodegree-arcade-game is my version a [Udacity](https://www.udacity.com/) project for the [Front-End Developer Web Nanodegree](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd001?v=fe1) course.

My version includes the _Frogger_ clone with some customization as well as an original game titled _Gem Hunter_.

## Quickstart
### Requirements

[npm](https://www.npmjs.com/) is required to install code dependencies. You can find an install guide [here](http://blog.npmjs.org/post/85484771375/how-to-install-npm). If you would like to do additional development and fully support the deployment pipeline, you will also need [gulp](https://github.com/gulpjs/gulp). You can find an install guide for gulp over [heyah](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md).

### Download and Installation

1. Navigate to a directory and clone the project.

    `$ git clone https://github.com/ceepick/frontend-nanodegree-arcade-game.git`

2. Install dependencies.

	`$ npm install`


3. Load _index.html_ or _index-dist.html_ into your browser.

## Gameplay

### Common

* To restart the game, reload the page in your browser.
* Tested in Chrome, Firefox, and Safari. Please let me know if you have issues!

### Frogger Clone

As with the old game, the purpose is to reach the far side of the game board while avoiding enemies. In this game, you must reach the stone tile! Each character will provide a unique quip upon completion.

* Use the arrow keys [left, right, up, down] to move the character between tiles.

### Gem Hunter

The purpose of his game is to collect gems while avoiding enemies. You have 5 lives so be careful!

* Use the arrow keys [left, right, up, down] to move the character between tiles.
* Green gems are worth 1 pt, blue gems ar worth 3 pts, and orange gems are worth 10 pts.
* After a death, you are invulnerable for 3 seconds and still allowed to move around the board and collect gems.
* After all lives have been lost, your score and lives are reset.

## Developer Stuff

### index files and gulp

* You can simply use the _index.html_ file and ignore gulp as long as your browser has ES6 support. Otherwise, you can use the gulp file to transpile, concatenate and minify the js code. The _index-dist.html_ file should be loaded if wish to use the generated file.
* The gulp file chains the following with the default `gulp` command:
  * Transpiles to ES5
  * Concatenates all js files in dependent order
  * Renames and minifies the concatenated file and puts it in the /dist directory

### Build game from Sublime Text 3

If you want a quick way to reload the game after code changes, follow this [guide](http://michaelcrump.net/getting-sublime-3-to-launch-your-html-page-in-a-browser-with-a-key-combo/) to set up a Build System!
