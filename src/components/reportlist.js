import React from 'react';
import { getData } from './api';

function ReportList() {
    return <div>
        <p class='subHeader'>List of properties</p> 
        <table class='listTable'>
            <tr>
                <td class='listTblCell'>Address</td>
                <td class='listTblCell'>City</td>
                <td class='listTblCell'>State</td>
                <td class='listTblCell'>zip</td>
                <td class='listTblCell'></td>

            </tr>


        </table>
    </div>
}

export default ReportList;