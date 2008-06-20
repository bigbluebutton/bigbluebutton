import com.mosesSupposes.fuse.ZManager;
import com.mosesSupposes.fuse.FuseKitCommon;
/**
*
* Fuse Kit | (c) Moses Gunesch, see Fuse-Kit-License.html | http://www.mosessupposes.com/Fuse/
*
* @ignore
*
* Animation and event sequencer that extends Array.
* @author	Moses Gunesch
* @version	2.0 (Beta-Y13)
*/
class com.mosesSupposes.fuse.ZigoEngine
{
	/**
	 * Enables kit version to be retrieved at runtime or when reviewing a decompiled swf. 
	 */
	public static var VERSION:String = FuseKitCommon.VERSION;
	
	/**
	 * Enables kit author to be retrieved at runtime or when reviewing a decompiled swf. 
	 */
	public static var AUTHOR:String = FuseKitCommon.AUTHOR+', Some concepts in ZigoEngine credited to Ladislav Zigo | laco.wz.cz/tween';
	/**
	 * Default easing if none is passed (requires that PennerEasing
	 */
	public static var EASING:Object = 'easeOutQuint';
	public static var DURATION:Number = 1;
	public static var ROUND_RESULTS:Boolean = false;
	
	/**
	 * set to 0 for no traces, 1 for normal errors, 2 for additional traces
	 */ 
	public static var OUTPUT_LEVEL:Number = 1;
	
	/**
	 * AUTOSTOP: option to stop all tweening props in target as a new tween is added. (not recommended)
	 */ 
	public static var AUTOSTOP:Boolean = false; 
	
	/**
	 * 1= skip nontweens, 2= skip nontweens and do not fire events or callbacks. For granular usage pass the prop skipLevel in a callback object.
	 */ 
	public static var SKIP_LEVEL:Number = 0; 
	
	/**
	 * enterframe-beacon clip placed on a high level, use setControllerDepth() to transfer level
	 */ 
	private static var tweenHolder:MovieClip;
	
	/**
	 * written by AsBroadcaster
	 */
	public static var removeListener:Function;
	
	/**
	 * internal instance of Zmanager object (broken out to increase speed in as2)
	 */
	private static var instance:ZManager;
	
	/**
	 * internal setInterval id memory for ability to clearInterval
	 */
	private static var updateIntId:Number;
	
	/**
	 * internal setInterval time in milliseconds, use public static setUpdateInterval to switch the engine to interval mode.
	 */
	private static var updateTime:Number;
	
	/**
	 * internal boolean playing switch
	 */
	private static var _playing:Boolean = false;
	
	/**
	 * internal counter for hidden __zigoID__ parameter written into target objects
	 */
	private static var zigoIDs:Number = 0;
	
	/**
	 * internal table for externally registered classes which are stored via their registryKey string.
	 */
	private static var extensions:Object;
	
	/**
	 * internal counter used to tag each callback function with a unique id
	 */
	private static var cbTicker:Number = 0;
	
	/**
	* Empty Constructor. See initialize method call.
	*/
	function ZigoEngine(){} 
	
	/**
	 * initialize AsBroadcaster for the engine on first addListener call (used only once then overwritten)
	 * @param t	event
	 * @param h handler
	 */ 
	public static function addListener(t:Object,h:Object):Void
	{
		AsBroadcaster.initialize(ZigoEngine);
		ZigoEngine.addListener(t,h);
	}
	
	/**
	* @return	true if the engine contains tweens and is running updates on a pulse
	*/
	public static function isPlaying():Boolean
	{
		return _playing;
	}
	
