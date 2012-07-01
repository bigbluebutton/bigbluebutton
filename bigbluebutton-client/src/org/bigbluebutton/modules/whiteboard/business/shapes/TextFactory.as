package org.bigbluebutton.modules.whiteboard.business.shapes
{
	public class TextFactory extends GraphicFactory
	{
		public function TextFactory() {
			super(GraphicFactory.TEXT_FACTORY);
		}
		
		public function makeText(t:TextObject):TextObject {
			// pretty much a dummy method until further subclasses
			// of TextObject come into play
			return t;
		}
	}
}