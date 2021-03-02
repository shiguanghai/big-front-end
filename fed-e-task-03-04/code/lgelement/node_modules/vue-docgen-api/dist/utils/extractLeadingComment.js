"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var guards_1 = require("./guards");
/**
 * Extract leading comments to an html node
 * Even if the comment is on multiple lines it's still taken as a whole
 * @param templateAst
 * @param rootLeadingComment
 */
function extractLeadingComment(siblings, templateAst) {
    // if the slot has no comment siblings, the slot is not documented
    if (siblings.length < 1) {
        return [];
    }
    // First find the position of the slot in the list
    var i = siblings.length - 1;
    var currentSlotIndex = -1;
    do {
        if (siblings[i] === templateAst) {
            currentSlotIndex = i;
        }
    } while (currentSlotIndex < 0 && i--);
    // Find the first leading comment
    // get all siblings before the current node
    var slotSiblingsBeforeSlot = siblings.slice(0, currentSlotIndex).reverse();
    // find the first node that is not a potential comment
    var indexLastComment = slotSiblingsBeforeSlot.findIndex(function (sibling) { return !guards_1.isCommentNode(sibling); });
    // cut the comments array on this index
    var slotLeadingComments = (indexLastComment > 0
        ? slotSiblingsBeforeSlot.slice(0, indexLastComment)
        : slotSiblingsBeforeSlot)
        .reverse()
        .filter(guards_1.isCommentNode);
    // return each comment text
    return slotLeadingComments.map(function (comment) { return comment.content.trim(); });
}
exports.default = extractLeadingComment;
