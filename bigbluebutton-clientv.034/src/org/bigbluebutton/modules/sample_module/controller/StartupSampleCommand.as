package org.bigbluebutton.modules.sample_module.controller
{
	import org.bigbluebutton.modules.sample_module.SampleModule;
	import org.bigbluebutton.modules.sample_module.SampleModuleMediator;
	import org.bigbluebutton.modules.sample_module.model.SampleProxy;
	import org.bigbluebutton.modules.sample_module.view.SampleWindow;
	import org.bigbluebutton.modules.sample_module.view.SampleWindowMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	/**
	 * This command is exected when the Module starts-up. The command creates a SampleModuleMediator and registers it 
	 * with the Facade of this module. 
	 * @author Denis
	 * 
	 */	
	public class StartupSampleCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			var note:SampleModule = notification.getBody() as SampleModule;
			
			facade.registerMediator(new SampleModuleMediator(note));
			facade.registerMediator(new SampleWindowMediator(note.getMDIComponent() as SampleWindow));
			facade.registerProxy(new SampleProxy("Hello World"));
		} 

	}
}