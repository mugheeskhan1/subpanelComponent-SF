import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { api, LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';

const SUCCESS_TITLE = 'Success';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';

export default class RelatedOppSubpanel extends NavigationMixin(LightningElement) {
    error;
    @track opportunities;
    totalOpp = 0;
    @api recordId;
    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Opportunities',
        fields: ['Opportunity.Id', 'Opportunity.Name', 'Opportunity.StageName', 'Opportunity.Amount', 'Opportunity.CloseDate'],
        where: "{ and: [{ StageName: {like: 'Closed Won'}}] }"
    }) listInfo({ error, data }) {
        if (data) {
            this.opportunities = data.records;
            this.error = undefined;
            this.totalOpp = Object.keys(this.opportunities).length;
        } else if (error) {
            this.error = error;
            this.opportunities = undefined;
        }
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

    createNewOpp() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Opportunity',
                actionName: 'new'
            },
            state: {
                defaultFieldValues: "AccountId=" + this.recordId,
                nooverride: "1"
            }
        });
    }

    // As related list view does not allow pre applied permanent filter,
    // calling our custom view for showing data
    viewAllClosedWonOpp() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/n/viewAllOpp?c__recordId=' + this.recordId
            }
        });
    }

    editRecord(event) {
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