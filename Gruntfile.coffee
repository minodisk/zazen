module.exports = (grunt) ->
  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    watch:
      lib:
        files: [
          'src/*.coffee'
        ]
        tasks: [ 'lib' ]

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

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-release'

  grunt.registerTask 'default', [
    'run'
    'watch'
  ]
  grunt.registerTask 'run', [
    'lib'
  ]
  grunt.registerTask 'lib', [
    'coffee:lib'
  ]