package org.bigbluebutton.modules.whiteboard.models
{
  import mx.collections.ArrayCollection;

  public class Whiteboard
  {
    private var _id:String;
    private var _historyLoaded:Boolean = false;
    private var _annotations:ArrayCollection = new ArrayCollection();
    private var _annotationsMap:Object = new Object();
    private var _multiUser:Boolean = false;
    
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
    
    public function get multiUser():Boolean {
      return _multiUser;
    }
    
    public function set multiUser(v:Boolean):void {
      _multiUser = v;
    }
    
    public function addAnnotation(annotation:Annotation):void {
      _annotations.addItem(annotation);
      _annotationsMap[annotation.id] = annotation;
    }
    
    public function addAnnotationAt(annotation:Annotation, index:int):void {
      _annotations.addItemAt(annotation, index);
      _annotationsMap[annotation.id] = annotation;
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
      if (_annotationsMap.propertyIsEnumerable(id)) {
        var annotation:Annotation = _annotationsMap[id];
        delete _annotationsMap[id];
        _annotations.removeItem(annotation);
        return annotation;
      } else {
        return null;
      }
    }
    
    public function clearAll():void {
      _annotations.removeAll();
      _annotationsMap = new Object();
    }
    
    public function clear(userId:String):void {
      for each (var annotation:Annotation in _annotationsMap) {
        if (annotation.userId == userId) {
          delete _annotationsMap[annotation.id]
          _annotations.removeItem(annotation);
        }
      }
    }
    
    public function getAnnotations():Array {
      return _annotations.toArray();
    }
    
    public function getAnnotation(id:String):Annotation {
      if (_annotationsMap.propertyIsEnumerable(id)) {
        return _annotationsMap[id];
      } else {
        return null;
      }
    }
  }
}