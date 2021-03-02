"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bt = __importStar(require("@babel/types"));
/**
 * Determines if node contains the value -1
 * @param node
 */
function isMinusOne(node) {
    return (bt.isUnaryExpression(node) &&
        node.operator === '-' &&
        bt.isNumericLiteral(node.argument) &&
        node.argument.value === 1);
}
function extractStringArray(valuesObjectNode) {
    return bt.isArrayExpression(valuesObjectNode)
        ? valuesObjectNode.elements.map(function (e) { return e.value; }).filter(function (e) { return e; })
        : undefined;
}
function parseValidatorForValues(validatorNode) {
    var returnedExpression = bt.isMethod(validatorNode) &&
        validatorNode.body.body.length === 1 &&
        bt.isReturnStatement(validatorNode.body.body[0])
        ? validatorNode.body.body[0].argument
        : bt.isArrowFunctionExpression(validatorNode)
            ? validatorNode.body
            : undefined;
    var varName = validatorNode.params && bt.isIdentifier(validatorNode.params[0])
        ? validatorNode.params[0].name
        : undefined;
    if (bt.isBinaryExpression(returnedExpression)) {
        var valuesNode = void 0;
        switch (returnedExpression.operator) {
            case '>':
                if (isMinusOne(returnedExpression.right)) {
                    valuesNode = returnedExpression.left;
                }
                break;
            case '<':
                if (bt.isExpression(returnedExpression.left) && isMinusOne(returnedExpression.left)) {
                    valuesNode = returnedExpression.right;
                }
                break;
            case '!==':
            case '!=':
                if (bt.isExpression(returnedExpression.left) && isMinusOne(returnedExpression.left)) {
                    valuesNode = returnedExpression.right;
                }
                else if (isMinusOne(returnedExpression.right)) {
                    valuesNode = returnedExpression.left;
                }
                break;
            default:
                return undefined;
        }
        var values = bt.isCallExpression(valuesNode) &&
            bt.isIdentifier(valuesNode.arguments[0]) &&
            varName === valuesNode.arguments[0].name &&
            bt.isMemberExpression(valuesNode.callee) &&
            bt.isIdentifier(valuesNode.callee.property) &&
            valuesNode.callee.property.name === 'indexOf'
            ? extractStringArray(valuesNode.callee.object)
            : undefined;
        return values;
    }
    else if (bt.isCallExpression(returnedExpression)) {
        if (bt.isMemberExpression(returnedExpression.callee) &&
            bt.isIdentifier(returnedExpression.callee.property) &&
            returnedExpression.callee.property.name === 'includes') {
            return extractStringArray(returnedExpression.callee.object);
        }
    }
    return undefined;
}
exports.default = parseValidatorForValues;
