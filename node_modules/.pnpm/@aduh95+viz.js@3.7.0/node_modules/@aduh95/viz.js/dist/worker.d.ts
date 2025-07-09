/// <reference types="node" />
import type { Worker } from "worker_threads";
import type { EMCCModuleOverrides } from "./render";
declare let exports: (moduleOverrides?: EMCCModuleOverrides) => Promise<EMCCModuleOverrides> | Worker;
export declare function onmessage(event: MessageEvent): Promise<void>;
export default exports;
