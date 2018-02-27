package org.bigbluebutton.air.main.models {
	
	import org.bigbluebutton.air.common.TransitionAnimationEnum;
	import org.osflash.signals.ISignal;
	
	public interface IUISession {
		function get loading():Boolean;
		function get loadingMessage():String;
		function get loadingChangeSignal():ISignal;
		function setLoading(val:Boolean, message:String = ""):void;
		function get pageChangedSignal():ISignal;
		function get pageTransitionStartSignal():ISignal;
		function get currentPage():String;
		function get lastPage():String;
		function popPage(animation:int = TransitionAnimationEnum.APPEAR):void;
		function pushPage(value:String, details:Object = null, animation:int = TransitionAnimationEnum.APPEAR):void;
		function get currentPageDetails():Object;
	}
}
