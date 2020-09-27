//import { get } from 'superagent';

const getUrl =  sql => `http://192.168.1.115:8081/doQuery?sql=${sql}`;
const request = require('superagent');
const get = require('lodash/get');


export async function getData(sql) {
    return request.get(getUrl(sql)).send().then(r => get(r, 'body'));
}
