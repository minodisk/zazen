module.exports = (grunt) ->
  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    watch:
      docs:
        files: [
          'docs-src/**/*.coffee'
        ]
        tasks: [ 'docs' ]

    docco:
      docs:
        src: [ 'docs-src/**/*.coffee' ]

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-docco'

  grunt.registerTask 'default', [
    'docs'
    'watch'
  ]
  grunt.registerTask 'docs', [
    'docco:docs'
  ]
