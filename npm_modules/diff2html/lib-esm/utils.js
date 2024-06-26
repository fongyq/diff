const specials = [
    '-',
    '[',
    ']',
    '/',
    '{',
    '}',
    '(',
    ')',
    '*',
    '+',
    '?',
    '.',
    '\\',
    '^',
    '$',
    '|',
];
const regex = RegExp('[' + specials.join('\\') + ']', 'g');
export function escapeForRegExp(str) {
    return str.replace(regex, '\\$&');
}
export function unifyPath(path) {
    return path ? path.replace(/\\/g, '/') : path;
}
export function hashCode(text) {
    let i, chr, len;
    let hash = 0;
    for (i = 0, len = text.length; i < len; i++) {
        chr = text.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
}
//# sourceMappingURL=utils.js.map