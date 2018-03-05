package org.bigbluebutton.air.screenshare.model
{
	public interface IScreenshareModel
	{
		function get isSharing():Boolean;
		
		function get width():int;
		
		function set width(w:int):void;
		
		function get height():int;
		
		function set height(h:int):void;
		
		function get url():String;
		
		function set url(u:String):void;
		
		function get streamId():String;
		
		function set streamId(s:String):void;
		
		function get authToken():String;
		
		function set authToken(token:String):void;
		
		function get jnlp():String;
		
		function set jnlp(j:String):void;
		
		function get session():String;
		
		function set session(j:String):void;
	}
}