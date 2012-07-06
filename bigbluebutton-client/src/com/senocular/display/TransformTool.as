package com.senocular.display {
	
	import flash.display.DisplayObject;
	import flash.display.DisplayObjectContainer;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.events.Event;
	import flash.events.EventPhase;
	import flash.events.MouseEvent;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.geom.Transform;
	import flash.utils.Dictionary;
	
	// TODO: Documentation
	// TODO: Handle 0-size transformations
	
	/**
	 * Creates a transform tool that allows uaers to modify display objects on the screen
	 * 
	 * @usage
	 * <pre>
	 * var tool:TransformTool = new TransformTool();
	 * addChild(tool);
	 * tool.target = targetDisplayObject;
	 * </pre>
	 * 
	 * @version 0.9.10
	 * @author  Trevor McCauley
	 * @author  http://www.senocular.com
	 */
	public class TransformTool extends Sprite {
		
		// Variables
		private var toolInvertedMatrix:Matrix = new Matrix();
		private var innerRegistration:Point = new Point();
		private var registrationLog:Dictionary = new Dictionary(true);
		
		private var targetBounds:Rectangle = new Rectangle();
		
		private var mouseLoc:Point = new Point();
		private var mouseOffset:Point = new Point();
		private var innerMouseLoc:Point = new Point();
		private var interactionStart:Point = new Point();
		private var innerInteractionStart:Point = new Point();
		private var interactionStartAngle:Number = 0;
		private var interactionStartMatrix:Matrix = new Matrix();
		
		private var toolSprites:Sprite = new Sprite();
		private var lines:Sprite = new Sprite();
		private var moveControls:Sprite = new Sprite();
		private var registrationControls:Sprite = new Sprite();
		private var rotateControls:Sprite = new Sprite();
		private var scaleControls:Sprite = new Sprite();
		private var skewControls:Sprite = new Sprite();
		private var cursors:Sprite = new Sprite();
		private var customControls:Sprite = new Sprite();
		private var customCursors:Sprite = new Sprite();
		
		// With getter/setters
		private var _target:DisplayObject;
		private var _toolMatrix:Matrix = new Matrix();
		private var _globalMatrix:Matrix = new Matrix();
		
		private var _registration:Point = new Point();
		
		private var _livePreview:Boolean = true;
		private var _raiseNewTargets:Boolean = true;
		private var _moveNewTargets:Boolean = false;
		private var _moveEnabled:Boolean = true;
		private var _registrationEnabled:Boolean = true;
		private var _rotationEnabled:Boolean = true;
		private var _scaleEnabled:Boolean = true; 
		private var _skewEnabled:Boolean = true;
		private var _outlineEnabled:Boolean = true;
		private var _customControlsEnabled:Boolean = true;
		private var _customCursorsEnabled:Boolean = true;
		private var _cursorsEnabled:Boolean = true; 
		private var _rememberRegistration:Boolean = true;
		
		private var _constrainScale:Boolean = false;
		private var _constrainRotationAngle:Number = Math.PI/4; // default at 45 degrees
		private var _constrainRotation:Boolean = false;
		
		private var _moveUnderObjects:Boolean = true;
		private var _maintainControlForm:Boolean = true;
		private var _controlSize:Number = 8;
			
		private var _maxScaleX:Number = Infinity;
		private var _maxScaleY:Number = Infinity;
		
		private var _boundsTopLeft:Point = new Point();
		private var _boundsTop:Point = new Point();
		private var _boundsTopRight:Point = new Point();
		private var _boundsRight:Point = new Point();
		private var _boundsBottomRight:Point = new Point();
		private var _boundsBottom:Point = new Point();
		private var _boundsBottomLeft:Point = new Point();
		private var _boundsLeft:Point = new Point();
		private var _boundsCenter:Point = new Point();
		
		private var _currentControl:TransformToolControl;
		
		private var _moveControl:TransformToolControl;
		private var _registrationControl:TransformToolControl;
		private var _outlineControl:TransformToolControl;
		private var _scaleTopLeftControl:TransformToolControl;
		private var _scaleTopControl:TransformToolControl;
		private var _scaleTopRightControl:TransformToolControl;
		private var _scaleRightControl:TransformToolControl;
		private var _scaleBottomRightControl:TransformToolControl;
		private var _scaleBottomControl:TransformToolControl;
		private var _scaleBottomLeftControl:TransformToolControl;
		private var _scaleLeftControl:TransformToolControl;
		private var _rotationTopLeftControl:TransformToolControl;
		private var _rotationTopRightControl:TransformToolControl;
		private var _rotationBottomRightControl:TransformToolControl;
		private var _rotationBottomLeftControl:TransformToolControl;
		private var _skewTopControl:TransformToolControl;
		private var _skewRightControl:TransformToolControl;
		private var _skewBottomControl:TransformToolControl;
		private var _skewLeftControl:TransformToolControl;
			
		private var _moveCursor:TransformToolCursor;
		private var _registrationCursor:TransformToolCursor;
		private var _rotationCursor:TransformToolCursor;
		private var _scaleCursor:TransformToolCursor;
		private var _skewCursor:TransformToolCursor;
		
		// Event constants
		public static const NEW_TARGET:String = "newTarget";
		public static const TRANSFORM_TARGET:String = "transformTarget";
		public static const TRANSFORM_TOOL:String = "transformTool";
		public static const CONTROL_INIT:String = "controlInit";
		public static const CONTROL_TRANSFORM_TOOL:String = "controlTransformTool";
		public static const CONTROL_DOWN:String = "controlDown";
		public static const CONTROL_MOVE:String = "controlMove";
		public static const CONTROL_UP:String = "controlUp";
		public static const CONTROL_PREFERENCE:String = "controlPreference";
		
		// Skin constants
		public static const REGISTRATION:String = "registration";
		public static const SCALE_TOP_LEFT:String = "scaleTopLeft";
		public static const SCALE_TOP:String = "scaleTop";
		public static const SCALE_TOP_RIGHT:String = "scaleTopRight";
		public static const SCALE_RIGHT:String = "scaleRight";
		public static const SCALE_BOTTOM_RIGHT:String = "scaleBottomRight";
		public static const SCALE_BOTTOM:String = "scaleBottom";
		public static const SCALE_BOTTOM_LEFT:String = "scaleBottomLeft";
		public static const SCALE_LEFT:String = "scaleLeft";
		public static const ROTATION_TOP_LEFT:String = "rotationTopLeft";
		public static const ROTATION_TOP_RIGHT:String = "rotationTopRight";
		public static const ROTATION_BOTTOM_RIGHT:String = "rotationBottomRight";
		public static const ROTATION_BOTTOM_LEFT:String = "rotationBottomLeft";
		public static const SKEW_TOP:String = "skewTop";
		public static const SKEW_RIGHT:String = "skewRight";
		public static const SKEW_BOTTOM:String = "skewBottom";
		public static const SKEW_LEFT:String = "skewLeft";
		public static const CURSOR_REGISTRATION:String = "cursorRegistration";
		public static const CURSOR_MOVE:String = "cursorMove";
		public static const CURSOR_SCALE:String = "cursorScale";
		public static const CURSOR_ROTATION:String = "cursorRotate";
		public static const CURSOR_SKEW:String = "cursorSkew";
		
		// Properties
		
		/**
		 * The display object the transform tool affects
		 */
		public function get target():DisplayObject {
			return _target;
		}
		public function set target(d:DisplayObject):void {
			
			// null target, set target as null
			if (!d) {
				if (_target) {
					_target = null;
					updateControlsVisible();
					dispatchEvent(new Event(NEW_TARGET));
				}
				return;
			}else{
				
				// invalid target, do nothing
				if (d == _target || d == this || contains(d)
				|| (d is DisplayObjectContainer && (d as DisplayObjectContainer).contains(this))) {
					return;
				}
				
				// valid target, set and update
				_target = d;
				updateMatrix();
				setNewRegistation();
				updateControlsVisible();
				
				// raise to top of display list if applies
				if (_raiseNewTargets) {
					raiseTarget();
				}
			}
			
			// if not moving new targets, apply transforms
			if (!_moveNewTargets) {
				apply();
			}
			
			// send event; updates control points
			dispatchEvent(new Event(NEW_TARGET));
				
			// initiate move interaction if applies after controls updated
			if (_moveNewTargets && _moveEnabled && _moveControl) {
				_currentControl = _moveControl;
				_currentControl.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_DOWN));
			}
		}
		
		/**
		 * When true, new targets are placed at the top of their display list
		 * @see target
		 */
		public function get raiseNewTargets():Boolean {
			return _raiseNewTargets;
		}
		public function set raiseNewTargets(b:Boolean):void {
			_raiseNewTargets = b;
		}
		
		/**
		 * When true, new targets are immediately given a move interaction and can be dragged
		 * @see target
		 * @see moveEnabled
		 */
		public function get moveNewTargets():Boolean {
			return _moveNewTargets;
		}
		public function set moveNewTargets(b:Boolean):void {
			_moveNewTargets = b;
		}
		
		/**
		 * When true, the target instance scales with the tool as it is transformed.
		 * When false, transforms in the tool are only reflected when transforms are completed.
		 */
		public function get livePreview():Boolean {
			return _livePreview;
		}
		public function set livePreview(b:Boolean):void {
			_livePreview = b;
		}
		
		/**
		 * Controls the default Control sizes of controls used by the tool
		 */
		public function get controlSize():Number {
			return _controlSize;
		}
		public function set controlSize(n:Number):void {
			if (_controlSize != n) {
				_controlSize = n;
				dispatchEvent(new Event(CONTROL_PREFERENCE));
			}
		}
		
		/**
		 * When true, counters transformations applied to controls by their parent containers
		 */
		public function get maintainControlForm():Boolean {
			return _maintainControlForm;
		}
		public function set maintainControlForm(b:Boolean):void {
			if (_maintainControlForm != b) {
				_maintainControlForm = b;
				dispatchEvent(new Event(CONTROL_PREFERENCE));
			}
		}
		
		/**
		 * When true (default), the transform tool uses an invisible control using the shape of the current
		 * target to allow movement. This means any objects above the target but below the
		 * tool cannot be clicked on since this hidden control will be clicked on first
		 * (allowing you to move objects below others without selecting the objects on top).
		 * When false, the target itself is used for movement and any objects above the target
		 * become clickable preventing tool movement if the target itself is not clicked directly.
		 */
		public function get moveUnderObjects():Boolean {
			return _moveUnderObjects;
		}
		public function set moveUnderObjects(b:Boolean):void {
			if (_moveUnderObjects != b) {
				_moveUnderObjects = b;
				dispatchEvent(new Event(CONTROL_PREFERENCE));
			}
		}
		
		/**
		 * The transform matrix of the tool
		 * as it exists in its on coordinate space
		 * @see globalMatrix
		 */
		public function get toolMatrix():Matrix {
			return _toolMatrix.clone();
		}
		public function set toolMatrix(m:Matrix):void {
			updateMatrix(m, false);
			updateRegistration();
			dispatchEvent(new Event(TRANSFORM_TOOL));
		}
		
		/**
		 * The transform matrix of the tool
		 * as it appears in global space
		 * @see toolMatrix
		 */
		public function get globalMatrix():Matrix {
			var _globalMatrix:Matrix = _toolMatrix.clone();
			_globalMatrix.concat(transform.concatenatedMatrix);
			return _globalMatrix;
		}
		public function set globalMatrix(m:Matrix):void {
			updateMatrix(m);
			updateRegistration();
			dispatchEvent(new Event(TRANSFORM_TOOL));
		}
		
		/**
		 * The location of the registration point in the tool. Note: registration
		 * points are tool-specific.  If you change the registration point of a
		 * target, the new registration will only be reflected in the tool used
		 * to change that point.
		 * @see registrationEnabled
		 * @see rememberRegistration
		 */
		public function get registration():Point {
			return _registration.clone();
		}
		public function set registration(p:Point):void {
			_registration = p.clone();
			innerRegistration = toolInvertedMatrix.transformPoint(_registration);
			
			if (_rememberRegistration) {
				// log new registration point for the next
				// time this target is selected
				registrationLog[_target] = innerRegistration;
			}
			dispatchEvent(new Event(TRANSFORM_TOOL));
		}
		
		/**
		 * The current control being used in the tool if being manipulated.
		 * This value is null if the user is not transforming the tool.
		 */
		public function get currentControl():TransformToolControl {
			return _currentControl;
		}
		
		/**
		 * Allows or disallows users to move the tool
		 */
		public function get moveEnabled():Boolean {
			return _moveEnabled;
		}
		public function set moveEnabled(b:Boolean):void {
			if (_moveEnabled != b) {
				_moveEnabled = b;
				updateControlsEnabled();
			}
		}
		
		/**
		 * Allows or disallows users to see and move the registration point
		 * @see registration
		 * @see rememberRegistration
		 */
		public function get registrationEnabled():Boolean {
			return _registrationEnabled;
		}
		public function set registrationEnabled(b:Boolean):void {
			if (_registrationEnabled != b) {
				_registrationEnabled = b;
				updateControlsEnabled();
			}
		}
		
		/**
		 * Allows or disallows users to see and adjust rotation controls
		 */
		public function get rotationEnabled():Boolean {
			return _rotationEnabled;
		}
		public function set rotationEnabled(b:Boolean):void {
			if (_rotationEnabled != b) {
				_rotationEnabled = b;
				updateControlsEnabled();
			}
		}
		
		/**
		 * Allows or disallows users to see and adjust scale controls
		 */
		public function get scaleEnabled():Boolean {
			return _scaleEnabled;
		}
		public function set scaleEnabled(b:Boolean):void {
			if (_scaleEnabled != b) {
				_scaleEnabled = b;
				updateControlsEnabled();
			}
		}
		
		/**
		 * Allows or disallows users to see and adjust skew controls
		 */
		public function get skewEnabled():Boolean {
			return _skewEnabled;
		}
		public function set skewEnabled(b:Boolean):void {
			if (_skewEnabled != b) {
				_skewEnabled = b;
				updateControlsEnabled();
			}
		}
		
		/**
		 * Allows or disallows users to see tool boundry outlines
		 */
		public function get outlineEnabled():Boolean {
			return _outlineEnabled;
		}
		public function set outlineEnabled(b:Boolean):void {
			if (_outlineEnabled != b) {
				_outlineEnabled = b;
				updateControlsEnabled();
			}
		}
		
		/**
		 * Allows or disallows users to see native cursors
		 * @see addCursor
		 * @see removeCursor
		 * @see customCursorsEnabled
		 */
		public function get cursorsEnabled():Boolean {
			return _cursorsEnabled;
		}
		public function set cursorsEnabled(b:Boolean):void {
			if (_cursorsEnabled != b) {
				_cursorsEnabled = b;
				updateControlsEnabled();
			}
		}
		
		/**
		 * Allows or disallows users to see and use custom controls
		 * @see addControl
		 * @see removeControl
		 * @see customCursorsEnabled
		 */
		public function get customControlsEnabled():Boolean {
			return _customControlsEnabled;
		}
		public function set customControlsEnabled(b:Boolean):void {
			if (_customControlsEnabled != b) {
				_customControlsEnabled = b;
				updateControlsEnabled();
				dispatchEvent(new Event(CONTROL_PREFERENCE));
			}
		}
		
		/**
		 * Allows or disallows users to see custom cursors
		 * @see addCursor
		 * @see removeCursor
		 * @see cursorsEnabled
		 * @see customControlsEnabled
		 */
		public function get customCursorsEnabled():Boolean {
			return _customCursorsEnabled;
		}
		public function set customCursorsEnabled(b:Boolean):void {
			if (_customCursorsEnabled != b) {
				_customCursorsEnabled = b;
				updateControlsEnabled();
				dispatchEvent(new Event(CONTROL_PREFERENCE));
			}
		}
		
		/**
		 * Allows or disallows users to see custom cursors
		 * @see registration
		 */
		public function get rememberRegistration():Boolean {
			return _rememberRegistration;
		}
		public function set rememberRegistration(b:Boolean):void {
			_rememberRegistration = b;
			if (!_rememberRegistration) {
				registrationLog = new Dictionary(true);
			}
		}
		
		/**
		 * Allows constraining of scale transformations that scale along both X and Y.
		 * @see constrainRotation
		 */
		public function get constrainScale():Boolean {
			return _constrainScale;
		}
		public function set constrainScale(b:Boolean):void {
			if (_constrainScale != b) {
				_constrainScale = b;
				dispatchEvent(new Event(CONTROL_PREFERENCE));
			}
		}
		
		/**
		 * Allows constraining of rotation transformations by an angle
		 * @see constrainRotationAngle
		 * @see constrainScale
		 */
		public function get constrainRotation():Boolean {
			return _constrainRotation;
		}
		public function set constrainRotation(b:Boolean):void {
			if (_constrainRotation != b) {
				_constrainRotation = b;
				dispatchEvent(new Event(CONTROL_PREFERENCE));
			}
		}
		
		/**
		 * The angle at which rotation is constrainged when constrainRotation is true
		 * @see constrainRotation
		 */
		public function get constrainRotationAngle():Number {
			return _constrainRotationAngle * 180/Math.PI;
		}
		public function set constrainRotationAngle(n:Number):void {
			var angleInRadians:Number = n * Math.PI/180;
			if (_constrainRotationAngle != angleInRadians) {
				_constrainRotationAngle = angleInRadians;
				dispatchEvent(new Event(CONTROL_PREFERENCE));
			}
		}
		
		/**
		 * The maximum scaleX allowed to be applied to a target
		 */
		public function get maxScaleX():Number {
			return _maxScaleX;
		}
		public function set maxScaleX(n:Number):void {
			_maxScaleX = n;
		}
		
		/**
		 * The maximum scaleY allowed to be applied to a target
		 */
		public function get maxScaleY():Number {
			return _maxScaleY;
		}
		public function set maxScaleY(n:Number):void {
			_maxScaleY = n;
		}
		
		public function get boundsTopLeft():Point { return _boundsTopLeft.clone(); }
		public function get boundsTop():Point { return _boundsTop.clone(); }
		public function get boundsTopRight():Point { return _boundsTopRight.clone(); }
		public function get boundsRight():Point { return _boundsRight.clone(); }
		public function get boundsBottomRight():Point { return _boundsBottomRight.clone(); }
		public function get boundsBottom():Point { return _boundsBottom.clone(); }
		public function get boundsBottomLeft():Point { return _boundsBottomLeft.clone(); }
		public function get boundsLeft():Point { return _boundsLeft.clone(); }
		public function get boundsCenter():Point { return _boundsCenter.clone(); }
		public function get mouse():Point { return new Point(mouseX, mouseY); }
		
		public function get moveControl():TransformToolControl { return _moveControl; }
		public function get registrationControl():TransformToolControl { return _registrationControl; }
		public function get outlineControl():TransformToolControl { return _outlineControl; }
		public function get scaleTopLeftControl():TransformToolControl { return _scaleTopLeftControl; }
		public function get scaleTopControl():TransformToolControl { return _scaleTopControl; }
		public function get scaleTopRightControl():TransformToolControl { return _scaleTopRightControl; }
		public function get scaleRightControl():TransformToolControl { return _scaleRightControl; }
		public function get scaleBottomRightControl():TransformToolControl { return _scaleBottomRightControl; }
		public function get scaleBottomControl():TransformToolControl { return _scaleBottomControl; }
		public function get scaleBottomLeftControl():TransformToolControl { return _scaleBottomLeftControl; }
		public function get scaleLeftControl():TransformToolControl { return _scaleLeftControl; }
		public function get rotationTopLeftControl():TransformToolControl { return _rotationTopLeftControl; }
		public function get rotationTopRightControl():TransformToolControl { return _rotationTopRightControl; }
		public function get rotationBottomRightControl():TransformToolControl { return _rotationBottomRightControl; }
		public function get rotationBottomLeftControl():TransformToolControl { return _rotationBottomLeftControl; }
		public function get skewTopControl():TransformToolControl { return _skewTopControl; }
		public function get skewRightControl():TransformToolControl { return _skewRightControl; }
		public function get skewBottomControl():TransformToolControl { return _skewBottomControl; }
		public function get skewLeftControl():TransformToolControl { return _skewLeftControl; }
		
		public function get moveCursor():TransformToolCursor { return _moveCursor; }
		public function get registrationCursor():TransformToolCursor { return _registrationCursor; }
		public function get rotationCursor():TransformToolCursor { return _rotationCursor; }
		public function get scaleCursor():TransformToolCursor { return _scaleCursor; }
		public function get skewCursor():TransformToolCursor { return _skewCursor; }
		
		/**
		 * TransformTool Constructor.
		 * Creates new instances of the transform tool
		 */
		public function TransformTool() {
			createControls();
		}
		
		/**
		 * Provides a string representation of the transform instance
		 */
		override public function toString():String {
			return "[Transform Tool: target=" + String(_target) + "]" ;
		}
		
		// Setup
		private function createControls():void {
			
			// defining controls
			_moveControl = new TransformToolMoveShape("move", moveInteraction);
			_registrationControl = new TransformToolRegistrationControl(REGISTRATION, registrationInteraction, "registration");
			_rotationTopLeftControl = new TransformToolRotateControl(ROTATION_TOP_LEFT, rotationInteraction, "boundsTopLeft");
			_rotationTopRightControl = new TransformToolRotateControl(ROTATION_TOP_RIGHT, rotationInteraction, "boundsTopRight");
			_rotationBottomRightControl = new TransformToolRotateControl(ROTATION_BOTTOM_RIGHT, rotationInteraction, "boundsBottomRight");
			_rotationBottomLeftControl = new TransformToolRotateControl(ROTATION_BOTTOM_LEFT, rotationInteraction, "boundsBottomLeft");
			_scaleTopLeftControl = new TransformToolScaleControl(SCALE_TOP_LEFT, scaleBothInteraction, "boundsTopLeft");
			_scaleTopControl = new TransformToolScaleControl(SCALE_TOP, scaleYInteraction, "boundsTop");
			_scaleTopRightControl = new TransformToolScaleControl(SCALE_TOP_RIGHT, scaleBothInteraction, "boundsTopRight");
			_scaleRightControl = new TransformToolScaleControl(SCALE_RIGHT, scaleXInteraction, "boundsRight");
			_scaleBottomRightControl = new TransformToolScaleControl(SCALE_BOTTOM_RIGHT, scaleBothInteraction, "boundsBottomRight");
			_scaleBottomControl = new TransformToolScaleControl(SCALE_BOTTOM, scaleYInteraction, "boundsBottom");
			_scaleBottomLeftControl = new TransformToolScaleControl(SCALE_BOTTOM_LEFT, scaleBothInteraction, "boundsBottomLeft");
			_scaleLeftControl = new TransformToolScaleControl(SCALE_LEFT, scaleXInteraction, "boundsLeft");
			_skewTopControl = new TransformToolSkewBar(SKEW_TOP, skewXInteraction, "boundsTopRight", "boundsTopLeft", "boundsTopRight");
			_skewRightControl = new TransformToolSkewBar(SKEW_RIGHT, skewYInteraction, "boundsBottomRight", "boundsTopRight", "boundsBottomRight");
			_skewBottomControl = new TransformToolSkewBar(SKEW_BOTTOM, skewXInteraction, "boundsBottomLeft", "boundsBottomRight", "boundsBottomLeft");
			_skewLeftControl = new TransformToolSkewBar(SKEW_LEFT, skewYInteraction, "boundsTopLeft", "boundsBottomLeft", "boundsTopLeft");
			
			// defining cursors
			_moveCursor = new TransformToolMoveCursor();
			_moveCursor.addReference(_moveControl);
			
			_registrationCursor = new TransformToolRegistrationCursor();
			_registrationCursor.addReference(_registrationControl);
			
			_rotationCursor = new TransformToolRotateCursor();
			_rotationCursor.addReference(_rotationTopLeftControl);
			_rotationCursor.addReference(_rotationTopRightControl);
			_rotationCursor.addReference(_rotationBottomRightControl);
			_rotationCursor.addReference(_rotationBottomLeftControl);
			
			_scaleCursor = new TransformToolScaleCursor();
			_scaleCursor.addReference(_scaleTopLeftControl);
			_scaleCursor.addReference(_scaleTopControl);
			_scaleCursor.addReference(_scaleTopRightControl);
			_scaleCursor.addReference(_scaleRightControl);
			_scaleCursor.addReference(_scaleBottomRightControl);
			_scaleCursor.addReference(_scaleBottomControl);
			_scaleCursor.addReference(_scaleBottomLeftControl);
			_scaleCursor.addReference(_scaleLeftControl);
			
			_skewCursor = new TransformToolSkewCursor();
			_skewCursor.addReference(_skewTopControl);
			_skewCursor.addReference(_skewRightControl);
			_skewCursor.addReference(_skewBottomControl);
			_skewCursor.addReference(_skewLeftControl);
			
			// adding controls
			addToolControl(moveControls, _moveControl);
			addToolControl(registrationControls, _registrationControl);
			addToolControl(rotateControls, _rotationTopLeftControl);
			addToolControl(rotateControls, _rotationTopRightControl);
			addToolControl(rotateControls, _rotationBottomRightControl);
			addToolControl(rotateControls, _rotationBottomLeftControl);
			addToolControl(scaleControls, _scaleTopControl);
			addToolControl(scaleControls, _scaleRightControl);
			addToolControl(scaleControls, _scaleBottomControl);
			addToolControl(scaleControls, _scaleLeftControl);
			addToolControl(scaleControls, _scaleTopLeftControl);
			addToolControl(scaleControls, _scaleTopRightControl);
			addToolControl(scaleControls, _scaleBottomRightControl);
			addToolControl(scaleControls, _scaleBottomLeftControl);
			addToolControl(skewControls, _skewTopControl);
			addToolControl(skewControls, _skewRightControl);
			addToolControl(skewControls, _skewBottomControl);
			addToolControl(skewControls, _skewLeftControl);
			addToolControl(lines, new TransformToolOutline("outline"), false);
			
			// adding cursors
			addToolControl(cursors, _moveCursor, false);
			addToolControl(cursors, _registrationCursor, false);
			addToolControl(cursors, _rotationCursor, false);
			addToolControl(cursors, _scaleCursor, false);
			addToolControl(cursors, _skewCursor, false);
			
			
			updateControlsEnabled();
		}
		
		private function addToolControl(container:Sprite, control:TransformToolControl, interactive:Boolean = true):void {
			control.transformTool = this;
			if (interactive) {
				control.addEventListener(MouseEvent.MOUSE_DOWN, startInteractionHandler);	
			}
			container.addChild(control);
			control.dispatchEvent(new Event(CONTROL_INIT));
		}
		
		/**
		 * Allows you to add a custom control to the tool
		 * @see removeControl
		 * @see addCursor
		 * @see removeCursor
		 */
		public function addControl(control:TransformToolControl):void {
			addToolControl(customControls, control);
		}
		
		/**
		 * Allows you to remove a custom control to the tool
		 * @see addControl
		 * @see addCursor
		 * @see removeCursor
		 */
		public function removeControl(control:TransformToolControl):TransformToolControl {
			if (customControls.contains(control)) {
				customControls.removeChild(control);
				return control;
			}
			return null;
		}
		
		/**
		 * Allows you to add a custom cursor to the tool
		 * @see removeCursor
		 * @see addControl
		 * @see removeControl
		 */
		public function addCursor(cursor:TransformToolCursor):void {
			addToolControl(customCursors, cursor);
		}
		
		/**
		 * Allows you to remove a custom cursor to the tool
		 * @see addCursor
		 * @see addControl
		 * @see removeControl
		 */
		public function removeCursor(cursor:TransformToolCursor):TransformToolCursor {
			if (customCursors.contains(cursor)) {
				customCursors.removeChild(cursor);
				return cursor;
			}
			return null;
		}
		
		/**
		 * Allows you to change the appearance of default controls
		 * @see addControl
		 * @see removeControl
		 */
		public function setSkin(controlName:String, skin:DisplayObject):void {
			var control:TransformToolInternalControl = getControlByName(controlName);
			if (control) {
				control.skin = skin;
			}
		}
		
		/**
		 * Allows you to get the skin of an existing control.
		 * If one was not set, null is returned
		 * @see addControl
		 * @see removeControl
		 */
		public function getSkin(controlName:String):DisplayObject {
			var control:TransformToolInternalControl = getControlByName(controlName);
			return control.skin;
		}
		
		private function getControlByName(controlName:String):TransformToolInternalControl {
			var control:TransformToolInternalControl;
			var containers:Array = new Array(skewControls, registrationControls, cursors, rotateControls, scaleControls);
			var i:int = containers.length;
			while (i-- && control == null) {
				control = containers[i].getChildByName(controlName) as TransformToolInternalControl;
			}
			return control;
		}
		
		// Interaction Handlers
		private function startInteractionHandler(event:MouseEvent):void {
			_currentControl = event.currentTarget as TransformToolControl;
			if (_currentControl) {
				setupInteraction();
			}
		}
		
		private function setupInteraction():void {
			updateMatrix();
			apply();
			dispatchEvent(new Event(CONTROL_DOWN));
			
			// mouse offset to allow interaction from desired point
			mouseOffset = (_currentControl && _currentControl.referencePoint) ? _currentControl.referencePoint.subtract(new Point(mouseX, mouseY)) : new Point(0, 0);
			updateMouse();
			
			// set variables for interaction reference
			interactionStart = mouseLoc.clone();
			innerInteractionStart = innerMouseLoc.clone();
			interactionStartMatrix = _toolMatrix.clone();
			interactionStartAngle = distortAngle();
			
			if (stage) {
				// setup stage events to manage control interaction
				stage.addEventListener(MouseEvent.MOUSE_MOVE, interactionHandler);
				stage.addEventListener(MouseEvent.MOUSE_UP, endInteractionHandler, false);
				stage.addEventListener(MouseEvent.MOUSE_UP, endInteractionHandler, true);
			}
		}
		
		private function interactionHandler(event:MouseEvent):void {
			// define mouse position for interaction
			updateMouse();
			
			// use original toolMatrix for reference of interaction
			_toolMatrix = interactionStartMatrix.clone();
			
			// dispatch events that let controls do their thing
			dispatchEvent(new Event(CONTROL_MOVE));
			dispatchEvent(new Event(CONTROL_TRANSFORM_TOOL));
			
			if (_livePreview) {
				// update target if applicable
				apply();
			}
			
			// smooth sailing
			event.updateAfterEvent();
		}
		
		private function endInteractionHandler(event:MouseEvent):void {
			if (event.eventPhase == EventPhase.BUBBLING_PHASE || !(event.currentTarget is Stage)) {
				// ignore unrelated events received by stage
				return;
			}
			
			if (!_livePreview) {
				// update target if applicable
				apply();
			}
			
			// get stage reference from event in case
			// stage is no longer accessible from this instance
			var stageRef:Stage = event.currentTarget as Stage;
			stageRef.removeEventListener(MouseEvent.MOUSE_MOVE, interactionHandler);
			stageRef.removeEventListener(MouseEvent.MOUSE_UP, endInteractionHandler, false);
			stageRef.removeEventListener(MouseEvent.MOUSE_UP, endInteractionHandler, true);
			dispatchEvent(new Event(CONTROL_UP));
			_currentControl = null;
		}
		
		// Interaction Transformations
		/**
		 * Control Interaction.  Moves the tool
		 */
		public function moveInteraction():void {
			var moveLoc:Point = mouseLoc.subtract(interactionStart);
			_toolMatrix.tx += moveLoc.x;
			_toolMatrix.ty += moveLoc.y;
			updateRegistration();
			completeInteraction();
		}
		
		/**
		 * Control Interaction.  Moves the registration point
		 */
		public function registrationInteraction():void {
			// move registration point
			_registration.x = mouseLoc.x;
			_registration.y = mouseLoc.y;
			innerRegistration = toolInvertedMatrix.transformPoint(_registration);
			
			if (_rememberRegistration) {
				// log new registration point for the next
				// time this target is selected
				registrationLog[_target] = innerRegistration;
			}
			completeInteraction();
		}
		
		/**
		 * Control Interaction.  Rotates the tool
		 */
		public function rotationInteraction():void {
			// rotate in global transform
			var globalMatrix:Matrix = transform.concatenatedMatrix;
			var globalInvertedMatrix:Matrix = globalMatrix.clone();
			globalInvertedMatrix.invert();
			_toolMatrix.concat(globalMatrix);
			
			// get change in rotation
			var angle:Number = distortAngle() - interactionStartAngle;
			
			if (_constrainRotation) {
				// constrain rotation based on constrainRotationAngle
				if (angle > Math.PI) {
					angle -= Math.PI*2;
				}else if (angle < -Math.PI) {
					angle += Math.PI*2;
				}
				angle = Math.round(angle/_constrainRotationAngle)*_constrainRotationAngle;
			}
			
			// apply rotation to toolMatrix
			_toolMatrix.rotate(angle);
			
			_toolMatrix.concat(globalInvertedMatrix);
			completeInteraction(true);
		}
		
		/**
		 * Control Interaction.  Scales the tool along the X axis
		 */
		public function scaleXInteraction():void {
			
			// get distortion offset vertical movement
			var distortH:Point = distortOffset(new Point(innerMouseLoc.x, innerInteractionStart.y), innerInteractionStart.x - innerRegistration.x);
			
			// update the matrix for vertical scale
			_toolMatrix.a += distortH.x;
			_toolMatrix.b += distortH.y;
			completeInteraction(true);
		}
		
		/**
		 * Control Interaction.  Scales the tool along the Y axis
		 */
		public function scaleYInteraction():void {
			// get distortion offset vertical movement
			var distortV:Point = distortOffset(new Point(innerInteractionStart.x, innerMouseLoc.y), innerInteractionStart.y - innerRegistration.y);
			
			// update the matrix for vertical scale
			_toolMatrix.c += distortV.x;
			_toolMatrix.d += distortV.y;
			completeInteraction(true);
		}
		
		/**
		 * Control Interaction.  Scales the tool along both the X and Y axes
		 */
		public function scaleBothInteraction():void {
			// mouse reference, may change from innerMouseLoc if constraining
			var innerMouseRef:Point = innerMouseLoc.clone();
			
			if (_constrainScale) {
				
				// how much the mouse has moved from starting the interaction
				var moved:Point = innerMouseLoc.subtract(innerInteractionStart);
				
				// the relationship of the start location to the registration point
				var regOffset:Point = innerInteractionStart.subtract(innerRegistration);
				
				// find the ratios between movement and the registration offset
				var ratioH = regOffset.x ? moved.x/regOffset.x : 0;
				var ratioV = regOffset.y ? moved.y/regOffset.y : 0;
				
				// have the larger of the movement distances brought down
				// based on the lowest ratio to fit the registration offset
				if (ratioH > ratioV) {
					innerMouseRef.x = innerInteractionStart.x + regOffset.x * ratioV;
				}else{
					innerMouseRef.y = innerInteractionStart.y + regOffset.y * ratioH;
				}
			}
			
			// get distortion offsets for both vertical and horizontal movements
			var distortH:Point = distortOffset(new Point(innerMouseRef.x, innerInteractionStart.y), innerInteractionStart.x - innerRegistration.x);
			var distortV:Point = distortOffset(new Point(innerInteractionStart.x, innerMouseRef.y), innerInteractionStart.y - innerRegistration.y);
			
			// update the matrix for both scales
			_toolMatrix.a += distortH.x;
			_toolMatrix.b += distortH.y;
			_toolMatrix.c += distortV.x;
			_toolMatrix.d += distortV.y;
			completeInteraction(true);
		}
		
		/**
		 * Control Interaction.  Skews the tool along the X axis
		 */
		public function skewXInteraction():void {
			var distortH:Point = distortOffset(new Point(innerMouseLoc.x, innerInteractionStart.y), innerInteractionStart.y - innerRegistration.y);
			_toolMatrix.c += distortH.x;
			_toolMatrix.d += distortH.y;
			completeInteraction(true);
		}
		
		/**
		 * Control Interaction.  Skews the tool along the Y axis
		 */
		public function skewYInteraction():void {
			var distortV:Point = distortOffset(new Point(innerInteractionStart.x, innerMouseLoc.y), innerInteractionStart.x - innerRegistration.x);
			_toolMatrix.a += distortV.x;
			_toolMatrix.b += distortV.y;
			completeInteraction(true);
		}
		
		private function distortOffset(offset:Point, regDiff:Number):Point {
			// get changes in matrix combinations based on targetBounds
			var ratioH:Number = regDiff ? targetBounds.width/regDiff : 0;
			var ratioV:Number = regDiff ? targetBounds.height/regDiff : 0;
			offset = interactionStartMatrix.transformPoint(offset).subtract(interactionStart);
			offset.x *= targetBounds.width ? ratioH/targetBounds.width : 0;
			offset.y *= targetBounds.height ? ratioV/targetBounds.height : 0;
			return offset;
		}
		
		private function completeInteraction(offsetReg:Boolean = false):void {
			enforceLimits();
			if (offsetReg) {
				// offset of registration to have transformations based around
				// custom registration point
				var offset:Point = _registration.subtract(_toolMatrix.transformPoint(innerRegistration));
				_toolMatrix.tx += offset.x;
				_toolMatrix.ty += offset.y;
			}
			updateBounds();
		}
		
		// Information
		private function distortAngle():Number {
			// use global mouse and registration
			var globalMatrix:Matrix = transform.concatenatedMatrix;
			var gMouseLoc:Point = globalMatrix.transformPoint(mouseLoc);
			var gRegistration:Point = globalMatrix.transformPoint(_registration);
			
			// distance and angle of mouse from registration
			var offset:Point = gMouseLoc.subtract(gRegistration);
			return Math.atan2(offset.y, offset.x);
		}
		
		// Updates
		private function updateMouse():void {
			mouseLoc = new Point(mouseX, mouseY).add(mouseOffset);
			innerMouseLoc = toolInvertedMatrix.transformPoint(mouseLoc);
		}
		
		private function updateMatrix(useMatrix:Matrix = null, counterTransform:Boolean = true):void {
			if (_target) {
				_toolMatrix = useMatrix ? useMatrix.clone() : _target.transform.concatenatedMatrix.clone();
				if (counterTransform) {
					// counter transform of the parents of the tool
					var current:Matrix = transform.concatenatedMatrix;
					current.invert();
					_toolMatrix.concat(current);
				}
				enforceLimits();
				toolInvertedMatrix = _toolMatrix.clone();
				toolInvertedMatrix.invert();
				updateBounds();
			}
		}
		
		private function updateBounds():void {
			if (_target) {
				// update tool bounds based on target bounds
				targetBounds = _target.getBounds(_target);
				_boundsTopLeft = _toolMatrix.transformPoint(new Point(targetBounds.left, targetBounds.top));
				_boundsTopRight = _toolMatrix.transformPoint(new Point(targetBounds.right, targetBounds.top));
				_boundsBottomRight = _toolMatrix.transformPoint(new Point(targetBounds.right, targetBounds.bottom));
				_boundsBottomLeft = _toolMatrix.transformPoint(new Point(targetBounds.left, targetBounds.bottom));
				_boundsTop = Point.interpolate(_boundsTopLeft, _boundsTopRight, .5);
				_boundsRight = Point.interpolate(_boundsTopRight, _boundsBottomRight, .5);
				_boundsBottom = Point.interpolate(_boundsBottomRight, _boundsBottomLeft, .5);
				_boundsLeft = Point.interpolate(_boundsBottomLeft, _boundsTopLeft, .5);
				_boundsCenter = Point.interpolate(_boundsTopLeft, _boundsBottomRight, .5);
			}
		}
		
		private function updateControlsVisible():void {
			// show toolSprites only if there is a valid target
			var isChild:Boolean = contains(toolSprites);
			if (_target) {
				if (!isChild) {
					addChild(toolSprites);
				}				
			}else if (isChild) {
				removeChild(toolSprites);
			}
		}
		
		private function updateControlsEnabled():void {
			// highest arrangement
			updateControlContainer(customCursors, _customCursorsEnabled);
			updateControlContainer(cursors, _cursorsEnabled);
			updateControlContainer(customControls, _customControlsEnabled);
			updateControlContainer(registrationControls, _registrationEnabled);
			updateControlContainer(scaleControls, _scaleEnabled);
			updateControlContainer(skewControls, _skewEnabled);
			updateControlContainer(moveControls, _moveEnabled);
			updateControlContainer(rotateControls, _rotationEnabled);
			updateControlContainer(lines, _outlineEnabled);
			// lowest arrangement
		}
		
		private function updateControlContainer(container:Sprite, enabled:Boolean):void {
			var isChild:Boolean = toolSprites.contains(container);
			if (enabled) {
				// add child or sent to bottom if enabled
				if (isChild) {
					toolSprites.setChildIndex(container, 0);
				}else{
					toolSprites.addChildAt(container, 0);
				}
			}else if (isChild) {
				// removed if disabled
				toolSprites.removeChild(container);
			}
		}
		
		private function updateRegistration():void {
			_registration = _toolMatrix.transformPoint(innerRegistration);
		}
		
		private function enforceLimits():void {
			
			var currScale:Number;
			var angle:Number;
			var enforced:Boolean = false;
			
			// use global matrix
			var _globalMatrix:Matrix = _toolMatrix.clone();
			_globalMatrix.concat(transform.concatenatedMatrix);
			
			// check current scale in X
			currScale = Math.sqrt(_globalMatrix.a * _globalMatrix.a + _globalMatrix.b * _globalMatrix.b);
			if (currScale > _maxScaleX) {
				// set scaleX to no greater than _maxScaleX
				angle = Math.atan2(_globalMatrix.b, _globalMatrix.a);
				_globalMatrix.a = Math.cos(angle) * _maxScaleX;
				_globalMatrix.b = Math.sin(angle) * _maxScaleX;
				enforced = true;
			}
			
			// check current scale in Y
			currScale = Math.sqrt(_globalMatrix.c * _globalMatrix.c + _globalMatrix.d * _globalMatrix.d);
			if (currScale > _maxScaleY) {
				// set scaleY to no greater than _maxScaleY
				angle= Math.atan2(_globalMatrix.c, _globalMatrix.d);
				_globalMatrix.d = Math.cos(angle) * _maxScaleY;
				_globalMatrix.c = Math.sin(angle) * _maxScaleY;
				enforced = true;
			}
			
			
			// if scale was enforced, apply to _toolMatrix
			if (enforced) {
				_toolMatrix = _globalMatrix;
				var current:Matrix = transform.concatenatedMatrix;
				current.invert();
				_toolMatrix.concat(current);
			}
		}
		
		// Render
		private function setNewRegistation():void {
			if (_rememberRegistration && _target in registrationLog) {
				
				// retrieved saved reg point in log
				var savedReg:Point = registrationLog[_target];
				innerRegistration = registrationLog[_target];
			}else{
				
				// use internal own point
				innerRegistration = new Point(0, 0);
			}
			updateRegistration();
		}
		
		private function raiseTarget():void {
			// set target to last object in display list
			var index:int = _target.parent.numChildren - 1;
			_target.parent.setChildIndex(_target, index);
			
			// if this tool is in the same display list
			// raise it to the top above target
			if (_target.parent == parent) {
				parent.setChildIndex(this, index);
			}
		}
		
		/**
		 * Draws the transform tool over its target instance
		 */
		public function draw():void {
			// update the matrix and draw controls
			updateMatrix();
			dispatchEvent(new Event(TRANSFORM_TOOL));
		}
		
		/**
		 * Applies the current tool transformation to its target instance
		 */
		public function apply():void {
			if (_target) {
				
				// get matrix to apply to target
				var applyMatrix:Matrix = _toolMatrix.clone();
				applyMatrix.concat(transform.concatenatedMatrix);
				
				// if target has a parent, counter parent transformations
				if (_target.parent) {
					var invertMatrix:Matrix = target.parent.transform.concatenatedMatrix;
					invertMatrix.invert();
					applyMatrix.concat(invertMatrix);
				}
				
				// set target's matrix
				_target.transform.matrix = applyMatrix;
				
				dispatchEvent(new Event(TRANSFORM_TARGET));
			}
		}
	}
}


