package org.bigbluebutton.air.deskshare.views {
	
	import flash.net.NetConnection;
	
	import org.bigbluebutton.lib.deskshare.views.IDeskshareView;
	
	import spark.components.Group;
	import spark.components.Label;
	
	public interface IDeskshareViewAir extends IDeskshareView {
		function get noDeskshareMessage():Label;
	}
}
