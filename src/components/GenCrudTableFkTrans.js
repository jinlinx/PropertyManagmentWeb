export function fkDefs() {
    return {        
        houseInfo: {
            processForeignKey: (fk, datas) => {
                return datas.map(data => {
                    return {
                        value: data[fk.field],
                        label: data['ownerName']
                    }
                })
            },
        },
        leaseInfo: {
            processForeignKey: (fk, datas) => {
                return datas.map(data => {
                    return {
                        value: data[fk.field],
                        label: data['address']
                    }
                })
            },
        },
        workerComp: {
            processForeignKey: (fk, datas) => {
                if (fk.table === 'leaseInfo' && fk.field === 'leaseID') {
                    return datas.map(data => {
                        return {
                            value: data[fk.field],
                            label: data['comment'],
                        }
                    });
                } else if (fk.table === 'workerInfo' && fk.field === 'workerID') {
                    return datas.map(data => {
                        return {
                            value: data[fk.field],
                            label: data['firstName'] + ' ' + data['lastName'],
                        }
                    });
                }
            },
        },
    };
}