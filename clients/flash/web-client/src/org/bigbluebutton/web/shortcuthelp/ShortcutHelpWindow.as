package org.bigbluebutton.web.shortcuthelp {
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.external.ExternalInterface;
	
	import flexlib.mdi.events.MDIWindowEvent;
	
	import mx.collections.ArrayCollection;
	import mx.collections.ArrayList;
	import mx.controls.DataGrid;
	import mx.controls.List;
	import mx.controls.dataGridClasses.DataGridColumn;
	import mx.events.CollectionEvent;
	
	import org.bigbluebutton.web.main.commands.LocaleChangedSignal;
	import org.bigbluebutton.web.main.models.IShortcutOptions;
	import org.bigbluebutton.web.main.models.ShortcutOptions;
	import org.bigbluebutton.web.util.i18n.ResourceUtil;
	import org.bigbluebutton.web.window.views.BBBWindow;
	
	import spark.components.ComboBox;
	import spark.components.DropDownList;
	import spark.components.VGroup;
	
	public class ShortcutHelpWindow extends BBBWindow {
		
		private var baseIndex:int = 100;
		
		public var categories:DropDownList;
		
		public var keyList:DataGrid;
		
		public function ShortcutHelpWindow() {
			super();
			
			categories = new DropDownList();
			categories.labelField = "Please select an area for which to view shortcut keys: ";
			categories.tabIndex = baseIndex + 10;
			
			keyList = new DataGrid();
			keyList.draggableColumns = false;
			keyList.tabIndex = baseIndex + 15;
			
			var shortcut:DataGridColumn = new DataGridColumn();
			shortcut.dataField = "shortcut";
			shortcut.headerText = "Shortcut";
			
			var func:DataGridColumn = new DataGridColumn();
			func.dataField = "func";
			func.headerText = "Function";
			
			var columns:Array = keyList.columns;
			columns.push(shortcut);
			columns.push(func);
			keyList.columns = columns;
			
			var group:VGroup = new VGroup();
			group.addElement(categories);
			group.addElement(keyList);
			
			addElement(group);
		
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			keyList.width = w;
			keyList.height = h - keyList.y - titleBarOverlay.height;
		}
		
		public override function close(event:MouseEvent = null):void {
			//var dispatcher:Dispatcher = new Dispatcher();
			//dispatcher.dispatchEvent(new ShortcutEvent(ShortcutEvent.FOCUS_SHORTCUT_BUTTON));
			super.close(event);
		}
		
		override protected function resourcesChanged():void {
			super.resourcesChanged();
			updateResources();
		}
		
		public function updateResources():void {
			this.title = ResourceUtil.getInstance().getString('bbb.shortcuthelp.title');
			
			if (titleBarOverlay != null) {
				titleBarOverlay.accessibilityName = ResourceUtil.getInstance().getString('bbb.shortcuthelp.titleBar');
			}
			
			if (windowControls != null) {
				minimizeBtn.toolTip = ResourceUtil.getInstance().getString("bbb.window.minimizeBtn.toolTip");
				minimizeBtn.accessibilityName = ResourceUtil.getInstance().getString("bbb.shortcuthelp.minimizeBtn.accessibilityName");
				
				maximizeRestoreBtn.toolTip = ResourceUtil.getInstance().getString("bbb.window.maximizeRestoreBtn.toolTip");
				maximizeRestoreBtn.accessibilityName = ResourceUtil.getInstance().getString("bbb.shortcuthelp.maximizeRestoreBtn.accessibilityName");
				
				maximizeRestoreBtn.toolTip = ResourceUtil.getInstance().getString("bbb.window.closeBtn.toolTip");
				maximizeRestoreBtn.accessibilityName = ResourceUtil.getInstance().getString("bbb.shortcuthelp.closeBtn.accessibilityName");
			}
		}
		
		public function focusCategories():void { //actually focuses the datagrid instead
			focusManager.setFocus(keyList);
			keyList.drawFocus(true);
		}
		
		public function focusHead():void {
			//	focusManager.setFocus(titleBarOverlay);
		}
		
		public function focusButton(e:MDIWindowEvent):void {
			//	LogUtil.debug("Caught close event from window");
			//	var dispatcher:Dispatcher = new Dispatcher();
			//	dispatcher.dispatchEvent(new ShortcutEvent(ShortcutEvent.FOCUS_SHORTCUT_BUTTON));
		}
	}
}
