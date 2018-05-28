/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.common.toaster.message {
	import mx.containers.Canvas;

	import org.as3commons.lang.StringUtils;
	import org.bigbluebutton.common.toaster.container.IToastContainer;

	/**
	 * This class is a basic container implementation for your toast.
	 * It just handles basic tasks (open, delay, close).
	 * This is the class you need to extend to create your own messages.
	 */
	public class ToastMessageBase extends Canvas implements IToastMessage {
		// container
		private var _container:IToastContainer = null;

		public function set container(value:IToastContainer):void {
			if (_container != value) {
				_container = value;
			}
		}

		// message
		private var _message:String;

		[Bindable]
		public function set message(value:String):void {
			_message = value;
		}

		public function get message():String {
			return _message;
		}

		// type
		private var _type:String;

		[Bindable]
		public function set type(value:String):void {
			_type = value;
		}

		public function get type():String {
			return _type;
		}

		// iconName
		private var _iconName:String;

		[Bindable]
		public function set iconName(value:String):void {
			_iconName = value;
		}

		public function get iconName():String {
			return _iconName;
		}

		private var _markedForDeletion:Boolean = false;

		public function get markedForDeletion():Boolean {
			return _markedForDeletion;
		}

		public function set markedForDeletion(value:Boolean):void {
			_markedForDeletion = value;
		}

		private var _markedForAddition:Boolean = false;

		public function get markedForAddition():Boolean {
			return _markedForAddition;
		}

		public function set markedForAddition(value:Boolean):void {
			_markedForAddition = value;
		}

		public function get iconBackgroundColor():uint {
			return getStyle('iconBackgroundColor' + StringUtils.capitalize(type));
		}

		public function get iconImageClass():Class {
			var icon:Class = getStyle("icon" + StringUtils.capitalize(iconName));
			if (!icon) {
				icon = getStyle("icon" + StringUtils.capitalize(type));
			}
			return icon;
		}

		public function close():void {
			_container.closeToastMessage(this);
		}

	}
}
