# AngularJS Pageslide directive

An [AngularJS](http://angularjs.org/) directive which slides another panel over your browser to reveal an additional interaction pane.

See it in action [HERE](http://dpiccone.github.io/ng-pageslide/demo/)

More examples in the repository.

## Usage

Add this in your head

```
<script src="src/angular-pageslide-directive.js"></script>
<link rel="stylesheet" type="text/css" href="css/angular-pageslide.less.css">
```

Use within your Angular app 

```
var app = angular.module("app", ["pageslide-directive"]);
```

Your HTML should look like this

```
<a pageslide="right" ps-speed="0.5" href="#target">Link text</a>

<div id="target" ng-controller="panelctrl" style="display:none">            
<p>some random content...</p>
<a id="target-close" href="#">Click to close</a>
</div>
```

### Options:

```
pageslide = Where the panel should appear (right,left,top,bottom)
ps-speed = The speed of the transition (optional)
```

## Licensing

Licensed under [MIT](http://opensource.org/licenses/MIT)

## Author

2013, Daniele Piccone [@danielepiccone](https://twitter.com/danielepiccone)

[Github Page] (http://dpiccone.github.io/ng-pageslide/) 

