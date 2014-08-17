package org.bigbluebutton.modules.phone.models
{
  public class WebRTCModel
  {
    
    private var _state:String = Constants.INITED;
    
    public function WebRTCModel()
    {
    }
    
    public function get state():String {
      return _state;
    }
    
    public function set state(s:String):void {
      _state = s;
    }
     
  }
}