// # zazen
// zazenは`The`と`then`とその他の少しのキーワードで構成される、非同期プロセスを繋ぐためのライブラリです。

// ### Escape from callback hell
// コールバックスタイルの非同期処理は深いネストのせいでリーダビリティを失い、
// エラーハンドリングも煩雑になりがちです。
// zazenはこれらの問題を解決するためのスマートな方法を提供します。
var zazen = require('zazen')
  , The = zazen.The
  ;
The
  .then(function () {
    'do first task'
  })
  .wait(1000)
  .then(function (reject, resolve) {
    asyncFunc(function (err, result) {
      if (err != null) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
  .fail(function (err) {
    console.log(err); // > 'fail'
  })
  .then(function () {
    console.log(3);
  });

// ### Install
// ```bash
// npm install zazen
// ```
// ```bash
// bower install zazen
// ```

// ### Include
// <p class="label">Node</p>
// ```
// var zazen = require('zazen')
//   , The = zazen.The
//   ;
// ```
// Standalone
// ```html
// <script src="path/to/zazen.js"></script>
// <script>
// var The = zazen.The;
// </script>
// ```
// jQuery plugin
// ```html
// <script src="path/to/jquery.js"></script>
// <script src="path/to/jquery.zazen.js"></script>
// <script>
// var The = zazen.The;
// </script>
// ```



// ## APIs

// ### The

// ### then(function)
// 非同期なプロセスを扱うときは**resolve**というキーワードの引数を設定します。
// プロセスの完了時に`resolve()`をコールすることで次の**then**プロセスにヘッドが移ります。
// また、`resolve()`メソッドの引数にセットした値は、次の**then**プロセスの引数として引き継がれます。
The
  .then(function (resolve) {
    setTimeout(function () {
      resolve('done');
    }, 1000);
  })
  .then(function (arg) {
    console.log(arg); // > 'done'
  });
// 同期的なプロセスで且つ次のプロセスに値を渡す必要のないとき、**resolve**キーワードを省略することができます。
The
  .then(function () {
    console.log(1); // > 1
  })
  .then(function () {
    console.log(2); // > 2
  });
// 失敗する可能性のあるプロセスの場合は**reject**というキーワードの引数を設定します。
// プロセスの失敗時に`reject()`をコールすることで次の**fail**プロセスにヘッドが移ります。
// また、`reject()`メソッドの引数にセットした値は、次の**fail**プロセスの引数として引き継がれます。
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

// ### then(the)
// `then()`では別の`The`インスタンスをヘッドを移すこともできます。
The
  .then(
    The
      .wait(1000)
      .then(function () {
        console.log(1);
      })
      .wait(2000)
  )
  .then(function () {
    console.log(2);
  });

// ### then([function, ...])
// `then()`に`Array<Function>`を渡すとそれらを並列なプロセスとして扱います。
// 全てのプロセスが完了するのを待って次の**then**プロセスにヘッドが移ります。
The
  .then([
    function () {
      'sync process';
    },
    function (resolve) {
      setTimeout(function () {
        resolve();
      }, 1000);
    },
    function (resolve) {
      setTimeout(resolve, 2000);
    }
  ])
  .then(function () {
    'will be passed 2sec';
  });

// ### fail(function)
// 明示的に`reject()`をコールした時や同期プロセスでエラーが発生した時に、
// 発生元の**then**プロセスより後で一番手前にある**fail**プロセスにヘッドが移ります。
The
  .then(function (reject) {
    reject()
  })
  .fail(function () {
    'this will be called';
  });

// ### wait(delay)
// `setTimeout`のzazen実装です。設定したミリ秒後に次の`then`プロセスにヘッドが移ります。
The
  .wait(1000)
  .then(function () {
    console.log('1sec left');
  });
// また、`The.then()`と同様に**then**プロセスで`return`することで同じ効果を期待できます。
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
// 復帰する可能性があるプロセスの場合は**resolve**というキーワードの引数を設定します。
// 復帰時に`resolve()`をコールすることで次の**then**プロセスにヘッドが移ります。
// また、`resolve()`メソッドの引数にセットした値は、次の**then**プロセスの引数として引き継がれます。
The
  .then(function (reject) {
    reject();
  })
  .fail(function (resolve) {
    if (true) {
      resolve('a');
    }
  })
  .then(function (arg) {
    console.log(arg); // > 'a'
  });

// #### Recover error

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

// ### Distributions
// | | *development* | *production* |
// |:-----|:-----:|:-----:|
// | *Standalone* | [zazen.js](https://raw.github.com/minodisk/zazen/master/jquery.zazen.js) | - |
// | *jQuery plugin* | [jquery.zazen.js](https://raw.github.com/minodisk/zazen/master/jquery.zazen.js) | - |

// ### Documentation authers
// [Daisuke Mino](https://github.com/minodisk)
