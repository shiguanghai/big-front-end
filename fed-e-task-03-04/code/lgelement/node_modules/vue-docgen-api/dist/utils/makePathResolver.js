"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var resolveAliases_1 = __importDefault(require("../utils/resolveAliases"));
var resolvePathFrom_1 = __importDefault(require("../utils/resolvePathFrom"));
function makePathResolver(refDirName, aliases, modules) {
    return function (filePath, originalDirNameOverride) {
        return resolvePathFrom_1.default(resolveAliases_1.default(filePath, aliases || {}), __spreadArrays([
            originalDirNameOverride || refDirName
        ], (modules || [])));
    };
}
exports.default = makePathResolver;
