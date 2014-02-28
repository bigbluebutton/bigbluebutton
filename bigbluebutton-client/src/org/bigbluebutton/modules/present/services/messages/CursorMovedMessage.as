package org.bigbluebutton.modules.present.services.messages
{
  public class CursorMovedMessage
  {
    public var x:Number;
    public var y:Number;
    
    public function CursorMovedMessage(x: Number, y:Number)
    {
      this.x = x;
      this.y = y;
    }
  }
}