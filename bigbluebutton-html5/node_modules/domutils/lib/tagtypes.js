"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var domelementtype_1 = require("domelementtype");
function isTag(node) {
    return domelementtype_1.isTag(node);
}
exports.isTag = isTag;
function isCDATA(node) {
    return node.type === "cdata" /* CDATA */;
}
exports.isCDATA = isCDATA;
function isText(node) {
    return node.type === "text" /* Text */;
}
exports.isText = isText;
function isComment(node) {
    return node.type === "comment" /* Comment */;
}
exports.isComment = isComment;
function hasChildren(node) {
    return Object.prototype.hasOwnProperty.call(node, "children");
}
exports.hasChildren = hasChildren;
