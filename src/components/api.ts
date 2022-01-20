//import { get } from 'superagent';
//const urlBase = 'http://localhost:8081';
console.log(`test process.env.NODE_ENV ${process.env.REACT_APP_ENDPOINT_ENV}`)
const urlBase = process.env.REACT_APP_ENDPOINT_ENV !== 'dev' ? 'http://192.168.1.41' : 'http://localhost:8081';
const apiBase=`${urlBase}/pmapi`;
export const getUrl= (path: string) => `${apiBase}/${path}`;
const request = require('superagent');
const get = require('lodash/get');

function addAuth(op: any) {
    const auth = sessionStorage.getItem('loginInfoSess');
    if (!auth) return op;
    const loginInfo = JSON.parse(auth);
    return op.auth(loginInfo.userName, loginInfo.password, { type: 'basic' });
}

function doGetOp(url: string) {
    const op = request.get(url);
    addAuth(op);
    return op.send().then((r:any) => get(r, 'body'));
}
export function doPostOp(url: string, data: any) {
    const op = request.post(getUrl(url));
    addAuth(op);
    return op.send(data).then((r:any) => get(r, 'body'));
}
 
export async function getData(sql: string) {
    return doGetOp(getUrl(sql));
}

export async function getModel(name:string) {
    return doGetOp(`${apiBase}/getModel?name=${name}`);
}

export type ISqlGetPrmFields = string[] | {
    op: 'min' | 'max';
    field: string;
    name: string;
}[];

export interface ISqlGetParams {
    table: String;
    fields?: ISqlGetPrmFields;
    joins?: [];
    whereArray?: {
        field: string,
        op: '=' | '>' | '<' | '>=' | '<=',
        val: string
    }[];
    groupByArray?: [];
    order?: string[];
    rowCount?: number;
    offset?: number;
}
export async function sqlGet(param: ISqlGetParams) {
    const { table, fields, joins, whereArray, groupByArray, order, rowCount, offset } = param;
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

export async function sqlAdd(table: string, fields: ISqlGetPrmFields, create: boolean) {
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


export function sqlDelete(table:string, id:string) {
    return doPostOp(`sql/del`, {
        table,id,
    }) 
}

export function sqlGetTables() {
    return doGetOp(`sql/getTables`); 
}

export function sqlGetTableInfo(table:string) {
    return doGetOp(`sql/getTableInfo?table=${table}`); 
}

export function sqlFreeForm(sql: string, parms?: any[]) {
    return doPostOp(`sql/freeFormSql`, {
        sql,
        parms,
    });
}

export interface ISendEmailFromToSubText {
    from: string;
    to: string;
    subject: string;
    text: string;
};
export function sendEmail(prm: ISendEmailFromToSubText) {
    const { from, to, subject, text } = prm;
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
    listener: (data: any) => { },
    askCodeListener: (data: any) => { },
    freeFormMsgListener: (msg:any) => { },
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
        socket.on('statementStatus', function (data: any) {
            if (statementFuncs.listener)
                statementFuncs.listener(data);
            console.log(data)
        });
        socket.on('askStatementCode', (msg:any) => {
            if (statementFuncs.askCodeListener) {
                statementFuncs.askCodeListener(msg);
            }
        });
        socket.on('ggFreeFormMsg', (msg:any) => {
            if (statementFuncs.freeFormMsgListener) {
                statementFuncs.freeFormMsgListener(msg);
            }
        })
        socket.on('disconnect', function () {
            console.log('disconnet')
        });
    }
}

export function updateGoogleSheet(name:string, id:string, data:object)
{
    return doPostOp(`misc/sheet/${name}/batch/${id}/norange`, data)
}

export function updateCashflowGSheet(data:object) {
    return updateGoogleSheet('gzprem', '1MO27odjCsxk6MWL0DygubU53hrtt3OB8SEnqjpUHJ-U', data);
}


export function getMinDatesForMaintenance(ownerID:string) {
    return sqlGet({
        table: 'maintenanceRecords',
        fields: [{
            op: 'min',
            field: 'date',
            name:'minDate'
        }],
        whereArray: [{
            field: 'ownerID',
            op: '=',
            val: ownerID || ''
        }],  
    })
}

export function getWorkerInfo() {    
    return sqlGet({
        table: 'workerInfo',
        fields: ['workerID', 'firstName', 'lastName', 'email',
            'phone', 'taxID','address','vdPosControl'],
    })
}

export function getExpenseCategories() {    
    return sqlGet({
        table: 'expenseCategories',
        fields: ['expenseCategoryID', 'expenseCategoryName', 'displayOrder',],        
    })
}

export function getAllMaintenanceData(ownerID:string, startDate:string, endDate:string) {
    /*
    'maintenanceID','date','month','description','amount','houseID',
    'expenseCategoryId','hours','workerID','comment','vdPosControl',
    */
    return sqlGet({
        table: 'maintenanceRecords',
        fields: ['maintenanceID', 'date', 'month', 'description', 'amount', 'houseID',
            'expenseCategoryId', 'hours', 'workerID', 'comment', 'vdPosControl',],
        whereArray: [{
            field: 'ownerID',
            op: '=',
            val: ownerID || ''
        },
            {
                field: 'date',
                op: '>=',
                val: startDate,
            },
            {
                field: 'date',
                op: '<',
                val: endDate,
            }
        ],
    })
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
