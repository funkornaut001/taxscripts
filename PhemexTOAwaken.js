function consolidatePhemexTransactions() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const processedData = new Map();
  
    data.slice(1).forEach(row => {
      const timestamp = row[2]; // Assuming this is already a string in correct format
      const account = row[3];
      const operation = row[4];
      const coin = row[5];
      const change = parseFloat(row[6]);
      const remark = row[7];
  
      const transactionKey = timestamp + '-' + remark;
  
      if (!processedData.has(transactionKey)) {
        processedData.set(transactionKey, {
          'Date': timestamp,
          'Received Quantity': '',
          'Received Currency': '',
          'Sent Quantity': '',
          'Sent Currency': '',
          'Fee Amount': '',
          'Fee Currency': '',
          'TAG': operation,
          'Transaction Hash': remark
        });
      }
  
      const entry = processedData.get(transactionKey);
  
      switch(operation) {
        case 'Bonus':
        case 'Air Drop':
        case 'Deposit':
          entry['Received Quantity'] += change;
          entry['Received Currency'] = coin;
          //entry['Sent Quantity'] = change; // Adjusted for Sent Quantity instead of Fee Amount
          //entry['Sent Currency'] = coin; // Adjusted for Sent Currency instead of Fee Currency
          break;
        case 'Trade':
          if (change > 0) {
            entry['Received Quantity'] += change;
            entry['Received Currency'] = coin;
          } else {
            // Negative change for Trade is treated as Sent Quantity
            entry['Sent Quantity'] += Math.abs(change);
            entry['Sent Currency'] = coin;
          }
          break;
        case 'Fee':
          // Accumulate Fee Amount
          entry['Fee Amount'] += Math.abs(change);
          entry['Fee Currency'] = coin;
          break;
        case 'Transfer(Contract)':
          if (change > 0) {
            entry['Received Quantity'] = change;
            entry['Received Currency'] = coin;
          } else {
            entry['Sent Quantity'] = Math.abs(change);
            entry['Sent Currency'] = coin;
          }
          break;
        case 'Transfer(Investment)':
        case 'Convert':
        if (change > 0) {
            entry['Received Quantity'] = change;
            entry['Received Currency'] = coin;
          } else {
            entry['Sent Quantity'] = Math.abs(change);
            entry['Sent Currency'] = coin;
          }
          break;
        case 'Flexible Saving Income':
          entry['Received Quantity'] = change;
          entry['Received Currency'] = coin;
          entry['TAG'] = 'Flexible Saving Income';
          break;
        case 'Withdrawal':
          entry['Sent Quantity'] = Math.abs(change);
          entry['Sent Currency'] = coin;
          break;
          // New case for handling Trade Fee, Closed PNL, and Funding Fee
        case 'Trade Fee':
        case 'Closed PNL':
        case 'Funding Fee':
          entry['TAG'] += operation + ' ';
          if (operation === 'Closed PNL') {
            if (change < 0) {
              entry['Sent Quantity'] = Math.abs(change);
              entry['Sent Currency'] = coin;
            } else if (change > 0) {
              entry['Received Quantity'] = change;
              entry['Received Currency'] = coin;
            }
          } else {
            // Summing up all fees but only if it's not zero
            if (change !== 0) {
              entry['Fee Amount'] = (entry['Fee Amount'] ? parseFloat(entry['Fee Amount']) : 0) + Math.abs(change);
              entry['Fee Currency'] = coin;
            }
          }
          break;
        // Add other cases as needed
      }
    });
  
     // Convert the data map into an array format suitable for Google Sheets
    const output = Array.from(processedData.values()).map(transaction => [
      transaction['Date'],
      transaction['Received Quantity'] || '',
      transaction['Received Currency'],
      transaction['Sent Quantity'] || '',
      transaction['Sent Currency'],
      transaction['Fee Amount'] || '',
      transaction['Fee Currency'],
      transaction['TAG'].trim(),
      transaction['Transaction Hash']
    ]);
  
    // Create a new sheet for the consolidated data
    const outputSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Consolidated Phemex Data');
    outputSheet.appendRow(['Date', 'Received Quantity', 'Received Currency', 'Sent Quantity', 'Sent Currency', 'Fee Amount', 'Fee Currency', 'TAG', 'Transaction Hash']);
    outputSheet.getRange(2, 1, output.length, 9).setValues(output);
  }
  