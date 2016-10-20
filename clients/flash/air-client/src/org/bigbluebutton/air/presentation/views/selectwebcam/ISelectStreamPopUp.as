package org.bigbluebutton.air.presentation.views.selectwebcam {
	
	import spark.components.Button;
	import spark.components.List;
	
	import org.bigbluebutton.air.common.views.IView;
	
	public interface ISelectStreamPopUp extends IView {
		function get streamList():List;
		function get actionButton():Button;
		function close(commit:Boolean = false, data:* = undefined):void;
	}
}
