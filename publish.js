/* jshint node:true */

'use strict';

var fs = require('fs');

module.exports = function() {

  var modulesName = [];
  if (fs.existsSync(__dirname + '/dist/sub')){
    modulesName = fs.readdirSync(__dirname + '/dist/sub');
  }

  function makingComponentData(memo, name){
    memo[name] = {
      name: 'angular-ui-' + name,
      main: './' + name + '.js'
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

    bowerData : { main: './ui-utils.js'},

    // The sub-components
    subcomponents : modulesName.reduce(makingComponentData, {}),
    // HACK...
    sub_dist_dir: 'sub'
  };
};
