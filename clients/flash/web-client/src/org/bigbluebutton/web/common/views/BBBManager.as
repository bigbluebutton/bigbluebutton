/*
 * Copyright (c) 2007 FlexLib Contributors.  See:
 * http://code.google.com/p/flexlib/wiki/ProjectContributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package org.bigbluebutton.web.common.views {
	import flash.events.ContextMenuEvent;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.ui.ContextMenu;
	import flash.ui.ContextMenuItem;
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	import mx.core.EventPriority;
	import mx.core.IVisualElement;
	import mx.effects.CompositeEffect;
	import mx.effects.Effect;
	import mx.effects.effectClasses.CompositeEffectInstance;
	import mx.events.EffectEvent;
	import mx.events.ResizeEvent;
	import mx.utils.ArrayUtil;
	
	import org.bigbluebutton.web.common.effects.BBBEffectsDescriptorBase;
	import org.bigbluebutton.web.common.effects.BBBGroupEffectItem;
	import org.bigbluebutton.web.common.effects.IBBBEffectsDescriptorBase;
	import org.bigbluebutton.web.common.events.BBBEffectEvent;
	import org.bigbluebutton.web.common.events.BBBManagerEvent;
	import org.bigbluebutton.web.common.events.BBBWindowEvent;
	
	/**
	 * Class responsible for applying effects and default behaviors to BBBWindow instances such as
	 * tiling, cascading, minimizing, maximizing, etc.
	 */
	public class BBBManager extends EventDispatcher {
		/**
		 * Temporary storage location for use in dispatching BBBEffectEvents.
		 *
		 * @private
		 */
		private var mgrEventCollection:ArrayCollection = new ArrayCollection();
		
		private var windowToManagerEventMap:Dictionary;
		
		private var tiledWindows:ArrayCollection;
		
		public var tileMinimize:Boolean = true;
		
		public var tileMinimizeWidth:int = 200;
		
		public var showMinimizedTiles:Boolean = false;
		
		public var snapDistance:Number = 0;
		
		public var tilePadding:Number = 8;
		
		public var minTilePadding:Number = 5;
		
		public var enforceBoundaries:Boolean = true;
		
		public var effects:IBBBEffectsDescriptorBase = new BBBEffectsDescriptorBase();
		
		public static const CONTEXT_MENU_LABEL_TILE:String = "Tile";
		
		public static const CONTEXT_MENU_LABEL_TILE_FILL:String = "Tile + Fill";
		
		public static const CONTEXT_MENU_LABEL_SHOW_ALL:String = "Show All Windows";
		
		/**
		 *   Constructor()
		 */
		public function BBBManager(container:BBBCanvas, effects:IBBBEffectsDescriptorBase = null):void {
			this.container = container;
			if (effects != null) {
				this.effects = effects;
			}
			if (tileMinimize) {
				tiledWindows = new ArrayCollection();
			}
			this.container.addEventListener(ResizeEvent.RESIZE, containerResizeHandler);
			
			// map of window events to corresponding manager events
			windowToManagerEventMap = new Dictionary();
			windowToManagerEventMap[BBBWindowEvent.MINIMIZE] = BBBManagerEvent.WINDOW_MINIMIZE;
			windowToManagerEventMap[BBBWindowEvent.RESTORE] = BBBManagerEvent.WINDOW_RESTORE;
			windowToManagerEventMap[BBBWindowEvent.MAXIMIZE] = BBBManagerEvent.WINDOW_MAXIMIZE;
			windowToManagerEventMap[BBBWindowEvent.CLOSE] = BBBManagerEvent.WINDOW_CLOSE;
			windowToManagerEventMap[BBBWindowEvent.FOCUS_START] = BBBManagerEvent.WINDOW_FOCUS_START;
			windowToManagerEventMap[BBBWindowEvent.FOCUS_END] = BBBManagerEvent.WINDOW_FOCUS_END;
			windowToManagerEventMap[BBBWindowEvent.DRAG_START] = BBBManagerEvent.WINDOW_DRAG_START;
			windowToManagerEventMap[BBBWindowEvent.DRAG] = BBBManagerEvent.WINDOW_DRAG;
			windowToManagerEventMap[BBBWindowEvent.DRAG_END] = BBBManagerEvent.WINDOW_DRAG_END;
			windowToManagerEventMap[BBBWindowEvent.RESIZE_START] = BBBManagerEvent.WINDOW_RESIZE_START;
			windowToManagerEventMap[BBBWindowEvent.RESIZE] = BBBManagerEvent.WINDOW_RESIZE;
			windowToManagerEventMap[BBBWindowEvent.RESIZE_END] = BBBManagerEvent.WINDOW_RESIZE_END;
			
			// these handlers execute default behaviors, these events are dispatched by this class
			addEventListener(BBBManagerEvent.WINDOW_ADD, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			addEventListener(BBBManagerEvent.WINDOW_MINIMIZE, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			addEventListener(BBBManagerEvent.WINDOW_RESTORE, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			addEventListener(BBBManagerEvent.WINDOW_MAXIMIZE, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			addEventListener(BBBManagerEvent.WINDOW_CLOSE, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			
			addEventListener(BBBManagerEvent.WINDOW_FOCUS_START, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			addEventListener(BBBManagerEvent.WINDOW_FOCUS_END, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			addEventListener(BBBManagerEvent.WINDOW_DRAG_START, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			addEventListener(BBBManagerEvent.WINDOW_DRAG, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			addEventListener(BBBManagerEvent.WINDOW_DRAG_END, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			addEventListener(BBBManagerEvent.WINDOW_RESIZE_START, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			addEventListener(BBBManagerEvent.WINDOW_RESIZE, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
			addEventListener(BBBManagerEvent.WINDOW_RESIZE_END, executeDefaultBehavior, false, EventPriority.DEFAULT_HANDLER);
		}
		
		private var _container:BBBCanvas;
		
		public function get container():BBBCanvas {
			return _container;
		}
		
		public function set container(value:BBBCanvas):void {
			this._container = value;
		}
		
		
		/**
		 *  @private
		 *  the managed window stack
		 */
		[Bindable]
		public var windowList:Array = new Array();
		
		public function add(window:BBBWindow):void {
			if (windowList.indexOf(window) < 0) {
				window.windowManager = this;
				
				this.addListeners(window);
				
				this.windowList.push(window);
				
				this.addContextMenu(window);
				
				// to accomodate mxml impl
				if (window.parent == null) {
					this.container.addElement(window);
					this.position(window);
				}
				
				dispatchEvent(new BBBManagerEvent(BBBManagerEvent.WINDOW_ADD, window, this));
				bringToFront(window);
			}
		}
		
		/**
		 *  Positions a window on the screen
		 *
		 * 	<p>This is primarly used as the default space on the screen to position the window.</p>
		 *
		 *  @param window:BBBWindow Window to position
		 */
		public function position(window:BBBWindow):void {
			window.x = this.windowList.length * 30;
			window.y = this.windowList.length * 30;
			
			if ((window.x + window.width) > container.width)
				window.x = 40;
			if ((window.y + window.height) > container.height)
				window.y = 40;
		}
		
		public function addContextMenu(window:BBBWindow, contextMenu:ContextMenu = null):void {
			// add default context menu
			if (contextMenu == null) {
				var defaultContextMenu:ContextMenu = new ContextMenu();
				defaultContextMenu.hideBuiltInItems();
				
				var arrangeItem:ContextMenuItem = new ContextMenuItem(CONTEXT_MENU_LABEL_TILE);
				arrangeItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemSelectHandler);
				defaultContextMenu.customItems.push(arrangeItem);
				
				var arrangeFillItem:ContextMenuItem = new ContextMenuItem(CONTEXT_MENU_LABEL_TILE_FILL);
				arrangeFillItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemSelectHandler);
				defaultContextMenu.customItems.push(arrangeFillItem);
				
				var showAllItem:ContextMenuItem = new ContextMenuItem(CONTEXT_MENU_LABEL_SHOW_ALL);
				showAllItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemSelectHandler);
				defaultContextMenu.customItems.push(showAllItem);
				
				this.container.contextMenu = defaultContextMenu;
			} else {
				// add passed in context menu
				window.contextMenu = contextMenu;
			}
		}
		
		private function menuItemSelectHandler(event:ContextMenuEvent):void {
			var win:BBBWindow = event.contextMenuOwner as BBBWindow;
			switch (event.target.caption) {
				case (CONTEXT_MENU_LABEL_TILE):
					this.tile(false, this.tilePadding);
					break;
				
				case (CONTEXT_MENU_LABEL_TILE_FILL):
					this.tile(true, this.tilePadding);
					break;
				
				case (CONTEXT_MENU_LABEL_SHOW_ALL):
					this.showAllWindows();
					break;
			}
		}
		
		private function windowEventProxy(event:Event):void {
			if (event is BBBWindowEvent && !event.isDefaultPrevented()) {
				var winEvent:BBBWindowEvent = event as BBBWindowEvent;
				var mgrEvent:BBBManagerEvent = new BBBManagerEvent(windowToManagerEventMap[winEvent.type], winEvent.window, this, null, null, winEvent.resizeHandle);
				
				switch (winEvent.type) {
					case BBBWindowEvent.MINIMIZE:
						
						mgrEvent.window.saveStyle();
						
						var maxTiles:int = Math.floor(this.container.width / (this.tileMinimizeWidth + this.tilePadding));
						var xPos:Number = getLeftOffsetPosition(this.tiledWindows.length, maxTiles, this.tileMinimizeWidth, this.minTilePadding);
						var yPos:Number = this.container.height - getBottomTilePosition(this.tiledWindows.length, maxTiles, mgrEvent.window.minimizeHeight, this.minTilePadding);
						var minimizePoint:Point = new Point(xPos, yPos);
						
						mgrEvent.effect = this.effects.getWindowMinimizeEffect(mgrEvent.window, this, minimizePoint);
						break;
					
					case BBBWindowEvent.RESTORE:
						mgrEvent.window.restoreStyle();
						mgrEvent.effect = this.effects.getWindowRestoreEffect(winEvent.window, this, winEvent.window.savedWindowRect);
						break;
					
					case BBBWindowEvent.MAXIMIZE:
						mgrEvent.window.restoreStyle();
						mgrEvent.effect = this.effects.getWindowMaximizeEffect(winEvent.window, this);
						break;
					
					case BBBWindowEvent.CLOSE:
						mgrEvent.effect = this.effects.getWindowCloseEffect(mgrEvent.window, this);
						break;
					
					case BBBWindowEvent.FOCUS_START:
						mgrEvent.effect = this.effects.getWindowFocusStartEffect(winEvent.window, this);
						break;
					
					case BBBWindowEvent.FOCUS_END:
						mgrEvent.effect = this.effects.getWindowFocusEndEffect(winEvent.window, this);
						break;
					
					case BBBWindowEvent.DRAG_START:
						mgrEvent.effect = this.effects.getWindowDragStartEffect(winEvent.window, this);
						break;
					
					case BBBWindowEvent.DRAG:
						mgrEvent.effect = this.effects.getWindowDragEffect(winEvent.window, this);
						break;
					
					case BBBWindowEvent.DRAG_END:
						mgrEvent.effect = this.effects.getWindowDragEndEffect(winEvent.window, this);
						break;
					
					case BBBWindowEvent.RESIZE_START:
						mgrEvent.effect = this.effects.getWindowResizeStartEffect(winEvent.window, this);
						break;
					
					case BBBWindowEvent.RESIZE:
						mgrEvent.effect = this.effects.getWindowResizeEffect(winEvent.window, this);
						break;
					
					case BBBWindowEvent.RESIZE_END:
						mgrEvent.effect = this.effects.getWindowResizeEndEffect(winEvent.window, this);
						break;
				}
				
				dispatchEvent(mgrEvent);
			}
		}
		
		public function executeDefaultBehavior(event:Event):void {
			if (event is BBBManagerEvent && !event.isDefaultPrevented()) {
				var mgrEvent:BBBManagerEvent = event as BBBManagerEvent;
				
				switch (mgrEvent.type) {
					case BBBManagerEvent.WINDOW_ADD:
						// get the effect here because this doesn't pass thru windowEventProxy()
						mgrEvent.effect = this.effects.getWindowAddEffect(mgrEvent.window, this);
						break;
					
					case BBBManagerEvent.WINDOW_MINIMIZE:
						mgrEvent.effect.addEventListener(EffectEvent.EFFECT_END, onMinimizeEffectEnd);
						break;
					
					case BBBManagerEvent.WINDOW_RESTORE:
						removeTileInstance(mgrEvent.window);
						break;
					
					case BBBManagerEvent.WINDOW_MAXIMIZE:
						removeTileInstance(mgrEvent.window);
						mgrEvent.effect = getMaximizeWindowEffect(mgrEvent.window);
						break;
					
					case BBBManagerEvent.WINDOW_CLOSE:
						removeTileInstance(mgrEvent.window);
						mgrEvent.effect.addEventListener(EffectEvent.EFFECT_END, onCloseEffectEnd);
						break;
					
					case BBBManagerEvent.WINDOW_FOCUS_START:
						mgrEvent.window.hasFocus = true;
						mgrEvent.window.validateNow();
						container.setElementIndex(mgrEvent.window, container.numElements - 1);
						break;
					
					case BBBManagerEvent.WINDOW_FOCUS_END:
						mgrEvent.window.hasFocus = false;
						mgrEvent.window.validateNow();
						break;
					
					case BBBManagerEvent.WINDOW_DRAG:
					case BBBManagerEvent.WINDOW_RESIZE:
						if (snapDistance > 1)
							snapWindow(mgrEvent.window, mgrEvent.resizeHandle);
						break;
					
					// no, nothing happens in these cases. but it might someday.
					case BBBManagerEvent.WINDOW_DRAG_START:
					case BBBManagerEvent.WINDOW_DRAG_END:
					case BBBManagerEvent.WINDOW_RESIZE_START:
					case BBBManagerEvent.WINDOW_RESIZE_END:
						break;
					
				}
				
				// Play effect only if it is necessary
				if (mgrEvent.effect is CompositeEffect || (mgrEvent.effect.targets && mgrEvent.effect.targets.length)) {
					// add this event to collection for lookup in the effect handler
					mgrEventCollection.addItem(mgrEvent);
					
					// listen for start and end of effect
					mgrEvent.effect.addEventListener(EffectEvent.EFFECT_START, onMgrEffectEvent)
					mgrEvent.effect.addEventListener(EffectEvent.EFFECT_END, onMgrEffectEvent);
					
					mgrEvent.effect.play();
				}
			}
		}
		
		/**
		 * Handler for start and end events of all effects initiated by BBBManager.
		 *
		 * @param event
		 */
		private function onMgrEffectEvent(event:EffectEvent):void {
			// iterate over stored events
			for each (var mgrEvent:BBBManagerEvent in mgrEventCollection) {
				// is this the manager event that corresponds to this effect?
				if (mgrEvent.effect == event.effectInstance.effect) {
					// for group events (tile) event.window is null
					// and we have to dig in a bit to get the window list
					var windows:Array = new Array();
					if (mgrEvent.window) {
						windows.push(mgrEvent.window);
					} else {
						for each (var group:BBBGroupEffectItem in mgrEvent.effectItems) {
							windows.push(group.window);
						}
					}
					// create and dispatch event
					dispatchEvent(new BBBEffectEvent(event.type, mgrEvent.type, windows));
					
					// if the effect is over remove the manager event from collection
					if (event.type == EffectEvent.EFFECT_END) {
						mgrEventCollection.removeItemAt(mgrEventCollection.getItemIndex(mgrEvent));
					}
					return;
				}
			}
		}
		
		private function onMinimizeEffectEnd(event:EffectEvent):void {
			// if this was a composite effect (almost definitely is), we make sure a target was defined on it
			// since that is optional, we look in its first child if we don't find one
			var targetWindow:BBBWindow = event.effectInstance.target as BBBWindow;
			
			if (targetWindow == null && event.effectInstance is CompositeEffectInstance) {
				var compEffect:CompositeEffect = event.effectInstance.effect as CompositeEffect;
				targetWindow = Effect(compEffect.children[0]).target as BBBWindow;
			}
			
			tiledWindows.addItem(targetWindow);
			reTileWindows();
		}
		
		private function onCloseEffectEnd(event:EffectEvent):void {
			remove(event.effectInstance.target as BBBWindow);
		}
		
		
		/**
		 * Handles resizing of container to reposition elements
		 *
		 *  @param event The ResizeEvent object from event dispatch
		 *
		 * */
		private function containerResizeHandler(event:ResizeEvent):void {
			//repositions any minimized tiled windows to bottom left in their rows
			reTileWindows();
		}
		
		
		/**
		 * Gets the left placement of a tiled window
		 *
		 *  @param tileIndex The index value of the current tile instance we're placing
		 *
		 *  @param maxTiles The maximum number of tiles that can be placed horizontally across the container given the minimimum width of each tile
		 *
		 *  @param minWinWidth The width of the window tile when minimized
		 *
		 *  @param padding The padding accordance to place between minimized tile window instances
		 *
		 * */
		private function getLeftOffsetPosition(tileIndex:int, maxTiles:int, minWinWidth:Number, padding:Number):Number {
			var tileModPos:int = tileIndex % maxTiles;
			if (tileModPos == 0)
				return padding;
			else
				return (tileModPos * minWinWidth) + ((tileModPos + 1) * padding);
		}
		
		
		/**
		 * Gets the bottom placement of a tiled window
		 *
		 *  @param maxTiles The maximum number of tiles that can be placed horizontally across the container given the minimimum width of each tile
		 *
		 *  @param minWinHeight The height of the window tile instance when minimized -- probably the height of the titleBar instance of the Panel
		 *
		 * 	@param padding The padding accordance to place between minimized tile window instances
		 *
		 * */
		private function getBottomTilePosition(tileIndex:int, maxTiles:int, minWindowHeight:Number, padding:Number):Number {
			var numRows:int = Math.floor(tileIndex / maxTiles);
			if (numRows == 0)
				return minWindowHeight + padding;
			else
				return ((numRows + 1) * minWindowHeight) + ((numRows + 1) * padding);
		}
		
		
		/**
		 * Gets the height accordance for tiled windows along bottom to be used in the maximizing of other windows -- leaves space at bottom of maximize height so tiled windows still show
		 *
		 *  @param maxTiles The maximum number of tiles that can be placed horizontally across the container given the minimimum width of each tile
		 *
		 *  @param minWinHeight The height of the window tile instance when minimized -- probably the height of the titleBar instance of the Panel
		 *
		 * 	@param padding The padding accordance to place between minimized tile window instances
		 *
		 * */
		private function getBottomOffsetHeight(maxTiles:int, minWindowHeight:Number, padding:Number):Number {
			var numRows:int = Math.ceil(this.tiledWindows.length / maxTiles);
			//if we have some rows get their combined heights... if not, return 0 so maximized window takes up full height of container
			if (this.tiledWindows.length != 0)
				return ((numRows) * minWindowHeight) + ((numRows + 1) * padding);
			else
				return 0;
		}
		
		/**
		 * Retiles the remaining minimized tile instances if one of them gets restored or maximized
		 *
		 * */
		private function reTileWindows():void {
			var maxTiles:int = Math.floor(this.container.width / (this.tileMinimizeWidth + this.tilePadding));
			
			//we've just removed/added a row from the tiles, so we tell any maximized windows to change their height
			
			if (this.tiledWindows.length % maxTiles == 0 || (this.tiledWindows.length - 1) % maxTiles == 0) {
				var openWins:Array = getOpenWindowList();
				for (var winIndex:int = 0; winIndex < openWins.length; winIndex++) {
					if (BBBWindow(openWins[winIndex]).maximized)
						getMaximizeWindowEffect(BBBWindow(openWins[winIndex])).play();
				}
			}
			
			for (var i:int = 0; i < tiledWindows.length; i++) {
				var currentWindow:BBBWindow = tiledWindows.getItemAt(i) as BBBWindow;
				var xPos:Number = getLeftOffsetPosition(i, maxTiles, this.tileMinimizeWidth, this.minTilePadding);
				var yPos:Number = this.container.height - getBottomTilePosition(i, maxTiles, currentWindow.minimizeHeight, this.minTilePadding);
				var movePoint:Point = new Point(xPos, yPos);
				this.effects.reTileMinWindowsEffect(currentWindow, this, movePoint).play();
			}
		}
		
		/**
		 * Maximizing of Window
		 *
		 * @param window BBBWindowinstance to maximize
		 *
		 **/
		private function getMaximizeWindowEffect(window:BBBWindow):Effect {
			var maxTiles:int = this.container.width / this.tileMinimizeWidth;
			if (showMinimizedTiles) {
				return this.effects.getWindowMaximizeEffect(window, this, getBottomOffsetHeight(maxTiles, window.minimizeHeight, this.minTilePadding));
			} else {
				return this.effects.getWindowMaximizeEffect(window, this);
			}
		}
		
		/**
		 * Removes the closed window from the ArrayCollection of tiled windows
		 *
		 *  @param event BBBWindowEvent instance containing even type and window instance that is being handled
		 *
		 * */
		private function removeTileInstance(window:BBBWindow):void {
			for (var i:int = 0; i < tiledWindows.length; i++) {
				if (tiledWindows.getItemAt(i) == window) {
					this.tiledWindows.removeItemAt(i);
					reTileWindows();
				}
			}
		}
		
		
		/**
		 * By default, executes on BBBManagerEvent.WINDOW_DRAG and BBBManagerEvent.WINDOW_RESIZE events.
		 * Check to see if the target window is within snapping distance of any other windows.
		 * Execute the snap that requires the least movement.
		 */
		private function snapWindow(dragWindow:BBBWindow, dragHandle:String):void {
			var xDist:Number = NaN;
			var yDist:Number = NaN;
			var dragRect:Rectangle = getPaddedBounds(dragWindow);
			
			// find the minimum snap (if one exists)
			for each (var window:BBBWindow in windowList) {
				if (window != dragWindow && dragRect.intersects(getPaddedBounds(window))) {
					if (!dragHandle || BBBResizeHandle.isLeft(dragHandle)) {
						xDist = calculateSnapDistance(dragWindow.x, window.x + window.width + tilePadding, xDist);
						xDist = calculateSnapDistance(dragWindow.x, window.x, xDist);
					}
					
					if (!dragHandle || BBBResizeHandle.isRight(dragHandle)) {
						xDist = calculateSnapDistance(dragWindow.x + dragWindow.width, window.x - tilePadding, xDist);
						xDist = calculateSnapDistance(dragWindow.x + dragWindow.width, window.x + window.width, xDist);
					}
					
					if (!dragHandle || BBBResizeHandle.isTop(dragHandle)) {
						yDist = calculateSnapDistance(dragWindow.y, window.y + window.height + tilePadding, yDist);
						yDist = calculateSnapDistance(dragWindow.y, window.y, yDist);
					}
					
					if (!dragHandle || BBBResizeHandle.isBottom(dragHandle)) {
						yDist = calculateSnapDistance(dragWindow.y + dragWindow.height, window.y - tilePadding, yDist);
						yDist = calculateSnapDistance(dragWindow.y + dragWindow.height, window.y + window.height, yDist);
					}
				}
			}
			
			var xChanged:Boolean = !isNaN(xDist);
			var yChanged:Boolean = !isNaN(yDist);
			
			// update the x, y, width, height based on the user interaction
			// dragHandle contains either a BBBResizeHandle value, or null if the window is being dragged
			switch (dragHandle) {
				case BBBResizeHandle.LEFT:
					if (xChanged) {
						dragWindow.x -= xDist;
						dragWindow.width += xDist;
					}
					break;
				
				case BBBResizeHandle.RIGHT:
					if (xChanged)
						dragWindow.width -= xDist;
					break;
				
				case BBBResizeHandle.TOP:
					if (yChanged) {
						dragWindow.y -= yDist;
						dragWindow.height += yDist;
					}
					break;
				
				case BBBResizeHandle.BOTTOM:
					if (yChanged)
						dragWindow.height -= yDist;
					break;
				
				case BBBResizeHandle.TOP_LEFT:
					if (xChanged) {
						dragWindow.x -= xDist;
						dragWindow.width += xDist;
					}
					if (yChanged) {
						dragWindow.y -= yDist;
						dragWindow.height += yDist;
					}
					break;
				
				case BBBResizeHandle.TOP_RIGHT:
					if (xChanged)
						dragWindow.width -= xDist;
					if (yChanged) {
						dragWindow.y -= yDist;
						dragWindow.height += yDist;
					}
					break;
				
				case BBBResizeHandle.BOTTOM_LEFT:
					if (xChanged) {
						dragWindow.x -= xDist;
						dragWindow.width += xDist;
					}
					if (yChanged)
						dragWindow.height -= yDist;
					break;
				
				case BBBResizeHandle.BOTTOM_RIGHT:
					if (yChanged)
						dragWindow.height -= yDist;
					if (xChanged)
						dragWindow.width -= xDist;
					break;
				
				default:
					if (xChanged)
						dragWindow.x -= xDist;
					if (yChanged)
						dragWindow.y -= yDist;
					break;
			}
		}
		
		
		/**
		 * @return a Rectangle which represents the windows bounds
		 * 	with a buffer around the edge for the snapDistance
		 */
		private function getPaddedBounds(window:BBBWindow):Rectangle {
			return new Rectangle(window.x - tilePadding - snapDistance / 2, window.y - tilePadding - snapDistance / 2, window.width + tilePadding + snapDistance, window.height + tilePadding + snapDistance);
		}
		
		
		/**
		 * Determine whether these two edges are closer together than the currentShift.
		 * If so then update the currentShift to the distance between them.
		 * @return the updated currentShift
		 */
		private function calculateSnapDistance(edge1:Number, edge2:Number, currentShift:Number):Number {
			var gap:Number = edge1 - edge2;
			
			// if we're within snapping range
			if (gap > -snapDistance && gap < snapDistance) {
				// if this snap is shorter than the currentShift
				if (isNaN(currentShift) || Math.abs(gap) < Math.abs(currentShift))
					currentShift = gap;
			}
			
			return currentShift;
		}
		
		
		public function addCenter(window:BBBWindow):void {
			this.add(window);
			this.center(window);
		}
		
		
		/**
		 * Brings a window to the front of the screen.
		 *
		 *  @param win Window to bring to front
		 * */
		public function bringToFront(window:BBBWindow):void {
			for each (var win:BBBWindow in windowList) {
				if (win != window && win.hasFocus) {
					win.dispatchEvent(new BBBWindowEvent(BBBWindowEvent.FOCUS_END, win));
				}
				if (win == window && !window.hasFocus) {
					win.dispatchEvent(new BBBWindowEvent(BBBWindowEvent.FOCUS_START, win));
				}
			}
		}
		
		
		/**
		 * Positions a window in the center of the available screen.
		 *
		 *  @param window:BBBWindow to center
		 * */
		public function center(window:BBBWindow):void {
			window.x = this.container.width / 2 - window.width;
			window.y = this.container.height / 2 - window.height;
		}
		
		/**
		 * Removes all windows from managed window stack;
		 * */
		public function removeAll():void {
			
			for each (var window:BBBWindow in windowList) {
				container.removeElement(window);
				
				this.removeListeners(window);
			}
			
			this.windowList = new Array();
		}
		
		/**
		 *  @private
		 *
		 *  Adds listeners
		 *  @param window:BBBWindow
		 */
		
		private function addListeners(window:BBBWindow):void {
			window.addEventListener(BBBWindowEvent.MINIMIZE, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
			window.addEventListener(BBBWindowEvent.RESTORE, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
			window.addEventListener(BBBWindowEvent.MAXIMIZE, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
			window.addEventListener(BBBWindowEvent.CLOSE, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
			
			window.addEventListener(BBBWindowEvent.FOCUS_START, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
			window.addEventListener(BBBWindowEvent.FOCUS_END, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
			window.addEventListener(BBBWindowEvent.DRAG_START, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
			window.addEventListener(BBBWindowEvent.DRAG, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
			window.addEventListener(BBBWindowEvent.DRAG_END, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
			window.addEventListener(BBBWindowEvent.RESIZE_START, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
			window.addEventListener(BBBWindowEvent.RESIZE, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
			window.addEventListener(BBBWindowEvent.RESIZE_END, windowEventProxy, false, EventPriority.DEFAULT_HANDLER);
		}
		
		
		/**
		 *  @private
		 *
		 *  Removes listeners
		 *  @param window:BBBWindow
		 */
		private function removeListeners(window:BBBWindow):void {
			window.removeEventListener(BBBWindowEvent.MINIMIZE, windowEventProxy);
			window.removeEventListener(BBBWindowEvent.RESTORE, windowEventProxy);
			window.removeEventListener(BBBWindowEvent.MAXIMIZE, windowEventProxy);
			window.removeEventListener(BBBWindowEvent.CLOSE, windowEventProxy);
			
			window.removeEventListener(BBBWindowEvent.FOCUS_START, windowEventProxy);
			window.removeEventListener(BBBWindowEvent.FOCUS_END, windowEventProxy);
			window.removeEventListener(BBBWindowEvent.DRAG_START, windowEventProxy);
			window.removeEventListener(BBBWindowEvent.DRAG, windowEventProxy);
			window.removeEventListener(BBBWindowEvent.DRAG_END, windowEventProxy);
			window.removeEventListener(BBBWindowEvent.RESIZE_START, windowEventProxy);
			window.removeEventListener(BBBWindowEvent.RESIZE, windowEventProxy);
			window.removeEventListener(BBBWindowEvent.RESIZE_END, windowEventProxy);
		}
		
		
		
		
		/**
		 *  Removes a window instance from the managed window stack
		 *  @param window:BBBWindow Window to remove
		 */
		public function remove(window:BBBWindow):void {
			
			var index:int = ArrayUtil.getItemIndex(window, this.windowList);
			
			windowList.splice(index, 1);
			
			container.removeElement(window);
			
			removeListeners(window);
			
			// set focus to newly-highest depth window
			for (var i:int = container.numElements - 1; i > -1; i--) {
				var dObj:IVisualElement = container.getElementAt(i);
				if (dObj is BBBWindow) {
					bringToFront(BBBWindow(dObj));
					return;
				}
			}
		}
		
		/**
		 * Pushes an existing window onto the managed window stack.
		 *
		 *  @param win Window:BBBWindow to push onto managed windows stack
		 * */
		public function manage(window:BBBWindow):void {
			if (window != null && windowList.indexOf(window) < 0) {
				windowList.push(window);
			}
		}
		
		/**
		 *  Positions a window in an absolute position
		 *
		 *  @param win:BBBWindow Window to position
		 *
		 *  @param x:int The x position of the window
		 *
		 *  @param y:int The y position of the window
		 */
		public function absPos(window:BBBWindow, x:int, y:int):void {
			window.x = x;
			window.y = y;
		}
		
		/**
		 * Gets a list of open windows for scenarios when only open windows need to be managed
		 *
		 * @return Array
		 */
		public function getOpenWindowList():Array {
			var array:Array = [];
			for (var i:int = 0; i < windowList.length; i++) {
				if (!BBBWindow(windowList[i]).minimized) {
					array.push(windowList[i]);
				}
			}
			return array;
		}
		
		/**
		 *  Tiles the window across the screen
		 *
		 *  <p>By default, windows will be tiled to all the same size and use only the space they can accomodate.
		 *  If you set fillAvailableSpace = true, tile will use all the space available to tile the windows with
		 *  the windows being arranged by varying heights and widths.
		 *  </p>
		 *
		 *  @param fillAvailableSpace:Boolean Variable to determine whether to use the fill the entire available screen
		 *
		 */
		public function tile(fillAvailableSpace:Boolean = false, gap:Number = 0):void {
			var openWinList:Array = getOpenWindowList();
			
			var numWindows:int = openWinList.length;
			
			if (numWindows == 1) {
				BBBWindow(openWinList[0]).maximizeRestore();
			} else if (numWindows > 1) {
				var sqrt:int = Math.round(Math.sqrt(numWindows));
				var numCols:int = Math.ceil(numWindows / sqrt);
				var numRows:int = Math.ceil(numWindows / numCols);
				var col:int = 0;
				var row:int = 0;
				var availWidth:Number = this.container.width;
				var availHeight:Number = this.container.height
				
				if (showMinimizedTiles)
					availHeight = availHeight - getBottomOffsetHeight(this.tiledWindows.length, openWinList[0].minimizeHeight, this.minTilePadding);
				
				var targetWidth:Number = availWidth / numCols - ((gap * (numCols - 1)) / numCols);
				var targetHeight:Number = availHeight / numRows - ((gap * (numRows - 1)) / numRows);
				
				var effectItems:Array = [];
				
				for (var i:int = 0; i < openWinList.length; i++) {
					
					var win:BBBWindow = openWinList[i];
					
					bringToFront(win)
					
					var item:BBBGroupEffectItem = new BBBGroupEffectItem(win);
					
					item.widthTo = targetWidth;
					item.heightTo = targetHeight;
					
					if (i % numCols == 0 && i > 0) {
						row++;
						col = 0;
					} else if (i > 0) {
						col++;
					}
					
					item.moveTo = new Point((col * targetWidth), (row * targetHeight));
					
					//pushing out by gap
					if (col > 0)
						item.moveTo.x += gap * col;
					
					if (row > 0)
						item.moveTo.y += gap * row;
					
					effectItems.push(item);
					
				}
				
				
				if (col < numCols && fillAvailableSpace) {
					var numOrphans:int = numWindows % numCols;
					var orphanWidth:Number = availWidth / numOrphans - ((gap * (numOrphans - 1)) / numOrphans);
					//var orphanWidth:Number = availWidth / numOrphans;
					var orphanCount:int = 0
					for (var j:int = numWindows - numOrphans; j < numWindows; j++) {
						//var orphan:BBBWindow = openWinList[j];
						var orphan:BBBGroupEffectItem = effectItems[j];
						
						orphan.widthTo = orphanWidth;
						//orphan.window.width = orphanWidth;
						
						orphan.moveTo.x = (j - (numWindows - numOrphans)) * orphanWidth;
						if (orphanCount > 0)
							orphan.moveTo.x += gap * orphanCount;
						orphanCount++;
					}
				}
				
				dispatchEvent(new BBBManagerEvent(BBBManagerEvent.TILE, null, this, null, effectItems));
			}
		}
		
		// set a min. width/height
		public function resize(window:BBBWindow):void {
			var w:int = this.container.width * .6;
			var h:int = this.container.height * .6
			if (w > window.width)
				window.width = w;
			if (h > window.height)
				window.height = h;
		}
		
		public function showAllWindows():void {
			// this prevents retiling of windows yet to be unMinimized()
			tiledWindows.removeAll();
			
			for each (var window:BBBWindow in windowList) {
				if (window.minimized) {
					window.unMinimize();
				}
			}
		}
	}
}
