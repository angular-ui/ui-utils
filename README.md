# Angular UI Docs
Doc generator of Angular-ui modules. 

This generator use Grunt, AngularJS, RequireJS and jQuery.

## How to add it !

Add it as a bower component.

```sh
bower install git://github.com/angular-ui/angular-ui-docs.git
```
or add to your `bower.json`
```Javascript
  "devDependencies": {
    "angular-ui-docs": "angular-ui/angular-ui-docs"
  }
```

**It's working with ssh deploy key !**
You can find a quick tuto [here](https://gist.github.com/douglasduteil/5525750#file-travis-secure-key-sh).

After you added your deploy key to GitHub and Travis (in  `.travis.yml`).  Add a global value with your repo name, like : 

```
env:
  global:
  - REPO="git@github.com:<org>/<repo>.git"
  - secure: ! 'MR37oFN+bprRlI1/YS3...etc...
```

Then add the scripts and limit the build-able branches.

```yaml
before_script: out/.travis/before_script.sh
after_success: out/.travis/after_success.sh
branches:
  only:
  - <branch>
```

__Don't forget to create and push an orphan `gh-pages` branch.__


## Make your demo !

Travis will automatically run `grunt build-doc` ! 
First you need to generate the `index.html` using [grunt-contrib-copy](https://github.com/gruntjs/grunt-contrib-copy)

```Javascript
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      view : {
        humaName : "UI <repo>",
        repoName : "<the github repo name>",
        demoHTML : grunt.file.read("demo/demo.html"),
        demoJS   : grunt.file.read("demo/demo.js"),
        css : [
          '<any required css files>'
        ],
        js : [
          '<any required script files>'
        ]
      }
    },
    copy: {
      template : {
        options : {processContent : (function(content){
          return grunt.template.process(content);
        })},
        files: [
          {src: ['out/.tmpl/index.tmpl'], dest: 'out/index.html'}
        ]
      }
    }
```

This will generate `index.html` using :
 - the description in the `package.json`,
 - the `meta.view.humaName` as title of the demo site,
 - the `meta.view.repoName` in the github links,


## See it working locally !
Actually the demo must be built !
We are using _bower_ and  _grunt_ for this.

First in you UI project run
```sh
npm install && bower install
grunt build-doc
```

Then run a localhost on `bower_components/angular-ui-docs`
```sh
cd bower_components/angular-ui-docs
python -m SimpleHTTPServer
or
php -S localhost:8000
```

and you'll have the generated website on http://localhost:8000/
