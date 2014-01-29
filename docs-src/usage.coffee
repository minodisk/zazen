# Set the context of all process in the flow
The({ i: 0 })
# Runs synchronously when the process is function that doesn't have the argument named 'done'.
.then ->
  @i += 1
  console.log @i #=> 1
# Runs asynchronously when the process is function that doesn't have the argument named 'done'.
# The flow waits going to the next step till `done()` is called.
.then (done) ->
  setTimeout ->
    done()
  , 1000
# Pass value to the next step when done is called with parameter
.then (done) ->
  done 2
.then (value) ->
  @i += value
  console.log @i #=> 3
# Runs parallely when process is array of function.
# The flow waits for every process is done.
.then([
    (done) ->
        @i += 3
        setTimeout ->
          done()
        , 1000
  , ->
        @i += 5
])
.then ->
  console.log @i #=> 11
# When error is thrown in an process, flow will catch the error and jumps to 'fail' process.
.then ->
  if @i > 10
    throw 'i is over 10'
.then ->
  "this process won't be called"
.fail (err, done) ->
  alert 'fail'
  # When `done()` is called in fail process, flow will recover from the 'fail' process to next 'then' process
  @i -= 4
  if @i < 10
    done()
.then ->
  console.log @i #=> 7