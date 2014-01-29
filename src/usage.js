// # Zazen
// zazenはあなたのコードをreadableにします。
// zazenは`The`と`then`その他の少しのキーワードで構成される、asynchronous processをchainするライブラリです。

// ## Include
// Node

var zazen = require('../zazen')
  , The = zazen.The
  ;

// browser
// - standalone
// ```html
// <script src="path/to/zazen.js">
// <script>
// var The = zazen.The;
// </script>
// ```
// - with jQuery
// ```html
// <script src="path/to/jquery.js">
// <script src="path/to/jquery.zazen.js">
// <script>
// var The = zazen.The;
// </script>
// ```

// ## Escape from callback hell

var wait = function (duration, callback) {
    setTimeout(callback, duration);
  }
  ;
wait(1000, function () {
  console.log(1);
  wait(1000, function () {
    console.log(2);
    wait(1000, function () {
      console.log(3);
    });
  });
});
// コールバックで書く非同期処理はネストでreadabilityを失います。
// zazenで見通しの良いコードにしましょう。
The
  .wait(1000)
  .then(function () {
    console.log(1);
  })
  .wait(1000)
  .then(function () {
    console.log(2);
  })
  .wait(1000)
  .then(function () {
    console.log(3);
  });

// ## Run tasks serially

// ## Run tasks parallely

// ## Handle errors

// ## Recover error

// ## Pomisify
var promisify = zazen.promisify
  , fs = promisify(require('fs'))
  , httpGet = promisify(require('http').get)
  ;

// ## Use with underscore or lo-dash
The
  .parallel(_.map(['data/a.json', 'data/b.json', 'data/c.json'], fs.readFile))
  .then(_.map, function (json) {
    return JSON.parse(json);
  })
  .then(function (objects) {
    console.log(objects);
  });

// ## distributions
