package org.bigbluebutton.modules.present.model
{
  import mx.collections.ArrayCollection;

  public class Presentation {  
    private var _id:String;
    private var _name:String;
    private var _pages:ArrayCollection;
    
    public var current:Boolean = false;
    
    public function Presentation(id: String, name: String, current: Boolean, pages: ArrayCollection) {
      _id = id;
      _name = name;
      this.current = current;
      _pages = pages
    }
    
    public function get id():String {
      return _id;
    }
    
    public function get name():String {
      return _name;
    }
        

    public function getCurrentPage():Page {
      for (var i: int = 0; i < _pages.length; i++) {
        var p: Page = _pages.getItemAt(i) as Page;
        if (p.current) {
          return p;
        }
      }  
      
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
    
    public function getPages():ArrayCollection {
      var pages:ArrayCollection = new ArrayCollection();
      
      for (var i: int = 0; i < _pages.length; i++) {
        pages.addItem(_pages.getItemAt(i) as Page);
      }
      
      return pages;
    }
  }
}