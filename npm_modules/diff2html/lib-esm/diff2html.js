import * as DiffParser from './diff-parser';
import { FileListRenderer } from './file-list-renderer';
import LineByLineRenderer, { defaultLineByLineRendererConfig } from './line-by-line-renderer';
import SideBySideRenderer, { defaultSideBySideRendererConfig } from './side-by-side-renderer';
import { OutputFormatType } from './types';
import HoganJsUtils from './hoganjs-utils';
export const defaultDiff2HtmlConfig = Object.assign(Object.assign(Object.assign({}, defaultLineByLineRendererConfig), defaultSideBySideRendererConfig), { outputFormat: OutputFormatType.LINE_BY_LINE, drawFileList: true });
export function parse(diffInput, configuration = {}) {
    return DiffParser.parse(diffInput, Object.assign(Object.assign({}, defaultDiff2HtmlConfig), configuration));
}
export function html(diffInput, configuration = {}) {
    const config = Object.assign(Object.assign({}, defaultDiff2HtmlConfig), configuration);
    const diffJson = typeof diffInput === 'string' ? DiffParser.parse(diffInput, config) : diffInput;
    const hoganUtils = new HoganJsUtils(config);
    const { colorScheme } = config;
    const fileListRendererConfig = { colorScheme };
    const fileList = config.drawFileList ? new FileListRenderer(hoganUtils, fileListRendererConfig).render(diffJson) : '';
    const diffOutput = config.outputFormat === 'side-by-side'
        ? new SideBySideRenderer(hoganUtils, config).render(diffJson)
        : new LineByLineRenderer(hoganUtils, config).render(diffJson);
    return fileList + diffOutput;
}
//# sourceMappingURL=diff2html.js.map