package org.bigbluebutton.modules.present.model
{
  import mx.collections.ArrayCollection;

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
    
    public function getCurrentPage():Page {
      var pres: Presentation = getCurrentPresentation();
      
      if (pres != null) {
        var pages:ArrayCollection = pres.getPages();
        for (var j:int = 0; j < pages.length; j++) {
          var page:Page = pages[j] as Page;
          if (page.current) return page;
          
        }        
      }

      return null;
    }
  }
}

class SingletonEnforcer{}