import { Node, BaseElementNode, DirectiveNode, SimpleExpressionNode, CompoundExpressionNode, InterpolationNode, CommentNode, AttributeNode } from '@vue/compiler-dom';
export declare function isCommentNode(node: any): node is CommentNode;
export declare function isBaseElementNode(node?: Node): node is BaseElementNode;
export declare function isDirectiveNode(prop?: Node): prop is DirectiveNode;
export declare function isAttributeNode(prop?: Node): prop is AttributeNode;
export declare function isSimpleExpressionNode(exp?: Node): exp is SimpleExpressionNode;
export declare function isCompoundExpressionNode(exp?: Node): exp is CompoundExpressionNode;
export declare function isInterpolationNode(exp?: Node): exp is InterpolationNode;
