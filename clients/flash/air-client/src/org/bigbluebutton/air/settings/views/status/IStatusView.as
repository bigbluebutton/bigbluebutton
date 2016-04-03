package org.bigbluebutton.air.settings.views.status {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.List;
	import spark.components.RadioButtonGroup;
	
	public interface IStatusView extends IView {
		function get moodList():List;
	}
}
