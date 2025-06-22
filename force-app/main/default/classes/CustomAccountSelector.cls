public with sharing class CustomAccountSelector {
    private static final String defaultFields = 'Id, Name, Account_Type__c';
    
    public static List<Custom_Account__c> fetchAccounts(String fields, String whereClause, Map<String, Object> bindVariables){
        
        try {
            String queryFields = String.isBlank(fields) ? defaultFields : fields;
            String query = 'SELECT ' + queryFields + ' FROM Custom_Account__c ' + (String.isNotBlank(whereClause) ? 'WHERE ' + whereClause +' ORDER BY Name ASC' : '');
            return Database.queryWithBinds(query, bindVariables, AccessLevel.SYSTEM_MODE);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}