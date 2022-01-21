
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import ModalConsent from './component';
import { RecordMeetings } from '/imports/api/meetings';
import Meetings from '../../../api/meetings/index';


let ModalConsentContainer = withTracker(()=>{
    Meteor.subscribe('record-meetings');
    Meteor.subscribe('breakouts');
    let recMeetingsCollection = RecordMeetings.find().fetch();
    let meetingsCollection = Meetings.find().fetch();
    return {
        recMeetingsCollection,
        meetingsCollection
    }
})(ModalConsent)


export default ModalConsentContainer;