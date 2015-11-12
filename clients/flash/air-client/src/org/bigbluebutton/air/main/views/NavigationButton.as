package org.bigbluebutton.air.main.views {
	
	import flash.events.MouseEvent;
	
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	import spark.components.Button;
	
	public class NavigationButton extends Button implements INavigationButton {
		private var _transitionAnimation:int;
		
		public function get transitionAnimation():int {
			return _transitionAnimation;
		}
		
		public function set transitionAnimation(value:int):void {
			_transitionAnimation = value;
		}
		
		private var _navigationSignal:Signal = new Signal();
		
		/**
		 * Dispatched when the user wants to navigato to a different page.
		 */
		public function get navigationSignal():ISignal {
			return _navigationSignal;
		}
		
		public function NavigationButton() {
			super();
		}
		
		override protected function childrenCreated():void {
			super.childrenCreated();
			this.addEventListener(MouseEvent.CLICK, onClick);
		}
		
		protected function onClick(e:MouseEvent):void {
			navigate();
		}
		
		protected function navigate():void {
			_navigationSignal.dispatch();
		}
		
		public function dispose():void {
			_navigationSignal.removeAll();
			this.removeEventListener(MouseEvent.CLICK, onClick);
		}
		
		protected var _navigateTo:Array = new Array();
		
		public function get navigateTo():Array {
			return _navigateTo;
		}
		
		public function set navigateTo(value:Array):void {
			_navigateTo = value;
		}
		
		protected var _pageDetails:String = "";
		
		public function get pageDetails():String {
			return _pageDetails;
		}
		
		public function set pageDetails(value:String):void {
			_pageDetails = value;
		}
	}
}
