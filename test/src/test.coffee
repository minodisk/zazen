now = ->
  new Date().getTime()

describe 'The', ->
  describe '.then()', ->
    it "should be a shorthand for `new The().then()`", ->
      expect(The.then(->)).to.be.a The

  describe '.wait()', ->
    it "should be a shorthand for `new The().wait()`", ->
      i = -1
      time = now()
      The
      .wait(100)
      .then ->
          expect(++i).to.be.equal 1
          expect(now() - time).to.be.above 100
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
          .then (done) ->
              expect(@x).to.be.equal 0
              intervalId = setInterval =>
                if ++@x >= 10
                  clearInterval intervalId
                  done()
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
      .then (done) ->
          expect(i).to.be.equal 0, 'then0'
          setTimeout ->
            expect(++i).to.be.equal 1, 'then0+'
            done()
          , 100
      .then (done) ->
          expect(i).to.be.equal 1, 'then1'
          expect(now() - time).to.be.above 100
          setTimeout ->
            expect(++i).to.be.equal 2, 'then1+'
            done()
          , 100
      .then (done) ->
          expect(i).to.be.equal 2, 'then2'
          expect(now() - time).to.be.above 200
          setTimeout ->
            expect(++i).to.be.equal 3, 'then2+'
            done()
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
          (done) ->
            expect(i).to.be.equal 0
            setTimeout ->
              expect(++i).to.be.equal 3, 'then3'
              done()
            , 300
        , (done) ->
            expect(i).to.be.equal 0
            setTimeout ->
              expect(++i).to.be.equal 1, 'then1'
              done()
            , 100
        , (done) ->
            expect(i).to.be.equal 0
            setTimeout ->
              expect(++i).to.be.equal 2, 'then2'
              done()
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
          actors.push (done) ->
            expect(i).to.be.equal 0
            setTimeout ->
              expect(++i).to.be.equal j
              done()
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
      .then (done) ->
          done 'a', 'b'
      .then (res, done) ->
          expect(res[0]).to.be.equal 'a'
          expect(res[1]).to.be.equal 'b'

          setTimeout ->
            done 'c', 'd'
          , 10
      .then([
          (res, done) ->
            expect(res[0]).to.be.equal 'c'
            expect(res[1]).to.be.equal 'd'
            setTimeout ->
              done 'e', 'f'
            , 20
        , (res, done) ->
            expect(res[0]).to.be.equal 'c'
            expect(res[1]).to.be.equal 'd'
            done 'g', 'h'
        , (res, done) ->
            expect(res[0]).to.be.equal 'c'
            expect(res[1]).to.be.equal 'd'
            setTimeout ->
              done 'i', 'j'
            , 10
        ])
      .then ([res0, res1, res2], done) ->
          expect(res0[0]).to.be.equal 'e'
          expect(res0[1]).to.be.equal 'f'
          expect(res1[0]).to.be.equal 'g'
          expect(res1[1]).to.be.equal 'h'
          expect(res2[0]).to.be.equal 'i'
          expect(res2[1]).to.be.equal 'j'

          setTimeout ->
            done 'k', 'l'
          , 10
      .then (res) ->
          expect(res[0]).to.be.equal 'k'
          expect(res[1]).to.be.equal 'l'

          The
          .then([
              (done) ->
                setTimeout ->
                  done 'm', 'n'
                , 20
            , (done) ->
                setTimeout ->
                  done 'o', 'p'
                , 10
            , (done) ->
                done 'q', 'r'
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
                    The.then (done) ->
                      done 's', 't'
                  ), (
                    The.then (done) ->
                      setTimeout ->
                        done 'u', 'v'
                      , 10
                  ), (
                    The.then (done) ->
                      done 'x', 'y'
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
                The.then (done) ->
                  setTimeout ->
                    done 'z', 'A'
                  , 10
            , ->
                The.then (done) ->
                  done 'B', 'C'
            , ->
                The.then (done) ->
                  setTimeout ->
                    done 'D', 'E'
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
      .then (done) ->
          setTimeout done, 200
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
      .then (done) ->
          timeoutId = setTimeout ->
            expect().fail()
            done()
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
      .then (done) ->
          setTimeout done, 200
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
      .then (done) ->
          expect(++i).to.be.equal 1
          expect(the.index).to.be.equal 0
          timeoutId = setTimeout ->
            expect(the.index).to.be.equal 0
            done()
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
      The
      .then (done) ->
          done 'a'
      .fail ->
          expect().fail()
      .then ([a]) ->
          expect(a).to.be.equal 'a'
          done()

    it "should be stop the flow when error is thrown", (done) ->
      The
      .then ->
          throw new Error ''
          expect().fail(0)
      .then ->
          expect().fail(1)
      .fail ->
          ''
      .then ->
          expect().fail(3)
      setTimeout done, 300

    it "should run when catch error thrown", (done) ->
      i = -1
      error = new Error 'a'
      The
      .then ->
          throw error
      .fail (err) ->
          expect(++i).to.be.equal 0
          expect(err).to.be.equal error
          done()

    it "should run when catch object thrown", (done) ->
      i = -1
      obj = {}
      The
      .then ->
          throw obj
          expect().fail()
      .fail (err) ->
          expect(++i).to.be.equal 0
          expect(err).to.be.equal obj
          done()

    it "should run when catch error thrown in async actor", (done) ->
      i = -1
      The
      .then (done) ->
          done 'async1'
      .then (message, done) ->
          throw new Error message
          setTimeout ->
            expect().fail()
            done()
          , 100
      .fail (err) ->
          expect(++i).to.be.equal 0
          expect(err.message).to.be.equal 'async1'
          done()

    it "should run when catch error in parallel actors", (done) ->
      i = -1
      The
      .then([
          ->
            throw new Error 'a'
        , ->
            throw new Error 'b'
        ])
      .fail (err) ->
          expect(++i).to.be.equal 0
          expect(err.message).to.be.equal 'a'
          done()

    it "should run when catch error in async parallel actors", (done) ->
      i = -1
      The
      .then([
          (done) ->
            throw new Error 'a'
            setTimeout ->
              expect().fail()
              done()
            , 100
        , (done) ->
            throw new Error 'b'
            setTimeout ->
              expect().fail()
              done()
            , 100
        ])
      .fail (err) ->
          expect(++i).to.be.equal 0
          expect(err.message).to.be.equal 'a'
          done()

    it "should be able to recover the flow when done is called", (done) ->
      The
      .then ->
          throw new Error 'a'
          expect().fail()
      .fail (err, done) ->
          if err.message is 'a'
            done 'b'
          else
            expect().fail()
      .then ([b]) ->
          expect(b).to.be.equal 'b'
          done()