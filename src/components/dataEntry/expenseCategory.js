import React  from 'react';
import GenList from '../GenList';

function ExpenseCategoryList(props) {   
    return <GenList {...props} table={'expenseCategories'} title={'Expense Category'}/> 
}

export default ExpenseCategoryList;