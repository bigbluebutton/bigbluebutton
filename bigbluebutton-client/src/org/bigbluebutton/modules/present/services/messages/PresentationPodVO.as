package org.bigbluebutton.modules.present.services.messages
{
import mx.collections.ArrayCollection;

    public class PresentationPodVO {
        private var _id:String;
        private var _currentPresenter:String;
        private var _presentations:ArrayCollection;

        public function PresentationPodVO(id: String, currentPresenter: String,
                                          presentations: ArrayCollection) {
            _id = id;
            _currentPresenter = currentPresenter;
            _presentations = presentations;
        }

        public function get id():String {
            return _id;
        }

        public function get currentPresenter():String {
            return _currentPresenter;
        }

        public function getPresentations():ArrayCollection {
            var presentations:ArrayCollection = new ArrayCollection();

            for (var i: int = 0; i < _presentations.length; i++) {
                presentations.addItem(_presentations.getItemAt(i) as PresentationVO);
            }

            return presentations;
        }
    }
}
