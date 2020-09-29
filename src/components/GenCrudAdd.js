import React, {useState} from 'react';
import { v1 } from 'uuid';
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

    return (
        <form>
            {
                columnInfo.map(c => {
                    return <div>
                        <label>{c.desc}</label>
                        <input className="u-full-width" type="text" value={data[c.field]} name={c.field} onChange={handleChange} />
                    </div>
                })
            }
            <button className="button-primary" type="submit" onClick={handleSubmit} >Add</button>
        </form>
    )
}

export default GenCrudAdd;