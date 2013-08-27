/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.modules.whiteboard.business.shapes
{
	import flash.display.Sprite;
	
	/**
	 * ...
	 * @author   : Sandeep Vallabaneni
	 * @link     : http://flexstreamer.com
	 * @version  : 0.1
	 * @Date     : 20 January 2011
	 */
	
	public class DrawGrid extends Sprite
	{
		private var _xLineHolder:Sprite       = new Sprite(); // Horizontal line holder
		private var _yLineHolder:Sprite       = new Sprite(); // Vertical line holder
		private var _lineColor:uint           = 0x000000;     // Default Color
		private var _gridAlpha:Number         = .3;           // Default Visibility/Alpha
		private var _numXDivs:Number          = 10;           // Horizontal Gap
		private var _numYDivs:Number          = 10;           // Vertical Gap
		private var _gridWidth:Number         = 100;          // Grid Width
		private var _gridHeight:Number        = 100;          // Grid Height
		
		/** @usage :
		 * var grid:DrawGrid = new DrawGrid(600, 400, 10, 10);
		 * addChild(grid);
		 */
		
		public function DrawGrid(w:int=100, h:int=100, xDistance:int=10, yDistance:int=10)
		{
			addChild(_xLineHolder);
			addChild(_yLineHolder);
			
			this._gridWidth = w;
			this._gridHeight = h;
			this._numXDivs = xDistance;
			this._numYDivs = yDistance;
			
			this.updateGrid();
			
		}
		
		// To Create Grid
		private function updateGrid():void
		{
			var spaceXDiv:Number = _gridWidth/_numXDivs;
			var spaceYDiv:Number = _gridHeight/_numYDivs;
			
			_xLineHolder.graphics.clear();
			_yLineHolder.graphics.clear();
			
			_xLineHolder.graphics.lineStyle(1, _lineColor, _gridAlpha);
			_yLineHolder.graphics.lineStyle(1, _lineColor, _gridAlpha);
			for(var i:int = 0; i <= spaceXDiv; i++){
				_xLineHolder.graphics.moveTo(i * _numXDivs, 0);
				_xLineHolder.graphics.lineTo(i * _numXDivs, _gridHeight);
			}
			
			for(var j:int = 0; j <= spaceYDiv; j++){
				_yLineHolder.graphics.moveTo( 0, j * _numYDivs);
				_yLineHolder.graphics.lineTo(_gridWidth, j * _numYDivs);
			}
		}
		
		//--------------------------------------------------------------------------------------------------------
		//************************************* SETTERS AND GETTERS***********************************************
		//************************************* GRID COLOR********************************************************
		/** @usage :
		 * var grid:DrawGrid = new DrawGrid(600, 400, 10, 10);
		 * addChild(grid);
		 * grid.setlineColor = 0xff0000;
		 */
		public function set setlineColor(clr:Number):void
		{
			this._lineColor = clr;
			this.updateGrid();
		}
		
		public function get getlineColor():Number
		{
			return this._lineColor;
		}
		//*************************************HORIZONTAL GAP********************************************************
		/** @usage :
		 * var grid:DrawGrid = new DrawGrid(600, 400, 10, 10);
		 * addChild(grid);
		 * grid.hGap = 5;
		 */
		public function set hGap(val:Number):void
		{
			this._numXDivs = val;
			this.updateGrid();
		}
		
		public function get hGap():Number
		{
			return this._numXDivs;
		}
		//*************************************VERTICAL GAP***********************************************************
		/** @usage :
		 * var grid:DrawGrid = new DrawGrid(600, 400, 10, 10);
		 * addChild(grid);
		 * grid.vGap = 5;
		 */
		public function set vGap(val:Number):void
		{
			this._numYDivs = val;
			this.updateGrid();
		}
		
		public function get vGap():Number
		{
			return this._numYDivs;
		}
		//*************************************LINE ALPHA*************************************************************
		/** @usage :
		 * var grid:DrawGrid = new DrawGrid(600, 400, 10, 10);
		 * addChild(grid);
		 * grid.gridAlpha = .5;
		 */
		public function set gridAlpha(val:Number):void
		{
			this._gridAlpha = val;
			this.updateGrid();
		}
		
		public function get gridAlpha():Number
		{
			return this._gridAlpha;
		}
		//*************************************GRID SIZE*************************************************************
		/** @usage :
		 * var grid:DrawGrid = new DrawGrid(600, 400, 10, 10);
		 * addChild(grid);
		 * grid.setSize(300,200);
		 */
		public function setSize(w:Number, h:Number):void
		{
			this._gridWidth = w;
			this._gridHeight = h;
			this.updateGrid();
		}
		//--------------------------------------------------------------------------------------------------------
		
	}
	
}