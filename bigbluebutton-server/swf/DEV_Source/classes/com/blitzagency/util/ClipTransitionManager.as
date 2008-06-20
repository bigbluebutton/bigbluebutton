/*
* AS2 Stub code generated with gModeler.com
*
* Clip Transition Manager
* Author: John Grden
* Version: N/A
* Classes: ClipTransitionManager
*/

import mx.utils.Delegate;
import mx.events.EventDispatcher;
/**
* @class ClipTransitionManager
* @tooltip No description available.
* @author John Grden
* @version N/A
*/
class com.blitzagency.util.ClipTransitionManager 
{
	public static var CLASS_REF = com.blitzagency.util.ClipTransitionManager;

	// debug can be changed remotely.  If set to true, debug statements will come through to Xray
	public var debug:Boolean;
	public var addEventListener:Function;
	public var removeEventListener:Function;

	// properties:
	/**
	* @property currentClip
	* @type MovieClip
	*/
	public var currentClip:MovieClip;

	/**
	* @property inTransition
	* @tooltip set to false initialy - changed when transitionClips is called, and when onTransitionInComplete is called
	* @type Boolean
	*/
	public var inTransition:Boolean = false;

	/**
	* @property nextClip
	* @type MovieClip
	*/
	public var nextClip:MovieClip;
	
	public var prevClip:MovieClip;
	
	private var dispatchEvent:Function;	
	
	/*
	public static var _instance:ClipTransitionManager = null;

	public static function getInstance(p_startingClip):ClipTransitionManager
	{
		if(ClipTransitionManager._instance == null)
		{
			ClipTransitionManager._instance = new ClipTransitionManager(p_startingClip);
			ClipTransitionManager._instance.config(p_startingClip); 
		}
		return ClipTransitionManager._instance;
	}
	*/

//constructor: 
	public function ClipTransitionManager(p_startingClip:MovieClip) 
	{
		// constructor
		EventDispatcher.initialize(this);
		if(p_startingClip != undefined) config(p_startingClip);
	}
	
	public function config(p_startingClip):Void
	{
		if(p_startingClip != undefined) 
		{
			initClip(p_startingClip);
			currentClip = p_startingClip;
			transitionIn(p_startingClip);
		}
	}

// methods:

	/**
	* @method initClip
	* @tooltip initializes a movieclip with an onTransitionOut (which calls ClipTransitionManager.onTransitionComplete) method if none exists, as well as a transitionIn method
	* @param p_mc (MovieClip) movieclip to initialize
	* @return Void
	*/
	function initClip(p_mc:MovieClip):Void 
	{
		if(p_mc.onTransitionIn == undefined) p_mc.onTransitionIn = Delegate.create(this, onTransitionInComplete);
		if(p_mc.onTransitionOut == undefined) p_mc.onTransitionOut = Delegate.create(this, onTransitionOutComplete);
	}

	/**
	* @method onTransitionInComplete
	* @return Void
	*/
	function onTransitionInComplete():Void 
	{
		if(debug) _global.tt("ClipTransitionManager - onTransitionInComplete", nextClip);
		// set previous clip
		prevClip = currentClip;
		
		// set currentClip to the new clip
		if(nextClip != undefined) currentClip = nextClip;
		
		// clear nextClip
		nextClip = undefined;
		
		// set state
		inTransition = false;
		
		// dispatchEvent
		dispatchEvent({type:"onTransitionInComplete", currentClip:currentClip})
	}

	/**
	* @method onTransitionOutComplete
	* @tooltip Responsible for transitioning next clip IN
	* @return Void
	*/
	function onTransitionOutComplete():Void 
	{
		if(debug) _global.tt("ClipTransitionManager - onTransitionOutComplete");
		if(nextClip != undefined) transitionIn(nextClip);
		
		// dispatchEvent
		dispatchEvent({type:"onTransitionOutComplete", nextClip:nextClip})
	}

	/**
	* @method transitionClips
	* @tooltip The movieclip to transitionIn once the current movieclip is transitionedOut.  Set nextClip with p_desitinationMC
	* @param p_destinationMC (MovieClip) p_destinationMC parameter.
	* @return Void
	*/
	function transitionClips(p_destinationClip:MovieClip):Boolean 
	{
		if(debug) _global.tt("ClipTransitionManager - transitionClips", p_destinationClip);
		
		// check to see if the destinationClip and the currentClip are the same
		if(p_destinationClip == currentClip || inTransition) 
		{
			if(debug) _global.tt("destinationClip == currentClip - ClipTransitionManager will not continue");
								 
			return false;
		}
		
		// make sure the destination Clip has an onTransitionOut() method
		initClip(p_destinationClip);
		
		if(currentClip != undefined)
		{
			if(debug) _global.tt("ClipTransitionManager - CurrentClip != undefined");
			// set the nextClip
			nextClip = p_destinationClip;
			
			// tell currentClip to transition
			transitionOut(currentClip);
			
			// set state
			inTransition = true;
			
			return true;
		}else
		{
			if(debug) _global.tt("ClipTransitionManager - CurrentClip == undefined");
			currentClip = p_destinationClip;
			transitionIn(p_destinationClip);
		}
		
		// we return false so that the caller can be notified that there's no currentclip.
		return false;
	}
	
	private function transitionIn(p_mc:MovieClip):Void
	{
		if(debug) _global.tt("ClipTransitionManager - transitionIn");
		if(p_mc.transitionIn != undefined)
		{
			if(debug) _global.tt("ClipTransitionManager - calling transitionIn() method on clip");
			p_mc.transitionIn();
		}else
		{
			if(debug) _global.tt("ClipTransitionManager - transitionIn() method for clip undefined");
			p_mc.gotoAndPlay("transitionIn");
		}
		
		// dispatchEvent
		dispatchEvent({type:"onTransitionIn", target:p_mc});
	}
	
	private function transitionOut(p_mc:MovieClip):Void
	{
		if(debug) _global.tt("ClipTransitionManager - transitionOut");
		if(p_mc.transitionOut != undefined)
		{
			if(debug) _global.tt("ClipTransitionManager - calling transitionOut() method on clip");
			p_mc.transitionOut();
		}else
		{
			if(debug) _global.tt("ClipTransitionManager - transitionOut() method for clip undefined");
			p_mc.gotoAndPlay("transitionOut");
		}
		
		// dispatchEvent
		dispatchEvent({type:"onTransitionOut", target:p_mc});
	}
}

// ** END ClipTransitionManager ***************************************************
