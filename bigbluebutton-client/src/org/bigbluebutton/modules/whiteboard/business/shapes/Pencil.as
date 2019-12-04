/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.modules.whiteboard.business.shapes
{
	import org.bigbluebutton.modules.whiteboard.models.Annotation;
	import org.bigbluebutton.modules.whiteboard.models.AnnotationStatus;

	public class Pencil extends DrawObject
	{
		private var numPointsDrawn:uint = 0;
		
		public function Pencil(id:String, type:String, status:String, userId:String) {
			super(id, type, status, userId);
		}
		
		override protected function makeGraphic():void {
			if (status == AnnotationStatus.DRAW_END && _ao.points.length > 2 && _ao.commands) {
				drawFinishedLine();
			} else {
				drawSimpleLine();
			}
		}
		
		private function drawSimpleLine():void {
			this.graphics.clear();
			
			this.graphics.lineStyle(denormalize(_ao.thickness, _parentWidth), _ao.color);
			
			var points:Array = _ao.points as Array;
			
			if (points.length > 2) {
				var graphicsCommands:Vector.<int> = new Vector.<int>();
				graphicsCommands.push(1);
				var coordinates:Vector.<Number> = new Vector.<Number>();
				coordinates.push(denormalize(points[0], _parentWidth), denormalize(points[1], _parentHeight));
				
				for (var i:int = 2; i < points.length; i += 2){
					if (i%2 == 0) graphicsCommands.push(2);
					coordinates.push(denormalize(points[i], _parentWidth), denormalize(points[i+1], _parentHeight));
				}
				
				if ((coordinates.length/2-1)%2 != 0)
					coordinates.push(denormalize(points[points.length-2], _parentWidth), denormalize(points[points.length-1], _parentHeight));
				
				this.graphics.drawPath(graphicsCommands, coordinates);
			} else {
				this.graphics.lineStyle(1, _ao.color);
				this.graphics.beginFill(_ao.color);
				var diameter:Number = denormalize(_ao.thickness, _parentWidth);
				this.graphics.drawEllipse(denormalize(points[0], _parentWidth)-diameter/2, denormalize(points[1], _parentHeight)-diameter/2, diameter, diameter);
				this.graphics.endFill();
				
				//setup for the next line command
				graphics.moveTo(denormalize(points[0], _parentWidth), denormalize(points[1], _parentHeight));
			}
			
			numPointsDrawn = points.length;
			
			this.alpha = 1;
		}
		
		private function drawFinishedLine():void {
			graphics.clear();
			
			graphics.lineStyle(denormalize(_ao.thickness, _parentWidth), _ao.color);
			
			var commands:Array = _ao.commands as Array;
			var points:Array = _ao.points as Array;
			
			var graphicsCommands:Vector.<int> = new Vector.<int>();
			var coordinates:Vector.<Number> = new Vector.<Number>();
			
			for (var i:int=0, j:int=0; i<commands.length && j<points.length; i++){
				switch (commands[i]) {
					case 1: // MOVE_TO
						graphicsCommands.push(1);
						coordinates.push(denormalize(points[j++], _parentWidth), denormalize(points[j++], _parentHeight));
						break;
					case 2: // LINE_TO
						graphicsCommands.push(2);
						coordinates.push(denormalize(points[j++], _parentWidth), denormalize(points[j++], _parentHeight));
						break;
					case 3: // Q_CURVE_TO
						graphicsCommands.push(3);
						coordinates.push(denormalize(points[j++], _parentWidth), denormalize(points[j++], _parentHeight));
						coordinates.push(denormalize(points[j++], _parentWidth), denormalize(points[j++], _parentHeight));
						break;
					case 4: // C_CURVE_TO
						graphicsCommands.push(6);
						coordinates.push(denormalize(points[j++], _parentWidth), denormalize(points[j++], _parentHeight));
						coordinates.push(denormalize(points[j++], _parentWidth), denormalize(points[j++], _parentHeight));
						coordinates.push(denormalize(points[j++], _parentWidth), denormalize(points[j++], _parentHeight));
						break;
				}
			}
			
			graphics.drawPath(graphicsCommands, coordinates);
		}
		
		override public function updateAnnotation(a:Annotation):void {
			status = a.status;
			
			if (status == AnnotationStatus.DRAW_UPDATE) {
				var newPoints:Array = a.annotation.points;
				
				_ao = a.annotation;
				
				var graphicsCommands:Vector.<int> = new Vector.<int>();
				var coordinates:Vector.<Number> = new Vector.<Number>();
				
				graphics.lineStyle(denormalize(_ao.thickness, _parentWidth), _ao.color);
				for (var i:int=numPointsDrawn; i<newPoints.length;){
					graphicsCommands.push(2);
					coordinates.push(denormalize(newPoints[i++], _parentWidth), denormalize(newPoints[i++], _parentHeight));
				}
				
				graphics.drawPath(graphicsCommands, coordinates);
				
				numPointsDrawn = newPoints.length;
			} else {
				_ao = a.annotation;
				makeGraphic();
			}
		}
	}
}