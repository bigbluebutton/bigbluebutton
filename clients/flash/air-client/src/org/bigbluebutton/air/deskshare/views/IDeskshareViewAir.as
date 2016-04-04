package org.bigbluebutton.air.deskshare.views {
	
	import spark.components.Label;
	
	import org.bigbluebutton.lib.deskshare.views.IDeskshareView;
	
	public interface IDeskshareViewAir extends IDeskshareView {
		function get noDeskshareMessage():Label;
	}
}
