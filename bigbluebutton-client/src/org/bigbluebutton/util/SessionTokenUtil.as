package org.bigbluebutton.util
{

	public class SessionTokenUtil
	{
		private var _sessionToken:String = null;
		
		public function getSessionToken():String {
			if (_sessionToken == null || _sessionToken == "") {
				var p:QueryStringParameters = new QueryStringParameters();
				p.collectParameters();
				_sessionToken = p.getParameter("sessionToken");
			}
			return _sessionToken;
		}
	}
}