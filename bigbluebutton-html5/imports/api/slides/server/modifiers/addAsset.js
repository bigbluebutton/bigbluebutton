import probe from 'probe-image-size';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import flat from 'flat';
import RedisPubSub from '/imports/startup/server/redis';
import { Slides } from '/imports/api/slides'
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import { SVG, PNG } from '/imports/utils/mimeTypes';
import calculateSlideData from '/imports/api/slides/server/helpers';
import addSlidePositions from './addSlidePositions';

export default function addAsset(asset) {

    // delete shape._id;
    Captions.upsert({ meetingId: asset.meetingId, id: asset.id }, { ...asset })
}