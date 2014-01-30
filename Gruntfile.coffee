module.exports = (grunt) ->
  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    watch:
      main:
        files: [
          'src/*.coffee'
        ]
        tasks: [
          'main'
        ]
      test:
        files: [
          'test/src/*.coffee'
        ]
        tasks: [
          'test'
        ]

    coffee:
      main:
        options:
          join: true
        files:
          'zazen.js': [
            'src/zazen.coffee'
          ]
          'jquery.zazen.js': [
            'src/zazen.coffee'
            'src/jquerize.coffee'
          ]
      test:
        options:
          join: true
        files:
          'test/browser_test.js': [
            'test/src/test.coffee'
            'test/src/browser.coffee'
          ]
          'test/node_test.js': [
            'test/src/node.coffee'
            'test/src/test.coffee'
          ]

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
  grunt.loadNpmTasks 'grunt-bump'
  grunt.loadNpmTasks 'grunt-release'

  grunt.registerTask 'main', [
    'coffee:main'
  ]
  grunt.registerTask 'test', [
    'coffee:test'
  ]
  grunt.registerTask 'run', [
    'coffee'
  ]
  grunt.registerTask 'default', [
    'run'
    'watch'
  ]

  grunt.registerTask 'publish', [
    'bump'
    'release'
  ]
