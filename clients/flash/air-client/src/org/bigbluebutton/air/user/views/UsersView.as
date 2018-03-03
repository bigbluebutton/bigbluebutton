package org.bigbluebutton.air.user.views {
	import mx.core.ClassFactory;
	
	import spark.components.Label;
	import spark.components.List;
	import spark.components.VGroup;
	import spark.layouts.VerticalLayout;
	
	public class UsersView extends VGroup {
		
		private var _userLabel:Label;
		
		public function get userLabel():Label {
			return _userLabel;
		}
		
		private var _userList:List;
		
		public function get userList():List {
			return _userList;
		}
		
		public function UsersView() {
			super();
			
			_userLabel = new Label();
			_userLabel.percentWidth = 100;
			_userLabel.styleName = "sectionTitle";
			_userLabel.text = "Online";
			addElement(_userLabel);
			
			_userList = new List();
			_userList.percentWidth = 100;
			_userList.percentHeight = 100;
			_userList.itemRenderer = new ClassFactory(getItemRendererClass());
			
			var listLayout:VerticalLayout = new VerticalLayout();
			listLayout.requestedRowCount = -1;
			listLayout.gap = 1;
			_userList.layout = listLayout;
			
			addElement(_userList);
		}
		
		protected function getItemRendererClass():Class {
			return UserItemRenderer;
		}
	}
}
