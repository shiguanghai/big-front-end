import * as bt from '@babel/types';
import { NodePath } from 'ast-types/lib/node-path';
import Documentation from './Documentation';
import { ParseOptions } from './parse';
export declare type Handler = (doc: Documentation, componentDefinition: NodePath, ast: bt.File, opt: ParseOptions) => Promise<void>;
export default function parseScript(source: string, preHandlers: Handler[], handlers: Handler[], options: ParseOptions, documentation?: Documentation, forceSingleExport?: boolean): Promise<Documentation[] | undefined>;
