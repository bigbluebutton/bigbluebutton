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
  }
}