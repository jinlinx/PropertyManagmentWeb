import React from "react";
import HomePageLayout from "./HomePageLayout";
import { JJDataRoot, IncomeExpensesContext } from '../reports/rootData';    

import CashFlowReport from "../reports/cashflow";
import MaintenanceReport from "../reports/maintenanceReport";
import PaymentReport from "../reports/paymentReport";
import MonthlyComp from "../reports/monthlyComp";
import MaintenanceList from "../maintenanceList";
import Propertylist from '../propertylist';
import PaymentList from "../paymentlist";
import LeaseList from "../leaselist";
import TenantList from "../tenantlist";
import OwnerList from "../ownerList";
import WorkerCompList from '../workerCompList';
import ExepenseCategory from '../dataEntry/expenseCategory';
import ReportList from "../reportlist";
import Developer from "../Developer";
import { YearlyMaintenanceReport } from '../pages/yearlyMaintenanceReport';
import { YearlyIncomeByHouseReport} from '../pages/yearlyIncomeByHouse';

export default function HomePageContents() {    
    return <JJDataRoot>
        <IncomeExpensesContext.Consumer>
            {
                value => {
                    const controls = [
                        {
                            name: 'Reports',
                            link: 'reports',
                            links: [
                                { path: 'cashFlowSummary', name: 'CashFlow', element: <CashFlowReport jjctx={value} /> },
                                { path: 'maintenanceReport', element: <MaintenanceReport jjctx={value} /> },
                                { path: 'paymentReport', element: <PaymentReport jjctx={value} /> },
                                { path: 'workerCompensationReport', element: <MonthlyComp compPrm={value.ownerInfo}></MonthlyComp> },
                                { path: 'yearlyMaintenanceReport', element: <YearlyMaintenanceReport ownerInfo={value.ownerInfo}></YearlyMaintenanceReport> },
                                { path: 'YearlyIncomeByHouseReport', element: <YearlyIncomeByHouseReport jjctx={value} ownerInfo={value.ownerInfo}></YearlyIncomeByHouseReport>}
                            ]
                        },
                        {
                            name: 'DataEntry',
                            link: 'dataEntry',
                            links: [
                                { path: 'maintenanceList', element: <MaintenanceList pageState={value} /> },
                                { path: 'Propertylist', element: <Propertylist pageState={value} /> },
                                { path: 'Paymentlist', element: <PaymentList pageState={value} /> },
                                { path: 'Leaselist', element: <LeaseList pageState={value} /> },
                                { path: 'tenantlist', element: <TenantList pageState={value} /> },
                                { path: 'OwnerList', element: <OwnerList pageState={value} /> },
                            ]
                        },
                        {
                            name: 'Admin Tools',
                            link: 'adminTools',
                            links: [
                                { path: 'workerCompList', element: <WorkerCompList pageState={value}></WorkerCompList> },
                                { path: 'expenseCategory', element: <ExepenseCategory pageState={value}></ExepenseCategory> },
                                { path: 'developer', element: <div><Developer /></div> },
                                { path: 'importPayments', element: <ReportList pageState={value} /> },
                            ]
                        },                        
                        //{ path: 'oldapp', element: <div><AppOld /></div> },                                                
                        //{ path: 'TenantPaymentMethodMapping', element: <TenantPaymentMethodMapping /> },
                    ];
                    return <HomePageLayout controlsGrp={controls}></HomePageLayout>
                }
            }
        </IncomeExpensesContext.Consumer>
    </JJDataRoot>
}