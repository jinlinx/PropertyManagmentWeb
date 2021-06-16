//import { get } from 'superagent';
//const urlBase = 'http://localhost:8081';
console.log(`test process.env.NODE_ENV ${process.env.REACT_APP_ENDPOINT_ENV}`)
const urlBase = process.env.REACT_APP_ENDPOINT_ENV !== 'dev' ? 'http://192.168.1.41' : 'http://localhost:8081';
const apiBase=`${urlBase}/pmapi`;
export const getUrl=path => `${apiBase}/${path}`;
const request = require('superagent');
const get = require('lodash/get');


function doGetOp(url) {
    return request.get(url).send().then(r => get(r, 'body'));
}
export function doPostOp(url, data) {
    return request.post(getUrl(url)).send(data).then(r => get(r, 'body'));
}
 
export async function getData(sql) {
    return doGetOp(getUrl(sql));
}

export async function getModel(name) {
    return doGetOp(`${apiBase}/getModel?name=${name}`);
}

export async function sqlGet({table, fields, joins, whereArray, groupByArray, order, rowCount, offset}) {
    // "table":"tenantInfo",
    // "field":["tenantID", "firstName"],
    // joins:[{ table:{col:als}}]
    // "order":[{"name":"tenantID", "asc": true}, {"name":"firstName"}]
    return doPostOp(`sql/get`, {
        table,
        fields,
        whereArray,
        groupByArray,
        joins,
        order,
        rowCount,
        offset,
    })
}

export async function sqlAdd(table, fields, create) {
//     "table":"tenantInfo",
//     "fields":{"tenantID":"289a8120-01fd-11eb-8993-ab1bf8206feb", "firstName":"gang", "lastName":"testlong"},
//    "create":true
    //return id
    return doPostOp(`sql/create`, {
        table,
        fields,
        create,
    })
}


export function sqlDelete(table, id) {
    return doPostOp(`sql/del`, {
        table,id,
    }) 
}

export function sqlGetTables() {
    return doGetOp(`sql/getTables`); 
}

export function sqlGetTableInfo(table) {
    return doGetOp(`sql/getTableInfo?table=${table}`); 
}

export function sqlFreeForm(sql, parms) {
    return doPostOp(`sql/freeFormSql`, {
        sql,
        parms,
    });
}

export function sendEmail({ from, to, subject, text }) {
    return doPostOp(`util/sendMail`, {
        from,
        to,
        subject,
        text,
    });
}

const statementSocket = {
    socket: null,
}
export const statementFuncs = {
    listener: null,
    askCodeListener: null,
}
export function getSocket() {
    return statementSocket.socket;
}

export function doStatementWS() {
    if (!statementSocket.socket) {
        const socket = require('socket.io-client')(urlBase, {
            transports: ['websocket'],
            path:'/pmapi/socket.io'
        });
        statementSocket.socket = socket;
        socket.on('connect', function () {
            console.log('connect')
        });
        socket.on('statementStatus', function (data) {
            if (statementFuncs.listener)
                statementFuncs.listener(data);
            console.log(data)
        });
        socket.on('askStatementCode', msg => {
            if (statementFuncs.askCodeListener) {
                statementFuncs.askCodeListener(msg);
            }
        });
        socket.on('ggFreeFormMsg', msg => {
            if (statementFuncs.freeFormMsgListener) {
                statementFuncs.freeFormMsgListener(msg);
            }
        })
        socket.on('disconnect', function () {
            console.log('disconnet')
        });
    }
}

export function updateGoogleSheet(name, id, data)
{
    return doPostOp(`misc/sheet/${name}/batch/${id}/norange`, data)
}

export function updateCashflowGSheet(data) {
    return updateGoogleSheet('gzprem', '1MO27odjCsxk6MWL0DygubU53hrtt3OB8SEnqjpUHJ-U', data);
}
/*
module.exports = {
    getData,
    getModel,
    sqlGet,
    sqlAdd,
    sqlDelete,
    sqlGetTables,
    sqlGetTableInfo,
    sqlFreeForm,
    sendEmail,
};
*/
