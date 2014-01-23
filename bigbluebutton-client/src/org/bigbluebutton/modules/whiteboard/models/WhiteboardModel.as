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
package org.bigbluebutton.modules.whiteboard.models
{
	import flash.events.IEventDispatcher;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdate;

	public class WhiteboardModel
	{
		private var _presentations:ArrayCollection = new ArrayCollection();
		private var _currentPresentation:Presentation;		
        private var _dispatcher:IEventDispatcher;
        
        public function WhiteboardModel(dispatcher:IEventDispatcher) {
            _dispatcher = dispatcher;
        }		
		
		public function addAnnotation(annotation:Annotation):void {
//            LogUtil.debug("*** Adding annotation [" + annotation.id + "," + annotation.type + "," + annotation.status + "] ****");
            if (annotation.status == DrawObject.DRAW_START || annotation.status == TextObject.TEXT_CREATED) {
                _currentPresentation.addAnnotation(annotation);
            } else {
                _currentPresentation.updateAnnotation(annotation);
            }
			            
            var event:WhiteboardUpdate = new WhiteboardUpdate(WhiteboardUpdate.BOARD_UPDATED);
            event.annotation = annotation;
            _dispatcher.dispatchEvent(event);
//            LogUtil.debug("*** Dispatched WhiteboardUpdate.BOARD_UPDATED Event ****");
		}
		
        public function addAnnotationFromHistory(presentationID:String, pageNumber:Number, annotation:Array):void {
          if (_currentPresentation.id != presentationID || _currentPresentation.getCurrentPageNumber() != pageNumber) {
            LogUtil.debug("Wrong annotation history [curPresID=" + _currentPresentation.id + ",rxPresID=" + presentationID + 
                          "][curPage=" + _currentPresentation.getCurrentPageNumber() + ",rxPageNum=" + pageNumber + "]");
            return;
          }
          
            for (var i:int = 0; i < annotation.length; i++) {
//                LogUtil.debug("addAnnotationFromHistory: annotation id=" + (annotation[i] as Annotation).id);
                _currentPresentation.addAnnotation(annotation[i] as Annotation);
            } 
            _dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.RECEIVED_ANNOTATION_HISTORY));
        }
        
		public function removeAnnotation(id:String):void {
			
		}
		
        public function getAnnotation(id:String):Annotation {
            return _currentPresentation.getAnnotation(id);
        }
        
        public function getAnnotations():Array {
            return _currentPresentation.getAnnotations();
        }
        
		public function undo():void {
			_currentPresentation.undo();
			_dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.UNDO_ANNOTATION));
		}
		
		public function clear():void {
			_currentPresentation.clear();
			_dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.CLEAR_ANNOTATIONS));
		}

		public function changePresentation(presentationID:String, numberOfPages:int):void {
//            LogUtil.debug("*** Changing presentation to " + presentationID + " ****");
			var pres:Presentation = findPresentation(presentationID);
            if (pres == null) {
                pres = new Presentation(presentationID, numberOfPages);
                _presentations.addItem(pres);
            } 
 //           LogUtil.debug("*** Current presentation is [ " + presentationID + " ] ****");
            _currentPresentation = pres;
		}
		
		private function findPresentation(presentationID:String):Presentation {
			for (var i:int = 0; i < _presentations.length; i++) {
				var p:Presentation = _presentations.getItemAt(i) as Presentation;
				if (presentationID == p.id) return p;
			}
			return null;
		}
		
		public function changePage(pageNum:int, numAnnotations:int):void {
            /* Need to increment the page by 1 as what is passed is zero-based while we store the pages as 1-based.*/
//            var curPage:int = pageNum;
//            LogUtil.debug("*** Switching to page [ " + curPage + " ] ****");
      if (_currentPresentation != null) {
        _currentPresentation.setCurrentPage(pageNum);
        _dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.CHANGE_PAGE));        
      }
		}
		
		public function enable(enabled:Boolean):void {
			
		}
        
        public function getCurrentPresentationAndPage():Object {
            if (_currentPresentation == null) return null;
            var pageNum:int = _currentPresentation.getCurrentPageNumber();
            if (pageNum == 0) return null;
            
            var cp:Object = new Object();
            cp.presentationID = _currentPresentation.id;
            cp.currentPageNumber = pageNum;
            
            return cp;
        }
        
	}
}