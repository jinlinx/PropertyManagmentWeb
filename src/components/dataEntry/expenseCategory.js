import React, {useEffect}  from 'react';
import GenList from '../GenList';

function ExpenseCategoryList(props) {
    useEffect(() => {
        const tableName = 'expenseCategories';
        const pageState = props?.pageState;
        pageState.setPageProps(state => ({
            ...state,
            [tableName]: {
                sorts: [
                    {
                        name: 'displayOrder',
                        op: 'asc',
                        shortDesc: 'AS',
                    }
                ]
            }
        }));
    }, []);
    const tableName = 'expenseCategories';
    const pageProps = props?.pageState?.pageProps[tableName];
    if (pageProps) {
        if (pageProps.sorts) {
            console.log(pageProps.sorts);
        }
    }
    console.log(props);
    return <GenList {...props} table={tableName} title={'Expense Category'} initialPageSize={100}/> 
}

export default ExpenseCategoryList;