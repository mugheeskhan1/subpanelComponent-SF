import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';


const SUCCESS_TITLE = 'Success';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';


export default class ViewAllRelatedOpp extends NavigationMixin(LightningElement) {

    error;
    opportunities;
    counter = 1;
    @track currentPageReference;

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
    }

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Opportunities',
        fields: ['Opportunity.Id', 'Opportunity.Name', 'Opportunity.StageName', 'Opportunity.Amount', 'Opportunity.CloseDate'],
        where: "{ and: [{ StageName: {like: 'Closed Won'}}] }"
    }) listInfo({ error, data }) {
        if (data) {
            this.opportunities = data.records;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.opportunities = undefined;
        }
    }

    get recordId() {
        return this.currentPageReference?.state?.c__recordId;
    }

    get index() {
        return this.counter++;
    }

    viewRecord(event) {
        event.preventDefault();
        console.log('id => ' + event.target.dataset.id);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                "recordId": event.target.dataset.id,
                "objectApiName": "Opportunity",
                "actionName": "view"
            },
        });
    }

    editRecord(event) {
        console.log('in editRecord');
        console.log(event.currentTarget.dataset.id);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.currentTarget.dataset.id,
                actionName: 'edit'
            }
        });
    }

    deleteRecord(event) {
        const recordId = event.currentTarget.dataset.id;
        deleteRecord(recordId).then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: 'Record with id ' + recordId + ' deleted',
                    variant: SUCCESS_VARIANT
                })
            );
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT
                })
            );
        });
    }
}