	/**
	* Initializes ZigoEngine for use through extended prototypes and shortcuts. NOTE: Passing Shortcuts is mandatory for this method.
	* @param	Classes accepted: PennerEasing, Fuse, FuseFMP(automatically runs FuseFMP.simpleSetup).<br>Example:<code>import com.mosesSupposes.fuse.*;<br>ZigoEngine.simpleSetup(Shortcuts);</code>
	*/ 
	public static function simpleSetup():Void
	{
		if (arguments.length>0) register.apply(ZigoEngine,arguments);
		_global.ZigoEngine = ZigoEngine; // This allows you to skip using import statements in the timeline.
		if (extensions.fuse!=undefined) _global.Fuse = extensions.fuse;
		if (extensions.fuseFMP!=undefined) extensions.fuseFMP.simpleSetup(); // adds _global.FuseFMP reference
		initialize(MovieClip.prototype, Button.prototype, TextField.prototype);
		if (extensions.shortcuts==undefined) { // ignores OUTPUT_LEVEL since it's crucial
			FuseKitCommon.error('001');
		}
	}
	
	/**
	* Adds features to the base engine if not using <code>ZigoEngine.simpleSetup()</code>. Note that to use fuse-style object syntax with the engine without Fuse, you may register FuseItem.
	*/
	public static function register():Void
	{
		if (extensions==undefined) extensions = {};
		var supported:String = '|fuse|fuseItem|fuseFMP|shortcuts|pennerEasing|';
		for (var i:String in arguments) {
			var key:String = (arguments[i]).registryKey;
			if (extensions[key]==undefined && supported.indexOf('|'+key+'|')>-1) {
				extensions[key] = (arguments[i]); //retain class
				if (key=='fuseFMP' || key=='shortcuts') Object(extensions[key]).initialize(); // not entirely necessary.
			}
		}
	}
	
	/**
	* Prepares targets with ASBroadcaster. If Shortcuts was registered, copies tweening shortcuts to targets.
	*/
	public static function initialize():Void
	{
		if (arguments.length>0) {
			initializeTargets.apply(ZigoEngine, arguments);
			if (extensions.shortcuts!=undefined) {
				extensions.shortcuts.addShortcutsTo.apply(extensions.shortcuts, arguments);
			}
		}
	}
	
	/** 
	* Removes shortcuts from any object previously initialized using initialize(). If simpleSetup() was used you can call this method with no arguments to deinitialze the mc & tf protos.
	*/
	public static function deinitialize():Void
	{
		if (arguments.length==0) {
			arguments.push(MovieClip.prototype, Button.prototype, TextField.prototype);
		}
		deinitializeTargets.apply(ZigoEngine, arguments);
		if (extensions.shortcuts!=undefined) { 
			extensions.shortcuts.removeShortcutsFrom.apply(extensions.shortcuts, arguments);
		}
	}
	
	/**
	* You may set a specific update interval for the manager (for most situations you should use the default which operates onEnterFrame for smoothest animation)
	*/
	public static function getUpdateInterval():Number {
		return updateTime;
	}
	
	/**
	* The ZigoEngine may be run on a setInterval pulse instead of a frame pulse, triggered by calling this method. Note that in most cases it is best to leave the engine in its default state since a frame-based pulse often renders more smoothly.
	* @param time		milliseconds the setInterval call should use for its pulse.
	*/
	public static function setUpdateInterval(time:Number):Void {
		if (_playing) {
			setup(true);
			updateTime = time;
			setup();
		}else{
			updateTime = time;
		}
	}
	
	/**
	* Depth of the beacon clip.
	* @return		numeric depth in _root
	*/
	public static function getControllerDepth():Number { 
		return tweenHolder.getDepth(); 
	}
	
	/**
	* Sets the depth of the beacon clip which defaults at level 6789. This clip is hidden from for-in loops. 
	*/
	public static function setControllerDepth(v:Number):Void {
		if (_global.isNaN(v)==false) {
			if(Object(tweenHolder).proof!=null) {
				tweenHolder.swapDepths(v);
			}
			else {
				tweenHolder = _root.createEmptyMovieClip("_th_", v);
			}
		}
	}

