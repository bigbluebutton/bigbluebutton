package org.bigbluebutton.clientcheck.view.mainview
{
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;

	public class MainViewConfig implements IConfig
	{
		[Inject]
		public var injector:IInjector;

		[Inject]
		public var mediatorMap:IMediatorMap;

		[Inject]
		public var signalCommandMap:ISignalCommandMap;

		public function configure():void
		{
			configureMediators();
			configureSignalsToCommands();
		}

		private function configureSignalsToCommands():void
		{

		}

		private function configureMediators():void
		{
			mediatorMap.map(IMainView).toMediator(MainViewMediator);
		}
	}
}
