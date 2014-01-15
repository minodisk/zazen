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

    bump:
      options:
        files: [
          'package.json'
          'bower.json'
        ]
        commitFiles: [ '-a' ]

    release:
      options:
        bump: false
        add: false
        commit: false
        tag: false
        push: false
        pushTags: false

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-bump'
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
  grunt.registerTask 'publish', [
    'bump'
    'release'
  ]