import flash.display.DisplayObject;
import flash.display.InteractiveObject;
import flash.display.Shape;
import flash.display.Sprite;
import flash.events.Event;
import flash.events.MouseEvent;
import flash.geom.Matrix;
import flash.geom.Point;

import com.senocular.display.TransformTool;
import com.senocular.display.TransformToolControl;
import com.senocular.display.TransformToolCursor;

// Controls
class TransformToolInternalControl extends TransformToolControl {
	
	public var interactionMethod:Function;
	public var referenceName:String;
	public var _skin:DisplayObject;
	
	public function set skin(skin:DisplayObject):void {
		if (_skin && contains(_skin)) {
			removeChild(_skin);
		}
		_skin = skin;
		if (_skin) {
			addChild(_skin);
		}
		draw();
	}
	
	public function get skin():DisplayObject {
		return _skin;
	}
	
	override public function get referencePoint():Point {
		if (referenceName in _transformTool) {
			return _transformTool[referenceName];
		}
		return null;
	}
		
	/*
	 * Constructor
	 */	
	public function TransformToolInternalControl(name:String, interactionMethod:Function = null, referenceName:String = null) {
		this.name = name;
		this.interactionMethod = interactionMethod;
		this.referenceName = referenceName;
		addEventListener(TransformTool.CONTROL_INIT, init);
	}
	
