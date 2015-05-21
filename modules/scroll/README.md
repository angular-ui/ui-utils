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
* offset()

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
* **adapter - name**, optional - if provided a reference to the adapter object for the scroller instance will be placed in the member with the said name on the scope associated with the viewport. If the viewport is the window, the value will be placed on the $rootScope. The adapter is a collection of methods and properties to manipulate and assess the scroller the adapter was created for.

Some of the properties offered by the adapter can also be accessed directly from the directive by using matching attributes. In the same way as for the adapter attribute syntax for such attributes allows for providing a name under which the appropariate value will be placed on the scope associated with the viewport. If the viewport is the window, the value will be placed on the $rootScope. Below is a list of such attributes:

* **is-loading - name**, optional - a boolean value indicating whether there are any pending load requests will be placed in the member with the said name. See also `isLoading` adapter property.
* **top-visible - name**, optional - a reference to the item currently in the topmost visible position will be placed in the member with the said name. See also `topVisible` adapter property.
* **top-visible-element - name**, optional - a reference to the DOM element currently in the topmost visible position will be placed in the member with the said name. See also `topVisibleElement` adapter property.
* **top-visible-scope - name**, optional - a reference to the scope created for the item currently in the topmost visible position will be placed in the member with the said name. See also `topVisibleScope` adapter property.

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

###Adapter
Adapter object is a collection of methods and properties to be used to assess and manipulate the scroller instance adapater is created for. Adapter based API replaces old (undocumented) event based API introduced earlier for this purpose. The event based API is now deprecated but will remain available for backwards compatibililty purposes.

####Manipulating the scroller content with applyUpdates method

Method `applyUpdates` provides a way to update the scroller content without full reload of the content from the datasource. The updates are performed by changing the items in the scroller internal buffer after they are loaded from the datasource. An item in the buffer can be deleted or modified. Also several items can be inserted to replace a given item.

* Method `applyUpdates(index, newItems)`

    #### Description
    Updates scroller content at the given location in the dataset
#### Parameters
    * **index** index of the item to be affected in the dataset.
    * **newItems** an array of items to replace the affected item. If the array is empty (`[]`) the item will be deleted, otherwise the items in the array replace the affected item.

* Method `applyUpdates(updater)`

    #### Description
    Updates scroller content as determined by the updater function
#### Parameters
    * **updater** a function to be applied to every item currently in the buffer. The function will recieve 3 parameters: `item`, `scope`, and `element`. Here `item` is the item to be affected, `scope` is the item $scope, and `element` is the html element for the item. The return value of the function should be an array of items. Similarly to the `newItem` parameter (see above), if the array is empty(`[]`), the item is deleted, otherwise the item is replaced by the items in the array. If the return value is not an array, the item remains unaffected, unless some updates were made to the item in the updater function. This can be thought of as in place update. 

**Important:** Keep in mind that the modifications made by the `applyUpdates` methods are only applied to the content of the buffer. As the items in response to scrolling are pushed out of the buffer, the modifications are lost. It is your responsibility to ensure that as the scroller is scrolled back and a modified item is requested from the datasource again the values returned by the datasource would reflect the updated state. In other words you have to make sure that in addition to manipulating the scroller content you also apply the modifications to the dataset underlying the datasource.

####Adapter properties

* `isLoading` - a boolean value indicating whether there are any pending load requests.
* `topVisible` - a reference to the item currently in the topmost visible position.
* `topVisibleElement` - a reference to the DOM element currently in the topmost visible position.
* `topVisibleScope` - a reference to the scope created for the item currently in the topmost visible position.

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

See [index.html](http://rawgithub.com/Hill30/NGScroller/master/src/index.html)

###History

####v1.1.2
* Fixed inserting elements via applyUpdates error.

####v1.1.1
* Fixed jqlite on $destroy error.

####v1.1.0
* Introduced API to dynamically update scroller content.
* Deep 'name' properties access via dot-notation in template.
* Fixed the problem occuring if the scroller is $destroyed while there are requests pending: [#64](https://github.com/Hill30/NGScroller/issues/64).

####v1.0.3
* Fixed memory leak on scroller destroy: [#63](https://github.com/Hill30/NGScroller/issues/63).
* Removed examples from bower download list.

####v1.0.2
* Registration of ui-scroll in bower.

####v1.0.1
* Deep datasource access via dot-notation in template.
* [Angular 1.3.x breaking change](https://github.com/angular/angular.js/issues/8876) fix with backward compatibility.

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