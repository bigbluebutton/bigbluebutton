package org.bigbluebutton.modules.phone.models
{
  import flash.media.Sound;
  import flash.media.SoundChannel;
  import flash.media.SoundTransform;

  public class WebRTCModel
  {
    
    private var _state:String = Constants.INITED;
    
    [Embed(source="../sounds/LeftCall.mp3")] 
    private var noticeSoundClass:Class;
    private var noticeSound:Sound = new noticeSoundClass() as Sound;
    
    public function WebRTCModel()
    {
    }
    
    public function get state():String {
      return _state;
    }
    
    public function set state(s:String):void {
      if (_state == Constants.IN_CONFERENCE && _state != s) { // when state changes from IN_CONFERENCE play sound
        var tSC:SoundChannel = noticeSound.play(0, 0, new SoundTransform(0.25));
      }
      _state = s;
    }
     
  }
}