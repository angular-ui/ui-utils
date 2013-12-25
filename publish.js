/* jshint node:true */

'use strict';

var fs = require('fs');

module.exports = function() {

  //var modulesName = grunt.file.expand({ cwd: "modules" }, ["*","!utils.js"]);
  var modulesName = fs.readdirSync(__dirname + '/modules');

  function makingComponentData(memo, name){
    if(name === 'utils.js') return memo;

     memo[name] = {
      fullName : 'angular-ui-' + name,
      main :     './ui-' + name + '.js',
      src :       name + '.js'
    };

    return memo;
  }

  return {
    // gh-pages stuff
    humaName : 'UI.Utils',
    repoName : 'ui-utils',
    inlineHTML : fs.readFileSync(__dirname + '/demo/demos.html'),
    inlineJS : fs.readFileSync(__dirname + '/demo/demo.js'),
    // gh-pages css dependencies
    // css : []
    // gh-pages js dependencies
    js : ['dist/ui-utils.js'],


    // HACK...
    main_dist_dir: 'main',


    // The sub-components
    subcomponent : modulesName.reduce(makingComponentData, {}),
    // HACK...
    sub_dist_dir: 'sub'
  };
};
