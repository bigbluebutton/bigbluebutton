package org.bigbluebutton.lib.voice.views {
	
	import spark.components.Button;
	import spark.components.Label;
	import spark.components.ProgressBar;
	import spark.components.VGroup;
	import spark.layouts.HorizontalAlign;
	
	public class EchoTestViewBase extends VGroup {
		
		[Bindable]
		public var echoTestButton:Button;
		
		[Bindable]
		public var micLevelProgressBar:ProgressBar;
		
		[Bindable]
		public var yesButton:Button;
		
		[Bindable]
		public var noButton:Button;
		
		private var echoValidationGroup:VGroup;
		
		private var echoButtonGroup:VGroup;
		
		public function EchoTestViewBase() {
			super();
			
			// Echo Button Group
			echoButtonGroup = new VGroup();
			echoButtonGroup.percentWidth = 100;
			echoButtonGroup.horizontalAlign = HorizontalAlign.CENTER;
			addElement(echoButtonGroup);
			
			micLevelProgressBar = new ProgressBar();
			echoButtonGroup.addElement(micLevelProgressBar);
			
			echoTestButton = new Button();
			echoTestButton.label = "Start Echo Test";
			echoButtonGroup.addElement(echoTestButton);
			
			// Echo Validation Group
			echoValidationGroup = new VGroup();
			echoValidationGroup.percentWidth = 100;
			echoValidationGroup.horizontalAlign = HorizontalAlign.CENTER;
			addElement(echoValidationGroup);
			
			echoValidationGroup.visible = echoValidationGroup.includeInLayout = false;
			
			var echoLabel:Label = new Label();
			echoLabel.maxDisplayedLines = 5;
			echoLabel.percentWidth = 80;
			echoLabel.styleName = "echoTestLabel";
			echoLabel.text = "This is a private echo test. Speak a few words. Did you hear audio?";
			//echoLabel.maxWidth = echoValidationGroup.width - 40;
			echoValidationGroup.addElement(echoLabel);
			
			yesButton = new Button();
			yesButton.label = "Yes";
			echoValidationGroup.addElement(yesButton);
			
			noButton = new Button();
			noButton.label = "No";
			echoValidationGroup.addElement(noButton);
		}
		
		public function setTestingState(connected:Boolean):void {
			echoButtonGroup.visible = echoButtonGroup.includeInLayout = !connected;
			echoValidationGroup.visible = echoValidationGroup.includeInLayout = connected;
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
		/*
		   echoTestButton.parent["padding"] = getStyle("padding");
		   yesButton.parent["padding"] = getStyle("padding");
		 */
		}
	}
}
