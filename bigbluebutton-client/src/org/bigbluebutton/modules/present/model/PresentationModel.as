package org.bigbluebutton.modules.present.model
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.present.model.Page;
  import org.bigbluebutton.modules.present.model.Presentation;
  
  public class PresentationModel
  {
    private static const LOG:String = "Present::PresentationModel - ";
    
    private static var instance:PresentationModel = null;
    
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
    
    public function addPresentation(p: Presentation):void {
      _presentations.addItem(p);
    }
    
    public function removePresentation(presId:String):Presentation {
      for (var i:int = 0; i < _presentations.length; i++) {
        var pres: Presentation = _presentations.getItemAt(i) as Presentation;
        if (pres.id == presId) {
          var old:Presentation = _presentations.removeItemAt(i) as Presentation;
          return old;
        }
      }   
      
      return null;      
    }
    
    public function removeAllPresentations():void {
      _presentations.removeAll();
    }
    
    public function replacePresentation(p: Presentation):void {
      var oldPres:Presentation = removePresentation(p.id);
      if (oldPres == null) {
        trace(LOG + "Could not find presentation [" + p.id + "] to remove.");
      }
      addPresentation(p);
    }
    
    public function getCurrentPresentationName():String {
      for (var i:int = 0; i < _presentations.length; i++) {
        var pres: Presentation = _presentations.getItemAt(i) as Presentation;
        if (pres.current) return pres.name;
      }   
      
      return null;
    }
    
    public function getPresentations():ArrayCollection {
      var presos:ArrayCollection = new ArrayCollection();
      
      for (var i:int = 0; i < _presentations.length; i++) {
        var pres: Presentation = _presentations.getItemAt(i) as Presentation;
        presos.addItem(pres);
      }
      
      return presos;
    }
    
    public function getCurrentPresentation():Presentation {
      trace("***** Call to getCurrentPresentation() *****");
      for (var i:int = 0; i < _presentations.length; i++) {
        var pres: Presentation = _presentations.getItemAt(i) as Presentation;
        trace(LOG + "Is presentation [" + pres.name + "] current [" + pres.current + "]?");
        if (pres.current) return pres;
      }
      trace(LOG + "No current presentation.");
      return null;
    }
    
    public function getNumberOfPages():int {
      var pres:Presentation = getCurrentPresentation();
      if (pres != null) {
        return pres.getPages().length;
      }
      
      return 0;
    }
    
    public function getCurrentPage():Page {
      var pres:Presentation = getCurrentPresentation();
      if (pres != null) {
        return pres.getCurrentPage();
      }
      trace(LOG + "Could not find current page.");
      return null;
    }
    
    public function getNextPage(id:String):Page {
      var ids:Array = id.split("/");
      if (ids.length > 1) {
        var presId:String = ids[0];
        var pageNum:int = int(ids[1]);
        trace(LOG + "page id [" + id + "] ids= [" + presId + "," + pageNum + "] " + ids[1]);
        var pres:Presentation = getPresentation(presId);
        var nextPage:int = pageNum + 1;
        trace(LOG + "Next page [" + presId + "/" + nextPage + "]");
        if (pres != null) {
          return pres.getPage(presId + "/" + nextPage);
        }       
      }
      
      return null;      
    }
    
    public function getPrevPage(id:String):Page {
      var ids:Array = id.split("/");
      if (ids.length > 1) {
        var presId:String = ids[0];
        var pageNum:int = int(ids[1]);
        trace(LOG + "page id [" + id + "] ids= [" + presId + "," + pageNum + "] " + ids[1]);
        var pres:Presentation = getPresentation(presId);
        var prevPage:int = pageNum - 1;
        trace(LOG + "Prev page [" + presId + "/" + prevPage + "]");
        if (pres != null) {
          return pres.getPage(presId + "/" + prevPage);
        }
        
      }
      
      return null;      
    }
    
    public function getPage(id: String):Page {
      var ids:Array = id.split("/");
      if (ids.length > 1) {
        var presId:String = ids[0];
        var pres:Presentation = getPresentation(presId);
        if (pres != null) {
          return pres.getPage(id);
        }
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
      trace(LOG + "Could not find presentation [" + presId + "].");
      return null;      
    }

    public function getDownloadablePresentations():ArrayCollection {
      var presos:ArrayCollection = new ArrayCollection();
      
      for (var i:int = 0; i < _presentations.length; i++) {
        var pres: Presentation = _presentations.getItemAt(i) as Presentation;
        if (pres.downloadable) {
          presos.addItem(pres);
        }
      }
      
      return presos;
    }
  }
}

class SingletonEnforcer{}