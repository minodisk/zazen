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

    concat:
      'test-browser':
        src: [
          'test/src/browser0.coffee'
          'test/src/test.coffee'
          'test/src/browser1.coffee'
        ]
        dest: 'test/browser_test.coffee'
      'test-node':
        src: [
          'test/src/node0.coffee'
          'test/src/test.coffee'
          'test/src/node1.coffee'
        ]
        dest: 'test/node_test.coffee'

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
          'test/browser_test.js': 'test/browser_test.coffee'
          'test/node_test.js': 'test/node_test.coffee'

    clean:
      test: [
        'test/browser_test.coffee'
        'test/node_test.coffee'
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
  grunt.registerTask 'test', [
    'concat:test-browser'
    'concat:test-node'
    'coffee:test'
    'clean:test'
  ]
  grunt.registerTask 'run', [
    'main'
    'test'
  ]
  grunt.registerTask 'default', [
    'run'
    'watch'
  ]

  grunt.registerTask 'publish', [
    'bump'
    'release'
  ]
