function reformatDataForAwaken() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("OG Gate w/o first few transactions"); // Replace with your actual sheet name
  const data = sheet.getDataRange().getValues();

  let transactions = {};
  let processedData = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const originalTime = row[2]; // Directly use the original date and time value
    const changeAmount = parseFloat(row[6]);
    const currency = row[4];
    const orderId = row[5];

    if (!transactions[originalTime]) {
      transactions[originalTime] = {
        Date: originalTime, // Using the original date and time as is
        ReceivedQuantity: "",
        ReceivedCurrency: "",
        SentQuantity: "",
        SentCurrency: "",
        FeeAmount: "",
        FeeCurrency: "",
        TransactionHash: orderId,
      };
    }

    // Determine the action based on the type and amount
    switch (
      row[3] // Action type
    ) {
      case "Trading Fees":
        transactions[originalTime].FeeAmount = formatAmount(
          transactions[originalTime].FeeAmount + Math.abs(changeAmount)
        );
        transactions[originalTime].FeeCurrency = currency;
        break;
      case "Order Filled":
        if (changeAmount > 0) {
          transactions[originalTime].ReceivedQuantity = formatAmount(
            transactions[originalTime].ReceivedQuantity + changeAmount
          );
          transactions[originalTime].ReceivedCurrency = currency;
        } else {
          transactions[originalTime].SentQuantity = formatAmount(
            transactions[originalTime].SentQuantity + Math.abs(changeAmount)
          );
          transactions[originalTime].SentCurrency = currency;
        }
        break;
      case "Order Placed":
        transactions[originalTime].SentQuantity = formatAmount(
          transactions[originalTime].SentQuantity + Math.abs(changeAmount)
        );
        transactions[originalTime].SentCurrency = currency;
        break;
      case "Withdrawals":
        // For withdrawals, the sent quantity is the absolute value of the change amount
        // and the fee will be added separately if present in the same transaction
        transactions[originalTime].SentQuantity = formatAmount(
          Math.abs(changeAmount)
        );
        transactions[originalTime].SentCurrency = currency;
        // Fees would be handled in the 'Trading Fees' case if present
        break;

      case "Deposits":
        // For deposits, only the received quantity and currency are set
        transactions[originalTime].ReceivedQuantity =
          formatAmount(changeAmount);
        transactions[originalTime].ReceivedCurrency = currency;
        break;
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
      transactions[key].TransactionHash,
    ]);
  }

  //console.log(processedData);

  const outputSheet = ss.insertSheet("AwakenFormattedData");
  outputSheet.appendRow([
    "Date",
    "Received Quantity",
    "Received Currency",
    "Sent Quantity",
    "Sent Currency",
    "Fee Amount",
    "Fee Currency",
    "Transaction Hash",
  ]);
  outputSheet.getRange(2, 1, processedData.length, 8).setValues(processedData);

  // Set the number format for the Date column to display date and time
  outputSheet
    .getRange(2, 1, processedData.length, 1)
    .setNumberFormat("MM/dd/yyyy HH:mm:ss");
}

// Helper function to format amount with up to eight decimal places
function formatAmount(amount) {
  // Ensure that amount is a number
  const numericAmount = Number(amount);
  return isNaN(numericAmount) ? "" : numericAmount.toFixed(8);
}
