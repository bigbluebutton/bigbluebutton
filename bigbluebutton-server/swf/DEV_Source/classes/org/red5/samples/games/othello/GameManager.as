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

import org.red5.samples.games.othello.GameBoard;
import org.red5.utils.GridManager;
import com.neoarchaic.ui.Tooltip;
import org.red5.samples.games.othello.GamePiece;
import com.gskinner.events.GDispatcher;
import com.blitzagency.util.SimpleDialog;
//import org.red5.utils.Delegate;

class org.red5.samples.games.othello.GameManager {
// Constants:
	public static var CLASS_REF = org.red5.samples.games.othello.GameManager;
// Public Properties:
	public var addEventListener:Function;
	public var removeEventListener:Function;
	public var resettingGame:Boolean;
	//public var checkingStatus:Boolean;
	public var si:Number; // setinterval 
	public var __currentState:String = "black" // black always moves first
// Private Properties:
	private var dispatchEvent:Function;
	private var gameBoard:GameBoard;
	private var changeList:Array;
	private var tempChangeList:Array;
	private var alert:SimpleDialog;

	public function set currentState(newValue:String):Void
	{
		__currentState = newValue;
		dispatchEvent({type:"stateChange", currentState:newValue})
	}
	
	public function get currentState():String
	{
		return __currentState;
	}
// Initialization:
	public function GameManager() 
	{
		GDispatcher.initialize(this);
		resetChangeList();
	}

// Public Methods:
	public function registerGameBoard(p_gameBoard:GameBoard):Void
	{
		gameBoard = p_gameBoard;
		gameBoard.addEventListener("boardClick", this);
		GridManager.addEventListener("gridLocationChange", this);
	}
	
	public function checkGameStatus():Void
	{
		var playable:Boolean = false;
		var stateTest:String = ""
		var validPlayers:Array = new Array();
		var i:Number;
		var validPieceCount = 0;
		
		for(i=0;i<GridManager.gridCount;i++)
		{
			var gp:GamePiece = gameBoard.validatePiece(i);
			
			if(gp == undefined)
			{
				stateTest = "black";
				var siblings:Object = gameBoard.resolveSiblings(i);

				playable = checkState(siblings, stateTest);
				if(playable) 
				{
					validPlayers.push("black");
				}
				
				stateTest = "white"
				playable = checkState(siblings, stateTest);
				if(playable) 
				{
					validPlayers.push("white");
				}
				
				// we want to know if both black and white have valid moves.
				if(validPlayers.length == 2) break;
			}else
			{
				validPieceCount++;
			}
		}
		resetChangeList();
		
		if(!playable && validPieceCount > 5) 
		{
			gameOver();
		}else
		{
			// set the player to whomever is able to actually play
			// if there's only one valid player play, then change to that players turn
			if(validPlayers.length == 1)
			{
				currentState = validPlayers[0];
			}
		}
		_global.tt("Game still playable?", validPieceCount, validPlayers, currentState, playable);
	}
	
	public function processChangeList():Void
	{
		stopGameChecker();
		//_global.tt("processChangeList", changeList);
		if(changeList.length > 0)
		{
			for(var i:Number=0;i<changeList.length;i++)
			{
				changeList[i].changeState();
			}
		}
		
		// this means that a good peice was played and now, we can switch players
		switchPlayers();
		
		startGameChecker();
	}
	
	public function switchPlayers():Void
	{
		currentState = currentState == "white" ? "black" : "white";
	}
	
	public function checkState(p_siblings:Object, p_state:String):Boolean
	{
		if(resettingGame) return true;

		resetChangeList();
		var obj:Object = p_siblings;
		
		for(var items:String in obj)
		{
			var gp:GamePiece = gameBoard.validatePiece(obj[items]);
			tempChangeList = new Array();
			if(gp != undefined)
			{
				// check to see if this sibling is the opposite, and therefore a potential convert
				//_global.tt("checkState - gp?", gp, gp.state, p_gamePiece);
				if(gp.state != p_state) 
				{
					tempChangeList.push(gp);
					var goodList:Boolean = checkSiblings(gp, items, p_state);

					if(goodList) addToChangeList();
					//_global.tt("goodList?", goodList, changeList);
				}
			}
		}
		
		// if there are items to be fliped, then return that this was a valid move
		if(changeList.length > 0)
		{
			//_global.tt("changeList?", changeList);
			return true;
		}else
		{
			return false;
		}
	}
	
	public function resetGame():Void
	{
		resettingGame = true;
		
		startGameChecker();
		
		//var ary:Array = ["3|3|white", "4|3|white", "3|4|white", "4|4|white"]
		var ary:Array = ["3|3|white", "4|3|black", "3|4|black", "4|4|white"]
		
		for(var i:Number=0;i<ary.length;i++)
		{
			var nums:Array = ary[i].split("|");
			var center = GridManager.calcCenterSpot(Number(nums[0]), Number(nums[1]));
			gameBoard.createPiece(center.x, center.y, nums[2]);
		}
		resettingGame = false;
	}
	
	public function registerAlert(p_alert:SimpleDialog):Void
	{
		alert = p_alert;
	}

// Private Methods:
	
	private function addToChangeList():Void
	{
		for(var i:Number=0;i<tempChangeList.length;i++)
		{
			changeList.push(tempChangeList[i]);
		}
	}

	private function gameOver():Void
	{
		stopGameChecker();
		var obj:Object = gameBoard.calculateWinner();
		
		var winner:String = obj.winner;
		var count:Number = obj.count
		_global.tt("GAME OVER", winner, count);
		alert.title = "Game Over";
		alert.show("Game Over!\n" + winner + " is the winner with " + count + " pieces on the board!");
	}

	private function startGameChecker():Void
	{
		si = setInterval(this, "checkGameStatus", 1000);
	}
	
	private function stopGameChecker():Void
	{
		clearInterval(si);
	}

	private function resetChangeList():Void
	{
		changeList = new Array();
	}
	
	private function checkSiblings(p_piece:GamePiece, p_direction:String, p_convertTo:String):Boolean
	{
		// checkSiblings job is to round up the pieces that WILL be converted
		var obj:Object = p_piece.siblings;
		var gp:GamePiece = gameBoard.validatePiece(obj[p_direction]);
		//_global.tt("checkSiblings", arguments);
		if(gp != undefined) // if there IS a piece, let's test it's color
		{
			//_global.tt("0", gp, gp.state, p_convertTo);
			if(gp.state != p_convertTo) 
			{
				//_global.tt(1, "should push", gp.index, gp.state, p_convertTo);
				// if the piece 28 is the black, so we add it and call checkSiblings with the new gp
				tempChangeList.push(gp);
				return checkSiblings(gp, p_direction, p_convertTo);
			}else if(gp.state == p_convertTo)
			{
				//_global.tt(2);
				// we've located the end of the trail and the changeList can be executed
				return true;
			}
		}
		//_global.tt(3);
		// if we get down here, it's over, we never resolved the strand
		return false;
	}
	
	private function boardClick(evtObj:Object):Void
	{
		var obj:Object = GridManager.getColRow(GridManager.currentGridLocation)
		var center:Object = GridManager.calcCenterSpot(obj.col, obj.row);
		gameBoard.createPiece(center.x, center.y, currentState);
	}
	
	private function gridLocationChange(evtObj:Object):Void
	{
		Tooltip.show(evtObj.location);
	}
}
