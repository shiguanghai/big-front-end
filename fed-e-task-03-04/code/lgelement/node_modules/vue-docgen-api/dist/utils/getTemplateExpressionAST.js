"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var babel_parser_1 = __importDefault(require("../babel-parser"));
var parser = babel_parser_1.default({ plugins: ['typescript'] });
function getTemplateExpressionAST(expression) {
    try {
        // this allows for weird expressions like {[t]:val} to be parsed properly
        return parser.parse(/^\{/.test(expression.trim()) ? "(() => (" + expression + "))()" : expression);
    }
    catch (e) {
        throw Error("Could not parse template expression:\n" + //
            (expression + "\n") + //
            ("Err: " + e.message));
    }
}
exports.default = getTemplateExpressionAST;
