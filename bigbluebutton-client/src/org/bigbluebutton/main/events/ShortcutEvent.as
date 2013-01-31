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
package org.bigbluebutton.main.events {
	import flash.events.Event;

	public class ShortcutEvent extends Event {
		public static const MUTE_ME_EVENT:String = 'MUTE_ME_EVENT';
		public static const FOCUS_CHAT_INPUT:String = 'FOCUS_CHAT_INPUT';
		public static const UNDO_WHITEBOARD:String = 'UNDO_WHITEBOARD';
		public static const FOCUS_SLIDE:String = 'FOCUS_SLIDE_VIEW';
		public static const FOCUS_CHAT_TABS:String = 'FOCUS_CHAT_TABS';
		public static const ADVANCE_MESSAGE:String = 'ADVANCE_MESSAGE';
		public static const GOBACK_MESSAGE:String = 'GOBACK_MESSAGE';
		public static const REPEAT_MESSAGE:String = 'REPEAT_MESSAGE';
		public static const GOLATEST_MESSAGE:String = 'GOLATEST_MESSAGE';
		public static const GOFIRST_MESSAGE:String = 'GOFIRST_MESSAGE';
		public static const GOREAD_MESSAGE:String = 'GOREAD_MESSAGE';
		public static const OPEN_SHORTCUT_WIN:String = 'OPEN_SHORTCUT_WIN';
		
		public var otherUserID:String;
		
		public function ShortcutEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}		
	}
}