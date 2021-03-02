import * as bt from '@babel/types';
import { NodePath } from 'ast-types/lib/node-path';
import Documentation from '../Documentation';
/**
 * Extracts prop information from a class-style VueJs component
 * @param documentation
 * @param path
 */
export default function classPropHandler(documentation: Documentation, path: NodePath<bt.ClassDeclaration>): Promise<void>;
