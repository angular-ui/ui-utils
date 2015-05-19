ui-uploader
=========

ui-uploader is a single/multiple and high customizable file uploader and the most important is very easy to implement.

  - Upload multiple or single files
  - Cancel or remove upload when you want.
  - Allows concurrent Upload
  - Totally cutomizable

You can use with html5, jquery or every library or framework:

> The main objective of ui-uploader is
>  to have a user control, clean, simple, customizable,
> and above all very easy to implement.

Compatibility
-------------

Because this project use [FormData](http://caniuse.com/#search=formdata), it does **not** work on IE9 or earlier.


Try the [DEMO](http://goo.gl/zmvA0j)
--------------

Version
-

1.1

Tech
-------------

ui-uploader uses a number of open source projects to work properly:

* [angularjs] - HTML enhanced for web apps!

How to use
--------------

Step 1
------
Include [angularjs] dependency.

```html
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.14/angular.min.js"></script>
<script src="uploader.js"></script>    
```

Step 2
------
Include ui-uploader service.

```javascript
angular.module('myapp', ['ui.uploader']);
```
Step 3
------
Now you can use the ui-uploader methods.

```javascript
$uiUploader.addFiles(files);
$uiUploader.remove(file);
$uiUploader.removeAll();
```

Step 4
------
Configure ui-uploader callbacks and start!

```javascript
$uiUploader.startUpload({
                url: 'http://my_domain.com',
                concurrency: 2,
                onProgress: function(file) {
                    //do stuff
                },
                onCompleted: function(file) {
                    //do stuff
                }
            });
```

The result:
-----------

![alt text](https://raw.githubusercontent.com/realtica/ui-utils/realtica-ng-uploader/modules/uploader/uploader.png "Gadget ui-uploader")


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
[MIT]

*Free Software, Hell Yeah!*
  [Remy Alain Ticona Carbajal]: http://realtica.org
  [angularjs]: http://angularjs.org/
  [MIT]: http://opensource.org/licenses/MIT
  

  
