import moment from 'moment';
import get from 'lodash/get';


export function fmtDate(dateStr) {
    if(!dateStr) return '';
    if(dateStr.length<10) return dateStr;
    const momentDate=moment(dateStr);    
    if(momentDate.isValid()) return momentDate.format('YYYY-MM-DD');
    return dateStr;    
}

export function getPageSorts(pageState, table) {
    const { pageProps,
        //setPageProps
    } = pageState;
    return get(pageProps, [table, 'sorts'], []);
}


export function getPageFilters(pageState, table) {
    const { pageProps,
        //setPageProps
    } = pageState;
    return get(pageProps, [table, 'filters'], []);
}

export function getApiError(err) {
    return get(err, 'response.body.message') || err.message;
} 

export function nameToFirstLast(name) {
    const names = name.split(' ');
    const { firstName, lastName } = names.reduce((acc, n) => {
        const name = n.trim();
        if (name) {
            if (!acc.firstName)
                acc.firstName = name;
            else
                acc.lastName = name;
        }
        return acc;
    }, { firstName: '', lastName: '' });
    return { firstName, lastName };
}

const seperators = { ',': true, '\n': true };
export function parseCsv(str) {
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
