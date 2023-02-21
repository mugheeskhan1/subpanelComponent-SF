import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';

export default class ViewAllRelatedOpp extends LightningElement {

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
}