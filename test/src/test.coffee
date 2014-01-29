now = ->
  new Date().getTime()

describe 'The', ->
  describe '.then()', ->
    it "should be a shorthand for `new The().then()`", ->
      expect(The.then(->)).to.be.a The

  describe '.wait()', ->
    it "should be a shorthand for `new The().wait()`", (done) ->
      i = -1
      time = now()
      The
      .wait(100)
      .then ->
          expect(++i).to.be.equal 1
          expect(now() - time).to.be.above 100
          done()
      expect(++i).to.be.equal 0

  describe '#context', ->
    it "should be a `The` instance in default", (done) ->
      the = The
      .then([
          ->
            expect(@).to.be.equal the
        , ->
            expect(@).to.be.equal the
        ])
      .then ->
          expect(@).to.be.equal the
          throw new Error ''
      .fail ->
          expect(@).to.be.equal the
          done()

    it "should act as context in all actors", (done) ->
      context = {}
      The(context)
      .then([
          ->
            expect(@).to.be.equal context
        , ->
            expect(@).to.be.equal context
        ])
      .then ->
          expect(@).to.be.equal context
          throw new Error ''
      .fail ->
          expect(@).to.be.equal context
          done()

    it "should act as context when it is class instance", (done) ->
      class Foo
        constructor: ->
          @x = 0

        start: ->
          The(@)
          .then (resolve) ->
              expect(@x).to.be.equal 0
              intervalId = setInterval =>
                if ++@x >= 10
                  clearInterval intervalId
                  resolve()
              , 33

      foo = new Foo()
      foo
      .start()
      .then ->
          expect(@).to.be.equal foo
          expect(foo.x).to.be.equal 10
          throw new Error ''
      .fail ->
          expect(@).to.be.equal foo
          done()

  describe '#constructor()', ->
    it "should create `The` instance", ->
      expect(new The()).to.be.a The

    it "should create `The` instance without new operator", ->
      expect(The()).to.be.a The

  describe '#then()', ->
    it "should require one parameter", ->
      expect(->
        The.then()
      ).to.throwException()
      expect(->
        The.then (->), (->)
      ).to.throwException()

    it "should be chainable", (done) ->
      The
      .then(->)
      .then(->)
      .then ->
          done()

    it "should run serially when the argument is function", (done) ->
      i = -1
      The
      .then ->
          expect(++i).to.be.equal 1
      .then ->
          expect(++i).to.be.equal 2
      .then ->
          expect(++i).to.be.equal 3
          done()
      expect(++i).to.be.equal 0, 'outer'

    it "should run parallely when the argument is array of function", (done) ->
      i = -1
      The
      .then([
          ->
            expect(++i).to.be.within 1, 3
        , ->
            expect(++i).to.be.within 1, 3
        , ->
            expect(++i).to.be.within 1, 3
        ])
      .then ->
          expect(++i).to.be.equal 4, 'then4'
          done()
      expect(++i).to.be.equal 0, 'outer'

    it "should run serially and asynchronously when the argument is function and it has 'done' argument", (done) ->
      i = -1
      time = now()
      The
      .then (resolve) ->
          expect(i).to.be.equal 0, 'then0'
          setTimeout ->
            expect(++i).to.be.equal 1, 'then0+'
            resolve()
          , 100
      .then (resolve) ->
          expect(i).to.be.equal 1, 'then1'
          expect(now() - time).to.be.above 100
          setTimeout ->
            expect(++i).to.be.equal 2, 'then1+'
            resolve()
          , 100
      .then (resolve) ->
          expect(i).to.be.equal 2, 'then2'
          expect(now() - time).to.be.above 200
          setTimeout ->
            expect(++i).to.be.equal 3, 'then2+'
            resolve()
          , 100
      .then ->
          expect(++i).to.be.equal 4, 'then4'
          expect(now() - time).to.be.above 300
          done()
      expect(++i).to.be.equal 0, 'outer'

    it "should run parallely and asynchronously when the argument is array of function and they have 'done' argument", (done) ->
      i = -1
      time = now()
      The
      .then([
          (resolve) ->
            expect(i).to.be.equal 0
            setTimeout ->
              expect(++i).to.be.equal 3, 'then3'
              resolve()
            , 300
        , (resolve) ->
            expect(i).to.be.equal 0
            setTimeout ->
              expect(++i).to.be.equal 1, 'then1'
              resolve()
            , 100
        , (resolve) ->
            expect(i).to.be.equal 0
            setTimeout ->
              expect(++i).to.be.equal 2, 'then2'
              resolve()
            , 200
        ])
      .then ->
          expect(++i).to.be.equal 4, 'then4'
          expect(now() - time).to.be.above 300
          done()
      expect(++i).to.be.equal 0, 'outer'

    it "should accept parallel actors which is generated in iterator", (done) ->
      i = -1
      time = now()
      actors = []
      for j in [1..3]
        do (j) ->
          actors.push (resolve) ->
            expect(i).to.be.equal 0
            setTimeout ->
              expect(++i).to.be.equal j
              resolve()
            , 100 * j
      actors = actors.reverse()
      The
      .then(actors)
      .then ->
          expect(++i).to.be.equal 4, 'then4'
          expect(now() - time).to.be.above 300
          done()
      expect(++i).to.be.equal 0, 'outer'

    it "should run nested flow when argument is `The` instance", (done) ->
      i = -1
      time = now()
      The
      .then(The.wait 100)
      .then ->
          expect(++i).to.be.equal 1, 'then1'
          expect(now() - time).to.be.above 100
          done()
      expect(++i).to.be.equal 0, 'outer'

    it "should run nested flow when `The` instance returned by actor", (done) ->
      i = -1
      time = now()
      The
      .wait(100)
      .then ->
          expect(now() - time).to.be.above 100
          The
          .wait(100)
          .then ->
              expect(now() - time).to.be.above 200
          .wait(100)
      .then ->
          expect(++i).to.be.equal 1, 'then1'
          expect(now() - time).to.be.above 300
          done()
      expect(++i).to.be.equal 0, 'outer'

    it "should pass parameters to next runner", (done) ->
      The
      .then (resolve) ->
          resolve 'a', 'b'
      .then (res, resolve) ->
          expect(res[0]).to.be.equal 'a'
          expect(res[1]).to.be.equal 'b'

          setTimeout ->
            resolve 'c', 'd'
          , 10
      .then([
          (res, resolve) ->
            expect(res[0]).to.be.equal 'c'
            expect(res[1]).to.be.equal 'd'
            setTimeout ->
              resolve 'e', 'f'
            , 20
        , (res, resolve) ->
            expect(res[0]).to.be.equal 'c'
            expect(res[1]).to.be.equal 'd'
            resolve 'g', 'h'
        , (res, resolve) ->
            expect(res[0]).to.be.equal 'c'
            expect(res[1]).to.be.equal 'd'
            setTimeout ->
              resolve 'i', 'j'
            , 10
        ])
      .then ([res0, res1, res2], resolve) ->
          expect(res0[0]).to.be.equal 'e'
          expect(res0[1]).to.be.equal 'f'
          expect(res1[0]).to.be.equal 'g'
          expect(res1[1]).to.be.equal 'h'
          expect(res2[0]).to.be.equal 'i'
          expect(res2[1]).to.be.equal 'j'

          setTimeout ->
            resolve 'k', 'l'
          , 10
      .then (res) ->
          expect(res[0]).to.be.equal 'k'
          expect(res[1]).to.be.equal 'l'

          The
          .then([
              (resolve) ->
                setTimeout ->
                  resolve 'm', 'n'
                , 20
            , (resolve) ->
                setTimeout ->
                  resolve 'o', 'p'
                , 10
            , (resolve) ->
                resolve 'q', 'r'
            ])
      .then ([ res0, res1, res2 ]) ->
          expect(res0[0]).to.be.equal 'm'
          expect(res0[1]).to.be.equal 'n'
          expect(res1[0]).to.be.equal 'o'
          expect(res1[1]).to.be.equal 'p'
          expect(res2[0]).to.be.equal 'q'
          expect(res2[1]).to.be.equal 'r'
          The
          .then([ (
                    The.then (resolve) ->
                      resolve 's', 't'
                  ), (
                    The.then (resolve) ->
                      setTimeout ->
                        resolve 'u', 'v'
                      , 10
                  ), (
                    The.then (resolve) ->
                      resolve 'x', 'y'
                  ) ])
      .then ([ res0, res1, res2 ]) ->
          expect(res0[0]).to.be.equal 's'
          expect(res0[1]).to.be.equal 't'
          expect(res1[0]).to.be.equal 'u'
          expect(res1[1]).to.be.equal 'v'
          expect(res2[0]).to.be.equal 'x'
          expect(res2[1]).to.be.equal 'y'

          The
          .then([
              ->
                The.then (resolve) ->
                  setTimeout ->
                    resolve 'z', 'A'
                  , 10
            , ->
                The.then (resolve) ->
                  resolve 'B', 'C'
            , ->
                The.then (resolve) ->
                  setTimeout ->
                    resolve 'D', 'E'
                  , 20
            ])
      .then ([ res0, res1, res2 ]) ->
          expect(res0[0]).to.be.equal 'z'
          expect(res0[1]).to.be.equal 'A'
          expect(res1[0]).to.be.equal 'B'
          expect(res1[1]).to.be.equal 'C'
          expect(res2[0]).to.be.equal 'D'
          expect(res2[1]).to.be.equal 'E'
          done()

  describe '#wait()', ->
    it "should defer next task", ->
      i = -1
      time = now()
      The
      .then ->
          expect(++i).to.be.equal 1
      .wait(100)
      .then ->
          expect(++i).to.be.equal 2
          expect(now() - time).to.be.above 100
      expect(++i).to.be.equal 0

  describe '#pause()', ->
    it "should pause the flow", (done) ->
      the = The
      .then (resolve) ->
          setTimeout resolve, 200
      .then ->
          expect().fail()
      setTimeout ->
        expect(the.index).to.be.equal 0
        the.pause()
        expect(the.index).to.be.equal -1
      , 100
      setTimeout ->
        expect(the.index).to.be.equal -1
        done()
      , 300

    it "should call canceller", (done) ->
      the = The
      .then (resolve) ->
          timeoutId = setTimeout ->
            expect().fail()
            resolve()
          , 200
          ->
            clearTimeout timeoutId
      setTimeout ->
        the.pause()
      , 100
      setTimeout ->
        done()
      , 300

  describe '#stop()', ->
    it "should pause and reset the flow", (done) ->
      the = The
      .then (resolve) ->
          setTimeout resolve, 200
      .then ->
          expect().fail()
      setTimeout ->
        the.stop()
      , 100
      setTimeout ->
        expect(the.index).to.be.equal -1
        done()
      , 300

  describe '#resume()', ->
    it "should resume paused flow", (done) ->
      i = -1
      time = now()
      the = The
      .then (resolve) ->
          expect(++i).to.be.equal 1
          expect(the.index).to.be.equal 0
          timeoutId = setTimeout ->
            expect(the.index).to.be.equal 0
            resolve()
          , 200
          ->
            expect(--i).to.be.equal 0
            clearTimeout timeoutId
      .then ->
          expect(++i).to.be.equal 2
          expect(the.index).to.be.equal 1
          expect(now() - time).to.be.above 500
          done()
      setTimeout ->
        expect(i).to.be.equal 1
        the.pause()
        expect(i).to.be.equal 0
      , 100
      setTimeout ->
        expect(i).to.be.equal 0
        expect(the.index).to.be.equal -1
        the.resume()
      , 300
      expect(++i).to.be.equal 0

  describe '#fail()', ->
    it "should be skipped when no error is thrown", (done) ->
      i = 0
      error = new Error 'exception'
      The
      .then ->
          expect(++i).to.be.equal 1
      .then (resolve) ->
          expect(++i).to.be.equal 2
          if false
            throw error
          else
            resolve 'a'
      .then ([a], resolve) ->
          expect(++i).to.be.equal 3
          expect(a).to.be.equal 'a'
          resolve 'b'
      .fail ->
          ++i
          expect().fail()
      .then ([b]) ->
          expect(++i).to.be.equal 4
          expect(b).to.be.equal 'b'
          done()

    it "should be skipped when reject isn't called", (done) ->
      i = 0
      error = 'exception'
      The
      .then ->
          expect(++i).to.be.equal 1
      .then (resolve, reject) ->
          expect(++i).to.be.equal 2
          if false
            reject error
          else
            resolve 'a'
      .then ([a], resolve) ->
          expect(++i).to.be.equal 3
          expect(a).to.be.equal 'a'
          resolve 'b'
      .fail ->
          ++i
          expect().fail()
      .then ([b]) ->
          expect(++i).to.be.equal 4
          expect(b).to.be.equal 'b'
          done()

    it "should run when an error is thrown", (done) ->
      i = 0
      error = new Error 'exception'
      The
      .then ->
          expect(++i).to.be.equal 1
      .then (resolve) ->
          expect(++i).to.be.equal 2
          if true
            throw error
          else
            resolve 'a'
      .then ([a], resolve) ->
          ++i
          expect().fail()
          resolve 'b'
      .fail (err) ->
          expect(err).to.be.equal error
          done()
      .then ([b]) ->
          ++i
          expect().fail()
          done()

    it "should run when reject is called", (done) ->
      i = 0
      error = 'exception'
      The
      .then ->
          expect(++i).to.be.equal 1
      .then (resolve, reject) ->
          expect(++i).to.be.equal 2
          if true
            reject error
          else
            resolve 'a'
      .then ([a], resolve) ->
          ++i
          expect().fail()
          resolve 'b'
      .fail (err) ->
          expect(err).to.be.equal error
          done()
      .then ([b]) ->
          ++i
          expect().fail()
          done()

    it "should run when a object is thrown", (done) ->
      i = 0
      error = {}
      The
      .then ->
          expect(++i).to.be.equal 1
      .then (resolve) ->
          expect(++i).to.be.equal 2
          if true
            throw error
          else
            resolve 'a'
      .then ([a], resolve) ->
          ++i
          expect().fail()
          resolve 'b'
      .fail (err) ->
          expect(err).to.be.equal error
          done()
      .then ([b]) ->
          ++i
          expect().fail()
          done()

    it "should be skipped when an error is thrown asynchronously", (done) ->
      i = 0
      error = new Error 'exception'
      The
      .then ->
          expect(++i).to.be.equal 1
      .then (resolve) ->
          expect(++i).to.be.equal 2
          setTimeout ->
            if false
              throw error
            else
              resolve 'a'
          , 100
      .then ([a], resolve) ->
          expect(++i).to.be.equal 3
          expect(a).to.be.equal 'a'
          resolve 'b'
      .fail ->
          ++i
          expect().fail()
      .then ([b]) ->
          expect(++i).to.be.equal 4
          expect(b).to.be.equal 'b'
          done()

    it "should run when reject is called asynchronously", (done) ->
      i = 0
      error = 'exception'
      The
      .then ->
          expect(++i).to.be.equal 1
      .then (resolve, reject) ->
          expect(++i).to.be.equal 2
          setTimeout ->
            if true
              reject error
            else
              resolve 'a'
          , 100
      .then ([a], resolve) ->
          ++i
          expect().fail()
          resolve 'b'
      .fail (err) ->
          expect(err).to.be.equal error
          done()
      .then ([b]) ->
          ++i
          expect().fail()
          done()

    it "should run when an error is thrown in parallel actors", (done) ->
      i = -1
      error = new Error 'exception'
      The
      .then([
          ->
            throw error
        , ->
            ''
        ])
      .fail (err) ->
          expect(++i).to.be.equal 0
          expect(err).to.be.equal error
          done()

    it "should run when reject is called asynchronously in parallel actors", (done) ->
      i = -1
      error = 'exception'
      The
      .then([
          (resolve, reject) ->
            setTimeout ->
              if true
                reject error
              else
                resolve 'a'
            , 100
        , (resolve) ->
            setTimeout ->
              resolve()
            , 200
        ])
      .fail (err) ->
          expect(++i).to.be.equal 0
          expect(err).to.be.equal error

      setTimeout done, 300

    it "should recover the flow when resolve is called in fail runner", (done) ->
      The
      .then ->
          throw new Error 'a'
          expect().fail()
      .fail (err, resolve) ->
          if true
            resolve 'b'
          else
            expect().fail()
      .then ([b]) ->
          expect(b).to.be.equal 'b'
          done()

    it "should recover the flow when resolve is called in fail runner asynchronously", (done) ->
      The
      .then ->
          throw new Error 'a'
          expect().fail()
      .fail (err, resolve) ->
          setTimeout ->
            if true
              resolve 'b'
            else
              expect().fail()
          , 100
      .then ([b]) ->
          expect(b).to.be.equal 'b'
          done()

    it "should step to the next fail when reject is called in fail runner", (done) ->
      error = new Error 'a'
      The
      .then ->
          throw error
          expect().fail()
      .fail (err, reject) ->
          if false
            expect().fail()
          else
            reject err
      .then ->
          expect().fail()
      .fail (err, resolve) ->
          expect(err).to.be.equal error
          resolve 'b'
      .then ([b]) ->
          expect(b).to.be.equal b
          done()

    it "should step to the next fail when reject is called in fail runner asynchronously", (done) ->
      error = new Error 'a'
      The
      .then ->
          throw error
          expect().fail()
      .fail (err, reject) ->
          if false
            expect().fail()
          else
            reject err
      .then ->
          expect().fail()
      .fail (err, resolve) ->
          expect(err).to.be.equal error
          resolve 'b'
      .then ([b]) ->
          expect(b).to.be.equal b
          done()
