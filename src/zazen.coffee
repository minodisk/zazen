do (exports = if typeof exports is 'undefined' then @ else exports) ->
  toString = Object::toString
  slice = Array::slice
  isArray = Array.isArray or (obj) ->
    toString.call(obj) is '[object Array]'

  class The

    @verbose: false

    @then: ->
      The::then.apply new The(), arguments

    constructor: (context) ->
      unless @ instanceof The
        return new The context

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

    resume: ->
      return if @isRunning
      @isRunning = true

      @next()
      @

    next: =>
      if The.verbose then console.log 'The#next this =', @
      index = @index + 1
      return if index < 0 or index >= @tasks.length
      @index = index
      task = @tasks[@index]
      if The.verbose then console.log '  ', @index, task
      task.run @next

    pause: ->
      return unless @isRunning
      @isRunning = false

      task = @tasks[@index]
      task.cancel()
      @

  class Task

    constructor: (actors, context) ->
      @actors = []
      for actor, i in actors
        @actors[i] = if actor instanceof Actor then actor else new Actor actor, null, context

    run: (next) ->
      doneFlags = []
      for actor, i in @actors
        doneFlags[i] = false
        do (i) ->
          actor.run ->
            doneFlags[i] = true
            isDone = true
            isDone and= doneFlag for doneFlag in doneFlags
            if The.verbose then console.log 'Task#done isDone =', isDone
            if isDone
              next()

  class Actor

    constructor: (runner, @canceller, context) ->
      if runner.length is 0
        @runner = (done) ->
          setTimeout ->
            runner.call context
            done()
          , 0
      else
        @runner = (done) ->
          setTimeout ->
            runner.call context, done
          , 0

    run: (next) ->
      @runner ->
        if The.verbose then console.log 'Actor#done next =', next
        next()

    cancel: ->
      @canceller?()

  exports.The = The
