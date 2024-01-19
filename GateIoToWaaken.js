function consolidateGateIoTransactions() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("original");
    const data = sheet.getDataRange().getValues();
  
    const processedData = [];
  
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const type = row[2];
      const fromWallet = row[4];
      const toWallet = row[8];
      const dateTime = row[1];
      const fromAmount = row[6];
      const fromCurrency = row[7].split(';')[0];
      const toAmount = row[10];
      const toCurrency = row[11].split(';')[0];
      
  
      let receivedQuantity = '';
      let receivedCurrency = '';
      let sentQuantity = '';
      let sentCurrency = '';
      let feeAmount = '';
      let feeCurrency = '';
  
      // Only add fee details if the fee is greater than 0
      if (row[12] > 0) { // Assuming fee amount is in column 13 (index 12)
          feeAmount = row[12];
          feeCurrency = row[13].split(';')[0]; // Assuming fee currency is in column 14 (index 13)
      }
  
      if (type === 'transfer') {
        if (fromWallet === 'Gate.io') {
          sentQuantity = fromAmount;
          sentCurrency = fromCurrency;
        } else {
          receivedQuantity = toAmount;
          receivedCurrency = toCurrency;
        }
      } else if (type === 'deposit' || type === 'interest income') {
        receivedQuantity = toAmount;
        receivedCurrency = toCurrency;
      } else if (type === 'withdrawal') {
        sentQuantity = fromAmount;
        sentCurrency = fromCurrency;
      } else if (type === 'trade') {
        receivedQuantity = toAmount;
        receivedCurrency = toCurrency;
        sentQuantity = fromAmount;
        sentCurrency = fromCurrency;
      }
  
      processedData.push([
          dateTime,
          receivedQuantity,
          receivedCurrency,
          sentQuantity,
          sentCurrency,
          feeAmount, // Fee Amount
          feeCurrency, // Fee Currency
          type.toUpperCase() // TAG
      ]);
    }
  
    const outputSheet = ss.insertSheet('Consolidated Data');
    outputSheet.appendRow(['Date', 'Received Quantity', 'Received Currency', 'Sent Quantity', 'Sent Currency', 'Fee Amount', 'Fee Currency', 'TAG']);
    outputSheet.getRange(2, 1, processedData.length, 8).setValues(processedData);
  }
  
  