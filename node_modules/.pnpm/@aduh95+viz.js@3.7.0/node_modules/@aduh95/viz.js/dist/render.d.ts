export type EMCCModuleOverrides = {
  locateFile?: () => string;
  [key: string]: any;
};

export type WebAssemblyModule = {
  vizRenderFromString: (src: string, format: string, engine: string) => string;
  vizSetY_invert: (invert: number) => void;
  vizCreateFile: (path: string, data: string) => void;
  vizSetNop: (nop: number) => void;
  vizLastErrorMessage: () => string;
  [key: string]: any;
};

/**
 * Resolves once runtime has been initialized and you can call wasm functions
 * @param Module An object to initialize Emscripten Module
 */
export default function (
  Module: EMCCModuleOverrides
): Promise<WebAssemblyModule>;
