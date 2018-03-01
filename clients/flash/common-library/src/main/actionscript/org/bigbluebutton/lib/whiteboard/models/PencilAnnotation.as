package org.bigbluebutton.lib.whiteboard.models {
	
	import flash.geom.Point;
	
	import mx.graphics.SolidColorStroke;
	
	import spark.components.Group;
	import spark.primitives.Path;
	
	public class PencilAnnotation extends Annotation {
		
		private var _path:Path;
		
		public function PencilAnnotation(id:String, userId:String, type:String, status:String, annInfo:Object) {
			super(id, userId, type, status, annInfo);
		}
		
		override protected function makeGraphic():void {
			_path.stroke = new SolidColorStroke(uint(annInfo.color), denormalize(annInfo.thickness, _parentWidth));
			
			if (status == AnnotationStatus.DRAW_END && (_annInfo.points.length > 2)) {
				drawFinishedLine();
			} else {
				drawSimpleLine();
			}
		}
		
		override public function update(an:Annotation):void {
			if (an.id == id) {
				_status = an.status;
				
				if (_status == AnnotationStatus.DRAW_UPDATE) {
					var newPoints:Array = an.annInfo.points;
					
					an.annInfo.points = annInfo.points.concat(an.annInfo.points);
					_annInfo = an.annInfo;
					
					if (shouldDraw()) {
						var newSegment:String = "";
						for (var i:int = 0; i < newPoints.length; ) {
							newSegment += "L ";
							newSegment += denormalize(newPoints[i++], _parentWidth) + " " + denormalize(newPoints[i++], _parentHeight) + " ";
						}
						_path.data += newSegment;
					}
				} else {
					_annInfo = an.annInfo;
					if (shouldDraw()) {
						makeGraphic();
					}
				}
			}
		}
		
		override public function draw(canvas:Group):void {
			if (!_path) {
				_path = new Path();
			}
			
			super.draw(canvas);
			
			if (!canvas.containsElement(_path)) {
				canvas.addElement(_path);
			}
		}
		
		override public function remove(canvas:Group):void {
			if (canvas.containsElement(_path)) {
				canvas.removeElement(_path);
				_path = null;
				super.remove(canvas);
			}
		}
		
		private function drawSimpleLine():void {
			var graphicsCommands:String = "";
			graphicsCommands += "M ";
			graphicsCommands += denormalize(annInfo.points[0], _parentWidth) + " " + denormalize(annInfo.points[1], _parentHeight) + " ";
			for (var i:int = 2; i < annInfo.points.length; i += 2) {
				graphicsCommands += "L ";
				graphicsCommands += denormalize(annInfo.points[i], _parentWidth) + " " + denormalize(annInfo.points[i + 1], _parentHeight) + " ";
			}
			_path.data = graphicsCommands;
		}
		
		private function drawFinishedLine():void {
			var commands:Array = _annInfo.commands as Array;
			var points:Array = _annInfo.points as Array;
			var graphicsCommands:String = "";
			for (var i:int = 0, j:int = 0; i < commands.length && j < points.length; i++) {
				switch (commands[i]) {
					case 1: // MOVE TO
						graphicsCommands += "M ";
						graphicsCommands += denormalize(annInfo.points[j++], _parentWidth) + " " + denormalize(annInfo.points[j++], _parentHeight) + " ";
						break;
					case 2: // LINE TO
						graphicsCommands += "L ";
						graphicsCommands += denormalize(annInfo.points[j++], _parentWidth) + " " + denormalize(annInfo.points[j++], _parentHeight) + " ";
						break;
					case 3: // Q CURVE TO
						graphicsCommands += "Q ";
						graphicsCommands += denormalize(points[j++], _parentWidth) + " " + denormalize(points[j++], _parentHeight) + " ";
						graphicsCommands += denormalize(points[i++], _parentWidth) + " " + denormalize(points[j++], _parentHeight) + " ";
						break;
					case 4: // C CURVE TO
						graphicsCommands += "C ";
						graphicsCommands += denormalize(points[j++], _parentWidth) + " " + denormalize(points[j++], _parentHeight) + " ";
						graphicsCommands += denormalize(points[j++], _parentWidth) + " " + denormalize(points[j++], _parentHeight) + " ";
						graphicsCommands += denormalize(points[j++], _parentWidth) + " " + denormalize(points[j++], _parentHeight) + " ";
						break;
				}
			}
			_path.data = graphicsCommands;
		}
	}
}
