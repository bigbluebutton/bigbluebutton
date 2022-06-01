import Captions from '/imports/api/captions';

export default function addAsset(asset) {

    delete asset._id;
    Captions.upsert({ meetingId: asset.meetingId, id: asset.id }, { ...asset })
}
