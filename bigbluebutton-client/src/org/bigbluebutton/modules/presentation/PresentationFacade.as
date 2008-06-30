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
package org.bigbluebutton.modules.presentation
{

	
	import org.bigbluebutton.modules.presentation.controller.StartPresentationAppCommand;
	import org.bigbluebutton.modules.presentation.controller.StartUploadWindowCommand;
	import org.bigbluebutton.modules.presentation.controller.StartupCommand;
	import org.bigbluebutton.modules.presentation.model.PresentationApplication;
	import org.bigbluebutton.modules.presentation.model.PresentationModel;
	import org.bigbluebutton.modules.presentation.model.business.PresentationDelegate;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
	
	/**
	 * This is the main facade class of the Presentation module
	 * <p>
	 * This class extends the Facade class of the pureMVC framework 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class PresentationFacade extends Facade implements IFacade
	{
		public static const ID : String = "PresentationFacade";
		public static const STARTUP:String = "startup";
		public static const STARTUPLOADWINDOW:String = "start upload";
		public static const START_PRESENTATION_APPLICATION:String = "start presentation app";
		
		public static const START_UPLOAD:String = "start upload";
		public static const UPDATE_PAGE:String = "update page";
		public static const ZOOM_SLIDE:String = "Zoom Slide";
		public static const MOVE_SLIDE:String = "Move Slide";
		
		// List of Commands
		public static const GOTO_PAGE_COMMAND : String = "PRESENTATION_GOTO_PAGE_COMMAND";	
		public static const JOIN_COMMAND : String = "PRESENTATION_JOIN_COMMAND";
		public static const LEAVE_COMMAND : String = "PRESENTATION_LEAVE_COMMAND";
		public static const CLEAR_COMMAND : String = "PRESENTATION_CLEAR_COMMAND";
		public static const ASSIGN_COMMAND : String = "PRESENTATION_ASSIGN_COMMAND";
		public static const LOAD_COMMAND : String = "PRESENTATION_LOAD_COMMAND";
		public static const START_SHARE_COMMAND : String = "PRESENTATION_START_SHARE_COMMAND";
		public static const STOP_SHARE_COMMAND : String = "PRESENTATION_STOP_SHARE_COMMAND";
		public static const UPLOAD_COMMAND : String = "PRESENTATION_UPLOAD_COMMAND";
		
		// List of Events
		public static const READY_EVENT : String = "PRESENTATION_READY_EVENT";
		public static const CONVERT_SUCCESS_EVENT : String = "PRESENTATION_CONVERT_SUCCESS_EVENT";
		public static const UPDATE_PROGRESS_EVENT : String = "PRESENTATION_UPDATE_PROGRESS_EVENT";
		public static const EXTRACT_PROGRESS_EVENT : String = "PRESENTATION_EXTRACT_PROGRESS_EVENT";
		public static const CONVERT_PROGRESS_EVENT : String = "PRESENTATION_CONVERT_PROGRESS_EVENT";
		public static const CLEAR_EVENT : String = "PRESENTATION_CLEAR_EVENT";
		public static const VIEW_EVENT : String = "PRESENTATION_VIEW_EVENT";
		public static const UPLOAD_PROGRESS_EVENT : String = "PRESENTATION_UPLOAD_PROGRESS_EVENT";
		public static const UPLOAD_COMPLETED_EVENT : String = "PRESENTATION_UPLOAD_COMPLETED_EVENT";
		public static const UPLOAD_IO_ERROR_EVENT : String = "PRESENTATION_UPLOAD_IO_ERROR_EVENT";
		public static const UPLOAD_SECURITY_ERROR_EVENT : String = "PRESENTATION_UPLOAD_SECURITY_ERROR_EVENT";
		
		private var _presentationDelegate : PresentationDelegate = null;	
		public var presApp:PresentationApplication;
		public var presentation:PresentationModel = new PresentationModel();
		
		/**
		 * The default constructor. Should never be called directly as this class is a singleton, however
		 * ActionScript does not support provate constructors. 
		 * 
		 */		
		public function PresentationFacade() : void
		{
			super(ID);		
		}

		/**
		 * Return the instance of PresentationFacade. Should be called whenever you need a PresentationFacade
		 * Always returns the same instance. 
		 * @return 
		 * 
		 */
		public static function getInstance() : PresentationFacade
		{
			if ( instanceMap[ID] == null ) instanceMap[ID] = new PresentationFacade();
				
			return instanceMap[ID] as PresentationFacade;
	   	}	
	   	
	   	/**
	   	 * Initializes the controller part of this module 
	   	 * 
	   	 */	   	
	   	override protected function initializeController():void{
	   		super.initializeController();
	   		registerCommand(STARTUP, StartupCommand);
	   		registerCommand(STARTUPLOADWINDOW, StartUploadWindowCommand);
	   		registerCommand(START_PRESENTATION_APPLICATION, StartPresentationAppCommand);
	   	}	   	
	   	
	   	/**
	   	 * Returns the presentationDelegate of the Presentation module 
	   	 * @return 
	   	 * 
	   	 */	   	
	   	public function get presentationDelegate():PresentationDelegate
	   	{
	   		return retrieveProxy(PresentationDelegate.ID) as PresentationDelegate;
	   	}
	   	
	   	/**
	   	 * Sends out a notification to startup the Presentation module. Calls the StartupCommand 
	   	 * @param app
	   	 * 
	   	 */	   	
	   	public function startup(app:PresentationModule):void{
	 		  sendNotification(STARTUP, app);
	 		  registerMediator(presentation);
	   	}
	   	
	   	/**
	   	 * Sets the Presentation Application. It is created from the passed in parameters 
	   	 * @param userid
	   	 * @param room
	   	 * @param url
	   	 * @param docServiceAddress
	   	 * 
	   	 */	   	
	   	public function setPresentationApp(userid : Number, room : String, 
				url : String, docServiceAddress : String):void{
			presApp = new PresentationApplication(userid, room, url, docServiceAddress);
	   		sendNotification(START_PRESENTATION_APPLICATION, presApp);
	   	}
	   	
	   	/**
	   	 *  
	   	 * @return The presentationApplication of the Presentation module
	   	 * 
	   	 */	   	
	   	public function get presentationApp():PresentationApplication{
	   		return this.retrieveMediator(PresentationApplication.NAME) as PresentationApplication;
	   	}
	}
}