//import { get } from 'superagent';
//const urlBase = 'http://localhost:8081';
const urlBase = 'http://192.168.1.41';
const apiBase=`${urlBase}/pmapi`;
const getUrl=path => `${apiBase}/${path}`;
const request = require('superagent');
const get = require('lodash/get');


function doGetOp(url) {
    return request.get(url).send().then(r => get(r, 'body'));
}
function doPostOp(url, data) {
    return request.post(url).send(data).then(r => get(r, 'body'));
}
 
export async function getData(sql) {
    return doGetOp(getUrl(sql));
}

export async function getModel(name) {
    return doGetOp(`${apiBase}/getModel?name=${name}`);
}

export async function sqlGet({table, field, joins, whereArray, groupByArray, order, rowCount, offset}) {
    // "table":"tenantInfo",
    // "field":["tenantID", "firstName"],
    // joins:[{ table:{col:als}}]
    // "order":[{"name":"tenantID", "asc": true}, {"name":"firstName"}]
    return doPostOp(`${apiBase}/sql/get`, {
        table,
        field,
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
    return doPostOp(`${apiBase}/sql/create`, {
        table,
        fields,
        create,
    })
}


export function sqlDelete(table, id) {
    return doPostOp(`${apiBase}/sql/del`, {
        table,id,
    }) 
}

export function sqlGetTables() {
    return doGetOp(`${apiBase}/sql/getTables`); 
}

export function sqlGetTableInfo(table) {
    return doGetOp(`${apiBase}/sql/getTableInfo?table=${table}`); 
}

export function sqlFreeForm(sql, parms) {
    return doPostOp(`${apiBase}/sql/freeFormSql`, {
        sql,
        parms,
    });
}

export function sendEmail({ from, to, subject, text }) {
    return doPostOp(`${apiBase}/util/sendMail`, {
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
