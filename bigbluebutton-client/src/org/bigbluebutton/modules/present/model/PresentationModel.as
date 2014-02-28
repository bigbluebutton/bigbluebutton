package org.bigbluebutton.modules.present.model
{
  import mx.collections.ArrayCollection;
  import org.bigbluebutton.modules.present.model.Page;
  import org.bigbluebutton.modules.present.model.Presentation;
  
  public class PresentationModel
  {
    private static var instance:PresentationModel = null;
    
    private var _pages:ArrayCollection = new ArrayCollection();
    private var _presentations:ArrayCollection = new ArrayCollection();   
    private var _presenter: Presenter;
    
    /**
     * This class is a singleton. Please initialize it using the getInstance() method.
     * 
     */		
    public function PresentationModel(enforcer:SingletonEnforcer) {
      if (enforcer == null){
        throw new Error("There can only be 1 PresentationModel instance");
      }
      initialize();
    }
    
    private function initialize():void {
      
    }
    
    /**
     * Return the single instance of the PresentationModel class
     */
    public static function getInstance():PresentationModel{
      if (instance == null){
        instance = new PresentationModel(new SingletonEnforcer());
      }
      return instance;
    }
    
    public function setPresenter(p: Presenter):void {
      _presenter = p;
    }
    
    public function getPresenter():Presenter {
      return _presenter;
    }
    
    public function addPage(page: Page):void {
      _pages.addItem(page);
    }
    
    public function addPresentation(p: Presentation):void {
      _presentations.addItem(p);
    }
    
    public function getCurrentPresentationName():String {
      for (var i:int = 0; i < _presentations.length; i++) {
        var pres: Presentation = _presentations.getItemAt(i) as Presentation;
        if (pres.isCurrent()) return pres.id;
      }   
      
      return null;
    }
    
    public function getPresentationNames():ArrayCollection {
      var presos:ArrayCollection = new ArrayCollection();
      
      for (var i:int = 0; i < _presentations.length; i++) {
        var pres: Presentation = _presentations.getItemAt(i) as Presentation;
        presos.addItem(pres.name);
      }
      
      return presos;
    }
    
    public function getCurrentPresentation():Presentation {
      for (var i:int = 0; i < _presentations.length; i++) {
        var pres: Presentation = _presentations.getItemAt(i) as Presentation;
        if (pres.isCurrent()) return pres;
      }
      
      return null;
    }
    
    public function getPage(id: String):Page {
      var ids:Array = id.split("/");
      if (ids.length > 1) {
        var presId:String = ids[0];
        var pres:Presentation = getPresentation(presId);
        return pres.getPage(id);
      }

      return null;
    }
    
    public function getPresentation(presId: String):Presentation {
      for (var i:int = 0; i < _presentations.length; i++) {
        var pres: Presentation = _presentations.getItemAt(i) as Presentation;
        if (pres.id == presId) {
          return pres;
        }
      }
      
      return null;      
    }
  }
}

class SingletonEnforcer{}