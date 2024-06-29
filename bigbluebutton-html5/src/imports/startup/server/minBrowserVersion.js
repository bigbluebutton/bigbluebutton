import { Meteor } from 'meteor/meteor';
import { setMinimumBrowserVersions } from 'meteor/modern-browsers';

const setMinBrowserVersions = () => {
  const { minBrowserVersions } = Meteor.settings.private;

  const versions = {};

  minBrowserVersions.forEach((elem) => {
    let { version } = elem;
    if (version === 'Infinity') version = Infinity;

    versions[elem.browser] = version;
  });

  setMinimumBrowserVersions(versions, 'bbb-min');
};

export default setMinBrowserVersions;
