package org.bigbluebutton.core.model
{
  import mx.collections.ArrayCollection;
  
  public class Webcams
  {
    private var _webcams: ArrayCollection = new ArrayCollection();
    
    public function add(stream: MediaStream):void {
      _webcams.addItem(stream);
    }
    
    public function remove(streamId: String):MediaStream {
      var index:int = getIndex(streamId);
      if (index >= 0) {
        return _webcams.removeItemAt(index) as MediaStream;
      }
      
      return null;
    }
    
    public function getStreamAndIndex(streamId: String):Object {
      var stream:MediaStream;
      for (var i:int = 0; i < _webcams.length; i++) {
        stream = _webcams.getItemAt(i) as MediaStream;
        
        if (stream.streamId == streamId) {
          return {index:i, stream:stream};;
        }
      }
      
      return null;      
    }
    
    public function getStream(streamId:String):MediaStream {
      var stream:MediaStream;
      
      for (var i:int = 0; i < _webcams.length; i++) {
        stream = _webcams.getItemAt(i) as MediaStream;
        
        if (stream.streamId == streamId) {
          return stream;
        }
      }				
      
      return null;
    }
    
    public function getIndex(streamId: String):int {
      var stream:MediaStream;
      for (var i:int = 0; i < _webcams.length; i++) {
        stream = _webcams.getItemAt(i) as MediaStream;
        
        if (stream.streamId == streamId) {
          return i;
        }
      }
      
      return -1;
    }
    
    public function getStreamsForUser(userId: String): Array {
      var tempArray: Array = new Array();
     
      for (var i:int = 0; i < _webcams.length; i++) {
        var stream:MediaStream = _webcams.getItemAt(i) as MediaStream;
        
        if (stream.userId == userId) {
          tempArray.push(stream);
        }
      }
      return tempArray;
    }
    
    public function getStreamIdsForUser(userId: String): Array {
      var tempArray: Array = new Array();
      
      for (var i:int = 0; i < _webcams.length; i++) {
        var stream:MediaStream = _webcams.getItemAt(i) as MediaStream;
        
        if (stream.userId == userId) {
          tempArray.push(stream.streamId);
        }
      }
      return tempArray;
    }
    
    public function startedViewingStream(userId: String, streamId: String): void {
        var _stream: MediaStream = getStream(streamId);
        if (_stream != null) {
            _stream.addViewer(userId);
        }
    }
    
    public function stoppedViewingStream(userId: String, streamId: String): void {
        var _stream: MediaStream = getStream(streamId);
        if (_stream != null) {
            _stream.removeViewer(userId);
        }
    }
    
    public function getStreamIdsIAmViewingForUser(userId: String): Array {
      var tempArray: Array = new Array();
      
      for (var i:int = 0; i < _webcams.length; i++) {
        var stream:MediaStream = _webcams.getItemAt(i) as MediaStream;
        
        if (stream.userId == userId) {
          var viewers: Array = stream.viewers;
          for (var v:int = 0; v < viewers.length; v++) {
            var viewer: String = viewers[v] as String;
            if (viewer == LiveMeeting.inst().me.id) {
              tempArray.push(stream.streamId);
            }            
          }
        }
      }
      return tempArray;
    }
    
    public function isViewingStream(userId: String, streamId: String): Boolean {
      var stream: MediaStream = getStream(streamId);
      if (stream != null) {
        for (var i: int = 0; i < stream.viewers.length; i++) {
          var viewer: String = stream.viewers[i] as String;
          if (viewer == userId) return true;
        }
      }
      
      return false;
    }
  }
}