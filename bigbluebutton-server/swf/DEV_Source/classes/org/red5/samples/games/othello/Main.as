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
import com.blitzagency.util.SimpleDialog;
import org.red5.samples.games.othello.SignupConnector;
import org.red5.samples.games.othello.MultiPlayerManager;
import org.red5.samples.games.othello.GameBoard;
// ** END AUTO-UI IMPORT STATEMENTS **
import org.red5.utils.GridManager;
import org.red5.samples.games.othello.GameManager;
import com.blitzagency.xray.util.XrayLoader;
import com.neoarchaic.ui.Tooltip;

class org.red5.samples.games.othello.Main extends MovieClip {
// Constants:
	public static var CLASS_REF = org.red5.samples.games.othello.Main;
	public static var LINKAGE_ID:String = "org.red5.samples.games.othello.Main";
// Public Properties:
// Private Properties:
	private var gameManager:GameManager;
	private var res:Object;
// UI Elements:

// ** AUTO-UI ELEMENTS **
	private var alert:SimpleDialog;
	private var board:GameBoard;
	private var connector:SignupConnector;
	private var multiPlayerManager:MultiPlayerManager;
// ** END AUTO-UI ELEMENTS **

// Initialization:
	private function Main() {XrayLoader.loadConnector("xray.swf");}
	private function onLoad():Void { configUI(); }

// Public Methods:
// Semi-Private Methods:
// Private Methods:
	private function configUI():Void 
	{
			
		// setup the tooltip defaults
		Tooltip.options = {size:10, font:"_sans", corner:0};
		
		// get notified of connection changes
		connector.addEventListener("connectionChange", this);
		
		// set the uri
		SignupConnector.red5URI = "rtmp://192.168.1.2/SOSample";
		
		// initialize the connector
		connector.configUI();
				
		// init grid
		GridManager.addEventListener("gridLocation", this);
		board.createBoard();
		
		// init the GameManager
		gameManager = new GameManager();
		gameManager.registerGameBoard(board);
		
		// register alerts
		gameManager.registerAlert(alert);
		multiPlayerManager.registerAlert(alert);
		
		board.registerGameManager(gameManager);
	}
	
	private function connectionChange(evtObj:Object):Void
	{		
		_global.tt("connectionChange", evtObj);
		if(evtObj.connected) 
		{
			_global.tt(0);
			//gameManager.resetGame();
			multiPlayerManager.configUI(connector.connection, evtObj.userName);
		}
	}

}