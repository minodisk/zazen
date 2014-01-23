(function() {
  var The, expect, now;

  expect = require('../node_modules/expect.js');

  The = require('../lib/zazen').The;

  now = function() {
    return new Date().getTime();
  };

  describe('The', function() {
    describe('.then()', function() {
      return it("should be a shorthand for `new The().then()`", function() {
        return expect(The.then(function() {})).to.be.a(The);
      });
    });
    describe('.wait()', function() {
      return it("should be a shorthand for `new The().wait()`", function() {
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
      it("should be a `The` instance in default", function(done) {
        var the;
        return the = The.then([
          function() {
            return expect(this).to.be.equal(the);
          }, function() {
            return expect(this).to.be.equal(the);
          }
        ]).then(function() {
          expect(this).to.be.equal(the);
          throw new Error('');
        }).fail(function() {
          expect(this).to.be.equal(the);
          return done();
        });
      });
      it("should act as context in all actors", function(done) {
        var context;
        context = {};
        return The(context).then([
          function() {
            return expect(this).to.be.equal(context);
          }, function() {
            return expect(this).to.be.equal(context);
          }
        ]).then(function() {
          expect(this).to.be.equal(context);
          throw new Error('');
        }).fail(function() {
          expect(this).to.be.equal(context);
          return done();
        });
      });
      return it("should act as context when it is class instance", function(done) {
        var Foo, foo;
        Foo = (function() {
          function Foo() {
            this.x = 0;
          }

          Foo.prototype.start = function() {
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
            });
          };

          return Foo;

        })();
        foo = new Foo();
        return foo.start().then(function() {
          expect(this).to.be.equal(foo);
          expect(foo.x).to.be.equal(10);
          throw new Error('');
        }).fail(function() {
          expect(this).to.be.equal(foo);
          return done();
        });
      });
    });
    describe('#constructor()', function() {
      it("should create `The` instance", function() {
        return expect(new The()).to.be.a(The);
      });
      return it("should create `The` instance without new operator", function() {
        return expect(The()).to.be.a(The);
      });
    });
    describe('#then()', function() {
      it("should require one parameter", function() {
        expect(function() {
          return The.then();
        }).to.throwException();
        return expect(function() {
          return The.then((function() {}), (function() {}));
        }).to.throwException();
      });
      it("should be chainable", function(done) {
        return The.then(function() {}).then(function() {}).then(function() {
          return done();
        });
      });
      it("should run serially when the argument is function", function(done) {
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
      it("should run parallely when the argument is array of function", function(done) {
        var i;
        i = -1;
        The.then([
          function() {
            return expect(++i).to.be.within(1, 3);
          }, function() {
            return expect(++i).to.be.within(1, 3);
          }, function() {
            return expect(++i).to.be.within(1, 3);
          }
        ]).then(function() {
          expect(++i).to.be.equal(4, 'then4');
          return done();
        });
        return expect(++i).to.be.equal(0, 'outer');
      });
      it("should run serially and asynchronously when the argument is function and it has 'done' argument", function(done) {
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
      it("should run parallely and asynchronously when the argument is array of function and they have 'done' argument", function(done) {
        var i, time;
        i = -1;
        time = now();
        The.then([
          function(done) {
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
          }
        ]).then(function() {
          expect(++i).to.be.equal(4, 'then4');
          expect(now() - time).to.be.above(300);
          return done();
        });
        return expect(++i).to.be.equal(0, 'outer');
      });
      it("should accept parallel actors which is generated in iterator", function(done) {
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
      it("should run nested flow when argument is `The` instance", function(done) {
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
      it("should run nested flow when `The` instance returned by actor", function(done) {
        var i, time;
        i = -1;
        time = now();
        The.wait(100).then(function() {
          expect(now() - time).to.be.above(100);
          return The.wait(100).then(function() {
            return expect(now() - time).to.be.above(200);
          }).wait(100);
        }).then(function() {
          expect(++i).to.be.equal(1, 'then1');
          expect(now() - time).to.be.above(300);
          return done();
        });
        return expect(++i).to.be.equal(0, 'outer');
      });
      return it("should pass parameters to next runner", function(done) {
        return The.then(function(done) {
          return done('a', 'b');
        }).then(function(res, done) {
          expect(res[0]).to.be.equal('a');
          expect(res[1]).to.be.equal('b');
          return setTimeout(function() {
            return done('c', 'd');
          }, 10);
        }).then([
          function(res, done) {
            expect(res[0]).to.be.equal('c');
            expect(res[1]).to.be.equal('d');
            return setTimeout(function() {
              return done('e', 'f');
            }, 20);
          }, function(res, done) {
            expect(res[0]).to.be.equal('c');
            expect(res[1]).to.be.equal('d');
            return done('g', 'h');
          }, function(res, done) {
            expect(res[0]).to.be.equal('c');
            expect(res[1]).to.be.equal('d');
            return setTimeout(function() {
              return done('i', 'j');
            }, 10);
          }
        ]).then(function(_arg, done) {
          var res0, res1, res2;
          res0 = _arg[0], res1 = _arg[1], res2 = _arg[2];
          expect(res0[0]).to.be.equal('e');
          expect(res0[1]).to.be.equal('f');
          expect(res1[0]).to.be.equal('g');
          expect(res1[1]).to.be.equal('h');
          expect(res2[0]).to.be.equal('i');
          expect(res2[1]).to.be.equal('j');
          return setTimeout(function() {
            return done('k', 'l');
          }, 10);
        }).then(function(res) {
          expect(res[0]).to.be.equal('k');
          expect(res[1]).to.be.equal('l');
          return The.then([
            function(done) {
              return setTimeout(function() {
                return done('m', 'n');
              }, 20);
            }, function(done) {
              return setTimeout(function() {
                return done('o', 'p');
              }, 10);
            }, function(done) {
              return done('q', 'r');
            }
          ]);
        }).then(function(_arg) {
          var res0, res1, res2;
          res0 = _arg[0], res1 = _arg[1], res2 = _arg[2];
          expect(res0[0]).to.be.equal('m');
          expect(res0[1]).to.be.equal('n');
          expect(res1[0]).to.be.equal('o');
          expect(res1[1]).to.be.equal('p');
          expect(res2[0]).to.be.equal('q');
          expect(res2[1]).to.be.equal('r');
          return The.then([
            The.then(function(done) {
              return done('s', 't');
            }), The.then(function(done) {
              return setTimeout(function() {
                return done('u', 'v');
              }, 10);
            }), The.then(function(done) {
              return done('x', 'y');
            })
          ]);
        }).then(function(_arg) {
          var res0, res1, res2;
          res0 = _arg[0], res1 = _arg[1], res2 = _arg[2];
          expect(res0[0]).to.be.equal('s');
          expect(res0[1]).to.be.equal('t');
          expect(res1[0]).to.be.equal('u');
          expect(res1[1]).to.be.equal('v');
          expect(res2[0]).to.be.equal('x');
          expect(res2[1]).to.be.equal('y');
          return The.then([
            function() {
              return The.then(function(done) {
                return setTimeout(function() {
                  return done('z', 'A');
                }, 10);
              });
            }, function() {
              return The.then(function(done) {
                return done('B', 'C');
              });
            }, function() {
              return The.then(function(done) {
                return setTimeout(function() {
                  return done('D', 'E');
                }, 20);
              });
            }
          ]);
        }).then(function(_arg) {
          var res0, res1, res2;
          res0 = _arg[0], res1 = _arg[1], res2 = _arg[2];
          expect(res0[0]).to.be.equal('z');
          expect(res0[1]).to.be.equal('A');
          expect(res1[0]).to.be.equal('B');
          expect(res1[1]).to.be.equal('C');
          expect(res2[0]).to.be.equal('D');
          expect(res2[1]).to.be.equal('E');
          return done();
        });
      });
    });
    describe('#wait()', function() {
      return it("should defer next task", function() {
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
      it("should pause the flow", function(done) {
        var the;
        the = The.then(function(done) {
          return setTimeout(done, 200);
        }).then(function() {
          return expect().fail();
        });
        setTimeout(function() {
          expect(the.index).to.be.equal(0);
          the.pause();
          return expect(the.index).to.be.equal(-1);
        }, 100);
        return setTimeout(function() {
          expect(the.index).to.be.equal(-1);
          return done();
        }, 300);
      });
      return it("should call canceller", function(done) {
        var the;
        the = The.then(function(done) {
          var timeoutId;
          timeoutId = setTimeout(function() {
            expect().fail();
            return done();
          }, 200);
          return function() {
            return clearTimeout(timeoutId);
          };
        });
        setTimeout(function() {
          return the.pause();
        }, 100);
        return setTimeout(function() {
          return done();
        }, 300);
      });
    });
    describe('#stop()', function() {
      return it("should pause and reset the flow", function(done) {
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
    describe('#resume()', function() {
      return it("should resume paused flow", function(done) {
        var i, the, time;
        i = -1;
        time = now();
        the = The.then(function(done) {
          var timeoutId;
          expect(++i).to.be.equal(1);
          expect(the.index).to.be.equal(0);
          timeoutId = setTimeout(function() {
            expect(the.index).to.be.equal(0);
            return done();
          }, 200);
          return function() {
            expect(--i).to.be.equal(0);
            return clearTimeout(timeoutId);
          };
        }).then(function() {
          expect(++i).to.be.equal(2);
          expect(the.index).to.be.equal(1);
          expect(now() - time).to.be.above(500);
          return done();
        });
        setTimeout(function() {
          expect(i).to.be.equal(1);
          the.pause();
          return expect(i).to.be.equal(0);
        }, 100);
        setTimeout(function() {
          expect(i).to.be.equal(0);
          expect(the.index).to.be.equal(-1);
          return the.resume();
        }, 300);
        return expect(++i).to.be.equal(0);
      });
    });
    return describe('#fail()', function() {
      it("should be skipped when no error is thrown", function(done) {
        return The.then(function(done) {
          return done('a');
        }).fail(function() {
          return expect().fail();
        }).then(function(_arg) {
          var a;
          a = _arg[0];
          expect(a).to.be.equal('a');
          return done();
        });
      });
      it("should be stop the flow when error is thrown", function(done) {
        The.then(function() {
          throw new Error('');
          return expect().fail(0);
        }).then(function() {
          return expect().fail(1);
        }).fail(function() {
          return '';
        }).then(function() {
          return expect().fail(3);
        });
        return setTimeout(done, 300);
      });
      it("should run when catch error thrown", function(done) {
        var error, i;
        i = -1;
        error = new Error('a');
        return The.then(function() {
          throw error;
        }).fail(function(err) {
          expect(++i).to.be.equal(0);
          expect(err).to.be.equal(error);
          return done();
        });
      });
      it("should run when catch object thrown", function(done) {
        var i, obj;
        i = -1;
        obj = {};
        return The.then(function() {
          throw obj;
          return expect().fail();
        }).fail(function(err) {
          expect(++i).to.be.equal(0);
          expect(err).to.be.equal(obj);
          return done();
        });
      });
      it("should run when catch error thrown in async actor", function(done) {
        var i;
        i = -1;
        return The.then(function(done) {
          return done('async1');
        }).then(function(message, done) {
          throw new Error(message);
          return setTimeout(function() {
            expect().fail();
            return done();
          }, 100);
        }).fail(function(err) {
          expect(++i).to.be.equal(0);
          expect(err.message).to.be.equal('async1');
          return done();
        });
      });
      it("should run when catch error in parallel actors", function(done) {
        var i;
        i = -1;
        return The.then([
          function() {
            throw new Error('a');
          }, function() {
            return '';
          }
        ]).fail(function(err) {
          expect(++i).to.be.equal(0);
          expect(err.message).to.be.equal('a');
          return done();
        });
      });
      it("should run when catch error in async parallel actors", function(done) {
        var i;
        i = -1;
        The.then([
          function(done) {
            throw new Error('a');
            return setTimeout(function() {
              expect().fail();
              return done();
            }, 100);
          }, function(done) {
            return setTimeout(function() {
              return done();
            }, 200);
          }
        ]).fail(function(err) {
          expect(++i).to.be.equal(0);
          return expect(err.message).to.be.equal('a');
        });
        return setTimeout(done, 300);
      });
      return it("should be able to recover the flow when done is called", function(done) {
        return The.then(function() {
          throw new Error('a');
          return expect().fail();
        }).fail(function(err, done) {
          if (err.message === 'a') {
            return done('b');
          } else {
            return expect().fail();
          }
        }).then(function(_arg) {
          var b;
          b = _arg[0];
          expect(b).to.be.equal('b');
          return done();
        });
      });
    });
  });

}).call(this);