	protected function init(event:Event):void {
		_transformTool.addEventListener(TransformTool.NEW_TARGET, draw);
		_transformTool.addEventListener(TransformTool.TRANSFORM_TOOL, draw);
		_transformTool.addEventListener(TransformTool.CONTROL_TRANSFORM_TOOL, position);
		_transformTool.addEventListener(TransformTool.CONTROL_PREFERENCE, draw);
		_transformTool.addEventListener(TransformTool.CONTROL_MOVE, controlMove);
		draw();
	}
	
	public function draw(event:Event = null):void {
		if (_transformTool.maintainControlForm) {
			counterTransform();
		}
		position();
	}
	
	public function position(event:Event = null):void {
		var reference:Point = referencePoint;
		if (reference) {
			x = reference.x;
			y = reference.y;
		}
	}
	
	private function controlMove(event:Event):void {
		if (interactionMethod && _transformTool.currentControl == this) {
			interactionMethod();
		}
	}
}


class TransformToolMoveShape extends TransformToolInternalControl {
	
	private var lastTarget:DisplayObject;
	
	function TransformToolMoveShape(name:String, interactionMethod:Function) {
		super(name, interactionMethod);
	}
	
	override public function draw(event:Event = null):void {
		
		var currTarget:DisplayObject;
		var moveUnderObjects:Boolean = _transformTool.moveUnderObjects;
		
		// use hitArea if moving under objects
		// then movement would have the same depth as the tool
		if (moveUnderObjects) {
			hitArea = _transformTool.target as Sprite;
			currTarget = null;
			relatedObject = this;
			
		}else{
			
			// when not moving under objects
			// use the tool target to handle movement allowing
			// objects above it to be selectable
			hitArea = null;
			currTarget = _transformTool.target;
			relatedObject = _transformTool.target as InteractiveObject;
		}
		
		if (lastTarget != currTarget) {
			// set up/remove listeners for target being clicked
			if (lastTarget) {
				lastTarget.removeEventListener(MouseEvent.MOUSE_DOWN, mouseDown, false);
			}
			if (currTarget) {
				currTarget.addEventListener(MouseEvent.MOUSE_DOWN, mouseDown, false, 0, true);
			}
			
			// register/unregister cursor with the object
			var cursor:TransformToolCursor = _transformTool.moveCursor;
			cursor.removeReference(lastTarget);
			cursor.addReference(currTarget);
			
			lastTarget = currTarget;
		}
	}
	
