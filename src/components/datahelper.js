import { getModel, sqlGet, sqlAdd, sqlDelete } from './api';
import get from 'lodash/get';
import mod from './models';

export function createHelper(table) {
    if (!table) return null;
    const accModel=() => mod.models[table];
    const accModelFields=() => get(accModel(),'fields',[]);
    return {
        getModelFields: accModelFields,
        loadModel: async () => {
            if(!accModel()) {
                mod.models[table]=await getModel(table);
            }
            return accModel();
        },
        loadData: async (loadMapper, opts = {}) => {
            if (!loadMapper) loadMapper = (x,y) => y;
            //fields: array of field names
            const {whereArray, order, rowCount, offset} = opts;
            const modFields = accModelFields().map(f => f.field);
            const viewFields = get(accModel(),'view.fields',[]).map(f=>f.name || f.field);
            return sqlGet({table, fields: loadMapper('fields',modFields.concat(viewFields)), joins:loadMapper('joins'), whereArray, order, rowCount,offset});
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

export async function createAndLoadHelper(table) {
    const helper = createHelper(table);
    await helper.loadModel();
    return helper;
}
