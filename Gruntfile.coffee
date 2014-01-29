module.exports = (grunt) ->
  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    connect:
      site: {}

    watch:
      docs:
        files: [
          'src/**/*.js'
        ]
        tasks: [ 'docs' ]
      html:
        files: [
          'docs/**/*.html'
        ]
        options:
          livereload: true

#    coffee:
#      docs:
#        options:
#          bare: true
#          literate: true
#        expand: true,
#        flatten: true,
#        cwd: 'src',
#        src: [ '*.js' ],
#        dest: 'src',
#        ext: '.js'

    docco:
      docs:
        src: [ 'src/**/*.js' ]
        options:
#          layout: 'linear'
          css: 'template/docco.css'
          template: 'template/docco.jst'


  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-connect'
#  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-docco'

  grunt.registerTask 'default', [
    'docs'
    'connect'
    'watch'
  ]
  grunt.registerTask 'docs', [
#    'coffee:docs'
#    'doctest'
    'docco:docs'
  ]
#  grunt.registerTask 'doctest', ->
#    done = @async()
#    { exec } = require 'child_process'
#    exec 'node_modules/power-doctest/bin/power-doctest.js src/*.js',
#    (err, stdout, stderr) ->
#      console.log 'stdout:', stdout
#      console.log 'stderr:', stderr
#      if err?
#        console.log 'error:', err
#      else
#        done()