	private function mouseDown(event:MouseEvent):void {
		dispatchEvent(new MouseEvent(MouseEvent.MOUSE_DOWN));
	}
}


class TransformToolRegistrationControl extends TransformToolInternalControl {
		
	function TransformToolRegistrationControl(name:String, interactionMethod:Function, referenceName:String) {
		super(name, interactionMethod, referenceName);
	}

	override public function draw(event:Event = null):void {
		graphics.clear();
		if (!_skin) {
			graphics.lineStyle(1, 0);
			graphics.beginFill(0xFFFFFF);
			graphics.drawCircle(0, 0, _transformTool.controlSize/2);
			graphics.endFill();
		}
		super.draw();
	}
}


class TransformToolScaleControl extends TransformToolInternalControl {
	
	function TransformToolScaleControl(name:String, interactionMethod:Function, referenceName:String) {
		super(name, interactionMethod, referenceName);
	}

	override public function draw(event:Event = null):void {
		graphics.clear();
		if (!_skin) {
			graphics.lineStyle(2, 0xFFFFFF);
			graphics.beginFill(0);
			var size = _transformTool.controlSize;
			var size2:Number = size/2;
			graphics.drawRect(-size2, -size2, size, size);
			graphics.endFill();
		}
		super.draw();
	}
}


