import { Session } from 'meteor/session';
import { withTracker } from 'meteor/react-meteor-data';
import BannerComponent from './component';

export default withTracker(() => ({
  color: Session.get('bannerColor') || '#0F70D7',
  text: Session.get('bannerText') || '',
}))(BannerComponent);
