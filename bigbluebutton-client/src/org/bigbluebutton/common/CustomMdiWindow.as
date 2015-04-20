/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.common
{
  import flash.ui.ContextMenu;
  
  import flexlib.mdi.containers.MDIWindow;
  import flexlib.mdi.managers.MDIManager;
  
  import mx.utils.ObjectUtil;
  
  /**
   *  This class exists so we can properly handle context menus on MDIWindow
   *  instances. Also, we'll be able in the future to properly handle shortcuts
   *  such as SHIFT + LEFT/RIGHT ARROW while in a text area (today, besides
   *  selecting the text, it will move the window).
   */
  public class CustomMdiWindow extends MDIWindow {
    
    private static const IGNORED_MENU_ITEMS:Array = new Array(
        MDIWindow.CONTEXT_MENU_LABEL_CLOSE,
        MDIManager.CONTEXT_MENU_LABEL_TILE,
        MDIManager.CONTEXT_MENU_LABEL_TILE_FILL,
        MDIManager.CONTEXT_MENU_LABEL_CASCADE,
        MDIManager.CONTEXT_MENU_LABEL_SHOW_ALL );
        
    private var _customContextMenuItems:Array = null;
    
    private function filterContextMenu(item:*, index:int, array:Array):Boolean {
      return IGNORED_MENU_ITEMS.indexOf(item.caption) < 0;
    }
    
    override public function updateContextMenu():void {
      super.updateContextMenu();
      
      var modifiedContextMenuItems:Array = new Array();
      
      if (customContextMenuItems != null) {
        if (modifiedContextMenuItems.length > 0 && customContextMenuItems.length > 0) {
          modifiedContextMenuItems[0].separatorBefore = true;
        }
        modifiedContextMenuItems = customContextMenuItems.concat(modifiedContextMenuItems);
      }
      
      if (this.contextMenu != null) {
        var filteredMenu:Array = this.contextMenu.customItems.filter(filterContextMenu);
        if (modifiedContextMenuItems.length > 0 && filteredMenu.length > 0) {
          filteredMenu[0].separatorBefore = true;
        }
        modifiedContextMenuItems = modifiedContextMenuItems.concat(filteredMenu);
      }
      
      var modifiedContextMenu:ContextMenu = new ContextMenu();
      modifiedContextMenu.hideBuiltInItems();
      modifiedContextMenu.customItems = modifiedContextMenuItems;
      this.contextMenu = modifiedContextMenu;
    }
    
    override public function set showCloseButton(value:Boolean):void {
      super.showCloseButton = value;
      
      updateContextMenu();
    }
    
    public function get customContextMenuItems():Array {
      return _customContextMenuItems;
    }
    
    public function set customContextMenuItems(value:Array):void {
      _customContextMenuItems = value;
      
      updateContextMenu();
    }
  }
}
