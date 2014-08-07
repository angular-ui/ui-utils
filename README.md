# UI.Utils [![Build Status](https://travis-ci.org/angular-ui/ui-utils.png?branch=master)](https://travis-ci.org/angular-ui/ui-utils)

The companion suite for AngularJS

## Requirements

- AngularJS

## Usage


You can get it from [Bower](http://bower.io/)

```sh
# All the modules
bower install angular-ui-utils#bower

# A specific module
# bower install angular-ui-utils#bower-<moduleName>
bower install angular-ui-utils#bower-event
bower install angular-ui-utils#bower-keypress
...

# A specific version
bower install angular-ui-utils#v0.0.4
# A specific module version
bower install angular-ui-utils#event-0.0.4
bower install angular-ui-utils#keypress-0.0.4
...

# If you want the sources with it
bower install angular-ui-utils
# or for a specific source version
bower install angular-ui-utils#src0.0.4
```

This will copy the UI.Utils files into a `bower_components` folder, along with its dependencies. Load the script files in your application:

```html
<script type="text/javascript" src="bower_components/angular/angular.js"></script>
<!-- for all the modules -->
<script type="text/javascript" src="bower_components/angular-ui-utils/ui-utils.js"></script>

<!-- or just specific one-->
<script type="text/javascript" src="bower_components/angular-ui-event/event.js"></script>
<script type="text/javascript" src="bower_components/angular-ui-keypress/keypress.js"></script>
<!-- ... -->
```

Add the specific modules to your dependencies, or add the entire lib by depending on `ui.utils`

```javascript
angular.module('myApp', ['ui.keypress', 'ui.event', ...])
// or if ALL modules are loaded along with modules/utils.js
var myAppModule = angular.module('MyApp', ['ui.utils']);
```

Each directive and filter is now it's own module and will have a relevant README.md in their respective folders

## Development

We use Karma and jshint to ensure the quality of the code.  The easiest way to run these checks is to use grunt:

```sh
npm install -g grunt-cli
npm install && bower install
grunt
```

The karma task will try to open Firefox and Chrome as browser in which to run the tests.  Make sure this is available or change the configuration in `test\karma.conf.js`


### Grunt Serve

We have one task to serve them all !

```sh
grunt serve
```

It's equal to run separately:

* `grunt connect:server` : giving you a development server at [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

* `grunt karma:server` : giving you a Karma server to run tests (at [http://localhost:9876/](http://localhost:9876/) by default). You can force a test on this server with `grunt karma:unit:run`.

* `grunt watch` : will automatically test your code and build your demo.  You can demo generation with `grunt build:gh-pages`.
