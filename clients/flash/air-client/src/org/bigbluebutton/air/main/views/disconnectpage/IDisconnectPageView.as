package org.bigbluebutton.air.main.views.disconnectpage {
	
	import spark.components.Button;
	
	public interface IDisconnectPageView {
		function get currentState():String
		function set currentState(value:String):void
		function get exitButton():Button
		function get reconnectButton():Button
	}
}
