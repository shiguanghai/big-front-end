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
exports.extractValuesFromTags = exports.describeDefault = exports.describeRequired = exports.getValuesFromTypeAnnotation = exports.describeType = void 0;
var bt = __importStar(require("@babel/types"));
var recast_1 = require("recast");
var getDocblock_1 = __importDefault(require("../utils/getDocblock"));
var getDoclets_1 = __importDefault(require("../utils/getDoclets"));
var transformTagsIntoObject_1 = __importDefault(require("../utils/transformTagsIntoObject"));
var getPropsFilter_1 = __importDefault(require("../utils/getPropsFilter"));
var getTemplateExpressionAST_1 = __importDefault(require("../utils/getTemplateExpressionAST"));
var parseValidator_1 = __importDefault(require("./utils/parseValidator"));
function getRawValueParsedFromFunctionsBlockStatementNode(blockStatementNode) {
    var body = blockStatementNode.body;
    // if there is more than a return statement in the body,
    // we cannot resolve the new object, we let the function display as a function
    if (body.length !== 1 || !bt.isReturnStatement(body[0])) {
        return null;
    }
    var ret = body[0];
    return ret.argument ? recast_1.print(ret.argument).code : null;
}
/**
 * Extract props information form an object-style VueJs component
 * @param documentation
 * @param path
 */
function propHandler(documentation, path) {
    if (bt.isObjectExpression(path.node)) {
        var propsPath = path
            .get('properties')
            .filter(function (p) { return bt.isObjectProperty(p.node) && getPropsFilter_1.default('props')(p); });
        // if no prop return
        if (!propsPath.length) {
            return Promise.resolve();
        }
        var modelPropertyName_1 = getModelPropName(path);
        var propsValuePath = propsPath[0].get('value');
        if (bt.isObjectExpression(propsValuePath.node)) {
            var objProp = propsValuePath.get('properties');
            // filter non object properties
            var objPropFiltered = objProp.filter(function (p) { return bt.isProperty(p.node); });
            objPropFiltered.forEach(function (prop) {
                var propNode = prop.node;
                // description
                var docBlock = getDocblock_1.default(prop);
                var jsDoc = docBlock ? getDoclets_1.default(docBlock) : { description: '', tags: [] };
                var jsDocTags = jsDoc.tags ? jsDoc.tags : [];
                // if it's the v-model describe it only as such
                var propertyName = bt.isIdentifier(propNode.key)
                    ? propNode.key.name
                    : bt.isStringLiteral(propNode.key)
                        ? propNode.key.value
                        : null;
                if (!propertyName) {
                    return;
                }
                var isPropertyModel = jsDocTags.some(function (t) { return t.title === 'model'; }) || propertyName === modelPropertyName_1;
                var propName = isPropertyModel ? 'v-model' : propertyName;
                var propDescriptor = documentation.getPropDescriptor(propName);
                var propValuePath = prop.get('value');
                if (jsDoc.description) {
                    propDescriptor.description = jsDoc.description;
                }
                if (jsDocTags.length) {
                    propDescriptor.tags = transformTagsIntoObject_1.default(jsDocTags);
                }
                extractValuesFromTags(propDescriptor);
                if (bt.isArrayExpression(propValuePath.node) || bt.isIdentifier(propValuePath.node)) {
                    // if it's an immediately typed property, resolve its type immediately
                    propDescriptor.type = getTypeFromTypePath(propValuePath);
                }
                else if (bt.isObjectExpression(propValuePath.node)) {
                    // standard default + type + required
                    var propPropertiesPath = propValuePath
                        .get('properties')
                        .filter(function (p) { return bt.isObjectProperty(p.node) || bt.isObjectMethod(p.node); });
                    // type
                    var litteralType = describeType(propPropertiesPath, propDescriptor);
                    // required
                    describeRequired(propPropertiesPath, propDescriptor);
                    // default
                    describeDefault(propPropertiesPath, propDescriptor, litteralType || '');
                    // validator => values
                    describeValues(propPropertiesPath, propDescriptor);
                }
                else if (bt.isTSAsExpression(propValuePath.node)) {
                    // standard default + type + required with TS as annotation
                    var propPropertiesPath = propValuePath
                        .get('expression', 'properties')
                        .filter(function (p) { return bt.isObjectProperty(p.node); });
                    // type and values
                    describeTypeAndValuesFromPath(propValuePath, propDescriptor);
                    // required
                    describeRequired(propPropertiesPath, propDescriptor);
                    // default
                    describeDefault(propPropertiesPath, propDescriptor, (propDescriptor.type && propDescriptor.type.name) || '');
                }
                else {
                    // in any other case, just display the code for the typing
                    propDescriptor.type = {
                        name: recast_1.print(prop.get('value')).code,
                        func: true
                    };
                }
            });
        }
        else if (bt.isArrayExpression(propsValuePath.node)) {
            propsValuePath
                .get('elements')
                .filter(function (e) { return bt.isStringLiteral(e.node); })
                .forEach(function (e) {
                var propDescriptor = documentation.getPropDescriptor(e.node.value);
                propDescriptor.type = { name: 'undefined' };
            });
        }
    }
    return Promise.resolve();
}
exports.default = propHandler;
/**
 * Deal with the description of the type
 * @param propPropertiesPath
 * @param propDescriptor
 * @returns the unaltered type member of the prop object
 */
