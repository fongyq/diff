import * as jsDiff from 'diff';
import { unifyPath, hashCode } from './utils';
import * as rematch from './rematch';
import { ColorSchemeType, DiffStyleType, LineMatchingType, LineType, } from './types';
export const CSSLineClass = {
    INSERTS: 'd2h-ins',
    DELETES: 'd2h-del',
    CONTEXT: 'd2h-cntx',
    INFO: 'd2h-info',
    INSERT_CHANGES: 'd2h-ins d2h-change',
    DELETE_CHANGES: 'd2h-del d2h-change',
};
export const defaultRenderConfig = {
    matching: LineMatchingType.NONE,
    matchWordsThreshold: 0.25,
    maxLineLengthHighlight: 10000,
    diffStyle: DiffStyleType.WORD,
    colorScheme: ColorSchemeType.LIGHT,
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
export function toCSSClass(lineType) {
    switch (lineType) {
        case LineType.CONTEXT:
            return CSSLineClass.CONTEXT;
        case LineType.INSERT:
            return CSSLineClass.INSERTS;
        case LineType.DELETE:
            return CSSLineClass.DELETES;
    }
}
export function colorSchemeToCss(colorScheme) {
    switch (colorScheme) {
        case ColorSchemeType.DARK:
            return 'd2h-dark-color-scheme';
        case ColorSchemeType.AUTO:
            return 'd2h-auto-color-scheme';
        case ColorSchemeType.LIGHT:
        default:
            return 'd2h-light-color-scheme';
    }
}
function prefixLength(isCombined) {
    return isCombined ? 2 : 1;
}
export function escapeForHtml(str) {
    return str
        .slice(0)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
export function deconstructLine(line, isCombined, escape = true) {
    const indexToSplit = prefixLength(isCombined);
    return {
        prefix: line.substring(0, indexToSplit),
        content: escape ? escapeForHtml(line.substring(indexToSplit)) : line.substring(indexToSplit),
    };
}
export function filenameDiff(file) {
    const oldFilename = unifyPath(file.oldName);
    const newFilename = unifyPath(file.newName);
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
export function getHtmlId(file) {
    return `d2h-${hashCode(filenameDiff(file)).toString().slice(-6)}`;
}
export function getFileIcon(file) {
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
export function diffHighlight(diffLine1, diffLine2, isCombined, config = {}) {
    const { matching, maxLineLengthHighlight, matchWordsThreshold, diffStyle } = Object.assign(Object.assign({}, defaultRenderConfig), config);
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
//# sourceMappingURL=render-utils.js.map