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
package org.bigbluebutton.common.toaster {
	import flash.media.Sound;
	import flash.media.SoundTransform;

	import mx.containers.Canvas;
	import mx.core.UIComponent;

	import org.bigbluebutton.common.toaster.container.ToastContainerBase;
	import org.bigbluebutton.common.toaster.message.ToastMessageBase;
	import org.bigbluebutton.common.toaster.message.ToastMessageRenderer;
	import org.bigbluebutton.common.toaster.message.ToastType;

	/**
	 * Main class that will contain multiple containers (one for each corner)
	 */
	public class Toaster extends Canvas {
		private static var instance:Toaster = null;

		[Embed(source = "./assets/notify.mp3")]
		private static const NOTIFY_SOUND:Class;

		public static var notifySound:Sound;

		private var _toastContainerParent:UIComponent = null;

		/**
		 * Specifies a custom parent for the toasts (not the Application)
		 */

		public function get toastContainerParent():UIComponent {
			return _toastContainerParent;
		}

		public function set toastContainerParent(value:UIComponent):void {
			_toastContainerParent = value;
		}

		private var _useLocalPosition:Boolean = false;

		/**
		 * Tells the container wether to use a global positionning or a local one
		 */

		public function get useLocalPosition():Boolean {
			return _useLocalPosition;
		}

		public function set useLocalPosition(value:Boolean):void {
			_useLocalPosition = value;
		}

		// CONSTRUCTOR
		public function Toaster() {
			super();
			setStyle("horizontalScrollPolicy", "off");
			setStyle("verticalScrollPolicy", "off");
			instance = this;
			notifySound = new NOTIFY_SOUND();
		}

		private static var container:ToastContainerBase;

		// PUBLIC STATIC METHODS
		public static function toast(message:String, type:String = ToastType.DEFAULT, icon:String = null):void {
			if (!container) {
				// container wasn't defined in MXML, we create a basic one
				container = new ToastContainerBase();
				container.useLocalPosition = instance.useLocalPosition;
				instance.addChild(container);
			}
			var toast:ToastMessageRenderer = new ToastMessageRenderer();
			toast.message = message;
			toast.type = type;
			toast.iconName = icon;
			container.addToastMessage(toast as ToastMessageBase);
		}

		/**
		 * Plays a sound notification of a specific type
		 */
		public static function playSound():void {
			notifySound.play(0, 0, new SoundTransform(0.8));
		}

	}
}
