package org.bigbluebutton.modules.present.services.messages
{
  import mx.collections.ArrayCollection;
  
  public class PresentationVO {  
    private var _id:String;
    private var _name:String;
    private var _current:Boolean = false;
    private var _pages:ArrayCollection;
    private var _downloadable:Boolean = false;
    
    public function PresentationVO(id: String, name: String, current: Boolean, pages: ArrayCollection, downloadable: Boolean) {
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
    
    public function isCurrent():Boolean {
      return _current;
    }
    
    public function getPages():ArrayCollection {
      var pages:ArrayCollection = new ArrayCollection();
      
      for (var i: int = 0; i < _pages.length; i++) {
        pages.addItem(_pages.getItemAt(i) as PageVO);
      }
      
      return pages;
    }

    public function get downloadable():Boolean {
      return _downloadable;
    }
  }
}