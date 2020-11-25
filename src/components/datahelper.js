import { getModel, sqlGet, sqlAdd, sqlDelete } from './api';
import get from 'lodash/get';
import mod from './models';

export function createHelper(table) {
    const accModel=() => mod.models[table];
    const accModelFields=() => get(accModel(),'fields',[]);
    return {
        getModelFields: accModelFields,
        loadModel: async name => {
            if(!accModel()) {
                mod.models[table]=await getModel(table);
            }
            return accModel();
        },
        loadData: async (loadMapper, opts = {}) => {
            if (!loadMapper) loadMapper = (x,y) => y;
            //fields: array of field names
            const {whereArray, order, rowCount, offset} = opts;
            return sqlGet({table, fields: loadMapper('fields',accModelFields().map(f => f.field)), joins:loadMapper('joins'), whereArray, order, rowCount,offset});
        },
        saveData: async (data,id) => {
            const submitData=accModelFields().reduce((acc,f) => {
                acc[f.field]=data[f.field];
                return acc;
            },{});
            return sqlAdd(table,submitData,!id);
        },
        deleteData: async id => sqlDelete(table,id),
    }
}
