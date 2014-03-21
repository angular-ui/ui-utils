The common way to present to the user a list of data elements of undefined length is to start with a small portion at the top of the
list - just enough to fill the space on the page. Additional rows are appended to the bottom of the list as the user scrolls down the list.

The problem with this approach is that even though rows at the top of the list become invisible as they scroll out of the view,
they are still a part of the page and still consume resources. As the user scrolls down the list grows and the web app slows down.

This becomes a real problem if the html representing a row has event handlers and/or angular watchers attached. A web app of an average
complexity can easily introduce 20 watchers per row. Which for a list of 100 rows gives you total of 2000 watchers and a sluggish app.

ngScroll directive
-------------------

[![Build Status](https://travis-ci.org/Hill30/NGScroller.png?branch=master)](https://travis-ci.org/Hill30/NGScroller)

**ngScroll** directive solves this problem by dynamically destroying elements as they become invisible and recreating
them if they become visible again.

###Description

The ngScroll directive is similar to the ngRepeat. Like the ngRepeat, ngScroll directive instantiates a template once per item from a collection.
Each template instance gets its own scope, where the given loop variable is set to the current collection item. The collection content is provided by
the datasource. The datasource name is specified in the scroll_expression.

The viewport is an element representing the space where the items from the collection are to be shown. Unless specified explicitly with the
ngScrollViewport directive (see below), browser window will be used as viewport.

**Important: viewport height must be constrained.** The directive will stop asking the datasource for more elements only when it has enough
to fill out the viewport. If the height of the viewport is not constrained (style="height:auto") this may throw an Error, or it could
pull the entire content of the datasource.

### Dependencies

To use the directive make sure the ui-scroll.js (as transpiled from [ui-scroll.coffee](https://github.com/Hill30/NGScroller/tree/v0.0.2)) is loaded in your page. You also have to include
module name 'ui.scroll' on the list of your application module dependencies. 

The code in this file relies on a few DOM element methods of jQuery which are currently not implemented in jQlite, namely
* before(elem)
* height() and height(value)
* outerHeight() and outerHeight(true)
* scrollTop() and scrollTop(value)

File ui-scroll-jqlite.coffee houses implementations of the above methods and also has to be loaded in your page. Please note that the methods are implemented in a separate module
'ui.scroll.jqlite' and this name should also be included in the dependency list of the main module. The implementation currently supports missing methods
only as necessary for the directive. It is tested on IE8 and up as well as on the Chrome 28 and Firefox 20.

This module is only necessary if you plan to use ng-scroll without jQuery. If jQuery implementation is present it will not override them.
If you plan to use ng-scroll over jQuery feel free to skip ui-scroll-jqlite.

###Usage

```html
<ANY ng-scroll="{scroll_expression}" buffer-size="value" padding="value">
      ...
</ANY>
```
Listing `ANY` for the tag the directive can be applied to stretches the truth - a little bit. The directive works well with majority of
the 'usual' tags - divs, spans, a, inputs, etc. For all of them the viewport should be a div (unless it is the window). Some other tags
require special treatment. If the repeated tag is a li, it is best to use ul or ol as a viewport. For a tr as a repeated tag the
viewport has to be the tbody.  
dl as a repeated tag is not supported.

###Directive info
* This directive creates a new scope
* This directive executes at priority level 1000

###Parameters
* **ngScroll – {scroll_expression}** – The expression indicating how to enumerate a collection. Only one format is currently supported:
    * **variable in datasource** – where variable is the user defined loop variable and datasource is the name of the data source service to enumerate.
* **buffer-size - value**, optional - number of items requested from the datasource in a single request. The default is 10 and the minimal value is 3
* **padding - value**, optional - extra height added to the visible area for the purpose of determining when the items should be created/destroyed.
The value is relative to the visible height of the area, the default is 0.5 and the minimal value is 0.3

###Data Source 
Data source is an object to be used by the ngScroll directive to access the data. 

The directive will locate the object using the provided data source name. It will first look for a property with the given name on its $scope.
If none found it will try to get an angular service with the provided name.

The datasource object implements methods and properties to be used by the directive to access the data:

* Method `get`

        get(index, count, success)

    #### Description
    this is a mandatory method used by the directive to retrieve the data.
#### Parameters
    * **index** indicates the first data row requested
    * **count** indicates number of data rows requested
    * **success** function to call when the data are retrieved. The implementation of the service has to call this function when the data
        are retrieved and pass it an array of the items retrieved. If no items are retrieved, an empty array has to be passed.

**Important:** Make sure to respect the `index` and `count` parameters of the request. The array passed to the success method should have 
exactly `count` elements unless it hit eof/bof

* Method `loading`

        loading(value)

    #### Description
    this is an optional method. If supplied this function will be called with a value indicating whether there is data loading request pending

* Method `revision`

        revision()

    #### Description
    this is an optional method. If supplied the scroller will $watch its value and will refresh the content if the value has changed


ngScrollViewport directive
-------------------
###Description

The ngScrollViewport directive marks a particular element as viewport for the ngScroll directive. If no parent of the ngScroll directive is
marked with ngScrollViewport directive, the browser window object will be used as viewport

###Usage

```html
<ANY ng-scroll-viewport>
      ...
</ANY>
```


###Examples

Currently examples consist of a sample datasource service (called 'datasource' see [application.coffee] (https://github.com/Hill30/NGScroller/blob/master/src/scripts/application.coffee)) and several pages with different ways the ng-scroll can be used.
I intentionally broke every rule of proper html/css structure (i.e. embedded styles). This is done to keep the html as bare bones as possible and leave
it to you to do it properly - whatever properly means in your book.

See [index.html] (http://rawgithub.com/Hill30/NGScroller/master/src/index.html)
