package org.bigbluebutton.modules.notes.models
{
  import org.bigbluebutton.core.BBB;

  public class NotesOptions
  {
    public var saveURL:String;
    public var position:String = "top-right";
    
    public function NotesOptions()
    {
      var cxml:XML = 	BBB.getConfigForModule("NotesModule");
      if (cxml != null) {
        if (cxml.@saveURL != undefined) {
          saveURL = cxml.@saveURL.toString();
        }
        if (cxml.@position != undefined) {
          position = cxml.@position.toString();
        }
      }
    }
  }
}