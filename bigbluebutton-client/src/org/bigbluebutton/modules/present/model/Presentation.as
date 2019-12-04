package org.bigbluebutton.modules.present.model
{
  import mx.collections.ArrayCollection;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;

  public class Presentation {  
	private static const LOGGER:ILogger = getClassLogger(Presentation);      
    
    private var _id:String;
    private var _name:String;
    private var _pages:ArrayCollection;
    
    private var _current:Boolean = false;
    private var _downloadable:Boolean = false;

    public function Presentation(id: String, name: String, current: Boolean, pages: ArrayCollection, downloadable: Boolean) {
      _id = id;
      _name = name;
      _current = current;
      _pages = pages;
      _downloadable = downloadable;
    }
    
    public function get id():String {
      return _id;
    }
    
    public function get name():String {
      return _name;
    }
       
    public function get current():Boolean {
      return _current;
    }
    
    public function set current(val:Boolean):void {
      _current = val;
    }
    
    public function getCurrentPage():Page {
      for (var i: int = 0; i < _pages.length; i++) {
        var p: Page = _pages.getItemAt(i) as Page;
        //LOGGER.debug("Is page [{0}] current [{1}]?", [p.num, p.current]);
        if (p.current) {
          return p;
        }
      }  
      LOGGER.debug("Could not find current page.");
      return null;
    }
    
    public function getPage(pageId:String):Page {
      for (var i: int = 0; i < _pages.length; i++) {
        var p: Page = _pages.getItemAt(i) as Page;
        if (p.id == pageId) {
          return p;
        }
      }  
      
      return null;
    }
    
    public function getPageByNum(pageNum:int):Page {
      for (var i: int = 0; i < _pages.length; i++) {
        var p: Page = _pages.getItemAt(i) as Page;
        if (p.num == pageNum) {
          return p;
        }
      }
      
      return null;
    }
    
    public function getPages():ArrayCollection {
      var pages:ArrayCollection = new ArrayCollection();
      
      for (var i: int = 0; i < _pages.length; i++) {
        pages.addItem(_pages.getItemAt(i) as Page);
      }
      
      return pages;
    }

    public function get downloadable():Boolean {
      return _downloadable;
    }
	
	public function set downloadable(value:Boolean):void {
		_downloadable = value;
	}
  }
}