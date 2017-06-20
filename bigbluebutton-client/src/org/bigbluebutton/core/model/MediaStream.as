package org.bigbluebutton.core.model
{

  public class MediaStream
  {
    public var streamId: String;
    public var userId: String;
    public var attributes: Object = new Object();
    public var viewers:Array = new Array();
    
    public function MediaStream()
    {
    }
  }
}