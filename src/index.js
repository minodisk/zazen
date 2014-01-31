// # zazen
// zazenは`The`と`then`とその他の少しのキーワードで構成される、非同期プロセスを繋ぐためのライブラリです。

// ### Escape from callback hell

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
// コールバックスタイルの非同期処理は深いネストのせいでリーダビリティを失いがちで、
// エラーハンドリングも煩雑になりがちです。
// zazenはこれらの問題を解決するためのスマートな方法を提供します。
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

// ### Distributions
// | | *development* | *production* |
// |:-----|:-----:|:-----:|
// | *Standalone* | [zazen.js](https://raw.github.com/minodisk/zazen/master/jquery.zazen.js) | - |
// | *jQuery plugin* | [jquery.zazen.js](https://raw.github.com/minodisk/zazen/master/jquery.zazen.js) | - |

// ### Install with package manager
// #### Npm
// ```sh
// npm install zazen
// ```
// #### Bower
// ```sh
// bower install zazen
// ```

// ### Include into your project
// #### Node
var zazen = require('zazen')
  , The = zazen.The
  ;
// #### Standalone in browser
// ```html
// <script src="path/to/zazen.js">
// <script>
// var The = zazen.The;
// </script>
// ```
// #### jQuery plugin in browser
// ```html
// <script src="path/to/jquery.js">
// <script src="path/to/jquery.zazen.js">
// <script>
// var The = zazen.The;
// </script>
// ```

// ## APIs

// ### The

// ### then(function)

// ### then(the)

// ### then([function, ...])

// ### fail(function)

// ### wait(delay)
// `setTimeout`のzazen実装です。設定したミリ秒後に次の`then`プロセスにヘッドが移ります。
The
  .wait(1000)
  .then(function () {
    console.log('1sec left');
  });
// また、`The.then()`と同様に`then`プロセスで`return`することで同じ効果を期待できます。
// この方法はプロセスの実行時まで遅延時間を決定できない時等に用います。
The
  .then(function () {
    if (shouldWaitLongTime) {
      return The.wait(5000);
    }
    return The.wait(1000);
  })
  .then(function () {
    console.log('1src or 5sec left');
  });

// #### Handle errors

// #### Recover error

// ### \[then|fail\](function (resolve) {})
// 非同期なプロセスを扱うときは`resolve`というキーワードの引数を設定します。
// プロセスの完了時に`resolve()`をコールすることで次の`then`プロセスにヘッドが移ります。
// また、`resolve()`メソッドの引数にセットした値は、次の`then`プロセスの引数として引き継がれます。
The
  .then(function (resolve) {
    setTimeout(function () {
      resolve('done');
    }, 1000);
  })
  .then(function (arg) {
    console.log(arg); // > 'done'
  });

// ### \[then|fail\](function (reject) {})
// 失敗する可能性のあるプロセスの場合は`reject`というキーワードの引数を設定します。
// プロセスの失敗時に`reject()`をコールすることで次の`fail`プロセスにヘッドが移ります。
// また、`reject()`メソッドの引数にセットした値は、次の`fail`プロセスの引数として引き継がれます。
The
  .then(function (reject) {
    require('fs').readFile('data/null.json', function (err, data) {
      if (err != null) {
        reject(err);
      }
    });
  })
  .fail(function (err) {
    console.log(err);
  });

// ### pomisify(function)
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


// ## Cookbook

// ### With underscore or lo-dash
The
  .parallel(_.map(['data/a.json', 'data/b.json', 'data/c.json'], fs.readFile))
  .then(_.map, function (json) {
    return JSON.parse(json);
  })
  .then(function (objects) {
    console.log(objects);
  });


// ## Copyright

// ### Documentation authers
// [Daisuke Mino](https://github.com/minodisk)
