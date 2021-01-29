'use strict';

// filter function for ancestor elements

var filterAncestor = function filterAncestor(item) {
    return item.nodeType === 1 && item.tagName.toLowerCase() !== 'body' && item.tagName.toLowerCase() !== 'html';
};

// filter function for sibling elements
var filterSibling = function filterSibling(item) {
    return item.nodeType === 1 && item.tagName.toLowerCase() !== 'script';
};

// reducer to flatten arrays
var flattenArrays = function flattenArrays(a, b) {
    return a.concat(b);
};

// recursive function to get previous sibling nodes of given element
function getPreviousSiblings(el) {
    var siblings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var previousSibling = el.previousSibling;

    if (!previousSibling) {
        return siblings;
    }

    siblings.push(previousSibling);

    return getPreviousSiblings(previousSibling, siblings);
}

// recursive function to get next sibling nodes of given element
function getNextSiblings(el) {
    var siblings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var nextSibling = el.nextSibling;

    if (!nextSibling) {
        return siblings;
    }

    siblings.push(nextSibling);

    return getNextSiblings(nextSibling, siblings);
}

// returns all sibling element nodes of given element
function getSiblings(el) {
    var allSiblings = getPreviousSiblings(el).concat(getNextSiblings(el));

    return allSiblings.filter(filterSibling);
}

// recursive function to get all ancestor nodes of given element
function getAllAncestors(el) {
    var ancestors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var nextAncestor = el.parentNode;

    if (!nextAncestor) {
        return ancestors;
    }

    ancestors.push(nextAncestor);

    return getAllAncestors(nextAncestor, ancestors);
}

// get ancestor nodes of given element
function getAncestors(el) {
    return getAllAncestors(el).filter(filterAncestor);
}

// get siblings of ancestors (i.e. aunts and uncles) of given el
function getSiblingsOfAncestors(el) {
    return getAncestors(el).map(function (item) {
        return getSiblings(item);
    }).reduce(flattenArrays, []);
}

module.exports = {
    getSiblings: getSiblings,
    getAncestors: getAncestors,
    getSiblingsOfAncestors: getSiblingsOfAncestors
};
