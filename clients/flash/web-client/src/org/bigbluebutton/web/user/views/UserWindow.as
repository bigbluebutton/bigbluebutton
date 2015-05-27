package org.bigbluebutton.web.user.views {
	import mx.core.ClassFactory;
	
	import org.apache.flex.collections.ArrayList;
	import org.bigbluebutton.web.window.views.BBBWindow;
	
	import spark.components.DataGrid;
	import spark.components.gridClasses.GridColumn;
	
	public class UserWindow extends BBBWindow {
		public var usersGrid:DataGrid;
		
		public function UserWindow() {
			super();
			title = "Users";
			width = 300;
			height = 400;
			
			usersGrid = new DataGrid();
			usersGrid.percentHeight = 100;
			usersGrid.percentWidth = 100;
			
			var cols:ArrayList = new ArrayList();
			
			var column:GridColumn = new GridColumn;
			column.headerText = 'Status';
			column.width = 55;
			column.itemRenderer = new ClassFactory(StatusItemRenderer);
			cols.addItem(column);
			column = new GridColumn;
			column.headerText = 'Name';
			column.itemRenderer = new ClassFactory(NameItemRenderer);
			cols.addItem(column);
			column = new GridColumn;
			column.headerText = 'Media';
			column.width = 70;
			column.itemRenderer = new ClassFactory(MediaItemRenderer);
			cols.addItem(column);
			
			usersGrid.columns = cols;
			
			addElement(usersGrid);
		}
	}
}
