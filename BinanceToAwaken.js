function reformatData() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const binanceSheet = ss.getSheetByName("Binance US 2021");
    const outputSheet = ss.getSheetByName("ReformattedData") || ss.insertSheet("ReformattedData");
  
    const data = binanceSheet.getDataRange().getValues();
    let transactions = {};
  
    // Process and group data by timestamp
    data.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      const [userId, utcTime, account, operation, coin, change, remark] = row;
  
      if (!transactions[utcTime]) {
        transactions[utcTime] = {
          date: utcTime,
          receivedQuantity: 0,
          receivedCurrency: '',
          sentQuantity: 0,
          sentCurrency: '',
          feeAmount: 0,
          feeCurrency: '',
          notes: remark
        };
      }
  
      const transaction = transactions[utcTime];
      const absChange = Math.abs(change);
  
      if (operation === 'Fee') {
        transaction.feeAmount += absChange;
        transaction.feeCurrency = coin;
      } else if (change > 0) {
        transaction.receivedQuantity += change;
        transaction.receivedCurrency = coin;
      } else if (change < 0) {
        transaction.sentQuantity += absChange;
        transaction.sentCurrency = coin;
      }
    });
  
    // Write processed data to new sheet
    outputSheet.clear(); // Clear existing data
    const headers = ['Date', 'Received Quantity', 'Received Currency', 'Sent Quantity', 'Sent Currency', 'Fee Amount', 'Fee Currency', 'Notes'];
    const outputData = [headers];
  
    for (let key in transactions) {
      const t = transactions[key];
      outputData.push([t.date, t.receivedQuantity, t.receivedCurrency, t.sentQuantity, t.sentCurrency, t.feeAmount, t.feeCurrency, t.notes]);
    }
  
    outputSheet.getRange(1, 1, outputData.length, headers.length).setValues(outputData);
  }
  
  