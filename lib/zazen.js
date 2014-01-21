var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

(function(exports) {
  var Task, The, createActor, createId, defer, getArgumentNames, isArray, isFunction, slice, toString;
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
  The = (function() {
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
      this.id = createId();
      this.context = context;
      this.tasks = [];
      this.index = -1;
      this.isRunning = false;
    }

    The.prototype.then = function(actors) {
      if (!isArray(actors)) {
        actors = slice.call(arguments, 0);
      }
      this.tasks.push(new Task(actors, this.context));
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

    The.prototype._next = function() {
      var index, task;
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
      return task.run(this._next);
    };

    return The;

  })();
  Task = (function() {
    function Task(actors, context) {
      var actor, i, _i, _len;
      this.id = createId();
      this.actors = [];
      for (i = _i = 0, _len = actors.length; _i < _len; i = ++_i) {
        actor = actors[i];
        this.actors[i] = createActor(actor, null, context);
      }
    }

    Task.prototype.run = function(done) {
      var actor, doneFlags, i, _i, _len, _ref, _results;
      doneFlags = [];
      _ref = this.actors;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        actor = _ref[i];
        doneFlags[i] = false;
        _results.push((function(i) {
          return actor.run(function() {
            var doneFlag, isDone, _j, _len1;
            doneFlags[i] = true;
            isDone = true;
            for (_j = 0, _len1 = doneFlags.length; _j < _len1; _j++) {
              doneFlag = doneFlags[_j];
              isDone && (isDone = doneFlag);
            }
            if (isDone) {
              return done();
            }
          });
        })(i));
      }
      return _results;
    };

    Task.prototype.cancel = function() {
      var actor, _i, _len, _ref, _results;
      _ref = this.actors;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        actor = _ref[_i];
        _results.push(actor.cancel());
      }
      return _results;
    };

    Task.prototype.toStateString = function() {
      return "Task{ id: " + this.id + " }";
    };

    return Task;

  })();
  createActor = (function() {
    var Actor, AsyncActor, SyncActor, TheActor;
    Actor = (function() {
      Actor.prototype.name = 'Actor';

      function Actor(runner, canceller, context) {
        this.runner = runner;
        this.canceller = canceller;
        this.context = context;
        this.id = createId();
      }

      Actor.prototype.run = function(done) {
        if (The.verbose) {
          console.log("" + (this.toStateString()) + "#run");
        }
        return this.runner(function() {
          return done();
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

      Actor.prototype.toStateString = function() {
        return "" + this.name + "{ id: " + this.id + " }";
      };

      return Actor;

    })();
    SyncActor = (function(_super) {
      __extends(SyncActor, _super);

      SyncActor.prototype.name = 'SyncActor';

      function SyncActor(runner, canceller, context) {
        var _this = this;
        SyncActor.__super__.constructor.call(this, function(done) {
          return _this.timeoutId = defer(function() {
            var returns;
            returns = runner.call(context);
            if (returns instanceof The) {
              return new TheActor(returns).run(done);
            } else {
              return done();
            }
          });
        }, null, context);
      }

      return SyncActor;

    })(Actor);
    AsyncActor = (function(_super) {
      __extends(AsyncActor, _super);

      AsyncActor.prototype.name = 'AsyncActor';

      function AsyncActor(runner, canceller, context) {
        var _this = this;
        AsyncActor.__super__.constructor.call(this, function(done) {
          return _this.timeoutId = defer(function() {
            return _this.canceller = runner.call(context, done);
          });
        }, null, context);
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

      TheActor.prototype.run = function(done) {
        return this.runner.then(done);
      };

      TheActor.prototype.cancel = function() {
        return this.runner.pause();
      };

      return TheActor;

    })(Actor);
    return function(runner, canceller, context) {
      var args;
      if (runner instanceof Actor) {
        return runner;
      } else if (runner instanceof The) {
        return new TheActor(runner, canceller, context);
      } else if (isFunction(runner)) {
        args = getArgumentNames(runner);
        if (args.length === 0 || args[args.length - 1] !== 'done') {
          return new SyncActor(runner, canceller, context);
        } else {
          return new AsyncActor(runner, canceller, context);
        }
      } else {
        throw new TypeError("runner must be specified as `The` instance or `function`");
      }
    };
  })();
  return exports.The = The;
})(typeof exports === 'undefined' ? this : exports);
