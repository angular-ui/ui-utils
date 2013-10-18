ui-alias
--------

Rename third-party directives or quickly generate simple template directives for use internally in your app!

* Sick of the `ui-*` `bs-*` and other such prefixes cluttering up your beautiful html? 
* Always find you're calling the same set of directives together?

Now you can **ALIAS** it!

## Installation

1. Load `alias.js`
2. Add `ui.alias` as a dependency
3. Create a `uiAliasConfig` constant on the `ui.alias` module

## Configuration

* Create a `constant` on the `ui.alias` module
* Keys are your alias, while the values are either a string template or a [DirectiveDefinitionObject](http://docs.angularjs.org/guide/directive#writingdirectiveslongversion)
* Aliases create new directives that generate templates
* Alias directives are `replace: true` by default unless explicitly set to `false`

```js
angular.module('ui.alias').constant('uiAliasConfig', {
	'alias': '<template dir1 dir2 options="customConfigScopeVar"></template>',
	'alias2': {
		template: '<another-template></another-template>',
		restrict: 'AEC'
	}
	// Example:
	date: '<input ui-date ui-date-format="mm/dd/yyyy">'

});
```

## Notes

* Be careful to avoid creating an alias that fires recursively  
  Example: `<button>` -> `<ui-button>` -> `<button>`
* You cannot override existing directives. Both the original *and* your alias directives will execute.
* You can create multiple an alias for different configurations of the same directives / templates