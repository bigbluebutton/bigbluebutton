package org.bigbluebutton.core.model
{
  public class MeetingBuilder
  {
    internal var id: String;
    internal var name: String;
    internal var layout: String;
    internal var voiceConf: String;
    internal var externId: String;
    
    public function MeetingBuilder(id: String, name: String) {
      this.id = id;
      this.name = name;
    }
    
    public function withLayout(value: String):MeetingBuilder {
      layout = value;
      return this;
    }
    
    public function withVoiceConf(value: String):MeetingBuilder {
      voiceConf = value;
      return this;
    }
    
    public function withExternalId(value: String):MeetingBuilder {
      externId = value;
      return this;
    }
    
    public function build():Meeting {
      return new Meeting(this);
    }
  }
}