class TransformToolRotateControl extends TransformToolInternalControl {
	
	private var locationName:String;
	
	function TransformToolRotateControl(name:String, interactionMethod:Function, locationName:String) {
		super(name, interactionMethod);
		this.locationName = locationName;
	}

	override public function draw(event:Event = null):void {
		graphics.clear();
		if (!_skin) {
			graphics.beginFill(0xFF, 0);
			graphics.drawCircle(0, 0, _transformTool.controlSize*2);
			graphics.endFill();
		}
		super.draw();
	}
	
	override public function position(event:Event = null):void {
		if (locationName in _transformTool) {
			var location:Point = _transformTool[locationName];
			x = location.x;
			y = location.y;
		}
	}
}


class TransformToolSkewBar extends TransformToolInternalControl {
	
	private var locationStart:String;
	private var locationEnd:String;
	
	function TransformToolSkewBar(name:String, interactionMethod:Function, referenceName:String, locationStart:String, locationEnd:String) {
		super(name, interactionMethod, referenceName);
		this.locationStart = locationStart;
		this.locationEnd = locationEnd;
	}
	
	override public function draw(event:Event = null):void {
		graphics.clear();
		
		if (_skin) {
			super.draw(event);
			return;
		}
		
		// derive point locations for bar
		var locStart:Point = _transformTool[locationStart];
		var locEnd:Point = _transformTool[locationEnd];
		
		// counter transform
		var toolTrans:Matrix;
		var toolTransInverted:Matrix;
		var maintainControlForm:Boolean = _transformTool.maintainControlForm;
		if (maintainControlForm) {
			toolTrans = transform.concatenatedMatrix;
			toolTransInverted = toolTrans.clone();
			toolTransInverted.invert();
			
			locStart = toolTrans.transformPoint(locStart);
			locEnd = toolTrans.transformPoint(locEnd);
		}
		
		var size:Number = _transformTool.controlSize/2;
		var diff:Point = locEnd.subtract(locStart);
		var angle:Number = Math.atan2(diff.y, diff.x) - Math.PI/2;	
		var offset:Point = Point.polar(size, angle);
		
		var corner1:Point = locStart.add(offset);
		var corner2:Point = locEnd.add(offset);
		var corner3:Point = locEnd.subtract(offset);
		var corner4:Point = locStart.subtract(offset);
		if (maintainControlForm) {
			corner1 = toolTransInverted.transformPoint(corner1);
			corner2 = toolTransInverted.transformPoint(corner2);
			corner3 = toolTransInverted.transformPoint(corner3);
			corner4 = toolTransInverted.transformPoint(corner4);
		}
		
		// draw bar
		graphics.beginFill(0xFF0000, 0);
		graphics.moveTo(corner1.x, corner1.y);
		graphics.lineTo(corner2.x, corner2.y);
		graphics.lineTo(corner3.x, corner3.y);
		graphics.lineTo(corner4.x, corner4.y);
		graphics.lineTo(corner1.x, corner1.y);
		graphics.endFill();
	}

