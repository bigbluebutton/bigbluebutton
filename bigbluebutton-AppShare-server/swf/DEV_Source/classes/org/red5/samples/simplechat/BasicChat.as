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
//import com.metaliq.controls.ColorPicker;
import mx.controls.TextInput;
import org.red5.ui.controls.IconButton;
import mx.controls.TextArea;
// ** END AUTO-UI IMPORT STATEMENTS **
import org.red5.utils.GlobalObject;
import org.red5.net.Connection;
//import org.red5.samples.livestream.videoconference.Connection;
import org.red5.utils.Delegate;

class org.red5.samples.simplechat.BasicChat extends MovieClip {
// Constants:
	public static var CLASS_REF = org.red5.samples.simplechat.BasicChat;
	public static var LINKAGE_ID:String = "org.red5.samples.simplechat.BasicChat";
// Public Properties:
	public var connection:Connection;
// Private Properties:
	private var connected:Boolean;
	private var so:GlobalObject;
	private var history:Array;
	private var chatID:String;
	private var defaultUserName:String = "Looser User"
// UI Elements:

// ** AUTO-UI ELEMENTS **
	private var chatBody:TextArea;
	private var clearChat:IconButton;
	private var clr:MovieClip;
	private var message:TextInput;
	private var userName:TextInput;
// ** END AUTO-UI ELEMENTS **

// Initialization:
	private function BasicChat() {}
	private function onLoad():Void { configUI(); }

// Public Methods:
	public function registerConnection(p_connection:Connection):Void
	{
		connection = p_connection;
	}
	
	public function connectSO(p_soName:String):Void
	{
		// parms
		// @ SO name
		// @ Connection reference
		// @ persistance
		if(p_soName == undefined) p_soName = "SampleChat";
		chatID = p_soName;
		connected = so.connect(p_soName, connection, false);
	}
// Semi-Private Methods:
// Private Methods:
	private function configUI():Void 
	{
		// instantiate history object
		history = new Array();
		
		// add key listener for enter key
		Key.addListener(this);
		
		// create GlobalObject
		so = new GlobalObject();
		
		// add listener for sync events
		so.addEventListener("onSync", Delegate.create(this, newMessageHandler));
		
		// setup the clearChat button
		clearChat.addEventListener("click", Delegate.create(this, clear))
		clearChat.tooltip = "Clear Chat";
		chatBody.html = true;
	}	
	
	private function onKeyUp():Void
	{
		if(Key.getCode() == 13 && message.length > 0)
		{
			// send message
			var msg = message.text;
			msg = getUserName() + msg;
			so.setData(chatID, msg);
			
			// clear text input
			message.text = "";
		}
	}
	
	private function getUserName():String
	{
		var name:String = userName.text.length > 0 ? userName.text : defaultUserName;
		var value:String = "<font color=\"" + clr.palette.cLabel.text + "\"><b>" + name + "</b></font> - ";
		return value;
	}
	
	private function clear():Void
	{
		// clear chat
		chatBody.text = "";
		
		// clear doesn't work on Red5 yet
		//so.clear();
	}
	
	private function newMessageHandler(evtObj:Object):Void
	{
		// we've been notified that there's a new message, go get it
		var newChat:String = so.getData(chatID);
		
		// return if newChat is null
		if(newChat == null) return;
		
		// push to history
		history.push(newChat);
		
		// show in chat
		chatBody.text = history.join("\n");
		
		// scroll the chat window
		chatBody.vPosition = chatBody.maxVPosition;
	}
}