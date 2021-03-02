import { RenderContext } from './types';
export declare const COMPONENT = "STORYBOOK_COMPONENT";
export declare const VALUES = "STORYBOOK_VALUES";
export default function render({ storyFn, kind, name, args, showMain, showError, showException, forceRender, }: RenderContext): void;