	override public function position(event:Event = null):void {
		if (_skin) {
			var locStart:Point = _transformTool[locationStart];
			var locEnd:Point = _transformTool[locationEnd];
			var location:Point = Point.interpolate(locStart, locEnd, .5);
			x = location.x;
			y = location.y;
		}else{
			x = 0;
			y = 0;
			draw(event);
		}
	}
}


class TransformToolOutline extends TransformToolInternalControl {
	
	function TransformToolOutline(name:String) {
		super(name);
	}

	override public function draw(event:Event = null):void {
		var topLeft:Point = _transformTool.boundsTopLeft;
		var topRight:Point = _transformTool.boundsTopRight;
		var bottomRight:Point = _transformTool.boundsBottomRight;
		var bottomLeft:Point = _transformTool.boundsBottomLeft;
		
		graphics.clear();
		graphics.lineStyle(0, 0);
		graphics.moveTo(topLeft.x, topLeft.y);
		graphics.lineTo(topRight.x, topRight.y);
		graphics.lineTo(bottomRight.x, bottomRight.y);
		graphics.lineTo(bottomLeft.x, bottomLeft.y);
		graphics.lineTo(topLeft.x, topLeft.y);
	}
	
	override public function position(event:Event = null):void {
		draw(event);
	}
}


// Cursors
class TransformToolInternalCursor extends TransformToolCursor {
	