	/**
	* Runs a single shortcut-style tween on any target (or targets), regardless of their initialization. (This idea thanks to Yotam Laufer)
	* Example: <code>ZigoEngine.doShortcut(my_mc, 'scaleTo', 200, 1, 'easeOutQuad');</code>
	* NOTE: Requires that the Shortucts class is registered.
	* @param targets	 	one target or an array of targets.
	* @param methodName	 	one target or an array of targets.
	* @return				a comma-delimited string of props successfully added. When multipe targets were passed, a pipe-delimited series is returned to enable verification of individual properties per target.
	*/
	public static function doShortcut(targets:Object, methodName:String):String
	{
		if (extensions.shortcuts==undefined) {
			if (OUTPUT_LEVEL>0) FuseKitCommon.error('002');
			return null;
		}
		return (extensions.shortcuts.doShortcut.apply(extensions.shortcuts, arguments));
	}
	
	/**
	* Adds one or more propery-tweens to one or more targets.
	* Example: <code>ZigoEngine.doTween(my_mc, '_x,_y', [100,150], 1, Strong.easeInOut);</code>
	* @param targets		tween target object or array of target objects
	* @param props			tween property or Array of properties
	* @param endvals		tween end-value or Array of corresponding end-values
	* @param seconds		tween duration
	* @param ease			function, shortcut-string, or custom-easing-panel object
	* @param delay			seconds to wait before performing the tween
	* @param callback		function, string, or object
	* @return				comma-delimited string of props successfully added, pipe-delimited series of such if multiple targets passed
	*/
	public static function doTween(targets:Object, props:Object, endvals:Object, seconds:Number, ease:Object, delay:Number, callback:Object):String  
	{
		if (extensions.fuse.addBuildItem(arguments)==true) return null; // used by Fuse Simple Syntax
		// initialize + setup (ZManager singleton required prior to parse)
		if (instance==undefined || (Object(tweenHolder).proof==undefined && updateTime==undefined)) {
			if (MovieClip.prototype.tween!=null && typeof _global.$tweenManager=='object') {
				FuseKitCommon.error('003'); // ignores OUTPUT_LEVEL since this is crucial
			}
			instance = new ZManager();
			_playing = false;
		}
		// targets & properties - make use of ZManager's parser which converts both to arrays.
		var params:Object = instance.paramsObj(targets, props, endvals);
		//var pa:Array = ((params.pa.length==0) ? undefined : params.pa);
		var ta:Array = ((params.tg[0]==null || params.tg.length==0) ? undefined : params.tg);
		if (params.pa==undefined || ta==undefined || arguments.length<3) {
			if (extensions.fuseItem!=null && typeof ta[0]=='object') {
				return extensions.fuseItem.doTween(arguments[0]); // Route to FuseItem if Obj Syntax
			}
			if (OUTPUT_LEVEL>0) {
				if (arguments.length<3) FuseKitCommon.error('004',String(arguments.length));
				else FuseKitCommon.error('005',ta.toString(),(params.pa).toString());
			}
			return null;
		}
		if (_playing!=true) {
			setup();
		}
		
		// duration
		if (seconds==null || _global.isNaN(seconds)==true) seconds = (DURATION || 1);
		else if (seconds<0.01) seconds = 0;
		
		// delay
		if (delay<0.01 || delay==null || _global.isNaN(delay)==true) delay = 0;
		
		// callbacks (leave before easing)
		var validCBs:Object = (parseCallback(callback,ta)); // throws its own errors, returns undefined if not valid.
		
		// easing
		var eqf:Function;
		if (typeof ease=='function') {
			if (typeof (Function(ease).call(null,1,1,1,1))=='number') eqf = Function(ease);
			else if (OUTPUT_LEVEL>0) FuseKitCommon.error('014',ease);
		}
		else if (ease==null || ease=='') {
			if (EASING instanceof Function) eqf = Function(EASING);
			else if (extensions.pennerEasing!=undefined) ease = EASING;
		}
		if (typeof ease=='string' && ease!='') {
			if (extensions.pennerEasing[ease]!=undefined) eqf = extensions.pennerEasing[ease];
			else if (OUTPUT_LEVEL>0) FuseKitCommon.error('006',ease);
		}
		else if (typeof ease=='object' && ease.ease!=null && ease.pts!=null) {// object from custom easing tool
			eqf = Function(ease.ease);
			validCBs.extra1 = ease.pts;
		}
		if (typeof eqf!='function'){ // fallback default: easeOutQuint
			eqf = (function (t:Number, b:Number, c:Number, d:Number):Number { return c*((t=t/d-1)*t*t*t*t + 1) + b; });
		}
		// init each target & add tweens
		var propsAdded:String = '';
		for (var i:String in ta) {
			var o:Object = ta[i];
			if (o.__zigoID__==null) {
				initializeTargets(o); // initializes ASBroadcaster and adds __zigoID__
			}
			else if (instance.getStatus('locked',o)==true) {
				if (OUTPUT_LEVEL>0) FuseKitCommon.error('007',((o._name!=undefined)?o._name:(o.toString())),(params.pa).toString());
				continue;
			}
			//ZManager.addTween(obj:Object, props:Array, endvals:Array, seconds:Number, ease:Function, delay:Number, callback:Object):String
			var pStr:String = (instance.addTween(o, params.pa, params.va, seconds, eqf, delay, validCBs));
			if (pStr!=null && pStr.length>0) {
				if (propsAdded.length>0) propsAdded=(pStr+'|'+propsAdded);
				else propsAdded = pStr;
			}
		}
		return ((propsAdded=='') ? null : propsAdded);
	}
	
