package org.bigbluebutton.core.services
{
	import mx.styles.StyleManager;
	
	public class SkinningService
	{
		public function loadSkins(skin:String):void {
			if (skin != "") StyleManager.loadStyleDeclarations(skin); 
		}
	}
}