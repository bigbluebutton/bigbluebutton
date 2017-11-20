package org.bigbluebutton.modules.present.model
{
  import mx.collections.ArrayCollection;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.modules.present.services.messages.PageChangeVO;
  import org.bigbluebutton.main.api.JSLog;
  
  public class PresentationModel
  {
	private static const LOGGER:ILogger = getClassLogger(PresentationModel);      

    private var _presentations:ArrayCollection = new ArrayCollection();
    private var _podId: String = "";

    public function PresentationModel(podId: String) {
		_podId = podId;
    }
    
    private function whichPageIsCurrent(presId: String): String {
        var result: String = "[";
        var pres:Presentation = getPresentation(presId);
        if (pres == null) {
        } else {
            var curPage: Page =  pres.getCurrentPage();
            result = result + curPage.num;
        }
        return result + "]";
    }
    
    public function printPresentations(calledFrom: String): void {
      for (var i:int = 0; i < _presentations.length; i++) {
        var pres: Presentation = _presentations.getItemAt(i) as Presentation;
        JSLog.warn("2001  " + calledFrom +"   " + i + "  " + pres.name  + "  " + pres.id + " " + pres.current.toString() + "   " + whichPageIsCurrent(pres.id)  , {}); 
      }  
    }
    
    public function getPodId(): String {
        return this._podId;
    }

    public function addPresentation(p: Presentation):void {
        printPresentations("PresentationModel::addPresentation bef total=" + _presentations.length);
      _presentations.addItem(p);
        printPresentations("PresentationModel::addPresentation aft total=" + _presentations.length);
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
	  //LOGGER.debug("***** Call to getCurrentPresentation() *****");
      for (var i:int = 0; i < _presentations.length; i++) {
        var pres: Presentation = _presentations.getItemAt(i) as Presentation;
        //LOGGER.debug("Is presentation [{0}] current [{1}]?", [pres.name, pres.current]);
        if (pres.current) return pres;
      }
      LOGGER.debug("No current presentation.");
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
      LOGGER.debug("Could not find current page.");
      return null;
    }
    
    public function getNextPageIds():PageChangeVO {
      var curPres:Presentation = getCurrentPresentation();
      if (curPres != null) {
        var curPage:Page = curPres.getCurrentPage();
        if (curPage != null) {
          LOGGER.debug("page id [{0}], pres id [{1}], page num [{2}]", [curPage.id, curPres.id, curPage.num]);
          var nextNum:int = curPage.num + 1;
          LOGGER.debug("Next page [{0}/{1}]", [curPres.id, nextNum]);
          var nextPage:Page = curPres.getPageByNum(nextNum);
          if (nextPage != null) {
            return new PageChangeVO(curPres.id, nextPage.id);
          }
        }
      }
      
      return null;
    }
    
    public function getPrevPageIds():PageChangeVO {
      var curPres:Presentation = getCurrentPresentation();
      if (curPres != null) {
        var curPage:Page = curPres.getCurrentPage();
        if (curPage != null) {
          LOGGER.debug("page id [{0}], pres id [{1}], page num [{2}]", [curPage.id, curPres.id, curPage.num]);
          var prevNum:int = curPage.num - 1;
          LOGGER.debug("Prev page [{0}/{1}]", [curPres.id, prevNum]);
          var prevPage:Page = curPres.getPageByNum(prevNum);
		  if (prevPage != null) {
            return new PageChangeVO(curPres.id, prevPage.id);
		  }
		}
      }
      
      return null;
    }
    
    public function getSpecificPageIds(pageId:String):PageChangeVO {
      var curPres:Presentation = getCurrentPresentation();
      if (curPres != null) {
        var newPage:Page = curPres.getPage(pageId);
        if (newPage != null && !newPage.current) {
          LOGGER.debug("page id [{0}], pres id [{1}], page num [{2}]", [newPage.id, curPres.id, newPage.num]);
          return new PageChangeVO(curPres.id, newPage.id);
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
      LOGGER.debug("Could not find presentation [{0}].", [presId]);
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
