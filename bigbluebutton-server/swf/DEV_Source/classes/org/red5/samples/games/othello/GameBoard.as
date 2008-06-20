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
import org.red5.utils.GridManager;
import flash.filters.DropShadowFilter;
import org.red5.utils.Delegate;
import com.gskinner.events.GDispatcher;
import org.red5.samples.games.othello.GamePiece;
import org.red5.samples.games.othello.GameManager;

class org.red5.samples.games.othello.GameBoard extends MovieClip {
// Constants:
	public static var CLASS_REF = org.red5.samples.games.othello.GameBoard;
	public static var LINKAGE_ID:String = "org.red5.samples.games.othello.GameBoard";
	public static var _instance:MovieClip;
// Public Properties:
	public var addEventListener:Function
	public var removeEventListener:Function;
// Private Properties:
	private var dispatchEvent:Function;
	private var ds:DropShadowFilter;
	private var gamePiece:String = GamePiece.LINKAGE_ID;
	private var gameManager:GameManager;
	private var gamePieceList:Object;
// UI Elements:

// ** AUTO-UI ELEMENTS **
	private var bg:MovieClip;
	private var content:MovieClip;
	private var frame:MovieClip;
// ** END AUTO-UI ELEMENTS **

// Initialization:
	private function GameBoard() 
		{
			GDispatcher.initialize(this);
			ds = new DropShadowFilter(4, 45, 0, 1, 5, 5, 1, 3, false, false, false);
		}
	private function onLoad():Void { configUI(); }

// Public Methods:

	public function calculateWinner():Object
	{
		var white:Number = 0;
		var black:Number = 0;
		
		for(var i:Number=0;i<GridManager.gridCount;i++)
		{
			var gp:GamePiece = validatePiece(i);
			if(gp != undefined)
			{
				if(gp.state == "white") white ++;
				if(gp.state == "black") black ++;
			}
		}
		var count:Number = 0;
		var winner:String = black - white > 0 ? "black" : "white";
		winner = black == white ? "tie" : winner;
		count = black - white > 0 ? black : white;
		
		return {winner:winner, count:count};
	}
	public function createBoard():Void
	{
		gamePieceList = new Object();
		GridManager.initGrid(content,8,8,400,400, 5, 0x339900, true);
		content.filters = [ds];
		frame.filters = [ds];
	}
	
	public function createPiece(p_x:Number, p_y:Number, p_side:String):Void
	{
		var index:Number = GridManager.calcGridLocation(p_x, p_y);
		var mc:MovieClip = this.attachMovie(gamePiece, "gamePiece" + String(index), index); 
		mc._x = p_x;
		mc._y = p_y;
		mc.registerGameManager(gameManager);
		mc.registerGameBoard(this);
		mc.changeState(p_side);
		mc.index = index;	
		gamePieceList[String(index)] = mc;
	}
	
	public function validatePiece(p_gamePieceNumber:Number):GamePiece
	{
		var gp:GamePiece = gamePieceList[String(p_gamePieceNumber)];
		if(!(gp instanceof GamePiece)) gp = undefined;
		return gp;
	}
	
	public function removeGamePiece(evtObj:Object):Void
	{
		var index:Number = evtObj.target.index
		gamePieceList[String(index)] = undefined;
		evtObj.target.removeMovieClip();
	}
	
	public function resolveSiblings(index:Number):Object
	{
		var siblings:Object = new Object();
		var matrixLocation:Object = GridManager.getColRow(index);
		var topTest:Number = (index - GridManager.cols);
		var topLeftTest:Number = (index - (GridManager.cols+1));
		var topRightTest:Number = (index - (GridManager.cols-1));
		var bottomTest:Number = ((GridManager.rows*GridManager.cols)-1)-GridManager.cols;
		var bottomLeftTest:Number = index + GridManager.cols - 1;
		var bottomRightTest:Number = index + GridManager.cols + 1;
		
		// there is a left side
		if(index % GridManager.cols != 0) siblings.left = index - 1;

		// there is a bottom
		if(index <= bottomTest) siblings.bottom = index + GridManager.cols;

		// there is a right side
		if((index - (GridManager.cols-1)) % GridManager.cols != 0) siblings.right = index + 1;

		// there is a top
		if(topTest >= 0) siblings.top = topTest;
		
		// there is an upper left
		if(topLeftTest >= 0) 
		{
			var rowTest:Number = GridManager.getColRow(topLeftTest).row;
			if(GridManager.getColRow(topLeftTest).row != matrixLocation.row
			&& Math.abs(rowTest - matrixLocation.row) <= 1) siblings.topLeft = topLeftTest;
		}
		
		// there is an upper right
		if(topRightTest >= 0) 
		{
			var rowTest:Number = GridManager.getColRow(topRightTest).row;
			if(rowTest != matrixLocation.row
			&& Math.abs(rowTest - matrixLocation.row) <= 1) siblings.topRight = index - (GridManager.cols-1);
		}
		
		// there is a bottom Left
		if(bottomLeftTest <= GridManager.gridCount) 
		{
			var rowTest:Number = GridManager.getColRow(bottomLeftTest).row;
			if(rowTest != matrixLocation.row
			&& Math.abs(rowTest - matrixLocation.row) <= 1) siblings.bottomLeft = index + GridManager.cols - 1;
		}
		
		// there is a bottom Right
		if(bottomRightTest <= GridManager.gridCount)
		{
			var rowTest:Number = GridManager.getColRow(bottomRightTest).row;
			if(rowTest != matrixLocation.row
			&& Math.abs(rowTest - matrixLocation.row) <= 1) siblings.bottomRight = index + GridManager.cols + 1;
		}
		
		return siblings;
	}
	
	public function registerGameManager(p_gameManager:GameManager):Void
	{
		gameManager = p_gameManager;
	}
// Semi-Private Methods:
// Private Methods:
	private function configUI():Void 
	{
		_instance = this;
		bg.onRelease = Delegate.create(this, boardClick);
	}
	
	private function boardClick(evtObj:Object):Void
	{
		var valid:GamePiece = validatePiece(GridManager.currentGridLocation);
		if(valid == undefined) dispatchEvent({type:"boardClick"})
	}
}