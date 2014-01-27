$.extend
  tajax: ->
    The
    .then (fail, done) ->
        $.ajax.apply(@, arguments)
        .fail(fail)
        .then(done)

$.fn.extend
  tanimate: ->
    The(@)
    .then (fail, done) ->
        $.fn.animate.apply(@, arguments)
        .promise()
        .fail(fail)
        .then(done)
