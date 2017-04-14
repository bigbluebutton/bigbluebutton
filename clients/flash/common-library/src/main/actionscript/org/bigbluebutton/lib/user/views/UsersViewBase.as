package org.bigbluebutton.lib.user.views
{
	import mx.core.ClassFactory;
	
	import spark.components.Label;
	import spark.components.List;
	import spark.components.VGroup;
	import spark.components.supportClasses.ItemRenderer;
	import spark.layouts.VerticalLayout;
	
	public class UsersViewBase extends VGroup {
		private var _userLabel:Label;
		
		public function get userLabel():Label {
			return _userLabel;
		}
		
		private var _userList:List;
		
		public function get userList():List {
			return _userList;
		}
		
		public function UsersViewBase() {
			super();
			
			_userLabel = new Label();
			_userLabel.percentWidth = 100;
			_userLabel.styleName = "content";
			_userLabel.text = "Users";
			addElement(_userLabel);
			
			_userList = new List();
			_userList.percentWidth = 100;
			var itemRendererClass:ClassFactory = new ClassFactory(getItemRendererClass());
			_userList.itemRenderer = itemRendererClass;
			
			var listLayout:VerticalLayout = new VerticalLayout();
			listLayout.requestedRowCount = -1;
			_userList.layout = listLayout;
			
			addElement(_userList);
		}
		
		protected function getItemRendererClass():Class {
			return UserItemRenderer;
		}
	}
}