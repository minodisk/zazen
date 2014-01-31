module.exports = (grunt) ->
  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    connect:
      site: {}

    watch:
      html:
        files: [
          'docs/**/*.html'
        ]
        options:
          livereload: true
      docs:
        files: [
          'src/**/*.js'
          'template/**/*'
        ]
        tasks: [
          'docs'
        ]
      scripts:
        files: [
          'template/public/scripts/*.coffee'
        ]
        tasks: [
          'scripts'
        ]

    coffee:
      scripts:
        expand: true,
        flatten: true,
        cwd: 'template/public/scripts',
        src: [ '*.coffee' ],
        dest: 'docs/public/scripts',
        ext: '.js'

    docco:
      docs:
        src: [ 'src/**/*.js' ]
        options:
          css: 'template/docco.css'
          template: 'template/docco.jst'


  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-docco'

  grunt.registerTask 'default', [
    'docs'
    'scripts'
    'connect'
    'watch'
  ]
  grunt.registerTask 'docs', [
#    'coffee:docs'
#    'doctest'
    'docco:docs'
  ]
  grunt.registerTask 'scripts', [
    'coffee:scripts'
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
