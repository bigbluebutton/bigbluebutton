package org.bigbluebutton.modules.whiteboard.controller
{
	import org.bigbluebutton.common.Constants;
	import org.bigbluebutton.main.MainApplicationFacade;
	import org.bigbluebutton.modules.viewers.model.business.Conference;
	import org.bigbluebutton.modules.whiteboard.WhiteboardModule;
	import org.bigbluebutton.modules.whiteboard.WhiteboardModuleMediator;
	import org.bigbluebutton.modules.whiteboard.model.DrawProxy;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	/**
	 * The StartupCommand class extends the SimpleCommand class of the PureMVC framework.
	 * <p>
	 * Once the command is created, the execute method of the class is automaticaly called.
	 * The purpose of this class is to initialize the rest of the Whiteboard application, including the
	 * BoardMediator and the DrawProxy classes. 
	 * @author dzgonjan
	 * 
	 */	
	public class StartupCommand extends SimpleCommand
	{	
		/**
		 * The execute method that is executed upon creation of this class 
		 * @param notification the notification which triggered the SimpleCommand class.
		 * 
		 */		
		override public function execute(notification:INotification):void{
			
			var app:WhiteboardModule = notification.getBody() as WhiteboardModule;
			facade.registerMediator(new WhiteboardModuleMediator(app));
			
			var conf:Conference = MainApplicationFacade.getInstance().getConference();
			var uri:String ='rtmp://' + Constants.red5Host + '/oflaDemo/' + conf.room;
			facade.registerProxy(new DrawProxy(uri));
		}

	}
}