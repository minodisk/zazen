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
  getArgumentNames = do ->
    rArgument = ///
\(([\s\S]*?)\)
///
    rComment = ///
  //.*$
| /\*[\s\S]*?\*/
| \s
///gm
    (func) ->
      paramStr = func
      .toString()
      .match(rArgument)[1]
      .replace(rComment, '')
      if paramStr is ''
        return []
      paramStr.split ','


  class Klass

    name: 'Klass'

    constructor: ->
      @id = createId()

    toStateString: ->
      """#{@name}{ id: #{@id} }"""

  class The extends Klass

    @verbose: false

    @then: ->
      The::then.apply new The(), arguments

    @wait: ->
      The::wait.apply new The(), arguments

    constructor: (context) ->
      unless @ instanceof The
        return new The context

      super()
      @context = context or @
      @tasks = []
      @index = -1
      @isRunning = false

    then: (actors) ->
      if arguments.length isnt 1
        throw new TypeError 'The#then() requires one parameter: instance of `The`, `Function` or `Array<Function>`'
      @tasks.push createTask actors, @context, @_fail
      @resume()
      @

    fail: (actor) ->
      @tasks.push new FailTask actor, @context, @_fail
      @

    wait: (duration) ->
      #TODO Remove [] operator; I write [] for the bug of IntelliJ IDEA (http://youtrack.jetbrains.com/issue/WEB-10349)
      @['then'] (done) ->
        setTimeout done, duration

    resume: ->
      return if @isRunning
      @isRunning = true

      @_then()
      @

    pause: ->
      return unless @isRunning
      @isRunning = false

      task = @tasks[@index]
      task.cancel()
      @index--
      if @index < -1
        @index = -1
      if The.verbose then console.log "#{@toStateString()}#pause()"
      @

    stop: ->
      if The.verbose then console.log "#{@toStateString()}#stop()"
      @pause()
      @index = -1
      @

    toStateString: ->
      """The{ id: #{@id}, index: #{@index}, isRunning: #{@isRunning} }"""

    _then: (argsList = []) =>
      return unless @isRunning
      index = @index + 1
      return if index < 0 or index >= @tasks.length
      @index = index

      if The.verbose then console.log "#{@toStateString()}#_then()"
      task = @tasks[@index]
      task.run argsList, @_then

    _fail: (actor, err) =>
      index = @index
      @pause()

      if The.verbose then console.log "#{@toStateString()}#_fail()"
      while ++index < @tasks.length
        if (task = @tasks[index]) instanceof FailTask
          @index = index
          task.run err, @_then
          return @
      throw Error 'fail is not found'
      @


  { createTask, FailTask } = do ->
    class Task extends Klass

      name: 'Task'

      constructor: (@actor) ->
        super()

    class SingleTask extends Task

      name: 'SingleTask'

      constructor: (actor, context, fail) ->
        super createActor actor, context, fail

      run: (prevArgsList, done) ->
        @actor.run prevArgsList, (args) ->
          done args

      cancel: ->
        @actor.cancel()

    class MultiTask extends Task

      name: 'MultiTask'

      constructor: (actors, context, fail) ->
        super()
        @actors = []
        for actor, i in actors
          @actors[i] = createActor actor, context, fail

      run: (prevArgsList, done) ->
        argsList = []
        for actor, i in @actors
          argsList[i] = null
          do (i) ->
            actor.run prevArgsList, (args) ->
              argsList[i] = args
              isDone = true
              isDone and= args isnt null for args in argsList
              if isDone
                done argsList

      cancel: ->
        for actor in @actors
          actor.cancel()

    class FailTask extends SingleTask

      name: 'FailTask'

      constructor: (actor, context, fail) ->
        super actor, context, fail

      run: (err, done) ->
        @actor.run err, (args) ->
          done args

    createTask: (actors, context, fail) ->
      if isArray actors
        new MultiTask actors, context, fail
      else
        new SingleTask actors, context, fail
    FailTask: FailTask


  createActor = do ->
    class Actor extends Klass

      name: 'Actor'

      constructor: (@runner, @context) ->
        super()

      run: (prevArgsList, done) ->
        if The.verbose then console.log "#{@toStateString()}#run"
        @runner prevArgsList, (args...) ->
          done args

      cancel: ->
        if @timeoutId?
          clearTimeout @timeoutId
          @timeoutId = null
        if isFunction @canceller
          @canceller.call @context

    class SyncActor extends Actor

      name: 'SyncActor'

      constructor: (runner, context, fail) ->
        super (prevArgsList, done) =>
          @timeoutId = defer =>
            try
              returns = runner.call context, prevArgsList
            catch err
              fail @, err
            if returns instanceof The
              new TheActor(returns).run prevArgsList, (args) ->
                done.apply null, args
            else
              done()
        , context

    class AsyncActor extends Actor

      name: 'AsyncActor'

      constructor: (runner, context, fail, doneIndex) ->
        super if doneIndex is 0
          (prevArgsList, done) =>
            @timeoutId = defer =>
              try
                @canceller = runner.call context, done
              catch err
                fail @, err
        else
          (prevArgsList, done) =>
            @timeoutId = defer =>
              try
                @canceller = runner.call context, prevArgsList, done
              catch err
                fail @, err
        , context

    class TheActor extends Actor

      name: 'TheActor'

      constructor: (the) ->
        the.stop()
        super the

      run: (prevArgsList, done) ->
        @runner.then done

      cancel: ->
        @runner.pause()

    (runner, context, fail) ->
      if runner instanceof Actor
        runner
      else if runner instanceof The
        new TheActor runner
      else if isFunction runner
        args = getArgumentNames runner
        if args.length is 0 or args[args.length - 1] isnt 'done'
          new SyncActor runner, context, fail
        else
          new AsyncActor runner, context, fail, args.length - 1
      else
        throw new TypeError "runner must be specified as `The` instance or `function`"

  exports.The = The
