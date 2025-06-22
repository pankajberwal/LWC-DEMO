@IsTest
private class CustomAccountContainerControllerTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test Custom Account records with different Account Types
        List<Custom_Account__c> testAccounts = new List<Custom_Account__c>();
        
        // Customer accounts
        for(Integer i = 1; i <= 5; i++) {
            testAccounts.add(new Custom_Account__c(
                Name = 'Test Local Account ' + i,
                Account_Type__c = 'Local'
            ));
        }
        
        // Partner accounts
        for(Integer i = 1; i <= 3; i++) {
            testAccounts.add(new Custom_Account__c(
                Name = 'Test Government Account ' + i,
                Account_Type__c = 'Government'
            ));
        }
        
        // Prospect accounts
        for(Integer i = 1; i <= 2; i++) {
            testAccounts.add(new Custom_Account__c(
                Name = 'Test Local, Government Account ' + i,
                Account_Type__c = 'Government;Local'
            ));
        }
        
        insert testAccounts;
    }
    
    @IsTest
    static void testFetchAccountsForAllTypes() {
        // Given
        String accountType = 'all';
        
        // When
        Test.startTest();
        List<Custom_Account__c> result = CustomAccountContainerController.fetchAccounts(accountType);
        Test.stopTest();
        
        // Then
        System.assertEquals(10, result.size(), 'Should return all 10 test accounts');
        
        // Verify we have accounts of different types
        Set<String> accountTypes = new Set<String>();
        for(Custom_Account__c account : result) {
            accountTypes.add(account.Account_Type__c);
        }
        System.assert(accountTypes.contains('Local'), 'Should contain Local accounts');
        System.assert(accountTypes.contains('Government'), 'Should contain Government accounts');
    }
    
    @IsTest
    static void testFetchAccountsForLocalType() {
        // Given
        String accountType = 'Local';
        
        // When
        Test.startTest();
        List<Custom_Account__c> result = CustomAccountContainerController.fetchAccounts(accountType);
        Test.stopTest();
        
        // Then
        System.assertEquals(7, result.size(), 'Should return 5 Local accounts');
    }
    
    @IsTest
    static void testFetchAccountsForNonExistentType() {
        // Given
        String accountType = 'NonExistentType';
        
        // When
        Test.startTest();
        List<Custom_Account__c> result = CustomAccountContainerController.fetchAccounts(accountType);
        Test.stopTest();
        
        // Then
        System.assertEquals(0, result.size(), 'Should return 0 accounts for non-existent type');
    }
    
    @IsTest
    static void testFetchAccountsWithLargeDataSet() {
        // Given - Create additional accounts to test performance
        List<Custom_Account__c> additionalAccounts = new List<Custom_Account__c>();
        for(Integer i = 1; i <= 100; i++) {
            additionalAccounts.add(new Custom_Account__c(
                Name = 'Performance Test Account ' + i,
                Account_Type__c = 'Local'
            ));
        }
        insert additionalAccounts;
        
        String accountType = 'Local';
        
        // When
        Test.startTest();
        List<Custom_Account__c> result = CustomAccountContainerController.fetchAccounts(accountType);
        Test.stopTest();
        
        // Then
        System.assertEquals(107, result.size(), 'Should return 107 Customer accounts (5 original + 100 new)');
    }
}