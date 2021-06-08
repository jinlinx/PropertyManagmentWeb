
import React, {useState, useEffect} from 'react';
import EditDropdown from '../paymentMatch/EditDropdown';
import { Container, Row, Col} from 'react-bootstrap';

export function MonthRange(props) {
    const jjctx = props.jjctx;
    const {
        //paymentsByMonth, expenseData, calculateExpenseByDate, calculateIncomeByDate,
        allMonthes,
        allHouses,
        //monthes, setMonthes,
        curMonthSelection, setCurMonthSelection,
        selectedMonths, setSelectedMonths,
        selectedHouses, setSelectedHouses,
    } = jjctx;

    const [showDetails, setShowDetails] = useState(false);
    useEffect(() => {
        setCurMonthSelection({
            value: 'All',
            label:'All'
       }) 
    },[]);
    return <>
        <div>
        <EditDropdown context={{
            disabled: false,
            curSelection:curMonthSelection, setCurSelection:setCurMonthSelection, getCurSelectionText: x=>x.label || '',
            options: ['All','LastMonth', 'Last3Month', 'Y2D', 'LastYear'].map(value => ({
                value,
                    label:value,
            })), setOptions: () => { },
            loadOptions: ()=>null,
            }}></EditDropdown>

            <input type='checkbox' checked={showDetails} onChange={() => {
                setShowDetails(!showDetails);
            }}></input> Show Details
        </div>
        <div>
            {
                showDetails && <Container>
                    <Row>
                        <Col>
                            {
                                allMonthes.map((m, key) => {
                                    return <div key={key}><input type='checkbox' checked={!!selectedMonths[m]} onChange={() => {
                                        selectedMonths[m] = !selectedMonths[m];
                                        setSelectedMonths({ ...selectedMonths });
                                    }}></input>{m}</div>
                                })
                            }
                            </Col>
                        <Col>
                            {
                                allHouses.map((m, key) => {
                                    return <div key={key}><input type='checkbox' checked={!!selectedHouses[m.houseID]} onChange={() => {
                                        selectedHouses[m.houseID] = !selectedHouses[m.houseID];
                                        setSelectedHouses({ ...selectedHouses });
                                    }}></input>{m.address}</div>
                                })
                            }
                        </Col>
                        </Row>
                    </Container>
            }
        </div>
    </>
}