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
	import flash.media.Sound;
	import flash.media.SoundChannel;
	import flash.net.URLRequest;
	
	import org.bigbluebutton.modules.playback.PlaybackFacade;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class SoundPlaybackMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "SoundPlaybackMediator";
		private var soundFile:String;
		private var sound:Sound;
		private var channel:SoundChannel;
		private var position:Number;
		
		public function SoundPlaybackMediator(file:String)
		{
			super(NAME);
			this.soundFile = file;
			this.sound = new Sound(new URLRequest(XMLProxy.MAIN + soundFile));
			this.position = 0;
		}
		
		override public function listNotificationInterests():Array{
			return [
					PlaybackFacade.STOP,
					PlaybackFacade.PLAY
					];	
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case PlaybackFacade.STOP:
					stopSound();
					break;
				case PlaybackFacade.PLAY:
					startSound();
					break;
			}
		}
		
		private function stopSound():void{
			this.position = this.channel.position;
			this.channel.stop();
		}
		
		private function startSound():void{
			this.channel = this.sound.play(position);
		}

	}
}