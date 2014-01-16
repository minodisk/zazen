(function() {
  var The, expect, now;

  expect = require('../node_modules/expect.js');

  The = require('../lib/zazen').The;

  now = function() {
    return new Date().getTime();
  };

  describe('The', function() {
    describe('.then()', function() {
      it('should be implemented', function() {
        return expect(The.then).to.be.a('function');
      });
      return it('should construct The and add task with Then#then()', function() {
        return expect(The.then()).to.be.a(The);
      });
    });
    describe('.wait()', function() {
      it('should be implemented', function() {
        return expect(The.wait).to.be.a('function');
      });
      return it('should construct The and add task with Then#wait()', function() {
        var i, time;
        i = -1;
        time = now();
        The.wait(100).then(function() {
          expect(++i).to.be.equal(1);
          return expect(now() - time).to.be.above(100);
        });
        return expect(++i).to.be.equal(0);
      });
    });
    describe('#context', function() {
      it('should be maintained in runner', function(done) {
        var context;
        context = {
          i: -1
        };
        The(context).then(function(done) {
          var _this = this;
          expect(this).to.be.equal(context);
          expect(this.i).to.be.equal(0);
          return setTimeout(function() {
            expect(_this).to.be.equal(context);
            expect(++_this.i).to.be.equal(1);
            return done();
          }, 100);
        }).then(function() {
          expect(this).to.be.equal(context);
          expect(++this.i).to.be.equal(2);
          return done();
        });
        return expect(++context.i).to.be.equal(0);
      });
      return it('should be a class instance', function(done) {
        var Foo, foo;
        Foo = (function() {
          function Foo() {
            this.x = 0;
          }

          Foo.prototype.start = function(callback) {
            return The(this).then(function(done) {
              var intervalId,
                _this = this;
              expect(this.x).to.be.equal(0);
              return intervalId = setInterval(function() {
                if (++_this.x >= 10) {
                  clearInterval(intervalId);
                  return done();
                }
              }, 33);
            }).then(callback);
          };

          return Foo;

        })();
        foo = new Foo();
        return foo.start(function() {
          expect(this).to.be.equal(foo);
          expect(foo.x).to.be.equal(10);
          return done();
        });
      });
    });
    describe('#constructor()', function() {
      it('should create The instance', function() {
        return expect(new The()).to.be.a(The);
      });
      return it('should create The instance without new operator', function() {
        return expect(The()).to.be.a(The);
      });
    });
    describe('#then()', function() {
      it('should be implemented', function() {
        expect(The.prototype.then).to.be.a('function');
        expect(new The().then).to.be.a('function');
        return expect(The().then).to.be.a('function');
      });
      it('should be chainable', function(done) {
        return The.then(function() {}).then(function() {}).then(function() {
          return done();
        });
      });
      it('should run serially', function(done) {
        var i;
        i = -1;
        The.then(function() {
          return expect(++i).to.be.equal(1);
        }).then(function() {
          return expect(++i).to.be.equal(2);
        }).then(function() {
          expect(++i).to.be.equal(3);
          return done();
        });
        return expect(++i).to.be.equal(0, 'outer');
      });
      it('should run parallely', function(done) {
        var i;
        i = -1;
        The.then(function() {
          return expect(++i).to.be.within(1, 3);
        }, function() {
          return expect(++i).to.be.within(1, 3);
        }, function() {
          return expect(++i).to.be.within(1, 3);
        }).then(function() {
          expect(++i).to.be.equal(4, 'then4');
          return done();
        });
        return expect(++i).to.be.equal(0, 'outer');
      });
      it('should run serially with async runners', function(done) {
        var i, time;
        i = -1;
        time = now();
        The.then(function(done) {
          expect(i).to.be.equal(0, 'then0');
          return setTimeout(function() {
            expect(++i).to.be.equal(1, 'then0+');
            return done();
          }, 100);
        }).then(function(done) {
          expect(i).to.be.equal(1, 'then1');
          expect(now() - time).to.be.above(100);
          return setTimeout(function() {
            expect(++i).to.be.equal(2, 'then1+');
            return done();
          }, 100);
        }).then(function(done) {
          expect(i).to.be.equal(2, 'then2');
          expect(now() - time).to.be.above(200);
          return setTimeout(function() {
            expect(++i).to.be.equal(3, 'then2+');
            return done();
          }, 100);
        }).then(function() {
          expect(++i).to.be.equal(4, 'then4');
          expect(now() - time).to.be.above(300);
          return done();
        });
        return expect(++i).to.be.equal(0, 'outer');
      });
      it('should run parallely with async runners', function(done) {
        var i, time;
        i = -1;
        time = now();
        The.then(function(done) {
          expect(i).to.be.equal(0);
          return setTimeout(function() {
            expect(++i).to.be.equal(3, 'then3');
            return done();
          }, 300);
        }, function(done) {
          expect(i).to.be.equal(0);
          return setTimeout(function() {
            expect(++i).to.be.equal(1, 'then1');
            return done();
          }, 100);
        }, function(done) {
          expect(i).to.be.equal(0);
          return setTimeout(function() {
            expect(++i).to.be.equal(2, 'then2');
            return done();
          }, 200);
        }).then(function() {
          expect(++i).to.be.equal(4, 'then4');
          expect(now() - time).to.be.above(300);
          return done();
        });
        return expect(++i).to.be.equal(0, 'outer');
      });
      it('should accept parallel actors as array', function(done) {
        var actors, i, j, time, _fn, _i;
        i = -1;
        time = now();
        actors = [];
        _fn = function(j) {
          return actors.push(function(done) {
            expect(i).to.be.equal(0);
            return setTimeout(function() {
              expect(++i).to.be.equal(j);
              return done();
            }, 100 * j);
          });
        };
        for (j = _i = 1; _i <= 3; j = ++_i) {
          _fn(j);
        }
        actors = actors.reverse();
        The.then(actors).then(function() {
          expect(++i).to.be.equal(4, 'then4');
          expect(now() - time).to.be.above(300);
          return done();
        });
        return expect(++i).to.be.equal(0, 'outer');
      });
      return it('should accept The instance', function(done) {
        var i, time;
        i = -1;
        time = now();
        The.then(The.wait(100)).then(function() {
          expect(++i).to.be.equal(1, 'then1');
          expect(now() - time).to.be.above(100);
          return done();
        });
        return expect(++i).to.be.equal(0, 'outer');
      });
    });
    describe('#wait()', function() {
      it('should be implemented', function() {
        expect(The.prototype.wait).to.be.a('function');
        expect(new The().wait).to.be.a('function');
        return expect(The().wait).to.be.a('function');
      });
      return it('should defer next task', function() {
        var i, time;
        i = -1;
        time = now();
        The.then(function() {
          return expect(++i).to.be.equal(1);
        }).wait(100).then(function() {
          expect(++i).to.be.equal(2);
          return expect(now() - time).to.be.above(100);
        });
        return expect(++i).to.be.equal(0);
      });
    });
    describe('#pause()', function() {
      return it('should pause the flow', function(done) {
        var the;
        the = The.then(function(done) {
          return setTimeout(done, 200);
        }).then(function() {
          return expect().fail();
        });
        setTimeout(function() {
          return the.pause();
        }, 100);
        return setTimeout(function() {
          expect(the.index).to.be.equal(0);
          return done();
        }, 300);
      });
    });
    return describe('#stop()', function() {
      return it('should pause and reset the flow', function(done) {
        var the;
        the = The.then(function(done) {
          return setTimeout(done, 200);
        }).then(function() {
          return expect().fail();
        });
        setTimeout(function() {
          return the.stop();
        }, 100);
        return setTimeout(function() {
          expect(the.index).to.be.equal(-1);
          return done();
        }, 300);
      });
    });
  });

}).call(this);
