package org.bigbluebutton.core.model
{

  public class MediaStream
  {
    public var streamId: String;
    public var userId: String;
    public var attributes: Object = new Object();
    public var viewers:Array = new Array();
    
    public function MediaStream(streamId: String, userId: String)
    {
      this.streamId = streamId;
      this.userId = userId;
    }
    
    public function addViewer(userId: String):void {
        for (var i: int=0; i < viewers.length; i++) {
            var viewer: String = viewers[i] as String;
            if (viewer == userId) return;
        }
        
        viewers.push(userId);
    }
    
    public function removeViewer(userId: String):void {
        var index: int = viewers.indexOf(userId);
        if (index > -1 && index < viewers.length) {
            viewers.removeAt(index);
        }
    }
  }
}