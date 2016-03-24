'use strict';

var _ = require('lodash'),
  path = require('path'),
  util = require('util'),
  generator = require('yeoman-generator');

function prettyName(str) {
  var strA = [];
  str = _.toLower(_.trim(_.deburr(str)))
  strA = _.split(str, ' ');
  strA = _.flatMap(strA, _.upperFirst)
  return _.join(strA, ' ');
}

module.exports = generator.Base.extend({
  // constructor for processing the optional name argument
  constructor: function() {
    // call 'base constructor'
    generator.Base.apply(this, arguments);

    // Add some optional arguments over the command line
    this.argument('name', {
      type: String,
      required: false
    });
    this.options.name = (this.options.name ? this.options.name : 'My Amazing Plugin');
    this.options.name = prettyName(this.options.name);

    this.argument('url', {
      type: String,
      required: false
    });
    try {
      require('git-remotes')(function(err, remotes) {
        this.options.url = (this.options.url ? this.options.url : remotes[0].url);
        try {
          this.options.url = require('github-url-from-git')(this.options.url);
        } catch (e) {}
      }.bind(this));
    } catch (err) {
      this.options.url = (this.options.url ? this.options.url : 'https://github.com/<username>/<repository-name>');
    }

    this.argument('author-uri', {
      type: String,
      required: false
    });
    try {
      var email = require('git-user-email')();
      this.options.authorUri = (this.options.authorUri ? this.options.authorUri : email);
    } catch (err) {
      this.options.authorUri = (this.options.authorUri ? this.options.authorUri : 'george.burdell@gmail.com');
    }

    this.argument('author-name', {
      type: String,
      required: false
    });
    try {
      var userName = require('git-user-name')();
      this.options.authorName = (this.options.authorName ? this.options.authorName : userName);
    } catch (err) {
      this.options.authorName = (this.options.authorName ? this.options.authorName : 'George Burdell');
    }
    this.options.authorName = prettyName(this.options.authorName);

    // Add a '--nocache' flag for forcing out the template cache downloaded from github
    this.option('nocache', {
      desc: 'Force downloading the template files and don\'t depend on any cache',
      default: false
    });
  },

  initializing: function() {
    var done = this.async();
    var tmplRoot = path.join(this.sourceRoot(), 'wordpress-plugin-boilerplate');

    // download the template files from this GitHub repo & branch
    this.remote('jjones646', 'WordPress-Plugin-Boilerplate', 'npm-yo', function(err, remote) {
      this.fs.copy(remote.cachePath, tmplRoot, {
        globOptions: {
          dot: true
        }
      });
    }.bind(this), this.options.nocache);

    // reset the template path for the generator
    this.sourceRoot(path.join(tmplRoot, 'plugin-name'));
    done();
  },

  //Ask for user input
  prompting: function() {
    var done = this.async();

    // The user prompts during plugin creation
    var prompts = [{
      name: 'name',
      message: 'What will be the name for the new plugin?',
      default: prettyName(this.options.name)
    }, {
      name: 'version',
      message: 'What will be the starting version?',
      default: '1.0.0'
    }, {
      name: 'author',
      message: 'Please give the author\'s name (First & Last):',
      default: prettyName(this.options.authorName)
    }, {
      name: 'authorUri',
      message: 'Please give an Email or URL for the author:',
      default: this.options.authorUri
    }, {
      name: 'url',
      message: 'Please give a URL for this plugin (Website/GitHub/etc.):',
      default: this.options.url
    }, {
      name: 'langResources',
      type: 'checkbox',
      message: 'Which resources will be needed for this plugin?',
      choices: [{
        name: 'css',
        checked: true
      }, {
        name: 'js',
        checked: true
      }]
    }, {
      name: 'needAdmin',
      type: 'confirm',
      message: 'Will this plugin need its own admin page?',
      default: true
    }, {
      name: 'license',
      type: 'list',
      message: 'Select the license for this plugin:',
      choices: [{
        name: 'GPLv2+',
        value: ['GPLv2+', 'http://www.gnu.org/licenses/gpl-2.0.txt']
      }, {
        name: 'GPLv3',
        value: ['GPLv3', 'http://www.gnu.org/licenses/gpl-3.0.txt']
      }, {
        name: 'Apache',
        value: ['Apache', 'http://www.apache.org/licenses/LICENSE-2.0']
      }, {
        name: 'MIT',
        value: ['MIT', 'https://opensource.org/licenses/MIT']
      }, {
        name: 'Public Domain',
        value: ['Public Domain', 'http://unlicense.org']
      }, {
        name: 'Other',
        value: ['', '']
      }],
      default: ['GPLv2+', 'http://www.gnu.org/licenses/gpl-2.0.txt']
    }];

    // process the answers from all the prompts here
    this.prompt(prompts, function(ans) {
      var name = _.toLower((ans.name));
      this.pluginName = {
        titleCase: prettyName(name),
        fileCase: _.kebabCase(name),
        snakeCase: _.snakeCase(name),
        classCase: _.startCase(name).split(' ').join('_')
      };
      this.author = {
        name: prettyName(ans.author),
        uri: ans.authorUri
      };
      this.license = {
        name: ans.license[0],
        uri: ans.license[1]
      };
      this.version = ans.version;
      this.url = ans.url;
      this.langResources = ans.langResources;
      this.installRequirements = ans.installRequirements;
      this.needAdmin = ans.needAdmin;
      done();
    }.bind(this));

    console.log(this.author);
  },

  // write out the new plugin scaffold
  writing: function() {
    // reset the destination path to be in a directory in the current one
    this.destinationRoot(path.join(this.destinationRoot(), this.pluginName.fileCase));

    // process the files for the root of the plugin directory
    var rootPaths = function(name) {
      return [
        name + '.php',
        'README.txt',
        'LICENSE.txt',
        'index.php',
        'uninstall.php'
      ];
    };
    // we create a zip array of the src/dst paths and iterate over them
    var rootFiles = _.zip(rootPaths('plugin-name'), rootPaths(this.pluginName.fileCase));
    _.forEach(rootFiles, function(f) {
      this.fs.copyTpl(
        this.templatePath(f[0]),
        this.destinationPath(f[1]),
        this
      );
    }.bind(this));

    // these are the paths for the files in the include directory
    var incPaths = function(name, dir) {
      return [
        path.join(dir, 'class-' + name + '.php'),
        path.join(dir, 'class-' + name + '-activator.php'),
        path.join(dir, 'class-' + name + '-deactivator.php'),
        path.join(dir, 'class-' + name + '-i18n.php'),
        path.join(dir, 'index.php')
      ];
    };
    // we create a zip array of the src/dst paths and iterate over them
    var incsFiles = _.zip(incPaths('plugin-name', 'includes'), incPaths(this.pluginName.fileCase, 'includes'));
    _.forEach(incsFiles, function(f) {
      this.fs.copyTpl(
        this.templatePath(f[0]),
        this.destinationPath(f[1]),
        this
      );
    }.bind(this));

    // these are the paths for the files in the public/admin directories
    var genPaths = function(name, dir) {
      return [
        path.join(dir, 'class-' + name + '-' + dir + '.php'),
        path.join(dir, 'js', name + '-' + dir + '.js'),
        path.join(dir, 'css', name + '-' + dir + '.css'),
        path.join(dir, 'partials', name + '-' + dir + '-display.php'),
        path.join(dir, 'index.php')
      ];
    };
    // defines 2 partials that return the src/dst file paths for a given directory name
    var srcPaths = _.partial(genPaths, 'plugin-name');
    var dstPaths = _.partial(genPaths, this.pluginName.fileCase);
    // we iterate over both public/admin directories and generate the paths
    // with the partials defined on the previous lines
    _.forEach(['public', 'admin'], function(dir) {
      _.forEach(_.zip(srcPaths(dir), dstPaths(dir)), function(f) {
        this.fs.copyTpl(
          this.templatePath(f[0]),
          this.destinationPath(f[1]),
          this
        );
      }.bind(this));
    }.bind(this));

    // now all we have left is the languages directory, just 1 file there
    this.fs.copyTpl(
      this.templatePath(path.join('languages', 'plugin-name.pot')),
      this.destinationPath(path.join('languages', this.pluginName.fileCase + '.pot')),
      this
    );
  },

  end: function() {

  }
});
