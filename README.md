# generator-wpplug

A [Yeoman](http://yeoman.io) generator based on the famous [Wordpress-Plugin-Boilerplate](https://github.com/DevinVinson/WordPress-Plugin-Boilerplate) for quickly starting a new [wordpress plugin](https://wordpress.org/plugins).


## Getting Started

### Prerequisites

- [npm](https://npmjs.org) (javascript package manager)
- [Yeoman](http://yeoman.io) (app scaffold generator framework)

If you're using Ubuntu or a similar Debian based Linux distro, these are pretty easy to install as shown below.
```
# install npm
sudo apt-get install npm

# install yeoman for npm to use
sudo npm install -g yo
```


### Installing

To install this generator for use with the `yo` command, use the following command:

```
npm install -g generator-wpplug
```

### How to Use

Open a terminal and cd to the directory you'd like your soon-to-be plugin to be created in. This is usually the wordpress plugin directory, but you could also do everything on your own computer and move it to wordpress server later.

```
# cd into the wordpress plugin directory
cd wp-content/plugins
```

Now use the `yo` command to create the template for your new plugin.

```
# Run the generator
yo wpplug-generator
```


## License

[MIT License](./LICENSE)
