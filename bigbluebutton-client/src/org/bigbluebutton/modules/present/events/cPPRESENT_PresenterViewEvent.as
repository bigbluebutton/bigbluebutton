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
package org.bigbluebutton.modules.present.events
{
    import flash.events.Event;
    
	/*****************************************************************************
	;  cPPRESENT_PresenterViewEvent
	;----------------------------------------------------------------------------
	; DESCRIPTION
	;   this class is used to send the presenter's veiw port information
	;  
	; HISTORY
	; __date__ :        PTS:            Description
	; 2011.01.27
	******************************************************************************/
    public class cPPRESENT_PresenterViewEvent extends Event
    {
        public static const UPDATE_PRESENTER_VIEW_DIMENSION:String  = "UPDATE_PRESENTER_VIEW_DIMENSION";
        public static const SHARE_PRESENTER_VIEW_DIMENSION:String   = "SHARE_PRESENTER_VIEW_DIMENSION";
        public static const GET_PRESENTER_VIEW_DIMENSION:String     = "GET_PRESENTER_VIEW_DIMENSION";
		public static const NEW_PRESENTATION_LOAD:String     = "NEW_PRESENTATION_LOAD";
		public static const REFRESH_SLIDE:String     = "REFRESH_SLIDE";
        
        public var curSlideWidth:Number;
        public var curSlideHeight:Number;
        public var viewPortWidth:Number;
        public var viewPortHeight:Number;
        
		/*****************************************************************************
		;  cPPRESENT_PresenterViewEvent
		;----------------------------------------------------------------------------
		; DESCRIPTION
		;   this routine is the constructor of the class
		;   
		; RETURNS : N/A
		;
		; INTERFACE NOTES
		;   INPUT
		;
		; IMPLEMENTATION
		;
		; HISTORY
		; __date__ :        PTS:            Description
		; 2011.01.27
		******************************************************************************/
        public function cPPRESENT_PresenterViewEvent(type:String)
        {
            super(type, true, false);
        }/** END FUNCTION 'cPPRESENT_PresenterViewEvent' **/
    }/** END CLASS 'cPPRESENT_PresenterViewEvent' **/
}