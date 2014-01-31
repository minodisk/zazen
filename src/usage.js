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
// callbackを使って書く非同期処理はdeep nestでreadabilityを失います。
// zazenはcodeのreadabilityを保ちます。
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

// ## Resolve async process
// 非同期なプロセスを扱うときは`resolve`というキーワードの引数を設定します。
// プロセスの完了時に`resolve()`をコールすることで次の`then`プロセスにヘッドが移ります。
The
  .then(function (resolve) {
    setTimeout(function () {
      resolve();
    }, 1000);
  })
  .then(function () {
    console.log('done async process');
  });
// また、`resolve()`メソッドには次の`then`

// ## Reject process
// 失敗する可能性のあるプロセスの場合は`reject`というキーワードの引数を設定します。
// プロセスの失敗時に`reject()`をコールすることで次の`fail`プロセスにヘッドが移ります。
The
  .then(function (reject, resolve) {
    require('fs').readFile('data/null.json', function (err, data) {
      if (err != null) {
        reject(err);
      } else {
        resolve(err);
      }
    });
  })
  .fail(function (err) {
    console.log(err);
  })
  .then(function () {

  });

// ## Run tasks serially

// ## Run tasks parallely

// ## Handle errors

// ## Recover error

// ## Pomisify
// zazenをNodeで使うとき、`promisify()`というユーティリティが役に立ちます。
// これは`function (err, result) {}`のようなcallbackを引数とする非同期なNodeのmethodをzazenのスタイルにwrapします。
var promisify = zazen.promisify
  , readFile = promisify(require('fs').readFile)
  ;
readFile('data/a.json')
  .fail(function (err) {
    console.log(err);
  })
  .then(function (data) {
    console.log(data);
  });

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
