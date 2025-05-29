import yahooFinance from 'yahoo-finance2';
declare module 'node-telegram-bot-api';
import TelegramBot from 'node-telegram-bot-api';
import { collection, getDocs } from 'firebase/firestore';
import db from './firebase';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!botToken || !chatId) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env.local');
  throw new Error('Please provide TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local');
}

const bot = new TelegramBot(botToken, { polling: false });

let alertedTickers: Set<string> = new Set();

const sendTelegramAlert = async (message: string) => {
  try {
    await bot.sendMessage(chatId, message);
    console.log(`Alert sent: ${message}`);
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
};

const checkStockAlerts = async () => {
  console.log('Checking stock alerts...');
  try {
    const querySnapshot = await getDocs(collection(db, 'portfolio'));
    const stocks = querySnapshot.docs.map(doc => doc.data());

    for (const stock of stocks) {
      const { ticker, averageBuyPrice, targetEntry, targetExit } = stock;
      try {
        const quote = await yahooFinance.quote(ticker);
        const currentPrice = quote[0]?.regularMarketPrice;

        console.log(`Ticker: ${ticker}, Current Price: $${currentPrice}`);

        if (currentPrice <= targetEntry && !alertedTickers.has(`${ticker}-entry`)) {
          const returnPercentage = ((currentPrice - averageBuyPrice) / averageBuyPrice) * 100;
          const message = `🟢 Buy opportunity for ${ticker} at $${currentPrice}\nAverage Buy Price: $${averageBuyPrice}\nReturn: ${returnPercentage.toFixed(2)}%`;
          await sendTelegramAlert(message);
          alertedTickers.add(`${ticker}-entry`);
        }

        if (currentPrice >= targetExit && !alertedTickers.has(`${ticker}-exit`)) {
          const returnPercentage = ((currentPrice - averageBuyPrice) / averageBuyPrice) * 100;
          const message = `🔴 Sell alert for ${ticker} at $${currentPrice}\nAverage Buy Price: $${averageBuyPrice}\nReturn: ${returnPercentage.toFixed(2)}%`;
          await sendTelegramAlert(message);
          alertedTickers.add(`${ticker}-exit`);
        }
      } catch (error) {
        console.error(`Error fetching price for ${ticker}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking stock alerts:', error);
  }
};

setInterval(checkStockAlerts, 60000);
