# Angular UI Docs
Doc generator of Angular-ui modules. 

This generator use Grunt, AngularJS, RequireJS and jQuery.

## How to add it !

Add it as a submodule of your module.

```sh
git submodule add git://github.com/angular-ui/angular-ui-docs.git out
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

```
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
            repoName : "<the github repo name>"
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

Then, like `index.html` automatically include a `demo.html` file, you will have to copy yours.

```Javascript
  grunt.initConfig({
    copy: {
        main: {
        files: [
          {src: ['demo/demo.html'], dest: 'out/demos.html', filter: 'isFile'}
          ]
      }
    }
});
```

In this file you can use RequireJS, AngularJS and jQuery.
I added a `requireCSS` as a HACK  'cause  it's home made...

In bonus, the id of each section tag in the page are drawn into a _Module_ menu at the top right of the page.

