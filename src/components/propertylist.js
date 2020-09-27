import React, {useState, useEffect} from 'react';
import { getData } from './api';
function PropertyList() {

    const [properties, setProperty] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getData('select * from houseInfo').then(res => {
            setProperty(res);
            setLoading(false);
        });
    }, []);


    return <div>
       
        <table class='listTable'>
            <tr>
                <td class='subHeader' colSpan='5'>List of properties</td>

            </tr>
            <tr>
                <td class='listTblCell'>Address</td>
                <td class='listTblCell'>City</td>
                <td class='listTblCell'>State</td>
                <td class='listTblCell'>zip</td>
                <td class='listTblCell'></td>

            </tr>
            {
                    properties.map((properties, i) => {
                        return <tr id={i}>
                            <td class='listTblCell'>{properties.email }</td>
                            <td class='listTblCell'>{properties.userName}</td>
                            <td class='listTblCell'>{properties.phone}</td>
                            <td class='listTblCell'>{properties.Zipcode}</td>
                            <td class='listTblCell'></td>
                        </tr>;
                    })
            }

        </table>
    </div>
}

export default PropertyList;