'use strict';

var util = require('./util.js');

// the main landmark
var mainEl = void 0;

// the element that will be trapped
var trappedEl = void 0;

// collection of elements that get 'dirtied' with aria-hidden attr
var dirtyObjects = void 0;

function prepareAttribute(el, dirtyValue) {
    return {
        el: el,
        cleanValue: el.getAttribute('aria-hidden'),
        dirtyValue: dirtyValue
    };
}

function dirtyAttribute(preparedObj) {
    preparedObj.el.setAttribute('aria-hidden', preparedObj.dirtyValue);
}

function cleanAttribute(preparedObj) {
    if (preparedObj.cleanValue) {
        preparedObj.el.setAttribute('aria-hidden', preparedObj.cleanValue);
    } else {
        preparedObj.el.removeAttribute('aria-hidden');
    }
}

function untrap() {
    if (trappedEl) {
        // restore 'dirtied' elements to their original state
        dirtyObjects.forEach(function (item) {
            return cleanAttribute(item);
        });

        dirtyObjects = [];

        // 're-enable' the main landmark
        if (mainEl) {
            mainEl.setAttribute('role', 'main');
        }

        // let observers know the screenreader is now untrapped
        trappedEl.dispatchEvent(new CustomEvent('screenreaderUntrap', { bubbles: true }));

        trappedEl = null;
    }
}

function trap(el) {
    // ensure current trap is deactivated
    untrap();

    // update the trapped el reference
    trappedEl = el;

    // update the main landmark reference
    mainEl = document.querySelector('main, [role="main"]');

    // we must remove the main landmark to avoid issues on voiceover iOS
    if (mainEl) {
        mainEl.setAttribute('role', 'presentation');
    }

    // cache all ancestors, siblings & siblings of ancestors for trappedEl
    var ancestors = util.getAncestors(trappedEl);
    var siblings = util.getSiblings(trappedEl);
    var siblingsOfAncestors = util.getSiblingsOfAncestors(trappedEl);

    // prepare elements
    dirtyObjects = [prepareAttribute(trappedEl, 'false')].concat(ancestors.map(function (item) {
        return prepareAttribute(item, 'false');
    })).concat(siblings.map(function (item) {
        return prepareAttribute(item, 'true');
    })).concat(siblingsOfAncestors.map(function (item) {
        return prepareAttribute(item, 'true');
    }));

    // update DOM
    dirtyObjects.forEach(function (item) {
        return dirtyAttribute(item);
    });

    // let observers know the screenreader is now trapped
    trappedEl.dispatchEvent(new CustomEvent('screenreaderTrap', { bubbles: true }));
}

module.exports = {
    trap: trap,
    untrap: untrap
};
