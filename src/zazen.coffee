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
  defer = (callback) ->
    setTimeout callback, 0


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

      @_next()
      @

    pause: ->
      return unless @isRunning
      @isRunning = false

      if The.verbose then console.log "#{@toStateString()}#pause()"
      task = @tasks[@index]
      task.cancel()
      @

    stop: ->
      if The.verbose then console.log "#{@toStateString()}#stop()"
      @pause()
      @index = -1
      @

    toStateString: ->
      """The{ id: #{@id}, index: #{@index}, isRunning: #{@isRunning} }"""

    _next: =>
      return unless @isRunning
      index = @index + 1
      return if index < 0 or index >= @tasks.length
      @index = index

      if The.verbose then console.log "#{@toStateString()}#_next()"
      task = @tasks[@index]
      task.run @_next

  class Task

    constructor: (actors, context) ->
      @id = createId()
      @actors = []
      for actor, i in actors
        @actors[i] = createActor actor, null, context

    run: (done) ->
      doneFlags = []
      for actor, i in @actors
        doneFlags[i] = false
        do (i) ->
          actor.run ->
            doneFlags[i] = true
            isDone = true
            isDone and= doneFlag for doneFlag in doneFlags
            if isDone
              done()

    cancel: ->
      for actor in @actors
        actor.cancel()

    toStateString: ->
      """Task{ id: #{@id} }"""

  createActor = do ->
    class Actor

      name: 'Actor'

      constructor: (@runner, @canceller, @context) ->
        @id = createId()

      run: (done) ->
        if The.verbose then console.log "#{@toStateString()}#run"
        @runner ->
          done()

      cancel: ->
        if @timeoutId?
          clearTimeout @timeoutId
          @timeoutId = null
        if isFunction @canceller
          @canceller.call @context

      toStateString: ->
        """#{@name}{ id: #{@id} }"""

    class SyncActor extends Actor

      name: 'SyncActor'

      constructor: (runner, canceller, context) ->
        super (done) =>
          @timeoutId = defer ->
            returns = runner.call context
            if returns instanceof The
              new TheActor(returns).run done
            else
              done()
        , null
        , context

    class AsyncActor extends Actor

      name: 'AsyncActor'

      constructor: (runner, canceller, context) ->
        super (done) =>
          @timeoutId = defer =>
            @canceller = runner.call context, done
        , null
        , context

    class TheActor extends Actor

      name: 'TheActor'

      constructor: (the) ->
        the.stop()
        super the

      run: (done) ->
        @runner.then done

      cancel: ->
        @runner.pause()

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
