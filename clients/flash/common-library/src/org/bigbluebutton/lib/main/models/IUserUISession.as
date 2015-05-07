package org.bigbluebutton.lib.main.models {
	
	import org.osflash.signals.ISignal;
	
	public interface IUserUISession {
		function get pageChangedSignal():ISignal;
		function get pageTransitionStartSignal():ISignal;
		function get loadingSignal():ISignal;
		function get joinFailureSignal():ISignal;
		function get currentPage():String;
		function get lastPage():String;
		function popPage(animation:int):void;
		function pushPage(value:String, details:Object, animation:int):void;
		function get currentPageDetails():Object;
		function get loading():Boolean;
		function set loading(value:Boolean):void;
	}
}
