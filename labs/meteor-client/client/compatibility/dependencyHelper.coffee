###
  ** Written by: Danny Perrone - https://github.com/perroned **
  This class is an easy way to make sure value get updated correctly in your templates
  Create an instance of this class.
  To alter the value use the update function
  Where you place the value in the template use the get function
  This class creates a dependency between setting and getting the value
  When you set the value, the class notifies the dependency that it has changed, and 
  where you retrieve the value it depends on the depenency reloading the template where you get the value
###
class @WatchValue
  _dependency: new Deps.Dependency
  constructor: (@_value=null) ->

  # reactive getter/setters
  getValue: -> # Displaying the value has a dependency that watches wherever it is changed
    @_dependency.depend()
    @_value

  updateValue: (v) -> # Everytime the value is changed, notify the dependency it changed
    @_value=v
    @_dependency.changed()

  # non reactive getter/setter
  get: ->  
    @_value

  set: (v) -> 
    @_value=v
