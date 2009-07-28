package org.bigbluebutton.main.model
{
	public class ApplicationModel
	{
		private var _participant:Participant;
		
		public function ApplicationModel()
		{
		}

		public function setParticipant(p:Participant):void {
			LogUtil.debug("Setting participant");
			_participant = p;
		}
	}
}