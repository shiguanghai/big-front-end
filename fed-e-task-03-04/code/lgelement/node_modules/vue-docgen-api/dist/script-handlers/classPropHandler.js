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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bt = __importStar(require("@babel/types"));
var getDocblock_1 = __importDefault(require("../utils/getDocblock"));
var getDoclets_1 = __importDefault(require("../utils/getDoclets"));
var getTypeFromAnnotation_1 = __importDefault(require("../utils/getTypeFromAnnotation"));
var transformTagsIntoObject_1 = __importDefault(require("../utils/transformTagsIntoObject"));
var propHandler_1 = __importStar(require("./propHandler"));
var getArgFromDecorator_1 = __importDefault(require("../utils/getArgFromDecorator"));
/**
 * Extracts prop information from a class-style VueJs component
 * @param documentation
 * @param path
 */
function classPropHandler(documentation, path) {
    if (bt.isClassDeclaration(path.node)) {
        var config = getArgFromDecorator_1.default(path.get('decorators'));
        if (config && bt.isObjectExpression(config.node)) {
            propHandler_1.default(documentation, config);
        }
        path
            .get('body')
            .get('body')
            .filter(function (p) { return bt.isClassProperty(p.node) && !!p.node.decorators; })
            .forEach(function (propPath) {
            var propDeco = (propPath.get('decorators') || []).filter(function (p) {
                var exp = bt.isCallExpression(p.node.expression)
                    ? p.node.expression.callee
                    : p.node.expression;
                return bt.isIdentifier(exp) && exp.name === 'Prop';
            });
            if (!propDeco.length) {
                return undefined;
            }
            var propName = bt.isIdentifier(propPath.node.key) ? propPath.node.key.name : undefined;
            if (!propName) {
                return undefined;
            }
            var propDescriptor = documentation.getPropDescriptor(propName);
            // description
            var docBlock = getDocblock_1.default(propPath);
            var jsDoc = docBlock ? getDoclets_1.default(docBlock) : { description: '', tags: [] };
            var jsDocTags = jsDoc.tags ? jsDoc.tags : [];
            if (jsDocTags) {
                propDescriptor.tags = transformTagsIntoObject_1.default(jsDocTags);
            }
            if (jsDoc.description) {
                propDescriptor.description = jsDoc.description;
            }
            propHandler_1.extractValuesFromTags(propDescriptor);
            var litteralType;
            if (propPath.node.typeAnnotation) {
                var values = !!bt.isTSTypeAnnotation(propPath.node.typeAnnotation) &&
                    propHandler_1.getValuesFromTypeAnnotation(propPath.node.typeAnnotation.typeAnnotation);
                if (values) {
                    propDescriptor.values = values;
                    propDescriptor.type = { name: 'string' };
                    litteralType = 'string';
                }
                else {
                    // type
                    propDescriptor.type = getTypeFromAnnotation_1.default(propPath.node.typeAnnotation);
                }
            }
            else if (propPath.node.value) {
                propDescriptor.type = getTypeFromInitValue(propPath.node.value);
            }
            var propDecoratorPath = propDeco[0].get('expression');
            if (bt.isCallExpression(propDecoratorPath.node)) {
                var propDecoratorArg = propDecoratorPath.get('arguments', 0);
                if (propDecoratorArg && bt.isObjectExpression(propDecoratorArg.node)) {
                    var propsPath = propDecoratorArg
                        .get('properties')
                        .filter(function (p) { return bt.isObjectProperty(p.node); });
                    // if there is no type annotation, get it from the decorators arguments
                    if (!propPath.node.typeAnnotation) {
                        litteralType = propHandler_1.describeType(propsPath, propDescriptor);
                    }
                    propHandler_1.describeDefault(propsPath, propDescriptor, litteralType || '');
                    propHandler_1.describeRequired(propsPath, propDescriptor);
                }
            }
            return undefined;
        });
    }
    return Promise.resolve();
}
exports.default = classPropHandler;
function getTypeFromInitValue(node) {
    if (bt.isNumericLiteral(node)) {
        return { name: 'number' };
    }
    if (bt.isStringLiteral(node) || bt.isTemplateLiteral(node)) {
        return { name: 'string' };
    }
    if (bt.isBooleanLiteral(node)) {
        return { name: 'boolean' };
    }
    return undefined;
}
