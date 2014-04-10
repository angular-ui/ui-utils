ng-uploader
=========

ng-uploader is a single/multiple and high customizable file uploader and the most important is very easy to implement.

  - Upload multiple or single files
  - Cancel or remove upload when you want.
  - Allows concurrent Upload
  - Totally cutomizable

You can use with html5, jquery or every library or framework:

> The main objective of ng-uploader is
>  to have a user control, clean, simple, customizable,
> and above all very easy to implement.

Try the [DEMO](http://goo.gl/zmvA0j)
--------------

Version
-

1.0.0

Tech
-------------

ng-uploader uses a number of open source projects to work properly:

* [Twitter Bootstrap] - great UI boilerplate for modern web apps(optional)
* [angularjs] - HTML enhanced for web apps!

How to use
--------------

Step 1
------
Include [angularjs] and [Twitter Bootstrap] dependencies.

```html
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.14/angular.min.js"></script>
<script src="http://code.jquery.com/jquery.min.js"></script>
<link href="http://getbootstrap.com/dist/css/bootstrap.css" rel="stylesheet" type="text/css" />
<script src="http://getbootstrap.com/dist/js/bootstrap.js"></script>
<script src="ng-uploader.js"></script>    
```

Step 2
------
Include ng-uploader gadget and a URL into ng-uploader attribute.

```html
<div ng-app="myapp" ng-uploader="http://mydomain.com"></div>
```

Step 3
------
Load the module into javascript tag.

```javascript
angular.module('myapp', ['ui.ng-uploader']);
```

The result:
-----------

![alt text](https://raw.githubusercontent.com/realtica/ng-uploader/master/logos/ng-uploader.png "Gadget ng-uploader")

You don't like default template?
--------------------------------

Ok please just edit the template.html, remember this template is based in [Twitter Bootstrap] if You want use your own styles or templates, just do it!  :)

```html
<div class="panel panel-info"><div class="panel-heading"><input class="btn btn-default" type="file" name="{{file.parameter}}" multiple/></div><div class="panel-body"><div ng-repeat="file in fileList"  style="text-align:center;" class="bg-primary"><span>{{file.filename}}</span><button ng-click="erase(this)" type="button" class="close" aria-hidden="true">&times;</button><div class="progress"><div min-width="10%" class="progress-bar" role="progressbar" aria-valuenow="{{file.value}}" aria-valuemin="0" aria-valuemax="100" style="width: {{file.value}}%;">{{file.size}}/{{file.total}}</div></div></div><button class="btn btn-success" ng-click="startUpload()">Upload</button></div></div>
```

Options
--------

**Attributes:**
* concurrency: Default value "2"
* name: Default value "file"

**Example**
```html
<div ng-app="myapp" ng-uploader="http://mydomain.com" concurrency="5" name="myfiletoupload"></div>
```

Next Features 
-------------

* Resumable uploads
* Drag and Drop
* More templates...


Author
------
[Remy Alain Ticona Carbajal]


License
-------
[GNU Version 3]

*Free Software, Hell Yeah!*
  [Remy Alain Ticona Carbajal]: http://realtica.org
  [Twitter Bootstrap]: http://getbootstrap.com/
  [angularjs]: http://angularjs.org/
  [GNU Version 3]: https://www.gnu.org/copyleft/gpl.html
  

  