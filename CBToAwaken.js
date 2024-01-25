function reformatDataForAwaken() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("100kyulio CB PRO Account All"); // Replace with your sheet name
    const data = sheet.getDataRange().getValues();

    let transactions = {};
    let processedData = [];
I
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const type = row[1];
        const time = new Date(row[2]);
        // Format date for display in Awaken format
        const formattedTime = Utilities.formatDate(time, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
        // Keep the detailed timestamp for grouping
        const detailedTime = Utilities.formatDate(time, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss.SSS");
        const amount = parseFloat(row[3]);
        const currency = row[5];
        const transferId = row[6];
        const orderId = row[8];

        if (!transactions[detailedTime]) {
            transactions[detailedTime] = {
                Date: formattedTime,
                ReceivedQuantity: '',
                ReceivedCurrency: '',
                SentQuantity: '',
                SentCurrency: '',
                FeeAmount: '',
                FeeCurrency: '',
                TAG: transferId || '',
                TransactionHash: orderId
            };
        }

        if (type === 'deposit') {
            transactions[detailedTime].ReceivedQuantity += Math.abs(amount);
            transactions[detailedTime].ReceivedCurrency = currency;
        } else if (type === 'withdrawal') {
            transactions[detailedTime].SentQuantity += Math.abs(amount);
            transactions[detailedTime].SentCurrency = currency;
        } else if (type === 'match') {
            if (amount < 0) {
                transactions[detailedTime].SentQuantity += Math.abs(amount);
                transactions[detailedTime].SentCurrency = currency;
            } else {
                transactions[detailedTime].ReceivedQuantity += amount;
                transactions[detailedTime].ReceivedCurrency = currency;
            }
        } else if (type === 'fee') {
            transactions[detailedTime].FeeAmount += Math.abs(amount);
            transactions[detailedTime].FeeCurrency = currency;
        }
    }

    for (let key in transactions) {
        processedData.push([
            transactions[key].Date,
            transactions[key].ReceivedQuantity,
            transactions[key].ReceivedCurrency,
            transactions[key].SentQuantity,
            transactions[key].SentCurrency,
            transactions[key].FeeAmount,
            transactions[key].FeeCurrency,
            transactions[key].TAG,
            transactions[key].TransactionHash
        ]);
    }

    // Create a new sheet for the consolidated data
    const outputSheet = ss.insertSheet('AwakenFormattedDataByTime');
    outputSheet.appendRow(['Date', 'Received Quantity', 'Received Currency', 'Sent Quantity', 'Sent Currency', 'Fee Amount', 'Fee Currency', 'TAG', 'Transaction Hash']);
    outputSheet.getRange(2, 1, processedData.length, 9).setValues(processedData);
}
