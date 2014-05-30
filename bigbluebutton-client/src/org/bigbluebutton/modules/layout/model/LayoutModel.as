package org.bigbluebutton.modules.layout.model
{
  import mx.collections.ArrayCollection;

  public class LayoutModel
  {
    private static const LOG:String = "Layout::LayoutModel - ";
    
    private static var instance:LayoutModel = null;
    
    private var _layouts:ArrayCollection = new ArrayCollection();
    
    public function LayoutModel(enforcer:SingletonEnforcer)
    {
      if (enforcer == null){
        throw new Error("There can only be 1 LayoutModel instance");
      }
    }
    
    public static function getInstance():LayoutModel{
      if (instance == null){
        instance = new LayoutModel(new SingletonEnforcer());
      }
      return instance;
    }
    
    public function getLayoutNames():Array {
      var l:Array = new Array();
      for (var i:int = 0; i < _layouts.length; i++) {
        var lay:LayoutDefinition = _layouts.getItemAt(i) as LayoutDefinition;
        l.push(lay.name);
      }
      return l;
    }
    
  }
}

class SingletonEnforcer{}