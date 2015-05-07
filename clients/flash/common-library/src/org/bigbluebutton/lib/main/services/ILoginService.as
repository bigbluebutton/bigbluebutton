package org.bigbluebutton.lib.main.services {
	
	import org.osflash.signals.ISignal;
	
	public interface ILoginService {
		function get joinSuccessSignal():ISignal;
		function get getConfigSuccessSignal():ISignal;
		function get joinFailureSignal():ISignal;
		function load(joinUrl:String):void;
	}
}