	/**
	* Remove specific or all tweening properties from specific or all tweening targets in engine.
	* @param targs		a single target object, array of targets, or keyword "ALL" for every active target
	* @param props		a property string, array of property strings, null or nothing for all props, keyword "ALLCOLOR" for any active color transform
	*/
	public static function removeTween (targs:Object, props:Object):Void {
		instance.removeTween(targs, props);
	}
	
	/**
	* Test if a target and optionally a specific property is being handled by the engine.
	* @param targ		a single target object to test
	* @param props		a property string, null or nothing for any property, keyword "ALLCOLOR" for any active color transform
	* @return			true if a matching active tween is found, which may be paused or playing 
	*/
	public static function isTweening(targ:Object, prop:String):Boolean {
		return Boolean(instance.getStatus('active',targ,prop));
	}
	
	/**
	* Returns the number of tweens active in a target object.
	* @param targ		target tween passed to determine if active, or keyword "ALL" for every active target
	* @return			number of active tweens, which may be paused or playing
	*/
	public static function getTweens(targ:Object):Number {
		return Number(instance.getStatus('count',targ));
	}
	
	/**
	* Locks a target to prevent tweens from running until target is unlocked.
	* @param targ		Object to lock
	* @param setLocked	locked value
	*/
	public static function lockTween(targ:Object, setLocked:Boolean):Void {
		instance.alterTweens('lock',targ,setLocked);
	}
	
	/**
	* Locks tweens and prevents from running until tween is unlocked.
	* @param targ		Object to lock
	* @return 			locked value
	*/
	public static function isTweenLocked(targ:Object):Boolean {
		return Boolean(instance.getStatus('locked',targ));
	}
	
	/**
	* Fast-forwarding a tween ends it and removes it from the engine, and triggers the onTweenEnd broadcast and end callbacks. 
	* @param targs		a single target object, array of targets, or keyword "ALL" for every active target
	* @param props		a property string, array of property strings, null or nothing for all props, keyword "ALLCOLOR" for any active color transform
	*/
	public static function ffTween(targs:Object, props:Object):Void {
		instance.alterTweens('ff',targs,props);
	}
	
