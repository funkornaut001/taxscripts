function consolidateTransactions() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const processedData = new Map();
    
  
    data.slice(1).forEach(row => {
      const timestamp = row[0];
      const type = row[1];
      const internalId = row[2];
      const platform = row[3];
      const recordType = row[6];
      const asset = row[7];
      const amount = parseFloat(row[8]);
  
      const transactionKey = timestamp + '-' + internalId;
  
      if (!processedData.has(transactionKey)) {
        processedData.set(transactionKey, {
          'Date': '',
          'Received Quantity': 0,
          'Received Currency': '',
          'Sent Quantity': 0,
          'Sent Currency': '',
          'Fee Amount': 0,
          'Fee Currency': '',
          'TAG': ''
        });
      }
  
      const entry = processedData.get(transactionKey);
  
      // Format date and set TAG
      entry['Date'] = timestamp.replace('T', ' ').split('.')[0];
      entry['TAG'] = type + ' ' + platform;
  
      switch (type) {
        case 'Fiat Buy':
        case 'Fiat Sell':
          if (recordType === 'Credit') {
            entry['Received Quantity'] = amount;
            entry['Received Currency'] = asset;
          } else if (recordType === 'Debit') {
            entry['Sent Quantity'] = Math.abs(amount);
            entry['Sent Currency'] = asset;
          }
          break;
        case 'Deposit':
        case 'Interest Income':
          entry['Received Quantity'] = Math.abs(amount);
          entry['Received Currency'] = asset;
          // Leaving Sent Quantity and Sent Currency blank
          entry['Sent Quantity'] = '';
          entry['Sent Currency'] = '';
          break;
        case 'Withdrawal':
          entry['Sent Quantity'] = Math.abs(amount);
          entry['Sent Currency'] = asset;
          // Leaving Received Quantity and Received Currency blank
          entry['Received Quantity'] = '';
          entry['Received Currency'] = '';
          break;
        // Add additional cases for other types as needed
      }
    });
  
   const output = Array.from(processedData.values()).map(transaction => [
      transaction['Date'],
      transaction['Received Quantity'],
      transaction['Received Currency'],
      transaction['Sent Quantity'],
      transaction['Sent Currency'],
      transaction['Fee Amount'],
      transaction['Fee Currency'],
      transaction['TAG']
    ]);
  
    // Create a new sheet for the consolidated data
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let outputSheet = ss.getSheetByName('Consolidated Transactions');
    
    // If the sheet does not exist, create it
    if (!outputSheet) {
      outputSheet = ss.insertSheet('Consolidated Transactions');
    } else {
      // Clear the existing content if the sheet exists
      outputSheet.clear();
    }
  
    outputSheet.appendRow(['Date', 'Received Quantity', 'Received Currency', 'Sent Quantity', 'Sent Currency', 'Fee Amount', 'Fee Currency', 'TAG']);
    outputSheet.getRange(2, 1, output.length, 8).setValues(output);
  }