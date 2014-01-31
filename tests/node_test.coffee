expect = require '../node_modules/expect.js'
{ The, promisify } = require '../zazen'

fs = require 'fs'
path = require 'path'

describe 'promisify()', ->
  it "it should wrap asynchronous Node method", (done) ->
    readFile = promisify fs.readFile
    readFile(path.join(__dirname, 'data/a.json'), encode: 'utf8')
    .fail (err) ->
      expect().fail()
    .then (data) ->
      expect(JSON.parse(data).message).to.be.equal 'a'
      done()