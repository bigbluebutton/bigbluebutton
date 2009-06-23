package org.bigbluebutton.modules.deskShare.model.business
{
	import mx.controls.Alert;
	
	import org.bigbluebutton.modules.deskShare.view.DeskShareWindowMediator;
	
	public class StreamClient
	{
		private var mediator:DeskShareWindowMediator;
		
		public function StreamClient(mediator:DeskShareWindowMediator)
		{
			this.mediator = mediator;
		}
		
		public function onMetaData(infoObject:Object):void {
            Alert.show("got metadata");
        }

	}
}