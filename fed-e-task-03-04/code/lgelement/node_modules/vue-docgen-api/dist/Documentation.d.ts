import { Descriptor, PropDescriptor, MethodDescriptor, SlotDescriptor, EventDescriptor, ComponentDoc, DocBlockTags, BlockTag, Param, UnnamedParam, Tag, ParamTag, ParamType } from 'vue-inbrowser-compiler-utils';
export { Descriptor, PropDescriptor, MethodDescriptor, SlotDescriptor, EventDescriptor, ComponentDoc, DocBlockTags, BlockTag, Param, UnnamedParam, Tag, ParamTag, ParamType };
export default class Documentation {
    private propsMap;
    private methodsMap;
    private slotsMap;
    private eventsMap;
    private dataMap;
    private docsBlocks;
    private originExtendsMixin;
    readonly componentFullfilePath: string;
    constructor(fullFilePath: string);
    setOrigin(origin: Descriptor): void;
    setDocsBlocks(docsBlocks: string[]): void;
    set(key: string, value: any): void;
    get(key: string): any;
    getPropDescriptor(propName: string): PropDescriptor;
    getMethodDescriptor(methodName: string): MethodDescriptor;
    getEventDescriptor(eventName: string): EventDescriptor;
    getSlotDescriptor(slotName: string): SlotDescriptor;
    toObject(): ComponentDoc;
    private getDescriptor;
    private getObjectFromDescriptor;
}
