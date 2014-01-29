(function() {
  var now;

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
      return it("should be a shorthand for `new The().wait()`", function(done) {
        var i, time;
        i = -1;
        time = now();
        The.wait(100).then(function() {
          expect(++i).to.be.equal(1);
          expect(now() - time).to.be.above(100);
          return done();
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
            return The(this).then(function(resolve) {
              var intervalId,
                _this = this;
              expect(this.x).to.be.equal(0);
              return intervalId = setInterval(function() {
                if (++_this.x >= 10) {
                  clearInterval(intervalId);
                  return resolve();
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
        The.then(function(resolve) {
          expect(i).to.be.equal(0, 'then0');
          return setTimeout(function() {
            expect(++i).to.be.equal(1, 'then0+');
            return resolve();
          }, 100);
        }).then(function(resolve) {
          expect(i).to.be.equal(1, 'then1');
          expect(now() - time).to.be.above(100);
          return setTimeout(function() {
            expect(++i).to.be.equal(2, 'then1+');
            return resolve();
          }, 100);
        }).then(function(resolve) {
          expect(i).to.be.equal(2, 'then2');
          expect(now() - time).to.be.above(200);
          return setTimeout(function() {
            expect(++i).to.be.equal(3, 'then2+');
            return resolve();
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
          function(resolve) {
            expect(i).to.be.equal(0);
            return setTimeout(function() {
              expect(++i).to.be.equal(3, 'then3');
              return resolve();
            }, 300);
          }, function(resolve) {
            expect(i).to.be.equal(0);
            return setTimeout(function() {
              expect(++i).to.be.equal(1, 'then1');
              return resolve();
            }, 100);
          }, function(resolve) {
            expect(i).to.be.equal(0);
            return setTimeout(function() {
              expect(++i).to.be.equal(2, 'then2');
              return resolve();
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
          return actors.push(function(resolve) {
            expect(i).to.be.equal(0);
            return setTimeout(function() {
              expect(++i).to.be.equal(j);
              return resolve();
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
        return The.then(function(resolve) {
          return resolve('a', 'b');
        }).then(function(res, resolve) {
          expect(res[0]).to.be.equal('a');
          expect(res[1]).to.be.equal('b');
          return setTimeout(function() {
            return resolve('c', 'd');
          }, 10);
        }).then([
          function(res, resolve) {
            expect(res[0]).to.be.equal('c');
            expect(res[1]).to.be.equal('d');
            return setTimeout(function() {
              return resolve('e', 'f');
            }, 20);
          }, function(res, resolve) {
            expect(res[0]).to.be.equal('c');
            expect(res[1]).to.be.equal('d');
            return resolve('g', 'h');
          }, function(res, resolve) {
            expect(res[0]).to.be.equal('c');
            expect(res[1]).to.be.equal('d');
            return setTimeout(function() {
              return resolve('i', 'j');
            }, 10);
          }
        ]).then(function(_arg, resolve) {
          var res0, res1, res2;
          res0 = _arg[0], res1 = _arg[1], res2 = _arg[2];
          expect(res0[0]).to.be.equal('e');
          expect(res0[1]).to.be.equal('f');
          expect(res1[0]).to.be.equal('g');
          expect(res1[1]).to.be.equal('h');
          expect(res2[0]).to.be.equal('i');
          expect(res2[1]).to.be.equal('j');
          return setTimeout(function() {
            return resolve('k', 'l');
          }, 10);
        }).then(function(res) {
          expect(res[0]).to.be.equal('k');
          expect(res[1]).to.be.equal('l');
          return The.then([
            function(resolve) {
              return setTimeout(function() {
                return resolve('m', 'n');
              }, 20);
            }, function(resolve) {
              return setTimeout(function() {
                return resolve('o', 'p');
              }, 10);
            }, function(resolve) {
              return resolve('q', 'r');
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
            The.then(function(resolve) {
              return resolve('s', 't');
            }), The.then(function(resolve) {
              return setTimeout(function() {
                return resolve('u', 'v');
              }, 10);
            }), The.then(function(resolve) {
              return resolve('x', 'y');
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
              return The.then(function(resolve) {
                return setTimeout(function() {
                  return resolve('z', 'A');
                }, 10);
              });
            }, function() {
              return The.then(function(resolve) {
                return resolve('B', 'C');
              });
            }, function() {
              return The.then(function(resolve) {
                return setTimeout(function() {
                  return resolve('D', 'E');
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
        the = The.then(function(resolve) {
          return setTimeout(resolve, 200);
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
        the = The.then(function(resolve) {
          var timeoutId;
          timeoutId = setTimeout(function() {
            expect().fail();
            return resolve();
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
        the = The.then(function(resolve) {
          return setTimeout(resolve, 200);
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
        the = The.then(function(resolve) {
          var timeoutId;
          expect(++i).to.be.equal(1);
          expect(the.index).to.be.equal(0);
          timeoutId = setTimeout(function() {
            expect(the.index).to.be.equal(0);
            return resolve();
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
        var error, i;
        i = 0;
        error = new Error('exception');
        return The.then(function() {
          return expect(++i).to.be.equal(1);
        }).then(function(resolve) {
          expect(++i).to.be.equal(2);
          if (false) {
            throw error;
          } else {
            return resolve('a');
          }
        }).then(function(_arg, resolve) {
          var a;
          a = _arg[0];
          expect(++i).to.be.equal(3);
          expect(a).to.be.equal('a');
          return resolve('b');
        }).fail(function() {
          ++i;
          return expect().fail();
        }).then(function(_arg) {
          var b;
          b = _arg[0];
          expect(++i).to.be.equal(4);
          expect(b).to.be.equal('b');
          return done();
        });
      });
      it("should be skipped when reject isn't called", function(done) {
        var error, i;
        i = 0;
        error = 'exception';
        return The.then(function() {
          return expect(++i).to.be.equal(1);
        }).then(function(resolve, reject) {
          expect(++i).to.be.equal(2);
          if (false) {
            return reject(error);
          } else {
            return resolve('a');
          }
        }).then(function(_arg, resolve) {
          var a;
          a = _arg[0];
          expect(++i).to.be.equal(3);
          expect(a).to.be.equal('a');
          return resolve('b');
        }).fail(function() {
          ++i;
          return expect().fail();
        }).then(function(_arg) {
          var b;
          b = _arg[0];
          expect(++i).to.be.equal(4);
          expect(b).to.be.equal('b');
          return done();
        });
      });
      it("should run when an error is thrown", function(done) {
        var error, i;
        i = 0;
        error = new Error('exception');
        return The.then(function() {
          return expect(++i).to.be.equal(1);
        }).then(function(resolve) {
          expect(++i).to.be.equal(2);
          if (true) {
            throw error;
          } else {
            return resolve('a');
          }
        }).then(function(_arg, resolve) {
          var a;
          a = _arg[0];
          ++i;
          expect().fail();
          return resolve('b');
        }).fail(function(err) {
          expect(err).to.be.equal(error);
          return done();
        }).then(function(_arg) {
          var b;
          b = _arg[0];
          ++i;
          expect().fail();
          return done();
        });
      });
      it("should run when reject is called", function(done) {
        var error, i;
        i = 0;
        error = 'exception';
        return The.then(function() {
          return expect(++i).to.be.equal(1);
        }).then(function(resolve, reject) {
          expect(++i).to.be.equal(2);
          if (true) {
            return reject(error);
          } else {
            return resolve('a');
          }
        }).then(function(_arg, resolve) {
          var a;
          a = _arg[0];
          ++i;
          expect().fail();
          return resolve('b');
        }).fail(function(err) {
          expect(err).to.be.equal(error);
          return done();
        }).then(function(_arg) {
          var b;
          b = _arg[0];
          ++i;
          expect().fail();
          return done();
        });
      });
      it("should run when a object is thrown", function(done) {
        var error, i;
        i = 0;
        error = {};
        return The.then(function() {
          return expect(++i).to.be.equal(1);
        }).then(function(resolve) {
          expect(++i).to.be.equal(2);
          if (true) {
            throw error;
          } else {
            return resolve('a');
          }
        }).then(function(_arg, resolve) {
          var a;
          a = _arg[0];
          ++i;
          expect().fail();
          return resolve('b');
        }).fail(function(err) {
          expect(err).to.be.equal(error);
          return done();
        }).then(function(_arg) {
          var b;
          b = _arg[0];
          ++i;
          expect().fail();
          return done();
        });
      });
      it("should be skipped when an error is thrown asynchronously", function(done) {
        var error, i;
        i = 0;
        error = new Error('exception');
        return The.then(function() {
          return expect(++i).to.be.equal(1);
        }).then(function(resolve) {
          expect(++i).to.be.equal(2);
          return setTimeout(function() {
            if (false) {
              throw error;
            } else {
              return resolve('a');
            }
          }, 100);
        }).then(function(_arg, resolve) {
          var a;
          a = _arg[0];
          expect(++i).to.be.equal(3);
          expect(a).to.be.equal('a');
          return resolve('b');
        }).fail(function() {
          ++i;
          return expect().fail();
        }).then(function(_arg) {
          var b;
          b = _arg[0];
          expect(++i).to.be.equal(4);
          expect(b).to.be.equal('b');
          return done();
        });
      });
      it("should run when reject is called asynchronously", function(done) {
        var error, i;
        i = 0;
        error = 'exception';
        return The.then(function() {
          return expect(++i).to.be.equal(1);
        }).then(function(resolve, reject) {
          expect(++i).to.be.equal(2);
          return setTimeout(function() {
            if (true) {
              return reject(error);
            } else {
              return resolve('a');
            }
          }, 100);
        }).then(function(_arg, resolve) {
          var a;
          a = _arg[0];
          ++i;
          expect().fail();
          return resolve('b');
        }).fail(function(err) {
          expect(err).to.be.equal(error);
          return done();
        }).then(function(_arg) {
          var b;
          b = _arg[0];
          ++i;
          expect().fail();
          return done();
        });
      });
      it("should run when an error is thrown in parallel actors", function(done) {
        var error, i;
        i = -1;
        error = new Error('exception');
        return The.then([
          function() {
            throw error;
          }, function() {
            return '';
          }
        ]).fail(function(err) {
          expect(++i).to.be.equal(0);
          expect(err).to.be.equal(error);
          return done();
        });
      });
      it("should run when reject is called asynchronously in parallel actors", function(done) {
        var error, i;
        i = -1;
        error = 'exception';
        The.then([
          function(resolve, reject) {
            return setTimeout(function() {
              if (true) {
                return reject(error);
              } else {
                return resolve('a');
              }
            }, 100);
          }, function(resolve) {
            return setTimeout(function() {
              return resolve();
            }, 200);
          }
        ]).fail(function(err) {
          expect(++i).to.be.equal(0);
          return expect(err).to.be.equal(error);
        });
        return setTimeout(done, 300);
      });
      it("should recover the flow when resolve is called in fail runner", function(done) {
        return The.then(function() {
          throw new Error('a');
          return expect().fail();
        }).fail(function(err, resolve) {
          if (true) {
            return resolve('b');
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
      it("should recover the flow when resolve is called in fail runner asynchronously", function(done) {
        return The.then(function() {
          throw new Error('a');
          return expect().fail();
        }).fail(function(err, resolve) {
          return setTimeout(function() {
            if (true) {
              return resolve('b');
            } else {
              return expect().fail();
            }
          }, 100);
        }).then(function(_arg) {
          var b;
          b = _arg[0];
          expect(b).to.be.equal('b');
          return done();
        });
      });
      it("should step to the next fail when reject is called in fail runner", function(done) {
        var error;
        error = new Error('a');
        return The.then(function() {
          throw error;
          return expect().fail();
        }).fail(function(err, reject) {
          if (false) {
            return expect().fail();
          } else {
            return reject(err);
          }
        }).then(function() {
          return expect().fail();
        }).fail(function(err, resolve) {
          expect(err).to.be.equal(error);
          return resolve('b');
        }).then(function(_arg) {
          var b;
          b = _arg[0];
          expect(b).to.be.equal(b);
          return done();
        });
      });
      return it("should step to the next fail when reject is called in fail runner asynchronously", function(done) {
        var error;
        error = new Error('a');
        return The.then(function() {
          throw error;
          return expect().fail();
        }).fail(function(err, reject) {
          if (false) {
            return expect().fail();
          } else {
            return reject(err);
          }
        }).then(function() {
          return expect().fail();
        }).fail(function(err, resolve) {
          expect(err).to.be.equal(error);
          return resolve('b');
        }).then(function(_arg) {
          var b;
          b = _arg[0];
          expect(b).to.be.equal(b);
          return done();
        });
      });
    });
  });

}).call(this);
