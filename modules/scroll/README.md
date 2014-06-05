The common way to present to the user a list of data elements of undefined length is to start with a small portion at the top of the
list - just enough to fill the space on the page. Additional rows are appended to the bottom of the list as the user scrolls down the list.

The problem with this approach is that even though rows at the top of the list become invisible as they scroll out of the view,
they are still a part of the page and still consume resources. As the user scrolls down the list grows and the web app slows down.

This becomes a real problem if the html representing a row has event handlers and/or angular watchers attached. A web app of an average
complexity can easily introduce 20 watchers per row. Which for a list of 100 rows gives you total of 2000 watchers and a sluggish app.

uiScroll directive
-------------------

[![Build Status](https://travis-ci.org/Hill30/NGScroller.png?branch=master)](https://travis-ci.org/Hill30/NGScroller)

**uiScroll** directive solves this problem by dynamically destroying elements as they become invisible and recreating
them if they become visible again.

###Description

The uiScroll directive is similar to the ngRepeat. Like the ngRepeat, uiScroll directive instantiates a template once per item from a collection.
Each template instance gets its own scope, where the given loop variable is set to the current collection item. The collection content is provided by
the datasource. The datasource name is specified in the scroll_expression.

The viewport is an element representing the space where the items from the collection are to be shown. Unless specified explicitly with the
uiScrollViewport directive (see below), browser window will be used as viewport.

**Important: viewport height must be constrained.** The directive will stop asking the datasource for more elements only when it has enough
 to fill out the viewport. If the height of the viewport is not constrained (style="height:auto")  it will pull the entire content of the datasource
 and may throw an Error depending on the number of items in the datasource. Even if it does not, using the directive this way does not provide any
 advantages over using ng-repeat, because item template will be always instantiated for every item in the datasource.

### Dependencies

To use the directive make sure the ui-scroll.js (as transpiled from [ui-scroll.coffee](https://github.com/Hill30/NGScroller/blob/master/src/scripts/application.coffee)) is loaded in your page. You also have to include
module name 'ui.scroll' on the list of your application module dependencies.

The code in this file relies on a few DOM element methods of jQuery which are currently not implemented in jQlite, namely
* before(elem)
* height() and height(value)
* outerHeight() and outerHeight(true)
* scrollTop() and scrollTop(value)

File ui-scroll-jqlite.coffee houses implementations of the above methods and also has to be loaded in your page. Please note that the methods are implemented in a separate module
'ui.scroll.jqlite' and this name should also be included in the dependency list of the main module. The implementation currently supports missing methods
only as necessary for the directive. It is tested on IE8 and up as well as on the Chrome 28 and Firefox 20.

This module is only necessary if you plan to use ui-scroll without jQuery. If jQuery implementation is present it will not override them.
If you plan to use ui-scroll over jQuery feel free to skip ui-scroll-jqlite.

###Usage

```html
<ANY ui-scroll="{scroll_expression}" buffer-size="value" padding="value">
      ...
</ANY>
```
Listing `ANY` for the tag, the directive can be applied to, stretches the truth - a little bit. The directive works well with majority of
the 'usual' tags - divs, spans, a, inputs, etc. For all of them the viewport should be a div (unless it is the window). Some other tags
require special treatment. If the repeated tag is a li, it is best to use ul or ol as a viewport. For a tr as a repeated tag the
viewport has to be the tbody.  
dl as a repeated tag is not supported.

###Directive info
* This directive creates a new scope
* This directive executes at priority level 1000

###Parameters
* **uiScroll – {scroll_expression}** – The expression indicating how to enumerate a collection. Only one format is currently supported:
    * **variable in datasource** – where variable is the user defined loop variable and datasource is the name of the data source service to enumerate.
* **buffer-size - value**, optional - number of items requested from the datasource in a single request. The default is 10 and the minimal value is 3
* **padding - value**, optional - extra height added to the visible area for the purpose of determining when the items should be created/destroyed.
The value is relative to the visible height of the area, the default is 0.5 and the minimal value is 0.3
* **is-loading - name**, optional - if provided a boolean value indicating whether there are any pending load requests will be placed in the member with the said name on the scope associated with the viewport. If the viewport is the window, the value will be placed on the $rootScope
* **top-visible - name**, optional - if provided a reference to the item currently in the topmost visible position will be placed in the member with the said name on the scope associated with the viewport. If the viewport is the window, the value will be placed on the $rootScope
* **top-visible-element - name**, optional - if provided a reference to the DOM element currently in the topmost visible position will be placed in the member with the said name on the scope associated with the viewport. If the viewport is the window, the value will be placed on the $rootScope
* **top-visible-scope - name**, optional - if provided a reference to the scope created for the item currently in the topmost visible position will be placed in the member with the said name on the scope associated with the viewport. If the viewport is the window, the value will be placed on the $rootScope

###Data Source 
Data source is an object to be used by the uiScroll directive to access the data. 

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

**Deprecated:** Method `loading` is deprecated - use `is-loading` attribute instead
    

* Method `revision`

        revision()

    #### Description
    this is an optional method. If supplied the scroller will $watch its value and will refresh the content if the value has changed


uiScrollViewport directive
-------------------
###Description

The uiScrollViewport directive marks a particular element as viewport for the uiScroll directive. If no parent of the uiScroll directive is
marked with uiScrollViewport directive, the browser window object will be used as viewport

###Usage

```html
<ANY ui-scroll-viewport>
      ...
</ANY>
```


###Examples

Examples ([look here](https://github.com/Hill30/NGScroller/tree/master/src/examples)) consist of several pages (.html files) showing various ways to use the ui-scroll directive. Each page relays on its own datasource service (called `datasource`) defined in the coffescript file with the same name and .coffee extension.

I intentionally broke every rule of proper html/css structure (i.e. embedded styles). This is done to keep the html as bare bones as possible and leave
it to you to do it properly - whatever properly means in your book.

See [index.html] (http://rawgithub.com/Hill30/NGScroller/master/src/index.html)

###Debugging coffeeScript directly in the browser

With adding sourceURL setting the source maps for the coffeScript seem to be functional now - at least with Chrome. You can set breakpoints and inspect values form the coffeeScript source window. 

There is one dirty trick though - to make the breakpoints stick, the first one to be hit **has** to be set from the javascript source window. With the way the sample source code is, open the source code dropdown and select the source called 'src/scripts/application.js' under 'no domain', and place the breakpoint on the second line of the code in this file. Because of source mapping the blue arrow indicating the breakpoint will be put in the corresponding place of the coffeeScript code (application.coffee in this case), so you will not see it in the application.js. Now, if you refresh the page, Chrome will break on the first line of the code in the application.coffee. 

Once the first breakpoint set up this way is hit, the rest of them will work just fine. You can set and/or remove them directly in coffeeScript. Just do not remove the first one - as soon as you do, the rest of you breakpoints while still visible in the editor will cease to work.

Do not ask me why this woodoo is necessary, but as of Chrome version 30 it is just the way it is.

###History

####v1.0.0

* Renamed ng-scroll to ui-scroll.
* Reduced server requests by eof and bof recalculation.
* Support for inline-block/floated elements.
* Reduced flickering via new blocks rendering optimization.
* Prevented unwanted scroll bubbling.
* Fixed race-condition and others minor bugs.
* Added more usage examples (such as cache within datasource implementation).

####v0.1.*

Introduced `is-loading` and `top-visible-*` attributes. Streamlined and added a few more usage examples.

####v0.0.*

Initial commit including uiScroll, uiScrollViewPort directives and usage examples.
