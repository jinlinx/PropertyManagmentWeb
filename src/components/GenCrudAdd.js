import React, {useState} from 'react';
import Select from 'react-dropdown-select';
import {createHelper} from './datahelper';
import get from 'lodash/get';
const GenCrudAdd = (props) => {

    const {columnInfo,doAdd,onCancel,
        editItem, //only available during edit
        onError,
        fieldFormatter,
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
                    if(!editItem) {
                        if(c.isId) return null;
                    }
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

                        let selected={};
                        const options=optsData[optKey];
                        if(options) {
                            selected=options.filter(o => o.value===get(data,c.field))[0]||{};
                        }
                        foreignSel=<Select options={options} searchBy={'name'}
                            values={[selected]}
                            onChange={(value) => {
                                console.log(value);
                                if(value[0]) {
                                    handleChange({
                                        target: {
                                            name: c.field,
                                            value: value[0].value,
                                        }
                                    })
                                }
                            }
                            }></Select>
                    }
                    return <div>
                        <label>{c.desc}</label>
                        {
                        foreignSel || <input className="u-full-width" type="text" value={fieldFormatter(data[c.field],c.field)} name={c.field} onChange={handleChange} />
                        
                        }
                        
                    </div>
                })
            }
            <button className="button-primary" type="submit" onClick={handleSubmit} >Add</button>
        </form>
    )
}

export default GenCrudAdd;