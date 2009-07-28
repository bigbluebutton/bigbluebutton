package org.bigbluebutton.main.services
{
	import org.bigbluebutton.main.model.Participant;
	
	public class JoiningParticipant
	{
		public function parse(xml:XML):Participant{
			
			var participant:Participant = new Participant();
			participant.conference = xml.@conference;
			participant.room = xml.@room;
			participant.role = xml.@role;
			participant.name = xml.@name;
			participant.authToken = xml.@authToken;
			
			return participant;  		
		}

	}
}