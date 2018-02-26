package org.bigbluebutton.air.main.models {
	
	import mx.collections.ArrayList;
	
	import org.bigbluebutton.air.common.TransitionAnimationEnum;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class UISession implements IUISession {
		private var _loading:Boolean = true;
		
		private var _loadingMessage:String = "Loading";
		
		private var _loadingChangeSignal:Signal = new Signal();
		
		private var _pageTransitionStartSignal:Signal = new Signal();
		
		private var _pageChangedSignal:Signal = new Signal();
		
		protected var _listPages:ArrayList = new ArrayList([]);
		
		public function get loading():Boolean {
			return _loading;
		}
		
		public function get loadingMessage():String {
			return _loadingMessage;
		}
		
		public function get loadingChangeSignal():ISignal {
			return _loadingChangeSignal;
		}
		
		public function setLoading(val:Boolean, message:String):void {
			_loading = val;
			_loadingMessage = message;
			try {
				var jsonMsg:Object = JSON.parse(_loadingMessage);
				_loadingMessage = jsonMsg[0].message;
			} catch (e:Error) {
				// Swallow : message is not in JSON format
			}
			_loadingChangeSignal.dispatch(_loading, _loadingMessage);
		}
		
		public function get pageTransitionStartSignal():ISignal {
			return _pageTransitionStartSignal;
		}
		
		public function get pageChangedSignal():ISignal {
			return _pageChangedSignal;
		}
		
		
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
	}
}
