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
      .then ->
          ''
      .then ->
          ''
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
          i.should.be.equal 3
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
          i.should.be.equal 3, 'then3'
          (now() - time).should.be.closeTo 300, 50
          done()
      (++i).should.be.equal 0, 'outer'

    it 'should run parallely with async runners', (done) ->
      i = -1
      time = now()
      The()
      .then (done) ->
          i.should.be.within 0, 2
          setTimeout ->
            (++i).should.be.within 1, 3
            done()
          , 300
        , (done) ->
          i.should.be.within 0, 2
          setTimeout ->
            (++i).should.be.within 1, 3
            done()
          , 100
        , (done) ->
          i.should.be.within 0, 2
          setTimeout ->
            (++i).should.be.within 1, 3
            done()
          , 200
      .then ->
          i.should.be.equal 3, 'then3'
          (now() - time).should.be.closeTo 300, 50
          done()
      (++i).should.be.equal 0, 'outer'