function describeType(propPropertiesPath, propDescriptor) {
    var typeArray = propPropertiesPath.filter(getPropsFilter_1.default('type'));
    if (propDescriptor.tags && propDescriptor.tags.type) {
        var typeDesc = propDescriptor.tags.type[0].type;
        if (typeDesc) {
            var typedAST = getTemplateExpressionAST_1.default("const a:" + typeDesc.name);
            var typeValues_1;
            recast_1.visit(typedAST.program, {
                visitVariableDeclaration: function (path) {
                    var typeAnnotation = path.get('declarations', 0, 'id', 'typeAnnotation').value.typeAnnotation;
                    if (bt.isTSUnionType(typeAnnotation) &&
                        typeAnnotation.types.every(function (t) { return bt.isTSLiteralType(t); })) {
                        typeValues_1 = typeAnnotation.types.map(function (t) {
                            return t.literal.value.toString();
                        });
                    }
                    return false;
                }
            });
            if (typeValues_1) {
                propDescriptor.values = typeValues_1;
            }
            else {
                propDescriptor.type = typeDesc;
                return getTypeFromTypePath(typeArray[0].get('value')).name;
            }
        }
    }
    if (typeArray.length) {
        return describeTypeAndValuesFromPath(typeArray[0].get('value'), propDescriptor);
    }
    else {
        // deduce the type from default expression
        var defaultArray = propPropertiesPath.filter(getPropsFilter_1.default('default'));
        if (defaultArray.length) {
            var typeNode = defaultArray[0].node;
            if (bt.isObjectProperty(typeNode)) {
                var func = bt.isArrowFunctionExpression(typeNode.value) || bt.isFunctionExpression(typeNode.value);
                var typeValueNode = defaultArray[0].get('value').node;
                var typeName = typeof typeValueNode.value;
                propDescriptor.type = { name: func ? 'func' : typeName };
            }
        }
    }
    return undefined;
}
exports.describeType = describeType;
var VALID_VUE_TYPES = [
    'string',
    'number',
    'boolean',
    'array',
    'object',
    'date',
    'function',
    'symbol'
];
function resolveParenthesis(typeAnnotation) {
    var finalAnno = typeAnnotation;
    while (bt.isTSParenthesizedType(finalAnno)) {
        finalAnno = finalAnno.typeAnnotation;
    }
    return finalAnno;
}
function describeTypeAndValuesFromPath(propPropertiesPath, propDescriptor) {
    // values
    var values = getValuesFromTypePath(propPropertiesPath.node.typeAnnotation);
    // if it has an "as" annotation defining values
    if (values) {
        propDescriptor.values = values;
        propDescriptor.type = { name: 'string' };
    }
    else {
        // Get natural type from its identifier
        // (classic way)
        // type: Object
        propDescriptor.type = getTypeFromTypePath(propPropertiesPath);
    }
    return propDescriptor.type.name;
}
function getTypeFromTypePath(typePath) {
    var typeNode = typePath.node;
    var typeAnnotation = typeNode.typeAnnotation;
    var typeName = bt.isTSTypeReference(typeAnnotation) && typeAnnotation.typeParameters
        ? recast_1.print(resolveParenthesis(typeAnnotation.typeParameters.params[0])).code
        : bt.isArrayExpression(typeNode)
            ? typePath
                .get('elements')
                .map(function (t) { return getTypeFromTypePath(t).name; })
                .join('|')
            : typeNode &&
                bt.isIdentifier(typeNode) &&
                VALID_VUE_TYPES.indexOf(typeNode.name.toLowerCase()) > -1
                ? typeNode.name.toLowerCase()
                : recast_1.print(typeNode).code;
    return {
        name: typeName === 'function' ? 'func' : typeName
    };
}
/**
 * When a prop is type annotated with the "as" keyword,
 * It means that its possible values can be extracted from it
 * this extracts the values from the as
 * @param typeAnnotation the as annotation
 */
