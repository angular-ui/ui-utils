# AngularJS Pageslide directive

An [AngularJS](http://angularjs.org/) directive which slides another panel over your browser to reveal an additional interaction pane.

It does all the css manipulation needed to position your content off canvas with html attibutes and it does not depend on jQuery

See it in action [HERE](http://dpiccone.github.io/ng-pageslide/examples/)

Examples in the repository.

UPDATE: [the 0.1.5 branch in development here](https://github.com/dpiccone/ng-pageslide/tree/v0.1.5)

## Usage

Add this in your head

```
<script src="src/angular-pageslide-directive.js"></script>
```

Use within your Angular app 

```
var app = angular.module("app", ["pageslide-directive"]);
```

Your HTML should look like this

```
<a pageslide href="#target">Link text</a>

<div id="target">            
    <p>some random content...</p>
    <a id="target-close" href="#">Click to close</a>
</div>
```
or you can open close withing a controller using the ps-open attribute to specify the model in your controller scope

and yes, it can be used like an html element also.

```
<pageslide="right" ps-speed="0.5" ps-target="#target" ps-open="checked" href="#target"></pageslide>

<div id="target">            
    <p>some random content...</p>
</div>
```

### Options:

```
pageslide (required) = Where the panel should appear (right,left,top,bottom), if empty defaults to "right"
ps-target (required) = "#target" used when using pageslide as an element
ps-open (optional) = true/false used to open and close the panel (optional)
ps-speed (optional) = The speed of the transition (optional)
```

## Licensing

Licensed under [MIT](http://opensource.org/licenses/MIT)

## Author

2013, Daniele Piccone [www.danielepiccone.com](http://www.danielepiccone.com)
