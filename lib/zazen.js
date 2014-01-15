var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

(function(exports) {
  var Actor, Task, The;
  The = (function() {
    The.verbose = false;

    function The(context) {
      this.next = __bind(this.next, this);
      if (!(this instanceof The)) {
        return new The(context);
      }
      this.tasks = [];
      this.index = -1;
      this.isRunning = false;
    }

    The.prototype.then = function() {
      var actors;
      actors = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.tasks.push(new Task(actors));
      this.resume();
      return this;
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
    function Task(actors) {
      var actor, i, _i, _len;
      this.actors = [];
      for (i = _i = 0, _len = actors.length; _i < _len; i = ++_i) {
        actor = actors[i];
        this.actors[i] = actor instanceof Actor ? actor : new Actor(actor);
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
    function Actor(runner, canceller) {
      this.canceller = canceller;
      if (runner.length === 0) {
        this.runner = function(done) {
          return setTimeout(function() {
            runner();
            return done();
          }, 0);
        };
      } else {
        this.runner = runner;
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
