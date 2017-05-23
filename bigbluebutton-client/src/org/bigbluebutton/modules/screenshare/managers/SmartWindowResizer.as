package org.bigbluebutton.modules.screenshare.managers {
    public class SmartWindowResizer {

        static private var RESIZING_DIRECTION_UNKNOWN:int = 0;
        static private var RESIZING_DIRECTION_VERTICAL:int = 1;
        static private var RESIZING_DIRECTION_HORIZONTAL:int = 2;
        static private var RESIZING_DIRECTION_BOTH:int = 3;
        private var _resizeDirection:int;

        public function SmartWindowResizer() {}

        public function onResizeStart():void {
            /**
             * when the window is resized by the user, the application doesn't know
             * about the resize direction
             */
            _resizeDirection = RESIZING_DIRECTION_UNKNOWN;
        }

        public function onResizeEnd():void {
            /**
             * after the resize ends, the direction is set to BOTH because of the
             * non-user resize actions - like when the window is docked, and so on
             */
            _resizeDirection = RESIZING_DIRECTION_BOTH;
        }

        public function onResize(externalWidth:int, externalHeight:int, maximized:Boolean, internalWidth:int, internalHeight:int, internalAspectRatio:Number, keepInternalAspectRatio:Boolean, callback:Function):void {
            var internalWidthCandidate:int = externalWidth;
            var internalHeightCandidate:int = externalHeight;

            // try to discover in which direction the user is resizing the window
            if (_resizeDirection != RESIZING_DIRECTION_BOTH) {
                if (internalWidthCandidate == internalWidth && internalHeightCandidate != internalHeight) {
                    _resizeDirection = (_resizeDirection == RESIZING_DIRECTION_VERTICAL || _resizeDirection == RESIZING_DIRECTION_UNKNOWN? RESIZING_DIRECTION_VERTICAL: RESIZING_DIRECTION_BOTH);
                } else if (internalWidthCandidate != internalWidth && internalHeightCandidate == internalHeight) {
                    _resizeDirection = (_resizeDirection == RESIZING_DIRECTION_HORIZONTAL || _resizeDirection == RESIZING_DIRECTION_UNKNOWN? RESIZING_DIRECTION_HORIZONTAL: RESIZING_DIRECTION_BOTH);
                } else {
                    _resizeDirection = RESIZING_DIRECTION_BOTH;
                }
            }

            // depending on the direction, the tmp size is different
            switch (_resizeDirection) {
                case RESIZING_DIRECTION_VERTICAL:
                    internalWidthCandidate = Math.floor(internalHeightCandidate * internalAspectRatio);
                    break;
                case RESIZING_DIRECTION_HORIZONTAL:
                    internalHeightCandidate = Math.floor(internalWidthCandidate / internalAspectRatio);
                    break;
                case RESIZING_DIRECTION_BOTH:
                    // this direction is used also for non-user window resize actions
                    internalWidthCandidate = Math.min (internalWidthCandidate, Math.floor(internalHeightCandidate * internalAspectRatio));
                    internalHeightCandidate = Math.min (internalHeightCandidate, Math.floor(internalWidthCandidate / internalAspectRatio));
                    break;
            }

            var internalOffsetX:int;
            var internalOffsetY:int;

            if (!keepInternalAspectRatio || maximized) {
                // center the video in the window
                internalOffsetX = Math.floor ((externalWidth - internalWidthCandidate) / 2);
                internalOffsetY = Math.floor ((externalHeight - internalHeightCandidate) / 2);
            } else {
                // fit window dimensions on video
                internalOffsetX = 0;
                internalOffsetY = 0;
                externalWidth = internalWidthCandidate;
                externalHeight = internalHeightCandidate;
            }

            callback(externalWidth, externalHeight, internalWidthCandidate, internalHeightCandidate, internalOffsetX, internalOffsetY);
        }
    }
}
