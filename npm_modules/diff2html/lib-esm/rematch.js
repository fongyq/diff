export function levenshtein(a, b) {
    if (a.length === 0) {
        return b.length;
    }
    if (b.length === 0) {
        return a.length;
    }
    const matrix = [];
    let i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    let j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}
export function newDistanceFn(str) {
    return (x, y) => {
        const xValue = str(x).trim();
        const yValue = str(y).trim();
        const lev = levenshtein(xValue, yValue);
        return lev / (xValue.length + yValue.length);
    };
}
export function newMatcherFn(distance) {
    function findBestMatch(a, b, cache = new Map()) {
        let bestMatchDist = Infinity;
        let bestMatch;
        for (let i = 0; i < a.length; ++i) {
            for (let j = 0; j < b.length; ++j) {
                const cacheKey = JSON.stringify([a[i], b[j]]);
                let md;
                if (!(cache.has(cacheKey) && (md = cache.get(cacheKey)))) {
                    md = distance(a[i], b[j]);
                    cache.set(cacheKey, md);
                }
                if (md < bestMatchDist) {
                    bestMatchDist = md;
                    bestMatch = { indexA: i, indexB: j, score: bestMatchDist };
                }
            }
        }
        return bestMatch;
    }
    function group(a, b, level = 0, cache = new Map()) {
        const bm = findBestMatch(a, b, cache);
        if (!bm || a.length + b.length < 3) {
            return [[a, b]];
        }
        const a1 = a.slice(0, bm.indexA);
        const b1 = b.slice(0, bm.indexB);
        const aMatch = [a[bm.indexA]];
        const bMatch = [b[bm.indexB]];
        const tailA = bm.indexA + 1;
        const tailB = bm.indexB + 1;
        const a2 = a.slice(tailA);
        const b2 = b.slice(tailB);
        const group1 = group(a1, b1, level + 1, cache);
        const groupMatch = group(aMatch, bMatch, level + 1, cache);
        const group2 = group(a2, b2, level + 1, cache);
        let result = groupMatch;
        if (bm.indexA > 0 || bm.indexB > 0) {
            result = group1.concat(result);
        }
        if (a.length > tailA || b.length > tailB) {
            result = result.concat(group2);
        }
        return result;
    }
    return group;
}
//# sourceMappingURL=rematch.js.map