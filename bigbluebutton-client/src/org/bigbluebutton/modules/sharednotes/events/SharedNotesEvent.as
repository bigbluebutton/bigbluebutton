/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 2.1 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Hugo Lazzari <hslazzari@gmail.com>
 */
package org.bigbluebutton.modules.sharednotes.events
{
	import org.bigbluebutton.main.events.BBBEvent;

	public class SharedNotesEvent extends BBBEvent
	{
		public static const CREATE_ADDITIONAL_NOTES_REQUEST_EVENT:String = 'SHARED_NOTES_CREATE_ADDITIONAL_NOTES_REQUEST';
		public static const CREATE_ADDITIONAL_NOTES_REPLY_EVENT:String = 'SHARED_NOTES_CREATE_ADDITIONAL_NOTES_REPLY';
		public static const DESTROY_ADDITIONAL_NOTES_REQUEST_EVENT:String = 'SHARED_NOTES_DESTROY_ADDITIONAL_NOTES_REQUEST';
		public static const DESTROY_ADDITIONAL_NOTES_REPLY_EVENT:String = 'SHARED_NOTES_DESTROY_ADDITIONAL_NOTES_REPLY';

		public static const REQUEST_ADDITIONAL_NOTES_SET_EVENT:String = 'SHARED_NOTES_ADDITIONAL_NOTES_SET_REQUEST';

		public static const CURRENT_DOCUMENT_REQUEST_EVENT:String = 'SHARED_NOTES_CURRENT_DOCUMENT_REQUEST';
		public static const CURRENT_DOCUMENT_REPLY_EVENT:String = 'SHARED_NOTES_CURRENT_DOCUMENT_REPLY';
		public static const CONNECT_EVENT:String = 'SHARED_NOTES_CONNECT';
		public static const SEND_PATCH_EVENT:String = 'SHARED_NOTES_SEND_PATCH';
		public static const RECEIVE_PATCH_EVENT:String = 'SHARED_NOTES_RECEIVE_PATCH';
		public static const SYNC_NOTE_REQUEST_EVENT:String = 'SYNC_NOTE_REQUEST_EVENT';
		public static const SYNC_NOTE_REPLY_EVENT:String = 'SYNC_NOTE_REPLY_EVENT';
		public static const CLEAR_NOTE_REQUEST_EVENT:String = 'CLEAR_NOTE_REQUEST_EVENT';

		public var noteName:String = "";

		public function SharedNotesEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, null, bubbles, cancelable);
		}
	}
}
