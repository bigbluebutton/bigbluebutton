/**
* RED5 Open Source Flash Server - http://www.osflash.org/red5
*
* Copyright (c) 2006-2008 by respective authors (see below). All rights reserved.
*
* This library is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This library is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this library; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
*/

// ** AUTO-UI IMPORT STATEMENTS **
// ** END AUTO-UI IMPORT STATEMENTS **
import com.neoarchaic.ui.Tooltip;
import org.red5.utils.Delegate;
class org.red5.ui.controls.Help extends MovieClip {
// Constants:
	public static var CLASS_REF = org.red5.ui.controls.Help;
	public static var LINKAGE_ID:String = "org.red5.ui.controls.Help";
// Public Properties:
// Private Properties:
// UI Elements:

// ** AUTO-UI ELEMENTS **
// ** END AUTO-UI ELEMENTS **

// Initialization:
	private function Help() {}
	private function onLoad():Void { configUI(); }

// Public Methods:
	public function showTip(p_tip:String):Void
	{
		Tooltip.show(p_tip);
	}
	
	public function hideTip():Void
	{
		Tooltip.hide();
	}
// Semi-Private Methods:
// Private Methods:
	private function configUI():Void 
	{
		onRollOut = Delegate.create(this, hideTip);
	}
}