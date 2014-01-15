var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

(function(exports) {
  var Actor, Task, The, isArray, slice, toString;
  toString = Object.prototype.toString;
  slice = Array.prototype.slice;
  isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };
  The = (function() {
    The.verbose = false;

    The.then = function() {
      return The.prototype.then.apply(new The(), arguments);
    };

    The.wait = function() {
      return The.prototype.wait.apply(new The(), arguments);
    };

    function The(context) {
      this.next = __bind(this.next, this);
      if (!(this instanceof The)) {
        return new The(context);
      }
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
      this.next();
      return this;
    };

    The.prototype.next = function() {
      var index, task;
      if (The.verbose) {
        console.log('The#next this =', this);
      }
      index = this.index + 1;
      if (index < 0 || index >= this.tasks.length) {
        return;
      }
      this.index = index;
      task = this.tasks[this.index];
      if (The.verbose) {
        console.log('  ', this.index, task);
      }
      return task.run(this.next);
    };

    The.prototype.pause = function() {
      var task;
      if (!this.isRunning) {
        return;
      }
      this.isRunning = false;
      task = this.tasks[this.index];
      task.cancel();
      return this;
    };

    return The;

  })();
  Task = (function() {
    function Task(actors, context) {
      var actor, i, _i, _len;
      this.actors = [];
      for (i = _i = 0, _len = actors.length; _i < _len; i = ++_i) {
        actor = actors[i];
        this.actors[i] = actor instanceof Actor ? actor : new Actor(actor, null, context);
      }
    }

    Task.prototype.run = function(next) {
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
            if (The.verbose) {
              console.log('Task#done isDone =', isDone);
            }
            if (isDone) {
              return next();
            }
          });
        })(i));
      }
      return _results;
    };

    return Task;

  })();
  Actor = (function() {
    function Actor(runner, canceller, context) {
      this.canceller = canceller;
      if (runner.length === 0) {
        this.runner = function(done) {
          return setTimeout(function() {
            runner.call(context);
            return done();
          }, 0);
        };
      } else {
        this.runner = function(done) {
          return setTimeout(function() {
            return runner.call(context, done);
          }, 0);
        };
      }
    }

    Actor.prototype.run = function(next) {
      return this.runner(function() {
        if (The.verbose) {
          console.log('Actor#done next =', next);
        }
        return next();
      });
    };

    Actor.prototype.cancel = function() {
      return typeof this.canceller === "function" ? this.canceller() : void 0;
    };

    return Actor;

  })();
  return exports.The = The;
})(typeof exports === 'undefined' ? this : exports);
