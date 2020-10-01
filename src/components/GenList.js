import React,{useState,useEffect} from 'react';
import GenCrud from './GenCrud';
import {createHelper} from './datahelper';

//props: table and displayFields [fieldNames]
function GenList(props) {
    const helper=createHelper(props.table);
    // [
    //     { field: 'tenantID', desc: 'Id', type: 'uuid', required: true, isId: true },
    //     { field: 'dadPhone', desc: 'Dad Phone', },
    // ];
    const [tenants,setTenants]=useState([]);
    const [loading,setLoading]=useState(true);
    const [columnInf,setColumnInf]=useState(props.columnInfo || []);
    const reload=() => {
        helper.loadData(props.loadMapper).then(res => {
            setTenants(res);
            setLoading(false);
        });
    }


    useEffect(() => {
        const ld=async () => {                        
            await helper.loadModel();
            setColumnInf(helper.getModelFields());
            if(props.columnInfo) {
                setColumnInf(props.columnInfo);
            }
            reload();
        }
        
        ld();        
    },[]);

    const doAdd=(data,id) => {        
        helper.saveData(data,id).then(() => {
            setLoading(true);
            console.log('reloading');
            reload();
        }).catch(err => {
            setLoading(false);
            console.log(err);
        });
    }

    const doDelete=id => {
        setLoading(true);
        helper.deleteData(id).then(() => {
            reload();
        })
    }
    const displayFields=props.displayFields||helper.getModelFields().map(f => f.isId? null:f).filter(x => x);
    return <div>
        <p class='subHeader'>{props.title}</p>
        {
            (loading||!columnInf)? <p>Loading</p>:
                <div>
                    <GenCrud
                        {...props}
                        displayFields={displayFields}
                        columnInfo={
                            columnInf
                        }
                        doAdd={doAdd}
                        doDelete={doDelete}
                        rows={tenants}
                    ></GenCrud>
                </div>
        }
    </div>
}

export default GenList;