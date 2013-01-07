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
package org.bigbluebutton.main.events {
	import flash.events.Event;

	public class ShortcutEvent extends Event {
		public static const FOCUS_AWAY_EVENT:String = 'FOCUS_AWAY_EVENT';
		public static const MUTE_ME_EVENT:String = 'MUTE_ME_EVENT';
		public static const FOCUS_CHAT_INPUT:String = 'FOCUS_CHAT_INPUT';
		public static const UNDO_WHITEBOARD:String = 'UNDO_WHITEBOARD';
		public static const FOCUS_SLIDE:String = 'FOCUS_SLIDE_VIEW';
		public static const ADVANCE_MESSAGE:String = 'ADVANCE_MESSAGE';
		public static const GOBACK_MESSAGE:String = 'GOBACK_MESSAGE';
		public static const REPEAT_MESSAGE:String = 'REPEAT_MESSAGE';
		public static const GOLATEST_MESSAGE:String = 'GOLATEST_MESSAGE';
		public static const GOFIRST_MESSAGE:String = 'GOFIRST_MESSAGE';
		public static const GOREAD_MESSAGE:String = 'GOREAD_MESSAGE';
		public static const OPEN_SHORTCUT_WIN:String = 'OPEN_SHORTCUT_WIN';
		
		public static const FOCUS_VIEWERS_WINDOW:String = 'FOCUS_VIEWERS_WINDOW';
		public static const FOCUS_LISTENERS_WINDOW:String = 'FOCUS_LISTENERS_WINDOW';
		public static const FOCUS_VIDEO_WINDOW:String = 'FOCUS_VIDEO_WINDOW';
		public static const FOCUS_PRESENTATION_WINDOW:String = 'FOCUS_PRESENTATION_WINDOW';
		public static const FOCUS_CHAT_WINDOW:String = 'FOCUS_CHAT_WINDOW';
		
		public static const SHARE_DESKTOP:String = 'SHARE_DESKTOP';
		public static const SHARE_MICROPHONE:String = 'SHARE_MICROPHONE';
		public static const SHARE_WEBCAM:String = 'SHARE_WEBCAM';
		
		public static const REMOTE_FOCUS_DESKTOP:String = 'REMOTE_FOCUS_DESKTOP';
		public static const REMOTE_FOCUS_WEBCAM:String = 'REMOTE_FOCUS_WEBCAM';
		// Remote focus microphone not necessary; audio options already hog focus
		
		public static const REMOTE_OPEN_SHORTCUT_WIN:String = 'REMOTE_OPEN_SHORTCUT_WIN';
		public static const LOGOUT:String = 'LOGOUT';
		public static const RAISE_HAND:String = 'RAISE_HAND';
		
		public static const UPLOAD_PRESENTATION:String = 'UPLOAD_PRESENTATION';
		public static const PREVIOUS_SLIDE:String = 'PREVIOUS_SLIDE';
		public static const SELECT_SLIDES:String = 'SELECT_SLIDES';
		public static const NEXT_SLIDE:String = 'NEXT_SLIDE';
		public static const FIT_TO_WIDTH:String = 'FIT_TO_WIDTH';
		public static const FIT_TO_PAGE:String = 'FIT_TO_PAGE';
		
		public static const MAKE_PERSON_PRESENTER:String = 'MAKE_PERSON_PRESENTER';
		public static const FOCUS_USER_LIST:String = 'FOCUS_USER_LIST';
		
		public static const FOCUS_CHAT_TABS:String = 'FOCUS_CHAT_TABS';
		public static const FOCUS_CHAT_BOX:String = 'FOCUS_CHAT_BOX';
		public static const CHANGE_FONT_COLOUR:String = 'CHANGE_FONT_COLOUR';
		public static const SEND_MESSAGE:String = 'SEND_MESSAGE';
		
		public var otherUserID:String;
		
		public function ShortcutEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}		
	}
}