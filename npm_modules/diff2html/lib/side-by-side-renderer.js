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
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSideBySideRendererConfig = void 0;
const Rematch = __importStar(require("./rematch"));
const renderUtils = __importStar(require("./render-utils"));
const types_1 = require("./types");
exports.defaultSideBySideRendererConfig = Object.assign(Object.assign({}, renderUtils.defaultRenderConfig), { renderNothingWhenEmpty: false, matchingMaxComparisons: 2500, maxLineSizeInBlockForComparison: 200 });
const genericTemplatesPath = 'generic';
const baseTemplatesPath = 'side-by-side';
const iconsBaseTemplatesPath = 'icon';
const tagsBaseTemplatesPath = 'tag';
class SideBySideRenderer {
    constructor(hoganUtils, config = {}) {
        this.hoganUtils = hoganUtils;
        this.config = Object.assign(Object.assign({}, exports.defaultSideBySideRendererConfig), config);
    }
    render(diffFiles) {
        const diffsHtml = diffFiles
            .map(file => {
            let diffs;
            if (file.blocks.length) {
                diffs = this.generateFileHtml(file);
            }
            else {
                diffs = this.generateEmptyDiff();
            }
            return this.makeFileDiffHtml(file, diffs);
        })
            .join('\n');
        return this.hoganUtils.render(genericTemplatesPath, 'wrapper', {
            colorScheme: renderUtils.colorSchemeToCss(this.config.colorScheme),
            content: diffsHtml,
        });
    }
    makeFileDiffHtml(file, diffs) {
        if (this.config.renderNothingWhenEmpty && Array.isArray(file.blocks) && file.blocks.length === 0)
            return '';
        const fileDiffTemplate = this.hoganUtils.template(baseTemplatesPath, 'file-diff');
        const filePathTemplate = this.hoganUtils.template(genericTemplatesPath, 'file-path');
        const fileIconTemplate = this.hoganUtils.template(iconsBaseTemplatesPath, 'file');
        const fileTagTemplate = this.hoganUtils.template(tagsBaseTemplatesPath, renderUtils.getFileIcon(file));
        return fileDiffTemplate.render({
            file: file,
            fileHtmlId: renderUtils.getHtmlId(file),
            diffs: diffs,
            filePath: filePathTemplate.render({
                fileDiffName: renderUtils.filenameDiff(file),
            }, {
                fileIcon: fileIconTemplate,
                fileTag: fileTagTemplate,
            }),
        });
    }
    generateEmptyDiff() {
        return {
            right: '',
            left: this.hoganUtils.render(genericTemplatesPath, 'empty-diff', {
                contentClass: 'd2h-code-side-line',
                CSSLineClass: renderUtils.CSSLineClass,
            }),
        };
    }
    generateFileHtml(file) {
        const matcher = Rematch.newMatcherFn(Rematch.newDistanceFn((e) => renderUtils.deconstructLine(e.content, file.isCombined).content));
        return file.blocks
            .map(block => {
            const fileHtml = {
                left: this.makeHeaderHtml(block.header, file),
                right: this.makeHeaderHtml(''),
            };
            this.applyLineGroupping(block).forEach(([contextLines, oldLines, newLines]) => {
                if (oldLines.length && newLines.length && !contextLines.length) {
                    this.applyRematchMatching(oldLines, newLines, matcher).map(([oldLines, newLines]) => {
                        const { left, right } = this.processChangedLines(file.isCombined, oldLines, newLines);
                        fileHtml.left += left;
                        fileHtml.right += right;
                    });
                }
                else if (contextLines.length) {
                    contextLines.forEach(line => {
                        const { prefix, content } = renderUtils.deconstructLine(line.content, file.isCombined);
                        const { left, right } = this.generateLineHtml({
                            type: renderUtils.CSSLineClass.CONTEXT,
                            prefix: prefix,
                            content: content,
                            number: line.oldNumber,
                        }, {
                            type: renderUtils.CSSLineClass.CONTEXT,
                            prefix: prefix,
                            content: content,
                            number: line.newNumber,
                        });
                        fileHtml.left += left;
                        fileHtml.right += right;
                    });
                }
                else if (oldLines.length || newLines.length) {
                    const { left, right } = this.processChangedLines(file.isCombined, oldLines, newLines);
                    fileHtml.left += left;
                    fileHtml.right += right;
                }
                else {
                    console.error('Unknown state reached while processing groups of lines', contextLines, oldLines, newLines);
                }
            });
            return fileHtml;
        })
            .reduce((accomulated, html) => {
            return { left: accomulated.left + html.left, right: accomulated.right + html.right };
        }, { left: '', right: '' });
    }
    applyLineGroupping(block) {
        const blockLinesGroups = [];
        let oldLines = [];
        let newLines = [];
        for (let i = 0; i < block.lines.length; i++) {
            const diffLine = block.lines[i];
            if ((diffLine.type !== types_1.LineType.INSERT && newLines.length) ||
                (diffLine.type === types_1.LineType.CONTEXT && oldLines.length > 0)) {
                blockLinesGroups.push([[], oldLines, newLines]);
                oldLines = [];
                newLines = [];
            }
            if (diffLine.type === types_1.LineType.CONTEXT) {
                blockLinesGroups.push([[diffLine], [], []]);
            }
            else if (diffLine.type === types_1.LineType.INSERT && oldLines.length === 0) {
                blockLinesGroups.push([[], [], [diffLine]]);
            }
            else if (diffLine.type === types_1.LineType.INSERT && oldLines.length > 0) {
                newLines.push(diffLine);
            }
            else if (diffLine.type === types_1.LineType.DELETE) {
                oldLines.push(diffLine);
            }
        }
        if (oldLines.length || newLines.length) {
            blockLinesGroups.push([[], oldLines, newLines]);
            oldLines = [];
            newLines = [];
        }
        return blockLinesGroups;
    }
    applyRematchMatching(oldLines, newLines, matcher) {
        const comparisons = oldLines.length * newLines.length;
        const maxLineSizeInBlock = Math.max.apply(null, [0].concat(oldLines.concat(newLines).map(elem => elem.content.length)));
        const doMatching = comparisons < this.config.matchingMaxComparisons &&
            maxLineSizeInBlock < this.config.maxLineSizeInBlockForComparison &&
            (this.config.matching === 'lines' || this.config.matching === 'words');
        return doMatching ? matcher(oldLines, newLines) : [[oldLines, newLines]];
    }
    makeHeaderHtml(blockHeader, file) {
        return this.hoganUtils.render(genericTemplatesPath, 'block-header', {
            CSSLineClass: renderUtils.CSSLineClass,
            blockHeader: (file === null || file === void 0 ? void 0 : file.isTooBig) ? blockHeader : renderUtils.escapeForHtml(blockHeader),
            lineClass: 'd2h-code-side-linenumber',
            contentClass: 'd2h-code-side-line',
        });
    }
    processChangedLines(isCombined, oldLines, newLines) {
        const fileHtml = {
            right: '',
            left: '',
        };
        const maxLinesNumber = Math.max(oldLines.length, newLines.length);
        for (let i = 0; i < maxLinesNumber; i++) {
            const oldLine = oldLines[i];
            const newLine = newLines[i];
            const diff = oldLine !== undefined && newLine !== undefined
                ? renderUtils.diffHighlight(oldLine.content, newLine.content, isCombined, this.config)
                : undefined;
            const preparedOldLine = oldLine !== undefined && oldLine.oldNumber !== undefined
                ? Object.assign(Object.assign({}, (diff !== undefined
                    ? {
                        prefix: diff.oldLine.prefix,
                        content: diff.oldLine.content,
                        type: renderUtils.CSSLineClass.DELETE_CHANGES,
                    }
                    : Object.assign(Object.assign({}, renderUtils.deconstructLine(oldLine.content, isCombined)), { type: renderUtils.toCSSClass(oldLine.type) }))), { number: oldLine.oldNumber }) : undefined;
            const preparedNewLine = newLine !== undefined && newLine.newNumber !== undefined
                ? Object.assign(Object.assign({}, (diff !== undefined
                    ? {
                        prefix: diff.newLine.prefix,
                        content: diff.newLine.content,
                        type: renderUtils.CSSLineClass.INSERT_CHANGES,
                    }
                    : Object.assign(Object.assign({}, renderUtils.deconstructLine(newLine.content, isCombined)), { type: renderUtils.toCSSClass(newLine.type) }))), { number: newLine.newNumber }) : undefined;
            const { left, right } = this.generateLineHtml(preparedOldLine, preparedNewLine);
            fileHtml.left += left;
            fileHtml.right += right;
        }
        return fileHtml;
    }
    generateLineHtml(oldLine, newLine) {
        return {
            left: this.generateSingleHtml(oldLine),
            right: this.generateSingleHtml(newLine),
        };
    }
    generateSingleHtml(line) {
        const lineClass = 'd2h-code-side-linenumber';
        const contentClass = 'd2h-code-side-line';
        return this.hoganUtils.render(genericTemplatesPath, 'line', {
            type: (line === null || line === void 0 ? void 0 : line.type) || `${renderUtils.CSSLineClass.CONTEXT} d2h-emptyplaceholder`,
            lineClass: line !== undefined ? lineClass : `${lineClass} d2h-code-side-emptyplaceholder`,
            contentClass: line !== undefined ? contentClass : `${contentClass} d2h-code-side-emptyplaceholder`,
            prefix: (line === null || line === void 0 ? void 0 : line.prefix) === ' ' ? '&nbsp;' : line === null || line === void 0 ? void 0 : line.prefix,
            content: line === null || line === void 0 ? void 0 : line.content,
            lineNumber: line === null || line === void 0 ? void 0 : line.number,
        });
    }
}
exports.default = SideBySideRenderer;
//# sourceMappingURL=side-by-side-renderer.js.map