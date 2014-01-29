module.exports = (grunt) ->
  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    watch:
      main:
        files: [
          'src/zazen.coffee'
        ]
        tasks: [ 'coffee' ]
      jquerize:
        files: [
          'src/jquerize.coffee'
        ]
        tasks: [ 'jquerize' ]
      doc:
        files: [
          'docs/**/*.coffee'
        ]
        tasks: [ 'doc' ]

    coffee:
      main:
        files:
          'zazen.js': [ 'src/zazen.coffee' ]
      jquerize:
        options:
          join: true
        files:
          'jquery.zazen.js': [ 'src/zazen.coffee', 'src/jquerize.coffee' ]

    docco:
      doc:
        src: [ 'docs/**/*.coffee' ]

    bump:
      options:
        files: [
          'package.json'
          'bower.json'
        ]
        pushTo: 'origin'

    release:
      options:
        bump: false
        add: false
        commit: false
        push: false
        tag: false
        pushTags: false

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-docco'
  grunt.loadNpmTasks 'grunt-bump'
  grunt.loadNpmTasks 'grunt-release'

  grunt.registerTask 'default', [
    'run'
    'watch'
  ]
  grunt.registerTask 'run', [
    'coffee'
  ]
  grunt.registerTask 'main', [
    'coffee:main'
  ]
  grunt.registerTask 'jquerize', [
    'coffee:jquerize'
  ]
  grunt.registerTask 'doc', [
    'docco:doc'
  ]
  grunt.registerTask 'publish', [
    'bump'
    'release'
  ]