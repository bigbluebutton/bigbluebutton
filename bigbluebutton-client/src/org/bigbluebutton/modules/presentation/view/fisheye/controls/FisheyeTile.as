/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.presentation.view.fisheye.controls
{
	import fisheye.controls.fisheyeClasses.FisheyeAxis;
	import fisheye.controls.fisheyeClasses.FisheyeBase;
	import fisheye.controls.fisheyeClasses.FisheyeItem;
	
	import flash.geom.Rectangle;
	
	import mx.core.UIComponent;

	/** the vertical alignment */
	[Style(name="zoomMode", type="String", enumeration="scale,resize", inherit="no")]
	
	public class FisheyeTile extends FisheyeBase
	{
		/** the ideal positional data for the renderers.  When the inputs to the layout system change,
		 * this array is regenerated to represent the goal positions for each renderer.  Over time, the layout system
		 * will animate the children towards these positions */
		private var _pdata:Array = [];
		private var _hItems:Array = [];
		private var _vItems:Array = [];
		private var _hMouseItems:Array = [];
		private var _vMouseItems:Array = [];
		private var _mouseBounds:Rectangle = new Rectangle();
		private var _rowLength:int = 16;
		private var _colLength:int;
		private var _tileWidth:int;
		private var _tileHeight:int;
		private var _mouseData:Array = [];

		/** the direction this component lays out
		 */
		private var _direction:String = "vertical";

		/* abstractions around x/y, width/height. Instead of asking for x/y based properties directly,
		*  we go through these properties. Switch the properties, and our layout switches axis. Presto! */
		protected var hAxis:FisheyeAxis = new FisheyeAxis();
		protected var vAxis:FisheyeAxis = new FisheyeAxis();

		//-----------------------------------------------------------------

		public function FisheyeTile()		
		{
			hAxis.direction = "horizontal";
			vAxis.direction = "vertical";			
		}

		override protected function measure():void
		{
			_tileWidth = 0;
			_tileHeight = 0;
			
			// first, calculate the largest width/height of all the items, since we'll have to make all of the items
			// that size
			for(var i:int=0;i<renderers.length;i++)
			{
				var itemRenderer:UIComponent = renderers[i];
				_tileWidth = Math.max(_tileWidth,itemRenderer.getExplicitOrMeasuredWidth());
				_tileHeight = Math.max(_tileHeight,itemRenderer.getExplicitOrMeasuredHeight());
			}
			// square them off
			_tileWidth = Math.max(_tileWidth,_tileHeight);
			_tileHeight = _tileWidth;
						
			for(var i:int=0;i<_rowLength;i++)
			{
				_hItems[i].eomWidth = _hMouseItems[i].eomWidth = _tileWidth;
				_hItems[i].eomHeight = _hMouseItems[i].eomHeight = _tileHeight;
			}
			for(var i:int=0;i<_colLength;i++)
			{
				_vItems[i].eomWidth = _vMouseItems[i].eomWidth = _tileWidth;
				_vItems[i].eomHeight = _vMouseItems[i].eomHeight = _tileHeight;
			}
			
			/* here's where we should actually do some measurement */				
			// now that we have newly measured sizes, we'll need to recaculate sizing, and mouse positoins.
			animator.invalidateLayout();
		}
		
		
		override protected function commitProperties():void
		{
			var itemsChanged:Boolean = this.itemsChanged
			super.commitProperties();
			
			if(itemsChanged)
			{
				_hItems = [];
				_vItems = [];
				_hMouseItems = []
				_vMouseItems = [];
				_colLength = Math.ceil(dataProvider.length / _rowLength);				
				for(var i:int = 0;i<_rowLength;i++)
				{
					_hItems[i] = new FisheyeItem();
					_hMouseItems[i] = new FisheyeItem();
				}
				for(var i:int = 0;i<_colLength;i++)
				{
					_vItems[i] = new FisheyeItem();
					_vMouseItems[i] = new FisheyeItem();
				}
			}

		}

		override protected function generateLayout():void
		{
			var itemCount:int = dataProvider.length;

			var targetIndex:Number = (isNaN(hilightedItemIndex)? selectedItemIndex:hilightedItemIndex);
			
			if(isNaN(targetIndex))
			{
				populateMajorAxisForDefault(_hItems,hAxis,unscaledWidth);
				align(_hItems,hAxis);			
				populateMajorAxisForDefault(_vItems,vAxis,unscaledHeight);
				align(_vItems,vAxis);		
			}
			else
			{
				var hTargetIndex:Number = targetIndex % _rowLength;
				
				var hData:FisheyeItem = _hMouseItems[hTargetIndex];
				
				var hTargetPosition:Number = hData.x + hData.eomWidth*hData.scale - _tileWidth*maxScaleWithDefault/2;
				if(hTargetPosition < 0)
					hTargetPosition = 0;
				if(hTargetPosition + _tileWidth*maxScaleWithDefault > unscaledWidth)
					hTargetPosition = unscaledWidth - _tileWidth*maxScaleWithDefault;
					
				populateMajorAxisFor(_hItems.slice(hTargetIndex),0,unscaledWidth - hTargetPosition,hAxis);
				for (var i:int = hTargetIndex;i<_rowLength;i++)
					_hItems[i].x += hTargetPosition;
				if(hTargetIndex > 0)
				{
					populateMajorAxisFor(_hItems.slice(0,hTargetIndex),hTargetIndex,hTargetPosition - defaultSpacingWithDefault,hAxis);
					hData = _hItems[hTargetIndex - 1];
					var offset:Number = hTargetPosition - (hData.x + hData.eomWidth * hData.scale + defaultSpacingWithDefault);
					for(var i:int = 0;i<hTargetIndex;i++)
						_hItems[i].x += offset;
				}				

				var vTargetIndex:Number = Math.floor(targetIndex  / _rowLength);

				var vData:FisheyeItem = _vMouseItems[vTargetIndex];
				
				var vTargetPosition:Number = vData.y + vData.eomHeight*vData.scale - _tileHeight*maxScaleWithDefault/2;
				if(vTargetPosition < 0)
					vTargetPosition = 0;
				if(vTargetPosition + _tileHeight*maxScaleWithDefault > unscaledHeight)
					vTargetPosition = unscaledHeight - _tileHeight*maxScaleWithDefault;
					
				populateMajorAxisFor(_vItems.slice(vTargetIndex),0,unscaledHeight - vTargetPosition,vAxis);
				for (var i:int = vTargetIndex;i<_colLength;i++)
					_vItems[i].y += vTargetPosition;
				if(vTargetIndex > 0)
				{
					populateMajorAxisFor(_vItems.slice(0,vTargetIndex),vTargetIndex,vTargetPosition - defaultSpacingWithDefault,vAxis);
					vData = _vItems[vTargetIndex - 1];
					var offset:Number = vTargetPosition - (vData.y + vData.eomHeight * vData.scale + defaultSpacingWithDefault);
					for(var i:int = 0;i<vTargetIndex;i++)
						_vItems[i].y += offset;
				}				

			}
			
			var zoomMode:String = getStyle("zoomMode");
			var useScale:Boolean = !(zoomMode == "resize");
			
			for(var i:int=0;i<itemCount;i++)
			{
				var itemRenderer:UIComponent = renderers[i];
				var hData:FisheyeItem = _hItems[ i % _rowLength];
				var vData:FisheyeItem = _vItems[Math.floor(i / _rowLength)];

				var target:LayoutTarget = animator.targetFor(itemRenderer);
				
				if(useScale)
				{
				
					// now, compare the aspect ratio of the item, compared to the area alloted to it.
					var areaAR:Number = (hData.eomWidth * hData.scale) / (vData.eomHeight * vData.scale);
					var itemAR:Number = itemRenderer.getExplicitOrMeasuredWidth() / itemRenderer.getExplicitOrMeasuredHeight();
					
					
					if(itemAR/areaAR > 1)
					{
						// the item is more horizontal than the area.
						var scale:Number = hData.eomWidth * hData.scale / itemRenderer.getExplicitOrMeasuredWidth();
						target.scaleX = target.scaleY = scale;
						target.x = hData.x;
						target.y = vData.y + vData.eomWidth*vData.scale/2 - itemRenderer.getExplicitOrMeasuredHeight()*scale/2;
					}
					else
					{
						// the item is more vertical than the area.
						var scale:Number = vData.eomHeight * vData.scale / itemRenderer.getExplicitOrMeasuredHeight();
						if(isNaN(scale))
							scale = 0;
						target.scaleX = target.scaleY = scale;
						target.x = hData.x + hData.eomHeight*hData.scale/2 - itemRenderer.getExplicitOrMeasuredWidth()*scale/2;
						target.y = vData.y;
					}
					target.unscaledWidth = itemRenderer.getExplicitOrMeasuredWidth();
					target.unscaledHeight = itemRenderer.getExplicitOrMeasuredHeight();
				}
				else
				{

					target.x = hData.x;
					target.unscaledWidth = hData.eomWidth * hData.scale;
					target.y = vData.y;
					target.unscaledHeight = vData.eomHeight * vData.scale;
					target.scaleX = target.scaleY = 1;
				}
			}
		}


		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void
		{
			populateMajorAxisForDefault(_hMouseItems,hAxis,unscaledWidth);
			align(_hMouseItems,hAxis);			
			populateMajorAxisForDefault(_vMouseItems,vAxis,unscaledHeight);
			align(_vMouseItems,vAxis);			
			
			var leftItem:FisheyeItem = _hMouseItems[0];
			var rightItem:FisheyeItem = _hMouseItems[_hMouseItems.length - 1];
			var topItem:FisheyeItem = _vMouseItems[0];
			var bottomItem:FisheyeItem = _vMouseItems[_vMouseItems.length - 1];

			_mouseBounds.left = leftItem.x + leftItem.eomWidth*leftItem.scale/2 - leftItem.eomWidth/2;
			_mouseBounds.top = topItem.y + topItem.eomHeight*topItem.scale/2 - topItem.eomHeight/2;
			_mouseBounds.right = rightItem.x + rightItem.eomWidth*rightItem.scale/2 + rightItem.eomWidth/2;
			_mouseBounds.bottom = bottomItem.y + bottomItem.eomHeight*bottomItem.scale/2 + bottomItem.eomHeight/2;
			
			super.updateDisplayList(unscaledWidth,unscaledHeight);
		}

		override protected function findItemForPosition(xPos:Number,yPos:Number):Number
		{
			var hIndex:Number;
			var vIndex:Number;
			var minDist:Number = Infinity;

			if(dataProvider.length == 0)
				return NaN;
			
			if(_mouseBounds.contains(xPos,yPos) == false)
				return NaN;
				
			for(var i:int = 0; i < _hMouseItems.length; i++)
			{
				var item:FisheyeItem = _hMouseItems[i];
				var midPoint:Number = item.x + item.eomWidth * item.scale/2;
			
				var dist:Number = xPos - midPoint;
				if (Math.abs(dist) < Math.abs(minDist))				
				{
					minDist = dist;
					hIndex = i;
				}
				else
				{
					break;
				}				
			}
			if(isNaN(hIndex))
				return NaN;
			
			minDist = Infinity;
			
			for(var i:int = 0; i < _vMouseItems.length; i++)
			{
				var item:FisheyeItem = _vMouseItems[i];
				var midPoint:Number = item.y + item.eomHeight * item.scale/2;
			
				var dist:Number = yPos - midPoint;
				if (Math.abs(dist) < Math.abs(minDist))				
				{
					minDist = dist;
					vIndex = i;
				}
				else
				{
					break;
				}				
			}
			if(isNaN(vIndex))
				return NaN;
				
			return (vIndex)*_rowLength + hIndex;
		}
	}
}

