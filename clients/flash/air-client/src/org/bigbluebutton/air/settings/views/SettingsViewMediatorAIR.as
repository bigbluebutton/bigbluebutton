package org.bigbluebutton.air.settings.views {
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	
	import spark.events.IndexChangeEvent;
	
	public class SettingsViewMediatorAIR extends SettingsViewMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override protected function onListIndexChangeEvent(e:IndexChangeEvent):void {
			var item:Object = dataProvider.getItemAt(e.newIndex);
			if (item.page != "exit") {
				uiSession.pushPage(PageEnum[String(item.page).toUpperCase() + "SETTINGS"]);
			} else {
				uiSession.pushPage(PageEnum.EXIT);
			}
		}
	}
}
