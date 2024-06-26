"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.html = exports.parse = exports.defaultDiff2HtmlConfig = void 0;
const DiffParser = __importStar(require("./diff-parser"));
const file_list_renderer_1 = require("./file-list-renderer");
const line_by_line_renderer_1 = __importStar(require("./line-by-line-renderer"));
const side_by_side_renderer_1 = __importStar(require("./side-by-side-renderer"));
const types_1 = require("./types");
const hoganjs_utils_1 = __importDefault(require("./hoganjs-utils"));
exports.defaultDiff2HtmlConfig = Object.assign(Object.assign(Object.assign({}, line_by_line_renderer_1.defaultLineByLineRendererConfig), side_by_side_renderer_1.defaultSideBySideRendererConfig), { outputFormat: types_1.OutputFormatType.LINE_BY_LINE, drawFileList: true });
function parse(diffInput, configuration = {}) {
    return DiffParser.parse(diffInput, Object.assign(Object.assign({}, exports.defaultDiff2HtmlConfig), configuration));
}
exports.parse = parse;
function html(diffInput, configuration = {}) {
    const config = Object.assign(Object.assign({}, exports.defaultDiff2HtmlConfig), configuration);
    const diffJson = typeof diffInput === 'string' ? DiffParser.parse(diffInput, config) : diffInput;
    const hoganUtils = new hoganjs_utils_1.default(config);
    const { colorScheme } = config;
    const fileListRendererConfig = { colorScheme };
    const fileList = config.drawFileList ? new file_list_renderer_1.FileListRenderer(hoganUtils, fileListRendererConfig).render(diffJson) : '';
    const diffOutput = config.outputFormat === 'side-by-side'
        ? new side_by_side_renderer_1.default(hoganUtils, config).render(diffJson)
        : new line_by_line_renderer_1.default(hoganUtils, config).render(diffJson);
    return fileList + diffOutput;
}
exports.html = html;
//# sourceMappingURL=diff2html.js.map