	public var offset:Point = new Point();
	public var icon:Shape = new Shape();
	
	public function TransformToolInternalCursor() {
		addChild(icon);
		offset = _mouseOffset;
		addEventListener(TransformTool.CONTROL_INIT, init);
	}
		
	private function init(event:Event):void {
		_transformTool.addEventListener(TransformTool.NEW_TARGET, maintainTransform);
		_transformTool.addEventListener(TransformTool.CONTROL_PREFERENCE, maintainTransform);
		draw();
	}
	
	protected function maintainTransform(event:Event):void {
		offset = _mouseOffset;
		if (_transformTool.maintainControlForm) {
			transform.matrix = new Matrix();
			var concatMatrix:Matrix = transform.concatenatedMatrix;
			concatMatrix.invert();
			transform.matrix = concatMatrix;
			offset = concatMatrix.deltaTransformPoint(offset);
		}
		updateVisible(event);
	}
	
	protected function drawArc(originX:Number, originY:Number, radius:Number, angle1:Number, angle2:Number, useMove:Boolean = true):void {
		var diff:Number = angle2 - angle1;
		var divs:Number = 1 + Math.floor(Math.abs(diff)/(Math.PI/4));
		var span:Number = diff/(2*divs);
		var cosSpan:Number = Math.cos(span);
		var radiusc:Number = cosSpan ? radius/cosSpan : 0;
		var i:int;
		if (useMove) {
			icon.graphics.moveTo(originX + Math.cos(angle1)*radius, originY - Math.sin(angle1)*radius);
		}else{
			icon.graphics.lineTo(originX + Math.cos(angle1)*radius, originY - Math.sin(angle1)*radius);
		}
		for (i=0; i<divs; i++) {
			angle2 = angle1 + span;
			angle1 = angle2 + span;
			icon.graphics.curveTo(
				originX + Math.cos(angle2)*radiusc, originY - Math.sin(angle2)*radiusc,
				originX + Math.cos(angle1)*radius, originY - Math.sin(angle1)*radius
			);
		}
	}
	
