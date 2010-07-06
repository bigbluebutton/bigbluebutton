package org.bigbluebutton.main.model
{
	import org.bigbluebutton.common.LogUtil;

	public class ApplicationModel
	{
		private var _participant:User;
		
		public function ApplicationModel()
		{
		}

		public function setParticipant(p:User):void {
			LogUtil.debug("Setting participant");
			_participant = p;
		}
	}
}