package org.bigbluebutton.air.presentation.views.selectWebcam {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.List;
	
	public interface ISelectStreamPopUp extends IView {
		function get streamList():List;
		function get actionButton():Button;
	}
}
