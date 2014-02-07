// # zazen
// zazenは`The`と`then`とその他の少しのキーワードで構成される、非同期プロセスを繋ぐためのライブラリです。

// **Escape from callback hell**
// コールバックスタイルの非同期処理は深いネストのせいでリーダビリティを失い、
// エラーハンドリングも煩雑になりがちです。
// zazenはこれらの問題を解決するためのスマートな方法を提供します。
var zazen = require('zazen')
  , The = zazen.The
  , fs = require('fs')
  ;
The
  .wait(1000)
  .then(function (reject, resolve) {
    fs.readFile('data.json', function (err, result) {
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
// **in Node**
// ```
// var zazen = require('zazen')
//   , The = zazen.The
//   ;
// ```

// **in browser (standalone)**
// ```html
// <script src="path/to/zazen.js"></script>
// <script>
//   var The = zazen.The;
// </script>
// ```

// **in browser (jQuery plugin)**
// ```html
// <script src="path/to/jquery.js"></script>
// <script src="path/to/jquery.zazen.js"></script>
// <script>
//   var The = zazen.The;
// </script>
// ```



// ## APIs

// ### The(context)
// **束縛**
// zazenフロー中の`function`を`context`で束縛します。
// `context`を渡さなかった場合や`The`を関数としてコールしなかった場合は`The`インスタンスが`context`となります。
The({ foo: 'bar' })
  .then(function () {
    this; //=> { foo: 'bar' }
  });
//
The()
  .then(function () {
    this; //=> '[object the]'
  });
//
The
  .then(function () {
    this; //=> '[object the]'
  });

// **コンストラクタの同位性**
// `new`,`()`の有無によらず同じ機能を持ちます。
new The().then();
//
The().then();
//
The.then();

// ### then(function)
// **resolve 引数**
// 非同期プロセスや次のプロセスに値を渡す必要がある場合、*resolve*というキーワードの引数を設定します。
// プロセスの完了時に`resolve()`をコールすることで次の*then*プロセスにヘッドが移ります。
// また、`resolve()`の引数にセットした値は、次の*then*プロセスに引数として渡されます。
The
  .then(function (resolve) {
    setTimeout(function () {
      resolve('done');
    }, 1000);
  })
  .then(function (arg) {
    console.log(arg); // > 'done'
  });
// **reject 引数**
// プロセス中でエラーハンドリングする場合、*reject*というキーワードの引数を設定します。
// プロセスの失敗時に`reject()`をコールすることで次の*fail*プロセスにヘッドが移ります。
// また、`reject()`の引数にセットした値は、次の*fail*プロセスに引数として渡されます。
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
// **resolve, reject 引数の省略**
// 同期プロセスで且つ次のプロセスに値を渡す必要がない場合、*resolve*というキーワードの引数を省略することができます。
// また、プロセス中でエラーハンドリングをしない場合、*reject*というキーワードの引数を省略することができます。
The
  .then(function () {
    console.log(1); // > 1
  })
  .then(function () {
    console.log(2); // > 2
  });

// ### then(the)
// **the1 -> the2 -> the1**
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
// **並列処理**
// `then()`に`Array<Function>`を渡すとそれらを並列なプロセスとして扱います。
// 全てのプロセスが完了するのを待って次の*then*プロセスにヘッドが移ります。
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
// **エラーハンドリング**
// *then*プロセス中に`reject()`をコールした場合やエラーなどをキャッチした場合、次の*fail*プロセスにヘッドが移ります。
// 間の*then*プロセスはスキップされ、*fail*から後の*then*プロセスも実行されるません。
The
  .then(function (reject) {
    reject();
  })
  .then(function () {
    /* will be skipped */
  })
  .fail(function () {
    /* will be called */
  })
  .then(function () {
    /* won't be called */
  });
//
The
  .then(function () {
    throw 'OMG!';
  })
  .then(function () {
    /* will be skipped */
  })
  .fail(function () {
    /* will be called */
  })
  .then(function () {
    /* won't be called */
  });

// **then へ復帰**
// *resolve*というキーワードを引数を設定し、`resolve()`をコールすることで次の*then*プロセスにヘッドが移ります。
// また、`resolve()`の引数にセットした値は、次の*then*プロセスに引数として渡されます。
The
  .then(function (reject) {
    reject();
  })
  .fail(function (resolve) {
    /* do something to recover */
    resolve();
  })
  .then(function () {
    /* will be called */
  });

// **fail から fail へ**
// *reject*というキーワードを引数を設定し、`reject()`をコールすることで次の*fail*プロセスにヘッドが移ります。
// また、`reject()`の引数にセットした値は、次の*fail*プロセスに引数として渡されます。
The
  .then(function (reject) {
    reject();
  })
  .fail(function (reject) {
    /* give up recovering */
    reject();
  })
  .then(function () {
    /* will be skipped */
  })
  .fail(function () {
    /* will be called */
  });

// ### wait(delay)
// **遅延**
// 設定したミリ秒後に次の`then`プロセスにヘッドが移ります。
The
  .wait(1000)
  .then(function () {
    console.log('1sec left');
  });
// **then で return**
// *then*プロセス中で`The.wait()`を`return`することで同じ効果を期待できます。
// この方法はプロセスの実行時まで遅延するか否かを決定できない場合などに用います。
The
  .then(function () {
    if (Math.random() < 0.5) {
      return The.wait(1000);
    }
  })
  .then(function () {
    console.log('1sec left 50% of the time');
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

// ### Distributions
// | | development | production |
// |:-----|:-----:|:-----:|
// | Standalone | [zazen.js](https://raw.github.com/minodisk/zazen/master/jquery.zazen.js) | - |
// | jQuery plugin | [jquery.zazen.js](https://raw.github.com/minodisk/zazen/master/jquery.zazen.js) | - |

// ### Documentation authers
// [Daisuke Mino](https://github.com/minodisk)