	/**
	* Rewinds and either pauses or restarts one or more tweens
	* @param targs		a single target object, array of targets, or keyword "ALL" for every active target
	* @param props		a property string, array of property strings, null or nothing for all props, keyword "ALLCOLOR" for any active color transform
	* @param pauseFlag	true to rewind-and-pause
	* @param suppressStartEvents	if true is not passed, engine will refire 'onTweenStart' event and any start callbacks associated with the tween
	*/
	public static function rewTween(targs:Object, props:Object, pauseFlag:Boolean, suppressStartEvents:Boolean):Void {
		instance.alterTweens('rewind',targs,props,pauseFlag,suppressStartEvents);
	}
	
	/**
	* Test whether any or a specific property is paused in a target object
	* @param targ		a single target object to test
	* @param props		a property string, null or nothing for any property, keyword "ALLCOLOR" for any active color transform
	* @return			paused value
	*/
	public static function isTweenPaused(targ:Object, prop:String):Boolean {
		return Boolean(instance.getStatus('paused',targ,prop));
	}
	
	/**
	* Pause one or more tweens
	* @param targs		a single target object, array of targets, or keyword "ALL" for every active target
	* @param props		a property string, array of property strings, null or nothing for all props, keyword "ALLCOLOR" for any active color transform
	*/
	public static function pauseTween(targs:Object, props:Object):Void {
		instance.alterTweens('pause',targs,props);
	}
	
	/**
	* Unpause one or more tweens
	* @param targs		a single target object, array of targets, or keyword "ALL" for every active target
	* @param props		a property string, array of property strings, null or nothing for all props, keyword "ALLCOLOR" for any active color transform
	*/
	public static function unpauseTween(targs:Object, props:Object):Void {
		instance.alterTweens('unpause',targs,props);
	}
	
	
	// -------------------------------------------------------------------------------------
	// - Flash7 Color Helpers - You may find these useful any time, not just when tweening.
	// (thanks goes out to R. Penner for most of the color math here)
	// -------------------------------------------------------------------------------------
	
	/**
	 *  Set a Flash7 color transform on a target using a keyword, like <code>ZigoEngine.setColorByKey(my_mc, 'tint', 50, 0x33FF00);</code>
	 *  @param targetObj	MovieClip or target to alter
	 *  @param type			string 'brightness', 'brightOffset', 'contrast', 'invertColor', or 'tint'
	 *  @param amt			a percentage, which can also be negative in some cases
	 *  @param rgb			for tint, a color number or string
	 */
	public static function setColorByKey(targetObj:Object, type:String, amt:Number, rgb:Object):Void {
		(new Color(targetObj)).setTransform(getColorTransObj(type,amt,rgb));
	}
	
	/**
	 *  Generates a generic Flash7-style color-transform object with props like ra, etc., by keyword.
	 *  @param type			string 'brightness', 'brightOffset', 'contrast', 'invertColor', or 'tint'
	 *  @param amt			a percentage, which can also be negative in some cases
	 *  @param rgb			for tint, a color number or string
	 */
	public static function getColorTransObj(type:String, amt:Number, rgb:Object):Object {
		switch (type) {
		 case 'brightness' : // amt:-100=black, 0=normal, 100=white
			var percent:Number = (100-Math.abs(amt));
			var offset:Number = ((amt>0) ? (255*(amt/100)) : 0);
			return {ra:percent, rb:offset, ga:percent, gb:offset, ba:percent, bb:offset};
		 case 'brightOffset' : // "burn" effect. amt:-100=black, 0=normal, 100=white
			return {ra:100, rb:(255*(amt/100)), ga:100, gb:(255*(amt/100)), ba:100, bb:(255*(amt/100))};
		 case 'contrast' : // amt:0=gray, 100=normal, 200=high-contrast, higher=posterized.
			return {ra:amt, rb:(128-(128/100*amt)), ga:amt, gb:(128-(128/100*amt)), ba:amt, bb:(128-(128/100*amt))};
		 case 'invertColor' : // amt:0=normal,50=gray,100=photo-negative
			return {ra:(100-2*amt), rb:(amt*(255/100)), ga:(100-2*amt), gb:(amt*(255/100)), ba:(100-2*amt), bb:(amt*(255/100))};
		 case 'tint' : // amt:0=none,100=solid color (>100=posterized to tint, <0=inverted posterize to tint)
		 	if (rgb!=null) {
		 		var rgbnum:Number;
				if (typeof rgb=='string') {// Hex strings are not interpreted as relative values like other color props. Allow strings like "#FFFFFF" or "FFFFFF"
					if (rgb.charAt(0)=='#') rgb = rgb.slice(1);
					rgb = ((rgb.charAt(1)).toLowerCase()!='x') ? ('0x'+rgb) : (rgb);
				}
				rgbnum = Number(rgb);
				return {ra:(100-amt), rb:(rgbnum >> 16)*(amt/100), ga:(100-amt), gb:((rgbnum >> 8) & 0xFF)*(amt/100), ba:(100-amt), bb:(rgbnum & 0xFF)*(amt/100)};
			}
		}
		return {rb:0, ra:100, gb:0, ga:100, bb:0, ba:100}; // full reset
	};

