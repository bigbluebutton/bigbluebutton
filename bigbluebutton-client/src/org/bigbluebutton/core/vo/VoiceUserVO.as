package org.bigbluebutton.core.vo
{
  public class VoiceUserVO
  {
    public var id: String;       // voice user id
    public var webId: String     // web user id
    public var name: String;     // caller id name
    public var number: String;   // caller id num
    public var joined: Boolean;  // track if user has joined the voice conference or not
    public var locked: Boolean;  
    public var muted: Boolean;
    public var talking: Boolean;
    public var customData: Object;
    
    public function copy():VoiceUserVO {
      var vu: VoiceUserVO = new VoiceUserVO(); 
      vu.id = id;       
      vu.webId = webId     
      vu.name = name;     
      vu.number = number;   
      vu.joined = joined;  
      vu.locked = locked;  
      vu.muted = muted;
      vu.talking = talking;
      vu.customData = customData; 
      
      return vu;
    }
  }
}