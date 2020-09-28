import React, {useState} from 'react';
import { v1 } from 'uuid';
const GenCrudAdd = (props) => {

    const { columnInfo , doAdd, onCancel}
        = props;
    const initData = columnInfo.reduce((acc, col) => {
        acc[col.field] = '';
        if (col.type === 'uuid') {
            acc[col.field] = v1();
        }
        return acc;
    }, {});
    const requiredFields = columnInfo.filter(c => c.required).map(c=>c.field);

    const [data, setData] = useState(initData);

    const handleChange = e => {
        const {name, value} = e.target;
        setData({...data, [name]: value});
    }

    const handleSubmit = e => {
        e.preventDefault();

        const missed = requiredFields.filter(r => !data[r]);
        if (missed.length === 0) {
           handleChange(e, doAdd(data));
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