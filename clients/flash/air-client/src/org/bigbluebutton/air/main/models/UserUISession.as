package org.bigbluebutton.air.main.models {
	
	import mx.collections.ArrayList;
	
	import org.bigbluebutton.air.common.TransitionAnimationEnum;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class UserUISession implements IUserUISession {
		public function UserUISession() {
		}
		
		/**
		 * Dispatched when the application is loading something
		 */
		private var _joinFailureSignal:Signal = new Signal();
		
		public function get joinFailureSignal():ISignal {
			return _joinFailureSignal;
		}
		
		/**
		 * Dispatched when the application is loading something
		 */
		private var _loadingSignal:Signal = new Signal();
		
		public function get loadingSignal():ISignal {
			return _loadingSignal;
		}
		
		/**
		 * Dispatched a transition between pages starts
		 */
		private var _pageTransitionStartSignal:Signal = new Signal();
		
		public function get pageTransitionStartSignal():ISignal {
			return _pageTransitionStartSignal;
		}
		
		/**
		 * Dispatched when there is a page change
		 */
		private var _pageChangedSignal:Signal = new Signal();
		
		public function get pageChangedSignal():ISignal {
			return _pageChangedSignal;
		}
		
		/**
		 * Holds the page's names used on ViewNavigator
		 */
		protected var _listPages:ArrayList = new ArrayList([]);
		
		public function get currentPage():String {
			var s:String = null;
			if (_listPages.length > 0) {
				s = _listPages.getItemAt(_listPages.length - 1).value as String;
			}
			return s;
		}
		
		public function get lastPage():String {
			var s:String = null;
			if (_listPages.length > 1) {
				s = _listPages.getItemAt(_listPages.length - 2).value as String;
			}
			return s;
		}
		
		public function pushPage(value:String, details:Object = null, animation:int = TransitionAnimationEnum.APPEAR):void {
			if (value != currentPage) {
				_listPages.addItem({value: value, details: details});
				var removeView:Boolean = false;
				_pageChangedSignal.dispatch(currentPage, removeView, animation);
			} else if (details) {
				_listPages.addItem({value: value, details: details});
			}
		}
		
		public function popPage(animation:int = TransitionAnimationEnum.APPEAR):void {
			if (_listPages.length > 0) {
				_listPages.removeItemAt(_listPages.length - 1);
				var removeView:Boolean = true;
				_pageChangedSignal.dispatch(currentPage, removeView, animation);
			}
		}
		
		public function get currentPageDetails():Object {
			var details:Object = null;
			if (_listPages.length > 0) {
				details = _listPages.getItemAt(_listPages.length - 1).details;
			}
			return details;
		}
		
		/**
		 * Should be set true when the application is loading data
		 */
		private var _loading:Boolean = true;
		
		public function get loading():Boolean {
			return _loading;
		}
		
		public function set loading(value:Boolean):void {
			_loading = value;
			_loadingSignal.dispatch(_loading);
		}
		
		private var _currentStreamName:String = "";
		
		public function get currentStreamName():String {
			return _currentStreamName;
		}
		
		public function set currentStreamName(value:String):void {
			_currentStreamName = value;
		}
	}
}
