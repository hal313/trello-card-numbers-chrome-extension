(function () {
  'use strict';

  module.exports = function (grunt) {
 
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
  
    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);
  
    // Configurable paths
    var config = {
      app: 'app',
      dist: 'dist'
    },
    // Options for JSON files (the same as jshint, but minus single quotes)
    jshintJSONOptions,
    /**
     * Gets the path to the deployable package.
     * 
     * @return {String} the path to the deployable package.
     */
    getPackagePath = function getPackagePath() {
      return 'package/trello-card-numbers-' + grunt.file.readJSON('package.json').version + '.zip';
    };

    // Set jshintJSONOptions to be the same as .jshintrc, execpt with the quotmark to be "double" in order to support valid JSON
    jshintJSONOptions = JSON.parse(require('fs').readFileSync('.jshintrc').toString());
    jshintJSONOptions.quotmark = 'double';

    grunt.initConfig({
      // Project settings
      config: config,
  
      // Version bump configuration
      bump: {
        options: {
          files: ['package.json', 'package-lock.json'],
          commit: false,
          createTag: false,
          push: false
        }
      },

      // Watches files for changes and runs tasks based on the changed files
      watch: {
        js: {
          files: ['<%= config.app %>/scripts/{,*/}*.js'],
          tasks: ['jshint:source', 'build']
        },
        manifests: {
          files: ['<%= config.app %>/manifest.json'],
          tasks: ['jshint:manifest', 'build']
        }
      },
  
      // Empties folders to start fresh
      clean: {
        dist: {
          files: [{
            dot: true,
            src: [
              '<%= config.dist %>/*',
              '!<%= config.dist %>/.git*',
              'package/*'
            ]
          }]
        }
      },
  
      // Make sure code styles are up to par and there are no obvious mistakes
      jshint: {
        options: {
          reporterOutput: '',
          reporter: require('jshint-stylish')
        },
        manifest: {
          options: jshintJSONOptions,
          files: {
            src: ['<%= config.app %>/manifest.json']
          }
        },
        source: {
          options: {
            jshintrc: true
          },
          files: {
            src: ['<%= config.app %>/scripts/{,*/}*.js']
          }
        },
        gruntfile: {
          options: {
            jshintrc: true
          },
          files: {
            src: ['Gruntfile.js']
          }
        }
      },

      uglify: {
        scripts: {
          files: {
            // We can take advantage of runtime builds and place "shared" into both the background and the content script files;
            // this allows us to have shared contstants!
            // NOTE: Be sure that the shared code is listed first in order to allow the other scripts to have access immediately
            'dist/scripts/background.js': ['app/scripts/shared.js', 'app/scripts/background.js'],
            'dist/scripts/content.js': ['node_modules/jquery/dist/jquery.js', 'node_modules/lodash/lodash.js', 'app/scripts/shared.js', 'app/scripts/content.js']
          }
        }
      },

      // Copies remaining files to places other tasks can use
      copy: {
        dist: {
          files: [{
            expand: true,
            dot: true,
            cwd: '<%= config.app %>',
            dest: '<%= config.dist %>',
            src: [
              'manifest.json',
              'images/{,*/}*.{webp,gif,png}',
              '_locales/{,*/}*.json'
            ]
          }]
        }
      },
  
      // Increment the build number and prepare for packaging
      chromeManifest: {
        dist: {
          options: {
            buildnumber: 'both',
            indentSize: 2,
            background: {/*There is no background script to run*/}
          },
          src: '<%= config.app %>',
          dest: '<%= config.dist %>'
        }
      },

      // Compres dist files to package
      compress: {
        dist: {
          options: {
            archive: getPackagePath
          },
          files: [{
            expand: true,
            cwd: 'dist/',
            src: ['**'],
            dest: ''
          }]
        }
      }
    });


    ////////////////////////////////////////////////////////////////////////////
    // GRUNT TASK DEFINITIONS
    ////////////////////////////////////////////////////////////////////////////
    //
    // 'debug'
    // Constantly performs builds when deployable artifacts change    
    grunt.registerTask('debug', function () {
      grunt.task.run([
        'build',
        'watch'
      ]);
    });

    //
    // 'build'
    // Creates a static build, suitable for testing
    grunt.registerTask('build', [
      'uglify',
      'copy'
    ]);

    //
    // 'release'
    // Creates a build artifact, suitable for publishing to the Chrome Developer Dashboard
    grunt.registerTask('release', [
      // Check the code
      'jshint:source',
      'jshint:gruntfile',
      'jshint:manifest',
      // Clean the workspace
      'clean',
      // Do not automatically bump the version if the CI/CD server is publishing
      // // Bump the version
      //'version-bump',
      // Perform a build
      'build',
      // Build a deployable asset
      'compress'
    ]);

    //
    // 'version-bump'
    // Bumps the 'patch' version component in the manifest and the package.json file.
    grunt.registerTask('version-bump', ['bump:patch', 'chromeManifest']);

    //
    // 'deploy'
    // Deploy the artifact to the Chrome Web Store
    grunt.registerTask('deploy', ['Deploys a publishable artifact to the Chrome Web Store'], function publish() {
      // Be sure that the 'release' task was run
      grunt.task.requires('release');
      
      var done = this.async(),
          packagePath = getPackagePath(),
          fs = require('fs'),
          deploy = require('chrome-extension-deploy'),
          /**
           * Invoked when a publish is succesful.
           */
          onPublishSuccess = function onPublishSuccess() {
            grunt.log.ok(['Published "' + packagePath + '"']);
            done();
          },
          onPublishFail = function onPublishFail(error) {
            grunt.log.error('Error publishing "' + packagePath + '": ' + error.toString());
            done(false);
          };

      // Simulate publish success or fail
      if (grunt.option('fake-publish-fail')) {
        // Simulate a publish fail
        onPublishFail('Fake publish fail');
      } else if (grunt.option('fake-publish')) {
        // Simulate a publish success
        onPublishSuccess();
      } else {
        // Publish the deployable artifact
        deploy({
          // Obtained by following the instructions here: 
          // https://developer.chrome.com/webstore/using_webstore_api#beforeyoubegin 
          //
          // These are passed in via the command line
          // grunt publish --clientId=yourClientId --clientSecret=yourClientSecret --refreshToken=yourRefreshToken
          clientId: grunt.option('clientId'),
          clientSecret: grunt.option('clientSecret'),
          refreshToken: grunt.option('refreshToken'),

          // The ID of the extension 
          id: 'ijnbgfbpkcnohomlcomegpocpkneblep',

          // A Buffer or string containing your zipped extension 
          zip: fs.readFileSync(packagePath)
        })
          .then(onPublishSuccess)
          .catch(onPublishFail);
      }
                
    });

    //
    // 'publish'
    // Publishes the artifact to the Chrome Web Store
    grunt.registerTask('publish', ['release', 'deploy']);

    //
    // '' or 'default'
    // The default task; creates a build after validating code through jshint
    grunt.registerTask('default', [
      'jshint:source',
      'jshint:gruntfile',
      'jshint:manifest',
      'build'
    ]);
  };

})();