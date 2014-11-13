package org.bigbluebutton.clientcheck.view.mainview
{
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;

	public class MailButtonConfig implements IConfig
	{
		[Inject]
		public var injector:IInjector;

		[Inject]
		public var mediatorMap:IMediatorMap;

		public function configure():void
		{
			configureMediators();
		}

		private function configureMediators():void
		{
			mediatorMap.map(IMailButton).toMediator(MailButtonMediator);
		}
	}
}