	protected function getGlobalAngle(vector:Point):Number {
		var globalMatrix:Matrix = _transformTool.globalMatrix;
		vector = globalMatrix.deltaTransformPoint(vector);
		return Math.atan2(vector.y, vector.x) * (180/Math.PI);
	}
	
	override public function position(event:Event = null):void {
		if (parent) {
			x = parent.mouseX + offset.x;
			y = parent.mouseY + offset.y;
		}
	}
	
	public function draw():void {
		icon.graphics.beginFill(0);
		icon.graphics.lineStyle(1, 0xFFFFFF);
	}
}


class TransformToolRegistrationCursor extends TransformToolInternalCursor {
	
	public function TransformToolRegistrationCursor() {
	}
	
	override public function draw():void {
		super.draw();
		icon.graphics.drawCircle(0,0,2);
		icon.graphics.drawCircle(0,0,4);
		icon.graphics.endFill();
	}
}


class TransformToolMoveCursor extends TransformToolInternalCursor {
	
	public function TransformToolMoveCursor() {
	}
	
	override public function draw():void {
		super.draw();
		// up arrow
		icon.graphics.moveTo(1, 1);
		icon.graphics.lineTo(1, -2);
		icon.graphics.lineTo(-1, -2);
		icon.graphics.lineTo(2, -6);
		icon.graphics.lineTo(5, -2);
		icon.graphics.lineTo(3, -2);
		icon.graphics.lineTo(3, 1);
		// right arrow
		icon.graphics.lineTo(6, 1);
		icon.graphics.lineTo(6, -1);
		icon.graphics.lineTo(10, 2);
		icon.graphics.lineTo(6, 5);
		icon.graphics.lineTo(6, 3);
		icon.graphics.lineTo(3, 3);
		// down arrow
		icon.graphics.lineTo(3, 5);
		icon.graphics.lineTo(3, 6);
		icon.graphics.lineTo(5, 6);
		icon.graphics.lineTo(2, 10);
		icon.graphics.lineTo(-1, 6);
		icon.graphics.lineTo(1, 6);
		icon.graphics.lineTo(1, 5);
		// left arrow
		icon.graphics.lineTo(1, 3);
		icon.graphics.lineTo(-2, 3);
		icon.graphics.lineTo(-2, 5);
		icon.graphics.lineTo(-6, 2);
		icon.graphics.lineTo(-2, -1);
		icon.graphics.lineTo(-2, 1);
		icon.graphics.lineTo(1, 1);
		icon.graphics.endFill();
	}
}


class TransformToolScaleCursor extends TransformToolInternalCursor {
	
	public function TransformToolScaleCursor() {
	}
	
	override public function draw():void {
		super.draw();
		// right arrow
		icon.graphics.moveTo(4.5, -0.5);
		icon.graphics.lineTo(4.5, -2.5);
		icon.graphics.lineTo(8.5, 0.5);
		icon.graphics.lineTo(4.5, 3.5);
		icon.graphics.lineTo(4.5, 1.5);
		icon.graphics.lineTo(-0.5, 1.5);
		// left arrow
		icon.graphics.lineTo(-3.5, 1.5);
		icon.graphics.lineTo(-3.5, 3.5);
		icon.graphics.lineTo(-7.5, 0.5);
		icon.graphics.lineTo(-3.5, -2.5);
		icon.graphics.lineTo(-3.5, -0.5);
		icon.graphics.lineTo(4.5, -0.5);
		icon.graphics.endFill();
	}
	
	override public function updateVisible(event:Event = null):void {
		super.updateVisible(event);
		if (event) {
			var reference:TransformToolScaleControl = event.target as TransformToolScaleControl;
			if (reference) {
				switch(reference) {
					case _transformTool.scaleTopLeftControl:
					case _transformTool.scaleBottomRightControl:
						icon.rotation = (getGlobalAngle(new Point(0,100)) + getGlobalAngle(new Point(100,0)))/2;
						break;
					case _transformTool.scaleTopRightControl:
					case _transformTool.scaleBottomLeftControl:
						icon.rotation = (getGlobalAngle(new Point(0,-100)) + getGlobalAngle(new Point(100,0)))/2;
						break;
					case _transformTool.scaleTopControl:
					case _transformTool.scaleBottomControl:
						icon.rotation = getGlobalAngle(new Point(0,100));
						break;
					default:
						icon.rotation = getGlobalAngle(new Point(100,0));
				}
			}
		}
	}
}


class TransformToolRotateCursor extends TransformToolInternalCursor {
	
	public function TransformToolRotateCursor() {
	}
	
	override public function draw():void {
		super.draw();
		// curve
		var angle1:Number = Math.PI;
		var angle2:Number = -Math.PI/2;
		drawArc(0,0,4, angle1, angle2);
		drawArc(0,0,6, angle2, angle1, false);
		// arrow
		icon.graphics.lineTo(-8, 0);
		icon.graphics.lineTo(-5, 4);
		icon.graphics.lineTo(-2, 0);
		icon.graphics.lineTo(-4, 0);
		icon.graphics.endFill();
	}
}


class TransformToolSkewCursor extends TransformToolInternalCursor {
	
	public function TransformToolSkewCursor() {
	}
	
	override public function draw():void {
		super.draw();
		// right arrow
		icon.graphics.moveTo(-6, -1);
		icon.graphics.lineTo(6, -1);
		icon.graphics.lineTo(6, -4);
		icon.graphics.lineTo(10, 1);
		icon.graphics.lineTo(-6, 1);
		icon.graphics.lineTo(-6, -1);
		icon.graphics.endFill();
		
		super.draw();
		// left arrow
		icon.graphics.moveTo(10, 5);
		icon.graphics.lineTo(-2, 5);
		icon.graphics.lineTo(-2, 8);
		icon.graphics.lineTo(-6, 3);
		icon.graphics.lineTo(10, 3);
		icon.graphics.lineTo(10, 5);
		icon.graphics.endFill();
	}
	
	override public function updateVisible(event:Event = null):void {
		super.updateVisible(event);
		if (event) {
			var reference:TransformToolSkewBar = event.target as TransformToolSkewBar;
			if (reference) {
				switch(reference) {
					case _transformTool.skewLeftControl:
					case _transformTool.skewRightControl:
						icon.rotation = getGlobalAngle(new Point(0,100));
						break;
					default:
						icon.rotation = getGlobalAngle(new Point(100,0));
				}
			}
		}
	}
}
