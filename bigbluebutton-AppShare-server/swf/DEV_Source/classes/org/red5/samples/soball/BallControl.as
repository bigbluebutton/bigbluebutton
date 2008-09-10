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
//import org.red5.ui.controls.IconButton;
// ** END AUTO-UI IMPORT STATEMENTS **
import org.red5.utils.GlobalObject;
import org.red5.net.Connection;
import org.red5.utils.Delegate;

class org.red5.samples.soball.BallControl extends MovieClip {
// Constants:
	public static var CLASS_REF = org.red5.samples.soball.BallControl;
	public static var LINKAGE_ID:String = "org.red5.samples.soball.BallControl";
// Public Properties:
	public var connection:Connection;
// Private Properties:
	private var connected:Boolean;
	private var so:GlobalObject;
	
	private var ballDragging:Boolean;
// UI Elements:

// ** AUTO-UI ELEMENTS **
	private var ball:MovieClip;
// ** END AUTO-UI ELEMENTS **

// Initialization:
	private function BallControl() {}
	private function onLoad():Void { configUI(); }

// Public Methods:
	public function registerConnection(p_connection:Connection):Void
	{
		connection = p_connection;
	}
	
	public function connectSO():Void
	{
		connected = so.connect("BallControl", connection);
	}
// Semi-Private Methods:
// Private Methods:
	private function configUI():Void 
	{		
		// create GlobalObject
		so = new GlobalObject();
		
		// add listener for sync events
		so.addEventListener("onSync", Delegate.create(this, newMessageHandler));
		
		// set ball handlers
		ball.onPress = Delegate.create(this, ballGrab);
		ball.onRelease = Delegate.create(this, ballRelease);
	}	
	
	private function ballGrab():Void
	{
		ballDragging = true;
		ball.startDrag();
		Mouse.addListener(this);
	}
	
	private function ballRelease():Void
	{
		ballDragging = false;
		stopDrag();
		Mouse.removeListener(this);
	}
	
	private function onMouseMove():Void
	{
		var obj = new Object();
		obj.x = ball._x;
		obj.y = ball._y;
		if(ballDragging) so.setData("ballCoordinates", obj);
	}
	
	private function newMessageHandler(evtObj:Object):Void
	{
		// we've been notified that there's a new message, go get it
		var obj:Object = so.getData("ballCoordinates");
		
		_global.tt("newMessageHandler update", obj);
		
		ball._x = obj.x;
		ball._y = obj.y;
	}
}