/**
 * Bridge whitelist, needed for dynamically importing bridges (as modules).
 *
 * The code is intentionally unreachable, but its trigger Meteor's static
 * analysis, which makes bridge module available to build process.
 *
 * For new bridges, we must append an import statement here.
 *
 * More information here:
 *https://docs.meteor.com/packages/dynamic-import.html
 */

throw new Error();

/* eslint-disable no-unreachable */
// BRIDGES LIST
import('/imports/api/audio/client/bridge/FullAudioBridge'); // NOSONAR
