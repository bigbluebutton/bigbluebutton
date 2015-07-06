package org.bigbluebutton.modules.whiteboard.business.shapes
{
	import org.bigbluebutton.modules.polling.views.PollGraphic;
	import org.bigbluebutton.modules.whiteboard.models.Annotation;

	public class PollResult extends DrawObject
	{
		private var _pollGraphic:PollGraphic;
		
		private var sampledata:Array = [{a:"A", v:3}, 
			{a:"B", v:1},
			{a:"C", v:5},
			{a:"D", v:8}];
		
		public function PollResult(id:String, type:String, status:String) {
			super(id, type, status);
			
			_pollGraphic = new PollGraphic();
			this.addChild(_pollGraphic);
		}
		
		override public function draw(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
			var ao:Object = a.annotation;
			trace("RESULT = " + JSON.stringify(a));
			_pollGraphic.x = denormalize((ao.points as Array)[0], parentWidth);
			_pollGraphic.y = denormalize((ao.points as Array)[1], parentHeight);
			_pollGraphic.width = denormalize((ao.points as Array)[2], parentWidth);
			_pollGraphic.height = denormalize((ao.points as Array)[3], parentHeight);
			
			_pollGraphic.x = 0;
			_pollGraphic.y = 0;
			_pollGraphic.width = 20;
			_pollGraphic.height = 20;
			
			this.x = 0;
			this.y = 0;
			this.width = 20;
			this.height = 20;
			
			
			
			var answers:Array = ao.result as Array;
			var ans:Array = new Array();
			for (var j:int = 0; j < answers.length; j++) {
				var ar:Object = answers[j];
				var rs:Object = {a: ar.key, v: ar.num_votes as Number};
				trace("poll result a=[" + ar.key + "] v=[" + ar.num_votes +"]");
				ans.push(rs);
			}
			
			_pollGraphic.data = sampledata;
		}
		
		override public function redraw(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
			draw(a, parentWidth, parentHeight, zoom);
		}
	}
}