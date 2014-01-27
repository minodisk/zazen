module.exports = (grunt) ->
  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    watch:
      main:
        files: [
          'src/zazen.coffee'
        ]
        tasks: [ 'main' ]
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
#        options:
#          bare: true
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
#        commit: false
#        createTag: false
#        push: false

    release:
      options:
        bump: false
        add: false
        commit: false
        push: false
        tag: false
        pushTags: false
#        add: true
#        commit: true
#        commitMessage: 'Release v<%= version %>'
#        push: true
#        tag: true
#        tagName: 'v<%= version %>'
#        tagMessage: 'Version <%= version %>'
#        pushTags: true

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
    'main'
    'jquerize'
    'doc'
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