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
package org.bigbluebutton.modules.playback.model
{
	import org.bigbluebutton.modules.playback.PlaybackFacade;
	import org.bigbluebutton.modules.playback.controller.notifiers.ParseNotifier;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * The ParsingMediator parser a received XML file into properly timed events that are then dispatched
	 * to the MessagingProxy 
	 * @author dzgonjan
	 * 
	 */	
	public class ParsingMediator extends Mediator implements IMediator  
	{
		public static const NAME:String = "ParsingMediator";
		
		private var startTime:Number;
		private var mainSequence:XMLList;
		
		public function ParsingMediator(xml:XML)
		{
			super(NAME, xml);
			startTime = xml.@start;
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			parse();
		}
		
		public function get xml():XML{
			return viewComponent as XML;
		}
		
		private function parse():void{
			mainSequence = xml.par.seq;
			
			//sendNotification(PlaybackFacade.PARSE_COMPLETE, 
			//	new ParseNotifier(mainSequence.chat, ChatModuleConstants.TO_CHAT_MODULE, startTime));
				
			//sendNotification(PlaybackFacade.PARSE_COMPLETE,
			//	new ParseNotifier(mainSequence.presentation, PresentationConstants.TO_PRESENTATION_MODULE, startTime));
		
			//sendNotification(PlaybackFacade.PARSE_COMPLETE,
			//	new ParseNotifier(mainSequence.voice, VoiceModuleConstants.TO_VOICE_MODULE, startTime));
		}

	}
}