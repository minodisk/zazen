(function() {
  var FailTask, Klass, The, bind, createActor, createId, createTask, defer, exports, getArgNames, indexOf, isArray, isFunction, toString, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  exports = typeof exports === 'undefined' ? this : exports;

  bind = function(fn, me) {
    return function() {
      return fn.apply(me, arguments);
    };
  };

  toString = Object.prototype.toString;

  isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  isFunction = typeof /./ !== 'function' ? function(obj) {
    return typeof obj === 'function';
  } : function(obj) {
    return toString.call(obj) === '[object Function]';
  };

  indexOf = Array.prototype.indexOf != null ? function(array, item) {
    return array.indexOf(item);
  } : function(array, item) {
    var elem, i, _i, _len;
    if (array == null) {
      return -1;
    }
    for (i = _i = 0, _len = array.length; _i < _len; i = ++_i) {
      elem = array[i];
      if (elem === item) {
        return i;
      }
    }
    return -1;
  };

  createId = (function() {
    var char, charCode, charCodes, i, length, seeds, str, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2;
    seeds = [];
    _ref = ['0-9', 'a-z', 'A-Z'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      str = _ref[_i];
      charCodes = str.split('-');
      for (i = _j = 0, _len1 = charCodes.length; _j < _len1; i = ++_j) {
        char = charCodes[i];
        charCodes[i] = char.charCodeAt(0);
      }
      for (charCode = _k = _ref1 = charCodes[0], _ref2 = charCodes[1]; _k <= _ref2; charCode = _k += 1) {
        seeds.push(String.fromCharCode(charCode));
      }
    }
    length = seeds.length;
    return function(len) {
      var hash;
      if (len == null) {
        len = 5;
      }
      hash = '';
      while (len-- > 0) {
        hash += seeds[length * Math.random() >> 0];
      }
      return hash;
    };
  })();

  defer = function(callback) {
    return setTimeout(callback, 0);
  };

  getArgNames = (function() {
    var rArgument, rComment;
    rArgument = /\(([\s\S]*?)\)/;
    rComment = /\/\/.*$|\/\*[\s\S]*?\*\/|\s/gm;
    return function(func) {
      var paramStr;
      paramStr = func.toString().match(rArgument)[1].replace(rComment, '');
      if (paramStr === '') {
        return [];
      }
      return paramStr.split(',');
    };
  })();

  Klass = (function() {
    Klass.prototype.indent = 0;

    Klass.prototype.name = 'Klass';

    function Klass() {
      this._indent = new Array(this.indent + 1).join(' ');
      this._id = createId();
    }

    Klass.prototype.toVerboseString = function() {
      return "" + this._indent + this.name + "(" + this._id + ")";
    };

    return Klass;

  })();

  The = (function(_super) {
    __extends(The, _super);

    The.verbose = false;

    The.then = function() {
      return The.prototype.then.apply(new The(), arguments);
    };

    The.wait = function() {
      return The.prototype.wait.apply(new The(), arguments);
    };

    The.prototype.name = 'The';

    function The(context) {
      if (!(this instanceof The)) {
        return new The(context);
      }
      this._onResolved = bind(this._onResolved, this);
      this._onRejected = bind(this._onRejected, this);
      The.__super__.constructor.call(this);
      this.context = context != null ? context : this;
      this.tasks = [];
      this.index = -1;
      this.isRunning = false;
    }

    The.prototype.then = function(actors) {
      if (arguments.length !== 1) {
        throw new TypeError('The#then() requires one parameter: instance of `The`, `Function` or `Array<Function>`');
      }
      this.tasks.push(createTask(actors, this.context));
      this.resume();
      return this;
    };

    The.prototype.fail = function(actor) {
      this.tasks.push(new FailTask(actor, this.context));
      this.resume();
      return this;
    };

    The.prototype.wait = function(duration) {
      var _ref;
      if (The.verbose) {
        ((_ref = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? _ref : alert)("" + (this.toVerboseString()) + "#wait()");
      }
      return this['then'](function(resolve) {
        return setTimeout(resolve, duration);
      });
    };

    The.prototype.resume = function() {
      var _ref;
      if (this.isRunning) {
        return;
      }
      this.isRunning = true;
      if (The.verbose) {
        ((_ref = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? _ref : alert)("" + (this.toVerboseString()) + "#resume()");
      }
      this._onResolved();
      return this;
    };

    The.prototype.pause = function() {
      var task, _ref;
      if (!this.isRunning) {
        return;
      }
      this.isRunning = false;
      task = this.tasks[this.index];
      task.cancel();
      this.index--;
      if (this.index < -1) {
        this.index = -1;
      }
      if (The.verbose) {
        ((_ref = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? _ref : alert)("" + (this.toVerboseString()) + "#pause()");
      }
      return this;
    };

    The.prototype.stop = function() {
      var _ref;
      if (The.verbose) {
        ((_ref = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? _ref : alert)("" + (this.toVerboseString()) + "#stop()");
      }
      this.pause();
      this.index = -1;
      return this;
    };

    The.prototype.toVerboseString = function() {
      return "" + (The.__super__.toVerboseString.call(this)) + "{ index: " + this.index + ", isRunning: " + this.isRunning + " }";
    };

    The.prototype._onResolved = function(args) {
      var index, task, _ref;
      if (args == null) {
        args = [];
      }
      if (!this.isRunning) {
        return;
      }
      index = this.index;
      while ((task = this.tasks[++index]) != null) {
        if (!(task instanceof FailTask)) {
          break;
        }
      }
      if (task == null) {
        return;
      }
      this.index = index;
      if (The.verbose) {
        ((_ref = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? _ref : alert)("" + (this.toVerboseString()) + "#_onResolved()");
      }
      return task.run(args, this._onResolved, this._onRejected);
    };

    The.prototype._onRejected = function(err) {
      var index, task, _ref,
        _this = this;
      index = this.index;
      this.pause();
      while ((task = this.tasks[++index]) != null) {
        if (task instanceof FailTask) {
          break;
        }
      }
      if (task == null) {
        throw err;
      }
      this.index = index;
      if (The.verbose) {
        ((_ref = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? _ref : alert)("" + (this.toVerboseString()) + "#_onRejected()");
      }
      return task.run(err, function(args) {
        _this.isRunning = true;
        return _this._onResolved(args);
      }, this._onRejected);
    };

    return The;

  })(Klass);

  _ref = (function() {
    var FailTask, MultiTask, SingleTask, Task;
    Task = (function(_super) {
      __extends(Task, _super);

      Task.prototype.indent = 2;

      Task.prototype.name = 'Task';

      function Task() {
        Task.__super__.constructor.call(this);
      }

      Task.prototype.run = function() {
        var _ref;
        if (The.verbose) {
          return ((_ref = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? _ref : alert)("" + (this.toVerboseString()) + "#run");
        }
      };

      Task.prototype.cancel = function() {
        var _ref;
        if (The.verbose) {
          return ((_ref = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? _ref : alert)("" + (this.toVerboseString()) + "#cancel");
        }
      };

      return Task;

    })(Klass);
    SingleTask = (function(_super) {
      __extends(SingleTask, _super);

      SingleTask.prototype.name = 'SingleTask';

      function SingleTask(actor, context) {
        SingleTask.__super__.constructor.call(this);
        this.actor = createActor(actor, context);
      }

      SingleTask.prototype.run = function(args, onResolved, onRejected) {
        SingleTask.__super__.run.call(this);
        return this.actor.run(args, onResolved, onRejected);
      };

      SingleTask.prototype.cancel = function() {
        SingleTask.__super__.cancel.call(this);
        return this.actor.cancel();
      };

      return SingleTask;

    })(Task);
    MultiTask = (function(_super) {
      __extends(MultiTask, _super);

      MultiTask.prototype.name = 'MultiTask';

      function MultiTask(actors, context) {
        var actor, i, _i, _len;
        MultiTask.__super__.constructor.call(this);
        this.actor = [];
        for (i = _i = 0, _len = actors.length; _i < _len; i = ++_i) {
          actor = actors[i];
          this.actor[i] = createActor(actor, context);
        }
      }

      MultiTask.prototype.run = function(prevArgs, onResolved, onRejected) {
        var actor, argsList, i, _i, _len, _ref, _results;
        MultiTask.__super__.run.call(this);
        argsList = [];
        _ref = this.actor;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          actor = _ref[i];
          argsList[i] = null;
          _results.push((function(i) {
            return actor.run(prevArgs, function(args) {
              var isDone, _j, _len1;
              argsList[i] = args;
              isDone = true;
              for (_j = 0, _len1 = argsList.length; _j < _len1; _j++) {
                args = argsList[_j];
                isDone && (isDone = args !== null);
              }
              if (isDone) {
                return onResolved(argsList);
              }
            }, onRejected);
          })(i));
        }
        return _results;
      };

      MultiTask.prototype.cancel = function() {
        var actor, _i, _len, _ref, _results;
        MultiTask.__super__.cancel.call(this);
        _ref = this.actor;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          actor = _ref[_i];
          _results.push(actor.cancel());
        }
        return _results;
      };

      return MultiTask;

    })(Task);
    FailTask = (function(_super) {
      __extends(FailTask, _super);

      FailTask.prototype.name = 'FailTask';

      function FailTask(actor, context) {
        FailTask.__super__.constructor.call(this);
        this.actor = createActor(actor, context, true);
      }

      FailTask.prototype.run = function(err, onResolved, onRejected) {
        FailTask.__super__.run.call(this);
        return this.actor.run(err, onResolved, onRejected);
      };

      FailTask.prototype.cancel = function() {
        FailTask.__super__.cancel.call(this);
        return this.actor.cancel();
      };

      return FailTask;

    })(Task);
    return {
      createTask: function(actors, context) {
        if (isArray(actors)) {
          return new MultiTask(actors, context);
        } else {
          return new SingleTask(actors, context);
        }
      },
      FailTask: FailTask
    };
  })(), createTask = _ref.createTask, FailTask = _ref.FailTask;

  createActor = (function() {
    var Actor, AsyncActor, FailActor, TheActor;
    Actor = (function(_super) {
      __extends(Actor, _super);

      Actor.prototype.indent = 4;

      Actor.prototype.name = 'Actor';

      function Actor(runner, context) {
        this.runner = runner;
        this.context = context;
        Actor.__super__.constructor.call(this);
      }

      Actor.prototype.run = function() {
        var _ref1;
        if (The.verbose) {
          return ((_ref1 = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? _ref1 : alert)("" + (this.toVerboseString()) + "#run");
        }
      };

      Actor.prototype.cancel = function() {
        var _ref1;
        if (The.verbose) {
          ((_ref1 = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? _ref1 : alert)("" + (this.toVerboseString()) + "#cancel");
        }
        if (this.timeoutId != null) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
        if (isFunction(this.canceller)) {
          return this.canceller.call(this.context);
        }
      };

      return Actor;

    })(Klass);
    AsyncActor = (function(_super) {
      __extends(AsyncActor, _super);

      AsyncActor.prototype.name = 'AsyncActor';

      function AsyncActor(runner, context) {
        AsyncActor.__super__.constructor.call(this, runner, context);
      }

      AsyncActor.prototype.run = function(prevArgs, onResolved, onRejected) {
        var argNames, args, rejectIndex, resolveIndex,
          _this = this;
        AsyncActor.__super__.run.call(this);
        argNames = getArgNames(this.runner);
        resolveIndex = indexOf(argNames, 'resolve');
        rejectIndex = indexOf(argNames, 'reject');
        args = [prevArgs];
        if (resolveIndex !== -1) {
          args[resolveIndex] = function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return onResolved(args);
          };
        }
        if (rejectIndex !== -1) {
          args[rejectIndex] = onRejected;
        }
        return this.timeoutId = resolveIndex === -1 ? defer(function() {
          var err, returns;
          try {
            returns = _this.runner.apply(_this.context, args);
          } catch (_error) {
            err = _error;
            onRejected(err);
          }
          if (returns instanceof The) {
            return new TheActor(returns).run(prevArgs, onResolved, onRejected);
          } else {
            if (!(_this instanceof FailActor)) {
              return onResolved();
            }
          }
        }) : defer(function() {
          var err;
          try {
            return _this.canceller = _this.runner.apply(_this.context, args);
          } catch (_error) {
            err = _error;
            return onRejected(err);
          }
        });
      };

      return AsyncActor;

    })(Actor);
    FailActor = (function(_super) {
      __extends(FailActor, _super);

      FailActor.prototype.name = 'FailActor';

      function FailActor(runner, context) {
        FailActor.__super__.constructor.call(this, runner, context);
      }

      return FailActor;

    })(AsyncActor);
    TheActor = (function(_super) {
      __extends(TheActor, _super);

      TheActor.prototype.name = 'TheActor';

      function TheActor(the) {
        the.stop();
        TheActor.__super__.constructor.call(this, the);
      }

      TheActor.prototype.run = function(prevArgs, onResolved, onRejected) {
        return this.runner.then(onResolved).fail(onRejected);
      };

      TheActor.prototype.cancel = function() {
        return this.runner.pause();
      };

      return TheActor;

    })(Actor);
    return function(runner, context, isFail) {
      if (isFail == null) {
        isFail = false;
      }
      if (runner instanceof Actor) {
        return runner;
      } else if (runner instanceof The) {
        return new TheActor(runner);
      } else if (isFunction(runner)) {
        if (isFail) {
          return new FailActor(runner, context);
        } else {
          return new AsyncActor(runner, context);
        }
      } else {
        throw new TypeError("runner must be specified as `The` instance or `function`");
      }
    };
  })();

  exports.The = The;

}).call(this);
