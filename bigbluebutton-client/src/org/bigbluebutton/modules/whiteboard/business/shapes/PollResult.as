package org.bigbluebutton.modules.whiteboard.business.shapes
{
	import org.bigbluebutton.modules.polling.views.PollGraphic;
	import org.bigbluebutton.modules.whiteboard.models.Annotation;

	public class PollResult extends DrawObject
	{
		var _pollGraphic:PollGraphic;
		
		public function PollResult(id:String, type:String, status:String) {
			super(id, type, status);
			
			_pollGraphic = new PollGraphic();
		}
		
		override public function draw(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
			var ao:Object = a.annotation;
			
			_pollGraphic.x = denormalize((ao.points as Array)[0], parentWidth);
			_pollGraphic.y = denormalize((ao.points as Array)[1], parentHeight);
			_pollGraphic.width = denormalize((ao.points as Array)[2], parentWidth);
			_pollGraphic.height = denormalize((ao.points as Array)[3], parentHeight);
			
			_pollGraphic.data = ao.results;
		}
		
		override public function redraw(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
			draw(a, parentWidth, parentHeight, zoom);
		}
	}
}