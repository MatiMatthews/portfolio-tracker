// @ts-nocheck
'use client';

import { useState } from 'react';
import { getCurrentPrice } from '@/lib/telegramAlerts';

interface Stock {
  ticker: string;
  averageBuyPrice: number;
  repurchasePrice: number;
  sellPrice: number;
  stopLossPrice: number;
  currentPrice?: number;
  currentReturn?: number;
}

export default function Home() {
  const [formData, setFormData] = useState<Stock>({
    ticker: '',
    averageBuyPrice: 0,
    repurchasePrice: 0,
    sellPrice: 0,
    stopLossPrice: 0,
  });
  const [stocks, setStocks] = useState<Stock[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'ticker' ? value : Number(value) });
  };

  const handleAddStock = async () => {
    if (
      !formData.ticker ||
      formData.averageBuyPrice <= 0 ||
      formData.repurchasePrice <= 0 ||
      formData.sellPrice <= 0 ||
      formData.stopLossPrice <= 0
    ) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    try {
      const currentPrice = await getCurrentPrice(formData.ticker);
      const currentReturn = ((currentPrice - formData.averageBuyPrice) / formData.averageBuyPrice) * 100;

      setStocks([
        ...stocks,
        { ...formData, currentPrice, currentReturn },
      ]);

      setFormData({
        ticker: '',
        averageBuyPrice: 0,
        repurchasePrice: 0,
        sellPrice: 0,
        stopLossPrice: 0,
      });
    } catch (error) {
      alert('Error al obtener el precio actual. Por favor verifica el ticker.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black flex flex-col items-center p-8 space-y-6">
      <h1 className="text-3xl font-bold">Portfolio Tracker</h1>

      <div className="w-full max-w-md space-y-4">
        <input
          type="text"
          name="ticker"
          value={formData.ticker}
          onChange={handleInputChange}
          placeholder="Ticker (ej: NVDA)"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="averageBuyPrice"
          value={formData.averageBuyPrice}
          onChange={handleInputChange}
          placeholder="Precio promedio de compra"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="repurchasePrice"
          value={formData.repurchasePrice}
          onChange={handleInputChange}
          placeholder="Precio de recompra"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="sellPrice"
          value={formData.sellPrice}
          onChange={handleInputChange}
          placeholder="Precio de venta con ganancia"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="stopLossPrice"
          value={formData.stopLossPrice}
          onChange={handleInputChange}
          placeholder="Precio de stop loss"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleAddStock}
          disabled={
            !formData.ticker ||
            formData.averageBuyPrice <= 0 ||
            formData.repurchasePrice <= 0 ||
            formData.sellPrice <= 0 ||
            formData.stopLossPrice <= 0
          }
          className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-400"
        >
          Agregar acción
        </button>
      </div>

      <div className="w-full max-w-xl mt-6">
        <h2 className="text-xl font-semibold mb-4">Acciones Ingresadas</h2>
        <ul className="space-y-4">
          {stocks.map((stock, idx) => (
            <li key={idx} className="p-4 border rounded bg-white">
              <p><strong>{stock.ticker.toUpperCase()}</strong></p>
              <p>Precio promedio de compra: ${stock.averageBuyPrice}</p>
              <p>Precio actual: ${stock.currentPrice}</p>
              <p>Rentabilidad actual: {stock.currentReturn?.toFixed(2)}%</p>
              <p>Precio de recompra: ${stock.repurchasePrice}</p>
              <p>Precio de venta con ganancia: ${stock.sellPrice}</p>
              <p>Precio de stop loss: ${stock.stopLossPrice}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
