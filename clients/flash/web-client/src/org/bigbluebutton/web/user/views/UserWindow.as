package org.bigbluebutton.web.user.views {
	import mx.controls.Button;
	import mx.core.ClassFactory;
	
	import org.apache.flex.collections.ArrayList;
	import org.bigbluebutton.web.util.i18n.ResourceUtil;
	import org.bigbluebutton.web.window.views.BBBWindow;
	import org.osflash.signals.Signal;
	
	import spark.components.gridClasses.GridColumn;
	
	public class UserWindow extends BBBWindow {
		public var usersGrid:UserDataGrid;
		
		public var raiseHandButton:Button;
		
		private var _lowerHandSignal:Signal;
		
		public function get lowerHandSignal():Signal {
			return _lowerHandSignal;
		}
		
		private var _changePresenterSignal:Signal;
		
		public function get changePresenterSignal():Signal {
			return _changePresenterSignal;
		}
		
		private var _changeMuteSignal:Signal;
		
		public function get changeMuteSignal():Signal {
			return _changeMuteSignal;
		}
		
		private var _kickUserSignal:Signal;
		
		public function get kickUserSignal():Signal {
			return _kickUserSignal;
		}
		
		public function UserWindow() {
			super();
			
			_lowerHandSignal = new Signal();
			_changePresenterSignal = new Signal();
			_changeMuteSignal = new Signal();
			_kickUserSignal = new Signal();
			
			title = ResourceUtil.getInstance().getString('bbb.users.title', ["", ""]);
			width = 300;
			height = 400;
			
			usersGrid = new UserDataGrid();
			usersGrid.percentHeight = 100;
			usersGrid.percentWidth = 100;
			usersGrid.setupSignals(_lowerHandSignal, _changePresenterSignal, _changeMuteSignal, _kickUserSignal);
			
			var cols:ArrayList = new ArrayList();
			
			var column:GridColumn = new GridColumn;
			column.headerText = ResourceUtil.getInstance().getString('bbb.users.usersGrid.statusItemRenderer');
			column.width = 55;
			column.itemRenderer = new ClassFactory(StatusItemRenderer);
			cols.addItem(column);
			column = new GridColumn;
			column.headerText = ResourceUtil.getInstance().getString('bbb.users.usersGrid.nameItemRenderer');
			column.itemRenderer = new ClassFactory(NameItemRenderer);
			cols.addItem(column);
			column = new GridColumn;
			column.headerText = ResourceUtil.getInstance().getString('bbb.users.usersGrid.mediaItemRenderer');
			column.width = 70;
			column.itemRenderer = new ClassFactory(MediaItemRenderer);
			cols.addItem(column);
			
			usersGrid.columns = cols;
			
			addElement(usersGrid);
			
			controlBarContent = new Array();
			
			raiseHandButton = new Button();
			raiseHandButton.toggle = true;
			raiseHandButton.styleName = "raiseHandButtonStyle";
			raiseHandButton.width = 30;
			raiseHandButton.height = 30;
			controlBarContent.push(raiseHandButton);
		}
	}
}
