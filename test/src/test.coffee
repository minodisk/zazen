now = ->
  new Date().getTime()

describe 'The', ->
  describe '.then()', ->
    it 'should be implemented', ->
      expect(The.then).to.be.a 'function'

    it 'should construct The and add task with Then#then()', ->
      expect(The.then()).to.be.a The

  describe '.wait()', ->
    it 'should be implemented', ->
      expect(The.wait).to.be.a 'function'

    it 'should construct The and add task with Then#wait()', ->
      i = -1
      time = now()
      The
      .wait(100)
      .then ->
          expect(++i).to.be.equal 1
          expect(now() - time).to.be.above 100
      expect(++i).to.be.equal 0

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

    it 'should accept parallel actors as array', (done) ->
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

  describe '#context', ->
    it 'should be maintained in runner', (done) ->
      context =
        i: -1
      The(context)
      .then (done) ->
          expect(@).to.be.equal context
          expect(@i).to.be.equal 0
          setTimeout =>
            expect(@).to.be.equal context
            expect((++@i)).to.be.equal 1
            done()
          , 100
      .then ->
          expect(@).to.be.equal context
          expect((++@i)).to.be.equal 2
          done()
      expect((++context.i)).to.be.equal 0

    it 'should be a class instance', (done) ->
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