	/**
	*  Provides readings by keyword for a target object or Flash7-style color-transform object
	*  NOTE: Inherent rounding errors are common! Especially when percentages are below 50. Even .tintString hex values may differ slightly.
	*  @param targOrTransObj	target object or Flash7-style color-transform object with props like ra, etc.
	*  @return					object may contain props brightness, brightOffset, contrast, invertColor, tint, tintPercent, and tintString
	*/
	public static function getColorKeysObj(targOrTransObj:Object):Object {
		var trans:Object = (targOrTransObj.ra!=undefined) ? targOrTransObj : (new Color(targOrTransObj)).getTransform();
		var o:Object = {};
		var sim_a:Boolean = (trans.ra==trans.ga && trans.ga==trans.ba);
		var sim_b:Boolean = (trans.rb==trans.gb && trans.gb==trans.bb);
		var tintPct:Number = (sim_a==true) ? (100 - trans.ra) : 0;
		if (tintPct!=0) {
			var ratio:Number = 100/tintPct;
			o.tint = ((trans.rb*ratio)<<16 | (trans.gb*ratio)<<8 | trans.bb*ratio);
			o.tintPercent = tintPct;
			var hexStr:String = o.tint.toString(16);
			var toFill:Number = 6 - hexStr.length;
			while (toFill-->0) hexStr = '0' + hexStr;
			o.tintString = '0x'+hexStr.toUpperCase();
		}
		if (sim_a==true && sim_b==true) {
			if (trans.ra<0) o.invertColor = (trans.rb * (100/255));
			else if (trans.ra==100 && trans.rb!=0) o.brightOffset =(trans.rb * (100/255));
			if (trans.ra!=100) {
				if ((trans.rb==0 || (trans.rb!=0 && (255*((100-trans.ra)/100))-trans.rb <= 1))) { // <=1:rounding error correct
					o.brightness = ((trans.rb!=0) ? (100-trans.ra) : (trans.ra-100));
				}
				if ((128-(128/100*trans.ra))-trans.rb <= 1) o.contrast = trans.ra; // <=1:rounding error correct
			}
		}
		return o;
	}
	
