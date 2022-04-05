import probe from 'probe-image-size';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import flat from 'flat';
import RedisPubSub from '/imports/startup/server/redis';
import { Slides } from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';
import { SVG, PNG } from '/imports/utils/mimeTypes';
import calculateSlideData from '/imports/api/slides/server/helpers';
import addSlidePositions from './addSlidePositions';

export default function addShapee(shape) {

    delete shape._id;
    Slides.upsert({ meetingId: shape.meetingId, id: shape.id }, { ...shape })

}