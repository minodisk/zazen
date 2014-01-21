var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

(function(exports) {
  var Klass, The, createActor, createId, createTask, defer, getArgumentNames, isArray, isFunction, slice, toString;
  toString = Object.prototype.toString;
  slice = Array.prototype.slice;
  isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };
  isFunction = typeof /./ !== 'function' ? function(obj) {
    return typeof obj === 'function';
  } : function(obj) {
    return toString.call(obj) === '[object Function]';
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
        len = 12;
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
  getArgumentNames = (function() {
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
    Klass.prototype.name = 'Klass';

    function Klass() {
      this.id = createId();
    }

    Klass.prototype.toStateString = function() {
      return "" + this.name + "{ id: " + this.id + " }";
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

    function The(context) {
      this._next = __bind(this._next, this);
      if (!(this instanceof The)) {
        return new The(context);
      }
      The.__super__.constructor.call(this);
      this.context = context;
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

    The.prototype.wait = function(duration) {
      return this['then'](function(done) {
        return setTimeout(done, duration);
      });
    };

    The.prototype.resume = function() {
      if (this.isRunning) {
        return;
      }
      this.isRunning = true;
      this._next();
      return this;
    };

    The.prototype.pause = function() {
      var task;
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
        console.log("" + (this.toStateString()) + "#pause()");
      }
      return this;
    };

    The.prototype.stop = function() {
      if (The.verbose) {
        console.log("" + (this.toStateString()) + "#stop()");
      }
      this.pause();
      this.index = -1;
      return this;
    };

    The.prototype.toStateString = function() {
      return "The{ id: " + this.id + ", index: " + this.index + ", isRunning: " + this.isRunning + " }";
    };

    The.prototype._next = function(argsList) {
      var index, task;
      if (argsList == null) {
        argsList = [];
      }
      if (!this.isRunning) {
        return;
      }
      index = this.index + 1;
      if (index < 0 || index >= this.tasks.length) {
        return;
      }
      this.index = index;
      if (The.verbose) {
        console.log("" + (this.toStateString()) + "#_next()");
      }
      task = this.tasks[this.index];
      return task.run(argsList, this._next);
    };

    return The;

  })(Klass);
  createTask = (function() {
    var MultiTask, SingleTask, Task;
    Task = (function(_super) {
      __extends(Task, _super);

      Task.prototype.name = 'Task';

      function Task(actors, context) {
        Task.__super__.constructor.call(this);
      }

      return Task;

    })(Klass);
    SingleTask = (function(_super) {
      __extends(SingleTask, _super);

      SingleTask.prototype.name = 'SingleTask';

      function SingleTask(actor, context) {
        SingleTask.__super__.constructor.call(this);
        this.actor = createActor(actor, context);
      }

      SingleTask.prototype.run = function(prevArgsList, done) {
        return this.actor.run(prevArgsList, function(args) {
          return done(args);
        });
      };

      SingleTask.prototype.cancel = function() {
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
        this.actors = [];
        for (i = _i = 0, _len = actors.length; _i < _len; i = ++_i) {
          actor = actors[i];
          this.actors[i] = createActor(actor, context);
        }
      }

      MultiTask.prototype.run = function(prevArgsList, done) {
        var actor, argsList, i, _i, _len, _ref, _results;
        argsList = [];
        _ref = this.actors;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          actor = _ref[i];
          argsList[i] = null;
          _results.push((function(i) {
            return actor.run(prevArgsList, function(args) {
              var isDone, _j, _len1;
              argsList[i] = args;
              isDone = true;
              for (_j = 0, _len1 = argsList.length; _j < _len1; _j++) {
                args = argsList[_j];
                isDone && (isDone = args !== null);
              }
              if (isDone) {
                return done(argsList);
              }
            });
          })(i));
        }
        return _results;
      };

      MultiTask.prototype.cancel = function() {
        var actor, _i, _len, _ref, _results;
        _ref = this.actors;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          actor = _ref[_i];
          _results.push(actor.cancel());
        }
        return _results;
      };

      return MultiTask;

    })(Task);
    return function(actors, context) {
      if (isArray(actors)) {
        return new MultiTask(actors, context);
      } else {
        return new SingleTask(actors, context);
      }
    };
  })();
  createActor = (function() {
    var Actor, AsyncActor, SyncActor, TheActor;
    Actor = (function(_super) {
      __extends(Actor, _super);

      Actor.prototype.name = 'Actor';

      function Actor(runner, context) {
        this.runner = runner;
        this.context = context;
        Actor.__super__.constructor.call(this);
      }

      Actor.prototype.run = function(prevArgsList, done) {
        if (The.verbose) {
          console.log("" + (this.toStateString()) + "#run");
        }
        return this.runner(prevArgsList, function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return done(args);
        });
      };

      Actor.prototype.cancel = function() {
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
    SyncActor = (function(_super) {
      __extends(SyncActor, _super);

      SyncActor.prototype.name = 'SyncActor';

      function SyncActor(runner, context) {
        var _this = this;
        SyncActor.__super__.constructor.call(this, function(prevArgsList, done) {
          return _this.timeoutId = defer(function() {
            var returns;
            returns = runner.call(context, prevArgsList);
            if (returns instanceof The) {
              return new TheActor(returns).run(prevArgsList, function(args) {
                return done.apply(null, args);
              });
            } else {
              return done();
            }
          });
        }, context);
      }

      return SyncActor;

    })(Actor);
    AsyncActor = (function(_super) {
      __extends(AsyncActor, _super);

      AsyncActor.prototype.name = 'AsyncActor';

      function AsyncActor(runner, context, doneIndex) {
        var _this = this;
        AsyncActor.__super__.constructor.call(this, doneIndex === 0 ? function(prevArgsList, done) {
          return _this.timeoutId = defer(function() {
            return _this.canceller = runner.call(context, done);
          });
        } : function(prevArgsList, done) {
          return _this.timeoutId = defer(function() {
            return _this.canceller = runner.call(context, prevArgsList, done);
          });
        }, context);
      }

      return AsyncActor;

    })(Actor);
    TheActor = (function(_super) {
      __extends(TheActor, _super);

      TheActor.prototype.name = 'TheActor';

      function TheActor(the) {
        the.stop();
        TheActor.__super__.constructor.call(this, the);
      }

      TheActor.prototype.run = function(prevArgsList, done) {
        return this.runner.then(done);
      };

      TheActor.prototype.cancel = function() {
        return this.runner.pause();
      };

      return TheActor;

    })(Actor);
    return function(runner, context) {
      var args;
      if (runner instanceof Actor) {
        return runner;
      } else if (runner instanceof The) {
        return new TheActor(runner, context);
      } else if (isFunction(runner)) {
        args = getArgumentNames(runner);
        if (args.length === 0 || args[args.length - 1] !== 'done') {
          return new SyncActor(runner, context);
        } else {
          return new AsyncActor(runner, context, args.length - 1);
        }
      } else {
        throw new TypeError("runner must be specified as `The` instance or `function`");
      }
    };
  })();
  return exports.The = The;
})(typeof exports === 'undefined' ? this : exports);
