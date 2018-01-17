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
		public static const MAXIMIZE_USERS:String = 'MAXIMIZE_USERS';
		public static const MINIMIZE_USERS:String = 'MINIMIZE_USERS';
		public static const MAXIMIZE_DOCK:String = 'MAXIMIZE_DOCK';
		public static const MINIMIZE_DOCK:String = 'MINIMIZE_DOCK';
		public static const MAXIMIZE_PRES:String = 'MAXIMIZE_PRES';
		public static const MINIMIZE_PRES:String = 'MINIMIZE_PRES';
		public static const MAXIMIZE_CHAT:String = 'MAXIMIZE_CHAT';
		public static const MINIMIZE_CHAT:String = 'MINIMIZE_CHAT';
		
		public static const FOCUS_AWAY_EVENT:String = 'FOCUS_AWAY_EVENT';
		public static const MUTE_ME_EVENT:String = 'MUTE_ME_EVENT';
		public static const FOCUS_CHAT_INPUT:String = 'FOCUS_CHAT_INPUT';
		public static const UNDO_WHITEBOARD:String = 'UNDO_WHITEBOARD';
		public static const FOCUS_SLIDE:String = 'FOCUS_SLIDE_VIEW';
		public static const OPEN_SHORTCUT_WIN:String = 'OPEN_SHORTCUT_WIN';
		
		public static const FOCUS_USERS_WINDOW:String = 'FOCUS_USERS_WINDOW';
		public static const FOCUS_VIDEO_WINDOW:String = 'FOCUS_VIDEO_WINDOW';
		public static const FOCUS_PRESENTATION_WINDOW:String = 'FOCUS_PRESENTATION_WINDOW';
		public static const FOCUS_CHAT_WINDOW:String = 'FOCUS_CHAT_WINDOW';
		
		public static const SHARE_DESKTOP:String = 'SHARE_DESKTOP';
		public static const SHARE_MICROPHONE:String = 'SHARE_MICROPHONE';
		public static const SHARE_WEBCAM:String = 'SHARE_WEBCAM';
		public static const PAUSE_REMOTE_STREAM:String = 'PAUSE_REMOTE_STREAM';
		
		public static const FOCUS_CAPTION_WINDOW:String = 'FOCUS_CAPTION_WINDOW';
		
		public static const FOCUS_SHARED_NOTES_WINDOW:String = 'FOCUS_SHARED_NOTES_WINDOW';
		
		public static const REMOTE_FOCUS_DESKTOP:String = 'REMOTE_FOCUS_DESKTOP';
		
		public static const REMOTE_OPEN_SHORTCUT_WIN:String = 'REMOTE_OPEN_SHORTCUT_WIN';
		public static const LOGOUT:String = 'LOGOUT';
		public static const RAISE_HAND:String = 'RAISE_HAND';
		
		public static const UPLOAD_PRESENTATION:String = 'UPLOAD_PRESENTATION';
		public static const PREVIOUS_SLIDE:String = 'PREVIOUS_SLIDE';
		public static const SELECT_SLIDES:String = 'SELECT_SLIDES';
		public static const NEXT_SLIDE:String = 'NEXT_SLIDE';
		public static const FIT_TO_WIDTH:String = 'FIT_TO_WIDTH';
		public static const FIT_TO_PAGE:String = 'FIT_TO_PAGE';
		
		public static const FOCUS_CHAT_TABS:String = 'FOCUS_CHAT_TABS';
		public static const FOCUS_CHAT_BOX:String = 'FOCUS_CHAT_BOX';
		public static const CHANGE_FONT_COLOUR:String = 'CHANGE_FONT_COLOUR';
		public static const SEND_MESSAGE:String = 'SEND_MESSAGE';
		public static const CLOSE_PRIVATE:String = 'CLOSE_PRIVATE';
		
		//public static const FOCUS_LOOP_END:String = 'FOCUS_LOOP_END';
		public static const FOCUS_SHORTCUT_BUTTON:String = 'FOCUS_SHORTCUT_BUTTON';
		public static const MUTE_ALL_BUT_PRES:String = 'MUTE_ALL_BUT_PRES';
		public static const OPEN_BREAKOUT_ROOMS:String = 'OPEN_BREAKOUT_ROOMS';
		public static const FOCUS_LOGOUT_BUTTON:String = 'FOCUS_LOGOUT_BUTTON';
		
		public static const CLOSE_POLL_STATS:String = 'CLOSE_POLL_STATS';
		public static const FOCUS_MULT_CHECK:String = 'FOCUS_MULT_CHECK';
		public static const FOCUS_POLL_ANSWERS:String = 'FOCUS_POLL_ANSWERS';
		public static const FOCUS_POLL_DATA:String = 'FOCUS_POLL_DATA';
		public static const FOCUS_POLL_TITLE:String = 'FOCUS_POLL_TITLE';
		public static const FOCUS_POLL_QUESTION:String = 'FOCUS_POLL_QUESTION';
		public static const FOCUS_POLLING_WINDOW_CREATE:String = 'FOCUS_POLLING_WINDOW_CREATE';
		public static const FOCUS_POLLING_WINDOW_STATS:String = 'FOCUS_POLLING_WINDOW_STATS';
		public static const FOCUS_VOTE_QUESTION:String = 'FOCUS_VOTE_QUESTION';
		public static const FOCUS_VOTING_WINDOW:String = 'FOCUS_VOTING_WINDOW';
		public static const FOCUS_WEBPOLL_ADDRESS:String = 'FOCUS_WEBPOLL_ADDRESS';
		public static const FOCUS_WEBPOLL_CHECK:String = 'FOCUS_WEBPOLL_CHECK';
		public static const POLL_BUTTON_CLICK:String = 'POLL_BUTTON_CLICK';
		public static const POLL_CANCEL:String = 'POLL_CANCEL';
		public static const POLL_MODIFY:String = 'POLL_MODIFY';
		public static const POLL_PREVIEW:String = 'POLL_PREVIEW';
		public static const POLL_PUBLISH:String = 'POLL_PUBLISH';
		public static const POLL_SAVE:String = 'POLL_SAVE';
		public static const REMOTE_CAST_VOTE:String = 'REMOTE_CAST_VOTE';
		public static const SC_REFRESH_POLL:String = 'SC_REFRESH_POLL';
		public static const SC_REPOST_POLL:String = 'SC_REPOST_POLL';
		public static const SC_STOP_POLL:String = 'SC_STOP_POLL';
		
		public var otherUserID:String;
		
		public function ShortcutEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}		
	}
}

/*
	Notes on adding shortcuts:
	
	Steps to making a GLOBAL shortcut:
		-Add a constant to ShortcutEvent
		-Create a locale string for the hotkey and the description
		-Add modifier+hotkey string to keyCombos, instantiate it as the relevant ShortCutEvent:
			keyCombos[modifier+(ResourceUtil.getInstance().getString('bbb.shortcutkey.focus.chat') as String)] = ShortcutEvent.FOCUS_CHAT_WINDOW;
		-Add a <mate> tag in the MXML file (before fx:Script) which will process the event:
			<mate:Listener type="{ShortcutEvent.FOCUS_CHAT_WINDOW}" method="focusWindow" />
		-Add the hotkey locale to one of the resource arrays in ShortcutHelpWindow.mxml
	
	Steps to making a LOCAL shortcut:
		-Copy the structure of hotKeyCapture, loadKeyCombos, and handleKeyDown into the window you're adding the shortcut to.
		-Add the call to hotKeyCapture to onCreationComplete
		-Change the stage.addListener in hotKeyCapture to <parent element id>.addListener
		-Use the same process as for GLOBAL shortcuts
*/