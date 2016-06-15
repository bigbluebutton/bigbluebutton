
	////////////////////////////////////////////////////////////////////////////////
	//
	//  Licensed to the Apache Software Foundation (ASF) under one or more
	//  contributor license agreements.  See the NOTICE file distributed with
	//  this work for additional information regarding copyright ownership.
	//  The ASF licenses this file to You under the Apache License, Version 2.0
	//  (the "License"); you may not use this file except in compliance with
	//  the License.  You may obtain a copy of the License at
	//
	//      http://www.apache.org/licenses/LICENSE-2.0
	//
	//  Unless required by applicable law or agreed to in writing, software
	//  distributed under the License is distributed on an "AS IS" BASIS,
	//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	//  See the License for the specific language governing permissions and
	//  limitations under the License.
	//
	////////////////////////////////////////////////////////////////////////////////
	
package org.bigbluebutton.modules.caption.views
{
	
	import flash.accessibility.AccessibilityProperties;
	import flash.display.DisplayObject;
	import flash.events.Event;
	import flash.events.FocusEvent;
	import flash.events.IOErrorEvent;
	import flash.events.MouseEvent;
	import flash.events.TextEvent;
	import flash.system.IME;
	import flash.system.IMEConversionMode;
	import flash.text.StyleSheet;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;
	import flash.text.TextLineMetrics;
	
	import mx.controls.listClasses.BaseListData;
	import mx.controls.listClasses.IDropInListItemRenderer;
	import mx.controls.listClasses.IListItemRenderer;
	import mx.core.EdgeMetrics;
	import mx.core.IDataRenderer;
	import mx.core.IFlexModuleFactory;
	import mx.core.IFontContextComponent;
	import mx.core.IIMESupport;
	import mx.core.IInvalidating;
	import mx.core.IUITextField;
	import mx.core.ScrollControlBase;
	import mx.core.ScrollPolicy;
	import mx.core.UITextField;
	import mx.core.mx_internal;
	import mx.events.FlexEvent;
	import mx.events.ScrollEvent;
	import mx.events.ScrollEventDetail;
	import mx.events.ScrollEventDirection;
	import mx.managers.IFocusManager;
	import mx.managers.IFocusManagerComponent;
	import mx.managers.ISystemManager;
	import mx.managers.SystemManager;
	
	use namespace mx_internal;
	
	//--------------------------------------
	//  Events
	//--------------------------------------
	
	/**
	 *  Dispatched when text in the TextArea control changes
	 *  through user input.
	 *  This event does not occur if you use data binding or 
	 *  ActionScript code to change the text.
	 *
	 *  <p>Even though the default value of the <code>Event.bubbles</code> property 
	 *  is <code>true</code>, this control dispatches the event with 
	 *  the <code>Event.bubbles</code> property set to <code>false</code>.</p>
	 *
	 *  @eventType flash.events.Event.CHANGE
	 *  
	 *  @langversion 3.0
	 *  @playerversion Flash 9
	 *  @playerversion AIR 1.1
	 *  @productversion Flex 3
	 */
	[Event(name="change", type="flash.events.Event")]
	
	/**
	 *  Dispatched when the <code>data</code> property changes.
	 *
	 *  <p>When you use a component as an item renderer,
	 *  the <code>data</code> property contains the data to display.
	 *  You can listen for this event and update the component
	 *  when the <code>data</code> property changes.</p>
	 *
	 *  @eventType mx.events.FlexEvent.DATA_CHANGE
	 *  
	 *  @langversion 3.0
	 *  @playerversion Flash 9
	 *  @playerversion AIR 1.1
	 *  @productversion Flex 3
	 */
	[Event(name="dataChange", type="mx.events.FlexEvent")]
	
	/** 
	 *  Dispatched when a user clicks a hyperlink in text defined by the
	 *  <code>htmlText</code> property, where the URL begins with <code>"event:"</code>. 
	 *  The remainder of the URL after 
	 *  <code>"event:"</code> is placed in the text property of the <code>link</code> event object.
	 *
	 *  <p>When you handle the <code>link</code> event, the hyperlink is not automatically executed; 
	 *  you need to execute the hyperlink from within your event handler. 
	 *  You typically use the <code>navigateToURL()</code> method to execute the hyperlink.
	 *  This allows you to modify the hyperlink, or even prohibit it from occurring, 
	 *  in your application. </p>
	 *
	 *  @eventType flash.events.TextEvent.LINK
	 *  
	 *  @langversion 3.0
	 *  @playerversion Flash 9
	 *  @playerversion AIR 1.1
	 *  @productversion Flex 3
	 */
	[Event(name="link", type="flash.events.TextEvent")]
	
	/**
	 *  Dispatched when the user types, deletes, or pastes text into the control.
	 *  No event is dispatched when the user presses the Delete key, or Backspace key.
	 *
	 *  <p>Even though the default value of the <code>TextEvent.bubbles</code> property 
	 *  is <code>true</code>, this control dispatches the event with 
	 *  the <code>TextEvent.bubbles</code> property set to <code>false</code>.</p>
	 *
	 *  @eventType flash.events.TextEvent.TEXT_INPUT
	 *  
	 *  @langversion 3.0
	 *  @playerversion Flash 9
	 *  @playerversion AIR 1.1
	 *  @productversion Flex 3
	 */
	[Event(name="textInput", type="flash.events.TextEvent")]
	
	//--------------------------------------
	//  Styles
	//--------------------------------------
	
	/**
	 *  Number of pixels between the component's left border
	 *  and the left edge of its content area.
	 *  <p>The default value is 0.</p>
	 *  <p>The default value for a Button control in the Halo theme is 10
	 *     and in the Spark theme is 6.</p>
	 *  <p>The default value for the ComboBox control is 5.</p>
	 *  <p>The default value for the Form container is 16.</p>
	 *  <p>The default value for the Tree control is 2.</p>
	 *  
	 *  @langversion 3.0
	 *  @playerversion Flash 9
	 *  @playerversion AIR 1.1
	 *  @productversion Flex 3
	 */
	[Style(name="paddingLeft", type="Number", format="Length", inherit="no")]
	
	/**
	 *  Number of pixels between the component's right border
	 *  and the right edge of its content area.
	 *  <p>The default value is 0.</p>
	 *  <p>The default value for a Button control in the Halo theme is 10
	 *     and in the Spark theme is 6.</p>
	 *  <p>The default value for the ComboBox control is 5.</p>
	 *  <p>The default value for the Form container is 16.</p>
	 *  
	 *  @langversion 3.0
	 *  @playerversion Flash 9
	 *  @playerversion AIR 1.1
	 *  @productversion Flex 3
	 */
	[Style(name="paddingRight", type="Number", format="Length", inherit="no")]
	
	/**
	 *  Number of pixels between the component's bottom border
	 *  and the bottom edge of its content area.
	 *
	 *  @default 0
	 *  
	 *  @langversion 3.0
	 *  @playerversion Flash 9
	 *  @playerversion AIR 1.1
	 *  @productversion Flex 3
	 */
	[Style(name="paddingBottom", type="Number", format="Length", inherit="no")]
	
	/**
	 *  Number of pixels between the component's top border
	 *  and the top edge of its content area.
	 *  
	 *  @default 0
	 *  
	 *  @langversion 3.0
	 *  @playerversion Flash 9
	 *  @playerversion AIR 1.1
	 *  @productversion Flex 3
	 */
	[Style(name="paddingTop", type="Number", format="Length", inherit="no")]
	
	/**
	 *  Color of the component if it is disabled.
	 * 
	 *  @default 0xAAB3B3
	 *  
	 *  @langversion 3.0
	 *  @playerversion Flash 9
	 *  @playerversion AIR 1.1
	 *  @productversion Flex 3
	 */
	[Style(name="disabledColor", type="uint", format="Color", inherit="yes")]
	
	//--------------------------------------
	//  Excluded APIs
	//--------------------------------------
	
	[Exclude(name="maxHorizontalScrollPosition", kind="property")]
	[Exclude(name="maxVerticalScrollPosition", kind="property")]
	
	//--------------------------------------
	//  Other metadata
	//--------------------------------------
	
	[DataBindingInfo("editEvents", "&quot;focusIn;focusOut&quot;")]
	
	[DefaultBindingProperty(source="text", destination="text")]
	
	[DefaultTriggerEvent("change")]
	
	[IconFile("TextArea.png")]
	
	[ResourceBundle("controls")]
	
	[Alternative(replacement="spark.components.TextArea", since="4.0")]
	
	/**
	 *  The TextArea control is a multiline text field
	 *  with a border and optional scroll bars.
	 *  The TextArea control supports the HTML rendering capabilities
	 *  of Flash Player and AIR.
	 *
	 *  <p>If you disable a TextArea control, it displays its contents in the
	 *  color specified by the <code>disabledColor</code> style.
	 *  You can also set a TextArea control to read-only
	 *  to disallow editing of the text.
	 *  To conceal input text by displaying characters as asterisks,
	 *  set the TextArea's <code>displayAsPassword</code> property.</p>
	 *
	 *  <p>The TextArea control has the following default sizing characteristics:</p>
	 *     <table class="innertable">
	 *        <tr>
	 *           <th>Characteristic</th>
	 *           <th>Description</th>
	 *        </tr>
	 *        <tr>
	 *           <td>Default size</td>
	 *           <td>width: 160 pixels; height: 44 pixels</td>
	 *        </tr>
	 *        <tr>
	 *           <td>Minimum size</td>
	 *           <td>0 pixels</td>
	 *        </tr>
	 *        <tr>
	 *           <td>Maximum size</td>
	 *           <td>10000 by 10000 pixels</td>
	 *        </tr>
	 *     </table>
	 *
	 *  @mxml
	 *
	 *  <p>The <code>&lt;mx:TextArea&gt;</code> tag inherits the attributes
	 *  of its superclass and adds the following attributes:</p>
	 *
	 *  <pre>
	 *  &lt;mx:TextArea
	 *    <b>Properties</b>
	 *    condenseWhite="false|true"
	 *    data="undefined"
	 *    displayAsPassword="false|true"
	 *    editable="true|false"
	 *    horizontalScrollPolicy="auto|on|off"
	 *    horizontalScrollPosition="0"
	 *    htmlText="null"
	 *    imeMode="null"
	 *    length="0"
	 *    listData="null"
	 *    maxChars="0"
	 *    restrict="null"
	 *    selectionBeginIndex="0"
	 *    selectionEndIndex="0"
	 *    styleSheet="null"
	 *    text=""
	 *    textHeight="<i>height of text</i>" [read-only]
	 *    textWidth="<i>width of text</i>" [read-only]
	 *    verticalScrollPolicy="auto|on|off"
	 *    verticalScrollPosition="0"
	 *    wordWrap="true|false"
	 *    &nbsp;
	 *    <b>Styles</b>
	 *    disabledColor="0xAAB3B3"
	 *    focusAlpha="0.5"
	 *    focusRoundedCorners"tl tr bl br"
	 *    paddingLeft="0""
	 *    paddingRight="0""
	 *    &nbsp;
	 *    <b>Events</b>
	 *    change="<i>No default</i>"
	 *  /&gt;
	 *  </pre>
	 *
	 *  @see mx.controls.Label
	 *  @see mx.controls.Text
	 *  @see mx.controls.TextInput
	 *  @see mx.controls.RichTextEditor
	 *  @see mx.controls.textClasses.TextRange
	 *
	 *  @includeExample examples/TextAreaExample.mxml
	 *
	 *  
	 *  @langversion 3.0
	 *  @playerversion Flash 9
	 *  @playerversion AIR 1.1
	 *  @productversion Flex 3
	 */
	public class CustomTextArea extends ScrollControlBase
		implements IDataRenderer, IDropInListItemRenderer,
		IFocusManagerComponent, IIMESupport, IListItemRenderer,
		IFontContextComponent
		
	{
		
		/**
		 *  @private
		 *  Version string for this class.
		 */
		
		mx_internal static const VERSION:String = "4.14.1.0";
		
		//--------------------------------------------------------------------------
		//
		//  Constructor
		//
		//--------------------------------------------------------------------------
		
		/**
		 *  Constructor.
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function CustomTextArea()
		{
			super();
			
			// ScrollControlBase variables.
			_horizontalScrollPolicy = ScrollPolicy.AUTO;
			_verticalScrollPolicy = ScrollPolicy.AUTO;
		}
		
		//--------------------------------------------------------------------------
		//
		//  Variables
		//
		//--------------------------------------------------------------------------
		
		/**
		 *  @private
		 *  Flag that indicates whether scroll Events should be dispatched
		 */
		private var allowScrollEvent:Boolean = true;
		
		/**
		 *  @private
		 *  Flag that will block default data/listData behavior.
		 */
		private var textSet:Boolean;
		
		/**
		 *  @private
		 */    
		private var _selectionChanged:Boolean = false;
		
		private function get selectionChanged():Boolean {
			return _selectionChanged;
		}
		
		private function set selectionChanged(sc:Boolean):void {
			trace("*********** the selectionChanged is being modified ************");
			_selectionChanged = sc;
		}
		
		/**
		 *  @private
		 */    
		private var errorCaught:Boolean = false;
		
		//--------------------------------------------------------------------------
		//
		//  Overridden properties
		//
		//--------------------------------------------------------------------------
		
		//----------------------------------
		//  accessibilityProperties
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the accessibilityProperties property.
		 */
		private var _accessibilityProperties:AccessibilityProperties;
		
		/**
		 *  @private
		 */
		private var accessibilityPropertiesChanged:Boolean = false;
		
		/**
		 *  @private
		 *  Accessibility data.
		 *
		 *  @tiptext
		 *  @helpid 3185
		 */
		override public function get accessibilityProperties():
			AccessibilityProperties
		{
			return _accessibilityProperties;
		}
		
		/**
		 *  @private
		 */
		override public function set accessibilityProperties(
			value:AccessibilityProperties):void
		{
			if (value == _accessibilityProperties)
				return;
			
			_accessibilityProperties = value;
			accessibilityPropertiesChanged = true;
			
			invalidateProperties();
		}
		
		//----------------------------------
		//  baselinePosition
		//----------------------------------
		
		/**
		 *  @private
		 *  The baselinePosition of a TextArea is calculated for its textField.
		 */
		override public function get baselinePosition():Number
		{
			if (!validateBaselinePosition())
				return NaN;
			
			return textField.y + textField.baselinePosition;
		}
		
		//----------------------------------
		//  enabled
		//----------------------------------
		
		/**
		 *  @private
		 */
		private var enabledChanged:Boolean = false;
		
		[Inspectable(category="General", enumeration="true,false", defaultValue="true")]
		
		/**
		 *  @private
		 *  Disable scrollbars and text field if we're disabled.
		 */
		override public function set enabled(value:Boolean):void
		{
			if (value == enabled)
				return;
			
			super.enabled = value;
			enabledChanged = true;
			
			if (verticalScrollBar)
				verticalScrollBar.enabled = value;
			
			if (horizontalScrollBar)
				horizontalScrollBar.enabled = value;
			
			invalidateProperties();
			
			if (border && border is IInvalidating)
				IInvalidating(border).invalidateDisplayList();
		}
		
		//----------------------------------
		//  fontContext
		//----------------------------------
		
		/**
		 *  @private
		 */
		public function get fontContext():IFlexModuleFactory
		{
			return moduleFactory;
		}
		
		/**
		 *  @private
		 */
		public function set fontContext(moduleFactory:IFlexModuleFactory):void
		{
			this.moduleFactory = moduleFactory;
		}
		
		//----------------------------------
		//  horizontalScrollPosition
		//----------------------------------
		
		/**
		 *  @private
		 *  Position of the horizontal scrollbar.
		 */
		private var _hScrollPosition:Number;
		
		[Bindable("scroll")]
		[Bindable("viewChanged")]
		[Inspectable(defaultValue="0")]
		
		/**
		 *  Pixel position in the content area of the leftmost pixel
		 *  that is currently displayed. 
		 *  (The content area includes all contents of a control, not just 
		 *  the portion that is currently displayed.)
		 *  This property is always set to 0, and ignores changes,
		 *  if <code>wordWrap</code> is set to <code>true</code>.
		 * 
		 *  @default 0
		 *
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		override public function set horizontalScrollPosition(value:Number):void
		{
			// Dispatch viewChanged event in ScrollControlBase super/
			super.horizontalScrollPosition = value;
			
			// Set _hScrollPosition since it is compared against everytime
			// in updateDisplayList().    
			_hScrollPosition = value;
			
			if (textField)
			{
				textField.scrollH = value;
				// This works around a player bug.
				textField.background = false;
			}
			else
			{
				invalidateProperties();
			}
		}
		
		//----------------------------------
		//  horizontalScrollPolicy
		//----------------------------------
		
		[Inspectable(enumeration="off,on,auto", defaultValue="auto")]
		
		/**
		 *  Specifies whether the horizontal scroll bar is
		 *  always on (<code>ScrollPolicy.ON</code>),
		 *  always off (<code>ScrollPolicy.OFF</code>),
		 *  or turns on when needed (<code>ScrollPolicy.AUTO</code>).
		 *
		 *  @default ScrollPolicy.AUTO
		 * 
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		override public function get horizontalScrollPolicy():String
		{
			return height <= 40 ? ScrollPolicy.OFF :  _horizontalScrollPolicy;
		}
		
		//----------------------------------
		//  maxHorizontalScrollPosition
		//----------------------------------
		
		/**
		 *  Maximum value of <code>horizontalScrollPosition</code>.
		 *  <p>The default value is 0, which means that horizontal scrolling is not 
		 *  required.</p>
		 *  This property is always set to 0
		 *  if <code>wordWrap</code> is set to <code>true</code>.
		 * 
		 *  <p>The value of the <code>maxHorizontalScrollPosition</code> property is
		 *  computed from the data and size of component, and must not be set by
		 *  the application code.</p>
		 * 
		 *  @default 0
		 *
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		override public function get maxHorizontalScrollPosition():Number
		{
			return textField ? textField.maxScrollH : 0;
		}
		
		//----------------------------------
		//  maxVerticalScrollPosition
		//----------------------------------
		
		/**
		 *  Maximum value of <code>verticalScrollPosition</code>.
		 *  The default value is 0, which means that vertical scrolling is not 
		 *  required.
		 *
		 *  <p>The value of the <code>maxVerticalScrollPosition</code> property is
		 *  computed from the data and size of component, and must not be set by
		 *  the application code.</p>
		 * 
		 *  @tiptext The maximum pixel offset into the content from the top edge
		 *  @helpid 3182
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		override public function get maxVerticalScrollPosition():Number
		{
			return textField ? textField.maxScrollV - 1 : 0;
		}
		
		//----------------------------------
		//  tabIndex
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the tabIndex property.
		 */
		private var _tabIndex:int = -1;
		
		/**
		 *  @private
		 */
		private var tabIndexChanged:Boolean = false;
		
		/**
		 *  @private
		 *  Tab order in which the control receives the focus when navigating
		 *  with the Tab key.
		 *
		 *  @default -1
		 *  @tiptext tabIndex of the component
		 *  @helpid 3184
		 */
		override public function get tabIndex():int
		{
			return _tabIndex;
		}
		
		/**
		 *  @private
		 */
		override public function set tabIndex(value:int):void
		{
			if (value == _tabIndex)
				return;
			
			_tabIndex = value;
			tabIndexChanged = true;
			
			invalidateProperties();
		}
		
		//----------------------------------
		//  textField
		//----------------------------------
		
		/**
		 *  The internal UITextField that renders the text of this TextArea.
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		protected var textField:IUITextField;
		
		//----------------------------------
		//  verticalScrollPosition
		//----------------------------------
		
		/**
		 *  @private
		 *  Position of the vertical scrollbar.
		 */
		private var _vScrollPosition:Number;
		
		[Bindable("scroll")]
		[Bindable("viewChanged")]
		[Inspectable(defaultValue="0")]
		
		/**
		 *  Line number of the top row of characters that is currently displayed.
		 *  The default value is 0.
		 *
		 *  @tiptext The pixel offset into the content from the top edge
		 *  @helpid 3181
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		override public function set verticalScrollPosition(value:Number):void
		{
			// Dispatch viewChanged event in ScrollControlBase super.
			super.verticalScrollPosition = value;
			
			// Set scrollV since it is compared against everytime
			// in updateDisplayList().
			_vScrollPosition = value;
			
			if (textField)
			{
				textField.scrollV = value + 1;
				// This works around a player bug.
				textField.background = false;
			}
			else
			{
				invalidateProperties();
			}
		}
		
		//----------------------------------
		//  verticalScrollPolicy
		//----------------------------------
		
		[Inspectable(enumeration="off,on,auto", defaultValue="auto")]
		
		/**
		 *  Whether the vertical scroll bar is
		 *  always on (<code>ScrollPolicy.ON</code>),
		 *  always off (<code>ScrollPolicy.OFF</code>),
		 *  or turns on when needed (<code>ScrollPolicy.AUTO</code>).
		 *
		 *  @default ScrollPolicy.AUTO
		 *  @tiptext Specifies if vertical scrollbar is on, off,
		 *  or automatically adjusts
		 *  @helpid 3428
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		override public function get verticalScrollPolicy():String
		{
			return height <= 40 ? ScrollPolicy.OFF : _verticalScrollPolicy;
		}
		
		//--------------------------------------------------------------------------
		//
		//  Properties
		//
		//--------------------------------------------------------------------------
		
		//----------------------------------
		//  condenseWhite
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the condenseWhite property.
		 */
		private var _condenseWhite:Boolean = false;
		
		/**
		 *  @private
		 */
		private var condenseWhiteChanged:Boolean = false;
		
		[Bindable("condenseWhiteChanged")]
		[Inspectable(category="General", defaultValue="")]
		
		/**
		 *  Specifies whether extra white space (spaces, line breaks,
		 *  and so on) should be removed in a TextArea control with HTML text.
		 *  
		 *  <p>The <code>condenseWhite</code> property only affects text set with
		 *  the <code>htmlText</code> property, not the <code>text</code> property.
		 *  If you set text with the <code>text</code> property,
		 *  <code>condenseWhite</code> is ignored.</p>
		 *
		 *  <p>If you set the <code>condenseWhite</code> property to <code>true</code>,
		 *  you must use standard HTML commands such as <code>&lt;br&gt;</code>
		 *  and <code>&lt;p&gt;</code> to place line breaks in the text field.</p>
		 *
		 *  @default false
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get condenseWhite():Boolean
		{
			return _condenseWhite;
		}
		
		/**
		 *  @private
		 */
		public function set condenseWhite(value:Boolean):void
		{
			if (value == _condenseWhite)
				return;
			
			_condenseWhite = value;
			condenseWhiteChanged = true;
			
			// Changing the condenseWhite property needs to trigger
			// the same response as changing the htmlText property
			// if this TextArea is displaying HTML.
			if (isHTML)
				htmlTextChanged = true;         
			
			invalidateProperties();
			invalidateSize();
			invalidateDisplayList();
			
			dispatchEvent(new Event("condenseWhiteChanged"));
		}
		
		//----------------------------------
		//  data
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the data property.
		 */
		private var _data:Object;
		
		[Bindable("dataChange")]
		[Inspectable(environment="none")]
		
		/**
		 *  Lets you pass a value to the component
		 *  when you use it in an item renderer or item editor.
		 *  You typically use data binding to bind a field of the <code>data</code>
		 *  property to a property of this component.
		 *
		 *  <p>When you use the control as a drop-in item renderer or drop-in
		 *  item editor, Flex automatically writes the current value of the item
		 *  to the <code>text</code> property of this control.</p>
		 *
		 *  <p>You do not set this property in MXML.</p>
		 *
		 *  @default null
		 *  @see mx.core.IDataRenderer
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get data():Object
		{
			return _data;
		}
		
		/**
		 *  @private
		 */
		public function set data(value:Object):void
		{
			var newText:*;
			
			_data = value;
			
			if (_listData)
			{
				newText = _listData.label;
			}
			else if (_data != null)
			{
				if (_data is String)
					newText = String(_data);
				else
					newText = _data.toString();
			}
			
			if (newText !== undefined && !textSet)
			{
				text = newText;
				textSet = false;
			}
			
			dispatchEvent(new FlexEvent(FlexEvent.DATA_CHANGE));
		}
		
		//----------------------------------
		//  displayAsPassword
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the displayAsPassword proeprty.
		 */
		private var _displayAsPassword:Boolean = false;
		
		/**
		 *  @private
		 */
		private var displayAsPasswordChanged:Boolean = false;
		
		[Bindable("displayAsPasswordChanged")]
		[Inspectable(category="General", defaultValue="false")]
		
		/**
		 *  Indicates whether this control is used for entering passwords.
		 *  If <code>true</code>, the field does not display entered text,
		 *  instead, each text character entered into the control
		 *  appears as the  character "&#42;".
		 *
		 *  @default false
		 * 
		 *  @tiptext Specifies whether to display '*'
		 *  instead of the actual characters
		 *  @helpid 3177
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get displayAsPassword():Boolean
		{
			return _displayAsPassword;
		}
		
		/**
		 *  @private
		 */
		public function set displayAsPassword(value:Boolean):void
		{
			if (value == _displayAsPassword)
				return;
			
			_displayAsPassword = value;
			displayAsPasswordChanged = true;
			
			invalidateProperties();
			invalidateSize();
			invalidateDisplayList();
			
			dispatchEvent(new Event("displayAsPasswordChanged"));
		}
		
		//----------------------------------
		//  editable
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the editable property.
		 */
		private var _editable:Boolean = true;
		
		/**
		 *  @private
		 */
		private var editableChanged:Boolean = false;
		
		[Bindable("editableChanged")]
		[Inspectable(category="General", defaultValue="true")]
		
		/**
		 *  Indicates whether the user is allowed to edit the text in this control.
		 *  If <code>true</code>, the user can edit the text.
		 *
		 *  @default true;
		 * 
		 *  @tiptext Specifies whether the component is editable or not
		 *  @helpid 3176
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get editable():Boolean
		{
			return _editable;
		}
		
		/**
		 *  @private
		 */
		public function set editable(value:Boolean):void
		{
			if (value == _editable)
				return;
			
			_editable = value;
			editableChanged = true;
			
			invalidateProperties();
			
			dispatchEvent(new Event("editableChanged"));
		}
		
		//----------------------------------
		//  enableIME
		//----------------------------------
		
		/**
		 *  A flag that indicates whether the IME should
		 *  be enabled when the component receives focus.
		 *
		 *  @langversion 3.0
		 *  @playerversion Flash 10
		 *  @playerversion AIR 1.5
		 *  @productversion Flex 4
		 */
		public function get enableIME():Boolean
		{
			return editable;
		}
		
		//----------------------------------
		//  htmlText
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the htmlText property.
		 *  In addition to being set in the htmlText setter,
		 *  it is automatically updated at two other times.
		 *  1. When the 'text' or 'htmlText' is pushed down into
		 *  the textField in commitProperties(), this causes
		 *  the textField to update its own 'htmlText'.
		 *  Therefore in commitProperties() we reset this storage var
		 *  to be in sync with the textField.
		 *  2. When the TextFormat of the textField changes
		 *  because a CSS style has changed (see validateNow()
		 *  in UITextField), the textField also updates its own 'htmlText'.
		 *  Therefore in textField_textFieldStyleChangeHandler()
		 */
		private var _htmlText:String = "";
		
		/**
		 *  @private
		 */
		private var htmlTextChanged:Boolean = false;
		
		/**
		 *  @private
		 *  The last value of htmlText that was set.
		 *  We have to keep track of this because when you set the htmlText
		 *  of a TextField and read it back, you don't get what you set.
		 *  In general it will have additional HTML markup corresponding
		 *  to the defaultTextFormat set from the CSS styles.
		 *  If this var is null, it means that 'text' rather than 'htmlText'
		 *  was last set.
		 */
		private var explicitHTMLText:String = null; 
		
		[Bindable("htmlTextChanged")]
		[CollapseWhiteSpace]
		[Inspectable(category="General", defaultValue="")]
		[NonCommittingChangeEvent("change")]
		
		/**
		 *  Specifies the text displayed by the TextArea control, including HTML markup that
		 *  expresses the styles of that text.  
		 *  When you specify HTML text in this property, you can use the subset of HTML 
		 *  tags that is supported by the Flash TextField control.
		 * 
		 *  <p>When you set this property, the HTML markup is applied
		 *  after the CSS styles for the TextArea instance are applied.
		 *  When you get this property, the HTML markup includes
		 *  the CSS styles.</p>
		 *  
		 *  <p>For example, if you set this to be a string such as,
		 *  <code>"This is an example of &lt;b&gt;bold&lt;/b&gt; markup"</code>,
		 *  the text "This is an example of <b>bold</b> markup" appears
		 *  in the TextArea with whatever CSS styles normally apply.
		 *  Also, the word "bold" appears in boldface font because of the
		 *  <code>&lt;b&gt;</code> markup.</p>
		 *
		 *  <p>HTML markup uses characters such as &lt; and &gt;,
		 *  which have special meaning in XML (and therefore in MXML). So,  
		 *  code such as the following does not compile:</p>
		 *  
		 *  <pre>
		 *  &lt;mx:TextArea htmlText="This is an example of &lt;b&gt;bold&lt;/b&gt; markup"/&gt;
		 *  </pre>
		 *  
		 *  <p>There are three ways around this problem.</p>
		 *  
		 *  <ul>
		 *  
		 *  <li>
		 *  
		 *  <p>Set the <code>htmlText</code> property in an ActionScript method called as 
		 *  an <code>initialize</code> handler:</p>
		 *  
		 *  <pre>
		 *  &lt;mx:TextArea id="myTextArea" initialize="myTextArea_initialize()"/&gt;
		 *  </pre>
		 *  
		 *  <p>where the <code>myTextArea_initialize</code> method is in a script CDATA section:</p>
		 *  
		 *  <pre>
		 *  &lt;fx:Script&gt;
		 *  &lt;![CDATA[
		 *  private function myTextArea_initialize():void {
		 *      myTextArea.htmlText = "This is an example of &lt;b&gt;bold&lt;/b&gt; markup";
		 *  }
		 *  ]]&gt;
		 *  &lt;/fx:Script&gt;
		 *  
		 *  </pre>
		 *  
		 *  <p>This is the simplest approach because the HTML markup
		 *  remains easily readable.
		 *  Notice that you must assign an <code>id</code> to the TextArea
		 *  so you can refer to it in the <code>initialize</code>
		 *  handler.</p>
		 *  
		 *  </li>
		 *  
		 *  <li>
		 *  
		 *  <p>Specify the <code>htmlText</code> property by using a child tag
		 *  with a CDATA section. A CDATA section in XML contains character data
		 *  where characters like &lt; and &gt; aren't given a special meaning.</p>
		 *  
		 *  <pre>
		 *  &lt;mx:TextArea&gt;
		 *      &lt;mx:htmlText&gt;&lt;![CDATA[This is an example of &lt;b&gt;bold&lt;/b&gt; markup]]&gt;&lt;/mx:htmlText&gt;
		 *  &lt;mx:TextArea/&gt;
		 *  </pre>
		 *  
		 *  <p>You must write the <code>htmlText</code> property as a child tag
		 *  rather than as an attribute on the <code>&lt;mx:TextArea&gt;</code> tag
		 *  because XML doesn't allow CDATA for the value of an attribute.
		 *  Notice that the markup is readable, but the CDATA section makes 
		 *  this approach more complicated.</p>
		 *  
		 *  </li>
		 *  
		 *  <li>
		 *  
		 *  <p>Use an <code>hmtlText</code> attribute where any occurences
		 *  of the HTML markup characters &lt; and &gt; in the attribute value
		 *  are written instead of the XML "entities" <code>&amp;lt;</code>
		 *  and <code>&amp;gt;</code>:</p>
		 *  
		 *  <pre>
		 *  &lt;mx:TextArea htmlText="This is an example of &amp;lt;b&amp;gt;bold&amp;lt;/b&amp;gt; markup"/&amp;gt;
		 *  </pre>
		 *  
		 *  Adobe does not recommend this approach because the HTML markup becomes
		 *  nearly impossible to read.
		 *  
		 *  </li>
		 *  
		 *  </ul>
		 *  
		 *  <p>If the <code>condenseWhite</code> property is <code>true</code> 
		 *  when you set the <code>htmlText</code> property, multiple
		 *  white-space characters are condensed, as in HTML-based browsers;
		 *  for example, three consecutive spaces are displayed
		 *  as a single space.
		 *  The default value for <code>condenseWhite</code> is
		 *  <code>false</code>, so you must set <code>condenseWhite</code>
		 *  to <code>true</code> to collapse the white space.</p>
		 *  
		 *  <p>If you read back the <code>htmlText</code> property quickly
		 *  after setting it, you get the same string that you set.
		 *  However, after the LayoutManager runs, the value changes
		 *  to include additional markup that includes the CSS styles.</p>
		 *  
		 *  <p>Setting the <code>htmlText</code> property affects the <code>text</code>
		 *  property in several ways. 
		 *  If you read the <code>text</code> property quickly after setting
		 *  the <code>htmlText</code> property, you get <code>null</code>,
		 *  which indicates that the <code>text</code> corresponding to the new
		 *  <code>htmlText</code> has not yet been determined.
		 *  However, after the LayoutManager runs, the <code>text</code> property 
		 *  value changes to the <code>htmlText</code> string with all the 
		 *  HTML markup removed; that is,
		 *  the value is the characters that the TextArea actually displays.</p>
		 *   
		 *  <p>Conversely, if you set the <code>text</code> property,
		 *  any previously set <code>htmlText</code> is irrelevant.
		 *  If you read the <code>htmlText</code> property quickly after setting
		 *  the <code>text</code> property, you get <code>null</code>,
		 *  which indicates that the <code>htmlText</code> that corresponds to the new
		 *  <code>text</code> has not yet been determined.
		 *  However, after the LayoutManager runs, the <code>htmlText</code> property 
		 *  value changes to the new text plus the HTML markup for the CSS styles.</p>
		 *
		 *  <p>To make the LayoutManager run immediately, you can call the
		 *  <code>validateNow()</code> method on the TextArea.
		 *  For example, you could set some <code>htmlText</code>,
		 *  call the <code>validateNow()</code> method, and immediately
		 *  obtain the corresponding <code>text</code> that doesn't have
		 *  the HTML markup.</p>
		 *  
		 *  <p>If you set both <code>text</code> and <code>htmlText</code> properties 
		 *  in ActionScript, whichever is set last takes effect.
		 *  Do not set both in MXML, because MXML does not guarantee that
		 *  the properties of an instance get set in any particular order.</p>
		 *  
		 *  <p>Setting either <code>text</code> or <code>htmlText</code> property
		 *  inside a loop is a fast operation, because the underlying TextField
		 *  that actually renders the text is not updated until
		 *  the LayoutManager runs.</p>
		 *
		 *  <p>If you try to set this property to <code>null</code>,
		 *  it is set, instead, to the empty string.
		 *  If the property temporarily has the value <code>null</code>,
		 *  it indicates that the <code>text</code> has been recently set
		 *  and the corresponding <code>htmlText</code>
		 *  has not yet been determined.</p>
		 *  
		 *  @default ""
		 * 
		 *  @see flash.text.TextField#htmlText
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get htmlText():String
		{
			return _htmlText;
		}
		
		/**
		 *  @private
		 */
		public function set htmlText(value:String):void
		{
			textSet = true;
			
			// The htmlText property can't be set to null,
			// only to the empty string, because if you set the htmlText
			// of a TextField to null it throws an RTE.
			// If the getter returns null, it means that 'text' was just set
			// and the value of 'htmlText' isn't yet known, because the 'text'
			// hasn't been committed into the textField and the 'htmlText'
			// hasn't yet been read back out of the textField.
			if (!value)
				value = "";
			
			_htmlText = value;
			htmlTextChanged = true;
			
			// The text property is unknown until commitProperties(),
			// when we push the htmlText into the TextField and it
			// calculates the text.
			// But you can call validateNow() to make this happen right away.
			_text = null;
			
			explicitHTMLText = value;
			
			invalidateProperties();
			invalidateSize();
			invalidateDisplayList();
			
			// Trigger bindings to htmlText.
			dispatchEvent(new Event("htmlTextChanged"));
			
			// commitProperties() will dispatch a "valueCommit" event
			// after the TextField determines the 'text' based on the
			// 'htmlText'; this event will trigger any bindings to 'text'.
		}
		
		//----------------------------------
		//  imeMode
		//----------------------------------
		
		/**
		 *  @private
		 */
		private var _imeMode:String = null;
		
		/**
		 *  Specifies the IME (input method editor) mode.
		 *  The IME enables users to enter text in Chinese, Japanese, and Korean.
		 *  Flex sets the specified IME mode when the control gets the focus,
		 *  and sets it back to the previous value when the control loses the focus.
		 *
		 *  <p>The flash.system.IMEConversionMode class defines constants for the
		 *  valid values for this property.
		 *  You can also specify <code>null</code> to specify no IME.</p>
		 *
		 *  @default null
		 * 
		 * @see flash.system.IMEConversionMode
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get imeMode():String
		{
			return _imeMode;
		}
		
		/**
		 *  @private
		 */
		public function set imeMode(value:String):void
		{
			_imeMode = value;
		}
		
		//----------------------------------
		//  isHTML
		//----------------------------------
		
		/**
		 *  @private
		 */
		private function get isHTML():Boolean
		{
			return explicitHTMLText != null;
		}
		
		//----------------------------------
		//  length
		//----------------------------------
		
		/**
		 *  The number of characters of text displayed in the TextArea.
		 *
		 *  @default 0
		 * 
		 *  @tiptext The number of characters in the TextArea
		 *  @helpid 3173
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get length():int
		{
			return text != null ? text.length : -1;
		}
		
		//----------------------------------
		//  listData
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the listData property.
		 */
		private var _listData:BaseListData;
		
		[Bindable("dataChange")]
		[Inspectable(environment="none")]
		
		/**
		 *  When a component is used as a drop-in item renderer or drop-in
		 *  item editor, Flex initializes the <code>listData</code> property
		 *  of the component with the appropriate data from the list control.
		 *  The component can then use the <code>listData</code> property
		 *  to initialize the <code>data</code> property of the drop-in
		 *  item renderer or drop-in item editor.
		 *
		 *  <p>You do not set this property in MXML or ActionScript;
		 *  Flex sets it when the component is used as a drop-in item renderer
		 *  or drop-in item editor.</p>
		 *
		 *  @default null
		 *  @see mx.controls.listClasses.IDropInListItemRenderer
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get listData():BaseListData
		{
			return _listData;
		}
		
		/**
		 *  @private
		 */
		public function set listData(value:BaseListData):void
		{
			_listData = value;
		}
		
		//----------------------------------
		//  maxChars
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the maxChars property.
		 */
		private var _maxChars:int = 0;
		
		/**
		 *  @private
		 */
		private var maxCharsChanged:Boolean = false;
		
		[Bindable("maxCharsChanged")]
		[Inspectable(category="General", defaultValue="0")]
		
		/**
		 *  Maximum number of characters that users can enter in the text field.
		 *  This property does not limit the length of text specified by the
		 *  setting the control's <code>text</code> or <code>htmlText</code>property.
		 * 
		 *  <p>The default value of 0, which indicates no limit.</p>
		 *
		 *  @tiptext The maximum number of characters that the TextArea can contain
		 *  @helpid 3172
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get maxChars():int
		{
			return _maxChars;
		}
		
		/**
		 *  @private
		 */
		public function set maxChars(value:int):void
		{
			if (value == _maxChars)
				return;
			
			_maxChars = value;
			maxCharsChanged = true;
			
			invalidateProperties();
			
			dispatchEvent(new Event("maxCharsChanged"));
		}
		
		//----------------------------------
		//  restrict
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the restrict property.
		 */
		private var _restrict:String = null;
		
		/**
		 *  @private
		 */
		private var restrictChanged:Boolean = false;
		
		[Bindable("restrictChanged")]
		[Inspectable(category="General")]
		
		/**
		 *  Indicates the set of characters that a user can enter into the control. 
		 *  If the value of the <code>restrict</code> property is <code>null</code>, 
		 *  you can enter any character. If the value of the <code>restrict</code> 
		 *  property is an empty string, you cannot enter any character.
		 *  This property only restricts user interaction; a script
		 *  can put any text into the text field. If the value of
		 *  the <code>restrict</code> property is a string of characters,
		 *  you may enter only characters in that string into the
		 *  text field.
		 *
		 *  <p>Flex scans the string from left to right. You can specify a range by 
		 *  using the hyphen (-) character.
		 *  If the string begins with a caret (^) character, all characters are 
		 *  initially accepted and succeeding characters in the string are excluded 
		 *  from the set of accepted characters. If the string does not begin with a 
		 *  caret (^) character, no characters are initially accepted and succeeding 
		 *  characters in the string are included in the set of accepted characters.</p>
		 *
		 *  <p>Because some characters have a special meaning when used
		 *  in the <code>restrict</code> property, you must use
		 *  backslash characters to specify the literal characters -, &#094;, and \.
		 *  When you use the <code>restrict</code> property as an attribute
		 *  in an MXML tag, use single backslashes, as in the following 
		 *  example: \&#094;\-\\.
		 *  When you set the <code>restrict</code> In and ActionScript expression,
		 *  use double backslashes, as in the following example: \\&#094;\\-\\\.</p>
		 *
		 *  @default null
		 * 
		 *  @see flash.text.TextField#restrict
		 * 
		 *  @tiptext The set of characters that may be entered into the TextArea
		 *  @helpid 3174
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get restrict():String
		{
			return _restrict;
		}
		
		/**
		 *  @private
		 */
		public function set restrict(value:String):void
		{
			if (value == _restrict)
				return;
			
			_restrict = value;
			restrictChanged = true;
			
			invalidateProperties();
			
			dispatchEvent(new Event("restrictChanged"));
		}
		
		//----------------------------------
		//  selectable
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for selectable property.
		 */
		private var _selectable:Boolean = true;
		
		/**
		 *  @private
		 *  Change flag for selectable property.
		 */
		private var selectableChanged:Boolean = false;
		
		[Inspectable(category="General", defaultValue="true")]
		
		/**
		 *  Specifies whether the text can be selected.
		 *  Making the text selectable lets you copy text from the control.
		 *
		 *  @default true
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get selectable():Boolean
		{
			return _selectable;
		}
		
		/**
		 *  @private
		 */
		public function set selectable(value:Boolean):void
		{
			if (value == selectable)
				return;
			
			_selectable = value;
			selectableChanged = true;
			
			invalidateProperties();
		}
		
		//----------------------------------
		//  selectionBeginIndex
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the selectionBeginIndex property.
		 */
		private var _selectionBeginIndex:int = 0;
		
		[Inspectable(defaultValue="0")]
		
		/**
		 *  The zero-based character index value of the first character
		 *  in the current selection.
		 *  For example, the first character is 0, the second character is 1,
		 *  and so on.
		 *  When the control gets the focus, the selection is visible if the 
		 *  <code>selectionBeginIndex</code> and <code>selectionEndIndex</code>
		 *  properties are both set.
		 *
		 *  @default 0
		 * 
		 *  @tiptext The zero-based index value of the first character
		 *  in the selection.
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get selectionBeginIndex():int
		{
			return textField ?
				textField.selectionBeginIndex :
				_selectionBeginIndex;
		}
		
		/**
		 *  @private
		 */
		public function set selectionBeginIndex(value:int):void
		{
			_selectionBeginIndex = value;
			selectionChanged = true;
			
			invalidateProperties();     
		}
		
		//----------------------------------
		//  selectionEndIndex
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the selectionEndIndex property.
		 */
		private var _selectionEndIndex:int = 0;
		
		[Inspectable(defaultValue="0")]
		
		/**
		 *  The zero-based index of the position <i>after</i>the last character
		 *  in the current selection (equivalent to the one-based index of the last
		 *  character).
		 *  If the last character in the selection, for example, is the fifth
		 *  character, this property has the value 5.
		 *  When the control gets the focus, the selection is visible if the 
		 *  <code>selectionBeginIndex</code> and <code>selectionEndIndex</code>
		 *  properties are both set.
		 *
		 *  @default 0
		 *
		 *  @tiptext The zero-based index value of the last character
		 *  in the selection.
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get selectionEndIndex():int
		{
			return textField ?
				textField.selectionEndIndex :
				_selectionEndIndex;
		}
		
		/**
		 *  @private
		 */
		public function set selectionEndIndex(value:int):void
		{
			_selectionEndIndex = value;
			selectionChanged = true;
			
			invalidateProperties();
		}
		
		//----------------------------------
		//  styleSheet
		//----------------------------------
		
		/**
		 *  @private
		 *  Change flag for the styleSheet property
		 */
		private var styleSheetChanged:Boolean = false;
		
		/**
		 *  @private
		 *  Storage for the styleSheet property.
		 */
		private var _styleSheet:StyleSheet;   
		
		/**
		 *  A flash.text.StyleSheet object that can perform rendering
		 *  on the TextArea control's text.
		 *  Used for detailed control of HTML styles for the text.
		 *  For more information, see the flash.text.StyleSheet
		 *  class documentation.
		 * 
		 *  @see flash.text.StyleSheet
		 *
		 *  @default null
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get styleSheet():StyleSheet
		{
			return _styleSheet;
		}
		
		/**
		 *  @private
		 */
		public function set styleSheet(value:StyleSheet):void
		{
			_styleSheet = value;
			styleSheetChanged = true;
			htmlTextChanged = true;
			
			invalidateProperties();
		}
		
		//----------------------------------
		//  text
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the text property.
		 *  In addition to being set in the 'text' setter,
		 *  it is automatically updated at another time:
		 *  When the 'text' or 'htmlText' is pushed down into
		 *  the textField in commitProperties(), this causes
		 *  the textField to update its own 'text'.
		 *  Therefore in commitProperties() we reset this storage var
		 *  to be in sync with the textField.
		 */
		private var _text:String = "";
		
		/**
		 *  @private
		 */
		private var textChanged:Boolean = false;
		
		[Bindable("textChanged")]
		[CollapseWhiteSpace]
		[Inspectable(category="General", defaultValue="")]
		[NonCommittingChangeEvent("change")]
		
		/**
		 *  Plain text that appears in the control.
		 *  Its appearance is determined by the CSS styles of this Label control.
		 *  
		 *  <p>Any HTML tags in the text string are ignored,
		 *  and appear as  entered in the string.  
		 *  To display text formatted using HTML tags,
		 *  use the <code>htmlText</code> property instead.
		 *  If you set the <code>htmlText</code> property,
		 *  the HTML replaces any text you had set using this propety, and the
		 *  <code>text</code> property returns a plain-text version of the
		 *  HTML text, with all HTML tags stripped out. 
		 *  For more information see the <code>htmlText</code> property.</p>
		 *
		 *  <p>To include the special characters left angle  bracket (&lt;),
		 *  right angle bracket (&gt;), or ampersand (&amp;) in the text,
		 *  wrap the text string in the CDATA tag.
		 *  Alternatively, you can use HTML character entities for the
		 *  special characters, for example, <code>&amp;lt;</code>.</p>
		 *
		 *  <p>If you try to set this property to <code>null</code>,
		 *  it is set, instead, to the empty string.
		 *  The <code>text</code> property can temporarily have the value <code>null</code>,
		 *  which indicates that the <code>htmlText</code> has been recently set
		 *  and the corresponding <code>text</code> value
		 *  has not yet been determined.</p>
		 *
		 *  @default ""
		 *  @tiptext Gets or sets the TextArea content
		 *  @helpid 3179
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get text():String
		{
			return _text;
		}
		
		/**
		 *  @private
		 */
		public function set text(value:String):void
		{
			textSet = true;
			
			// The text property can't be set to null, only to the empty string.
			// If the getter returns null, it means that 'htmlText' was just set
			// and the value of 'text' isn't yet known, because the 'htmlText'
			// hasn't been committed into the textField and the 'text'
			// hasn't yet been read back out of the textField.
			if (!value)
				value = "";
			
			if (!isHTML && value == _text)
				return;
			
			_text = value;
			textChanged = true;
			
			// The htmlText property is unknown until commitProperties(),
			// when we push the text into the TextField and it
			// calculates the htmlText.
			// But you can call validateNow() to make this happen right away.
			_htmlText = null;
			
			explicitHTMLText = null;
			
			invalidateProperties();
			invalidateSize();
			invalidateDisplayList();
			
			// Trigger bindings to 'text'.
			dispatchEvent(new Event("textChanged"));
			
			// commitProperties() will dispatch an "htmlTextChanged" event
			// after the TextField determines the 'htmlText' based on the
			// 'text'; this event will trigger any bindings to 'htmlText'.
			
			dispatchEvent(new FlexEvent(FlexEvent.VALUE_COMMIT));
		}
		
		//----------------------------------
		//  textHeight
		//----------------------------------
		
		/**
		 *  @private
		 */
		private var _textHeight:Number;
		
		/**
		 *  The height of the text.
		 *
		 *  <p>The value of the <code>textHeight</code> property is correct only
		 *  after the component has been validated.
		 *  If you set <code>text</code> and then immediately ask for the
		 *  <code>textHeight</code>, you might receive an incorrect value.
		 *  You should wait for the component to validate
		 *  or call the <code>validateNow()</code> method before you get the value.
		 *  This behavior differs from that of the flash.text.TextField control,
		 *  which updates the value immediately.</p>
		 *
		 *  @see flash.text.TextField
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get textHeight():Number
		{
			return _textHeight;
		}
		
		//----------------------------------
		//  textWidth
		//----------------------------------
		
		/**
		 *  @private
		 */
		private var _textWidth:Number;
		
		/**
		 *  The width of the text.
		 *
		 *  <p>The value of the <code>textWidth</code> property is correct only
		 *  after the component has been validated.
		 *  If you set <code>text</code> and then immediately ask for the
		 *  <code>textWidth</code>, you might receive an incorrect value.
		 *  You should wait for the component to validate
		 *  or call the <code>validateNow()</code> method before you get the value.
		 *  This behavior differs from that of the flash.text.TextField control,
		 *  which updates the value immediately.</p>
		 *
		 *  @see flash.text.TextField
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get textWidth():Number
		{
			return _textWidth;
		}
		
		//----------------------------------
		//  wordWrap
		//----------------------------------
		
		/**
		 *  @private
		 *  Storage for the wordWrap property.
		 */
		private var _wordWrap:Boolean = true;
		
		/**
		 *  @private
		 */
		private var wordWrapChanged:Boolean = false;
		
		[Bindable("wordWrapChanged")]
		[Inspectable(category="General", defaultValue="true")]
		
		/**
		 *  Indicates whether the text automatically wraps at the end of a line.
		 *  If <code>true</code>, the text wraps to occupy 
		 *  multiple lines, if necessary.
		 *
		 *  @default true
		 * 
		 *  @tiptext If true, lines will wrap. If false, long lines get clipped.
		 *  @helpid 3175
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function get wordWrap():Boolean
		{
			return _wordWrap;
		}
		
		/**
		 *  @private
		 */
		public function set wordWrap(value:Boolean):void
		{
			if (value == _wordWrap)
				return;
			
			_wordWrap = value;
			wordWrapChanged = true;
			
			invalidateProperties();
			invalidateDisplayList();
			
			dispatchEvent(new Event("wordWrapChanged"));
		}
		
		//--------------------------------------------------------------------------
		//
		//  Overridden methods
		//
		//--------------------------------------------------------------------------
		
		/**
		 *  @private
		 */
		override protected function createChildren():void
		{
			super.createChildren();
			
			createTextField(-1);
		}
		
		/**
		 *  @private
		 */
		override protected function commitProperties():void
		{
			super.commitProperties();
			
			if (hasFontContextChanged() && textField != null)
			{
				removeTextField();
				createTextField(-1);
				accessibilityPropertiesChanged = true;
				condenseWhiteChanged = true;
				displayAsPasswordChanged = true;
				editableChanged = true;
				enabledChanged = true;
				maxCharsChanged = true;
				restrictChanged = true;
				selectableChanged = true;
				tabIndexChanged = true;
				wordWrapChanged = true;
				textChanged = true;
				selectionChanged = true;
			}
			
			if (accessibilityPropertiesChanged)
			{
				textField.accessibilityProperties = _accessibilityProperties;
				
				accessibilityPropertiesChanged = false;
			}
			
			if (condenseWhiteChanged)
			{
				textField.condenseWhite = _condenseWhite;
				
				condenseWhiteChanged = false;
			}
			
			if (displayAsPasswordChanged)
			{
				textField.displayAsPassword = _displayAsPassword;
				
				displayAsPasswordChanged = false;
			}
			
			if (editableChanged)
			{
				textField.type = _editable && enabled ?
					TextFieldType.INPUT :
					TextFieldType.DYNAMIC;
				
				editableChanged = false;
			}
			
			if (enabledChanged)
			{
				textField.enabled = enabled;
				
				enabledChanged = false;
			}
			
			if (maxCharsChanged)
			{
				textField.maxChars = _maxChars;
				
				maxCharsChanged = false;
			}
			
			if (restrictChanged)
			{
				textField.restrict = _restrict;
				
				restrictChanged = false;
			}
			
			if (selectableChanged)
			{
				textField.selectable = _selectable;
				
				selectableChanged = false;
			}
			
			if (styleSheetChanged)
			{
				textField.styleSheet = _styleSheet;
				
				styleSheetChanged = false;
			}
			
			if (tabIndexChanged)
			{
				textField.tabIndex = _tabIndex;
				
				tabIndexChanged = false;
			}
			
			if (wordWrapChanged)
			{
				textField.wordWrap = _wordWrap;
				
				wordWrapChanged = false;
			}
			
			if (textChanged || htmlTextChanged)
			{
				// If the 'text' and 'htmlText' properties have both changed,
				// the last one set wins.
				if (isHTML)
					textField.htmlText = explicitHTMLText;
				else
					textField.text = _text;
				
				textFieldChanged(false, true)
				
				textChanged = false;
				htmlTextChanged = false;
			}
			
			if (selectionChanged)
			{
				textField.setSelection(_selectionBeginIndex, _selectionEndIndex);
				
				selectionChanged = false;
			}
			
			if (!isNaN(_hScrollPosition))
				horizontalScrollPosition = _hScrollPosition;
			
			if (!isNaN(_vScrollPosition))
				verticalScrollPosition = _vScrollPosition;
		}
		
		/**
		 *  @private
		 */
		override protected function measure():void
		{
			super.measure();
			
			measuredMinWidth = DEFAULT_MEASURED_MIN_WIDTH;
			measuredWidth = DEFAULT_MEASURED_WIDTH;
			// TextArea is minimum of two lines of text
			measuredMinHeight = measuredHeight = 2 * DEFAULT_MEASURED_MIN_HEIGHT;
		}
		
		/**
		 *  @private
		 *  Position the internal textfield taking scrollbars into consideration.
		 */
		override protected function updateDisplayList(unscaledWidth:Number,
													  unscaledHeight:Number):void
		{
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			var vm:EdgeMetrics = viewMetrics;
			
			vm.left += getStyle("paddingLeft");
			vm.top += getStyle("paddingTop");
			vm.right += getStyle("paddingRight");
			vm.bottom += getStyle("paddingBottom");
			
			textField.move(vm.left, vm.top);
			
			var w:Number = unscaledWidth - vm.left - vm.right;
			var h:Number = unscaledHeight - vm.top - vm.bottom;
			
			// If there's a border, add another line of pixels to the textField
			// that go under the border but allow for descenders on some fonts.
			if (vm.top + vm.bottom > 0)
				h++;
			
			// maxScrollV doesnt get proper value if width < 4
			textField.setActualSize(Math.max(4, w), Math.max(4, h));
			
			// For some reason the textfield resizes itself when initialized
			// and needs to be forced back to its new size.
			//      textField.background = false;
			
			// textField gets proper values of scroll properties after 1 update
			// so scroll bars adjustment would need to wait.
			if (!initialized)
			{
				callLater(invalidateDisplayList);
			}
			else
			{
				// maxScrollV isn't updated yet in some cases
				callLater(adjustScrollBars);
			}
			
			// Reset the scrolling position here.
			// This is most important at init time if someone
			// explicitly sets a position as well as text,
			// because setting the text causes a scroll event
			// with the last known scrollpositions a frame later,
			// overridding what we just set.
			
			if (isNaN(_hScrollPosition))
				_hScrollPosition = 0;
			if (isNaN(_vScrollPosition))
				_vScrollPosition = 0;
			
			var p:Number = Math.min(textField.maxScrollH, _hScrollPosition);
			if (p != textField.scrollH)
				horizontalScrollPosition = p;
			p = Math.min(textField.maxScrollV - 1, _vScrollPosition);
			if (p != textField.scrollV - 1)
				verticalScrollPosition = p;
		}
		
		/**
		 *  @private
		 *  Focus should always be on the internal TextField.
		 */
		override public function setFocus():void
		{
			// We want to preserve the scroll position rather than
			// scroll to the line containing the caret.
			var vScrollPos:int = verticalScrollPosition;
			// we dont want to dispatch a scroll event on focus.
			allowScrollEvent = false;
			textField.setFocus();
			verticalScrollPosition = vScrollPos;
			allowScrollEvent = true;
		}
		
		/**
		 *  @private
		 */
		override protected function isOurFocus(target:DisplayObject):Boolean
		{
			return target == textField || super.isOurFocus(target);
		}
		
		
		//--------------------------------------------------------------------------
		//
		//  Methods
		//
		//--------------------------------------------------------------------------
		
		/**
		 *  @private
		 *  Creates the text field child and adds it as a child of this component.
		 * 
		 *  @param childIndex The index of where to add the child.
		 *  If -1, the text field is appended to the end of the list.
		 */
		mx_internal function createTextField(childIndex:int):void
		{
			if (!textField)
			{
				textField = IUITextField(createInFontContext(UITextField));
				
				textField.autoSize = TextFieldAutoSize.NONE;
				textField.enabled = enabled;
				textField.ignorePadding = true;
				textField.multiline = true;
				textField.selectable = true;
				textField.styleName = this;
				textField.tabEnabled = true;
				textField.type = TextFieldType.INPUT;
				textField.useRichTextClipboard = true;
				textField.wordWrap = true;
				
				textField.addEventListener(Event.CHANGE, textField_changeHandler);
				textField.addEventListener(Event.SCROLL, textField_scrollHandler);
				textField.addEventListener(IOErrorEvent.IO_ERROR,
					textField_ioErrorHandler);
				textField.addEventListener(TextEvent.TEXT_INPUT,
					textField_textInputHandler);
				textField.addEventListener("textFieldStyleChange",
					textField_textFieldStyleChangeHandler)
				textField.addEventListener("textFormatChange",
					textField_textFormatChangeHandler)
				textField.addEventListener("textInsert",
					textField_textModifiedHandler);                                       
				textField.addEventListener("textReplace",
					textField_textModifiedHandler);                                                   
				textField.addEventListener("textFieldWidthChange",
					textField_textFieldWidthChangeHandler);
				
				// can't use NativeDragEvent.NATIVE_DRAG_DROP b/c we need AIR for that
				// ideally we don't need to listen for this event as doing a dragDrop should 
				// dispatch a TEXT_INPUT and a CHANGE event for us (see SDK-19816)
				textField.addEventListener("nativeDragDrop", textField_nativeDragDropHandler);
				
				if (childIndex == -1)
					addChild(DisplayObject(textField));
				else 
					addChildAt(DisplayObject(textField), childIndex);
			}
		}
		
		/**
		 *  @private
		 *  Removes the text field from this component.
		 */
		mx_internal function removeTextField():void
		{
			if (textField)
			{
				textField.removeEventListener(Event.CHANGE, textField_changeHandler);
				textField.removeEventListener(Event.SCROLL, textField_scrollHandler);
				textField.removeEventListener(IOErrorEvent.IO_ERROR,
					textField_ioErrorHandler);
				textField.removeEventListener(TextEvent.TEXT_INPUT,
					textField_textInputHandler);
				textField.removeEventListener("textFieldStyleChange",
					textField_textFieldStyleChangeHandler)
				textField.removeEventListener("textFormatChange",
					textField_textFormatChangeHandler)
				textField.removeEventListener("textInsert",
					textField_textModifiedHandler);                                       
				textField.removeEventListener("textReplace",
					textField_textModifiedHandler);                                       
				textField.removeEventListener("textFieldWidthChange",
					textField_textFieldWidthChangeHandler);
				textField.removeEventListener("nativeDragDrop", textField_nativeDragDropHandler);
				
				removeChild(DisplayObject(textField));
				textField = null;
			}
		}
		
		/**
		 *  Returns a TextLineMetrics object with information about the text 
		 *  position and measurements for a line of text in the control.
		 *  The component must be validated to get a correct number.
		 *  If you set the <code>text</code> or <code>htmlText</code> property
		 *  and then immediately call
		 *  <code>getLineMetrics()</code> you may receive an incorrect value.
		 *  You should either wait for the component to validate
		 *  or call <code>validateNow()</code>.
		 *  This is behavior differs from that of the flash.text.TextField class,
		 *  which updates the value immediately.
		 * 
		 *  @param lineIndex The zero-based index of the line for which to get the metrics. 
		 *  
		 *  @return The object that contains information about the text position
		 *  and measurements for the specified line of text in the control.
		 *
		 *  @see flash.text.TextField
		 *  @see flash.text.TextLineMetrics
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function getLineMetrics(lineIndex:int):TextLineMetrics
		{
			return textField ? textField.getLineMetrics(lineIndex) : null;
		}
		
		/**
		 *  Selects the text in the range specified by the parameters.
		 *  If the control is not in focus, the selection highlight will not show 
		 *  until the control gains focus. Also, if the focus is gained by clicking 
		 *  on the control, any previous selection would be lost.
		 *  If the two parameter values are the same,
		 *  the new selection is an insertion point.
		 *
		 *  @param beginIndex The zero-based index of the first character in the
		 *  selection; that is, the first character is 0, the second character
		 *  is 1, and so on.
		 *
		 *  @param endIndex The zero-based index of the position <i>after</i>
		 *  the last character in the selection (equivalent to the one-based
		 *  index of the last character).
		 *  If the parameter is 5, the last character in the selection, for
		 *  example, is the fifth character.
		 *  When the TextArea control gets the focus, the selection is visible 
		 *  if the <code>selectionBeginIndex</code> and <code>selectionEndIndex</code>
		 *  properties are both set.
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		public function setSelection(beginIndex:int, endIndex:int):void
		{
			_selectionBeginIndex = beginIndex;
			_selectionEndIndex = endIndex;
			selectionChanged = true;
			
			invalidateProperties();
		}
		
		/**
		 *  @private
		 *  Setting the 'htmlText' of textField changes its 'text',
		 *  and vice versa, so afterwards doing so we call this method
		 *  to update the storage vars for various properties.
		 *  Afterwards, the Label's 'text', 'htmlText', 'textWidth',
		 *  and 'textHeight' are all in sync with each other
		 *  and are identical to the TextField's.
		 */
		private function textFieldChanged(styleChangeOnly:Boolean,
										  dispatchValueCommitEvent:Boolean):void
		{
			var changed1:Boolean;
			var changed2:Boolean;
			
			if (!styleChangeOnly)
			{
				changed1 = _text != textField.text;
				_text = textField.text;
			}
			
			changed2 = _htmlText != textField.htmlText;
			_htmlText = textField.htmlText;
			
			// If the 'text' property changes, trigger bindings to it
			// and conditionally dispatch a 'valueCommit' event.
			if (changed1)
			{
				dispatchEvent(new Event("textChanged"));
				
				if (dispatchValueCommitEvent)
					dispatchEvent(new FlexEvent(FlexEvent.VALUE_COMMIT));
			}
			// If the 'htmlText' property changes, trigger bindings to it.
			if (changed2)
				dispatchEvent(new Event("htmlTextChanged"));
			
			_textWidth = textField.textWidth;
			_textHeight = textField.textHeight;
		}
		
		/**
		 *  @private
		 */
		private function adjustScrollBars():void
		{
			var visibleRows:Number =
				textField.bottomScrollV - textField.scrollV + 1;
			
			setScrollBarProperties(textField.width + textField.maxScrollH,
				textField.width, textField.numLines,
				visibleRows);
		}
		
		/**
		 *  @private
		 *  Some other components which use a TextArea as an internal
		 *  subcomponent need access to its UITextField, but can't access the
		 *  textField var because it is protected and therefore available
		 *  only to subclasses.
		 */
		mx_internal function getTextField():IUITextField
		{
			return textField;
		}
		
		//--------------------------------------------------------------------------
		//
		//  Overridden event handlers: UIComponent
		//
		//--------------------------------------------------------------------------
		
		/**
		 *  @private
		 */
		override protected function focusInHandler(event:FocusEvent):void
		{
			if (event.target == this)
				systemManager.stage.focus = TextField(textField);
			
			var fm:IFocusManager = focusManager;
			
			if (editable && fm)
				fm.showFocusIndicator = true;
			
			if (fm)
				fm.defaultButtonEnabled = false;
			
			super.focusInHandler(event);
			
			if (_imeMode != null && _editable)
			{
				// When IME.conversionMode is unknown it cannot be
				// set to anything other than unknown(English)      
				try
				{
					if (!errorCaught &&
						IME.conversionMode != IMEConversionMode.UNKNOWN)
					{
						IME.conversionMode = _imeMode;
					}
					errorCaught = false;
				}
				catch(e:Error)
				{
					// Once an error is thrown, focusIn is called 
					// again after the Alert is closed, throw error 
					// only the first time.
					errorCaught = true;
					var message:String = resourceManager.getString(
						"controls", "unsupportedMode", [ _imeMode ]);          
					throw new Error(message);
				}
			}
		}
		
		/**
		 *  @private
		 *  Gets called by internal field so we remove focus rect.
		 */
		override protected function focusOutHandler(event:FocusEvent):void
		{
			var fm:IFocusManager = focusManager;
			
			if (fm)
				fm.defaultButtonEnabled = true;
			
			super.focusOutHandler(event);
			
			dispatchEvent(new FlexEvent(FlexEvent.VALUE_COMMIT));
		}
		
		//--------------------------------------------------------------------------
		//
		//  Overridden event handlers: ScrollControlBase
		//
		//--------------------------------------------------------------------------
		
		/**
		 *  @private
		 *  Mouse wheel scroll handler.
		 *  TextField scrolls automatically so we don't need to handle this.
		 */
		override protected function mouseWheelHandler(event:MouseEvent):void
		{
			event.stopPropagation();
		}
		
		/**
		 *  @private
		 *  We got a scroll event so update everything
		 */
		override protected function scrollHandler(event:Event):void
		{
			// TextField.scroll bubbles so you might see it here
			if (event is ScrollEvent)
			{
				if (!liveScrolling &&
					ScrollEvent(event).detail == ScrollEventDetail.THUMB_TRACK)
				{
					return;
				}
				
				super.scrollHandler(event);
				
				textField.scrollH = horizontalScrollPosition;
				textField.scrollV = verticalScrollPosition + 1;
				
				_vScrollPosition = textField.scrollV - 1;
				_hScrollPosition = textField.scrollH;
			}
		}
		
		//--------------------------------------------------------------------------
		//
		//  Event handlers
		//
		//--------------------------------------------------------------------------
		
		/**
		 *  @private
		 *  Only gets called on keyboard not programmatic setting of text.
		 */
		private function textField_changeHandler(event:Event):void
		{
			textFieldChanged(false, false);
			
			adjustScrollBars();
			
			// Kill any programmatic change we might be looking at.
			textChanged = false;
			htmlTextChanged = false;
			
			// Stop this bubbling "change" event
			// and dispatch another one that doesn't bubble.
			event.stopImmediatePropagation();
			dispatchEvent(new Event(Event.CHANGE));
		}
		
		/**
		 *  @private
		 */
		private function textField_scrollHandler(event:Event):void
		{
			if (initialized && allowScrollEvent)
			{
				// delta is positive when scrolling down/right and 
				// negative in the opposite direction
				var deltaX:int = textField.scrollH - horizontalScrollPosition;
				var deltaY:int = textField.scrollV - 1 - verticalScrollPosition;
				
				horizontalScrollPosition = textField.scrollH;
				verticalScrollPosition = textField.scrollV - 1;
				
				var scrollEvent:ScrollEvent;
				if (deltaX)
				{
					scrollEvent = new ScrollEvent(ScrollEvent.SCROLL, false, false,
						null, horizontalScrollPosition, ScrollEventDirection.HORIZONTAL,
						deltaX);
					dispatchEvent(scrollEvent);     
				}
				if (deltaY)
				{
					scrollEvent = new ScrollEvent(ScrollEvent.SCROLL, false, false,
						null, verticalScrollPosition, ScrollEventDirection.VERTICAL,
						deltaY);
					dispatchEvent(scrollEvent);     
				}
			}
		}
		
		/**
		 *  @private
		 */
		private function textField_ioErrorHandler(event:IOErrorEvent):void
		{
		}
		
		/**
		 *  @private
		 */
		private function textField_nativeDragDropHandler(event:Event):void
		{
			// just call the "change" handler
			textField_changeHandler(event);
		}
		
		/**
		 *  @private
		 */
		private function textField_textInputHandler(event:TextEvent):void
		{
			event.stopImmediatePropagation();
			
			// Dispatch a cancelable version of this event.
			var newEvent:TextEvent =
				new TextEvent(TextEvent.TEXT_INPUT, false, true);
			newEvent.text = event.text;
			dispatchEvent(newEvent);
			
			// If any handler has called preventDefault(),
			// then stop the TextField from accepting the text.
			if (newEvent.isDefaultPrevented())
				event.preventDefault();
		}
		
		/**
		 *  @private
		 */
		private function textField_textFieldStyleChangeHandler(event:Event):void
		{
			textFieldChanged(true, false);
		}
		
		/**
		 *  @private
		 */
		private function textField_textFormatChangeHandler(event:Event):void
		{
			textFieldChanged(true, false);
		}
		
		/**
		 *  @private
		 */
		private function textField_textModifiedHandler(event:Event):void
		{
			textFieldChanged(false, true);
		}
		
		/**
		 *  @private
		 *  Changing the width of the text field can cause the text to reflow.
		 *  Make sure our local _textWidth and _textHeight are in sync with text field.
		 */
		private function textField_textFieldWidthChangeHandler(event:Event):void
		{
			textFieldChanged(true, false);
		}   
	}
	
}
