import HoganJsUtils from './hoganjs-utils';
import * as Rematch from './rematch';
import * as renderUtils from './render-utils';
import { DiffLine, DiffFile, DiffBlock, DiffLineContext, DiffLineDeleted, DiffLineInserted, DiffLineContent } from './types';
export interface SideBySideRendererConfig extends renderUtils.RenderConfig {
    renderNothingWhenEmpty?: boolean;
    matchingMaxComparisons?: number;
    maxLineSizeInBlockForComparison?: number;
}
export declare const defaultSideBySideRendererConfig: {
    renderNothingWhenEmpty: boolean;
    matchingMaxComparisons: number;
    maxLineSizeInBlockForComparison: number;
    matching: import("./types").LineMatchingType;
    matchWordsThreshold: number;
    maxLineLengthHighlight: number;
    diffStyle: import("./types").DiffStyleType;
    colorScheme: import("./types").ColorSchemeType;
};
export default class SideBySideRenderer {
    private readonly hoganUtils;
    private readonly config;
    constructor(hoganUtils: HoganJsUtils, config?: SideBySideRendererConfig);
    render(diffFiles: DiffFile[]): string;
    makeFileDiffHtml(file: DiffFile, diffs: FileHtml): string;
    generateEmptyDiff(): FileHtml;
    generateFileHtml(file: DiffFile): FileHtml;
    applyLineGroupping(block: DiffBlock): DiffLineGroups;
    applyRematchMatching(oldLines: DiffLine[], newLines: DiffLine[], matcher: Rematch.MatcherFn<DiffLine>): DiffLine[][][];
    makeHeaderHtml(blockHeader: string, file?: DiffFile): string;
    processChangedLines(isCombined: boolean, oldLines: DiffLine[], newLines: DiffLine[]): FileHtml;
    generateLineHtml(oldLine?: DiffPreparedLine, newLine?: DiffPreparedLine): FileHtml;
    generateSingleHtml(line?: DiffPreparedLine): string;
}
type DiffLineGroups = [
    (DiffLineContext & DiffLineContent)[],
    (DiffLineDeleted & DiffLineContent)[],
    (DiffLineInserted & DiffLineContent)[]
][];
type DiffPreparedLine = {
    type: renderUtils.CSSLineClass;
    prefix: string;
    content: string;
    number: number;
};
type FileHtml = {
    left: string;
    right: string;
};
export {};
//# sourceMappingURL=side-by-side-renderer.d.ts.map