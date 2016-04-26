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

package org.bigbluebutton.web.window.views {
	
	import flash.events.ContextMenuEvent;
	import flash.events.Event;
	import flash.events.FocusEvent;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.geom.Rectangle;
	import flash.ui.ContextMenu;
	import flash.ui.ContextMenuItem;
	import flash.ui.Keyboard;
	import flash.utils.getQualifiedClassName;
	
	import mx.core.FlexGlobals;
	import mx.managers.CursorManager;
	import mx.styles.CSSStyleDeclaration;
	
	import spark.components.Button;
	import spark.components.Label;
	import spark.components.Panel;
	
	import org.bigbluebutton.web.common.skins.BetterButtonSkin;
	import org.bigbluebutton.web.window.events.BBBWindowEvent;
	import org.bigbluebutton.web.window.skins.BBBWindowSkin;
	
	/**
	 * Central window class used in flexlib.mdi. Includes min/max/close buttons by default.
	 */
	public class BBBWindow extends Panel {
		
		private const RESIZE_BUTTON_ALPHA:Number = 0;
		
		/**
		 * Window is floating.
		 */
		public static const NORMAL:int = 0;
		
		/**
		 * Window is minimized.
		 */
		public static const MINIMIZED:int = 1;
		
		/**
		 * Window is maximized.
		 */
		public static const MAXIMIZED:int = 2;
		
		/**
		 * Size of edge handles. Can be adjusted to affect "sensitivity" of resize area.
		 */
		public var edgeHandleSize:Number = 4;
		
		/**
		 * Size of corner handles. Can be adjusted to affect "sensitivity" of resize area.
		 */
		public var cornerHandleSize:Number = 10;
		
		/**
		 * @private
		 * Internal storage for windowState property.
		 */
		private var _windowState:int;
		
		/**
		 * @private
		 * Internal storage of previous state, used in min/max/restore logic.
		 */
		private var _prevWindowState:int;
		
		/**
		 * @private
		 * Internal storage of style name to be applied when window is in focus.
		 */
		private var _styleNameFocus:String;
		
		/**
		 * @private
		 * Internal storage of style name to be applied when window is out of focus.
		 */
		private var _styleNameNoFocus:String;
		
		/**
		 * Parent of window controls (min, restore/max and close buttons).
		 */
		private var _windowControls:BBBWindowControls;
		
		/**
		 * @private
		 * Flag to determine whether or not close button is visible.
		 */
		private var _showCloseButton:Boolean = true;
		
		/**
		 * @private
		 * Flag to determine whether or not window controls are visible.
		 */
		private var _showControls:Boolean = true;
		
		/**
		 * Height of window when minimized.
		 */
		private var _minimizeHeight:Number;
		
		/**
		 * Flag determining whether or not this window is resizable.
		 */
		public var resizable:Boolean = true;
		
		/**
		 * Flag determining whether or not this window is draggable.
		 */
		public var draggable:Boolean = true;
		
		/**
		 * @private
		 *
		 * Resize handle for top edge of window.
		 */
		private var resizeHandleTop:Button;
		
		/**
		 * @private
		 * Resize handle for right edge of window.
		 */
		private var resizeHandleRight:Button;
		
		/**
		 * @private
		 * Resize handle for bottom edge of window.
		 */
		private var resizeHandleBottom:Button;
		
		/**
		 * @private
		 * Resize handle for left edge of window.
		 */
		private var resizeHandleLeft:Button;
		
		/**
		 * @private
		 * Resize handle for top left corner of window.
		 */
		private var resizeHandleTL:Button;
		
		/**
		 * @private
		 * Resize handle for top right corner of window.
		 */
		private var resizeHandleTR:Button;
		
		/**
		 * @private
		 * Resize handle for bottom right corner of window.
		 */
		private var resizeHandleBR:Button;
		
		/**
		 * @private
		 * Resize handle for bottom left corner of window.
		 */
		private var resizeHandleBL:Button;
		
		/**
		 * Resize handle currently in use.
		 */
		private var currentResizeHandle:String;
		
		/**
		 * Rectangle to represent window's size and position when resize begins
		 * or window's size/position is saved.
		 */
		public var savedWindowRect:Rectangle;
		
		/**
		 * @private
		 * Flag used to intelligently dispatch resize related events
		 */
		private var _resizing:Boolean;
		
		/**
		 * Invisible shape laid over titlebar to prevent funkiness from clicking in title textfield.
		 * Making it public gives child components like controls container access to size of titleBar.
		 */
		public var titleBarOverlay:Button;
		
		/**
		 * @private
		 * Flag used to intelligently dispatch drag related events
		 */
		private var _dragging:Boolean;
		
		/**
		 * @private
		 * Mouse's x position when resize begins.
		 */
		private var dragStartMouseX:Number;
		
		/**
		 * @private
		 * Mouse's y position when resize begins.
		 */
		private var dragStartMouseY:Number;
		
		/**
		 * @private
		 * Maximum allowable x value for resize. Used to enforce minWidth.
		 */
		private var dragMaxX:Number;
		
		/**
		 * @private
		 * Maximum allowable x value for resize. Used to enforce minHeight.
		 */
		private var dragMaxY:Number;
		
		/**
		 * @private
		 * Amount the mouse's x position has changed during current resizing.
		 */
		private var dragAmountX:Number;
		
		/**
		 * @private
		 * Amount the mouse's y position has changed during current resizing.
		 */
		private var dragAmountY:Number;
		
		/**
		 * Window's context menu.
		 */
		public var winContextMenu:ContextMenu = null;
		
		/**
		 * Reference to BBBManager instance this window is managed by, if any.
		 */
		public var windowManager:BBBManager;
		
		/**
		 * @private
		 * Storage var to hold value originally assigned to styleName since it gets toggled per focus change.
		 */
		private var _windowStyleName:Object;
		
		/**
		 * @private
		 * Storage var for hasFocus property.
		 */
		private var _hasFocus:Boolean;
		
		/**
		 * @private store the backgroundAlpha when minimized.
		 */
		private var backgroundAlphaRestore:Number = 1;
		
		// assets for default buttons
		[Embed(source = "../assets/minimizeButton.png")]
		private static var DEFAULT_MINIMIZE_BUTTON:Class;
		
		[Embed(source = "../assets/maximizeButton.png")]
		private static var DEFAULT_MAXIMIZE_BUTTON:Class;
		
		[Embed(source = "../assets/restoreButton.png")]
		private static var DEFAULT_RESTORE_BUTTON:Class;
		
		[Embed(source = "../assets/closeButton.png")]
		private static var DEFAULT_CLOSE_BUTTON:Class;
		
		[Embed(source = "../assets/resizeCursorH.gif")]
		private static var DEFAULT_RESIZE_CURSOR_HORIZONTAL:Class;
		
		private static var DEFAULT_RESIZE_CURSOR_HORIZONTAL_X_OFFSET:Number = -10;
		
		private static var DEFAULT_RESIZE_CURSOR_HORIZONTAL_Y_OFFSET:Number = -10;
		
		[Embed(source = "../assets/resizeCursorV.gif")]
		private static var DEFAULT_RESIZE_CURSOR_VERTICAL:Class;
		
		private static var DEFAULT_RESIZE_CURSOR_VERTICAL_X_OFFSET:Number = -10;
		
		private static var DEFAULT_RESIZE_CURSOR_VERTICAL_Y_OFFSET:Number = -10;
		
		[Embed(source = "../assets/resizeCursorTLBR.gif")]
		private static var DEFAULT_RESIZE_CURSOR_TL_BR:Class;
		
		private static var DEFAULT_RESIZE_CURSOR_TL_BR_X_OFFSET:Number = -10;
		
		private static var DEFAULT_RESIZE_CURSOR_TL_BR_Y_OFFSET:Number = -10;
		
		[Embed(source = "../assets/resizeCursorTRBL.gif")]
		private static var DEFAULT_RESIZE_CURSOR_TR_BL:Class;
		
		private static var DEFAULT_RESIZE_CURSOR_TR_BL_X_OFFSET:Number = -10;
		
		private static var DEFAULT_RESIZE_CURSOR_TR_BL_Y_OFFSET:Number = -10;
		
		private static var classConstructed:Boolean = classConstruct();
		
		private const resizeCursorHorizontalSkin:Class = DEFAULT_RESIZE_CURSOR_HORIZONTAL;
		
		private const resizeCursorHorizontalXOffset:Number = DEFAULT_RESIZE_CURSOR_HORIZONTAL_X_OFFSET;
		
		private const resizeCursorHorizontalYOffset:Number = DEFAULT_RESIZE_CURSOR_HORIZONTAL_Y_OFFSET;
		
		private const resizeCursorVerticalSkin:Class = DEFAULT_RESIZE_CURSOR_VERTICAL;
		
		private const resizeCursorVerticalXOffset:Number = DEFAULT_RESIZE_CURSOR_VERTICAL_X_OFFSET;
		
		private const resizeCursorVerticalYOffset:Number = DEFAULT_RESIZE_CURSOR_VERTICAL_Y_OFFSET;
		
		private const resizeCursorTopLeftBottomRightSkin:Class = DEFAULT_RESIZE_CURSOR_TL_BR;
		
		private const resizeCursorTopLeftBottomRightXOffset:Number = DEFAULT_RESIZE_CURSOR_TL_BR_X_OFFSET;
		
		private const resizeCursorTopLeftBottomRightYOffset:Number = DEFAULT_RESIZE_CURSOR_TL_BR_Y_OFFSET;
		
		private const resizeCursorTopRightBottomLeftSkin:Class = DEFAULT_RESIZE_CURSOR_TR_BL;
		
		private const resizeCursorTopRightBottomLeftXOffset:Number = DEFAULT_RESIZE_CURSOR_TR_BL_X_OFFSET;
		
		private const resizeCursorTopRightBottomLeftYOffset:Number = DEFAULT_RESIZE_CURSOR_TR_BL_Y_OFFSET;
		
		/**
		 * Define and prepare default styles.
		 */
		private static function classConstruct():Boolean {
			
			//------------------------
			//  type selector
			//------------------------
			var selector:CSSStyleDeclaration = FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("org.bigbluebutton.web.window.views.BBBWindow");
			
			if (!selector) {
				selector = new CSSStyleDeclaration();
			}
			
			// these are default names for secondary styles. these can be set in CSS and will affect
			// all windows that don't have an override for these styles.
			selector.defaultFactory = function():void {
				this.styleNameFocus = "BBBWindowFocus";
				this.styleNameNoFocus = "BBBWindowNoFocus";
				
				this.titleStyleName = "BBBWindowTitleStyle";
				
				this.minimizeBtnStyleName = "BBBWindowMinimizeBtn";
				this.maximizeBtnStyleName = "BBBWindowMaximizeBtn";
				this.restoreBtnStyleName = "BBBWindowRestoreBtn";
				this.closeBtnStyleName = "BBBWindowCloseBtn";
				
				this.windowControlsClass = BBBWindowControls;
				
				this.resizeCursorHorizontalSkin = DEFAULT_RESIZE_CURSOR_HORIZONTAL;
				this.resizeCursorHorizontalXOffset = DEFAULT_RESIZE_CURSOR_HORIZONTAL_X_OFFSET;
				this.resizeCursorHorizontalYOffset = DEFAULT_RESIZE_CURSOR_HORIZONTAL_Y_OFFSET;
				
				this.resizeCursorVerticalSkin = DEFAULT_RESIZE_CURSOR_VERTICAL;
				this.resizeCursorVerticalXOffset = DEFAULT_RESIZE_CURSOR_VERTICAL_X_OFFSET;
				this.resizeCursorVerticalYOffset = DEFAULT_RESIZE_CURSOR_VERTICAL_Y_OFFSET;
				
				this.resizeCursorTopLeftBottomRightSkin = DEFAULT_RESIZE_CURSOR_TL_BR;
				this.resizeCursorTopLeftBottomRightXOffset = DEFAULT_RESIZE_CURSOR_TL_BR_X_OFFSET;
				this.resizeCursorTopLeftBottomRightYOffset = DEFAULT_RESIZE_CURSOR_TL_BR_Y_OFFSET;
				
				this.resizeCursorTopRightBottomLeftSkin = DEFAULT_RESIZE_CURSOR_TR_BL;
				this.resizeCursorTopRightBottomLeftXOffset = DEFAULT_RESIZE_CURSOR_TR_BL_X_OFFSET;
				this.resizeCursorTopRightBottomLeftYOffset = DEFAULT_RESIZE_CURSOR_TR_BL_Y_OFFSET;
			}
			
			//------------------------
			//  focus style
			//------------------------
			var styleNameFocus:String = selector.getStyle("styleNameFocus");
			var winFocusSelector:CSSStyleDeclaration = FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("." + styleNameFocus);
			if (!winFocusSelector) {
				winFocusSelector = new CSSStyleDeclaration();
			}
			winFocusSelector.defaultFactory = function():void {
				this.headerHeight = 26;
				this.borderColor = 0xCCCCCC;
				this.borderAlpha = 1;
				this.borderThickness = 1;
				this.backgroundAlpha = 1;
				this.dropShadowVisible = false;
				this.cornerRadius = 5;
				this.skinClass = BBBWindowSkin;
			}
			FlexGlobals.topLevelApplication.styleManager.setStyleDeclaration("." + styleNameFocus, winFocusSelector, false);
			
			//------------------------
			//  no focus style
			//------------------------
			var styleNameNoFocus:String = selector.getStyle("styleNameNoFocus");
			var winNoFocusSelector:CSSStyleDeclaration = FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("." + styleNameNoFocus);
			if (!winNoFocusSelector) {
				winNoFocusSelector = new CSSStyleDeclaration();
			}
			winNoFocusSelector.defaultFactory = function():void {
				this.headerHeight = 26;
				this.borderColor = 0xCCCCCC;
				this.borderAlpha = .5;
				this.borderThickness = 1;
				this.backgroundAlpha = .5;
				this.dropShadowVisible = false;
				this.cornerRadius = 5;
				this.skinClass = BBBWindowSkin;
			}
			FlexGlobals.topLevelApplication.styleManager.setStyleDeclaration("." + styleNameNoFocus, winNoFocusSelector, false);
			
			//------------------------
			//  title style
			//------------------------
			var titleStyleName:String = selector.getStyle("titleStyleName");
			var winTitleSelector:CSSStyleDeclaration = FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("." + titleStyleName);
			if (!winTitleSelector) {
				winTitleSelector = new CSSStyleDeclaration();
			}
			winTitleSelector.defaultFactory = function():void {
				this.fontFamily = "Arial";
				this.fontSize = 10;
				this.fontWeight = "bold";
				this.color = 0x000000;
			}
			FlexGlobals.topLevelApplication.styleManager.setStyleDeclaration("." + titleStyleName, winTitleSelector, false);
			
			//------------------------
			//  minimize button
			//------------------------
			var minimizeBtnStyleName:String = selector.getStyle("minimizeBtnStyleName");
			var minimizeBtnSelector:CSSStyleDeclaration = FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("." + minimizeBtnStyleName);
			if (!minimizeBtnSelector) {
				minimizeBtnSelector = new CSSStyleDeclaration();
			}
			minimizeBtnSelector.defaultFactory = function():void {
				this.borderAlpha = 0;
				this.backgroundAlpha = 0;
				this.highlightAlpha = 0;
				this.lowlightAlpha = 0;
				this.skinClass = BetterButtonSkin;
				this.icon = DEFAULT_MINIMIZE_BUTTON;
			}
			FlexGlobals.topLevelApplication.styleManager.setStyleDeclaration("." + minimizeBtnStyleName, minimizeBtnSelector, false);
			
			//------------------------
			//  maximize button
			//------------------------
			var maximizeBtnStyleName:String = selector.getStyle("maximizeBtnStyleName");
			var maximizeBtnSelector:CSSStyleDeclaration = FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("." + maximizeBtnStyleName);
			if (!maximizeBtnSelector) {
				maximizeBtnSelector = new CSSStyleDeclaration();
			}
			maximizeBtnSelector.defaultFactory = function():void {
				this.borderAlpha = 0;
				this.backgroundAlpha = 0;
				this.highlightAlpha = 0;
				this.lowlightAlpha = 0;
				this.skinClass = BetterButtonSkin;
				this.icon = DEFAULT_MAXIMIZE_BUTTON;
			}
			FlexGlobals.topLevelApplication.styleManager.setStyleDeclaration("." + maximizeBtnStyleName, maximizeBtnSelector, false);
			
			//------------------------
			//  restore button
			//------------------------
			var restoreBtnStyleName:String = selector.getStyle("restoreBtnStyleName");
			var restoreBtnSelector:CSSStyleDeclaration = FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("." + restoreBtnStyleName);
			if (!restoreBtnSelector) {
				restoreBtnSelector = new CSSStyleDeclaration();
			}
			restoreBtnSelector.defaultFactory = function():void {
				this.borderAlpha = 0;
				this.backgroundAlpha = 0;
				this.highlightAlpha = 0;
				this.lowlightAlpha = 0;
				this.skinClass = BetterButtonSkin;
				this.icon = DEFAULT_RESTORE_BUTTON;
			}
			FlexGlobals.topLevelApplication.styleManager.setStyleDeclaration("." + restoreBtnStyleName, restoreBtnSelector, false);
			
			//------------------------
			//  close button
			//------------------------
			var closeBtnStyleName:String = selector.getStyle("closeBtnStyleName");
			var closeBtnSelector:CSSStyleDeclaration = FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("." + closeBtnStyleName);
			if (!closeBtnSelector) {
				closeBtnSelector = new CSSStyleDeclaration();
			}
			closeBtnSelector.defaultFactory = function():void {
				this.borderAlpha = 0;
				this.backgroundAlpha = 0;
				this.highlightAlpha = 0;
				this.lowlightAlpha = 0;
				this.skinClass = BetterButtonSkin;
				this.icon = DEFAULT_CLOSE_BUTTON;
			}
			FlexGlobals.topLevelApplication.styleManager.setStyleDeclaration("." + closeBtnStyleName, closeBtnSelector, false);
			
			// apply it all
			FlexGlobals.topLevelApplication.styleManager.setStyleDeclaration("org.bigbluebutton.web.window.views.BBBWindow", selector, false);
			
			return true;
		}
		
		/**
		 * Constructor
		 */
		public function BBBWindow() {
			super();
			minWidth = minHeight = width = height = 200;
			windowState = BBBWindow.NORMAL;
			doubleClickEnabled = true;
			
			this.addEventListener(KeyboardEvent.KEY_DOWN, arrowKeyPress);
			
			updateContextMenu();
		}
		
		public function get windowStyleName():Object {
			return _windowStyleName;
		}
		
		public function set windowStyleName(value:Object):void {
			if (_windowStyleName === value)
				return;
			
			_windowStyleName = value;
			updateStyles();
		}
		
		/**
		 * Create resize handles and window controls.
		 */
		override protected function createChildren():void {
			super.createChildren();
			
			if (!titleBarOverlay) {
				titleBarOverlay = new Button();
				titleBarOverlay.width = this.width;
				titleBarOverlay.height = getStyle("headerHeight");
				titleBarOverlay.alpha = RESIZE_BUTTON_ALPHA;
				titleBarOverlay.y = -(getStyle("headerHeight"));
				titleBarOverlay.setStyle("backgroundColor", 0x000000);
				///TODO				BindingUtils.bindProperty(titleBarOverlay, "toolTip", this, "title");
				addElement(titleBarOverlay);
			}
			
			// edges
			if (!resizeHandleTop) {
				resizeHandleTop = new Button();
				resizeHandleTop.x = cornerHandleSize * .5;
				resizeHandleTop.y = -(edgeHandleSize * .5);
				resizeHandleTop.height = edgeHandleSize;
				resizeHandleTop.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleTop.focusEnabled = false;
				addElement(resizeHandleTop);
			}
			
			if (!resizeHandleRight) {
				resizeHandleRight = new Button();
				resizeHandleRight.y = cornerHandleSize * .5;
				resizeHandleRight.width = edgeHandleSize;
				resizeHandleRight.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleRight.focusEnabled = false;
				addElement(resizeHandleRight);
			}
			
			if (!resizeHandleBottom) {
				resizeHandleBottom = new Button();
				resizeHandleBottom.x = cornerHandleSize * .5;
				resizeHandleBottom.height = edgeHandleSize;
				resizeHandleBottom.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleBottom.focusEnabled = false;
				addElement(resizeHandleBottom);
			}
			
			if (!resizeHandleLeft) {
				resizeHandleLeft = new Button();
				resizeHandleLeft.x = -(edgeHandleSize * .5);
				resizeHandleLeft.y = cornerHandleSize * .5;
				resizeHandleLeft.width = edgeHandleSize;
				resizeHandleLeft.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleLeft.focusEnabled = false;
				addElement(resizeHandleLeft);
			}
			
			// corners
			if (!resizeHandleTL) {
				resizeHandleTL = new Button();
				resizeHandleTL.x = resizeHandleTL.y = -(cornerHandleSize * .3);
				resizeHandleTL.width = resizeHandleTL.height = cornerHandleSize;
				resizeHandleTL.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleTL.focusEnabled = false;
				addElement(resizeHandleTL);
			}
			
			if (!resizeHandleTR) {
				resizeHandleTR = new Button();
				resizeHandleTR.width = resizeHandleTR.height = cornerHandleSize;
				resizeHandleTR.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleTR.focusEnabled = false;
				addElement(resizeHandleTR);
			}
			
			if (!resizeHandleBR) {
				resizeHandleBR = new Button();
				resizeHandleBR.width = resizeHandleBR.height = cornerHandleSize;
				resizeHandleBR.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleBR.focusEnabled = false;
				addElement(resizeHandleBR);
			}
			
			if (!resizeHandleBL) {
				resizeHandleBL = new Button();
				resizeHandleBL.width = resizeHandleBL.height = cornerHandleSize;
				resizeHandleBL.alpha = RESIZE_BUTTON_ALPHA;
				resizeHandleBL.focusEnabled = false;
				addElement(resizeHandleBL);
			}
			
			windowControls = new BBBWindowControls();
			
			addListeners();
		}
		
		/**
		 * Position and size resize handles and window controls.
		 */
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			var titleOffset:Number = getStyle("headerHeight");
			
			titleBarOverlay.width = this.width;
			titleBarOverlay.height = titleOffset;
			titleBarOverlay.y = -titleOffset;
			
			// edges
			resizeHandleTop.x = cornerHandleSize * .5;
			resizeHandleTop.y = -(edgeHandleSize * .5) - titleOffset;
			resizeHandleTop.width = this.width - cornerHandleSize;
			resizeHandleTop.height = edgeHandleSize;
			
			resizeHandleRight.x = this.width - edgeHandleSize * .5;
			resizeHandleRight.y = cornerHandleSize * .5 - titleOffset;
			resizeHandleRight.width = edgeHandleSize;
			resizeHandleRight.height = this.height - cornerHandleSize;
			
			resizeHandleBottom.x = cornerHandleSize * .5;
			resizeHandleBottom.y = this.height - edgeHandleSize * .5 - titleOffset;
			resizeHandleBottom.width = this.width - cornerHandleSize;
			resizeHandleBottom.height = edgeHandleSize;
			
			resizeHandleLeft.x = -(edgeHandleSize * .5);
			resizeHandleLeft.y = cornerHandleSize * .5 - titleOffset;
			resizeHandleLeft.width = edgeHandleSize;
			resizeHandleLeft.height = this.height - cornerHandleSize;
			
			// corners
			resizeHandleTL.x = -(cornerHandleSize * .5)
			resizeHandleTL.y = -(cornerHandleSize * .5) - titleOffset;
			resizeHandleTL.width = resizeHandleTL.height = cornerHandleSize;
			
			resizeHandleTR.x = this.width - cornerHandleSize * .5;
			resizeHandleTR.y = -(cornerHandleSize * .5) - titleOffset;
			resizeHandleTR.width = resizeHandleTR.height = cornerHandleSize;
			
			resizeHandleBR.x = this.width - cornerHandleSize * .5;
			resizeHandleBR.y = this.height - cornerHandleSize * .5 - titleOffset;
			resizeHandleBR.width = resizeHandleBR.height = cornerHandleSize;
			
			resizeHandleBL.x = -(cornerHandleSize * .5);
			resizeHandleBL.y = this.height - cornerHandleSize * .5 - titleOffset;
			resizeHandleBL.width = resizeHandleBL.height = cornerHandleSize;
			
			// cause windowControls container to update
			windowControls.invalidateDisplayList();
		}
		
		
		
		public function get hasFocus():Boolean {
			return _hasFocus;
		}
		
		/**
		 * Property is set by BBBManager when a window's focus changes. Triggers an update to the window's styleName.
		 */
		public function set hasFocus(value:Boolean):void {
			// guard against unnecessary processing
			if (_hasFocus == value)
				return;
			
			// set new value
			_hasFocus = value;
			updateStyles();
		}
		
		/**
		 * Mother of all styling functions. All styles fall back to the defaults if necessary.
		 */
		private function updateStyles():void {
			
			var selectorList:Array = getSelectorList();
			
			// if the style specifies a class to use for the controls container that is
			// different from the current one we will update it here
			if (getStyleByPriority(selectorList, "windowControlsClass")) {
				var clazz:Class = getStyleByPriority(selectorList, "windowControlsClass") as Class;
				var classNameExisting:String = getQualifiedClassName(windowControls);
				var classNameNew:String = getQualifiedClassName(clazz);
				
				if (classNameExisting != classNameNew) {
					windowControls = new clazz();
					// sometimes necessary to adjust windowControls subcomponents
					callLater(windowControls.invalidateDisplayList);
				}
			}
			
			// set window's styleName based on focus status
			if (hasFocus) {
				setStyle("styleName", getStyleByPriority(selectorList, "styleNameFocus"));
			} else {
				setStyle("styleName", getStyleByPriority(selectorList, "styleNameNoFocus"));
			}
			
			// style the window's title
			// this code is probably not as efficient as it could be but i am sick of dealing with styling
			// if titleStyleName (the style inherited from Panel) has been set we use that, regardless of focus
			if (titleDisplay) {
				if (!hasFocus && getStyleByPriority(selectorList, "titleStyleNameNoFocus")) {
					getTitleTextField().styleName = getStyleByPriority(selectorList, "titleStyleNameNoFocus");
						//setStyle("titleStyleName", getStyleByPriority(selectorList, "titleStyleNameNoFocus"));
				} else if (getStyleByPriority(selectorList, "titleStyleNameFocus")) {
					getTitleTextField().styleName = getStyleByPriority(selectorList, "titleStyleNameFocus");
						//setStyle("titleStyleName", getStyleByPriority(selectorList, "titleStyleNameFocus"));
				} else {
					//getStyleByPriority(selectorList, "titleStyleName")
					getTitleTextField().styleName = getStyleByPriority(selectorList, "titleStyleName");
				}
			}
			
			// style minimize button
			if (minimizeBtn) {
				// use noFocus style if appropriate and one exists
				if (!hasFocus && getStyleByPriority(selectorList, "minimizeBtnStyleNameNoFocus")) {
					minimizeBtn.styleName = getStyleByPriority(selectorList, "minimizeBtnStyleNameNoFocus");
				} else {
					minimizeBtn.styleName = getStyleByPriority(selectorList, "minimizeBtnStyleName");
				}
			}
			
			// style maximize/restore button
			if (maximizeRestoreBtn) {
				// fork on windowState
				if (maximized) {
					// use noFocus style if appropriate and one exists
					if (!hasFocus && getStyleByPriority(selectorList, "restoreBtnStyleNameNoFocus")) {
						maximizeRestoreBtn.styleName = getStyleByPriority(selectorList, "restoreBtnStyleNameNoFocus");
					} else {
						maximizeRestoreBtn.styleName = getStyleByPriority(selectorList, "restoreBtnStyleName");
					}
				} else {
					// use noFocus style if appropriate and one exists
					if (!hasFocus && getStyleByPriority(selectorList, "maximizeBtnStyleNameNoFocus")) {
						maximizeRestoreBtn.styleName = getStyleByPriority(selectorList, "maximizeBtnStyleNameNoFocus");
					} else {
						maximizeRestoreBtn.styleName = getStyleByPriority(selectorList, "maximizeBtnStyleName");
					}
				}
			}
			
			// style close button
			if (closeBtn) {
				// use noFocus style if appropriate and one exists
				if (!hasFocus && getStyleByPriority(selectorList, "closeBtnStyleNameNoFocus")) {
					closeBtn.styleName = getStyleByPriority(selectorList, "closeBtnStyleNameNoFocus");
				} else {
					closeBtn.styleName = getStyleByPriority(selectorList, "closeBtnStyleName");
				}
			}
		}
		
		protected function getSelectorList():Array {
			// initialize array with ref to ourself since inline styles take highest priority
			var selectorList:Array = new Array(this);
			
			// if windowStyleName was set by developer we associated styles to the list
			if (windowStyleName) {
				// make sure a corresponding style actually exists
				var classSelector:CSSStyleDeclaration = FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("." + windowStyleName);
				if (classSelector) {
					selectorList.push(classSelector);
				}
			}
			// add type selector (created in classConstruct so we know it exists)
			var typeSelector:CSSStyleDeclaration = FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("org.bigbluebutton.web.window.views.BBBWindow");
			selectorList.push(typeSelector);
			
			return selectorList;
		}
		
		/**
		 * Function to return appropriate style based on our funky setup.
		 * Precedence of styles is inline, class selector (as specified by windowStyleName)
		 * and then type selector (BBBWindow).
		 *
		 * @private
		 */
		protected function getStyleByPriority(selectorList:Array, style:String):Object {
			var n:int = selectorList.length;
			
			for (var i:int = 0; i < n; i++) {
				// we need to make sure this.getStyle() is not pointing to the style defined
				// in the type selector because styles defined in the class selector (windowStyleName)
				// should take precedence over type selector (BBBWindow) styles
				// this.getStyle() will return styles from the type selector if an inline
				// style was not specified
				if (selectorList[i] == this && selectorList[i].getStyle(style) && this.getStyle(style) === selectorList[n - 1].getStyle(style)) {
					continue;
				}
				if (selectorList[i].getStyle(style)) {
					// if this is a style name make sure the style exists
					if (typeof(selectorList[i].getStyle(style)) == "string" && !(FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("." + selectorList[i].getStyle(style)))) {
						continue;
					} else {
						return selectorList[i].getStyle(style);
					}
				}
			}
			
			return null;
		}
		
		/**
		 * Detects change to styleName that is executed by BBBManager indicating a change in focus.
		 * Iterates over window controls and adjusts their styles if they're focus-aware.
		 */
		override public function styleChanged(styleProp:String):void {
			super.styleChanged(styleProp);
			
			if (!styleProp || styleProp == "styleName")
				updateStyles();
		}
		
		/**
		 * Reference to class used to create windowControls property.
		 */
		public function get windowControls():BBBWindowControls {
			return _windowControls;
		}
		
		/**
		 * When reference is set windowControls will be reinstantiated, meaning runtime switching is supported.
		 */
		public function set windowControls(controlsContainer:BBBWindowControls):void {
			if (_windowControls) {
				/*
				   var cntnr:Container = Container(windowControls);
				   cntnr.removeAllChildren();
				   rawChildren.removeChild(cntnr);
				 */
				_windowControls.removeAllElements();
				removeElement(_windowControls);
				_windowControls = null;
			}
			
			_windowControls = controlsContainer;
			_windowControls.window = this;
			addElement(_windowControls);
			if (windowState == BBBWindow.MINIMIZED) {
				showControls = false;
			}
		}
		
		/**
		 * Minimize window button.
		 */
		public function get minimizeBtn():Button {
			return windowControls.minimizeBtn;
		}
		
		/**
		 * Maximize/restore window button.
		 */
		public function get maximizeRestoreBtn():Button {
			return windowControls.maximizeRestoreBtn;
		}
		
		/**
		 * Close window button.
		 */
		public function get closeBtn():Button {
			if (windowControls) {
				return windowControls.closeBtn;
			} else {
				return null;
			}
		}
		
		public function get showCloseButton():Boolean {
			return _showCloseButton;
		}
		
		public function set showCloseButton(value:Boolean):void {
			_showCloseButton = value;
			if (closeBtn && closeBtn.visible != value) {
				closeBtn.visible = closeBtn.includeInLayout = value;
				invalidateDisplayList();
			}
		}
		
		
		/**
		 * Returns reference to titleDisplay which is protected by default.
		 * Provided to allow BBBWindowControls subclasses as much freedom as possible.
		 */
		public function getTitleTextField():Label {
			var t:Label = (titleDisplay as Label);
			return (titleDisplay as Label);
		}
		
		
		/*
		   /**
		 * Returns reference to titleIconObject which is mx_internal by default.
		 * Provided to allow BBBWindowControls subclasses as much freedom as possible.
		   /
		   public function getTitleIconObject():DisplayObject {
		   use namespace mx_internal;
		   return titletitleIconObject as DisplayObject;
		   }
		 */
		
		/**
		 * Save style settings for minimizing.
		 */
		public function saveStyle():void {
			//this.backgroundAlphaRestore = this.getStyle("backgroundAlpha");
		}
		
		/**
		 * Restores style settings for restore and maximize
		 */
		public function restoreStyle():void {
			//this.setStyle("backgroundAlpha", this.backgroundAlphaRestore);
		}
		
		/**
		 * Add listeners for resize handles and window controls.
		 */
		private function addListeners():void {
			// edges
			resizeHandleTop.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleTop.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleTop.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleRight.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleRight.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleRight.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleBottom.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleBottom.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleBottom.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleLeft.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleLeft.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleLeft.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			// corners
			resizeHandleTL.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleTL.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleTL.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleTR.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleTR.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleTR.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleBR.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleBR.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleBR.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			resizeHandleBL.addEventListener(MouseEvent.ROLL_OVER, onResizeButtonRollOver, false, 0, true);
			resizeHandleBL.addEventListener(MouseEvent.ROLL_OUT, onResizeButtonRollOut, false, 0, true);
			resizeHandleBL.addEventListener(MouseEvent.MOUSE_DOWN, onResizeButtonPress, false, 0, true);
			
			// titleBar overlay
			titleBarOverlay.addEventListener(MouseEvent.MOUSE_DOWN, onTitleBarPress, false, 0, true);
			titleBarOverlay.addEventListener(MouseEvent.MOUSE_UP, onTitleBarRelease, false, 0, true);
			titleBarOverlay.addEventListener(MouseEvent.DOUBLE_CLICK, maximizeRestore, false, 0, true);
			titleBarOverlay.addEventListener(MouseEvent.CLICK, unMinimize, false, 0, true);
			
			// window controls
			addEventListener(MouseEvent.CLICK, windowControlClickHandler, false, 0, true);
			
			// clicking anywhere brings window to front
			addEventListener(MouseEvent.MOUSE_DOWN, bringToFrontProxy);
			contextMenu.addEventListener(ContextMenuEvent.MENU_SELECT, bringToFrontProxy);
			
			// gaining focus on any element in the window brings it to the front
			// Could be improved to look for focusManager's lastfocused item
			this.addEventListener(FocusEvent.FOCUS_IN, bringToFrontProxy);
		}
		
		/**
		 * Click handler for default window controls (minimize, maximize/restore and close).
		 */
		private function windowControlClickHandler(event:MouseEvent):void {
			if (windowControls) {
				if (windowControls.minimizeBtn && event.target == windowControls.minimizeBtn) {
					minimize();
				} else if (windowControls.maximizeRestoreBtn && event.target == windowControls.maximizeRestoreBtn) {
					maximizeRestore();
				} else if (windowControls.closeBtn && event.target == windowControls.closeBtn) {
					close();
				}
			}
		}
		
		/**
		 * Called automatically by clicking on window this now delegates execution to the manager.
		 */
		private function bringToFrontProxy(event:Event):void {
			windowManager.bringToFront(this);
		}
		
		/**
		 *  Minimize the window.
		 */
		public function minimize(event:MouseEvent = null):void {
			// if the panel is floating, save its state
			if (windowState == BBBWindow.NORMAL) {
				savePanel();
			}
			dispatchEvent(new BBBWindowEvent(BBBWindowEvent.MINIMIZE, this));
			windowState = BBBWindow.MINIMIZED;
			showControls = false;
		}
		
		
		/**
		 *  Called from maximize/restore button
		 *
		 *  @event MouseEvent (optional)
		 */
		public function maximizeRestore(event:MouseEvent = null):void {
			if (windowState == BBBWindow.NORMAL) {
				savePanel();
				maximize();
			} else {
				restore();
			}
		}
		
		/**
		 * Restores the window to its last floating position.
		 */
		public function restore():void {
			windowState = BBBWindow.NORMAL;
			updateStyles();
			dispatchEvent(new BBBWindowEvent(BBBWindowEvent.RESTORE, this));
		}
		
		/**
		 * Maximize the window.
		 */
		public function maximize():void {
			if (windowState == BBBWindow.NORMAL) {
				savePanel();
			}
			showControls = true;
			windowState = BBBWindow.MAXIMIZED;
			updateStyles();
			dispatchEvent(new BBBWindowEvent(BBBWindowEvent.MAXIMIZE, this));
		}
		
		/**
		 * Close the window.
		 */
		public function close(event:MouseEvent = null):void {
			dispatchEvent(new BBBWindowEvent(BBBWindowEvent.CLOSE, this));
		}
		
		/**
		 * Save the panel's floating coordinates.
		 *
		 * @private
		 */
		private function savePanel():void {
			savedWindowRect = new Rectangle(this.x, this.y, this.width, this.height);
		}
		
		/**
		 * Title bar dragging.
		 *
		 * @private
		 */
		private function onTitleBarPress(event:MouseEvent):void {
			// only floating windows can be dragged
			if (this.windowState == BBBWindow.NORMAL && draggable) {
				dragStartMouseX = mouseX;
				dragStartMouseY = mouseY;
				
				systemManager.addEventListener(Event.ENTER_FRAME, onWindowMove);
				systemManager.addEventListener(MouseEvent.MOUSE_UP, onTitleBarRelease);
				systemManager.stage.addEventListener(Event.MOUSE_LEAVE, onTitleBarRelease);
			}
		}
		
		private function onWindowMove(event:Event):void {
			if (!_dragging) {
				_dragging = true;
				// clear styles (future versions may allow enforcing constraints on drag)
				this.clearStyle("top");
				this.clearStyle("right");
				this.clearStyle("bottom");
				this.clearStyle("left");
				dispatchEvent(new BBBWindowEvent(BBBWindowEvent.DRAG_START, this));
			}
			
			if (windowManager.enforceBoundaries) {
				x = Math.max(0, Math.min(parent.width - this.width, parent.mouseX - dragStartMouseX));
				y = Math.max(0, Math.min(parent.height - this.height, parent.mouseY - dragStartMouseY));
			} else {
				x = parent.mouseX - dragStartMouseX;
				y = parent.mouseY - dragStartMouseY;
			}
			
			dispatchEvent(new BBBWindowEvent(BBBWindowEvent.DRAG, this));
		}
		
		private function onTitleBarRelease(event:Event):void {
			this.stopDrag();
			if (_dragging) {
				_dragging = false;
				dispatchEvent(new BBBWindowEvent(BBBWindowEvent.DRAG_END, this));
			}
			systemManager.removeEventListener(Event.ENTER_FRAME, onWindowMove);
			systemManager.removeEventListener(MouseEvent.MOUSE_UP, onTitleBarRelease);
			systemManager.stage.removeEventListener(Event.MOUSE_LEAVE, onTitleBarRelease);
		}
		
		/**
		 * Gives BBBResizeHandle value for a given resize handle button
		 */
		private function resizeHandleForButton(button:Button):String {
			if (button == resizeHandleLeft)
				return BBBResizeHandle.LEFT;
			else if (button == resizeHandleRight)
				return BBBResizeHandle.RIGHT;
			else if (button == resizeHandleTop)
				return BBBResizeHandle.TOP;
			else if (button == resizeHandleBottom)
				return BBBResizeHandle.BOTTOM;
			else if (button == resizeHandleTL)
				return BBBResizeHandle.TOP_LEFT;
			else if (button == resizeHandleTR)
				return BBBResizeHandle.TOP_RIGHT;
			else if (button == resizeHandleBL)
				return BBBResizeHandle.BOTTOM_LEFT;
			else if (button == resizeHandleBR)
				return BBBResizeHandle.BOTTOM_RIGHT;
			else
				return null;
		}
		
		/**
		 * Mouse down on any resize handle.
		 */
		private function onResizeButtonPress(event:MouseEvent):void {
			if (windowState == BBBWindow.NORMAL && resizable) {
				currentResizeHandle = resizeHandleForButton(event.target as Button);
				setCursor(currentResizeHandle);
				dragStartMouseX = parent.mouseX;
				dragStartMouseY = parent.mouseY;
				savePanel();
				
				dragMaxX = savedWindowRect.x + (savedWindowRect.width - minWidth);
				dragMaxY = savedWindowRect.y + (savedWindowRect.height - minHeight);
				
				systemManager.addEventListener(Event.ENTER_FRAME, updateWindowSize, false, 0, true);
				systemManager.addEventListener(MouseEvent.MOUSE_UP, onResizeButtonRelease, false, 0, true);
				systemManager.stage.addEventListener(Event.MOUSE_LEAVE, onMouseLeaveStage, false, 0, true);
			}
		}
		
		/**
		 * Mouse move while mouse is down on a resize handle
		 */
		private function updateWindowSize(event:Event):void {
			if (!_resizing) {
				_resizing = true;
				dispatchEvent(new BBBWindowEvent(BBBWindowEvent.RESIZE_START, this));
			}
			
			if (windowState == BBBWindow.NORMAL && resizable) {
				dragAmountX = parent.mouseX - dragStartMouseX;
				dragAmountY = parent.mouseY - dragStartMouseY;
				
				if (currentResizeHandle == BBBResizeHandle.TOP && parent.mouseY > 0) {
					this.y = Math.min(savedWindowRect.y + dragAmountY, dragMaxY);
					this.height = Math.max(savedWindowRect.height - dragAmountY, minHeight);
				} else if (currentResizeHandle == BBBResizeHandle.RIGHT && parent.mouseX < parent.width) {
					this.width = Math.max(savedWindowRect.width + dragAmountX, minWidth);
				} else if (currentResizeHandle == BBBResizeHandle.BOTTOM && parent.mouseY < parent.height) {
					this.height = Math.max(savedWindowRect.height + dragAmountY, minHeight);
				} else if (currentResizeHandle == BBBResizeHandle.LEFT && parent.mouseX > 0) {
					this.x = Math.min(savedWindowRect.x + dragAmountX, dragMaxX);
					this.width = Math.max(savedWindowRect.width - dragAmountX, minWidth);
				} else if (currentResizeHandle == BBBResizeHandle.TOP_LEFT && parent.mouseX > 0 && parent.mouseY > 0) {
					this.x = Math.min(savedWindowRect.x + dragAmountX, dragMaxX);
					this.y = Math.min(savedWindowRect.y + dragAmountY, dragMaxY);
					this.width = Math.max(savedWindowRect.width - dragAmountX, minWidth);
					this.height = Math.max(savedWindowRect.height - dragAmountY, minHeight);
				} else if (currentResizeHandle == BBBResizeHandle.TOP_RIGHT && parent.mouseX < parent.width && parent.mouseY > 0) {
					this.y = Math.min(savedWindowRect.y + dragAmountY, dragMaxY);
					this.width = Math.max(savedWindowRect.width + dragAmountX, minWidth);
					this.height = Math.max(savedWindowRect.height - dragAmountY, minHeight);
				} else if (currentResizeHandle == BBBResizeHandle.BOTTOM_RIGHT && parent.mouseX < parent.width && parent.mouseY < parent.height) {
					this.width = Math.max(savedWindowRect.width + dragAmountX, minWidth);
					this.height = Math.max(savedWindowRect.height + dragAmountY, minHeight);
				} else if (currentResizeHandle == BBBResizeHandle.BOTTOM_LEFT && parent.mouseX > 0 && parent.mouseY < parent.height) {
					this.x = Math.min(savedWindowRect.x + dragAmountX, dragMaxX);
					this.width = Math.max(savedWindowRect.width - dragAmountX, minWidth);
					this.height = Math.max(savedWindowRect.height + dragAmountY, minHeight);
				}
			}
			
			
			dispatchEvent(new BBBWindowEvent(BBBWindowEvent.RESIZE, this, currentResizeHandle));
		}
		
		private function onResizeButtonRelease(event:MouseEvent = null):void {
			if (windowState == BBBWindow.NORMAL && resizable) {
				if (_resizing) {
					_resizing = false;
					dispatchEvent(new BBBWindowEvent(BBBWindowEvent.RESIZE_END, this));
				}
				currentResizeHandle = null;
				systemManager.removeEventListener(Event.ENTER_FRAME, updateWindowSize);
				systemManager.removeEventListener(MouseEvent.MOUSE_UP, onResizeButtonRelease);
				systemManager.stage.removeEventListener(Event.MOUSE_LEAVE, onMouseLeaveStage);
				CursorManager.removeCursor(CursorManager.currentCursorID);
			}
		}
		
		private function onMouseLeaveStage(event:Event):void {
			onResizeButtonRelease();
			systemManager.stage.removeEventListener(Event.MOUSE_LEAVE, onMouseLeaveStage);
		}
		
		/**
		 * Restore window to state it was in prior to being minimized.
		 */
		public function unMinimize(event:MouseEvent = null):void {
			if (minimized) {
				showControls = true;
				
				if (_prevWindowState == BBBWindow.NORMAL) {
					restore();
				} else {
					maximize();
				}
			}
		}
		
		private function setCursor(resizeHandle:String):void {
			var styleStub:String;
			
			CursorManager.removeCursor(CursorManager.currentCursorID);
			
			switch (resizeHandle) {
				case BBBResizeHandle.RIGHT:
				case BBBResizeHandle.LEFT:
					styleStub = "resizeCursorHorizontal";
					CursorManager.setCursor(resizeCursorHorizontalSkin, 2, resizeCursorHorizontalXOffset, resizeCursorHorizontalYOffset);
					break;
				
				case BBBResizeHandle.TOP:
				case BBBResizeHandle.BOTTOM:
					styleStub = "resizeCursorVertical";
					CursorManager.setCursor(resizeCursorVerticalSkin, 2, resizeCursorVerticalXOffset, resizeCursorVerticalYOffset);
					break;
				
				case BBBResizeHandle.TOP_LEFT:
				case BBBResizeHandle.BOTTOM_RIGHT:
					styleStub = "resizeCursorTopLeftBottomRight";
					CursorManager.setCursor(resizeCursorTopLeftBottomRightSkin, 2, resizeCursorTopLeftBottomRightXOffset, resizeCursorTopLeftBottomRightYOffset);
					break;
				
				case BBBResizeHandle.TOP_RIGHT:
				case BBBResizeHandle.BOTTOM_LEFT:
					styleStub = "resizeCursorTopRightBottomLeft";
					CursorManager.setCursor(resizeCursorTopRightBottomLeftSkin, 2, resizeCursorTopRightBottomLeftXOffset, resizeCursorTopRightBottomLeftYOffset);
					break;
			}
		
			//var selectorList:Array = getSelectorList();
		
			//CursorManager.removeCursor(CursorManager.currentCursorID);
			//CursorManager.setCursor(Class(getStyleByPriority(selectorList, styleStub + "Skin")), 2, Number(getStyleByPriority(selectorList, styleStub + "XOffset")), Number(getStyleByPriority(selectorList, styleStub + "YOffset")));
			//CursorManager.setCursor(styleStub + "Skin", 2, styleStub + "XOffset", styleStub + "YOffset");
		}
		
		private function onResizeButtonRollOver(event:MouseEvent):void {
			// only floating windows can be resized
			// event.buttonDown is to detect being dragged over
			if (windowState == BBBWindow.NORMAL && resizable && !event.buttonDown) {
				setCursor(resizeHandleForButton(event.target as Button));
			}
		}
		
		private function onResizeButtonRollOut(event:MouseEvent):void {
			if (!event.buttonDown) {
				CursorManager.removeCursor(CursorManager.currentCursorID);
			}
		}
		
		public function get showControls():Boolean {
			return _showControls;
		}
		
		public function set showControls(value:Boolean):void {
			if (value != _showControls) {
				_showControls = windowControls.visible = value;
			}
		}
		
		private function get windowState():int {
			return _windowState;
		}
		
		private function set windowState(newState:int):void {
			_prevWindowState = _windowState;
			_windowState = newState;
			
			updateContextMenu();
		}
		
		public function get minimized():Boolean {
			return _windowState == BBBWindow.MINIMIZED;
		}
		
		public function get maximized():Boolean {
			return _windowState == BBBWindow.MAXIMIZED;
		}
		
		public function get minimizeHeight():Number {
			return getStyle("headerHeight");
		}
		
		public static const CONTEXT_MENU_LABEL_MINIMIZE:String = "Minimize";
		
		public static const CONTEXT_MENU_LABEL_MAXIMIZE:String = "Maximize";
		
		public static const CONTEXT_MENU_LABEL_RESTORE:String = "Restore";
		
		public static const CONTEXT_MENU_LABEL_CLOSE:String = "Close";
		
		public function updateContextMenu():void {
			var defaultContextMenu:ContextMenu = new ContextMenu();
			defaultContextMenu.hideBuiltInItems();
			
			var minimizeItem:ContextMenuItem = new ContextMenuItem(BBBWindow.CONTEXT_MENU_LABEL_MINIMIZE);
			minimizeItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemSelectHandler);
			minimizeItem.enabled = windowState != BBBWindow.MINIMIZED;
			defaultContextMenu.customItems.push(minimizeItem);
			
			var maximizeItem:ContextMenuItem = new ContextMenuItem(BBBWindow.CONTEXT_MENU_LABEL_MAXIMIZE);
			maximizeItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemSelectHandler);
			maximizeItem.enabled = windowState != BBBWindow.MAXIMIZED;
			defaultContextMenu.customItems.push(maximizeItem);
			
			var restoreItem:ContextMenuItem = new ContextMenuItem(BBBWindow.CONTEXT_MENU_LABEL_RESTORE);
			restoreItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemSelectHandler);
			restoreItem.enabled = windowState != BBBWindow.NORMAL;
			defaultContextMenu.customItems.push(restoreItem);
			
			var closeItem:ContextMenuItem = new ContextMenuItem(BBBWindow.CONTEXT_MENU_LABEL_CLOSE);
			closeItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemSelectHandler);
			defaultContextMenu.customItems.push(closeItem);
			
			
			var arrangeItem:ContextMenuItem = new ContextMenuItem(BBBManager.CONTEXT_MENU_LABEL_TILE);
			arrangeItem.separatorBefore = true;
			arrangeItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemSelectHandler);
			defaultContextMenu.customItems.push(arrangeItem);
			
			var arrangeFillItem:ContextMenuItem = new ContextMenuItem(BBBManager.CONTEXT_MENU_LABEL_TILE_FILL);
			arrangeFillItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemSelectHandler);
			defaultContextMenu.customItems.push(arrangeFillItem);
			
			var showAllItem:ContextMenuItem = new ContextMenuItem(BBBManager.CONTEXT_MENU_LABEL_SHOW_ALL);
			showAllItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemSelectHandler);
			defaultContextMenu.customItems.push(showAllItem);
			
			this.contextMenu = defaultContextMenu;
		}
		
		private function menuItemSelectHandler(event:ContextMenuEvent):void {
			switch (event.target.caption) {
				case (BBBWindow.CONTEXT_MENU_LABEL_MINIMIZE):
					minimize();
					break;
				
				case (BBBWindow.CONTEXT_MENU_LABEL_MAXIMIZE):
					maximize();
					break;
				
				case (BBBWindow.CONTEXT_MENU_LABEL_RESTORE):
					if (this.windowState == BBBWindow.MINIMIZED) {
						unMinimize();
					} else if (this.windowState == BBBWindow.MAXIMIZED) {
						maximizeRestore();
					}
					break;
				
				case (BBBWindow.CONTEXT_MENU_LABEL_CLOSE):
					close();
					break;
				
				case (BBBManager.CONTEXT_MENU_LABEL_TILE):
					this.windowManager.tile(false, this.windowManager.tilePadding);
					break;
				
				case (BBBManager.CONTEXT_MENU_LABEL_TILE_FILL):
					this.windowManager.tile(true, this.windowManager.tilePadding);
					break;
				
				case (BBBManager.CONTEXT_MENU_LABEL_SHOW_ALL):
					this.windowManager.showAllWindows();
					break;
				
			}
		}
		
		// This event is called when a key is pressed and anything in the BBBWindow has focus
		private function arrowKeyPress(event:KeyboardEvent):void {
			dragAmountX = 5; // adjust by 5 pixels(?) at a time
			dragAmountY = 5;
			
			// only resize if only the ctrl key is clicked
			if (windowState == BBBWindow.NORMAL && resizable && event.ctrlKey && !event.shiftKey && !event.altKey) {
				savePanel();
				
				switch (event.keyCode) {
					case Keyboard.UP:
						dragAmountX = 0;
						break;
					case Keyboard.DOWN:
						dragAmountX = 0;
						dragAmountY *= -1;
						break;
					case Keyboard.RIGHT:
						dragAmountX *= -1;
						dragAmountY = 0;
						break;
					case Keyboard.LEFT:
						dragAmountY = 0;
						break;
					default:
						dragAmountX = 0;
						dragAmountY = 0;
				}
				
				if (dragAmountX != 0 || dragAmountY != 0) // only resize if an arrow key was pressed
				{
					this.height = Math.max(savedWindowRect.height - dragAmountY, minHeight);
					this.width = Math.max(savedWindowRect.width - dragAmountX, minWidth);
					dispatchEvent(new BBBWindowEvent(BBBWindowEvent.RESIZE_END, this));
				}
			} else if (windowState == BBBWindow.NORMAL && draggable && !event.ctrlKey && event.shiftKey && !event.altKey) {
				switch (event.keyCode) {
					case Keyboard.UP:
						dragAmountX = 0;
						break;
					case Keyboard.DOWN:
						dragAmountX = 0;
						dragAmountY *= -1;
						break;
					case Keyboard.RIGHT:
						dragAmountX *= -1;
						dragAmountY = 0;
						break;
					case Keyboard.LEFT:
						dragAmountY = 0;
						break;
					default:
						dragAmountX = 0;
						dragAmountY = 0;
				}
				
				if (dragAmountX != 0 || dragAmountY != 0) // only move if an arrow key was pressed
				{
					if (windowManager.enforceBoundaries) {
						x = Math.max(0, Math.min(parent.width - this.width, this.x - dragAmountX));
						y = Math.max(0, Math.min(parent.height - this.height, this.y - dragAmountY));
					} else {
						x = this.x - dragAmountX;
						y = this.y - dragAmountY;
					}
					dispatchEvent(new BBBWindowEvent(BBBWindowEvent.DRAG_END, this));
				}
			}
		}
	}
}
