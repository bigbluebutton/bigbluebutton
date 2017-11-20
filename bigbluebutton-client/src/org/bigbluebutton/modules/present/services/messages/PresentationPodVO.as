package org.bigbluebutton.modules.present.services.messages
{
import mx.collections.ArrayCollection;

    public class PresentationPodVO {
        private var _id:String;
        private var _currentPresenter:String;
        private var _authorizedPresenters:ArrayCollection;
        private var _presentations:ArrayCollection;

        public function PresentationPodVO(id: String, currentPresenter: String,
                                          authorizedPresenters: ArrayCollection,
                                          presentations: ArrayCollection) {
            _id = id;
            _currentPresenter = currentPresenter;
            _authorizedPresenters = authorizedPresenters;
            _presentations = presentations;
        }

        public function get id():String {
            return _id;
        }

        public function get currentPresenter():String {
            return _currentPresenter;
        }

        public function getAuthorizedPresenters():ArrayCollection {
            var authorizedPresenters:ArrayCollection = new ArrayCollection();

            for (var i: int = 0; i < _authorizedPresenters.length; i++) {
                authorizedPresenters.addItem(_authorizedPresenters.getItemAt(i) as String);
            }

            return authorizedPresenters;
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