	/**
	 * Internal method that prepares any number of targets with ASBroadcaster functionality and a hidden engine ID.
	 */
	public static function initializeTargets():Void
	{
		for (var i:String in arguments) {
			var obj:Object = arguments[i];
			// this catches mc/btn/tf prototypes, which should not be directly initialized. However other class prototypes will not be caught and may result in recursion errors.
			// Please let me know if there is a way (f7 compatible) to detect whether an object is a prototype or not!
			if (obj==MovieClip.prototype || obj==Button.prototype || obj==TextField.prototype || obj==Object.prototype) {
				if (obj.oldAddListener==undefined) {
					if (obj==TextField.prototype) {
						obj.oldAddListener = obj.addListener; // TextField class is already initialized, this prevents recursion errors
						_global.ASSetPropFlags(obj, 'oldAddListener', 7, 1);
					}
					obj.addListener = function(o:Object):Void { // (this bit is only used if simpleSetup is called and addListener is called on a target before tweening it.)
						if ((this).__zigoID__==undefined) ZigoEngine.initializeTargets((this));
						if ((this) instanceof TextField) {
							Function((this).oldAddListener).call((this),o);// workaround: flash mc & tf behavior differs
						}
						else (this).addListener(o);
					};
					if (obj==MovieClip.prototype) { // hides the fake-in method above from for-in loops and deletion.
						_global.ASSetPropFlags(obj, 'addListener', 7, 1);
					}
				}
			}
			else if (obj.__zigoID__==undefined) {
				obj.__zigoID__ = zigoIDs;/*	although this is intrusive (in the same way ASBroadcaster or EventDispatcher is),
					  it's faster & safer than storing a reference list which can impair garbage collection and lead to bloat. */
				_global.ASSetPropFlags(obj, '__zigoID__', 7, 1);
				zigoIDs++;
				if (obj._listeners==null || obj.addListener==null) {
					AsBroadcaster.initialize(obj); // instances
				}
			}
		}
	}
	
	/**
	 * Internal method that strips ASBroadcaster functionality and hidden engine ID from any target.
	 */
	public static function deinitializeTargets():Void
	{
		for (var i:String in arguments) { 
			var obj:Object = arguments[i];
			if (obj.__zigoID__!=undefined) {
				_global.ASSetPropFlags(obj, '__zigoID__,_listeners,broadcastMessage,addListener,removeListener', 0, 2); // 0,2 is NOT a mistake, do not change
				delete obj.__zigoID__;
				delete obj._listeners;
				delete obj.broadcastMessage;
				delete obj.addListener;
				delete obj.removeListener;
			}
			if (obj.oldAddListener!=undefined) { // reset textfield prototype to prior addListener method.
				_global.ASSetPropFlags(obj, 'oldAddListener', 0, 2);
				obj.addListener = obj.oldAddListener;
				delete obj.oldAddListener;
			}
		}
	}
	
	/**
	 * Internal relay for use by ZManager instance only
	 * @param inst			ZManager instance
	 * @param deinitFlag	true stops engine
	 */ 
	public static function __mgrRelay(inst:ZManager,method:String,args:Array):Void
	{
		if (inst==instance) {
			Function(ZigoEngine[method]).apply(ZigoEngine,args);
		}
	}
	
	// ---------------------------------------------------------------------------------
	// -- Private ----------------------------------------------------------------------
	// ---------------------------------------------------------------------------------

	/**
	* Internal method that initializes the engine to start or stop executing updates on a pulse
	* @param deinitFlag		true to stop engine
	*/
	private static function setup(deinitFlag:Boolean):Void 
	{
		// deinit
		if (deinitFlag==true) {
			_playing = false;
			clearInterval(updateIntId);		
			delete tweenHolder.onEnterFrame;
			return;
		}
		// init
		instance.cleanUp();
		clearInterval(updateIntId);
		delete updateIntId;
		if(updateTime!=undefined && updateTime>0) {
			updateIntId = setInterval(instance, 'update', updateTime);
		}
		else {
			if(Object(tweenHolder).proof==null) { // fixes bug with "Simulate Download" (tweenHolder is still movieclip, but not on the stage)
				setControllerDepth(6789); // creates tweenHolder
				Object(tweenHolder).proof = 1;
			}
			var _inst:ZManager = instance;
			tweenHolder.onEnterFrame = function() {
				_inst.update.call(_inst);
			};
		}
		_playing = true;
		instance.now = getTimer();
	}
	
