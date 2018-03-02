package org.bigbluebutton.air.voice.views {
	import spark.components.Button;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.osmf.layout.HorizontalAlign;
	
	public class JoinAudioView extends NoTabView {
		
		[Bindable]
		public var listenOnlyButton:Button;
		
		[Bindable]
		public var microphoneButton:Button;
		
		public function JoinAudioView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			vLayout.horizontalAlign = HorizontalAlign.CENTER;
			layout = vLayout;
			
			listenOnlyButton = new Button();
			listenOnlyButton.label = "Listen Only";
			this.addElement(listenOnlyButton);
			
			microphoneButton = new Button();
			microphoneButton.label = "Microphone";
			this.addElement(microphoneButton);
		}
	}
}
