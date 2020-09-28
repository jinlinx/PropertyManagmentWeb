import React, {useState} from 'react';
import GenCrudAdd from './GenCrudAdd';

const GenCrud = (props) => {
    const {
        columnInfo,
        displayFields,
        rows,
    } = props;

    const [ dspState, setDspState ] = useState('dsp');
    const columnMap = columnInfo.reduce((acc, col) => {
        acc[col.field] = col;
        return acc;
    }, {});

    const addNew = () => {
        setDspState('addNew');
    }
    return (
        <div>
            {
                dspState === 'dsp' &&
                <div>
                    < table >
                        <thead>
                            <tr>
                                {
                                    displayFields.map(name => <th>{columnMap[name].desc}</th>)
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map(row => {
                                    return (
                                        <tr>
                                            {
                                                displayFields.map(fn => <td>{row[fn]}</td>)
                                            }
                                            <td>
                                                <button>Delete</button>
                                                <button>Edit</button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                    <tr>
                                        <td colSpan={displayFields.length + 1}>No Data found</td>
                                    </tr>
                                )
                            }
                        
                        </tbody>
                    </table>
                    <button onClick={addNew}>Add</button>
                </div>
            }

            {
                dspState === 'addNew' &&
                <GenCrudAdd {...props} onCancel={()=>setDspState('dsp')}></GenCrudAdd>
            }
        </div>
    )
}

export default GenCrud;