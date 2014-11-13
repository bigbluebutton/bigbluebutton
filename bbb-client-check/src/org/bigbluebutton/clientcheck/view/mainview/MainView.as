/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */

package org.bigbluebutton.clientcheck.view.mainview
{
	import flash.events.ContextMenuEvent;
	import flash.events.Event;
	import flash.system.System;
	import flash.ui.ContextMenu;
	import flash.ui.ContextMenuItem;

	import mx.events.FlexEvent;

	import spark.components.BorderContainer;
	import spark.components.Button;
	import spark.components.DataGrid;

	public class MainView extends MainViewBase implements IMainView
	{
		public function MainView():void
		{
			super.addEventListener(FlexEvent.CREATION_COMPLETE, creationCompleteHandler);
		}

		protected function creationCompleteHandler(event:Event):void
		{
			var contextMenu:ContextMenu=new ContextMenu();
			contextMenu.hideBuiltInItems();

			var copyAllButton:ContextMenuItem=new ContextMenuItem(resourceManager.getString('resources', 'bbbsystemcheck.copyAllText'));
			copyAllButton.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemHandler);
			contextMenu.customItems.push(copyAllButton);

			this.contextMenu=contextMenu;
		}

		protected function menuItemHandler(e:ContextMenuEvent):void
		{
			if (e.target.caption == resourceManager.getString('resources', 'bbbsystemcheck.copyAllText'))
			{
				System.setClipboard(getAllInfoAsString());
			}
		}

		private function getAllInfoAsString():String
		{
			var info:String="";

			for (var i:int=0; i < dataGrid.dataProvider.length; i++)
			{
				info+=dataGrid.dataProvider.getItemAt(i).Item + ":  " + dataGrid.dataProvider.getItemAt(i).Result + "  :  " + dataGrid.dataProvider.getItemAt(i).Status + "\n";
			}

			return info;
		}

		public function get dataGrid():DataGrid
		{
			return _dataGrid;
		}

		public function get view():BorderContainer
		{
			return super;
		}
	}
}
