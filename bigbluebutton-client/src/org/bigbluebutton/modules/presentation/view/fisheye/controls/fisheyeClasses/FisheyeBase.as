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
package org.bigbluebutton.modules.presentation.view.fisheye.controls.fisheyeClasses
{
	import flash.display.DisplayObject;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	import mx.core.ClassFactory;
	import mx.core.IDataRenderer;
	import mx.core.IFactory;
	import mx.core.UIComponent;
	
	import org.bigbluebutton.modules.presentation.view.fisheye.controls.CachedLabel;
	import org.bigbluebutton.modules.presentation.view.fisheye.controls.LayoutAnimator;



	/** the horizontal alignment.  */
	[Style(name="horizontalAlign", type="String", enumeration="left,center,right,justified", inherit="no")]
	/** the vertical alignment */
	[Style(name="verticalAlign", type="String", enumeration="top,center,bottom,justified", inherit="no")]
	/** the amount of space, in pixels, between invidual items */
	[Style(name="defaultSpacing", type="Number", inherit="no")]
	/** the amount of space, in pixels, between invidual items when hilighted*/
	[Style(name="hilightSpacing", type="Number", inherit="no")]
	/** the property on the item renderer to assign to when the renderer' state changes */
	[Style(name="stateProperty", type="String", inherit="no")]
	/** the value to assign to 'stateProperty' on the renderer when the item is hilighted */
 	[Style(name="rolloverValue", type="String", inherit="no")]
	/** the value to assign to 'stateProperty' on the renderer when the item is selected */ 	
	[Style(name="selectedValue", type="String", inherit="no")]
	/** the value to assign to 'stateProperty' on the renderer when some other item is selected */ 	
	[Style(name="unselectedValue", type="String", inherit="no")]
	/** the value to assign to 'stateProperty' on the renderer when the item is in its default state */
	[Style(name="defaultValue", type="String", inherit="no")]
	/** the scale factor assigned to renderers when no item is hilighted or selected */
	[Style(name="defaultScale", type="Number", inherit="no")]
	/** the minimum scale factor assigned to renderers on screen. The actual scale factor assigned to
	 * an item will range between minScale and hilightMaxScale based on its distance from the hilighted or selected item */
	[Style(name="hilightMinScale", type="Number", inherit="no")]
	/** the maximum scale factor assigned to renderers on screen. The actual scale factor assigned to
	 * an item will range between minScale and hilightMaxScale based on its distance from the hilighted or selected item */
	[Style(name="hilightMaxScale", type="Number", inherit="no")]
	/** how quickly or slowly items scale down from the hilightMaxScale value to minScale value.  A value of 1 will scale linearly down from the hilighted item out to the item at scaleRadius.
	 * A value higher than wone will descend slowly from the hilight, then drop off quicker at the edge. A value lower than one will drop off quickly from the hilight Should be greater than 0*/
	[Style(name="hilightScaleSlope", type="Number", inherit="no")]
	/** The radius, in items, around the hilighted item that are affected by the hilight. A value of 1 means only the hilighted item will scale. A value of three means the hilighted item plus the two items
	 * to either side will scale up. How much each item scales is affected by the scaleSlope style.*/
	[Style(name="hilightScaleRadius", type="Number", inherit="no")]
	/** how quickly items animate to their target location when the layout of the renderers change.  A value of 1 will
	 * snap instantly to the new value, while a value of 0 will never change */
	[Style(name="animationSpeed", type="Number", inherit="no")]

	[Event("change")]
	
	[DefaultProperty("dataProvider")]
	public class FisheyeBase extends UIComponent
	{
		/** the data items driving the component
		 */
		private var _items:Array = [];
		/** when a new dataprovider is assigned, we keep it in reserve until we have a chance
		 * to generate new renderers for it.  This is the temporary holding pen for those new items
		 */
		private var _pendingItems:Array;
		protected var itemsChanged:Boolean = false;
		
		/** true if the renderers need to be regenerated */
		protected var renderersDirty:Boolean = true;

		/** the renderers representing the data items, one for each item */
		protected var renderers:Array = [];		


		/** the currently hilighted item
		 */
		protected var hilightedItemIndex:Number = NaN; 
		/** the currently selected item
		 */
		protected var selectedItemIndex:Number = NaN; 
		
		/** @private */
		private var _selectionEnabled:Boolean = true;
		
		/** the factory that generates item renderers
		 */
		private var _itemRendererFactory:IFactory;


		/** 
		 * the object that manages animating the children layout
		 */
		protected var animator:LayoutAnimator;
				
			
		/** Constructor */		
		public function FisheyeBase()
		{
			super();
			_itemRendererFactory= new ClassFactory(CachedLabel);
			
			addEventListener(MouseEvent.MOUSE_MOVE,updateHilight);
			addEventListener(MouseEvent.ROLL_OUT,removeHilight);
			addEventListener(MouseEvent.MOUSE_DOWN,updateSelection);
			
			var maskShape:Sprite = new Sprite();
			addChild(maskShape);
			mask = maskShape;			
			maskShape.graphics.beginFill(0);
			maskShape.graphics.drawRect(0,0,10,10);
			maskShape.graphics.endFill();
			
			animator = new LayoutAnimator();
			animator.layoutFunction = generateLayout;
		}
		
		
		//-----------------------------------------------------------------
		
		/** the data source
		 */
		public function set dataProvider(value:Array):void
		{
			_pendingItems= value;

			renderersDirty = true;
			itemsChanged = true;
			invalidateProperties();			
		}
		public function get dataProvider():Array
		{
			return _items;

		}
		
		//-----------------------------------------------------------------
		public function set selectionEnabled(value:Boolean):void
		{
			if(_selectionEnabled == value)
				return;
			_selectionEnabled = value;
			selectedIndex = selectedIndex;
		}
		public function get selectionEnabled():Boolean
		{
			return _selectionEnabled;
		}

	    [Bindable("change")]
		public function get selectedItem():Object
		{
			return (isNaN(selectedItemIndex)? null:_items[selectedItemIndex]);
		}
		public function set selectedItem(value:Object):void
		{
			var newIndex:Number;
			for(var i:int = 0;i<_items.length;i++)
			{
				if(value == _items[i])
				{
					newIndex = i;
					break;
				}
			}
			selectedIndex = newIndex;
		}
	    [Bindable("change")]
		public function get selectedIndex():int
		{
			return (isNaN(selectedItemIndex)? -1:selectedItemIndex);
		}
		public function set selectedIndex(value:int):void
		{
			var v:Number = (value < 0 || value >= _items.length)? NaN:value;

			if(v != selectedItemIndex)
			{
				selectedItemIndex = v;
				updateState();
				animator.invalidateLayout();
				dispatchEvent(new Event("change"));
			}
		}
		
		//-----------------------------------------------------------------
		
		/* These private get properties are wrappers around styles that return defaults if unset.
		*  It saves me from having to write a CSS selector, which 
		*  I really should do at some point */
		protected function get defaultSpacingWithDefault():Number
		{
			var result:Number= getStyle("defaultSpacing");
			if(isNaN(result))
				result = 0;
			return result;
		}
		
		

		protected function get maxScaleWithDefault():Number
		{
			var result:Number= getStyle("hilightMaxScale");

			if(isNaN(result))
				result = 1;

			return result;
		}
		
		//-----------------------------------------------------------------

		/**
		 * by making the itemRenderer be of type IFactory, 
		 * developers can define it inline using the <Component> tag
		 */
		public function get itemRenderer():IFactory
		{
			return _itemRendererFactory;
		}
		public function set itemRenderer(value:IFactory):void
		{
			_itemRendererFactory = value;
			renderersDirty = true;
			invalidateProperties();						
		}
		
		
		//-----------------------------------------------------------------

		
		override protected function commitProperties():void
		{
			// its now safe to switch over new dataProviders.
			if(_pendingItems != null)
			{
				_items = _pendingItems;
				_pendingItems = null;
			}
			
			itemsChanged = false;
			
			if(renderersDirty)
			{
				// something has forced us to reallocate our renderers. start by throwing out the old ones.
				renderersDirty = false;
				var mask:DisplayObject = mask;
				for(var i:int=numChildren-1;i>= 0;i--)
					removeChildAt(i);
				addChild(mask);
				
				renderers = [];

				// allocate new renderers, assign the data.
				for(var r:int = 0;r<_items.length;r++)
				{
					var renderer:UIComponent = _itemRendererFactory.newInstance();
					IDataRenderer(renderer).data = _items[r];
					renderers[r] = renderer;
					addChild(renderer);
				}
				animator.items = renderers;

			}
			invalidateSize();
		}
		
		private function removeHilight(e:MouseEvent):void
		{
			// called on rollout. Clear out any hilight, and reset our layout.
			hilightedItemIndex = NaN;
			updateState();
			animator.invalidateLayout();
		}

		
		/** finds the item that would be closest to the x/y position if it were hilighted
		 */
		protected function findItemForPosition(xPos:Number,yPos:Number):Number
		{
			return NaN;
		}
		
		/** called on mouse click to set or clear the selection */
		private function updateSelection(e:MouseEvent):void
		{
			if(_selectionEnabled == false)
				return;
				
			var newSelection:Number = findItemForPosition(this.mouseX,this.mouseY);
			if(selectedItemIndex == newSelection)
				selectedIndex = -1;
			else
				selectedIndex = newSelection;
			updateState();
			animator.invalidateLayout();
		}

		/** called on mouse move to update the hilight */
		private function updateHilight(e:MouseEvent):void
		{
			var newHilight:Number = findItemForPosition(this.mouseX,this.mouseY);
			if(newHilight == hilightedItemIndex)
				return;

			hilightedItemIndex = newHilight;
										
			updateState();
			animator.invalidateLayout();
		}
		
		/**
		 * update the state properties of all of the items, based on 
		 * the current hilighted and/or selected items
		 */
		private function updateState():void
		{
			var stateProperty:String = getStyle("stateProperty");
			if(stateProperty != null)
			{
				var rolloverState:String = getStyle("rolloverValue");
				var selectedState:String = getStyle("selectedValue");
				var unselectedValue:String = getStyle("unselectedValue");
				if (unselectedValue == null || (isNaN(selectedItemIndex) && isNaN(hilightedItemIndex)))
					unselectedValue = getStyle("defaultValue");
				
				for(var i:int=0;i<renderers.length;i++)
				{
					renderers[i][stateProperty] = (i == selectedItemIndex)? selectedState:
											(i==hilightedItemIndex)? rolloverState:											
											unselectedValue;
				}
			}
		}
		
		/**
		 * each item get scaled down based on its distance from the hliighted item.  this is the equation we use
		 * to figure out how much to scale down. The basic idea is this...we have two parameters that play a part
		 * in how quickly we scale down, scaleRadius and scaleSlope.  scaleRadius is the number of items on either
		 * side of the hilighted item (inclusive) that we should be able to use to scale down.  scaleSlope affects
		 * how whether we scale down quickly with the first few items in the radius, or the last few items.
		 * This equation essentially does that.
		 */
		private function calcDistanceFactor(params:FisheyeParameters, distance:Number):Number
		{
			var mult:Number = 1/params.scaleRadius;
			return Math.max(0,1 - Math.pow(distance*mult,params.scaleSlope));
		}


		/** 
		 * populates a set of items to fit into the distance axisLength, assuming nothing is hilighted, so they 
		 * all scale the same. It will attempt to scale them to match the defaultScale style */
		protected function populateMajorAxisForDefault(pdata:Array,axis:FisheyeAxis,axisLength:Number):FisheyeParameters
		{
			var vp:Number;
			var itemCount:int = pdata.length;
			
			var params:FisheyeParameters = new FisheyeParameters();
			populateParameters(params,false);

			var summedSpacing:Number = params.spacing*(itemCount-1);
			var sizeSum:Number = 0;
			var pdataInst:FisheyeItem;
			for(var i:int = 0;i<itemCount;i++)
				sizeSum += pdata[i][axis.EOM];

			if(sizeSum > 0)
			{
				var maximumMinScale:Number = (axisLength - summedSpacing) / sizeSum;
				params.minScale = Math.min(params.minScale,maximumMinScale);
			}
			
			vp = 0;
			for(var p:int=0;p<itemCount;p++)
			{
				pdataInst = pdata[p];
				pdataInst.scale = params.minScale;
				pdataInst[axis.pos] = vp;
				vp += pdataInst[axis.EOM] * params.minScale + params.spacing;
			}
			return params;
		}
		
		/**
		 * takes the parameters used in the fisheye equation, and adjusts them as best as possible to make sure the
		 * items can fit into distance 'axisScale.'  Right now it does this by scaling down the minScale parameter if necessary. That's 
		 * not entirely sufficient, but it does a pretty good job.  For future work:  If that's not sufficient, adjust the scaleRadius, scaleSlope,
		 * and spacing parameter
		 */
		private function adjustParameters(pdata:Array,targetIndex:Number,params:FisheyeParameters,axisSize:Number,axis:FisheyeAxis):void
		{
			var itemCount:int = pdata.length;
			var summedSpacing:Number = params.spacing*(itemCount-1);
			var maxSum:Number = 0;
			var minSum:Number = 0;

			// given the constraint:
			// W(0) * S(0) + spacing + W(1) * S(1) + spacing + ... + W(N) * S(N) <= unscaledWidth
			// here we adjust the numbers that go into the calculation of S(i) to fit.
			// right now that just means adjusting minScale downward if necessary. We'll probably add some more complex heuristic later.
			for(var i:int = 0;i<itemCount;i++)
			{
				var pdataInst:FisheyeItem = pdata[i];
				var distanceFromItem:Number = Math.abs(targetIndex - i);
				var distanceFactor:Number = calcDistanceFactor(params,distanceFromItem);
				var maxFactor:Number = params.maxScale * distanceFactor;
				var minFactor:Number = (1 - distanceFactor);
				var itemSize:Number = pdataInst[axis.EOM];
				maxSum += itemSize * maxFactor;
				minSum += itemSize * minFactor;
			}
			var minScale:Number = (minSum > 0)? ((axisSize - summedSpacing - maxSum) / minSum):0;


			// if we've got lots of extra space, we might calculate that we need to make our ends _larger_ to fill the space. We don't want
			// to do that. So let's contrain it to minScale. 
			minScale = Math.min(params.minScale,minScale);
						
			params.minScale = minScale;
			
		}

		/**
		 * populate a parameters structure from the various styles
		 */
		private function populateParameters(params:FisheyeParameters,hilighted:Boolean):void
		{
			if(hilighted == false)
			{
				params.minScale = getStyle("defaultScale");
				if(isNaN(params.minScale))
					params.minScale = .5;
				params.spacing = defaultSpacingWithDefault;
			}
			else
			{
				params.minScale = getStyle("hilightMinScale");
				if(isNaN(params.minScale))
				{
					params.minScale = getStyle("defaultScale");
					if(isNaN(params.minScale))
						params.minScale = .5;
				}
				params.spacing = getStyle("hilightSpacing");
					if(isNaN(params.spacing))
						params.spacing = defaultSpacingWithDefault;
			}

			params.maxScale  = getStyle("hilightMaxScale");
			if(isNaN(params.maxScale ))
				params.maxScale = 1;


			params.scaleRadius = getStyle("hilightScaleRadius");
			if(isNaN(params.scaleRadius))
				params.scaleRadius = 2;
			params.scaleRadius = Math.max(1,params.scaleRadius);

			params.scaleSlope = getStyle("hilightScaleSlope");
			if(isNaN(params.scaleSlope))
				params.scaleSlope = .75;

		}
		
		/** 
		 * populates a set of items to fit into the distance axisLength, assuming targetIndex is hilighted.
		*/
		protected function populateMajorAxisFor(pdata:Array,targetIndex:Number,axisSize:Number,axis:FisheyeAxis):FisheyeParameters
		{
			var vp:Number;
			var itemCount:int = pdata.length;

			var pdataInst:FisheyeItem;
		
			var params:FisheyeParameters = new FisheyeParameters();
			populateParameters(params,true);			
			adjustParameters(pdata,targetIndex,params,axisSize,axis);	

			vp = 0;

			for(var i:int=0;i<itemCount;i++)
			{
				pdataInst = pdata[i];
				var distanceFromItem:Number = Math.abs(targetIndex - i);
				
				var distanceFactor:Number = calcDistanceFactor(params,distanceFromItem);
				var scale:Number = Math.max(0,params.minScale + (params.maxScale - params.minScale)*(distanceFactor));
													
				pdataInst[axis.pos] = vp;
				pdataInst.scale = scale;					   					

				vp += pdataInst[axis.EOM] * scale + params.spacing;
			}
			return params;
		}
		
		/**
		 * given a set of scaled and laid out items, adjust them forward or backward to match the align property 
		 */
		protected function align(pdata:Array,axis:FisheyeAxis):void
		{
			var majorAlignValue:String = getStyle(axis.align);
			var itemCount:int = pdata.length;
			var pdataInst:FisheyeItem;
			var offset:Number;
			
			if(itemCount == 0)
				return;
				
			switch(majorAlignValue)
			{
				case "right":
				case "bottom":
					pdataInst = pdata[itemCount-1];
					offset = this[axis.unscaled] - (pdataInst[axis.pos] + pdata[itemCount-1][axis.EOM] * pdataInst.scale);
					for(var i:int = 0;i<itemCount;i++)
					{
						pdata[i][axis.pos] += offset;
					}
					break;
				case "left":
				case "top":
					break;
				case "center":					
				default:			
					var midIndex:int = Math.floor(itemCount/2);
	
					pdataInst = pdata[itemCount-1];
					var rightPos:Number = pdataInst[axis.pos] + pdataInst[axis.EOM]*pdataInst.scale;
					offset = (this[axis.unscaled]/2 - (rightPos)/2);
					for(var g:int = 0;g<itemCount;g++)
					{
						pdata[g][axis.pos] += offset;
					}
					break;
			}
		}

		/**
		 * overridden in the subclasses
		 */
		protected function generateLayout():void
		{
		}
		
		

		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void
		{
			graphics.clear();
			graphics.moveTo(0,0);
			graphics.beginFill(0,0);
			graphics.drawRect(0,0,unscaledWidth,unscaledHeight);
			
			
			// update the mask
			mask.width = unscaledWidth;
			mask.height = unscaledHeight;
			animator.invalidateLayout();			
		}

		override public function styleChanged(styleProp:String):void
		{
			if(styleProp == "animationSpeed")
				animator.animationSpeed = getStyle("animationSpeed");
			invalidateSize();
			invalidateDisplayList();
			animator.invalidateLayout();
		}
	}
}
