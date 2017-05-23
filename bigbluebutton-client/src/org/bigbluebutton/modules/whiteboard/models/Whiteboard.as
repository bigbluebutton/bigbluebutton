package org.bigbluebutton.modules.whiteboard.models
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;

  public class Whiteboard
  {
    private var _id:String;
    private var _historyLoaded:Boolean = false;
    private var _annotations:ArrayCollection = new ArrayCollection();
    
    public function Whiteboard(id:String) {
      _id = id;
    }
    
    public function get id():String {
      return _id;
    }
    
    public function get historyLoaded():Boolean {
      return _historyLoaded;
    }
    
    public function set historyLoaded(v:Boolean):void {
      _historyLoaded = v;
    }
    
    public function addAnnotation(annotation:Annotation):void {
      _annotations.addItem(annotation);
    }
    
    public function addAnnotationAt(annotation:Annotation, index:int):void {
      _annotations.addItemAt(annotation, index);
    }
    
    public function updateAnnotation(annotation:Annotation):void {
      var a:Annotation = getAnnotation(annotation.id);
      if (a != null) {
        if (annotation.type == AnnotationType.PENCIL && annotation.status == AnnotationStatus.DRAW_UPDATE) {
          annotation.annotation.points = a.annotation.points.concat(annotation.annotation.points);
        }
        a.annotation = annotation.annotation;
        a.status = annotation.status;
      } else {
        addAnnotation(annotation);
      }
    }
    
    public function undo(id:String):Annotation {
      for (var i:int = _annotations.length-1; i >= 0; i--) {
        if ((_annotations.getItemAt(i) as Annotation).id == id) {
          return (_annotations.removeItemAt(i) as Annotation);
        }
      }
      return null;
    }
    
    public function clearAll():void {
      _annotations.removeAll();
    }
    
    public function clear(userId:String):void {
      for (var i:int = _annotations.length-1; i >= 0; i--) {
        if ((_annotations.getItemAt(i) as Annotation).userId == userId) {
          _annotations.removeItemAt(i);
        }
      }
    }
    
    public function getAnnotations():Array {
      var a:Array = new Array();
      for (var i:int = 0; i < _annotations.length; i++) {
        a.push(_annotations.getItemAt(i) as Annotation);
      }
      return a;
    }
    
    public function getAnnotation(id:String):Annotation {
      for (var i:int = _annotations.length-1; i >= 0; i--) {
        if ((_annotations.getItemAt(i) as Annotation).id == id) {
          return _annotations.getItemAt(i) as Annotation;
        }
      }
      
      return null;
    }
  }
}