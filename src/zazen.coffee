exports = if typeof exports is 'undefined' then @ else exports
bind = (fn, me) ->
  ->
    return fn.apply(me, arguments);
toString = Object::toString
isArray = Array.isArray or (obj) ->
  toString.call(obj) is '[object Array]'
isFunction = if typeof (/./) isnt 'function'
  (obj) ->
    typeof obj is 'function'
else
  (obj) ->
    toString.call(obj) is '[object Function]'
indexOf = if Array::indexOf?
  (array, item) ->
    array.indexOf item
else
  (array, item) ->
    return -1 unless array?
    for elem, i in array
      if elem is item
        return i
    return -1
createId = do ->
  seeds = []
  for str in [ '0-9', 'a-z', 'A-Z' ]
    charCodes = str.split '-'
    for char, i in charCodes
      charCodes[i] = char.charCodeAt 0
    for charCode in [charCodes[0]..charCodes[1]] by 1
      seeds.push String.fromCharCode charCode
  length = seeds.length
  (len = 5) ->
    hash = ''
    while len-- > 0
      hash += seeds[length * Math.random() >> 0]
    hash
defer = (callback) ->
  setTimeout callback, 0
getArgNames = do ->
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

  indent: 0
  name: 'Klass'

  constructor: ->
    @_indent = new Array(@indent + 1).join ' '
    @_id = createId()

  toVerboseString: ->
    """#{@_indent}#{@name}(#{@_id})"""

class The extends Klass

  @verbose: false

  @then: ->
    The::then.apply new The(), arguments

  @wait: ->
    The::wait.apply new The(), arguments

  name: 'The'

  constructor: (context) ->
    unless @ instanceof The
      return new The context

    # Don't bind with `=>` operator, or global leaks problem will be raised in IE6~10
    # when call `The()`.
    @_onResolved = bind @_onResolved, @
    @_onRejected = bind @_onRejected, @

    super()
    @context = context ? @
    @tasks = []
    @index = -1
    @isRunning = false

  then: (actors) ->
    if arguments.length isnt 1
      throw new TypeError 'The#then() requires one parameter: instance of `The`, `Function` or `Array<Function>`'
    @tasks.push createTask actors, @context
    @resume()
    @

  fail: (actor) ->
    @tasks.push new FailTask actor, @context
    @resume()
    @

  wait: (duration) ->
    if The.verbose then (console?.log ? alert) "#{@toVerboseString()}#wait()"
    #TODO Remove [] operator; I write [] for the bug of IntelliJ IDEA (http://youtrack.jetbrains.com/issue/WEB-10349)
    @['then'] (resolve) ->
      setTimeout resolve, duration

  resume: ->
    return if @isRunning
    @isRunning = true

    if The.verbose then (console?.log ? alert) "#{@toVerboseString()}#resume()"
    @_onResolved()
    @

  pause: ->
    return unless @isRunning
    @isRunning = false

    task = @tasks[@index]
    task.cancel()
    @index--
    if @index < -1
      @index = -1
    if The.verbose then (console?.log ? alert) "#{@toVerboseString()}#pause()"
    @

  stop: ->
    if The.verbose then (console?.log ? alert) "#{@toVerboseString()}#stop()"
    @pause()
    @index = -1
    @

  toVerboseString: ->
    """#{super()}{ index: #{@index}, isRunning: #{@isRunning} }"""

  _onResolved: (args = []) ->
    return unless @isRunning
    index = @index

    # Find nearest non-FailTask.
    # If non-FailTask is not found, finish flow.
    break while (task = @tasks[++index])? when not (task instanceof FailTask)
    return unless task?

    @index = index
    if The.verbose then (console?.log ? alert) "#{@toVerboseString()}#_onResolved()"
    task.run args, @_onResolved, @_onRejected

  _onRejected: (err) ->
    index = @index
    @pause()

    # Find nearest FailTask.
    # If FailTask is not found, throw error and finish flow.
    break while (task = @tasks[++index])? when task instanceof FailTask
    return throw err unless task?

    @index = index
    if The.verbose then (console?.log ? alert) "#{@toVerboseString()}#_onRejected()"
    task.run err, (args) =>
      @isRunning = true
      @_onResolved args
    , @_onRejected


