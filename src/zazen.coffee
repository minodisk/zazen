do (exports = if typeof exports is 'undefined' then @ else exports) ->

  class The

    constructor: (context) ->
      unless @ instanceof The
        return new The context

      @tasks = []
      @index = -1
      @isRunning = false

    then: (actors...) ->
      @tasks.push new Task actors
      @resume()

    resume: ->
      return if @isRunning
      task = @tasks[++@index]
      task.run @next
      @

    next: ->
      task = @tasks[++@index]
      task.run @next

    pause: ->
      return unless @isRunning
      task = @tasks[@index]
      task.cancel()
      @

  class Task

    constructor: (actors) ->
      @actors = []
      for actor in actors
        @actors.push if actor instanceof Actor then actor else new Actor actor

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

  class Actor

    constructor: (runner, @canceller) ->
      if runner.length is 0
        @runner = (done) ->
          setTimeout runner, 0
      else
        @runner = runner

    run: (next) ->
      @runner ->
        next()

    cancel: ->
      @canceller?()

  exports.The = The
