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
      i = 0
      The()
      .then ->
          (++i).should.be.equal 1
      .then ->
          (++i).should.be.equal 2
      .then ->
          (++i).should.be.equal 3
          done()
      i.should.be.equal 0

    it 'should run parallely', (done) ->
      i = 0
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
      i.should.be.equal 0

    it 'should run serially with async runners', (done) ->
      i = 0
      console.log '-----'
      time = now()
      The()
      .then (done) ->
          i.should.be.equal 0, 'A'
          setTimeout ->
            (++i).should.be.equal 1, 'B'
            done()
          , 100
      .then (done) ->
          console.log now() - time, i
          i.should.be.equal 1, 'C'
          setTimeout ->
            (++i).should.be.equal 2, 'D'
            done()
          , 100
      .then (done) ->
          i.should.be.equal 2, 'E'
          setTimeout ->
            (++i).should.be.equal 3, 'F'
            done()
          , 100
      .then ->
          i.should.be.equal 3
          done()
      console.log 'outer:', i
      i.should.be.equal 0

    it 'should run parallely with async runners', (done) ->
      i = 0
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
          i.should.be.equal 3
          done()
      i.should.be.equal 0