{ createTask, FailTask } = do ->
  class Task extends Klass

    indent: 2
    name: 'Task'

    constructor: ->
      super()

    run: ->
      if The.verbose then (console?.log ? alert) "#{@toVerboseString()}#run"

    cancel: ->
      if The.verbose then (console?.log ? alert) "#{@toVerboseString()}#cancel"

  class SingleTask extends Task

    name: 'SingleTask'

    constructor: (actor, context) ->
      super()
      @actor = createActor actor, context

    run: (args, onResolved, onRejected) ->
      super()
      @actor.run args, onResolved, onRejected

    cancel: ->
      super()
      @actor.cancel()

  class MultiTask extends Task

    name: 'MultiTask'

    constructor: (actors, context) ->
      super()
      @actor = []
      for actor, i in actors
        @actor[i] = createActor actor, context

    run: (prevArgs, onResolved, onRejected) ->
      super()
      argsList = []
      for actor, i in @actor
        argsList[i] = null
        do (i) ->
          actor.run prevArgs, (args) ->
            argsList[i] = args
            isDone = true
            isDone and= args isnt null for args in argsList
            if isDone
              onResolved argsList
          , onRejected

    cancel: ->
      super()
      for actor in @actor
        actor.cancel()

  class FailTask extends Task

    name: 'FailTask'

    constructor: (actor, context) ->
      super()
      @actor = createActor actor, context, true

    run: (err, onResolved, onRejected) ->
      super()
      @actor.run err, onResolved, onRejected

    cancel: ->
      super()
      @actor.cancel()

  createTask: (actors, context) ->
    if isArray actors
      new MultiTask actors, context
    else
      new SingleTask actors, context
  FailTask: FailTask


createActor = do ->
  class Actor extends Klass

    indent: 4
    name: 'Actor'

    constructor: (@runner, @context) ->
      super()

    run: ->
      if The.verbose then (console?.log ? alert) "#{@toVerboseString()}#run"

    cancel: ->
      if The.verbose then (console?.log ? alert) "#{@toVerboseString()}#cancel"
      if @timeoutId?
        clearTimeout @timeoutId
        @timeoutId = null
      if isFunction @canceller
        @canceller.call @context

  class AsyncActor extends Actor

    name: 'AsyncActor'

    constructor: (runner, context) ->
      super runner, context

    run: (prevArgs, onResolved, onRejected) ->
      super()

      argNames = getArgNames @runner
      resolveIndex = indexOf argNames, 'resolve'
      rejectIndex = indexOf argNames, 'reject'

      args = [prevArgs]
      if resolveIndex isnt -1
        args[resolveIndex] = (args...) ->
          onResolved args
      if rejectIndex isnt -1
        args[rejectIndex] = onRejected

      @timeoutId = if resolveIndex is -1
        # Resolve automatically when runner doesn't have a 'resolve' argument.
        defer =>
          try
            returns = @runner.apply @context, args
          catch err
            onRejected err
          if returns instanceof The
            new TheActor(returns).run prevArgs, onResolved, onRejected
          else
            unless @ instanceof FailActor
              onResolved()
      else
        # Flow is stopping till resolve() is called in runner when runner has 'resolve' argument.
        defer =>
          try
            @canceller = @runner.apply @context, args
          catch err
            onRejected err

  class FailActor extends AsyncActor

    name: 'FailActor'

    constructor: (runner, context) ->
      super runner, context

  class TheActor extends Actor

    name: 'TheActor'

    constructor: (the) ->
      the.stop()
      super the

    run: (prevArgs, onResolved, onRejected) ->
      @runner
      .then(onResolved)
      .fail(onRejected)

    cancel: ->
      @runner.pause()

  (runner, context, isFail = false) ->
    if runner instanceof Actor
      runner
    else if runner instanceof The
      new TheActor runner
    else if isFunction runner
      if isFail
        new FailActor runner, context
      else
        new AsyncActor runner, context
    else
      throw new TypeError "runner must be specified as `The` instance or `function`"

exports.The = The

exports.promisify = (fn) ->
  (args...) ->
    The.then (resolve, reject) ->
      args.push (err, res...) ->
        if err?
          reject err
        else
          resolve.apply @, res
      fn.apply null, args
