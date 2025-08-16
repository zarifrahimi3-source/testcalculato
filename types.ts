export enum TradeType {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export enum CalculatorType {
  FUTURES = 'FUTURES',
  SPOT = 'SPOT',
}

export interface TargetProfit {
    profit: number;
}

export interface CalculationResult {
  positionSize: number;
  totalPotentialProfit: number;
  riskRewardRatio: number;
  totalPositionValue: number;
  targetProfits: (TargetProfit | null)[];
  averageEntryPrice?: number;
}