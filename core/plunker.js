/*
 * Fork of https://github.com/angular-ui/bootstrap/blob/gh-pages/assets/plunker.js
 */
angular.module('plunker', [])

  .factory('plunkGenerator', function ($document) {

    return function (ngVersion, moduleName, repoName, content, vendor_css, vendor_js) {

      //HACK to add the css content...
      if (content.css !== void 0) vendor_css.push('style.css');

      var form = angular.element('<form style="display: none;" method="post" action="http://plnkr.co/edit/?p=preview" target="_blank"></form>');
      var addField = function (name, value) {
        var input = angular.element('<input type="hidden" name="' + name + '">');
        input.attr('value', value);
        form.append(input);
      };

      var listUpScript = function(jsFiles){
        var r = "";
        for(var i = 0, len = jsFiles.length; i < len; i++) {
          r += '      <script src="' + jsFiles[i] + '"></script>\n';
        }

        return r;
      };

      var listUpLink = function(cssFiles){
        var r = "";
        for(var i = 0, len = cssFiles.length; i < len; i++) {
          r += '    <link rel="stylesheet" type="text/css" href="' + cssFiles[i] + '"/>\n';
        }
        return r;
      };

      var indexContent = function () {
        return '<!DOCTYPE html>\n' +
          '<html ng-app="x">\n\n' +
          '  <head>\n' +
          '    <meta charset="utf-8" />\n' +
          '    <title>' + moduleName + ' : demo </title>\n\n\n' +
          '    <!-- Le css -->\n' +

          listUpLink(vendor_css) + '\n' +

          '  </head>\n' +
          '  <body>\n\n\n' +
          '    <!-- Le content... -->\n' +

          content.markup + '\n\n\n' +

          '    <!-- Le vendor... -->\n' +
          '      <script src="https://ajax.googleapis.com/ajax/libs/angularjs/'+ngVersion+'/angular.min.js"></script>\n' +

          listUpScript(vendor_js) +

          '      <script src="http://angular-ui.github.io/' + repoName + '/build/' + repoName + '.js"></script>\n' +

          '    <script src="app.js"></script>\n' +
          '  </body>\n' +
          '</html>\n';
      };

      var scriptContent = function(content) {
        return "var app = angular.module('x', ['" + moduleName.toLowerCase() + "']);" + "\n\n\n" + content;
      };



      addField('description', 'http://angular-ui.github.io/' + repoName);
      addField('files[index.html]', indexContent(content));
      addField('files[app.js]', scriptContent(content.javascript || ""));

      if (content.css){
        addField('files[style.css]', content.css);
      }

      $document.find('body').append(form);
      form[0].submit();
      form.remove();
    };
  })

  .controller('PlunkerCtrl', function ($scope, plunkGenerator) {

    $scope.content = {};
    $scope.vendor_css = [];
    $scope.vendor_js = [];

    $scope.edit = function (ngVersion, moduleName, repoName) {
      plunkGenerator(ngVersion, moduleName, repoName,
        $scope.content, $scope.vendor_css, $scope.vendor_js
      );
    };
  })

  .directive('plunkerContent', function () {
    return {
      link:function (scope, element, attrs) {
        var htmlContent = "";
        angular.forEach(element.find('li'), function(e){
          t = angular.element(e).text();
          htmlContent += (t.trim() === '') ? "\n" : t +"\n";
        });
        scope.content[attrs.plunkerContent] = htmlContent;
      }
    }
  });