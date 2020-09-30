//import { get } from 'superagent';

const apiBase = 'http://192.168.1.119:8081';
const getUrl = sql => `${apiBase}/doQuery?sql=${sql}`;
const request = require('superagent');
const get = require('lodash/get');


function doGetOp(url) {
    return request.get(url).send().then(r => get(r, 'body'));
}
function doPostOp(url, data) {
    return request.post(url).send(data).then(r => get(r, 'body'));
}
 async function getData(sql) {
    return doGetOp(getUrl(sql));
}

async function getModel(name) {
    return doGetOp(`${apiBase}/getModel?name=${name}`);
}

async function sqlGet(table, field, joins, order) {
    // "table":"tenantInfo",
    // "field":["tenantID", "firstName"],
    // joins:[{ table:{col:als}}]
    // "order":[{"name":"tenantID", "asc": true}, {"name":"firstName"}]
    return doPostOp(`${apiBase}/sql/get`, {
        table,
        field,
        joins,
        order,
    })
}

async function sqlAdd(table, fields, create) {
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


function sqlDelete(table, id) {
    return doPostOp(`${apiBase}/sql/del`, {
        table,id,
    }) 
}


module.exports = {
    getData,
    getModel,
    sqlGet,
    sqlAdd,
    sqlDelete,
}