function getValuesFromTypePath(typeAnnotation) {
    if (bt.isTSTypeReference(typeAnnotation) && typeAnnotation.typeParameters) {
        var type = resolveParenthesis(typeAnnotation.typeParameters.params[0]);
        return getValuesFromTypeAnnotation(type);
    }
    return undefined;
}
function getValuesFromTypeAnnotation(type) {
    if (bt.isTSUnionType(type) && type.types.every(function (t) { return bt.isTSLiteralType(t); })) {
        return type.types.map(function (t) { return (bt.isTSLiteralType(t) ? t.literal.value.toString() : ''); });
    }
    return undefined;
}
exports.getValuesFromTypeAnnotation = getValuesFromTypeAnnotation;
function describeRequired(propPropertiesPath, propDescriptor) {
    var requiredArray = propPropertiesPath.filter(getPropsFilter_1.default('required'));
    var requiredNode = requiredArray.length ? requiredArray[0].get('value').node : undefined;
    var required = requiredNode && bt.isBooleanLiteral(requiredNode) ? requiredNode.value : undefined;
    if (required !== undefined) {
        propDescriptor.required = required;
    }
}
exports.describeRequired = describeRequired;
function describeDefault(propPropertiesPath, propDescriptor, propType) {
    var defaultArray = propPropertiesPath.filter(getPropsFilter_1.default('default'));
    if (defaultArray.length) {
        /**
         * This means the default value is formatted like so: `default: any`
         */
        var defaultValueIsProp = bt.isObjectProperty(defaultArray[0].value);
        /**
         * This means the default value is formatted like so: `default () { return {} }`
         */
        var defaultValueIsObjectMethod = bt.isObjectMethod(defaultArray[0].value);
        // objects and arrays should try to extract the body from functions
        if (propType === 'object' || propType === 'array') {
            if (defaultValueIsProp) {
                /* todo: add correct type info here ↓ */
                var defaultFunction = defaultArray[0].get('value');
                var isArrowFunction = bt.isArrowFunctionExpression(defaultFunction.node);
                var isOldSchoolFunction = bt.isFunctionExpression(defaultFunction.node);
                // if default is undefined or null, litterals are allowed
                if (bt.isNullLiteral(defaultFunction.node) ||
                    (bt.isIdentifier(defaultFunction.node) && defaultFunction.node.name === 'undefined')) {
                    propDescriptor.defaultValue = {
                        func: false,
                        value: recast_1.print(defaultFunction.node).code
                    };
                    return;
                }
                // check if the prop value is a function
                if (!isArrowFunction && !isOldSchoolFunction) {
                    throw new Error('A default value needs to be a function when your type is an object or array');
                }
                // retrieve the function "body" from the arrow function
                if (isArrowFunction) {
                    var arrowFunctionBody = defaultFunction.get('body');
                    // arrow function looks like `() => { return {} }`
                    if (bt.isBlockStatement(arrowFunctionBody.node)) {
                        var rawValueParsed_1 = getRawValueParsedFromFunctionsBlockStatementNode(arrowFunctionBody.node);
                        if (rawValueParsed_1) {
                            propDescriptor.defaultValue = {
                                func: false,
                                value: rawValueParsed_1
                            };
                            return;
                        }
                    }
                    if (bt.isArrayExpression(arrowFunctionBody.node) ||
                        bt.isObjectExpression(arrowFunctionBody.node)) {
                        propDescriptor.defaultValue = {
                            func: false,
                            value: recast_1.print(arrowFunctionBody.node).code
                        };
                        return;
                    }
                    // arrow function looks like `() => ({})`
                    propDescriptor.defaultValue = {
                        func: true,
                        value: recast_1.print(defaultFunction).code
                    };
                    return;
                }
            }
            // defaultValue was either an ObjectMethod or an oldSchoolFunction
            // in either case we need to retrieve the blockStatement and work with that
            /* todo: add correct type info here ↓ */
            var defaultBlockStatement = defaultValueIsObjectMethod
                ? defaultArray[0].get('body')
                : defaultArray[0].get('value').get('body');
            var defaultBlockStatementNode = defaultBlockStatement.node;
            var rawValueParsed = getRawValueParsedFromFunctionsBlockStatementNode(defaultBlockStatementNode);
            if (rawValueParsed) {
                propDescriptor.defaultValue = {
                    func: false,
                    value: rawValueParsed
                };
                return;
            }
        }
        // otherwise the rest should return whatever there is
        if (defaultValueIsProp) {
            // in this case, just return the rawValue
            var defaultPath = defaultArray[0].get('value');
            if (bt.isTSAsExpression(defaultPath.value)) {
                defaultPath = defaultPath.get('expression');
            }
            var rawValue = recast_1.print(defaultPath).code;
            propDescriptor.defaultValue = {
                func: bt.isFunction(defaultPath.node),
                value: rawValue
            };
            return;
        }
        if (defaultValueIsObjectMethod) {
            // in this case, just the function needs to be reconstructed a bit
            var defaultObjectMethod = defaultArray[0].get('value');
            var paramNodeArray = defaultObjectMethod.node.params;
            var params = paramNodeArray.map(function (p) { return p.name; }).join(', ');
            var defaultBlockStatement = defaultArray[0].get('body');
            var rawValue = recast_1.print(defaultBlockStatement).code;
            // the function should be reconstructed as "old-school" function, because they have the same handling of "this", whereas arrow functions do not.
            var rawValueParsed = "function(" + params + ") " + rawValue.trim();
            propDescriptor.defaultValue = {
                func: true,
                value: rawValueParsed
            };
            return;
        }
        throw new Error('Your default value was formatted incorrectly');
    }
}
exports.describeDefault = describeDefault;
function describeValues(propPropertiesPath, propDescriptor) {
    if (propDescriptor.values) {
        return;
    }
    var validatorArray = propPropertiesPath.filter(getPropsFilter_1.default('validator'));
    if (validatorArray.length) {
        var validatorNode = validatorArray[0].get('value').node;
        var values = parseValidator_1.default(validatorNode);
        if (values) {
            propDescriptor.values = values;
        }
    }
}
function extractValuesFromTags(propDescriptor) {
    var _a;
    if (propDescriptor.tags && propDescriptor.tags.values) {
        var values = propDescriptor.tags.values.map(function (tag) {
            var description = tag.description;
            var choices = typeof description === 'string' ? description.split(',') : undefined;
            if (choices) {
                return choices.map(function (v) { return v.trim(); });
            }
            return [];
        });
        propDescriptor.values = (_a = []).concat.apply(_a, values);
        delete propDescriptor.tags.values;
    }
}
exports.extractValuesFromTags = extractValuesFromTags;
/**
 * extract the property model.prop from the component object
 * @param path component NodePath
 * @returns name of the model prop, null if none
 */
function getModelPropName(path) {
    var modelPath = path
        .get('properties')
        .filter(function (p) { return bt.isObjectProperty(p.node) && getPropsFilter_1.default('model')(p); });
    if (!modelPath.length) {
        return null;
    }
    var modelPropertyNamePath = modelPath.length &&
        modelPath[0]
            .get('value')
            .get('properties')
            .filter(function (p) { return bt.isObjectProperty(p.node) && getPropsFilter_1.default('prop')(p); });
    if (!modelPropertyNamePath.length) {
        return null;
    }
    var valuePath = modelPropertyNamePath[0].get('value');
    return bt.isStringLiteral(valuePath.node) ? valuePath.node.value : null;
}
