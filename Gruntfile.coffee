module.exports = (grunt) ->
  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    watch:
      lib:
        files: [
          'src/*.coffee'
        ]
        tasks: [ 'lib' ]
      test:
        files: [
          'test/test.coffee'
        ]
        tasks: [ 'test' ]

    concat:
      test:
        src: [
          'test/require.coffee'
          'test/test.coffee'
        ]
        dest: 'test/nodetest.coffee'

    coffee:
      lib:
        options:
          bare: true
        files: [
          expand: true
          flatten: true
          cwd: 'src'
          src: [ '*.coffee' ]
          dest: 'lib'
          ext: '.js'
        ]
      test:
        files: [
          expand: true
          flatten: true
          cwd: 'test'
          src: [
            'test.coffee'
            'nodetest.coffee'
          ]
          dest: 'test'
          ext: '.js'
        ]

#    bump:
#      options:
#        files: [
#          'package.json'
#          'bower.json'
#        ]
#        commitFiles: [
#          'package.json'
#          'bower.json'
#        ]

    clean:
      test: [
        'test/nodetest.coffee'
      ]
      js: [
        'test/*.js'
      ]

    release:
      options:
        commitMessage: 'Release v<%= version %>'
        tagName: 'v<%= version %>'
        tagMessage: 'Version <%= version %>'

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-release'

  grunt.registerTask 'default', [
    'run'
    'watch'
  ]
  grunt.registerTask 'run', [
    'lib'
    'test'
  ]
  grunt.registerTask 'lib', [
    'coffee:lib'
  ]
  grunt.registerTask 'test', [
    'concat:test'
    'coffee:test'
    'clean:test'
  ]
  grunt.registerTask 'release', [
    'clean:js'
    'release'
  ]