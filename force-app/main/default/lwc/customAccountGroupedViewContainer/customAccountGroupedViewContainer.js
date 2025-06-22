import { LightningElement, wire, track } from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { refreshApex } from '@salesforce/apex';
import { COLUMNS } from './datatableConfig';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchAccounts from '@salesforce/apex/CustomAccountContainerController.fetchAccounts';

import CUSTOM_ACCOUNT_OBJECT from '@salesforce/schema/Custom_Account__c';
import ACCOUNT_TYPE_FIELD from '@salesforce/schema/Custom_Account__c.Account_Type__c';

export default class CustomAccountGroupedViewContainer extends LightningElement {

    picklistValuesResponse;
    typeOptions = [];
    columns = COLUMNS;
    activeTabValue;
    @track data = [];
    @track viewableItems = [];


    pageSpinner = true;
    tableSpinner = false;

    //pagination properties
    paginateSize = 10;
    pageStartIndex = 0;
    pageEndIndex = 0;
    totalRecords = 0;
    showPaginator = false;
    showPrevious = false;

    @wire(getObjectInfo, { objectApiName: CUSTOM_ACCOUNT_OBJECT })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: ACCOUNT_TYPE_FIELD
    })
    wiredPicklistValues(result) {
        this.picklistValuesResponse = result;
        const { data, error } = result;
        if (data) {
            this.typeOptions = [{
                label: 'All',
                value: 'all'
            }, ...data.values];
            this.activeTabValue = 'all';
            this.pageSpinner = false;
        } else if (error) {
            console.error('Error loading picklist values:', error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Error loading picklist values',
                variant: 'error'
            }));
            this.pageSpinner = false;
        }

    }

    handleRecordLoad(accountType = 'all', isRefreshFlow = false) {
        fetchAccounts({
            accountType: accountType
        })
            .then(result => {
                this.data = JSON.parse(JSON.stringify(result));
                this.viewableItems = this.paginate(this.data);
                if (isRefreshFlow) {
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: 'Accounts fetched successfully',
                        variant: 'success'
                    }));
                }
            })
            .catch(error => {
                console.error('Error fetching accounts:', error);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'Error fetching accounts',
                    variant: 'error'
                }));
            })
            .finally(() => {
                this.tableSpinner = false;
            });
    }

    handleActiveTab(event) {
        this.tableSpinner = true;
        this.activeTabValue = event.target.value;
        this.handleRecordLoad(event.target.value);
    }

    async handlePageRefresh() {
        this.pageSpinner = true;
        await refreshApex(this.picklistValuesResponse);
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'Page refreshed',
            variant: 'success'
        }));
        this.pageSpinner = false;
    }

    handleTabRefresh(event) {
        this.tableSpinner = true;
        this.handleRecordLoad(event.target.dataset.type, true);
    }

    //Pagination functions
    handleNext(event) {
        this.pageStartIndex = this.pageEndIndex + 1;
        this.pageEndIndex = this.pageStartIndex - 1 + this.paginateSize;
        if (this.totalRecords - this.pageStartIndex < this.paginateSize) {
            this.showNext = false;
            this.showPrevious = true;
            this.viewableItems = this.data.slice(this.pageStartIndex - 1, this.totalRecords);
        } else {
            this.showPrevious = true;
            this.viewableItems = this.data.slice(this.pageStartIndex - 1, this.pageEndIndex);
        }

        this.getPaginatorComponent(this.activeTabValue).updateState(this.pageStartIndex, this.pageEndIndex, this.totalRecords, true, this.showPrevious, this.showNext);
    }

    handlePrevious(event) {
        this.pageEndIndex = this.pageStartIndex - 1;
        this.pageStartIndex = this.pageStartIndex - this.paginateSize;

        if (this.pageStartIndex <= this.paginateSize) {
            this.showPrevious = false;
            this.showNext = true;
            this.viewableItems = this.data.slice(0, this.pageEndIndex);
        } else {
            this.showPrevious = true;
            this.showNext = true;
            this.viewableItems = this.data.slice(this.pageStartIndex - 1, this.pageEndIndex);
        }
        this.getPaginatorComponent(this.activeTabValue).updateState(this.pageStartIndex, this.pageEndIndex, this.totalRecords, true, this.showPrevious, this.showNext);
    }

    paginate(data) {
        if (data.length === 0) {
            this.pageStartIndex = 0;
            this.pageEndIndex = 0;
            this.totalRecords = 0;
            this.showPaginator = false;
            return [];
        } else if (data.length <= this.paginateSize) {
            this.pageStartIndex = 1;
            this.pageEndIndex = data.length;
            this.totalRecords = data.length;
            this.showPaginator = false;
            this.showPrevious = false;
            this.showNext = false;
            this.getPaginatorComponent(this.activeTabValue).updateState(this.pageStartIndex, this.pageEndIndex, this.totalRecords, this.showPaginator, this.showPrevious, this.showNext);

            return data;
        } else {
            this.showPrevious = false;
            this.showNext = true;
            this.showPaginator = true;
            this.pageStartIndex = 1;
            this.pageEndIndex = this.paginateSize;
            this.totalRecords = data.length;
            this.getPaginatorComponent(this.activeTabValue).updateState(this.pageStartIndex, this.pageEndIndex, this.totalRecords, this.showPaginator, this.showPrevious, this.showNext);
            return data.slice(0, this.pageEndIndex);
        }

    }

    getPaginatorComponent(accountType) {
        return this.template.querySelector('c-custom-paginator[data-id="' + accountType + '"]');
    }
}