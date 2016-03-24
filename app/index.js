'use strict';

var _ = require('lodash');
var path = require('path');
var generator = require('yeoman-generator');

module.exports = generator.Base.extend({
  // constructor for processing the optional name argument
  constructor: function() {
    // call 'base constructor'
    generator.Base.apply(this, arguments);
    // This makes `plugin-name` a required argument.
    this.argument('name', {
      type: String,
      required: false
    });
  },

  initializing: function() {
    var done = this.async();
    var fss = this.fs;
    var tmplRoot = path.join(this.sourceRoot(), 'wordpress-plugin-boilerplate');
    // default to this github repo and branch
    this.remote('jjones646', 'WordPress-Plugin-Boilerplate', 'npm-yo', function(err, remote) {
      fss.copy(remote.cachePath, tmplRoot, {
        globOptions: {
          dot: true
        }
      });
    });
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
      default: 'My Amazing Plugin'
    }, {
      name: 'version',
      message: 'What will be the starting version?',
      default: '1.0.0'
    }, {
      name: 'author',
      message: 'Please give the author\'s name (First & Last):',
      default: 'George Burdell'
    }, {
      name: 'authorUri',
      message: 'Please give an Email or URL for the author:',
      default: 'https://githum.com/'
    }, {
      name: 'url',
      message: 'Please give a URL for this plugin (Website/GitHub/etc.):',
      default: 'https://githum.com/'
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
      }],
    }, {
      name: 'installRequirements',
      type: 'checkbox',
      message: 'Select which installation/removal options will be supported for this plugin?',
      choices: [{
        name: 'Activate',
        checked: true
      }, {
        name: 'Deactivate',
        checked: true
      }, {
        name: 'Uninstall',
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
      var name = _.trim(_.deburr(ans.name));
      this.pluginName = {
        titleCase: _.startCase(name),
        fileCase: _.kebabCase(name),
        snakeCase: _.snakeCase(name),
        classCase: _.replace(_.startCase(name), ' ', '_')
      };
      this.pluginVersion = ans.version;
      this.author = {
        name: _.startCase(ans.author),
        uri: ans.authorUri
      };
      this.url = ans.url;
      this.langResources = ans.langResources;
      this.installRequirements = ans.installRequirements;
      this.needAdmin = ans.needAdmin;
      this.license = {
        name: ans.license[0],
        uri: ans.license[1]
      };
      done();
    }.bind(this));
  },

  // write out the new plugin scaffold
  writing: function() {
    // reset the destination path to be in a directory at the current destination path
    this.destinationRoot(path.join(this.destinationRoot(), this.pluginName.fileCase));
    // copy the files into this new directory, updating the names in the process
    this.fs.copyTpl(
      this.templatePath('plugin-name.php'),
      this.destinationPath(this.pluginName.fileCase + '.php'),
      this
    );
  }
});
