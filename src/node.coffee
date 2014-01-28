exports.promisify = (fn) ->
  The.then (resolve, reject) ->
    fn (err, args...) ->
      if err?
        reject err
      else
        resolve.apply @, args
