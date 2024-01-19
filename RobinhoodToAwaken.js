function convertData() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    // Create a new sheet for the converted data
    var newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Converted Data');
    
    // Headers for the new format
    newSheet.appendRow(['Date', 'Received Quantity', 'Received Currency', 
                        'Sent Quantity', 'Sent Currency', 'Fee Amount', 
                        'Fee Currency', 'TAG', 'Transaction Hash']);
    
    // Skip the header row and process each row
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      
      // Convert and append the "buy" transaction
      newSheet.appendRow([row[1], row[5], row[0], row[2], 'USD', '', '', '', '']);
      
      // Convert and append the "sell" transaction
      newSheet.appendRow([row[3], row[4], 'USD', row[5], row[0], '', '', '', '']);
    }
  }
  //Might not be the most accurate as Robinhood dates do not include the timestamp so cost basis is a little off.