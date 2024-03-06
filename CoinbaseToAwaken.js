function reformatDataForAwaken() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("coinbase"); // Adjust to your sheet name
    const data = sheet.getDataRange().getValues();

    let processedData = [];

    // Loop through data starting from the second row (assuming the first row is headers)
for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const timestamp = new Date(row[0]);
    const transactionType = row[1];
    const asset = row[2]; // Asset received
    const quantityReceived = parseFloat(row[3]); // Quantity received
    const spotPriceCurrency = row[4]; // Assuming this is the sent currency
    const subtotal = parseFloat(row[6]); // Assuming this is the sent quantity for buys/converts
    const fees = parseFloat(row[8]);
    const notes = row[9];

    // Date formatted to MM/DD/YYYY HH:MM:SS
    const formattedDate = Utilities.formatDate(timestamp, "GMT", "MM/dd/yyyy HH:mm:ss");

    // Initialize transaction record with common structure
    let transaction = {
        Date: formattedDate,
        ReceivedQuantity: '',
        ReceivedCurrency: '',
        SentQuantity: '',
        SentCurrency: spotPriceCurrency, // Assuming USD or derived from "Spot Price Currency"
        FeeAmount: fees > 0 ? fees.toFixed(8) : '', // Fee amount, leave blank if 0
        FeeCurrency: fees > 0 ? spotPriceCurrency : '', // Fee currency, leave blank if 0
        Notes: notes
    };

    if (fees == 0) {
        transaction.FeeAmount = '';
        transaction.FeeCurrency = ''; 
    } else {
        transaction.FeeAmount = Math.abs(fees).toFixed(8);
        transaction.FeeCurrency = "USD"
    }

    // Handling different transaction types
    if (transactionType === 'Send' || transactionType === 'Withdraw' || transactionType === 'Withdrawal') {
    transaction.SentQuantity = quantityReceived.toFixed(8);
    transaction.SentCurrency = asset; // For send/withdraw, asset itself is the sent currency
    } else if (transactionType === 'Advance Trade Buy' || transactionType === 'Buy') {
    transaction.ReceivedQuantity = quantityReceived.toFixed(8);
    transaction.ReceivedCurrency = asset;
    transaction.SentQuantity = subtotal.toFixed(8); // Assuming subtotal represents the quantity of USD sent
    transaction.SentCurrency = "USD"; // Explicitly setting USD for these transaction types
        } 
        else if (transactionType === 'Convert') {
        // Parse the 'Notes' for convert details
        const convertDetails = notes.match(/Converted [\d.]+ \w+ to ([\d.]+) (\w+)/);
        if (convertDetails) {
            transaction.SentQuantity = convertDetails[1]; // Quantity of AVAX sent
            transaction.SentCurrency = convertDetails[2]; // Currency of AVAX
            transaction.ReceivedQuantity = quantityReceived.toFixed(8);
            transaction.ReceivedCurrency = asset;
        }
        }
    else if (transactionType === 'Advance Trade Sell' || transactionType === 'Sell') {
    
            transaction.ReceivedQuantity = subtotal.toFixed(8);
            transaction.ReceivedCurrency = "USD";
            transaction.SentQuantity = quantityReceived.toFixed(8);
            transaction.SentCurrency = asset; 

            

        }  else if (['Deposit', 'Receive', 'Learning Reward', 'Exchange Deposit'].includes(transactionType)) {
    transaction.ReceivedQuantity = quantityReceived.toFixed(8);
    transaction.ReceivedCurrency = asset;
    transaction.SentQuantity = ''; // Ensuring no sent quantity for deposit-like transactions
    transaction.SentCurrency = ''; // Ensuring sent currency is blank for deposit-like transactions
}

        // Append the formatted transaction to the processed data
        processedData.push([
            transaction.Date,
            transaction.ReceivedQuantity,
            transaction.ReceivedCurrency,
            transaction.SentQuantity,
            transaction.SentCurrency,
            transaction.FeeAmount,
            transaction.FeeCurrency,
            transaction.Notes
        ]);
    }

    // Check if output sheet exists, create or clear otherwise
    let outputSheet = ss.getSheetByName('AwakenFormattedData');
    if (!outputSheet) {
        outputSheet = ss.insertSheet('AwakenFormattedData');
    } else {
        outputSheet.clear(); // Clear existing data
    }

    // Append headers and processed data to the output sheet
    outputSheet.appendRow(['Date', 'Received Quantity', 'Received Currency', 'Sent Quantity', 'Sent Currency', 'Fee Amount', 'Fee Currency', 'Notes']);
    if (processedData.length > 0) {
        outputSheet.getRange(2, 1, processedData.length, processedData[0].length).setValues(processedData);
    }
}
