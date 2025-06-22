import { LightningElement, api } from 'lwc';

export default class CustomPaginator extends LightningElement {
    @api paginateSize;
    @api pageStartIndex;
    @api pageEndIndex;
    @api totalRecords;
    @api showPaginator = false;
    @api showPrevious = false;
    @api showNext = false;

    get isPreviousDisabled() {
        return !this.showPrevious;
    }

    get isNextDisabled() {
        return !this.showNext;
    }


    handlePrevious() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    handleNext() {
        this.dispatchEvent(new CustomEvent('next'));
    }

    @api updateState(pageStartIndex, pageEndIndex, totalRecords, showPaginator, showPrevious, showNext) {
        this.pageStartIndex = pageStartIndex;
        this.pageEndIndex = pageEndIndex;
        this.totalRecords = totalRecords;
        this.showPaginator = showPaginator;
        this.showPrevious = showPrevious;
        this.showNext = showNext;
    }
}