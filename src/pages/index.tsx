import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import db from '../services/firebase';
import yahooFinance from 'yahoo-finance2';

type Stock = {
  ticker: string;
  quantity: number;
  averageBuyPrice: number;
  targetEntry: number;
  targetExit: number;
  currentPrice?: number;
};

const HomePage = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [formData, setFormData] = useState<Stock>({
    ticker: '',
    quantity: 0,
    averageBuyPrice: 0,
    targetEntry: 0,
    targetExit: 0,
  });
  const [loadingPrices, setLoadingPrices] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'quantity' || name === 'averageBuyPrice' || name === 'targetEntry' || name === 'targetExit' ? parseFloat(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'portfolio'), formData);
      fetchStocks();
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };

  const fetchStocks = async () => {
    const querySnapshot = await getDocs(collection(db, 'portfolio'));
    const stocksData: Stock[] = querySnapshot.docs.map(doc => doc.data() as Stock);
    setStocks(stocksData);
  };

  const fetchStockPrices = async () => {
    setLoadingPrices(true);
    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const quote = await yahooFinance.quote(stock.ticker);
            return { ...stock, currentPrice: quote.regularMarketPrice };
          } catch (error) {
            console.error(`Error fetching price for ticker ${stock.ticker}:`, error);
            return { ...stock, currentPrice: null };
          }
        })
      );
      setStocks(updatedStocks);
    } catch (error) {
      console.error('Error fetching stock prices:', error);
    } finally {
      setLoadingPrices(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchStockPrices, 60000);
    fetchStockPrices();
    return () => clearInterval(interval);
  }, [stocks]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Portfolio Tracker</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ticker" className="block text-sm font-medium text-gray-700">
              Stock Ticker
            </label>
            <input
              type="text"
              id="ticker"
              name="ticker"
              value={formData.ticker}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="averageBuyPrice" className="block text-sm font-medium text-gray-700">
              Average Buy Price
            </label>
            <input
              type="number"
              id="averageBuyPrice"
              name="averageBuyPrice"
              value={formData.averageBuyPrice}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="targetEntry" className="block text-sm font-medium text-gray-700">
              Target Entry Price
            </label>
            <input
              type="number"
              id="targetEntry"
              name="targetEntry"
              value={formData.targetEntry}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="targetExit" className="block text-sm font-medium text-gray-700">
              Target Exit Price
            </label>
            <input
              type="number"
              id="targetExit"
              name="targetExit"
              value={formData.targetExit}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </form>
      </div>
      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Saved Portfolio</h2>
        {loadingPrices && <p className="text-gray-500">Loading prices...</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stocks.map((stock, index) => {
            const returnPercentage = stock.currentPrice && stock.averageBuyPrice
              ? ((stock.currentPrice - stock.averageBuyPrice) / stock.averageBuyPrice) * 100
              : 0;

            const returnClass = returnPercentage > 0
              ? 'text-green-500'
              : returnPercentage < 0
              ? 'text-red-500'
              : 'text-gray-500';

            return (
              <div key={index} className="bg-gray-200 p-4 rounded-md shadow-md">
                <p><strong>Ticker:</strong> {stock.ticker}</p>
                <p><strong>Quantity:</strong> {stock.quantity}</p>
                <p><strong>Average Buy Price:</strong> {stock.averageBuyPrice}</p>
                <p><strong>Target Entry:</strong> {stock.targetEntry}</p>
                <p><strong>Target Exit:</strong> {stock.targetExit}</p>
                <p><strong>Current Price:</strong> {stock.currentPrice ? `$${stock.currentPrice}` : 'N/A'}</p>
                <p><strong>Return:</strong> <span className={returnClass}>{returnPercentage.toFixed(2)}%</span></p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
