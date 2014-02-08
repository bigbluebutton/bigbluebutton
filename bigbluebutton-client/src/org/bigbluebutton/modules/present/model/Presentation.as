package org.bigbluebutton.modules.present.model
{
  import mx.collections.ArrayCollection;

  public class Presentation
  {  
    private var _id:String;
    private var _name:String;
    private var _current:Boolean = false;
    private var _pages:ArrayCollection;
    
    public function Presentation(id: String, name: String, current: Boolean) {
      _id = id;
      _name = name;
      _current = current;
    }
    
    public function get id():String {
      return _id;
    }
      
    public function addPage(p: Page):void {
      _pages.addItem(p);
    }
     
  }
}