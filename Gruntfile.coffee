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
        pushTo: 'origin'
#        commit: false
#        createTag: false
#        push: false

    release:
      options:
        bump: false
        add false
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