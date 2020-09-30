import React, {useState} from 'react';
import { v1 } from 'uuid';
import Select from 'react-dropdown-select';
import {createHelper} from './datahelper';
const GenCrudAdd = (props) => {

    const {columnInfo,doAdd,onCancel,
        editItem, //only available during edit
        onError,
    }
        =props;
    let id='';
    const initData=columnInfo.reduce((acc,col) => {        
        acc[col.field]='';        
        if(editItem) {
            const val=editItem[col.field];
            acc[col.field]=val===0? 0:val||'';
            if(col.isId) {
                id=val;
            }
        }
        return acc;
    }, {});
    const requiredFields = columnInfo.filter(c => c.required && !c.isId).map(c=>c.field);

    const [data, setData] = useState(initData);
    const [optsData, setOptsData] = useState({});
    const handleChange = e => {
        const {name, value} = e.target;
        setData({...data, [name]: value});
    }

    const handleSubmit = e => {
        e.preventDefault();

        const missed = requiredFields.filter(r => !data[r]);
        if (missed.length === 0) {
           handleChange(e, doAdd(data,id));
        } else {
            onError({
                message: `missing required fields ${missed.length}`,
                missed,
            });
            return;
        }
        onCancel();
    }

    const optsDataReqSent = {

    }
    return (
        <form>
            {
                columnInfo.map(c => {
                    let foreignSel = null;
                    if (c.foreignKey) {
                        const optKey = c.foreignKey.table;
                        const lm = async () => {
                            if (!optsData[optKey] && !optsDataReqSent[optKey]) {
                                optsDataReqSent[optKey] = true;
                                const helper = createHelper(optKey);
                                await helper.loadModel();
                                const optData = await helper.loadData();
                                setOptsData({
                                    ...optsData,
                                    [optKey]: props.processForeignKey(c.foreignKey, optData)
                                });
                            }
                        }
                        lm();
                        
                        //{value:1,label:'opt1'},{value:2,label:'opt2'}

                        foreignSel = <Select options={optsData[optKey]}
                        values={['']}
                        onChange={(value) => console.log(value)}></Select>
                    }
                    return <div>
                        <label>{c.desc}</label>
                        {
                        foreignSel || <input className="u-full-width" type="text" value={data[c.field]} name={c.field} onChange={handleChange} />
                        
                        }
                        
                    </div>
                })
            }
            <button className="button-primary" type="submit" onClick={handleSubmit} >Add</button>
        </form>
    )
}

export default GenCrudAdd;