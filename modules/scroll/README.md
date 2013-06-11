The common way to present to the user a list of data elements of undefined length is to start with a small portion at the top of the
list - just enough to fill the space on the page. Additional rows are appended to the bottom of the list as the user scrolls down the list.

The problem with this approach is that even though rows at the top of the list become invisible as they scroll out of the view,
they are still a part of the page and still consume resources. As the user scrolls down the list grows and the web app slows down.

This becomes a real problem if the html representing a row has event handlers and/or angular watchers attached. A web app of an average
complexity can easily introduce 20 watchers per row. Which for a list of 100 rows gives you total of 2000 watchers and a sluggish app.

ngScroll directive
-------------------

**ngScroll** directive solves this problem by dynamically destroying elements as they become invisible and recreating
them if they become visible again.

###Description

The ngScroll directive is similar to the ngRepeat. Like the ngRepeat, ngScroll directive instantiates a template once per item from a collection.
Each template instance gets its own scope, where the given loop variable is set to the current collection item. The collection content is provided by
the datasource. The datasource name is specified in the scroll_expression.

As the template for an item is instantiated it is placed on the canvas. Its height is determined by the list of items currently instantiated.
Unless overridden by the ngScrollCanvas directive (see below) the immediate parent of the element with the directive will be used as canvas.

The viewport is an element representing the space where the content of the canvas is to be shown. Unless specified explicitly with the
ngScrollViewport directive (see below), browser window will be used as viewport.

Either way the viewport height has to be constrained because the directive will stop asking the datasource for more elements when it has enough
to fill out the viewport. If the height of the viewport is not constrained (style="height:auto") this will never happen and the directive will
try to pull the entire content of the datasource.

###Usage

```html
<ANY ng-scroll="{scroll_expression}" buffer-size="value" padding="value">
      ...
</ANY>
```

###Directive info
* This directive creates a new scope
* This directive executes at priority level 1000

###Parameters
* **ngScroll – {scroll_expression}** – The expression indicating how to enumerate a collection. Only one format is currently supported:
    * **variable in datasource** – where variable is the user defined loop variable and datasource is the name of the data source service to enumerate.
* **bufferSize - value**, optional - number of items requested from the datasource in a single request. The default is 10 and the minimal value is 3
* **padding - value**, optional - extra height added to the visible area for the purpose of determining when the items should be created/destroyed.
The value is relative to the visible height of the area, the default is 0.5 and the minimal value is 0.3

###Data Source service
Data source service is an angular service to be used by the ngScroll directive to access the data. The service implements methods to be used by
the directive to access the data:

* Method `get`

        get(index, count, success)

    #### Description
    this is a mandatory method used by the directive to retrieve the data.
#### Parameters
    * **index** indicates the first data row requested
    * **count** indicates number of data rows requested
    * **success** function to call when the data are retrieved. The implementation of the service has to call this function when the data
        are retrieved and pass it an array of the items retrieved. If no items are retrieved, an empty array has to be passed.

* Method `loading`

        loading(value)

    #### Description
    this is an optional method. If supplied this function will be called with a value indicating whether there is data loading request pending

* Method `revision`

        revision()

    #### Description
    this is an optional method. If supplied the scroller will $watch its value and will refresh the content if the value has changed

ngScrollCanvas directive
-------------------
###Description

The ngScrollCanvas directive marks a particular element as canvas for the ngScroll directive. If no parent of the ngScroll directive is
marked with ngScrollCanvas directive, the immediate parent of the ngScroll directive will be used as canvas

###Usage

```html
<ANY ng-scroll-canvas>
      ...
</ANY>
```

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
