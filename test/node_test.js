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
    return describe('#constructor()', function() {
      it('should create The instance', function() {
        return expect(new The()).to.be.a(The);
      });
      return it('should create The instance without new operator', function() {
        return expect(The()).to.be.a(The);
      });
    });
  });

}).call(this);
