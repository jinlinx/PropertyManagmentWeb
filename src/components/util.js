import moment from 'moment';

export function fmtDate(dateStr) {
    if(!dateStr) return '';
    if(dateStr.length<10) return dateStr;
    const momentDate=moment(dateStr);    
    if(momentDate.isValid()) return momentDate.format('YYYY-MM-DD');
    return dateStr;    
}
