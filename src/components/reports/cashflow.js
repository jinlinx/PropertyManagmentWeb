import React, {useState} from 'react';
const {Form, Row, Col} = require('react-bootstrap')

export default function CashFlow() {
    const houses = ['All', '1633 Highland', '1637 Highland', '1543 something'];
    const [houseChecked, setHouseChecked] = useState(houses.map(x => false));
    return <>
        <Form>
            <Row>
                <Col><Form.Control type="date" name="startDate" placeholder="Start" /></Col>
                <Col><Form.Control type="date" name="endDate" placeholder="Start" /></Col>

            </Row>
            <Row>
                <Col>
                    {
                        houses.map((house, who) => {
                            return <Form.Check
                                type='checkbox'
                                checked={houseChecked[who]}
                                onClick={e => {
                                    //console.log(e.target);
                                    houseChecked[who] = !houseChecked[who];
                                    console.log(house[who] + " " + who + " " + houseChecked[who]);
                                    setHouseChecked([...houseChecked]);
                                    if (who === 0) {
                                        setHouseChecked([...houseChecked.map(()=>houseChecked[0])])
                                    }
                                }}
                                id={`default-${house}`}
                                label={house}
                            />
                        })
                    }
                </Col>
            </Row>
        </Form>
    </>;
}