package org.bigbluebutton.air.main.views {
	
	import org.bigbluebutton.air.common.views.IView;
	import org.osflash.signals.ISignal;
	
	public interface INavigationButton extends IView {
		function get navigationSignal():ISignal
		function get transitionAnimation():int
		function set transitionAnimation(value:int):void
		function get navigateTo():Array
		function set navigateTo(value:Array):void
		function get pageDetails():String
		function set pageDetails(value:String):void
		function get currentState():String
		function set currentState(value:String):void
		function get states():Array
	}
}
