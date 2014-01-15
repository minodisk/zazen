var __slice = [].slice;

(function(exports) {
  var Actor, Task, The;
  The = (function() {
    function The(context) {
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
      return this.resume();
    };

    The.prototype.resume = function() {
      var task;
      if (this.isRunning) {
        return;
      }
      task = this.tasks[++this.index];
      task.run(this.next);
      return this;
    };

    The.prototype.next = function() {
      var task;
      task = this.tasks[++this.index];
      return task.run(this.next);
    };

    The.prototype.pause = function() {
      var task;
      if (!this.isRunning) {
        return;
      }
      task = this.tasks[this.index];
      task.cancel();
      return this;
    };

    return The;

  })();
  Task = (function() {
    function Task(actors) {
      var actor, _i, _len;
      this.actors = [];
      for (_i = 0, _len = actors.length; _i < _len; _i++) {
        actor = actors[_i];
        this.actors.push(actor instanceof Actor ? actor : new Actor(actor));
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
          var doneFlag, isDone, _j, _len1;
          actor.run(function() {
            return doneFlags[i] = true;
          });
          isDone = true;
          for (_j = 0, _len1 = doneFlags.length; _j < _len1; _j++) {
            doneFlag = doneFlags[_j];
            isDone && (isDone = doneFlag);
          }
          if (isDone) {
            return next();
          }
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
          return setTimeout(runner, 0);
        };
      } else {
        this.runner = runner;
      }
    }

    Actor.prototype.run = function(next) {
      return this.runner(function() {
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
