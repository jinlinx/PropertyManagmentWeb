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