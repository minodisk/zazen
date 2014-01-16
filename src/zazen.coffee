do (exports = if typeof exports is 'undefined' then @ else exports) ->
  toString = Object::toString
  slice = Array::slice
  isArray = Array.isArray or (obj) ->
    toString.call(obj) is '[object Array]'
  isFunction = if typeof (/./) isnt 'function'
    (obj) ->
      typeof obj is 'function'
  else
    (obj) ->
      toString.call(obj) is '[object Function]'
  createId = do ->
    seeds = []
    for str in ['0-9', 'a-z', 'A-Z']
      charCodes = str.split '-'
      for char, i in charCodes
        charCodes[i] = char.charCodeAt 0
      for charCode in [charCodes[0]..charCodes[1]] by 1
        seeds.push String.fromCharCode charCode
    length = seeds.length
    (len = 12) ->
      hash = ''
      while len-- > 0
        hash += seeds[length * Math.random() >> 0]
      hash


  class The

    @verbose: false

    @then: ->
      The::then.apply new The(), arguments

    @wait: ->
      The::wait.apply new The(), arguments

    constructor: (context) ->
      unless @ instanceof The
        return new The context

      @id = createId()
      @context = context
      @tasks = []
      @index = -1
      @isRunning = false

    then: (actors) ->
      unless isArray actors
        actors = slice.call arguments, 0
      @tasks.push new Task actors, @context
      @resume()
      @

    wait: (duration) ->
      #TODO Remove [] operator; I write [] for the bug of IntelliJ IDEA (http://youtrack.jetbrains.com/issue/WEB-10349)
      @['then'] (done) ->
        setTimeout done, duration

    resume: ->
      return if @isRunning
      @isRunning = true

      @next()
      @

    next: =>
      return unless @isRunning
      index = @index + 1
      return if index < 0 or index >= @tasks.length
      @index = index

      if The.verbose then console.log "#{@.toStateString()}#next()"
      task = @tasks[@index]
      task.run @next

    pause: ->
      return unless @isRunning
      @isRunning = false

      if The.verbose then console.log "#{@.toStateString()}#pause()"
      task = @tasks[@index]
      task.cancel()
      @

    stop: ->
      if The.verbose then console.log "#{@.toStateString()}#stop()"
      @pause()
      @index = -1
      @

    toStateString: ->
      """The{ id: #{@id}, index: #{@index}, isRunning: #{@isRunning} }"""

  class Task

    constructor: (actors, context) ->
      @id = createId()
      @actors = []
      for actor, i in actors
        @actors[i] = createActor actor, null, context

    run: (next) ->
      doneFlags = []
      for actor, i in @actors
        doneFlags[i] = false
        do (i) ->
          actor.run ->
            doneFlags[i] = true
            isDone = true
            isDone and= doneFlag for doneFlag in doneFlags
            if isDone
              next()

    cancel: ->
      for actor in @actors
        actor.cancel()

    toStateString: ->
      """Task{ id: #{@id} }"""

  createActor = do ->
    class Actor

      constructor: (@runner, @canceller, @context) ->
        @id = createId()

      run: (next) ->
        if The.verbose then console.log "#{@toStateString()}#run"
        @runner ->
          next()

      cancel: ->
        return unless @canceller?
        @canceller.call @context

      toStateString: ->
        """Actor{ id: #{@id} }"""

    class TheActor extends Actor

      constructor: (the) ->
        the.stop()
        super the

      run: (next) ->
        @runner.then next

      cancel: ->
        @runner.pause()

    class SyncActor extends Actor

      constructor: (runner, canceller, context) ->
        timeoutId = null
        super (done) ->
          timeoutId = setTimeout ->
            returns = runner.call context
            if returns instanceof The
              new TheActor(returns).run done
            else
              done()
          , 0
        , ->
          clearTimeout timeoutId
          timeoutId = null
          canceller?()
        , context

    class AsyncActor extends Actor

      constructor: (runner, canceller, context) ->
        timeoutId = null
        super (done) ->
          timeoutId = setTimeout ->
            runner.call context, done
          , 0
        , ->
          clearTimeout timeoutId
          timeoutId = null
          canceller?()
        , context

    (runner, canceller, context) ->
      if runner instanceof Actor
        runner
      else if runner instanceof The
        new TheActor runner, canceller, context
      else if isFunction runner
        if runner.length is 0
          new SyncActor runner, canceller, context
        else
          new AsyncActor runner, canceller, context
      else
        throw new TypeError "runner must be specified as `The` instance or `function`"

  exports.The = The
