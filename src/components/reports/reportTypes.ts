export interface IPayment {
    address: string;
    addressId: string;
    amount: number;
    created: string;
    date: string;
    houseID: string;
    includeInCommission: string;
    modified: string;
    month: string;
    notes: string;
    ownerID: string;
    ownerName: string;
    paidBy: string;
    paymentID: string;
    paymentProcessor: string;
    paymentTypeID: string;
    paymentTypeName: string;
    receivedAmount: number;
    receivedDate: string;
    source: string;
    vdPosControl: string;
}


export interface IPageProps {
    reloadCount: number;
    [tableName: string]: {        
        sorts: [
            {
                name: string,
                op: 'asc' | 'desc',
                shortDesc: 'AS' | 'DS',
            }
        ]
    } | number;
};

export interface IOwnerInfo {
    ownerID: string;
    ownerName: string;
}

export interface IHouseInfo {
    houseID: string;
    address: string;
}

export interface IDropdownOption {
    value: string;
    label: string;
}

export interface IExpenseData {
    address: string;
    amount: number;
    category: string;
    comment: string;
    date: string;
    description: string;
    expenseCategoryName: string;
    houseID: string;
    month: string;
}

export interface IHouseAnchorInfo {
    address: string;
    id: string;
    isAnchor: boolean;
}

export interface IPaymentCalcOpts {
    isGoodMonth: (mon: string) => boolean;
    isGoodHouseId: (mon: string) => boolean;
    getHouseShareInfo: () => IHouseAnchorInfo[];
}

export interface IIncomeExpensesContextValue {
    pageProps: IPageProps;
    setPageProps: (a: IPageProps) => void;
    ownerInfo: IOwnerInfo;
    setOwnerInfo: (a: IOwnerInfo) => void;
    rawExpenseData: IExpenseData[];
    payments: IPayment[];
    allMonthes: string[];
    allHouses: IHouseInfo[];
    houseAnchorInfo: IHouseAnchorInfo[];
    monthes: string[];
    setMonthes: (a: string[]) => void;
    curMonthSelection: any;
    setCurMonthSelection: (a: any) => void;
    selectedMonths: { [mon: string]: boolean };
    setSelectedMonths: (a: { [mon: string]: boolean }) => void;
    selectedHouses: any;
    setSelectedHouses: (a: any) => void;
    beginReLoadPaymentData: (o: IOwnerInfo) => Promise<void>;
    paymentCalcOpts: IPaymentCalcOpts;
}