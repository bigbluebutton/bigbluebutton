package org.bigbluebutton.core.model
{
  public class MeetingBuilder
  {
    internal var id: String;
    internal var name: String;
    internal var layout: String;
    internal var voiceConference: String;
    internal var externId: String;
    
    public function MeetingBuilder(id: String, name: String) {
      this.id = id;
      this.name = name;
    }
    
    public function withLayout(value: String):void {
      layout = value;
      return this;
    }
    
    public function withVoiceConference(value: String):void {
      voiceConference = value;
      return this;
    }
    
    public function withExternalId(value: String):void {
      externId = value;
      return this;
    }
  }
}