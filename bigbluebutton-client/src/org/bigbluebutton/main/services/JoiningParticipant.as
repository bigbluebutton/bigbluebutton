package org.bigbluebutton.main.services
{
	import org.bigbluebutton.main.model.User;
	
	public class JoiningParticipant
	{
		public function parse(xml:XML):User{
			
			var participant:User = new User();
			participant.conference = xml.@conference;
			participant.room = xml.@room;
			participant.role = xml.@role;
			participant.name = xml.@name;
			participant.authToken = xml.@authToken;
			
			return participant;  		
		}

	}
}