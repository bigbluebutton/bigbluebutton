package org.bigbluebutton.core.model.users
{
  public class VoiceUser
  {
    private var _userId: String;
    private var _name: String;
    private var _number: String;
    private var _joined: Boolean;
    private var _locked: Boolean;
    private var _muted: Boolean;
    private var _talking: Boolean;
    
    public function VoiceUser(id: String, name: String) {
      _userId = id;
      _name = name;
    }
    
    public function withNumber(value: String):void {
      _number = value;
    }
    
    
  }
}