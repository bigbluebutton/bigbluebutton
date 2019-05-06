package org.bigbluebutton.core.model
{
  public class MeetingBuilder
  {
    internal var id:String;
    internal var name:String;
    internal var voiceConf:String;
    internal var externId:String;
	internal var isBreakout:Boolean;
    internal var defaultAvatarUrl:String;
    internal var dialNumber:String;
    internal var recorded:Boolean;
    internal var defaultLayout:String;    
    internal var welcomeMessage:String;
    internal var modOnlyMessage:String;
    internal var allowStartStopRecording: Boolean;
    internal var metadata: Object;
    internal var allowModsToUnmuteUsers: Boolean;
	internal var muteOnStart:Boolean;
    
    public function MeetingBuilder(id: String, name: String) {
      this.id = id;
      this.name = name;
    }
        
    public function withVoiceConf(value: String):MeetingBuilder {
      voiceConf = value;
      return this;
    }
    
    public function withExternalId(value: String):MeetingBuilder {
      externId = value;
      return this;
    }
	
	public function withBreakout(value : Boolean):MeetingBuilder {
		isBreakout = value;
		return this;
	}

    public function withDefaultAvatarUrl(value: String):MeetingBuilder {
      defaultAvatarUrl = value;
      return this;
    }
    
    public function withDialNumber(value: String):MeetingBuilder {
      dialNumber = value;
      return this;
    }
    
    public function withRecorded(value: Boolean):MeetingBuilder {
      recorded = value;
      return this;
    }
   
    public function withAllowStartStopRecording(value: Boolean):MeetingBuilder {
      allowStartStopRecording = value;
      return this;
    }
	
    public function withDefaultLayout(value: String):MeetingBuilder {
      defaultLayout = value;
      return this;
    }
    
    public function withWelcomeMessage(value: String):MeetingBuilder {
      welcomeMessage = value;
      return this;
    }
    
    public function withModOnlyMessage(value: String):MeetingBuilder {
      modOnlyMessage = value;
      return this;
    }    
    
    public function withMetadata(value: Object):MeetingBuilder {
      metadata = value;
      return this;
    }

    public function withAllowModsToUnmuteUsers(value: Boolean):MeetingBuilder {
      allowModsToUnmuteUsers = value;
      return this;
    }
	
	public function withMuteOnStart(value: Boolean):MeetingBuilder {
		muteOnStart = value;
		return this;
	}

    public function build():Meeting {
      return new Meeting(this);
    }
  }
}