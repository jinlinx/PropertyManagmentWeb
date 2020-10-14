import React,{useState,useEffect} from 'react';
import GenCrud from './GenCrud';
import { createHelper } from './datahelper';
import { getPageSorts, getPageFilters } from './util';

//props: table and displayFields [fieldNames]
function GenList(props) {
    const {table, columnInfo, loadMapper, pageState } = props;
    const [paggingInfo, setPaggingInfo] = useState({
        PageSize: 10,        
        pos: 0,
        total: 0,
    });
    const helper=createHelper(table);
    // [
    //     { field: 'tenantID', desc: 'Id', type: 'uuid', required: true, isId: true },
    //     { field: 'dadPhone', desc: 'Dad Phone', },
    // ];
    const [tenants,setTenants]=useState([]);
    const [loading,setLoading]=useState(true);
    const [columnInf,setColumnInf]=useState(columnInfo || []);
    const reload = () => {
        const whereArray = getPageFilters(pageState, table);
        const order = getPageSorts(pageState, table);
        helper.loadData(loadMapper, {
            whereArray,
            order,
            limit: paggingInfo.PageSize,
            offset: paggingInfo.pos,
        }).then(res => {
            const {rows, total} = res;
            setPaggingInfo({...paggingInfo, total,})
            setTenants(rows);
            setLoading(false);
        });
    }


    useEffect(() => {
        const ld=async () => {                        
            await helper.loadModel();
            setColumnInf(helper.getModelFields());
            if(columnInfo) {
                setColumnInf(columnInfo);
            }
            reload();
        }
        
        ld();        
    },[columnInfo, pageState.pageProps.reloadCount, paggingInfo.pos, paggingInfo.total]);

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

    const doDelete=( field, id ) => {
        setLoading(true);
        helper.deleteData(id).then(() => {
            reload();
        })
    }
    const displayFields=props.displayFields||helper.getModelFields().map(f => f.isId? null:f).filter(x => x);
    return <div>
        <p className='subHeader'>{props.title}</p>
        {
            (loading||!columnInf)? <p>Loading</p>:
                <div>
                    <GenCrud
                    paggingInfo={paggingInfo} setPaggingInfo={setPaggingInfo}
                    reload = {reload}
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