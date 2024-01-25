/**
 * @todo - add om earn transaction type - treat staking as swaps 
 */

function reformatDataForAwaken() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("kraken-ledger");
    const data = sheet.getDataRange().getValues();
  
    let trades = {};
    let processedData = [];
    processedData.push(["Date", "Received Quantity", "Received Currency", "Sent Quantity", "Sent Currency", "Fee Amount", "Fee Currency", "Transaction Hash", "Notes"]);
  
    // Helper function to add data to processedData with checks for empty or 0 values.
    function addTransaction(date, receivedQuantity, receivedCurrency, sentQuantity, sentCurrency, feeAmount, feeCurrency, txid, tag) {
      processedData.push([
        date,
        receivedQuantity > 0 ? receivedQuantity.toFixed(8) : "",
        receivedQuantity > 0 ? receivedCurrency : "",
        sentQuantity > 0 ? sentQuantity.toFixed(8) : "",
        sentQuantity > 0 ? sentCurrency : "",
        feeAmount > 0 ? feeAmount.toFixed(8) : "",
        feeAmount > 0 ? feeCurrency : "",
        txid,
        tag
      ]);
    }
  
    for (let i = 1; i < data.length; i++) {
      const [txid, refid, originalTime, type, subtype, , currency, amount, fee] = data[i];
  
      if (!txid) continue;
      const formattedDate = formatDate(originalTime);
      const numericAmount = parseFloat(amount) || 0;
      const numericFee = parseFloat(fee) || 0;
      const tag = subtype || "";
  
      if (type === "trade") {
        const tradeKey = refid + originalTime;
        if (!trades[tradeKey]) {
          trades[tradeKey] = { received: {}, sent: {}, fee: 0, txids: [], tag: tag, time: formattedDate };
        }
        const trade = trades[tradeKey];
        trade.txids.push(txid);
  
        if (numericAmount > 0) {
          trade.received = { quantity: numericAmount, currency: currency };
        } else {
          trade.sent = { quantity: Math.abs(numericAmount), currency: currency };
          trade.fee += numericFee; // Assuming fee is only on the 'sent' side
        }
      } else {
        // Handle other transaction types including "staking" and "transfer"
        const receivedQuantity = (type === "deposit" || type === "staking") ? numericAmount : 0;
        const sentQuantity = (type === "withdrawal" || type === "transfer") ? Math.abs(numericAmount) : 0;
        const feeAmount = (type === "withdrawal" || type === "transfer") ? numericFee : 0;
  
        // Add non-trade transactions immediately to processedData
        addTransaction(formattedDate, receivedQuantity, currency, sentQuantity, currency, feeAmount, currency, txid, tag);
      }
    }
  
    // Add trade transactions in the correct chronological order
    const tradeKeys = Object.keys(trades).sort((a, b) => new Date(trades[a].time) - new Date(trades[b].time));
    tradeKeys.forEach(key => {
      const trade = trades[key];
      addTransaction(trade.time, trade.received.quantity || 0, trade.received.currency, trade.sent.quantity || 0, trade.sent.currency, trade.fee, trade.sent.currency, trade.txids.join(''), trade.tag);
    });
  
    // Output the processed data to a new sheet
    const outputSheet = ss.insertSheet("AwakenFormattedData");
    outputSheet.getRange(1, 1, processedData.length, processedData[0].length).setValues(processedData);
  }
  
  // Helper function to format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "MM/dd/yyyy HH:mm:ss");
  }
  