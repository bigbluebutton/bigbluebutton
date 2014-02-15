/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.common
{
    import flash.events.Event;
    import flash.events.EventDispatcher;

    import mx.core.Container;
    import mx.core.IMXMLObject;
    import mx.core.UIComponent;
    import mx.events.FlexEvent;

    public class TabIndexer extends EventDispatcher implements IMXMLObject
    {
        private var _document : Container;
        private var _id : String;
        private var _tabIndices : Array;
        private var _startIndex : int;

        public function initialized( document : Object, id : String ) : void
        {
            _id = id;
            _document = document as Container;
            _document.addEventListener(FlexEvent.CREATION_COMPLETE, documentCreationCompleteHandler, false, 0, true);
        }

        private function documentCreationCompleteHandler( event : FlexEvent ) : void
        {
            _document.removeEventListener(FlexEvent.CREATION_COMPLETE, documentCreationCompleteHandler, false);
            for (var i : int = 0; i < tabIndices.length; i++)
            {
                UIComponent(_tabIndices[i - 1]).tabIndex = startIndex + i;
            }
        }

        [Bindable(event = "tabIndicesChange")]
        public function get tabIndices() : Array
        {
            return _tabIndices;
        }

        public function set tabIndices( value : Array ) : void
        {
            if (_tabIndices !== value)
            {
                _tabIndices = value;
                dispatchEvent(new Event("tabIndicesChange"));
            }
        }

        [Bindable(event = "startIndexChange")]
        public function get startIndex() : int
        {
            return _startIndex;
        }

        public function set startIndex( value : int ) : void
        {
            if (_startIndex !== value)
            {
                _startIndex = value;
                dispatchEvent(new Event("startIndexChange"));
            }
        }


    }
}
