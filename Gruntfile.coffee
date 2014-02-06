module.exports = (grunt) ->
  pkg = grunt.file.readJSON 'package.json'

  grunt.initConfig

    pkg: pkg

    connect:
      site: {}

    watch:
      html:
        files: [
          'docs/*'
          'docs/fonts/*'
          'docs/images/*'
          'docs/scripts/*'
          'docs/styles/*'
        ]
        options:
          livereload: true
      docs:
        files: [
          'src/**/*.js'
          'template/*'
        ]
        tasks: [
          'docs'
        ]
      scripts:
        files: [
          'template/scripts/*.coffee'
        ]
        tasks: [
          'scripts'
        ]
      styles:
        files: [
          'template/styles/*.scss'
        ]
        tasks: [
          'styles'
        ]

    coffee:
      scripts:
        expand: true
        flatten: true
        cwd: 'template/scripts'
        src: [ '*.coffee' ]
        dest: 'docs/scripts'
        ext: '.js'

    sass:
      styles:
        expand: true
        flatten: true
        cwd: 'template/styles'
        src: [ '*.scss' ]
        dest: 'docs/styles'
        ext: '.css'

    docco:
      docs:
        src: [ 'src/**/*.js' ]
        options:
          css: 'template/docco.css'
          template: 'template/docco.jst'
          pkg: pkg

  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-sass'
  grunt.loadNpmTasks 'grunt-docco'

  grunt.registerTask 'default', [
    'connect'
    'docs'
    'scripts'
    'styles'
    'watch'
  ]
  grunt.registerTask 'docs', [
    'docco:docs'
  ]
  grunt.registerTask 'scripts', [
    'coffee:scripts'
  ]
  grunt.registerTask 'styles', [
    'sass:styles'
  ]
