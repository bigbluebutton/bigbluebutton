package org.bigbluebutton.air.main.views {
	
	import spark.components.Button;
	
	public interface IDisconnectPageView {
		function get currentState():String
		function set currentState(value:String):void
		function get exitButton():Button
	}
}