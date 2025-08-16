import React, { useState, useEffect, useCallback } from 'react';
import { TradeType, CalculationResult, TargetProfit, CalculatorType } from './types';
import InputGroup from './components/InputGroup';
import ResultDisplay from './components/ResultDisplay';
import TradeTypeToggle from './components/TradeTypeToggle';
import CalculatorTypeToggle from './components/CalculatorTypeToggle';
import { CalculatorIcon, CashIcon, ChartBarIcon, TrendingUpIcon } from './components/Icons';
import Settings from './components/Settings';

type Theme = 'light' | 'dark';

const Checkbox: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer" onClick={() => onChange(!checked)}>
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${checked ? 'bg-blue-500 border-blue-500' : 'bg-slate-300 dark:bg-gray-700 border-slate-400 dark:border-gray-600'}`}>
            {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className="text-sm font-medium text-slate-600 dark:text-gray-300">{label}</span>
    </label>
);


const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [calculatorType, setCalculatorType] = useState<CalculatorType>(CalculatorType.FUTURES);
  const [tradeType, setTradeType] = useState<TradeType>(TradeType.LONG);
  
  // Futures state
  const [entryPrice, setEntryPrice] = useState<string>('');

  // Spot state
  const [spotEntryPrice1, setSpotEntryPrice1] = useState<string>('');
  const [spotAlloc1, setSpotAlloc1] = useState<string>('100');
  const [isSpotEntry2Enabled, setIsSpotEntry2Enabled] = useState(false);
  const [spotEntryPrice2, setSpotEntryPrice2] = useState<string>('');
  const [spotAlloc2, setSpotAlloc2] = useState<string>('');
  const [isSpotEntry3Enabled, setIsSpotEntry3Enabled] = useState(false);
  const [spotEntryPrice3, setSpotEntryPrice3] = useState<string>('');
  const [spotAlloc3, setSpotAlloc3] = useState<string>('');

  // Shared state
  const [stopLoss, setStopLoss] = useState<string>('');
  const [riskAmount, setRiskAmount] = useState<string>('10');
  
  const [targetPrice1, setTargetPrice1] = useState<string>('');
  const [targetPrice2, setTargetPrice2] = useState<string>('');
  const [targetPrice3, setTargetPrice3] = useState<string>('');

  const [exitPercent1, setExitPercent1] = useState<string>('100');
  const [exitPercent2, setExitPercent2] = useState<string>('');
  const [exitPercent3, setExitPercent3] = useState<string>('');

  const [isTarget2Enabled, setIsTarget2Enabled] = useState(false);
  const [isTarget3Enabled, setIsTarget3Enabled] = useState(false);

  const [results, setResults] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const parseFormattedValue = (value: string): string => {
    return value ? value.replace(/,/g, '') : '';
  };
  
  const createInputHandler = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const sanitizedValue = value.replace(/,/g, '');

        if (sanitizedValue === '' || /^\d*\.?\d*$/.test(sanitizedValue)) {
            const parts = sanitizedValue.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            setter(parts.join('.'));
        }
    };
  };

  const createPercentageInputHandler = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const sanitizedValue = value.replace(/,/g, '');

        if (sanitizedValue === '' || /^\d*\.?\d*$/.test(sanitizedValue)) {
            const numericValue = parseFloat(sanitizedValue);
            if (!isNaN(numericValue) && numericValue > 100) {
                setter('100');
            } else {
                setter(sanitizedValue);
            }
        }
    };
  };
  
  useEffect(() => {
    if (!isTarget2Enabled) {
      setTargetPrice2('');
      setExitPercent2('');
    }
  }, [isTarget2Enabled]);

  useEffect(() => {
    if (!isTarget3Enabled) {
      setTargetPrice3('');
      setExitPercent3('');
    }
  }, [isTarget3Enabled]);

  useEffect(() => {
    if (!isTarget2Enabled && !isTarget3Enabled) {
      setExitPercent1('100');
    }
  }, [isTarget2Enabled, isTarget3Enabled]);

  useEffect(() => {
    if (!isSpotEntry2Enabled) {
      setSpotEntryPrice2('');
      setSpotAlloc2('');
    }
  }, [isSpotEntry2Enabled]);

  useEffect(() => {
    if (!isSpotEntry3Enabled) {
      setSpotEntryPrice3('');
      setSpotAlloc3('');
    }
  }, [isSpotEntry3Enabled]);
  
  useEffect(() => {
    if (!isSpotEntry2Enabled && !isSpotEntry3Enabled) {
      setSpotAlloc1('100');
    }
  }, [isSpotEntry2Enabled, isSpotEntry3Enabled]);

  const calculatePosition = useCallback(() => {
    const stop = parseFloat(parseFormattedValue(stopLoss));
    const risk = parseFloat(parseFormattedValue(riskAmount));

    const targets = [
      { price: parseFloat(parseFormattedValue(targetPrice1)), exit: parseFloat(parseFormattedValue(exitPercent1)), enabled: true },
      { price: parseFloat(parseFormattedValue(targetPrice2)), exit: parseFloat(parseFormattedValue(exitPercent2)), enabled: isTarget2Enabled },
      { price: parseFloat(parseFormattedValue(targetPrice3)), exit: parseFloat(parseFormattedValue(exitPercent3)), enabled: isTarget3Enabled },
    ];
    
    const activeTargets = targets.filter(t => t.enabled && !isNaN(t.price) && t.price > 0 && !isNaN(t.exit) && t.exit > 0);

    let validationError: string | null = null;
    const totalExitPercent = activeTargets.reduce((sum, t) => sum + (isNaN(t.exit) ? 0 : t.exit), 0);
    if (totalExitPercent > 100.001) { // Use small tolerance for float issues
      validationError = "Total exit percentage for active targets cannot exceed 100%.";
    }
    
    if (validationError) {
      setError(validationError);
      setResults(null);
      return;
    }

    if (calculatorType === CalculatorType.FUTURES) {
      const entry = parseFloat(parseFormattedValue(entryPrice));
      if (isNaN(entry) || isNaN(stop) || isNaN(risk) || entry <= 0 || stop <= 0 || risk <= 0) {
        setResults(null);
        setError(null);
        return;
      }

      if (tradeType === TradeType.LONG) {
        if (entry <= stop) validationError = "For a Long trade, entry price must be above stop loss.";
        else activeTargets.forEach((target) => {
          if (target.price <= entry && !validationError) {
            const originalIndex = targets.findIndex(origT => origT === target);
            validationError = `Target ${originalIndex + 1} must be above Entry Price.`;
          }
        });
      } else { // SHORT
        if (entry >= stop) validationError = "For a Short trade, entry price must be below stop loss.";
        else activeTargets.forEach((target) => {
          if (target.price >= entry && !validationError) {
            const originalIndex = targets.findIndex(origT => origT === target);
            validationError = `Target ${originalIndex + 1} must be below Entry Price.`;
          }
        });
      }

      if (validationError) {
        setError(validationError);
        setResults(null);
        return;
      }
      
      setError(null);

      const riskPerUnit = Math.abs(entry - stop);
      if (riskPerUnit <= 0) { setResults(null); return; }
      
      const positionSize = risk / riskPerUnit;
      const totalPositionValue = positionSize * entry;
      let totalPotentialProfit = 0;
      const targetProfits: (TargetProfit | null)[] = [null, null, null];

      targets.forEach((target, index) => {
          if (target.enabled && !isNaN(target.price) && target.price > 0 && !isNaN(target.exit) && target.exit > 0) {
              const rewardPerUnit = Math.abs(target.price - entry);
              const profit = positionSize * (target.exit / 100) * rewardPerUnit;
              totalPotentialProfit += profit;
              targetProfits[index] = { profit };
          }
      });
      if (totalPotentialProfit <= 0) { setResults(null); return; }
      const riskRewardRatio = totalPotentialProfit / risk;

      setResults({ positionSize, totalPotentialProfit, riskRewardRatio, totalPositionValue, targetProfits });

    } else { // SPOT calculation
      
      const spotEntries = [
        { price: parseFloat(parseFormattedValue(spotEntryPrice1)), alloc: parseFloat(parseFormattedValue(spotAlloc1)), enabled: true },
        { price: parseFloat(parseFormattedValue(spotEntryPrice2)), alloc: parseFloat(parseFormattedValue(spotAlloc2)), enabled: isSpotEntry2Enabled },
        { price: parseFloat(parseFormattedValue(spotEntryPrice3)), alloc: parseFloat(parseFormattedValue(spotAlloc3)), enabled: isSpotEntry3Enabled },
      ];

      const activeEntries = spotEntries.filter(e => e.enabled && !isNaN(e.price) && e.price > 0 && !isNaN(e.alloc) && e.alloc > 0);
      
      if (activeEntries.length === 0 || isNaN(stop) || isNaN(risk) || stop <= 0 || risk <= 0) {
        setResults(null);
        setError(null);
        return;
      }

      const totalAlloc = activeEntries.reduce((sum, e) => sum + e.alloc, 0);
      if (Math.abs(totalAlloc - 100) > 0.001) {
        validationError = "Total allocation for active entries must be 100%.";
      }

      let weightedPriceSum = 0;
      activeEntries.forEach(e => {
        if (e.price <= stop) validationError = "All entry prices must be above the stop loss.";
        weightedPriceSum += e.price * (e.alloc / 100);
      });

      const averageEntryPrice = weightedPriceSum;

      activeTargets.forEach((target) => {
        if (target.price <= averageEntryPrice && !validationError) {
          const originalIndex = targets.findIndex(origT => origT === target);
          validationError = `Target ${originalIndex + 1} must be above the average entry price.`;
        }
      });
      
      if (validationError) {
        setError(validationError);
        setResults(null);
        return;
      }
      
      setError(null);
      const riskPerUnit = Math.abs(averageEntryPrice - stop);
      if (riskPerUnit <= 0) { setResults(null); return; }

      const positionSize = risk / riskPerUnit;
      const totalPositionValue = positionSize * averageEntryPrice;
      let totalPotentialProfit = 0;
      const targetProfits: (TargetProfit | null)[] = [null, null, null];

      targets.forEach((target, index) => {
          if (target.enabled && !isNaN(target.price) && target.price > 0 && !isNaN(target.exit) && target.exit > 0) {
              const rewardPerUnit = Math.abs(target.price - averageEntryPrice);
              const profit = positionSize * (target.exit / 100) * rewardPerUnit;
              totalPotentialProfit += profit;
              targetProfits[index] = { profit };
          }
      });
      
      if (totalPotentialProfit <= 0) { setResults(null); return; }
      const riskRewardRatio = totalPotentialProfit / risk;

      setResults({ positionSize, totalPotentialProfit, riskRewardRatio, totalPositionValue, targetProfits, averageEntryPrice });
    }

  }, [
    entryPrice, stopLoss, riskAmount, tradeType, targetPrice1, targetPrice2, targetPrice3, exitPercent1, exitPercent2, exitPercent3, calculatorType,
    spotEntryPrice1, spotAlloc1, isSpotEntry2Enabled, spotEntryPrice2, spotAlloc2, isSpotEntry3Enabled, spotEntryPrice3, spotAlloc3,
    isTarget2Enabled, isTarget3Enabled
  ]);

  useEffect(() => {
    calculatePosition();
  }, [calculatePosition]);
  
  const handleCalculatorTypeChange = (type: CalculatorType) => {
    setCalculatorType(type);
    setError(null);
    setResults(null);
  }

  return (
    <div className="bg-gray-100 dark:bg-black min-h-screen text-slate-900 dark:text-gray-200 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Crypto Position Calculator</h1>
        <p className="text-slate-600 dark:text-gray-400 mt-2">Intelligent risk management for any trade</p>
      </div>
      <div className="relative w-full max-w-lg bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/20 dark:shadow-blue-500/10 border border-slate-300 dark:border-gray-800 overflow-hidden">
        <Settings theme={theme} setTheme={setTheme} />
        <div className="p-6 sm:p-8">
          <main>
            <div className="space-y-5">
              <CalculatorTypeToggle calculatorType={calculatorType} setCalculatorType={handleCalculatorTypeChange} />
              
              {calculatorType === CalculatorType.FUTURES && <TradeTypeToggle tradeType={tradeType} setTradeType={setTradeType} />}
              
              <InputGroup label="Risk Amount (USD)" value={riskAmount} onChange={createInputHandler(setRiskAmount)} placeholder="e.g., 10" symbol="$" symbolPosition="left"/>

              {calculatorType === CalculatorType.FUTURES ? (
                <InputGroup label="Entry Price" value={entryPrice} onChange={createInputHandler(setEntryPrice)} placeholder="Price to enter the trade" symbol="$" symbolPosition="left"/>
              ) : (
                <div className="space-y-4 pt-2">
                  <h3 className="text-base font-semibold text-center text-slate-700 dark:text-gray-200">Entry Points</h3>
                  <div className="grid grid-cols-5 gap-3 items-end">
                    <div className="col-span-3"><InputGroup label="Entry 1 Price" value={spotEntryPrice1} onChange={createInputHandler(setSpotEntryPrice1)} placeholder="e.g., 40000" symbol="$" symbolPosition="left" /></div>
                    <div className="col-span-2"><InputGroup label="Allocation" value={spotAlloc1} onChange={createPercentageInputHandler(setSpotAlloc1)} placeholder="e.g., 100" symbol="%" symbolPosition="right" disabled={!isSpotEntry2Enabled && !isSpotEntry3Enabled} /></div>
                  </div>
                  <div className="grid grid-cols-5 gap-3 items-end">
                    <div className="col-span-3">
                      <Checkbox label="Entry 2" checked={isSpotEntry2Enabled} onChange={setIsSpotEntry2Enabled} />
                      {isSpotEntry2Enabled && <InputGroup label="" value={spotEntryPrice2} onChange={createInputHandler(setSpotEntryPrice2)} placeholder="Optional" symbol="$" symbolPosition="left" />}
                    </div>
                    <div className="col-span-2">
                      {isSpotEntry2Enabled && <InputGroup label="" value={spotAlloc2} onChange={createPercentageInputHandler(setSpotAlloc2)} placeholder="Optional" symbol="%" symbolPosition="right" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-3 items-end">
                    <div className="col-span-3">
                      <Checkbox label="Entry 3" checked={isSpotEntry3Enabled} onChange={setIsSpotEntry3Enabled} />
                      {isSpotEntry3Enabled && <InputGroup label="" value={spotEntryPrice3} onChange={createInputHandler(setSpotEntryPrice3)} placeholder="Optional" symbol="$" symbolPosition="left" />}
                    </div>
                    <div className="col-span-2">
                      {isSpotEntry3Enabled && <InputGroup label="" value={spotAlloc3} onChange={createPercentageInputHandler(setSpotAlloc3)} placeholder="Optional" symbol="%" symbolPosition="right" />}
                    </div>
                  </div>
                </div>
              )}
              
              <InputGroup label="Stop Loss" value={stopLoss} onChange={createInputHandler(setStopLoss)} placeholder="Price to exit at a loss" symbol="$" symbolPosition="left"/>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-300/50 dark:border-gray-700/50 space-y-4">
                <h3 className="text-lg font-semibold text-center text-slate-700 dark:text-gray-200">Take Profit Targets</h3>
                <div className="grid grid-cols-5 gap-3 items-end">
                    <div className="col-span-3"><InputGroup label="Target 1 Price" value={targetPrice1} onChange={createInputHandler(setTargetPrice1)} placeholder="e.g., 50000" symbol="$" symbolPosition="left" /></div>
                    <div className="col-span-2"><InputGroup label="Exit %" value={exitPercent1} onChange={createPercentageInputHandler(setExitPercent1)} placeholder="e.g., 50" symbol="%" symbolPosition="right" disabled={!isTarget2Enabled && !isTarget3Enabled} /></div>
                </div>
                <div className="grid grid-cols-5 gap-3 items-end">
                    <div className="col-span-3">
                        <Checkbox label="Target 2" checked={isTarget2Enabled} onChange={setIsTarget2Enabled} />
                        {isTarget2Enabled && <InputGroup label="" value={targetPrice2} onChange={createInputHandler(setTargetPrice2)} placeholder="Optional" symbol="$" symbolPosition="left" />}
                    </div>
                    <div className="col-span-2">
                        {isTarget2Enabled && <InputGroup label="" value={exitPercent2} onChange={createPercentageInputHandler(setExitPercent2)} placeholder="Optional" symbol="%" symbolPosition="right" />}
                    </div>
                </div>
                <div className="grid grid-cols-5 gap-3 items-end">
                    <div className="col-span-3">
                        <Checkbox label="Target 3" checked={isTarget3Enabled} onChange={setIsTarget3Enabled} />
                        {isTarget3Enabled && <InputGroup label="" value={targetPrice3} onChange={createInputHandler(setTargetPrice3)} placeholder="Optional" symbol="$" symbolPosition="left" />}
                    </div>
                    <div className="col-span-2">
                        {isTarget3Enabled && <InputGroup label="" value={exitPercent3} onChange={createPercentageInputHandler(setExitPercent3)} placeholder="Optional" symbol="%" symbolPosition="right" />}
                    </div>
                </div>
            </div>

            {error && <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-center text-sm">{error}</div>}
            
            <div className="mt-8 pt-6 border-t border-slate-300 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-center text-slate-700 dark:text-gray-200 mb-5">Calculation Results</h2>
              {results ? (
                <>
                  {results.averageEntryPrice && (
                    <div className="mb-4 bg-slate-200 dark:bg-gray-900/60 p-3 rounded-lg text-center">
                        <span className="text-sm text-slate-600 dark:text-gray-400">Average Entry Price: </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(results.averageEntryPrice)}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <ResultDisplay icon={<CalculatorIcon />} label="Position Size" value={new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(results.positionSize)} unit="Units" />
                    <ResultDisplay icon={<TrendingUpIcon />} label="Total Potential Profit" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(results.totalPotentialProfit)} valueClassName="text-green-600 dark:text-green-400"/>
                    <ResultDisplay icon={<CashIcon />} label="Total Position Value" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(results.totalPositionValue)} />
                    <ResultDisplay icon={<ChartBarIcon />} label="Risk/Reward Ratio" value={`1 : ${results.riskRewardRatio.toFixed(2)}`} />
                  </div>
                  {results.targetProfits.some(p => p !== null) && (
                    <div className="mt-6 pt-4 border-t border-slate-300/50 dark:border-gray-700/50">
                      <h3 className="text-lg font-semibold text-center text-slate-600 dark:text-gray-400 mb-3">Profit per Target</h3>
                      <div className="space-y-2">
                        {results.targetProfits.map((targetResult, index) => (
                          targetResult && (
                            <div key={index} className="flex justify-between items-center bg-slate-200 dark:bg-gray-900/60 p-3 rounded-lg text-sm">
                              <span className="text-slate-600 dark:text-gray-400">Profit at Target {index + 1}</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(targetResult.profit)}
                              </span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                 <div className="text-center text-slate-500 dark:text-gray-500 py-6"><p>Enter the values above to see the results.</p></div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;