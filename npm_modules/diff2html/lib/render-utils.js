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
exports.diffHighlight = exports.getFileIcon = exports.getHtmlId = exports.filenameDiff = exports.deconstructLine = exports.escapeForHtml = exports.colorSchemeToCss = exports.toCSSClass = exports.defaultRenderConfig = exports.CSSLineClass = void 0;
const jsDiff = __importStar(require("diff"));
const utils_1 = require("./utils");
const rematch = __importStar(require("./rematch"));
const types_1 = require("./types");
exports.CSSLineClass = {
    INSERTS: 'd2h-ins',
    DELETES: 'd2h-del',
    CONTEXT: 'd2h-cntx',
    INFO: 'd2h-info',
    INSERT_CHANGES: 'd2h-ins d2h-change',
    DELETE_CHANGES: 'd2h-del d2h-change',
};
exports.defaultRenderConfig = {
    matching: types_1.LineMatchingType.NONE,
    matchWordsThreshold: 0.25,
    maxLineLengthHighlight: 10000,
    diffStyle: types_1.DiffStyleType.WORD,
    colorScheme: types_1.ColorSchemeType.LIGHT,
};
const separator = '/';
const distance = rematch.newDistanceFn((change) => change.value);
const matcher = rematch.newMatcherFn(distance);
function isDevNullName(name) {
    return name.indexOf('dev/null') !== -1;
}
function removeInsElements(line) {
    return line.replace(/(<ins[^>]*>((.|\n)*?)<\/ins>)/g, '');
}
function removeDelElements(line) {
    return line.replace(/(<del[^>]*>((.|\n)*?)<\/del>)/g, '');
}
function toCSSClass(lineType) {
    switch (lineType) {
        case types_1.LineType.CONTEXT:
            return exports.CSSLineClass.CONTEXT;
        case types_1.LineType.INSERT:
            return exports.CSSLineClass.INSERTS;
        case types_1.LineType.DELETE:
            return exports.CSSLineClass.DELETES;
    }
}
exports.toCSSClass = toCSSClass;
function colorSchemeToCss(colorScheme) {
    switch (colorScheme) {
        case types_1.ColorSchemeType.DARK:
            return 'd2h-dark-color-scheme';
        case types_1.ColorSchemeType.AUTO:
            return 'd2h-auto-color-scheme';
        case types_1.ColorSchemeType.LIGHT:
        default:
            return 'd2h-light-color-scheme';
    }
}
exports.colorSchemeToCss = colorSchemeToCss;
function prefixLength(isCombined) {
    return isCombined ? 2 : 1;
}
function escapeForHtml(str) {
    return str
        .slice(0)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
exports.escapeForHtml = escapeForHtml;
function deconstructLine(line, isCombined, escape = true) {
    const indexToSplit = prefixLength(isCombined);
    return {
        prefix: line.substring(0, indexToSplit),
        content: escape ? escapeForHtml(line.substring(indexToSplit)) : line.substring(indexToSplit),
    };
}
exports.deconstructLine = deconstructLine;
function filenameDiff(file) {
    const oldFilename = (0, utils_1.unifyPath)(file.oldName);
    const newFilename = (0, utils_1.unifyPath)(file.newName);
    if (oldFilename !== newFilename && !isDevNullName(oldFilename) && !isDevNullName(newFilename)) {
        const prefixPaths = [];
        const suffixPaths = [];
        const oldFilenameParts = oldFilename.split(separator);
        const newFilenameParts = newFilename.split(separator);
        const oldFilenamePartsSize = oldFilenameParts.length;
        const newFilenamePartsSize = newFilenameParts.length;
        let i = 0;
        let j = oldFilenamePartsSize - 1;
        let k = newFilenamePartsSize - 1;
        while (i < j && i < k) {
            if (oldFilenameParts[i] === newFilenameParts[i]) {
                prefixPaths.push(newFilenameParts[i]);
                i += 1;
            }
            else {
                break;
            }
        }
        while (j > i && k > i) {
            if (oldFilenameParts[j] === newFilenameParts[k]) {
                suffixPaths.unshift(newFilenameParts[k]);
                j -= 1;
                k -= 1;
            }
            else {
                break;
            }
        }
        const finalPrefix = prefixPaths.join(separator);
        const finalSuffix = suffixPaths.join(separator);
        const oldRemainingPath = oldFilenameParts.slice(i, j + 1).join(separator);
        const newRemainingPath = newFilenameParts.slice(i, k + 1).join(separator);
        if (finalPrefix.length && finalSuffix.length) {
            return (finalPrefix + separator + '{' + oldRemainingPath + ' → ' + newRemainingPath + '}' + separator + finalSuffix);
        }
        else if (finalPrefix.length) {
            return finalPrefix + separator + '{' + oldRemainingPath + ' → ' + newRemainingPath + '}';
        }
        else if (finalSuffix.length) {
            return '{' + oldRemainingPath + ' → ' + newRemainingPath + '}' + separator + finalSuffix;
        }
        return oldFilename + ' → ' + newFilename;
    }
    else if (!isDevNullName(newFilename)) {
        return newFilename;
    }
    else {
        return oldFilename;
    }
}
exports.filenameDiff = filenameDiff;
function getHtmlId(file) {
    return `d2h-${(0, utils_1.hashCode)(filenameDiff(file)).toString().slice(-6)}`;
}
exports.getHtmlId = getHtmlId;
function getFileIcon(file) {
    let templateName = 'file-changed';
    if (file.isRename) {
        templateName = 'file-renamed';
    }
    else if (file.isCopy) {
        templateName = 'file-renamed';
    }
    else if (file.isNew) {
        templateName = 'file-added';
    }
    else if (file.isDeleted) {
        templateName = 'file-deleted';
    }
    else if (file.newName !== file.oldName) {
        templateName = 'file-renamed';
    }
    return templateName;
}
exports.getFileIcon = getFileIcon;
function diffHighlight(diffLine1, diffLine2, isCombined, config = {}) {
    const { matching, maxLineLengthHighlight, matchWordsThreshold, diffStyle } = Object.assign(Object.assign({}, exports.defaultRenderConfig), config);
    const line1 = deconstructLine(diffLine1, isCombined, false);
    const line2 = deconstructLine(diffLine2, isCombined, false);
    if (line1.content.length > maxLineLengthHighlight || line2.content.length > maxLineLengthHighlight) {
        return {
            oldLine: {
                prefix: line1.prefix,
                content: escapeForHtml(line1.content),
            },
            newLine: {
                prefix: line2.prefix,
                content: escapeForHtml(line2.content),
            },
        };
    }
    const diff = diffStyle === 'char'
        ? jsDiff.diffChars(line1.content, line2.content)
        : jsDiff.diffWordsWithSpace(line1.content, line2.content);
    const changedWords = [];
    if (diffStyle === 'word' && matching === 'words') {
        const removed = diff.filter(element => element.removed);
        const added = diff.filter(element => element.added);
        const chunks = matcher(added, removed);
        chunks.forEach(chunk => {
            if (chunk[0].length === 1 && chunk[1].length === 1) {
                const dist = distance(chunk[0][0], chunk[1][0]);
                if (dist < matchWordsThreshold) {
                    changedWords.push(chunk[0][0]);
                    changedWords.push(chunk[1][0]);
                }
            }
        });
    }
    const highlightedLine = diff.reduce((highlightedLine, part) => {
        const elemType = part.added ? 'ins' : part.removed ? 'del' : null;
        const addClass = changedWords.indexOf(part) > -1 ? ' class="d2h-change"' : '';
        const escapedValue = escapeForHtml(part.value);
        return elemType !== null
            ? `${highlightedLine}<${elemType}${addClass}>${escapedValue}</${elemType}>`
            : `${highlightedLine}${escapedValue}`;
    }, '');
    return {
        oldLine: {
            prefix: line1.prefix,
            content: removeInsElements(highlightedLine),
        },
        newLine: {
            prefix: line2.prefix,
            content: removeDelElements(highlightedLine),
        },
    };
}
exports.diffHighlight = diffHighlight;
//# sourceMappingURL=render-utils.js.map