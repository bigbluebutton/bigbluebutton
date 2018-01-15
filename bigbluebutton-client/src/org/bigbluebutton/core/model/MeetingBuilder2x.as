package org.bigbluebutton.core.model
{
	public class MeetingBuilder2x
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
		
		public function MeetingBuilder2x(id: String, name: String)
		{
			this.id = id;
			this.name = name;
		}
		
		public function withVoiceConf(value: String):MeetingBuilder2x {
			voiceConf = value;
			return this;
		}
		
		public function withExternalId(value: String):MeetingBuilder2x {
			externId = value;
			return this;
		}
		
		public function withBreakout(value : Boolean):MeetingBuilder2x {
			isBreakout = value;
			return this;
		}
		
		public function withDefaultAvatarUrl(value: String):MeetingBuilder2x {
			defaultAvatarUrl = value;
			return this;
		}
		
		public function withDialNumber(value: String):MeetingBuilder2x {
			dialNumber = value;
			return this;
		}
		
		public function withRecorded(value: Boolean):MeetingBuilder2x {
			recorded = value;
			return this;
		}
		
		public function withAllowStartStopRecording(value: Boolean):MeetingBuilder2x {
			allowStartStopRecording = value;
			return this;
		}
		
		public function withDefaultLayout(value: String):MeetingBuilder2x {
			defaultLayout = value;
			return this;
		}
		
		public function withWelcomeMessage(value: String):MeetingBuilder2x {
			welcomeMessage = value;
			return this;
		}
		
		public function withModOnlyMessage(value: String):MeetingBuilder2x {
			modOnlyMessage = value;
			return this;
		}    
		
		public function withMetadata(value: Object):MeetingBuilder2x {
			metadata = value;
			return this;
		}
		
		public function build():Meeting2x {
			return new Meeting2x(this);
		}
	}
}