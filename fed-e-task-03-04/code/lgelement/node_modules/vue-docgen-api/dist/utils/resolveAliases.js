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
var path = __importStar(require("path"));
function resolveAliases(filePath, aliases) {
    var aliasKeys = Object.keys(aliases);
    var i = aliasKeys.length;
    var aliasFound = false;
    if (!aliasKeys.length) {
        return filePath;
    }
    while (!aliasFound && i--) {
        var aliasValueWithSlash = aliasKeys[i] + '/';
        aliasFound = filePath.substring(0, aliasValueWithSlash.length) === aliasValueWithSlash;
    }
    if (!aliasFound) {
        return filePath;
    }
    return path.join(aliases[aliasKeys[i]], filePath.substring(aliasKeys[i].length + 1));
}
exports.default = resolveAliases;
