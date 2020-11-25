
import { sqlGetTableInfo } from '../api';
export function apiGetTableInfo(name) {
    return sqlGetTableInfo(name).then(res => {
        return ({
            constraints: res.constraints,
            fields: res.fields.map(f => {
                const r = f.fieldType.match(/([a-zA-Z]+)(\(([0-9]+){1,1}(,([0-9]+){1,1}){0,1}\)){0,1}/);
                return {
                    ...f, //fieldName
                    fieldType: r[1],
                    fieldSize: r[3],
                    fieldMinSize: r[5],
                };
            }),
            indexes: res.indexes, //[table, indexName, columnName]
        });
    });
}
