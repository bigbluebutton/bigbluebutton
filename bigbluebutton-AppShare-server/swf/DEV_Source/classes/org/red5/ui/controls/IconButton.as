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
import com.gskinner.events.GDispatcher;
import org.red5.utils.Delegate;
import com.neoarchaic.ui.Tooltip;
import org.red5.ui.controls.Help;

class org.red5.ui.controls.IconButton extends Help {
// Constants:
	public static var CLASS_REF = org.red5.ui.controls.IconButton;
	public static var LINKAGE_ID:String = "org.red5.ui.controls.IconButton";
// Public Properties:
	public var addEventListener:Function;
	public var removeEventListener:Function;
	public var tooltip:String = "Set Tool Tip";
// Private Properties:
	private var dispatchEvent:Function;
// UI Elements:

// ** AUTO-UI ELEMENTS **
// ** END AUTO-UI ELEMENTS **

// Initialization:
	private function IconButton() {GDispatcher.initialize(this);}
	private function onLoad():Void { configUI(); }

// Public Methods:
// Semi-Private Methods:
// Private Methods:
	private function configUI():Void 
	{
		onRelease = Delegate.create(this, onClickHandler);
		onRollOver = Delegate.create(this, onRollOverHandler);
		onRollOut = Delegate.create(this, onRollOutHandler);
	}
	
	private function onClickHandler():Void
	{
		Tooltip.hide();
		dispatchEvent({type:"click"});
	}
	
	private function onRollOverHandler():Void
	{
		Tooltip.show(tooltip);
		dispatchEvent({type:"rollOver"});
	}
	
	private function onRollOutHandler():Void
	{
		Tooltip.hide();
		dispatchEvent({type:"rollOut"});
	}

}