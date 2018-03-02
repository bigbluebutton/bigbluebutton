package org.bigbluebutton.lib.whiteboard.util {
	import org.bigbluebutton.lib.whiteboard.models.Annotation;
	import org.bigbluebutton.lib.whiteboard.models.AnnotationType;
	import org.bigbluebutton.lib.whiteboard.models.EllipseAnnotation;
	import org.bigbluebutton.lib.whiteboard.models.LineAnnotation;
	import org.bigbluebutton.lib.whiteboard.models.PencilAnnotation;
	import org.bigbluebutton.lib.whiteboard.models.RectangleAnnotation;
	import org.bigbluebutton.lib.whiteboard.models.TextAnnotation;
	import org.bigbluebutton.lib.whiteboard.models.TriangleAnnotation;
	
	public class AnnotationUtil {
		public static function createAnnotation(an:Object):Annotation {
			if (an.annotationType == undefined || an.annotationType == null || an.annotationType == "")
				return null;
			if (an.id == undefined || an.id == null || an.id == "")
				return null;
			if (an.status == undefined || an.status == null || an.status == "")
				return null;
			
			switch (an.annotationType) {
				case AnnotationType.PENCIL:
					return new PencilAnnotation(an.id, an.userId, an.annotationType, an.status, an.annotationInfo);
					break;
				case AnnotationType.RECTANGLE:
					return new RectangleAnnotation(an.id, an.userId, an.annotationType, an.status, an.annotationInfo);
					break;
				case AnnotationType.TRIANGLE:
					return new TriangleAnnotation(an.id, an.userId, an.annotationType, an.status, an.annotationInfo);
					break;
				case AnnotationType.ELLIPSE:
					return new EllipseAnnotation(an.id, an.userId, an.annotationType, an.status, an.annotationInfo);
					break;
				case AnnotationType.LINE:
					return new LineAnnotation(an.id, an.userId, an.annotationType, an.status, an.annotationInfo);
					break;
				case AnnotationType.TEXT:
					return new TextAnnotation(an.id, an.userId, an.annotationType, an.status, an.annotationInfo);
					break;
				default:
					return null;
					break;
			}
		}
	}
}
