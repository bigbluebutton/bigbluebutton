/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
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
*/
package org.bigbluebutton.modules.present.business
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.*;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.rpc.IResponder;
	import mx.rpc.http.HTTPService;
	
	import org.bigbluebutton.modules.present.events.PresentationEvent;
	import org.bigbluebutton.modules.present.managers.PresentationSlides;
	import org.bigbluebutton.modules.present.managers.Slide;
	import org.bigbluebutton.common.LogUtil;
	        	
	/**
	 * This class directly communicates with an HTTP service in order to send and recives files (slides
	 * in this case)
	 * <p>
	 * This class extends the Proxy class of the pureMVC framework
	 * @author dev_team@bigbluebutton.org
	 * 
	 */	        	
	public class PresentationService implements IResponder
	{  
		private var service : HTTPService;
		private var _slides:PresentationSlides;
		private var urlLoader:URLLoader;
		private var slideUri:String;
		private var dispatcher:Dispatcher;
		
		public function PresentationService()
		{
			service = new HTTPService();
			dispatcher = new Dispatcher();
		}
		
		/**
		 * Load slides from an HTTP service. Response is received in the Responder class' onResult method 
		 * @param url
		 * 
		 */		
		public function load(url:String, slides:PresentationSlides, slideUri:String) : void
		{
			_slides = slides;
			this.slideUri = slideUri;
			service.url = url;			
			urlLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);	
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, handleIOErrorEvent);
			urlLoader.load(new URLRequest(url));
			
		}
		
		private function handleComplete(e:Event):void{
			LogUtil.debug("Loading complete");
			parse(new XML(e.target.data));				
		}
		
		private function handleIOErrorEvent(e:IOErrorEvent):void{
			LogUtil.error(e.toString());
		}
		
		public function parse(xml:XML):void{
			var list:XMLList = xml.presentation.slides.slide;
			var item:XML;
			LogUtil.debug("Slides: " + xml);
		
			var presentationName:String = xml.presentation[0].@name;
			LogUtil.debug("PresentationService::parse()...  presentationName=" + presentationName);
			
			// Make sure we start with a clean set.
			_slides.clear();			
			
			//LogUtil.debug("Slides list: " + list);
			
			for each(item in list){		
				var sUri:String = slideUri + "/" + item.@name;
				var thumbUri:String =  slideUri + "/" + item.@thumb;
				var slide:Slide = new Slide(item.@number, sUri, thumbUri);						
				_slides.add(slide);
				//LogUtil.debug("Available slide: " + sUri + " number = " + item.@number);
				//LogUtil.debug("Available thumb: " + thumbUri);
			}		
			
			//LogUtil.debug("number of slide=" + _slides.size());
			if (_slides.size() > 0) loadPresentationListener(true, presentationName);
			else loadPresentationListener(false, presentationName);
				
		}

		/**
		 * This is the response event. It is called when the PresentationService class sends a request to
		 * the server. This class then responds with this event 
		 * @param event
		 * 
		 */		
		public function result(event : Object):void
		{
			var xml:XML = new XML(event.result);
			var list:XMLList = xml.presentations;
			var item:XML;
						
			for each(item in list){
				LogUtil.debug("Available Modules: " + item.toXMLString() + " at " + item.text());
				
			}	
		}

		/**
		 * Event is called in case the call the to server wasn't successful. This method then gets called
		 * instead of the result() method above 
		 * @param event
		 * 
		 */
		public function fault(event : Object):void
		{
			LogUtil.debug("Got fault [" + event.fault.toString() + "]");		
		}		
		
		public function loadPresentationListener(loaded:Boolean, presentationName:String):void {
			if (loaded) {
				LogUtil.debug('presentation has been loaded  presentationName=' + presentationName);
				var e:PresentationEvent = new PresentationEvent(PresentationEvent.PRESENTATION_LOADED);
				e.presentationName = presentationName;
				e.slides = _slides;
				dispatcher.dispatchEvent(e);
			} else {
				dispatcher.dispatchEvent(new PresentationEvent(PresentationEvent.PRESENTATION_NOT_LOADED));
				LogUtil.debug('failed to load presentation');
			}
		}
	}
}