	/**
	 * Internal parser for callback parameter which can be various formats.
	 * User may pass easyfunc-string if Shortcuts class is registered, loose function as function or string, or callback object.
	 * @param callback		parameter as passed by user to doTween or doShortcut
	 * @param targets		tween targets, used in locating functions
	 * @return				a formatted object containing properties skipLevel,cycles, and possibly extra1,extra2,start,upd,end
	 */
	private static function parseCallback(callback:Object, targets:Array):Object
	{
		var validCBs:Object = { skipLevel:SKIP_LEVEL, cycles:1 };
		if (callback.skipLevel!=undefined && typeof callback.skipLevel=='number' && callback.skipLevel!=SKIP_LEVEL) {
			if (callback.skipLevel>=0 && callback.skipLevel<=2) validCBs.skipLevel = callback.skipLevel;
		};
		if (callback.cycles!=undefined) {
			if (typeof callback.cycles=='number' && callback.cycles>-1) validCBs.cycles = callback.cycles;
			else if ((callback.cycles.toUpperCase())=='LOOP') validCBs.cycles = 0; // 0 is infinite loop flag.
		}
		if (callback.extra1!=undefined) validCBs.extra1 = callback.extra1;
		if (callback.extra2!=undefined) validCBs.extra2 = callback.extra2;
		if (callback==undefined) {
			return validCBs;
		}
		var cbErrors:Array = [];
		// String-type callback: enable strings like "_root.someFunc('stringarg',300,this.somevar);" -- Shortcuts must be registered first.
		var ezf:String;
		if (typeof callback=='string') ezf = String(callback);
		else if (typeof callback.easyfunc=='string') ezf = callback.easyfunc;
		if (ezf!=undefined && ezf.indexOf("(")>-1 && ezf.indexOf(")")>-1) {
			if (extensions.shortcuts!=undefined) callback = extensions.shortcuts.parseStringTypeCallback(ezf);
			else if (OUTPUT_LEVEL>0) FuseKitCommon.error('008');
		}
		else if (typeof callback=='function' || typeof callback=='string') {
			callback = {func:callback};
		}
		// now parse callback object for engine, or throw errors if not parseable.
		for (var i:String in callback) { // for-in enables detection of missing funcs that are declared in an object. a missing func passed in straight for callback is not detectable since it's undefined.
			var fi:Number = (i.toLowerCase()).indexOf('func');
			if (fi>-1) {
				var prefix:String = i.slice(0,fi);
				var func:Object = callback[i];
				var args:Object = callback[prefix+'args'];
				var scope:Object = callback[prefix+'scope'];
				// try to locate an unscoped or mis-scoped func-string - in any target/_parent,_root,_global,finally via eval.
				if (typeof func=='string' && scope[func]==undefined) { 
					for (var j:String in targets) {
						var targ:Object = targets[j];
						if (typeof targ[func]=='function') {
							scope = targ;
							break;
						}
						if (typeof targ._parent[func]=='function') {
							scope = targ._parent;
							break;
						}
					}
					if (scope==undefined && _level0[func]!=undefined) scope = _level0;
					if (scope==undefined && _global[func]!=undefined) scope = _global;
				}
				if (typeof func!='function') {
					if (typeof scope[String(func)]=='function') func = scope[String(func)];
					else func = eval(String(func));
				}
				if (func==undefined) {
					cbErrors.push(String(i+':'+((typeof callback[i]=='string')?'"'+callback[i]+'"':callback[i])+'/'+prefix+'scope:'+(scope)));
				}
				else {
					if (args!=undefined && !(args instanceof Array)) args = [args];
					if (prefix=='') prefix = 'end';
					validCBs[prefix] = {s:scope, f:func, a:args, id:cbTicker++};
					if (prefix=='start') validCBs.start.fired = false;
				}
			}
			else if ((FuseKitCommon._cbprops()).indexOf('|'+i+'|')==-1) {
				FuseKitCommon.error('009',i);
			}
		}
		if (cbErrors.length>0 && OUTPUT_LEVEL>0) {
			if (OUTPUT_LEVEL>0) FuseKitCommon.error('010',cbErrors.length,cbErrors.toString());
		}
		return validCBs;
	}
}