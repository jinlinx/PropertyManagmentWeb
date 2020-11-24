
const seperators = { ',': true, '\n': true };
function parseCsv(str) {
    const res = [];
    let inQuote = false;
    let cur = '';
    let curRes = [];
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (!inQuote) {
            if (seperators[c]) {
                curRes.push(cur.trim());
                cur = '';
                if (c === '\n') {
                    res.push(curRes);
                    curRes = [];
                }
                continue;
            }
            if (c === '"' || c === "'") {
                inQuote = c;
                continue;
            }
        } else {
            if (c === inQuote) {
                inQuote = false;
                continue;
            }
        }
        cur += c;
    }
    if (cur) {
        curRes.push(cur);
    }
    if (res.length && res[res.length - 1] !== curRes) {
        res.push(curRes);
    }
    return res;
}

module.exports = {
    parseCsv
}