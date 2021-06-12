import { updateCashflowGSheet } from '../../api';
export function saveToGS(rows) {
    if (!rows) return;
    const endColumnIndex = rows[0].length;
    if (!endColumnIndex) return;
    const endRowIndex = rows.length;
    const data = {
        requests: [
            {
                updateCells: {
                    fields: '*',
                    range: {
                        sheetId: 0,
                        startColumnIndex: 0,
                        endColumnIndex,
                        startRowIndex: 0,
                        endRowIndex
                    },
                    rows: rows.reduce((acc, r, rowIdx) => {
                        const isSubTotal = r[0] && r[0].match(/Sub Total/i);
                        const isNetIncom = r[0] && r[0].match(/net income/i);
                        const isExpenseTitle = r[0] && r[0].match(/expense/i);
                        acc.arys.push({
                            values: r.map((stringValue, colPos) => {
                                const horizontalAlignment = colPos ? 'RIGHT' : 'LEFT';
                                const cell = {
                                    userEnteredValue: { stringValue }
                                };
                                if (!rowIdx || isSubTotal || isNetIncom || isExpenseTitle) {
                                    cell.userEnteredFormat = {
                                        backgroundColor: {
                                            blue: 100,
                                            green: 100,
                                            red: 100
                                        },
                                        horizontalAlignment,
                                        textFormat: {
                                            foregroundColor: {
                                                blue: 255,
                                                green: 255,
                                                red: 255,
                                            },                                            
                                            //fontFamily: string,
                                            //"fontSize": integer,
                                            bold: true,
                                            //"italic": boolean,
                                            //"strikethrough": boolean,
                                            //"underline": boolean,                                            
                                        },
                                        borders: {
                                            bottom: {
                                                style: 'SOLID',
                                                width: 3,
                                                color: {
                                                    blue: 0,
                                                    green: 255,
                                                    red: 0
                                                }
                                            }
                                        }
                                    };
                                } else {
                                    cell.userEnteredFormat = {                                        
                                        horizontalAlignment,
                                    }
                                }
                                return cell;
                            })
                        });
                        return acc;
                    }, {
                        state: {

                        },
                        arys:[],
                    }).arys,
                }
            }
        ]
    };
    return updateCashflowGSheet(data);
    /*
    rows: [
                        {
                            values: [
                                {
                                    "userEnteredFormat": {
                                        "backgroundColor": {
                                            "blue": 10,
                                            "green": 10,
                                            "red": 255
                                        },
                                        "borders": {
                                            "bottom": {
                                                "style": "SOLID",
                                                "width": 8,
                                                "color": {
                                                    "blue": 0,
                                                    "green": 255,
                                                    "red": 0
                                                }
                                            }
                                        }
                                    },
                                    "userEnteredValue": { "stringValue": "strstsdfasdf" }
                                },
                                {
                                    "userEnteredValue": { "stringValue": "col1" }
                                }
                            ]
                        }
                    ]
    */
}