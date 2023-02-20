import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { api, LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class RelatedOppSubpanel extends NavigationMixin(LightningElement) {
    error;
    opportunities;
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
}