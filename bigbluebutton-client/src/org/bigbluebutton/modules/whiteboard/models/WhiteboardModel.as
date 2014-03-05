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
	import org.bigbluebutton.modules.present.model.Page;
	import org.bigbluebutton.modules.present.model.PresentationModel;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdate;

	public class WhiteboardModel
	{
    private static const LOG:String = "WB::WhiteboardModel - ";    
		private var _whiteboards:ArrayCollection = new ArrayCollection();

    private var _dispatcher:IEventDispatcher;
        
    public function WhiteboardModel(dispatcher:IEventDispatcher) {
      _dispatcher = dispatcher;
    }		
		
    private function getWhiteboard(id:String):Whiteboard {
       for (var i:int = 0; i < _whiteboards.length; i++) {
         var wb:Whiteboard = _whiteboards.getItemAt(i) as Whiteboard;
         if (wb.id == id) return wb;
       }
       return null;
    }
    
		public function addAnnotation(annotation:Annotation):void {
      trace(LOG + "*** Adding annotation [" + annotation.id + "," + annotation.type + "," + annotation.status + "] ****");
      var wb:Whiteboard;
      if (annotation.status == DrawObject.DRAW_START || annotation.status == TextObject.TEXT_CREATED) {
        wb = getWhiteboard(annotation.whiteboardId);
        if (wb != null) {
          wb.addAnnotation(annotation);
        }
         
       } else {
         wb = getWhiteboard(annotation.whiteboardId);
         if (wb != null) {
           wb.updateAnnotation(annotation);
         }
       }
			 
//      trace(LOG + "*** Dispatching WhiteboardUpdate.BOARD_UPDATED Event ****");
//       var event:WhiteboardUpdate = new WhiteboardUpdate(WhiteboardUpdate.BOARD_UPDATED);
//       event.annotation = annotation;
//       _dispatcher.dispatchEvent(event);
//       trace(LOG + "*** Dispatched WhiteboardUpdate.BOARD_UPDATED Event ****");
		}
		
    public function addAnnotationFromHistory(presentationID:String, pageNumber:Number, annotation:Array):void {
//      if (_currentPresentation.id != presentationID || _currentPresentation.getCurrentPageNumber() != pageNumber) {
//         trace(LOG + "Wrong annotation history [curPresID=" + _currentPresentation.id + ",rxPresID=" + presentationID + 
//                          "][curPage=" + _currentPresentation.getCurrentPageNumber() + ",rxPageNum=" + pageNumber + "]");
//         return;
//      }
//          
//      for (var i:int = 0; i < annotation.length; i++) {
//         trace(LOG + "addAnnotationFromHistory: annotation id=" + (annotation[i] as Annotation).id);
//         _currentPresentation.addAnnotation(annotation[i] as Annotation);
//      } 
//      _dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.RECEIVED_ANNOTATION_HISTORY));
    }
        
		public function removeAnnotation(id:String):void {
			
		}
		
    public function getAnnotation(id:String):Annotation {
      return null;
//       return _currentPresentation.getAnnotation(id);
    }
        
    public function getAnnotations():Array {
      return new Array();
//       return _currentPresentation.getAnnotations();
    }
        
		public function undo():void {
			_dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.UNDO_ANNOTATION));
		}
		
		public function clear():void {
//			_currentPresentation.clear();
//			_dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.CLEAR_ANNOTATIONS));
		}


		public function enable(enabled:Boolean):void {
			
		}
        
      
    public function getCurrentWhiteboardId():String {
      var page:Page = PresentationModel.getInstance().getCurrentPage();
      if (page != null) {
        return page.id;
      }
      
      return null;
    }
    

	}
}