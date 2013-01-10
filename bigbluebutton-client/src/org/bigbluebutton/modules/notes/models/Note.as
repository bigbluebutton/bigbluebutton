package org.bigbluebutton.modules.notes.models
{
  [Bindable]
  public class Note
  {
    public var noteID:String;
    public var note:String;
    public var saved:Boolean = false;
    public var timestamp:String = "";
  }
}