import { closeTags, nodeStream, mergeStreams, getLanguage } from './highlight.js-helpers';
import { html, defaultDiff2HtmlConfig } from '../../diff2html';
export const defaultDiff2HtmlUIConfig = Object.assign(Object.assign({}, defaultDiff2HtmlConfig), { synchronisedScroll: true, highlight: true, fileListToggle: true, fileListStartVisible: false, highlightLanguages: new Map(), smartSelection: true, fileContentToggle: true, stickyFileHeaders: true });
export class Diff2HtmlUI {
    constructor(target, diffInput, config = {}, hljs) {
        this.hljs = null;
        this.currentSelectionColumnId = -1;
        this.config = Object.assign(Object.assign({}, defaultDiff2HtmlUIConfig), config);
        this.diffHtml = diffInput !== undefined ? html(diffInput, this.config) : target.innerHTML;
        this.targetElement = target;
        if (hljs !== undefined)
            this.hljs = hljs;
    }
    draw() {
        this.targetElement.innerHTML = this.diffHtml;
        if (this.config.synchronisedScroll)
            this.synchronisedScroll();
        if (this.config.highlight)
            this.highlightCode();
        if (this.config.fileListToggle)
            this.fileListToggle(this.config.fileListStartVisible);
        if (this.config.fileContentToggle)
            this.fileContentToggle();
        if (this.config.stickyFileHeaders)
            this.stickyFileHeaders();
    }
    synchronisedScroll() {
        this.targetElement.querySelectorAll('.d2h-file-wrapper').forEach(wrapper => {
            const [left, right] = Array().slice.call(wrapper.querySelectorAll('.d2h-file-side-diff'));
            if (left === undefined || right === undefined)
                return;
            const onScroll = (event) => {
                if (event === null || event.target === null)
                    return;
                if (event.target === left) {
                    right.scrollTop = left.scrollTop;
                    right.scrollLeft = left.scrollLeft;
                }
                else {
                    left.scrollTop = right.scrollTop;
                    left.scrollLeft = right.scrollLeft;
                }
            };
            left.addEventListener('scroll', onScroll);
            right.addEventListener('scroll', onScroll);
        });
    }
    fileListToggle(startVisible) {
        const showBtn = this.targetElement.querySelector('.d2h-show');
        const hideBtn = this.targetElement.querySelector('.d2h-hide');
        const fileList = this.targetElement.querySelector('.d2h-file-list');
        if (showBtn === null || hideBtn === null || fileList === null)
            return;
        const show = () => {
            showBtn.style.display = 'none';
            hideBtn.style.display = 'inline';
            fileList.style.display = 'block';
        };
        const hide = () => {
            showBtn.style.display = 'inline';
            hideBtn.style.display = 'none';
            fileList.style.display = 'none';
        };
        showBtn.addEventListener('click', () => show());
        hideBtn.addEventListener('click', () => hide());
        const hashTag = this.getHashTag();
        if (hashTag === 'files-summary-show')
            show();
        else if (hashTag === 'files-summary-hide')
            hide();
        else if (startVisible)
            show();
        else
            hide();
    }
    fileContentToggle() {
        this.targetElement.querySelectorAll('.d2h-file-collapse').forEach(fileContentToggleBtn => {
            fileContentToggleBtn.style.display = 'flex';
            const toggleFileContents = selector => {
                var _a;
                const fileContents = (_a = fileContentToggleBtn
                    .closest('.d2h-file-wrapper')) === null || _a === void 0 ? void 0 : _a.querySelector(selector);
                if (fileContents !== null && fileContents !== undefined) {
                    fileContentToggleBtn.classList.toggle('d2h-selected');
                    fileContents.classList.toggle('d2h-d-none');
                }
            };
            const toggleHandler = e => {
                if (fileContentToggleBtn === e.target)
                    return;
                toggleFileContents('.d2h-file-diff');
                toggleFileContents('.d2h-files-diff');
            };
            fileContentToggleBtn.addEventListener('click', e => toggleHandler(e));
        });
    }
    highlightCode() {
        const hljs = this.hljs;
        if (hljs === null) {
            throw new Error('Missing a `highlight.js` implementation. Please provide one when instantiating Diff2HtmlUI.');
        }
        const files = this.targetElement.querySelectorAll('.d2h-file-wrapper');
        files.forEach(file => {
            const language = file.getAttribute('data-lang');
            if (!(this.config.highlightLanguages instanceof Map)) {
                this.config.highlightLanguages = new Map(Object.entries(this.config.highlightLanguages));
            }
            let hljsLanguage = language && this.config.highlightLanguages.has(language)
                ?
                    this.config.highlightLanguages.get(language)
                : language
                    ? getLanguage(language)
                    : 'plaintext';
            if (hljs.getLanguage(hljsLanguage) === undefined) {
                hljsLanguage = 'plaintext';
            }
            const codeLines = file.querySelectorAll('.d2h-code-line-ctn');
            codeLines.forEach(line => {
                const text = line.textContent;
                const lineParent = line.parentNode;
                if (text === null || lineParent === null || !this.isElement(lineParent))
                    return;
                const result = closeTags(hljs.highlight(text, {
                    language: hljsLanguage,
                    ignoreIllegals: true,
                }));
                const originalStream = nodeStream(line);
                if (originalStream.length) {
                    const resultNode = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
                    resultNode.innerHTML = result.value;
                    result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
                }
                line.classList.add('hljs');
                if (result.language) {
                    line.classList.add(result.language);
                }
                line.innerHTML = result.value;
            });
        });
    }
    stickyFileHeaders() {
        this.targetElement.querySelectorAll('.d2h-file-header').forEach(header => {
            header.classList.add('d2h-sticky-header');
        });
    }
    smartSelection() {
        console.warn('Smart selection is now enabled by default with CSS. No need to call this method anymore.');
    }
    getHashTag() {
        const docUrl = document.URL;
        const hashTagIndex = docUrl.indexOf('#');
        let hashTag = null;
        if (hashTagIndex !== -1) {
            hashTag = docUrl.substr(hashTagIndex + 1);
        }
        return hashTag;
    }
    isElement(arg) {
        return arg !== null && (arg === null || arg === void 0 ? void 0 : arg.classList) !== undefined;
    }
}
//# sourceMappingURL=diff2html-ui-base.js.map