package org.bigbluebutton.modules.whiteboard.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.whiteboard.BoardFacade;
	import org.bigbluebutton.modules.whiteboard.WhiteboardModuleConstants;
	import org.bigbluebutton.modules.whiteboard.model.DrawProxy;
	import org.bigbluebutton.modules.whiteboard.model.component.DrawObject;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * The mediator class for the Board GUI component.
	 * <p>
	 * This class extends the Mediator class of the PureMVC framework
	 * @author dzgonjan
	 * 
	 */	
	public class BoardMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "BoardMediator";
		
		public static const SEND_SHAPE:String = "sendShape";
		public static const CLEAR_BOARD:String = "clearBoard";
		public static const UNDO_SHAPE:String = "undoShape"
		
		private var _module:WhiteboardModule;
		private var _window:Board;
		private var _whiteboardWindowOpen:Boolean = false;
		/**
		 * The constructor. Calls the super constructor and registers the event listener to listen for updates
		 * coming from the Board GUI component. 
		 * @param view The Board component
		 * 
		 */		
		public function BoardMediator(module:WhiteboardModule):void
		{
			super(NAME, module);
			_module = module;
			_window = new Board();
			_window.name = _module.username;
			board.addEventListener(BoardMediator.SEND_SHAPE, sendUpdate);
			board.addEventListener(BoardMediator.CLEAR_BOARD, sendClear);
			board.addEventListener(BoardMediator.UNDO_SHAPE, undoShape);
		}
		
		/**
		 * Returns the Board GUI component that is registered to this Mediator object 
		 * @return 
		 * 
		 */		
		protected function get board():Board{
			return _window as Board;
		}
		
		/**
		 * Once an event is received from the board component, the sendUpdate method calls the DrawProxy, sending
		 * to it the shape that has just been drawn on the screen 
		 * @param e The received event from the Board
		 * 
		 */		
		protected function sendUpdate(e:Event):void{
			proxy.sendShape(this.board.d);
		}
		
		/**
		 * Calls the Proxy to send out a clear event over all clients 
		 * @param e
		 * 
		 */		
		protected function sendClear(e:Event):void{
			proxy.clearBoard();
		}
		
		/**
		 * Calls the Proxy to send out an undo last shape event over all clients 
		 * @param e
		 * 
		 */		
		protected function undoShape(e:Event):void{
			proxy.undoShape();
		}
		
		/**
		 * Returns the DrawProxy of this application 
		 * @return 
		 * 
		 */		
		public function get proxy():DrawProxy{
			return facade.retrieveProxy(DrawProxy.NAME) as DrawProxy;
		}
		
		/**
		 * An override method that lists which notifications this class is interested in
		 * <p>
		 * This class listens to:
		 *		- BoardFacade.UPDATE 
		 * 		- BoardFacade.FAILED_CONNECTION
		 * 		- BoardFacade.CLEAR_BOARD
		 * @return An array of strings representing all the notifications being listened to
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					BoardFacade.UPDATE,
					BoardFacade.FAILED_CONNECTION,
					BoardFacade.CLEAR_BOARD,
					BoardFacade.UNDO_SHAPE,
					WhiteboardModuleConstants.CLOSE_WINDOW,
					WhiteboardModuleConstants.OPEN_WINDOW
				   ];
		}
		
		/**
		 * An override method that handles the Notification sent by other parts of the application 
		 * <p>
		 * If the BoardMediator is notified that a connection to Red5 is interupted at any point it
		 * will disable the whiteboard.
		 * @param notification The notification that was sent by another part of the application
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName())
			{
				case BoardFacade.UPDATE:
					this.board.drawSegment(notification.getBody() as DrawObject);
					break;
				
				case BoardFacade.FAILED_CONNECTION:
					this.board.enabled = false;
					break;
				
				case BoardFacade.CLEAR_BOARD:
					this.board.clearBoard();
					break;
				case BoardFacade.UNDO_SHAPE:
					this.board.undoShape();
					break;
				case WhiteboardModuleConstants.CLOSE_WINDOW:
					if (_whiteboardWindowOpen) {
						facade.sendNotification(WhiteboardModuleConstants.REMOVE_WINDOW, _window);
						_whiteboardWindowOpen = false;
					}
					break;
				case WhiteboardModuleConstants.OPEN_WINDOW:
					_window.width = 250;
		   			_window.height = 220;
		   			_window.title = "Whiteboard";
		   			_window.showCloseButton = false;
		   			_window.xPosition = 675;
		   			_window.yPosition = 0;
		   			facade.sendNotification(WhiteboardModuleConstants.ADD_WINDOW, _window); 
		   			_whiteboardWindowOpen = true;
		   			//proxy.getChatTranscript();
					break;
			}
		}

	}
}