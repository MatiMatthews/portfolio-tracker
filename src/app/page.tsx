"use client";

import { useState } from "react";

interface Stock {
  ticker: string;
  entry: number;
  exit: number;
  average: number;
}

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [average, setAverage] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);

  const addStock = () => {
    if (!ticker || !entry || !exit || !average) {
      alert("Por favor completa todos los campos");
      return;
    }

    const newStock: Stock = {
      ticker,
      entry: parseFloat(entry),
      exit: parseFloat(exit),
      average: parseFloat(average),
    };

    setStocks([...stocks, newStock]);

    // Reiniciar campos
    setTicker("");
    setEntry("");
    setExit("");
    setAverage("");
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Portfolio Tracker</h1>

      <div className="w-full max-w-md space-y-3">
        <input type="text" placeholder="Ticker (ej: NVDA)" className="w-full p-2 rounded bg-gray-800" value={ticker} onChange={(e) => setTicker(e.target.value)} />
        <input type="number" placeholder="Precio de entrada" className="w-full p-2 rounded bg-gray-800" value={entry} onChange={(e) => setEntry(e.target.value)} />
        <input type="number" placeholder="Precio de salida" className="w-full p-2 rounded bg-gray-800" value={exit} onChange={(e) => setExit(e.target.value)} />
        <input type="number" placeholder="Precio promedio de compra" className="w-full p-2 rounded bg-gray-800" value={average} onChange={(e) => setAverage(e.target.value)} />
        <button className="w-full bg-green-600 py-2 rounded" onClick={addStock}>Agregar acción</button>
      </div>

      <div className="w-full max-w-xl mt-6">
        <h2 className="text-xl mb-2">Acciones Ingresadas:</h2>
        <ul className="space-y-2">
          {stocks.map((stock, idx) => (
            <li key={idx} className="bg-gray-800 p-3 rounded">
              {stock.ticker.toUpperCase()}: Compra a ${stock.entry} | Venta a ${stock.exit} | Promedio: ${stock.average}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
