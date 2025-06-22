public with sharing class CustomAccountContainerController {
    
    @AuraEnabled
    public static List<Custom_Account__c> fetchAccounts(String accountType){
        try {
            String whereClause = '';
            if(accountType != 'all'){
                whereClause = 'Account_Type__c includes (:accountType)  ';
            }

            return CustomAccountSelector.fetchAccounts(null, whereClause, new Map<String, Object>{'accountType' => accountType});
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}