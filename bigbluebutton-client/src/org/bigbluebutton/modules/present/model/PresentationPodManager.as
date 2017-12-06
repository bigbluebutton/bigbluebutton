package org.bigbluebutton.modules.present.model {
    import com.asfusion.mate.events.Dispatcher;
    
    import flash.events.Event;
    
    import mx.collections.ArrayCollection;
    
    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;
    import org.bigbluebutton.core.EventConstants;
    import org.bigbluebutton.modules.present.events.NewPresentationPodCreated;
    import org.bigbluebutton.modules.present.events.RequestPresentationInfoPodEvent;
    import org.bigbluebutton.modules.present.services.PresentationService;
    import org.bigbluebutton.modules.present.services.messages.PresentationPodVO;

    
    public class PresentationPodManager {
        private static const LOGGER:ILogger = getClassLogger(PresentationPodManager);
    
        private static var instance:PresentationPodManager = null;
    
        private var _presentationPods: ArrayCollection = new ArrayCollection();
        private var globalDispatcher:Dispatcher;
        private var presentationService: PresentationService;

        public static const DEFAULT_POD_ID:String = "DEFAULT_PRESENTATION_POD";

        /**
         * This class is a singleton. Please initialize it using the getInstance() method.
         *
         */
        public function PresentationPodManager(enforcer:SingletonEnforcer) {
            if (enforcer == null) {
                throw new Error("There can only be 1 PresentationPodManager instance");
            }
            globalDispatcher = new Dispatcher();
        }
    
        /**
         * Return the single instance of the PresentationPodManager class
         */
        public static function getInstance():PresentationPodManager {
            if (instance == null) {
                instance = new PresentationPodManager(new SingletonEnforcer());
            }

            return instance;
        }
        
        public function setPresentationService(service: PresentationService): void {
            this.presentationService = service;
        }
        
        public function getPod(podId: String): PresentationModel {
            for (var i:int = 0; i < _presentationPods.length; i++) {
                var pod: PresentationModel = _presentationPods.getItemAt(i) as PresentationModel;

                if (pod.getPodId() == podId) {
                    return pod;
                }
            }
            return null;
		}

		public function getPodSequence(podId:String):int {
			var sequence : int = 1;
			if (podId != DEFAULT_POD_ID) {
				for (var i:int = 1; i < _presentationPods.length; i++) {
					var pod:PresentationModel = _presentationPods.getItemAt(i) as PresentationModel;

					if (pod.getPodId() == podId) {
						sequence = i + 1;
						break;
					}
				}
			}
			return sequence;
		}

        public function getDefaultPresentationPod(): PresentationModel {
            var pod: PresentationModel = getPod(DEFAULT_POD_ID);
            return pod;
        }

        public function handleAddPresentationPod(podId: String): void {
            for (var i:int = 0; i < _presentationPods.length; i++) {
                var pod: PresentationModel = _presentationPods.getItemAt(i) as PresentationModel;
                if (pod.getPodId() == podId) {
                    return;
                }
            }

            var newPod: PresentationModel = new PresentationModel(podId);
            _presentationPods.addItem(newPod);
			globalDispatcher.dispatchEvent(new Event(EventConstants.PRESENTATION_PODS_COUNT_UPDATE));
        }
        
        public function handlePresentationPodRemoved(podId: String): void {
            for (var i:int = 0; i < _presentationPods.length; i++) {
                var pod: PresentationModel = _presentationPods.getItemAt(i) as PresentationModel;

                if (pod.getPodId() == podId) {
                    _presentationPods.removeItemAt(i);
					globalDispatcher.dispatchEvent(new Event(EventConstants.PRESENTATION_PODS_COUNT_UPDATE));
                    return;
                }
            }
        }
        
        public function requestAllPodsPresentationInfo(): void {
            for (var i:int = 0; i < _presentationPods.length; i++) {
                var pod: PresentationModel = _presentationPods.getItemAt(i) as PresentationModel;

                var event:RequestPresentationInfoPodEvent = new RequestPresentationInfoPodEvent(RequestPresentationInfoPodEvent.REQUEST_PRES_INFO);
                event.podId = pod.getPodId();
                globalDispatcher.dispatchEvent(event);
            }
        }

        public function handleGetAllPodsResp(podsAC: ArrayCollection): void {
            for (var j:int = 0; j < podsAC.length; j++) {
                var podVO: PresentationPodVO = podsAC.getItemAt(j) as PresentationPodVO;

                globalDispatcher.dispatchEvent(new NewPresentationPodCreated(podVO.id, podVO.currentPresenter));

                var presentationsToAdd:ArrayCollection = podVO.getPresentations();
                presentationService.addPresentations(podVO.id, presentationsToAdd);
            }
        }

    }
}

class SingletonEnforcer{}
