package org.bigbluebutton.lib.whiteboard.util {
	import org.bigbluebutton.lib.whiteboard.models.AnnotationType;
	import org.bigbluebutton.lib.whiteboard.models.EllipseAnnotation;
	import org.bigbluebutton.lib.whiteboard.models.IAnnotation;
	import org.bigbluebutton.lib.whiteboard.models.LineAnnotation;
	import org.bigbluebutton.lib.whiteboard.models.PencilAnnotation;
	import org.bigbluebutton.lib.whiteboard.models.RectangleAnnotation;
	import org.bigbluebutton.lib.whiteboard.models.TextAnnotation;
	import org.bigbluebutton.lib.whiteboard.models.TriangleAnnotation;
	
	public class AnnotationUtil {
		public static function createAnnotation(an:Object):IAnnotation {
			if (an.type == undefined || an.type == null || an.type == "")
				return null;
			if (an.id == undefined || an.id == null || an.id == "")
				return null;
			if (an.status == undefined || an.status == null || an.status == "")
				return null;
			switch (an.type) {
				case AnnotationType.PENCIL:
					return new PencilAnnotation(an.type, an.id, an.whiteboardId, an.status, an.color, an.thickness, an.transparency, an.points);
					break;
				case AnnotationType.RECTANGLE:
					return new RectangleAnnotation(an.type, an.id, an.whiteboardId, an.status, an.color, an.thickness, an.transparency, an.points, an.square);
					break;
				case AnnotationType.TRIANGLE:
					return new TriangleAnnotation(an.type, an.id, an.whiteboardId, an.status, an.color, an.thickness, an.transparency, an.points);
					break;
				case AnnotationType.ELLIPSE:
					return new EllipseAnnotation(an.type, an.id, an.whiteboardId, an.status, an.color, an.thickness, an.transparency, an.points, an.circle);
					break;
				case AnnotationType.LINE:
					return new LineAnnotation(an.type, an.id, an.whiteboardId, an.status, an.color, an.thickness, an.transparency, an.points);
					break;
				case AnnotationType.TEXT:
					return new TextAnnotation(an.type, an.id, an.whiteboardId, an.status, an.fontColor, an.fontSize, an.calcedFontSize, an.dataPoints, an.textBoxHeight, an.textBoxWidth, an.x, an.y, an.text);
					break;
				default:
					return null;
					break;
			}
		}
	}
}
