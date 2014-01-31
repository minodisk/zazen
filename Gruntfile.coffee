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
          'tests/src/*.coffee'
        ]
        tasks: [
          'test'
        ]

    concat:
      'test-browser':
        src: [
          'tests/src/browser0.coffee'
          'tests/src/test.coffee'
          'tests/src/browser1.coffee'
        ]
        dest: 'tests/browser_test.coffee'
      'test-node':
        src: [
          'tests/src/node0.coffee'
          'tests/src/test.coffee'
          'tests/src/node1.coffee'
        ]
        dest: 'tests/node_test.coffee'

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
        files:
          'tests/browser_test.js': 'tests/browser_test.coffee'
          'tests/node_test.js': 'tests/node_test.coffee'

    clean:
      test: [
        'tests/*.coffee'
        'tests/*.js'
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
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-bump'
  grunt.loadNpmTasks 'grunt-release'

  grunt.registerTask 'main', [
    'coffee:main'
  ]
  grunt.registerTask 'run', [
    'main'
  ]
  grunt.registerTask 'default', [
    'run'
    'watch'
  ]

  grunt.registerTask 'before_tests', [
    'concat:test-browser'
    'concat:test-node'
    'coffee:test'
  ]
  grunt.registerTask 'after_tests', [
    'clean:test'
  ]

  grunt.registerTask 'publish', [
    'bump'
    'release'
  ]
