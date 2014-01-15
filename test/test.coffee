should = chai.should()

now = -> new Date().getTime()

describe 'The', ->
  describe 'constructor', ->
    it 'should construct the instance', ->
      new The().should.be.instanceof The

    it 'should construct without new operator', ->
      The().should.be.instanceof The

  describe 'then', ->
    it 'should be implemented', ->
      should.exist The::then
      should.exist The().then

    it 'should be chainable', (done) ->
      The()
      .then(->)
      .then(->)
      .then ->
          done()

    it 'should run serially', (done) ->
      i = -1
      The()
      .then ->
          (++i).should.be.equal 1
      .then ->
          (++i).should.be.equal 2
      .then ->
          (++i).should.be.equal 3
          done()
      (++i).should.be.equal 0, 'outer'

    it 'should run parallely', (done) ->
      i = -1
      The()
      .then ->
          (++i).should.be.within 1, 3
        , ->
          (++i).should.be.within 1, 3
        , ->
          (++i).should.be.within 1, 3
      .then ->
          (++i).should.be.equal 4, 'then4'
          done()
      (++i).should.be.equal 0, 'outer'

    it 'should run serially with async runners', (done) ->
      i = -1
      time = now()
      The()
      .then (done) ->
          i.should.be.equal 0, 'then0'
          setTimeout ->
            (++i).should.be.equal 1, 'then0+'
            done()
          , 100
      .then (done) ->
          i.should.be.equal 1, 'then1'
          (now() - time).should.be.closeTo 100, 50
          setTimeout ->
            (++i).should.be.equal 2, 'then1+'
            done()
          , 100
      .then (done) ->
          i.should.be.equal 2, 'then2'
          (now() - time).should.be.closeTo 200, 50
          setTimeout ->
            (++i).should.be.equal 3, 'then2+'
            done()
          , 100
      .then ->
          (++i).should.be.equal 4, 'then4'
          (now() - time).should.be.closeTo 300, 50
          done()
      (++i).should.be.equal 0, 'outer'

    it 'should run parallely with async runners', (done) ->
      i = -1
      time = now()
      The()
      .then (done) ->
          i.should.be.equal 0
          setTimeout ->
            (++i).should.be.equal 3, 'then3'
            done()
          , 300
        , (done) ->
          i.should.be.equal 0
          setTimeout ->
            (++i).should.be.equal 1, 'then1'
            done()
          , 100
        , (done) ->
          i.should.be.equal 0
          setTimeout ->
            (++i).should.be.equal 2, 'then2'
            done()
          , 200
      .then ->
          (++i).should.be.equal 4, 'then4'
          (now() - time).should.be.closeTo 300, 50
          done()
      (++i).should.be.equal 0, 'outer'

    it 'should accept parallel actors as array', (done) ->
      i = -1
      time = now()
      actors = []
      for j in [1..3]
        do (j) ->
          actors.push (done) ->
            i.should.be.equal 0
            setTimeout ->
              (++i).should.be.equal j
              done()
            , 100 * j
      actors = actors.reverse()
      The()
      .then(actors)
      .then ->
          (++i).should.be.equal 4, 'then4'
          (now() - time).should.be.closeTo 300, 50
          done()
      (++i).should.be.equal 0, 'outer'

  describe 'context', ->

    it 'should be maintained in runner', (done) ->
      context =
        i: -1
      The(context)
      .then (done) ->
          @should.be.equal context
          @i.should.be.equal 0
          setTimeout =>
            @should.be.equal context
            (++@i).should.be.equal 1
            done()
          , 100
      .then ->
          @should.be.equal context
          (++@i).should.be.equal 2
          done()
      (++context.i).should.be.equal 0

    it 'should be a class instance', (done) ->
      class Foo
        constructor: ->
          @x = 0

        start: (callback) ->
          The(@)
          .then (done) ->
              @x.should.be.equal 0
              intervalId = setInterval =>
                if ++@x >= 10
                  clearInterval intervalId
                  done()
              , 33
          .then callback

      foo = new Foo()
      foo.start ->
        @should.be.equal foo
        foo.x.should.be.equal 10
        done()
