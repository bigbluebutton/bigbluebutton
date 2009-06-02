/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.video.model.business
{
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.video.model.vo.IMedia;
	
	public class MediaCollection
	{		
	
		private var _media:ArrayCollection = null;	
					
		public function MediaCollection()
		{
			_media = new ArrayCollection();
		}
	
		public function addMedia(media:IMedia) : void
		{				
			if (! hasMedia(media.streamName)) {						
				_media.addItem(media);
			}					
		}
	
		public function hasMedia(stream:String) : Boolean
		{
			var index:int = getMediaIndex(stream);
			
			if (index > -1) {
				return true;
			}
						
			return false;		
		}
		
		public function getMedia(stream:String):IMedia
		{
			var index:int = getMediaIndex(stream);
			
			if (index > -1) {
				return _media.getItemAt(index) as IMedia;
			}
						
			return null;				
		}
			
		public function removeMedia(stream:String):void
		{
			var index : int = getMediaIndex(stream);

			if (index > -1) {
				_media.removeItemAt(index);
			}							
		}
			
		private function getMediaIndex(stream:String):int
		{			
			for (var i:int=0;i<_media.length;i++)
			{
				var m:IMedia = _media.getItemAt(i) as IMedia;
				
				if (m.streamName == stream) {
					return i;
				}
			}				
			
			// Stream not found.
			return -1;
		}
	
		public function removeAllMedia():void
		{
			_media.removeAll();
		}		
		
		public function getAll():ArrayCollection
		{
			return _media;
		}			
	}
}