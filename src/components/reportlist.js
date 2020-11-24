import React from 'react';

function ReportList() {
    return <div>
        <p className='subHeader'>List of properties</p> 
        <table className='listTable'>
            <tbody>
            <tr>
                <td className='listTblCell'>Address</td>
                <td className='listTblCell'>City</td>
                <td className='listTblCell'>State</td>
                <td className='listTblCell'>zip</td>
                <td className='listTblCell'></td>

            </tr>
            </tbody>

        </table>
    </div>
}

export default ReportList;