export function getFKDefs() {
    return {
        ownerInfo: {
            processForeignKey: (fk,datas) => {
                return datas.map(data => {
                    return {
                        value: data[fk.field],
                        label: data['ownerName']
                    }
                })
            },
        },
        houseInfo: {
            processForeignKey: (fk,datas) => {
                return datas.map(data => {
                    return {
                        value: data[fk.field],
                        label: data['address']
                    }
                })
            },
        },
        workerInfo: {
            processForeignKey: (fk,datas) => {
                return datas.map(data => {
                    return {
                        value: data[fk.field],
                        label: data['firstName'] + ' ' + data['lastName'],
                    }
                });
            },
        },
        leaseInfo: {
            processForeignKey: (fk,datas) => {
                return datas.map(data => {
                    return {
                        value: data[fk.field],
                        label: data['comment'],
                    }
                });
            },
        },
    };
}