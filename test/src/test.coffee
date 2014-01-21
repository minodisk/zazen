now = ->
  new Date().getTime()

describe 'zazen tests', ->
  describe 'The', ->
    describe '.then()', ->
      it 'should be implemented', ->
        expect(The.then).to.be.a 'function'

      it 'should be a shorthand as `new The().then()`', ->
        expect(The.then()).to.be.a The

    describe '.wait()', ->
      it 'should be implemented', ->
        expect(The.wait).to.be.a 'function'

      it 'should be a shorthand as `new The().wait()`', ->
        i = -1
        time = now()
        The
        .wait(100)
        .then ->
            expect(++i).to.be.equal 1
            expect(now() - time).to.be.above 100
        expect(++i).to.be.equal 0

    describe '#context', ->
      it 'should be the context in all runner', (done) ->
        context =
          i: -1
        The(context)
        .then (done) ->
            expect(@).to.be.equal context
            expect(@i).to.be.equal 0
            setTimeout =>
              expect(@).to.be.equal context
              expect(++@i).to.be.equal 1
              done()
            , 100
        .then ->
            expect(@).to.be.equal context
            expect(++@i).to.be.equal 2
            done()
        expect(++context.i).to.be.equal 0

      it 'should be available with a class instance', (done) ->
        class Foo
          constructor: ->
            @x = 0

          start: (callback) ->
            The(@)
            .then (done) ->
                expect(@x).to.be.equal 0
                intervalId = setInterval =>
                  if ++@x >= 10
                    clearInterval intervalId
                    done()
                , 33
            .then callback

        foo = new Foo()
        foo.start ->
          expect(@).to.be.equal foo
          expect(foo.x).to.be.equal 10
          done()

    describe '#constructor()', ->
      it 'should create The instance', ->
        expect(new The()).to.be.a The

      it 'should create The instance without new operator', ->
        expect(The()).to.be.a The

    describe '#then()', ->
      it 'should be implemented', ->
        expect(The::then).to.be.a 'function'
        expect(new The().then).to.be.a 'function'
        expect(The().then).to.be.a 'function'

      it 'should be chainable', (done) ->
        The
        .then(->)
        .then(->)
        .then ->
            done()

      it 'should run serially', (done) ->
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

      it 'should run parallely', (done) ->
        i = -1
        The
        .then ->
            expect(++i).to.be.within 1, 3
          , ->
            expect(++i).to.be.within 1, 3
          , ->
            expect(++i).to.be.within 1, 3
        .then ->
            expect(++i).to.be.equal 4, 'then4'
            done()
        expect(++i).to.be.equal 0, 'outer'

      it 'should run serially with async runners', (done) ->
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

      it 'should run parallely with async runners', (done) ->
        i = -1
        time = now()
        The
        .then (done) ->
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
        .then ->
            expect(++i).to.be.equal 4, 'then4'
            expect(now() - time).to.be.above 300
            done()
        expect(++i).to.be.equal 0, 'outer'

      it 'should accept parallel actors as an array', (done) ->
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

      it 'should accept The instance', (done) ->
        i = -1
        time = now()
        The
        .then(The.wait 100)
        .then ->
            expect(++i).to.be.equal 1, 'then1'
            expect(now() - time).to.be.above 100
            done()
        expect(++i).to.be.equal 0, 'outer'

      it 'should accept The instance returned by runner', (done) ->
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

      it 'should pass parameters to next runner', (done) ->
        The
        .then (done) ->
            done 1
        .then (done) ->
            expect(a).to.be.equal 1
            setTimeout ->
              done 'b'
            , 100
        .then (b) ->
            expect(b).to.be.equal 'b'
            done()

    describe '#wait()', ->
      it 'should be implemented', ->
        expect(The::wait).to.be.a 'function'
        expect(new The().wait).to.be.a 'function'
        expect(The().wait).to.be.a 'function'

      it 'should defer next task', ->
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
      it 'should be implemented', ->
        expect(The::pause).to.be.a 'function'
        expect(new The().pause).to.be.a 'function'
        expect(The().pause).to.be.a 'function'

      it 'should pause the flow', (done) ->
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

      it 'should call canceller', (done) ->
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
      it 'should be implemented', ->
        expect(The::stop).to.be.a 'function'
        expect(new The().stop).to.be.a 'function'
        expect(The().stop).to.be.a 'function'

      it 'should pause and reset the flow', (done) ->
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
      it 'should be implemented', ->
        expect(The::resume).to.be.a 'function'
        expect(new The().resume).to.be.a 'function'
        expect(The().resume).to.be.a 'function'

      it 'should resume paused flow', (done) ->
        i = -1
        The.verbose = true
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
