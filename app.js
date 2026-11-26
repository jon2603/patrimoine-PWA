// Patrimoine dashboard logic
const storageKey = "patrimoine-private-bank-v3";
const priorStorageKey = "patrimoine-private-bank-v2";
const legacyKey = "patrimoine-dashboard-v1";
const apiKeyStorageKey = "patrimoine-finnhub-api-key-v3";
const tickerPausedStorageKey = "patrimoine-market-ticker-paused";
const recoveryStorageKey = "patrimoine-private-bank-v3-recovery";
const USD_AED_PEG = 3.6725;
const STRUCTURED_PRODUCT_DEFAULTS = [
  {
    id: "reverse-xs3507838061",
    isin: "XS3507838061",
    kind: "reverse",
    name: "Reverse Convertible — US Treasury 2050",
    bank: "Transatlantique",
    currency: "EUR",
    notional: 500000,
    currentValue: 500000,
    issueDate: "2026-10-05",
    maturityDate: "2027-10-05",
    finalFixingDate: "2027-09-28",
    underlying: "US Treasury 1.25% 15 May 2050",
    underlyingIsin: "US912810SN90",
    strike: 43.7525,
    couponRate: 0.667,
    couponAmount: 3335,
    couponType: "Guaranteed monthly",
    status: "active",
    processedCoupons: [],
    couponSchedule: ["2026-11-04", "2026-12-07", "2027-01-04", "2027-02-04", "2027-03-08", "2027-04-05", "2027-05-05", "2027-06-04", "2027-07-05", "2027-08-04", "2027-09-06", "2027-10-05"]
  },
  {
    id: "phoenix-xs3507850199",
    isin: "XS3507850199",
    kind: "phoenix",
    name: "Worst-of Memory Phoenix Autocall",
    bank: "Transatlantique",
    currency: "EUR",
    notional: 250000,
    currentValue: 250000,
    issueDate: "2026-10-07",
    maturityDate: "2027-10-07",
    finalFixingDate: "2027-09-30",
    couponRate: 1,
    couponAmount: 2500,
    couponType: "Conditional monthly with memory",
    couponBarrier: 70,
    protectionBarrier: 50,
    strikeLevel: 110,
    memoryCoupons: 0,
    status: "active",
    processedCoupons: [],
    underlyings: [
      { ticker: "SX7E", initial: 310.74 },
      { ticker: "SX5E", initial: 6269.02 },
      { ticker: "SPX", initial: 7651.54 },
      { ticker: "RTY", initial: 2796.865 },
      { ticker: "NKY", initial: 68956.72 }
    ],
    couponSchedule: [
      { observationDate: "2026-10-30", paymentDate: "2026-11-06", autocallLevel: null },
      { observationDate: "2026-11-30", paymentDate: "2026-12-07", autocallLevel: null },
      { observationDate: "2026-12-30", paymentDate: "2027-01-07", autocallLevel: 94 },
      { observationDate: "2027-02-01", paymentDate: "2027-02-08", autocallLevel: 92 },
      { observationDate: "2027-03-01", paymentDate: "2027-03-08", autocallLevel: 90 },
      { observationDate: "2027-03-30", paymentDate: "2027-04-06", autocallLevel: 88 },
      { observationDate: "2027-04-30", paymentDate: "2027-05-07", autocallLevel: 86 },
      { observationDate: "2027-06-01", paymentDate: "2027-06-08", autocallLevel: 84 },
      { observationDate: "2027-06-30", paymentDate: "2027-07-07", autocallLevel: 82 },
      { observationDate: "2027-07-30", paymentDate: "2027-08-06", autocallLevel: 80 },
      { observationDate: "2027-08-30", paymentDate: "2027-09-06", autocallLevel: 78 },
      { observationDate: "2027-09-30", paymentDate: "2027-10-07", autocallLevel: 76 }
    ]
  }
];
const defaultState = {
  schemaVersion: 3,
  apiKey: "",
  eurUsd: 1.087,
  refreshInterval: 0,
  weeklySnapshotDay: 5,
  lastWeeklySnapshotKey: "",
  lastDailyAutoSnapshotDate: "",
  lastWeeklyBackupKey: "",
  lastWeeklyBackupAt: "",
  lastDewsCreditMonth: "",
  lastUpdate: "",
  marketSettingsCollapsed: true,
  privacyMode: false,
  theme: "dark",
  dataSavedAt: "",
  dataLoadedAt: "",
  syncMeta: { version: 1, updatedAt: "", revision: 0, deviceId: "" },
  currentPage: "dashboard",
  dashboardCurrency: "EUR",
  bankViewMode: "table",
  bankCardCurrency: "EUR",
  intradayRange: "24h",
  wealthBridgeReferenceDate: "",
  history: [],
  monthlyCloses: [],
  intradaySnapshots: [],
  transactions: [],
  structuredSetupApplied: false,
  structuredProducts: structuredClone(STRUCTURED_PRODUCT_DEFAULTS),
  structuredAlertLog: [],
  forecastFlows: [],
  stocks: [
    { symbol: "AAPL", name: "Apple", bank: "Bank 1", portfolio: "Actions US", qty: 10, price: 210, previousClose: 208, cost: 175, currency: "USD" },
    { symbol: "MSFT", name: "Microsoft", bank: "Bank 1", portfolio: "Actions US", qty: 5, price: 430, previousClose: 425, cost: 360, currency: "USD" },
    { symbol: "NVDA", name: "Nvidia", bank: "Bank 2", portfolio: "Actions US", qty: 8, price: 120, previousClose: 118, cost: 95, currency: "USD" }
  ],
  bonds: [
    { name: "US Treasury 4.25% 2034", type: "Treasury US", bank: "Bank 1", issuer: "US Treasury", currency: "USD", nominal: 100000, cleanPrice: 101.25, costPrice: 99.5, couponRate: 4.25, frequency: 2, lastCoupon: "2026-05-15", nextCoupon: "2026-11-15", maturity: "2034-11-15", dayCount: "ACT/ACT" },
    { name: "Absolute Capital OTC", type: "Private OTC bond", bank: "Absolute Capital", issuer: "Private issuer", currency: "USD", nominal: 50000, cleanPrice: 98, costPrice: 100, couponRate: 8, frequency: 4, lastCoupon: "2026-06-30", nextCoupon: "2026-09-30", maturity: "2029-06-30", dayCount: "ACT/360" }
  ],
  argentinaBonds: [
    { isin: "XS2177365520", name: "Argentina EUR Step-Up 2046", bank: "Unallocated", currency: "EUR", originalNominal: 97000, currentNominal: 88181.82, couponRate: 4.125, cleanPrice: 73.56, priceDate: "", priceSource: "Manual", firstPayment: "2025-01-09", autoStartDate: "2027-01-09", maturity: "2046-07-09", totalPayments: 44, dayCount: "30/360", processedPayments: [] },
    { isin: "XS2200244072", name: "Argentina EUR 0.5% 2029", bank: "Unallocated", currency: "EUR", originalNominal: 1026, currentNominal: 615.6, couponRate: 0.5, cleanPrice: 42.5, priceDate: "", priceSource: "Manual", firstPayment: "2025-01-09", autoStartDate: "2027-01-09", maturity: "2029-07-09", totalPayments: 10, dayCount: "30/360", processedPayments: [] }
  ],
  cash: [
    { name: "Cash EUR", bank: "Bank 1", currency: "EUR", amount: 25000 },
    { name: "Liquidity USD", bank: "Bank 2", currency: "USD", amount: 15000 }
  ],
  privateAssets: [
    { name: "Private Equity Fund I", bank: "Bank 1", valueEur: 100000, commitmentEur: 150000, calledEur: 120000, valuationDate: "2026-06-30", note: "Update manually" }
  ],
  realEstate: [],
  divers: [
    { category: "Montre", name: "Montre collection", bank: "Coffre", currency: "EUR", qty: 1, unitPrice: 18000, note: "" },
    { category: "Bitcoin", name: "BTC", bank: "Wallet", currency: "EUR", qty: 0.2, unitPrice: 60000, note: "Prix manuel" },
    { category: "Assurance vie", name: "Assurance vie BNP", bank: "BNP", currency: "EUR", qty: 1, unitPrice: 45000, note: "" }
  ]
};

let initialStateLoadError = "";
let lastStorageError = "";
let state = loadState();
let timer = null;
let autoSnapshotTimer = null;
let weeklySnapshotTimer = null;
let weeklyBackupTimer = null;
let dailySnapshotTimer = null;
let pendingSellIndex = null;
let pendingBondSellIndex = null;
let pendingBondSellCollection = "bonds";
let pendingBondPayment = null;
let pendingTxnEditId = null;
let intradayChartHover = null;
let historyChartHover = null;
let activeMonthlyCloseId = "";
let connectedDataHandle = null;
let connectedDataFileName = "";
let connectedRemoteUpdatedAt = "";
let dataSyncState = "local";
let dataSyncMessage = "";
let dataSyncTimer = null;
let dataSyncWriting = false;
let dataSyncQueued = false;
let applyingRemoteData = false;
let backupDirectoryHandle = null;
let backupDirectoryName = "";
let backupState = "disconnected";
let backupMessage = "";
let marketTickerContentKey = "";
let marketTickerBaseHtml = "";
let structuredToastKey = "";
let activeModal = null;
const modalReturnFocus = new Map();
const expandedStockSymbols = new Set();
const expandedTransactionSymbols = new Set();
const expandedBanks = new Set();
const sortState = {};

const els = {
  pageEyebrow: document.getElementById("pageEyebrow"),
  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle"),
  apiKey: document.getElementById("apiKey"),
  eurUsd: document.getElementById("eurUsd"),
  refreshInterval: document.getElementById("refreshInterval"),
  weeklySnapshotDay: document.getElementById("weeklySnapshotDay"),
  lastUpdate: document.getElementById("lastUpdate"),
  marketSettingsPanel: document.getElementById("marketSettingsPanel"),
  marketSettingsToggle: document.getElementById("marketSettingsToggle"),
  statusLine: document.getElementById("statusLine"),
  globalSearch: document.getElementById("globalSearch"),
  globalSearchOptions: document.getElementById("globalSearchOptions"),
  dubaiClock: document.getElementById("dubaiClock"),
  marketTicker: document.getElementById("marketTicker"),
  marketTickerToggle: document.getElementById("marketTickerToggle"),
  marketTickerViewport: document.getElementById("marketTickerViewport"),
  marketTickerTrack: document.getElementById("marketTickerTrack"),
  sidebarPulse: document.getElementById("sidebarPulse"),
  sidebarTotal: document.getElementById("sidebarTotal"),
  sidebarAllocationMini: document.getElementById("sidebarAllocationMini"),
  sidebarAllocationText: document.getElementById("sidebarAllocationText"),
  dataStatus: document.getElementById("dataStatus"),
  backupStatus: document.getElementById("backupStatus"),
  connectBackupBtn: document.getElementById("connectBackupBtn"),
  backupNowBtn: document.getElementById("backupNowBtn"),
  importFile: document.getElementById("importFile"),
  executiveStrip: document.getElementById("executiveStrip"),
  dashboardHeroStat: document.getElementById("dashboardHeroStat"),
  dashboardCurrencyEur: document.getElementById("dashboardCurrencyEur"),
  dashboardCurrencyUsd: document.getElementById("dashboardCurrencyUsd"),
  themeLight: document.getElementById("themeLight"),
  themeDark: document.getElementById("themeDark"),
  totalWealth: document.getElementById("totalWealth"),
  totalContext: document.getElementById("totalContext"),
  heroLiquid: document.getElementById("heroLiquid"),
  heroLongTerm: document.getElementById("heroLongTerm"),
  heroGross: document.getElementById("heroGross"),
  heroDebt: document.getElementById("heroDebt"),
  executiveTotal: document.getElementById("executiveTotal"),
  executiveTotalNote: document.getElementById("executiveTotalNote"),
  executiveDailyPnl: document.getElementById("executiveDailyPnl"),
  executiveDailyPnlNote: document.getElementById("executiveDailyPnlNote"),
  executiveCash: document.getElementById("executiveCash"),
  executiveCashNote: document.getElementById("executiveCashNote"),
  executiveLastUpdate: document.getElementById("executiveLastUpdate"),
  privacyToggle: document.getElementById("privacyToggle"),
  dailyPnl: document.getElementById("dailyPnl"),
  dailyPnlPct: document.getElementById("dailyPnlPct"),
  stocksValue: document.getElementById("stocksValue"),
  stocksPnl: document.getElementById("stocksPnl"),
  bondsValue: document.getElementById("bondsValue"),
  bondsAccrued: document.getElementById("bondsAccrued"),
  structuredValue: document.getElementById("structuredValue"),
  structuredContext: document.getElementById("structuredContext"),
  cashValue: document.getElementById("cashValue"),
  cashContext: document.getElementById("cashContext"),
  peValue: document.getElementById("peValue"),
  peContext: document.getElementById("peContext"),
  realEstateValue: document.getElementById("realEstateValue"),
  realEstateContext: document.getElementById("realEstateContext"),
  diversValue: document.getElementById("diversValue"),
  diversContext: document.getElementById("diversContext"),
  allocationBars: document.getElementById("allocationBars"),
  allocationDonut: document.getElementById("allocationDonut"),
  allocationTotal: document.getElementById("allocationTotal"),
  dashboardTopStocksBody: document.getElementById("dashboardTopStocksBody"),
  dashboardTopStocksPnl: document.getElementById("dashboardTopStocksPnl"),
  dashboardTopStocksMove: document.getElementById("dashboardTopStocksMove"),
  dashboardStocksViewAll: document.getElementById("dashboardStocksViewAll"),
  dashboardBankBody: document.getElementById("dashboardBankBody"),
  dashboardBanksViewAll: document.getElementById("dashboardBanksViewAll"),
  fxUsdExposure: document.getElementById("fxUsdExposure"),
  fxUsdWeight: document.getElementById("fxUsdWeight"),
  fxEurExposure: document.getElementById("fxEurExposure"),
  fxEurWeight: document.getElementById("fxEurWeight"),
  fxDownImpact: document.getElementById("fxDownImpact"),
  fxUpImpact: document.getElementById("fxUpImpact"),
  wealthMonthlyPerformance: document.getElementById("wealthMonthlyPerformance"),
  wealthMonthlyPerformanceAmount: document.getElementById("wealthMonthlyPerformanceAmount"),
  wealthMonthlyPerformanceRef: document.getElementById("wealthMonthlyPerformanceRef"),
  wealthYearlyPerformance: document.getElementById("wealthYearlyPerformance"),
  wealthYearlyPerformanceAmount: document.getElementById("wealthYearlyPerformanceAmount"),
  wealthYearlyPerformanceRef: document.getElementById("wealthYearlyPerformanceRef"),
  economicPerformanceScope: document.getElementById("economicPerformanceScope"),
  economicMarketGain: document.getElementById("economicMarketGain"),
  economicMarketGainContext: document.getElementById("economicMarketGainContext"),
  economicIncome: document.getElementById("economicIncome"),
  economicIncomeContext: document.getElementById("economicIncomeContext"),
  economicInternalTransfers: document.getElementById("economicInternalTransfers"),
  economicInternalTransfersContext: document.getElementById("economicInternalTransfersContext"),
  economicTotalReturn: document.getElementById("economicTotalReturn"),
  economicPerformanceBars: document.getElementById("economicPerformanceBars"),
  economicPerformanceList: document.getElementById("economicPerformanceList"),
  economicPerformanceNote: document.getElementById("economicPerformanceNote"),
  intradayChart: document.getElementById("intradayChart"),
  intradayRange24h: document.getElementById("intradayRange24h"),
  intradayRange7d: document.getElementById("intradayRange7d"),
  intradaySnapshotStatus: document.getElementById("intradaySnapshotStatus"),
  intradaySnapshotNote: document.getElementById("intradaySnapshotNote"),
  wealthBridgePeriod: document.getElementById("wealthBridgePeriod"),
  wealthBridgeReferenceDate: document.getElementById("wealthBridgeReferenceDate"),
  wealthBridgeBody: document.getElementById("wealthBridgeBody"),
  wealthBridgeNote: document.getElementById("wealthBridgeNote"),
  stocksBody: document.getElementById("stocksBody"),
  stockExposureBody: document.getElementById("stockExposureBody"),
  stocksPageValue: document.getElementById("stocksPageValue"),
  stocksPageDayPnl: document.getElementById("stocksPageDayPnl"),
  stocksPageDayPct: document.getElementById("stocksPageDayPct"),
  stocksPageTotalPnl: document.getElementById("stocksPageTotalPnl"),
  stocksPageRealizedPnl: document.getElementById("stocksPageRealizedPnl"),
  stocksPageRealizedContext: document.getElementById("stocksPageRealizedContext"),
  bondsBody: document.getElementById("bondsBody"),
  bondAnalyticsBody: document.getElementById("bondAnalyticsBody"),
  argentinaBondsBody: document.getElementById("argentinaBondsBody"),
  argentinaBondNotice: document.getElementById("argentinaBondNotice"),
  bondCompositionChart: document.getElementById("bondCompositionChart"),
  bondChartNote: document.getElementById("bondChartNote"),
  bondsPageValue: document.getElementById("bondsPageValue"),
  bondsPageAccrued: document.getElementById("bondsPageAccrued"),
  bondsPagePnl: document.getElementById("bondsPagePnl"),
  bondsPageCoupon: document.getElementById("bondsPageCoupon"),
  bondsPageYield: document.getElementById("bondsPageYield"),
  bondReturnScope: document.getElementById("bondReturnScope"),
  bondCouponsEarned: document.getElementById("bondCouponsEarned"),
  bondCouponsReceived: document.getElementById("bondCouponsReceived"),
  bondTreasuryPnl: document.getElementById("bondTreasuryPnl"),
  bondTotalReturnValue: document.getElementById("bondTotalReturnValue"),
  bondReturnCards: document.getElementById("bondReturnCards"),
  bondReturnBars: document.getElementById("bondReturnBars"),
  bondIncomeList: document.getElementById("bondIncomeList"),
  bondReturnNote: document.getElementById("bondReturnNote"),
  structuredDueAlert: document.getElementById("structuredDueAlert"),
  structuredDueTitle: document.getElementById("structuredDueTitle"),
  structuredDueText: document.getElementById("structuredDueText"),
  structuredDueOpen: document.getElementById("structuredDueOpen"),
  structuredPageValue: document.getElementById("structuredPageValue"),
  structuredCouponsPaid: document.getElementById("structuredCouponsPaid"),
  structuredCouponsPaidContext: document.getElementById("structuredCouponsPaidContext"),
  structuredNextPayment: document.getElementById("structuredNextPayment"),
  structuredNextPaymentContext: document.getElementById("structuredNextPaymentContext"),
  structuredActiveCount: document.getElementById("structuredActiveCount"),
  structuredProductCards: document.getElementById("structuredProductCards"),
  structuredCouponBody: document.getElementById("structuredCouponBody"),
  structuredFundingNote: document.getElementById("structuredFundingNote"),
  structuredToast: document.getElementById("structuredToast"),
  structuredToastTitle: document.getElementById("structuredToastTitle"),
  structuredToastText: document.getElementById("structuredToastText"),
  structuredToastDismiss: document.getElementById("structuredToastDismiss"),
  structuredToastOpen: document.getElementById("structuredToastOpen"),
  privateBody: document.getElementById("privateBody"),
  privatePageValue: document.getElementById("privatePageValue"),
  privatePageCommitment: document.getElementById("privatePageCommitment"),
  privatePageCommitmentContext: document.getElementById("privatePageCommitmentContext"),
  privatePageCalled: document.getElementById("privatePageCalled"),
  privatePageCalledContext: document.getElementById("privatePageCalledContext"),
  privatePageLargest: document.getElementById("privatePageLargest"),
  privatePageLargestContext: document.getElementById("privatePageLargestContext"),
  realEstateBody: document.getElementById("realEstateBody"),
  realEstatePageNet: document.getElementById("realEstatePageNet"),
  realEstatePageDebt: document.getElementById("realEstatePageDebt"),
  realEstatePageDebtContext: document.getElementById("realEstatePageDebtContext"),
  realEstatePageRent: document.getElementById("realEstatePageRent"),
  realEstatePageRentContext: document.getElementById("realEstatePageRentContext"),
  realEstatePageYield: document.getElementById("realEstatePageYield"),
  realEstatePageYieldContext: document.getElementById("realEstatePageYieldContext"),
  cashBody: document.getElementById("cashBody"),
  cashPageTotal: document.getElementById("cashPageTotal"),
  cashPageEur: document.getElementById("cashPageEur"),
  cashPageEurContext: document.getElementById("cashPageEurContext"),
  cashPageUsd: document.getElementById("cashPageUsd"),
  cashPageUsdContext: document.getElementById("cashPageUsdContext"),
  cashPageTopBank: document.getElementById("cashPageTopBank"),
  cashPageTopBankContext: document.getElementById("cashPageTopBankContext"),
  cashBankChart: document.getElementById("cashBankChart"),
  cashBridgeScope: document.getElementById("cashBridgeScope"),
  cashBridgeOpening: document.getElementById("cashBridgeOpening"),
  cashBridgeCurrent: document.getElementById("cashBridgeCurrent"),
  cashBridgeIncome: document.getElementById("cashBridgeIncome"),
  cashBridgeChange: document.getElementById("cashBridgeChange"),
  cashBridgeChart: document.getElementById("cashBridgeChart"),
  cashBridgeList: document.getElementById("cashBridgeList"),
  cashBridgeNote: document.getElementById("cashBridgeNote"),
  diversBody: document.getElementById("diversBody"),
  diversPageValue: document.getElementById("diversPageValue"),
  diversPageLargest: document.getElementById("diversPageLargest"),
  diversPageLargestContext: document.getElementById("diversPageLargestContext"),
  diversPageCategories: document.getElementById("diversPageCategories"),
  diversPageCategoriesContext: document.getElementById("diversPageCategoriesContext"),
  diversPageUsd: document.getElementById("diversPageUsd"),
  diversPageUsdContext: document.getElementById("diversPageUsdContext"),
  banksBody: document.getElementById("banksBody"),
  bankChart: document.getElementById("bankChart"),
  bankTableWrap: document.getElementById("bankTableWrap"),
  bankCardGrid: document.getElementById("bankCardGrid"),
  bankTableViewBtn: document.getElementById("bankTableViewBtn"),
  bankCardViewBtn: document.getElementById("bankCardViewBtn"),
  bankCardCurrencyToggle: document.getElementById("bankCardCurrencyToggle"),
  bankCardCurrencyEur: document.getElementById("bankCardCurrencyEur"),
  bankCardCurrencyUsd: document.getElementById("bankCardCurrencyUsd"),
  monthlyTotalChange: document.getElementById("monthlyTotalChange"),
  monthlyTotalChangeNote: document.getElementById("monthlyTotalChangeNote"),
  monthlyIncomeSavings: document.getElementById("monthlyIncomeSavings"),
  monthlyInvestmentResult: document.getElementById("monthlyInvestmentResult"),
  monthlyInferredExpenses: document.getElementById("monthlyInferredExpenses"),
  monthlyExpenseCoverage: document.getElementById("monthlyExpenseCoverage"),
  monthlyCloseDate: document.getElementById("monthlyCloseDate"),
  monthlySalaryAmount: document.getElementById("monthlySalaryAmount"),
  monthlySalaryCurrency: document.getElementById("monthlySalaryCurrency"),
  monthlyBonusAmount: document.getElementById("monthlyBonusAmount"),
  monthlyBonusCurrency: document.getElementById("monthlyBonusCurrency"),
  monthlyOtherIncomeAmount: document.getElementById("monthlyOtherIncomeAmount"),
  monthlyOtherIncomeCurrency: document.getElementById("monthlyOtherIncomeCurrency"),
  monthlyCashAdjustmentAmount: document.getElementById("monthlyCashAdjustmentAmount"),
  monthlyCashAdjustmentCurrency: document.getElementById("monthlyCashAdjustmentCurrency"),
  monthlyCloseNote: document.getElementById("monthlyCloseNote"),
  monthlyCloseStatus: document.getElementById("monthlyCloseStatus"),
  monthlyClosePreview: document.getElementById("monthlyClosePreview"),
  createMonthlyCloseBtn: document.getElementById("createMonthlyCloseBtn"),
  monthlyReviewScope: document.getElementById("monthlyReviewScope"),
  monthlyBridgeTotal: document.getElementById("monthlyBridgeTotal"),
  monthlyBaselineMessage: document.getElementById("monthlyBaselineMessage"),
  monthlyReviewContent: document.getElementById("monthlyReviewContent"),
  monthlyWealthBridge: document.getElementById("monthlyWealthBridge"),
  monthlyAttributionList: document.getElementById("monthlyAttributionList"),
  monthlyCashChange: document.getElementById("monthlyCashChange"),
  monthlyCashBridge: document.getElementById("monthlyCashBridge"),
  monthlyCashByBank: document.getElementById("monthlyCashByBank"),
  monthlyExpenseForm: document.getElementById("monthlyExpenseForm"),
  monthlyExpenseCategory: document.getElementById("monthlyExpenseCategory"),
  monthlyExpenseLabel: document.getElementById("monthlyExpenseLabel"),
  monthlyExpenseAmount: document.getElementById("monthlyExpenseAmount"),
  monthlyExpenseCurrency: document.getElementById("monthlyExpenseCurrency"),
  monthlyExpenseRemaining: document.getElementById("monthlyExpenseRemaining"),
  monthlyExpenseSummary: document.getElementById("monthlyExpenseSummary"),
  monthlyExpenseMeter: document.getElementById("monthlyExpenseMeter"),
  monthlyExpenseRows: document.getElementById("monthlyExpenseRows"),
  monthlyCloseBody: document.getElementById("monthlyCloseBody"),
  historyChart: document.getElementById("historyChart"),
  historyBody: document.getElementById("historyBody"),
  historyLastTotal: document.getElementById("historyLastTotal"),
  historyLastDate: document.getElementById("historyLastDate"),
  historyLastChange: document.getElementById("historyLastChange"),
  historyLastChangePct: document.getElementById("historyLastChangePct"),
  historyCount: document.getElementById("historyCount"),
  transactionsBody: document.getElementById("transactionsBody"),
  bondTransactionsBody: document.getElementById("bondTransactionsBody"),
  cashTransactionsBody: document.getElementById("cashTransactionsBody"),
  journalBody: document.getElementById("journalBody"),
  journalCount: document.getElementById("journalCount"),
  journalCountContext: document.getElementById("journalCountContext"),
  journalCashImpact: document.getElementById("journalCashImpact"),
  journalRealizedPnl: document.getElementById("journalRealizedPnl"),
  journalLatest: document.getElementById("journalLatest"),
  journalLatestContext: document.getElementById("journalLatestContext"),
  journalSearch: document.getElementById("journalSearch"),
  journalTypeFilter: document.getElementById("journalTypeFilter"),
  journalBankFilter: document.getElementById("journalBankFilter"),
  journalCurrencyFilter: document.getElementById("journalCurrencyFilter"),
  journalAssetFilter: document.getElementById("journalAssetFilter"),
  journalFromDate: document.getElementById("journalFromDate"),
  journalToDate: document.getElementById("journalToDate"),
  forecastBody: document.getElementById("forecastBody"),
  forecastQuarterBody: document.getElementById("forecastQuarterBody"),
  forecastNextQuarter: document.getElementById("forecastNextQuarter"),
  forecastInflows: document.getElementById("forecastInflows"),
  forecastInflowsContext: document.getElementById("forecastInflowsContext"),
  forecastOutflows: document.getElementById("forecastOutflows"),
  forecastOutflowsContext: document.getElementById("forecastOutflowsContext"),
  forecastNet: document.getElementById("forecastNet"),
  forecastInflowsBody: document.getElementById("forecastInflowsBody"),
  forecastOutflowsBody: document.getElementById("forecastOutflowsBody"),
  forecastInflowsTableTotal: document.getElementById("forecastInflowsTableTotal"),
  forecastOutflowsTableTotal: document.getElementById("forecastOutflowsTableTotal"),
  kpiModal: document.getElementById("kpiModal"),
  kpiModalEyebrow: document.getElementById("kpiModalEyebrow"),
  kpiModalTitle: document.getElementById("kpiModalTitle"),
  kpiModalSubtitle: document.getElementById("kpiModalSubtitle"),
  kpiModalSummary: document.getElementById("kpiModalSummary"),
  kpiModalHead: document.getElementById("kpiModalHead"),
  kpiModalBody: document.getElementById("kpiModalBody"),
  kpiModalFoot: document.getElementById("kpiModalFoot"),
  kpiModalClose: document.getElementById("kpiModalClose"),
  dewsCreditModal: document.getElementById("dewsCreditModal"),
  dewsCreditModalSummary: document.getElementById("dewsCreditModalSummary"),
  dewsCreditModalClose: document.getElementById("dewsCreditModalClose"),
  confirmDewsCreditBtn: document.getElementById("confirmDewsCreditBtn"),
  bondCouponModal: document.getElementById("bondCouponModal"),
  bondCouponModalSummary: document.getElementById("bondCouponModalSummary"),
  bondCouponModalSubtitle: document.getElementById("bondCouponModalSubtitle"),
  bondCouponModalClose: document.getElementById("bondCouponModalClose"),
  confirmBondCouponBtn: document.getElementById("confirmBondCouponBtn"),
  editBondCouponAmountBtn: document.getElementById("editBondCouponAmountBtn"),
  bondCouponAmountField: document.getElementById("bondCouponAmountField"),
  bondCouponAmountInput: document.getElementById("bondCouponAmountInput"),
  sellModal: document.getElementById("sellModal"),
  sellModalSummary: document.getElementById("sellModalSummary"),
  sellForm: document.getElementById("sellForm"),
  sellModalClose: document.getElementById("sellModalClose"),
  sellDate: document.getElementById("sellDate"),
  sellQty: document.getElementById("sellQty"),
  sellPrice: document.getElementById("sellPrice"),
  sellCurrency: document.getElementById("sellCurrency"),
  sellBank: document.getElementById("sellBank"),
  sellFees: document.getElementById("sellFees"),
  sellBuyDate: document.getElementById("sellBuyDate"),
  sellNote: document.getElementById("sellNote"),
  sellPreview: document.getElementById("sellPreview"),
  confirmSellBtn: document.getElementById("confirmSellBtn")
  ,
  buyModal: document.getElementById("buyModal"),
  buyForm: document.getElementById("buyForm"),
  buyModalClose: document.getElementById("buyModalClose"),
  buyDate: document.getElementById("buyDate"),
  buySymbol: document.getElementById("buySymbol"),
  buyName: document.getElementById("buyName"),
  buyBank: document.getElementById("buyBank"),
  buyQty: document.getElementById("buyQty"),
  buyPrice: document.getElementById("buyPrice"),
  buyCurrency: document.getElementById("buyCurrency"),
  buyFees: document.getElementById("buyFees"),
  buyNote: document.getElementById("buyNote"),
  buyPreview: document.getElementById("buyPreview"),
  confirmBuyBtn: document.getElementById("confirmBuyBtn"),
  bondSellModal: document.getElementById("bondSellModal"),
  bondSellModalSummary: document.getElementById("bondSellModalSummary"),
  bondSellForm: document.getElementById("bondSellForm"),
  bondSellModalClose: document.getElementById("bondSellModalClose"),
  bondSellDate: document.getElementById("bondSellDate"),
  bondSellType: document.getElementById("bondSellType"),
  bondSellNominal: document.getElementById("bondSellNominal"),
  bondSellPrice: document.getElementById("bondSellPrice"),
  bondSellAccrued: document.getElementById("bondSellAccrued"),
  bondSellCurrency: document.getElementById("bondSellCurrency"),
  bondSellBank: document.getElementById("bondSellBank"),
  bondSellFees: document.getElementById("bondSellFees"),
  bondSellNote: document.getElementById("bondSellNote"),
  bondSellPreview: document.getElementById("bondSellPreview"),
  cashMovementModal: document.getElementById("cashMovementModal"),
  cashMovementForm: document.getElementById("cashMovementForm"),
  cashMovementModalClose: document.getElementById("cashMovementModalClose"),
  cashMovementDate: document.getElementById("cashMovementDate"),
  cashMovementType: document.getElementById("cashMovementType"),
  cashMovementBank: document.getElementById("cashMovementBank"),
  cashMovementAmount: document.getElementById("cashMovementAmount"),
  cashMovementCurrency: document.getElementById("cashMovementCurrency"),
  cashMovementReason: document.getElementById("cashMovementReason"),
  cashMovementNote: document.getElementById("cashMovementNote"),
  cashMovementPreview: document.getElementById("cashMovementPreview"),
  confirmBondSellBtn: document.getElementById("confirmBondSellBtn"),
  txnEditModal: document.getElementById("txnEditModal"),
  txnEditForm: document.getElementById("txnEditForm"),
  txnEditModalClose: document.getElementById("txnEditModalClose"),
  txnEditDate: document.getElementById("txnEditDate"),
  txnEditType: document.getElementById("txnEditType"),
  txnEditSymbol: document.getElementById("txnEditSymbol"),
  txnEditName: document.getElementById("txnEditName"),
  txnEditBank: document.getElementById("txnEditBank"),
  txnEditQty: document.getElementById("txnEditQty"),
  txnEditPrice: document.getElementById("txnEditPrice"),
  txnEditCurrency: document.getElementById("txnEditCurrency"),
  txnEditFees: document.getElementById("txnEditFees"),
  txnEditCostPrice: document.getElementById("txnEditCostPrice"),
  txnEditNote: document.getElementById("txnEditNote"),
  txnEditPreview: document.getElementById("txnEditPreview"),
  cancelTxnBtn: document.getElementById("cancelTxnBtn"),
  confirmTxnEditBtn: document.getElementById("confirmTxnEditBtn")
};

const pageMeta = {
  dashboard: ["Consolidation", "Dashboard", "Global view of wealth, PnL and allocation."],
  stocks: ["Listed portfolios", "Stocks", "Stock line details, EUR valuation and daily PnL."],
  bonds: ["Fixed income", "Bond portfolio", "US Treasuries and OTC bonds with accrued coupon calculated daily."],
  structured: ["Private banking", "Structured Products", "Reverse convertible and worst-of Phoenix: valuation, coupons and redemptions."],
  private: ["Illiquid", "Private equity", "Manual valuations, commitments and called capital."],
  realestate: ["Property", "Real estate", "Properties, mortgage debt and rental income."],
  cash: ["Liquidity", "Cash", "Balances by bank and currency, revalued in EUR."],
  divers: ["Other assets", "Other", "Watches, bitcoin, life insurance and other manual investments."],
  journal: ["Activity log", "Journal", "Chronological view of trades, cash movements and bond cash flows."],
  forecast: ["Planning", "Forecast", "Informal quarterly view of expected inflows and outflows."],
  monthly: ["Monthly control", "Monthly review", "Frozen month-end snapshots, inferred spending and performance attribution."],
  history: ["Time tracking", "History", "Regular snapshots of total wealth and main asset buckets."],
  banks: ["Bank consolidation", "Wealth by bank", "Consolidated exposure by institution or custodian."],
  settings: ["Configuration", "Settings & sync", "OneDrive data file, weekly backups and market data settings."]
};

function loadState() {
  let recoveryValue = "";
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      recoveryValue = saved;
      const parsed = JSON.parse(saved);
      validateImportedPayload(parsed);
      return normalizeState(parsed);
    }
    const prior = localStorage.getItem(priorStorageKey);
    if (prior) {
      const parsed = JSON.parse(prior);
      validateImportedPayload(parsed);
      return normalizeState(parsed);
    }
    const legacy = localStorage.getItem(legacyKey);
    if (legacy) {
      const parsed = { ...structuredClone(defaultState), ...JSON.parse(legacy) };
      validateImportedPayload(parsed);
      return normalizeState(parsed);
    }
  } catch (error) {
    initialStateLoadError = `Saved data could not be loaded: ${error?.message || "invalid local data"}. A recovery copy was preserved.`;
    if (recoveryValue) {
      try { localStorage.setItem(recoveryStorageKey, recoveryValue); } catch {}
    }
  }
  return normalizeState(structuredClone(defaultState));
}

function normalizeState(raw) {
  const migratedApiKey = raw?.apiKey || loadApiKey();
  const base = structuredClone(defaultState);
  const next = { ...base, ...raw };
  next.apiKey = String(migratedApiKey || "").trim();
  next.schemaVersion = 3;
  if (!raw.eurUsd && raw.usdEur) next.eurUsd = 1 / numberValue(raw.usdEur);
  next.stocks = Array.isArray(raw.stocks) ? raw.stocks.map(row => ({ portfolio: "Actions US", ...row })) : base.stocks;
  const sourceBonds = Array.isArray(raw.bonds) ? raw.bonds : base.bonds;
  const legacyArgentinaBonds = sourceBonds.filter(isLegacyArgentinaBond);
  next.bonds = sourceBonds.filter(row => !isLegacyArgentinaBond(row));
  next.argentinaBonds = Array.isArray(raw.argentinaBonds)
    ? raw.argentinaBonds.map(normalizeArgentinaBond).filter(Boolean)
    : mergeLegacyArgentinaBonds(base.argentinaBonds, legacyArgentinaBonds);
  next.cash = Array.isArray(raw.cash) ? raw.cash.map(row => ({ bank: "Unallocated", ...row })) : base.cash;
  next.privateAssets = Array.isArray(raw.privateAssets) ? raw.privateAssets.map(row => ({ bank: "Unallocated", commitmentEur: 0, calledEur: 0, valuationDate: "", ...row })) : base.privateAssets;
  next.realEstate = Array.isArray(raw.realEstate) ? raw.realEstate.map(row => ({ bank: "Direct", currency: "EUR", grossValue: 0, originalLoan: row.originalLoan ?? row.debt ?? 0, annualRate: 0, termYears: 0, loanStartDate: "", monthlyRent: 0, monthlyCosts: 0, valuationDate: "", note: "", ...row })) : base.realEstate;
  next.divers = Array.isArray(raw.divers) ? raw.divers : base.divers;
  next.structuredProducts = normalizeStructuredProducts(raw.structuredProducts);
  next.structuredSetupApplied = raw.structuredSetupApplied === true;
  next.structuredAlertLog = Array.isArray(raw.structuredAlertLog) ? raw.structuredAlertLog : [];
  next.history = Array.isArray(raw.history) ? raw.history.map(normalizeSnapshot).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date)) : base.history;
  next.monthlyCloses = Array.isArray(raw.monthlyCloses) ? raw.monthlyCloses.map(normalizeMonthlyClose).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date)) : [];
  next.intradaySnapshots = Array.isArray(raw.intradaySnapshots) ? raw.intradaySnapshots.map(normalizeIntradaySnapshot).filter(Boolean).sort((a, b) => a.ts - b.ts) : base.intradaySnapshots;
  next.transactions = Array.isArray(raw.transactions) ? raw.transactions.map(normalizeTransaction).filter(Boolean).sort((a, b) => String(b.date).localeCompare(String(a.date))) : base.transactions;
  next.forecastFlows = Array.isArray(raw.forecastFlows) ? raw.forecastFlows : base.forecastFlows;
  next.marketSettingsCollapsed = raw.marketSettingsCollapsed !== false;
  next.privacyMode = raw.privacyMode === true;
  next.theme = raw.theme === "light" ? "light" : "dark";
  next.dashboardCurrency = raw.dashboardCurrency === "USD" ? "USD" : "EUR";
  next.bankCardCurrency = raw.bankCardCurrency === "USD" ? "USD" : "EUR";
  next.syncMeta = raw.syncMeta && typeof raw.syncMeta === "object"
    ? { version: 1, updatedAt: "", revision: 0, deviceId: "", ...raw.syncMeta }
    : structuredClone(base.syncMeta);
  next.intradayRange = raw.intradayRange === "7d" ? "7d" : "24h";
  next.wealthBridgeReferenceDate = raw.wealthBridgeReferenceDate || "";
  next.weeklySnapshotDay = [-1, 0, 1, 2, 3, 4, 5, 6].includes(Number(raw.weeklySnapshotDay)) ? Number(raw.weeklySnapshotDay) : 5;
  next.lastWeeklySnapshotKey = raw.lastWeeklySnapshotKey || "";
  next.lastDailyAutoSnapshotDate = raw.lastDailyAutoSnapshotDate || "";
  next.lastWeeklyBackupKey = raw.lastWeeklyBackupKey || "";
  next.lastWeeklyBackupAt = raw.lastWeeklyBackupAt || "";
  const legacyDewsCreditMonth = next.divers.find(row => String(row.name || "").trim().toUpperCase().includes("DEWS"))?.lastCreditMonth || "";
  next.lastDewsCreditMonth = raw.lastDewsCreditMonth || legacyDewsCreditMonth || "";
  return next;
}

function loadApiKey() {
  try { return localStorage.getItem(apiKeyStorageKey) || ""; } catch { return ""; }
}

function saveApiKey(value) {
  try {
    const key = String(value || "").trim();
    if (key) localStorage.setItem(apiKeyStorageKey, key);
    else localStorage.removeItem(apiKeyStorageKey);
  } catch (error) {
    lastStorageError = `API key could not be stored locally: ${error?.message || "storage unavailable"}.`;
  }
}

function validateImportedPayload(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("The data root must be an object");
  const collectionLimits = {
    stocks: 500,
    bonds: 500,
    argentinaBonds: 100,
    cash: 500,
    privateAssets: 500,
    realEstate: 500,
    divers: 1000,
    history: 5000,
    monthlyCloses: 240,
    intradaySnapshots: 2500,
    transactions: 10000,
    structuredProducts: 20,
    structuredAlertLog: 1000,
    forecastFlows: 2000
  };
  Object.entries(collectionLimits).forEach(([key, limit]) => {
    if (raw[key] !== undefined && !Array.isArray(raw[key])) throw new Error(`${key} must be an array`);
    if (Array.isArray(raw[key]) && raw[key].length > limit) throw new Error(`${key} exceeds the ${limit}-row safety limit`);
  });
  let nodes = 0;
  const inspect = (value, depth = 0) => {
    nodes += 1;
    if (nodes > 100000) throw new Error("The data file is too complex");
    if (depth > 10) throw new Error("The data file is nested too deeply");
    if (typeof value === "string" && value.length > 20000) throw new Error("A text field exceeds the 20,000-character limit");
    if (Array.isArray(value)) value.forEach(item => inspect(item, depth + 1));
    else if (value && typeof value === "object") Object.values(value).forEach(item => inspect(item, depth + 1));
  };
  inspect(raw);
  return raw;
}

function isLegacyArgentinaBond(row) {
  const text = `${row?.isin || ""} ${row?.name || ""} ${row?.issuer || ""}`.toUpperCase();
  return text.includes("ARGENTIN") || text.includes("XS2177365520") || text.includes("XS2200244072");
}

function mergeLegacyArgentinaBonds(baseRows, legacyRows) {
  const rows = baseRows.map(row => ({ ...row, processedPayments: [...(row.processedPayments || [])] }));
  legacyRows.forEach(legacy => {
    const text = `${legacy.isin || ""} ${legacy.name || ""} ${legacy.issuer || ""}`.toUpperCase();
    const isin = text.includes("XS2200244072") || text.includes("2029") ? "XS2200244072" : "XS2177365520";
    const row = rows.find(item => item.isin === isin);
    if (!row) return;
    row.bank = legacy.bank || row.bank;
    row.currentNominal = numberValue(legacy.nominal) || row.currentNominal;
    row.cleanPrice = numberValue(legacy.cleanPrice) || row.cleanPrice;
    row.couponRate = numberValue(legacy.couponRate) || row.couponRate;
    row.priceDate = legacy.valuationDate || legacy.priceDate || row.priceDate;
  });
  return rows;
}

function normalizeSnapshot(row) {
  if (!row || !row.date) return null;
  return {
    date: String(row.date).slice(0, 10),
    savedAt: row.savedAt || "",
    total: numberValue(row.total),
    stocksValue: numberValue(row.stocksValue ?? row.stocks),
    bondsValue: numberValue(row.bondsValue ?? row.bonds),
    structuredValue: numberValue(row.structuredValue ?? row.structured),
    cashValue: numberValue(row.cashValue ?? row.cash),
    privateValue: numberValue(row.privateValue ?? row.privateEquity),
    realEstateValue: numberValue(row.realEstateValue),
    diversValue: numberValue(row.diversValue ?? row.divers),
    stocksDayPnl: numberValue(row.stocksDayPnl),
    eurUsd: numberValue(row.eurUsd),
    fxUsdNative: numberValue(row.fxUsdNative),
    fxUsdValue: numberValue(row.fxUsdValue),
    fxEurValue: numberValue(row.fxEurValue),
    details: row.details && typeof row.details === "object" ? row.details : null
  };
}

function normalizeMonthlyClose(row) {
  if (!row || !row.date) return null;
  const normalizeMoney = value => ({
    amount: numberValue(value?.amount),
    currency: ["EUR", "AED", "USD"].includes(value?.currency) ? value.currency : "EUR",
    valueEur: numberValue(value?.valueEur)
  });
  const totals = row.totals || {};
  const analysis = row.analysis || {};
  return {
    id: /^[A-Za-z0-9_-]{1,80}$/.test(String(row.id || "")) ? String(row.id) : `monthly-${String(row.date).slice(0, 10)}-${Math.random().toString(16).slice(2)}`,
    date: String(row.date).slice(0, 10),
    monthKey: String(row.monthKey || row.date).slice(0, 7),
    createdAt: row.createdAt || "",
    note: String(row.note || "").slice(0, 2000),
    eurUsd: numberValue(row.eurUsd),
    totals: {
      total: numberValue(totals.total), stocks: numberValue(totals.stocks), bonds: numberValue(totals.bonds), structured: numberValue(totals.structured), cash: numberValue(totals.cash), private: numberValue(totals.private), divers: numberValue(totals.divers)
    },
    cashRows: Array.isArray(row.cashRows) ? row.cashRows.map(item => ({ key: String(item?.key || ""), bank: String(item?.bank || "Unallocated"), name: String(item?.name || "Cash"), currency: item?.currency || "EUR", amount: numberValue(item?.amount), valueEur: numberValue(item?.valueEur) })) : [],
    inputs: { salary: normalizeMoney(row.inputs?.salary), bonus: normalizeMoney(row.inputs?.bonus), otherIncome: normalizeMoney(row.inputs?.otherIncome), cashAdjustment: normalizeMoney(row.inputs?.cashAdjustment) },
    analysis: Object.fromEntries(["openingTotal","closingTotal","totalChange","openingCash","closingCash","cashChange","personalIncome","cashAdjustment","cashFxImpact","investmentCashFlow","nonCouponInvestmentCashFlow","bondCoupons","structuredCoupons","dividends","investmentIncome","inferredExpenses","unexplainedCashInflow","incomeSavings","stockPerformance","bondPerformance","structuredPerformance","privatePerformance","otherPerformance","investmentResult","fxAndReconciliation"].map(key => [key, numberValue(analysis[key])])),
    expenses: Array.isArray(row.expenses) ? row.expenses.map(item => ({ id: String(item?.id || `expense-${Math.random().toString(16).slice(2)}`), category: String(item?.category || "Other"), label: String(item?.label || "").slice(0, 300), amount: numberValue(item?.amount), currency: ["EUR", "AED", "USD"].includes(item?.currency) ? item.currency : "EUR", valueEur: numberValue(item?.valueEur) })).filter(item => item.amount > 0) : []
  };
}

function normalizeStructuredProducts(rows) {
  const source = Array.isArray(rows) ? rows : [];
  return STRUCTURED_PRODUCT_DEFAULTS.map(template => {
    const saved = source.find(row => row?.id === template.id || row?.isin === template.isin) || {};
    return {
      ...structuredClone(template),
      ...saved,
      id: template.id,
      isin: template.isin,
      name: template.name,
      bank: "Transatlantique",
      currency: "EUR",
      notional: template.notional,
      couponSchedule: structuredClone(template.couponSchedule),
      underlyings: template.underlyings ? structuredClone(template.underlyings) : undefined,
      processedCoupons: Array.isArray(saved.processedCoupons) ? saved.processedCoupons : [],
      memoryCoupons: Math.max(0, numberValue(saved.memoryCoupons)),
      status: ["active", "autocalled", "matured"].includes(saved.status) ? saved.status : "active",
      currentValue: saved.currentValue !== undefined ? numberValue(saved.currentValue) : template.currentValue
    };
  });
}

function normalizeIntradaySnapshot(row) {
  const ts = numberValue(row?.ts || Date.parse(row?.savedAt || ""));
  if (!ts) return null;
  return {
    ts,
    savedAt: row.savedAt || new Date(ts).toISOString(),
    total: numberValue(row.total),
    eurUsd: numberValue(row.eurUsd)
  };
}

function normalizeArgentinaBond(row) {
  if (!row || !row.isin) return null;
  return {
    isin: String(row.isin || "").toUpperCase(),
    name: row.name || "Argentina bond",
    bank: row.bank || "Unallocated",
    currency: row.currency || "EUR",
    originalNominal: numberValue(row.originalNominal),
    currentNominal: numberValue(row.currentNominal),
    couponRate: numberValue(row.couponRate),
    cleanPrice: numberValue(row.cleanPrice),
    priceDate: row.priceDate || "",
    priceSource: row.priceSource || "Manual",
    firstPayment: row.firstPayment || "2025-01-09",
    autoStartDate: row.autoStartDate || "2027-01-09",
    maturity: row.maturity || "",
    totalPayments: Math.max(1, numberValue(row.totalPayments)),
    dayCount: row.dayCount || "30/360",
    processedPayments: Array.isArray(row.processedPayments) ? row.processedPayments : []
  };
}

function normalizeTransaction(row) {
  if (!row || !row.type || !row.symbol) return null;
  const qty = Math.max(0, numberValue(row.qty));
  const price = Math.max(0, numberValue(row.price));
  const fees = Math.max(0, numberValue(row.fees));
  const currency = row.currency || "USD";
  const cashImpact = row.cashImpact !== undefined ? numberValue(row.cashImpact) : qty * price - fees;
  const allowedTypes = new Set(["Buy", "Sell", "Cash In", "Cash Out", "Bond Sell", "Early Redemption", "Redemption", "Bond Payment", "DEWS Contribution", "Structured Buy", "Structured Coupon", "Structured Redemption"]);
  const type = allowedTypes.has(row.type) ? row.type : "Sell";
  return {
    id: /^[A-Za-z0-9_-]{1,80}$/.test(String(row.id || "")) ? String(row.id) : `txn-${Date.now()}-${window.crypto?.randomUUID?.() || Math.random().toString(16).slice(2)}`,
    date: String(row.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    type,
    symbol: String(row.symbol || "").toUpperCase(),
    name: row.name || "",
    bank: row.bank || "Unallocated",
    qty,
    price,
    costPrice: numberValue(row.costPrice),
    currency,
    fees,
    cashImpact,
    couponAmount: Math.max(0, numberValue(row.couponAmount)),
    principalAmount: Math.max(0, numberValue(row.principalAmount)),
    realizedPnlEur: numberValue(row.realizedPnlEur),
    buyDate: row.buyDate || "",
    note: row.note || ""
  };
}

function saveState(options = {}) {
  try {
    state.schemaVersion = 3;
    localStorage.setItem(storageKey, JSON.stringify(state));
    lastStorageError = "";
    if (!options.skipCloud && !applyingRemoteData) scheduleConnectedDataSave();
  } catch (error) {
    lastStorageError = `Local save failed: ${error?.name === "QuotaExceededError" ? "browser storage is full" : error?.message || "storage unavailable"}. Export a backup now.`;
    const status = document.getElementById("statusLine");
    if (status) setStatus(lastStorageError, "warning");
  }
}

function numberValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fx(currency) {
  if (currency === "EUR") return 1;
  if (currency === "USD") return state.eurUsd ? 1 / numberValue(state.eurUsd) : 0;
  if (currency === "AED") return state.eurUsd ? 1 / (USD_AED_PEG * numberValue(state.eurUsd)) : 0;
  return 1;
}

function money(value, currency = "EUR", digits = 0) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(numberValue(value));
}

function signedMoney(value, currency = "EUR", digits = 0) {
  const amount = numberValue(value);
  const formatted = money(Math.abs(amount), currency, digits);
  return `${amount >= 0 ? "+" : "-"}${formatted}`;
}

function dashboardCurrency() {
  return state.dashboardCurrency === "USD" ? "USD" : "EUR";
}

function dashboardValue(valueEur) {
  return dashboardCurrency() === "USD" ? numberValue(valueEur) * numberValue(state.eurUsd) : numberValue(valueEur);
}

function dashboardMoney(valueEur, digits = 0) {
  return money(dashboardValue(valueEur), dashboardCurrency(), digits);
}

function displayMoney(valueEur, digits = 2) {
  return dashboardMoney(valueEur, digits);
}

function bankCardCurrency() {
  return state.bankCardCurrency === "USD" ? "USD" : "EUR";
}

function bankCardMoney(valueEur, digits = 2) {
  const currency = bankCardCurrency();
  const value = currency === "USD" ? numberValue(valueEur) * numberValue(state.eurUsd) : numberValue(valueEur);
  return money(value, currency, digits);
}

function displayCurrencyLabel() {
  return dashboardCurrency();
}

function fitTopKpiValues() {
  const selector = "#page-dashboard .hero .kpi-card-copy > strong, #page-dashboard .hero-stat strong, #executiveStrip .executive-value";
  document.querySelectorAll(selector).forEach(element => {
    if (!element.offsetParent) return;
    element.style.removeProperty("font-size");
    const available = element.clientWidth;
    const required = element.scrollWidth;
    if (!available || required <= available) return;
    const baseSize = Number.parseFloat(window.getComputedStyle(element).fontSize) || 16;
    let fittedSize = Math.max(10, Math.floor(baseSize * available / required * 10) / 10);
    element.style.fontSize = `${fittedSize}px`;
    while (element.scrollWidth > element.clientWidth && fittedSize > 10) {
      fittedSize = Math.max(10, fittedSize - 0.5);
      element.style.fontSize = `${fittedSize}px`;
    }
  });
}

function pct(value) {
  return `${numberValue(value).toFixed(2)} %`;
}

function signedClass(value) {
  return numberValue(value) >= 0 ? "positive" : "negative";
}

function tickerPaused() {
  try { return localStorage.getItem(tickerPausedStorageKey) === "true"; } catch { return false; }
}

function setTickerPaused(paused) {
  try { localStorage.setItem(tickerPausedStorageKey, String(Boolean(paused))); } catch {}
  els.marketTicker.classList.toggle("paused", Boolean(paused));
  els.marketTickerToggle.setAttribute("aria-pressed", String(Boolean(paused)));
  els.marketTickerToggle.setAttribute("aria-label", paused ? "Play scrolling highlights" : "Pause scrolling highlights");
  els.marketTickerToggle.title = paused ? "Play" : "Pause";
  els.marketTickerToggle.textContent = paused ? "▶" : "Ⅱ";
}

function nextCouponTickerData() {
  const today = todayIso();
  const candidates = [];
  state.bonds.forEach(row => {
    if (row.nextCoupon) candidates.push({ date: row.nextCoupon, name: row.name || row.issuer || "Bond" });
  });
  (state.argentinaBonds || []).forEach(row => {
    const payment = argentinaNextPayment(row);
    if (payment?.date) candidates.push({ date: payment.date, name: row.name || row.isin || "Argentina bond" });
  });
  const future = candidates.filter(row => row.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  return future[0] || candidates.sort((a, b) => Math.abs(Date.parse(a.date) - Date.now()) - Math.abs(Date.parse(b.date) - Date.now()))[0] || null;
}

function marketTickerItems(t) {
  const dayPct = t.stocksPrevious ? t.stocksDayPnl / t.stocksPrevious * 100 : 0;
  const nextCoupon = nextCouponTickerData();
  const items = [
    { page: "dashboard", label: "Total wealth", value: dashboardMoney(t.total), suffix: "", privateValue: true, tone: "" },
    { page: "stocks", label: "Stocks today", value: dashboardMoney(t.stocksDayPnl, 2), suffix: `${dayPct >= 0 ? "▲" : "▼"} ${Math.abs(dayPct).toFixed(2)}%`, privateValue: true, tone: signedClass(t.stocksDayPnl) }
  ];
  stockExposures().forEach(row => {
    const currency = row.displayCurrency || "USD";
    const move = numberValue(row.dayMovePct);
    items.push({ page: "stocks", label: row.symbol, value: money(row.avgPrice, currency, 2), suffix: `${move >= 0 ? "▲" : "▼"} ${Math.abs(move).toFixed(2)}%`, privateValue: false, tone: signedClass(move) });
  });
  items.push({ page: "dashboard", label: "EUR/USD", value: numberValue(state.eurUsd).toFixed(4), privateValue: false, tone: "" });
  items.push({ page: "bonds", label: "Next coupon", value: nextCoupon ? `${nextCoupon.date} · ${nextCoupon.name}` : "No scheduled coupon", privateValue: false, tone: "" });
  items.push({ page: "bonds", label: "Accrued coupons", value: dashboardMoney(t.bondsAccrued, 0), privateValue: true, tone: "" });
  items.push({ page: "cash", label: "Cash", value: dashboardMoney(t.cashValue, 0), privateValue: true, tone: "" });
  return items;
}

function fitMarketTicker() {
  if (!marketTickerBaseHtml || !els.marketTickerViewport || !els.marketTickerTrack) return;
  const sets = els.marketTickerTrack.querySelectorAll(".ticker-set");
  if (sets.length !== 2) return;
  sets[0].innerHTML = marketTickerBaseHtml;
  const baseWidth = Math.max(1, sets[0].scrollWidth);
  const repeats = Math.max(1, Math.ceil((els.marketTickerViewport.clientWidth + 48) / baseWidth));
  const expandedHtml = marketTickerBaseHtml.repeat(repeats);
  sets[0].innerHTML = expandedHtml;
  sets[1].innerHTML = expandedHtml;
  sets[1].setAttribute("aria-hidden", "true");
  sets[1].querySelectorAll("button").forEach(button => button.tabIndex = -1);
  const loopWidth = Math.max(1, sets[0].scrollWidth);
  els.marketTicker.style.setProperty("--ticker-duration", `${Math.max(12, loopWidth / 45).toFixed(2)}s`);
}

function renderMarketTicker(t) {
  const items = marketTickerItems(t);
  const contentKey = JSON.stringify(items);
  if (contentKey === marketTickerContentKey) return;
  marketTickerContentKey = contentKey;
  marketTickerBaseHtml = items.map(item => `<button class="ticker-item" type="button" data-ticker-page="${escapeHtml(item.page)}" title="Open ${escapeHtml(item.label)}">
    <span class="ticker-dot" aria-hidden="true"></span>
    <span class="ticker-label">${escapeHtml(item.label)}</span>
    <strong class="ticker-value ${escapeHtml(item.tone)}"><span class="${item.privateValue ? "ticker-private" : ""}">${escapeHtml(item.value)}</span>${item.suffix ? ` <span aria-label="daily variation">· ${escapeHtml(item.suffix)}</span>` : ""}</strong>
  </button>`).join("");
  window.requestAnimationFrame(fitMarketTicker);
}

function renderSidebarPulse(t) {
  if (!els.sidebarAllocationMini) return;
  const rows = [
    ["stocks", t.stocksValue, "Stocks"],
    ["bonds", t.bondsValue, "Bonds"],
    ["structured", t.structuredValue, "Structured"],
    ["cash", t.cashValue, "Cash"],
    ["private", t.privateValue, "Private"],
    ["realestate", t.realEstateValue, "Property"],
    ["divers", t.diversValue, "Other"]
  ].filter(([, value]) => numberValue(value) > 0);
  els.sidebarTotal.textContent = dashboardMoney(t.total, 0);
  els.sidebarAllocationMini.innerHTML = rows.map(([key, value, label]) => `<span class="${key}" style="width:${t.total ? numberValue(value) / t.total * 100 : 0}%" title="${escapeHtml(label)}"></span>`).join("");
  const top = [...rows].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([, value, label]) => `${label} ${pct(t.total ? value / t.total * 100 : 0)}`).join(" · ");
  els.sidebarAllocationText.textContent = top || "No allocation available";
}

function dateValue(value) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(start, end) {
  return Math.max(0, Math.round((end - start) / 86400000));
}

function daysBetween30_360(start, end) {
  const y1 = start.getFullYear();
  const y2 = end.getFullYear();
  const m1 = start.getMonth() + 1;
  const m2 = end.getMonth() + 1;
  const d1 = Math.min(start.getDate(), 30);
  const d2 = Math.min(end.getDate(), 30);
  return Math.max(0, (y2 - y1) * 360 + (m2 - m1) * 30 + (d2 - d1));
}

function stockValueEur(row) {
  return numberValue(row.qty) * numberValue(row.price) * fx(row.currency);
}

function stockDayPnlEur(row) {
  return numberValue(row.qty) * (numberValue(row.price) - numberValue(row.previousClose)) * fx(row.currency);
}

function stockTotalPnlEur(row) {
  return numberValue(row.qty) * (numberValue(row.price) - numberValue(row.cost)) * fx(row.currency);
}

function stockExposures() {
  const map = new Map();
  state.stocks.forEach(row => {
    const symbol = (row.symbol || "").trim().toUpperCase();
    if (!symbol) return;
    if (!map.has(symbol)) {
      map.set(symbol, {
        symbol,
        name: row.name || "",
        qty: 0,
        priceQty: 0,
        previousCloseQty: 0,
        costQty: 0,
        valueEur: 0,
        dayPnlEur: 0,
        totalPnlEur: 0,
        banks: new Set(),
        currencies: new Set(),
        lines: []
      });
    }
    const exposure = map.get(symbol);
    const qty = numberValue(row.qty);
    exposure.name = exposure.name || row.name || "";
    exposure.qty += qty;
    exposure.priceQty += qty * numberValue(row.price);
    exposure.previousCloseQty += qty * numberValue(row.previousClose);
    exposure.costQty += qty * numberValue(row.cost);
    exposure.valueEur += stockValueEur(row);
    exposure.dayPnlEur += stockDayPnlEur(row);
    exposure.totalPnlEur += stockTotalPnlEur(row);
    if (row.bank) exposure.banks.add(row.bank);
    if (row.currency) exposure.currencies.add(row.currency);
    exposure.lines.push(row);
  });
  return [...map.values()].map(row => ({
    ...row,
    avgPrice: row.qty ? row.priceQty / row.qty : 0,
    avgPreviousClose: row.qty ? row.previousCloseQty / row.qty : 0,
    weightedCost: row.qty ? row.costQty / row.qty : 0,
    dayMovePct: row.previousCloseQty ? (row.priceQty - row.previousCloseQty) / row.previousCloseQty * 100 : 0,
    bankCount: row.banks.size,
    displayCurrency: row.currencies.size === 1 ? [...row.currencies][0] : "EUR"
  })).sort((a, b) => b.valueEur - a.valueEur);
}

function bondAccruedCurrency(row) {
  const last = dateValue(row.lastCoupon);
  const next = dateValue(row.nextCoupon);
  const today = new Date();
  if (!last || !next || today <= last) return 0;
  const end = today < next ? today : next;
  const elapsed = daysBetween(last, end);
  const annualCoupon = numberValue(row.nominal) * numberValue(row.couponRate) / 100;
  if (row.dayCount === "30/360") return annualCoupon * daysBetween30_360(last, end) / 360;
  if (row.dayCount === "ACT/360") return annualCoupon * elapsed / 360;
  if (row.dayCount === "ACT/365") return annualCoupon * elapsed / 365;
  const periodDays = Math.max(1, daysBetween(last, next));
  return annualCoupon / Math.max(1, numberValue(row.frequency)) * elapsed / periodDays;
}

function bondAccruedEur(row) {
  return bondAccruedCurrency(row) * fx(row.currency);
}

function bondCleanValueCurrency(row) {
  return numberValue(row.nominal) * numberValue(row.cleanPrice) / 100;
}

function bondCleanValueEur(row) {
  return bondCleanValueCurrency(row) * fx(row.currency);
}

function bondValueEur(row) {
  return (bondCleanValueCurrency(row) + bondAccruedCurrency(row)) * fx(row.currency);
}

function bondPnlEur(row) {
  const cost = numberValue(row.nominal) * numberValue(row.costPrice) / 100;
  return (bondCleanValueCurrency(row) + bondAccruedCurrency(row) - cost) * fx(row.currency);
}

function bondAnnualCouponEur(row) {
  return numberValue(row.nominal) * numberValue(row.couponRate) / 100 * fx(row.currency);
}

function bondCurrentYield(row) {
  const dirty = bondValueEur(row);
  return dirty ? bondAnnualCouponEur(row) / dirty * 100 : 0;
}

function dateIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function argentinaPaymentId(row, date) {
  return `${String(row.isin || "").toUpperCase()}-${date}`;
}

function argentinaPaymentDates(row) {
  const dates = [];
  const first = dateValue(row.firstPayment);
  const maturity = dateValue(row.maturity);
  if (!first || !maturity) return dates;
  let current = new Date(first);
  while (current <= maturity && dates.length < 80) {
    dates.push(dateIso(current));
    current = new Date(current.getFullYear(), current.getMonth() + 6, current.getDate());
  }
  return dates;
}

function argentinaPrincipalPerPayment(row) {
  return numberValue(row.originalNominal) / Math.max(1, numberValue(row.totalPayments));
}

function argentinaLastPaymentDate(row, paymentDate = null) {
  const dates = argentinaPaymentDates(row);
  const target = paymentDate || todayIso();
  const index = dates.findIndex(date => date === target);
  if (index > 0) return dates[index - 1];
  const previous = dates.filter(date => date < target).at(-1);
  return previous || row.firstPayment || "";
}

function argentinaBondAccruedCurrency(row, asOf = new Date()) {
  const last = dateValue(argentinaLastPaymentDate(row, dateIso(asOf)));
  const next = dateValue(argentinaPaymentDates(row).find(date => date > dateIso(asOf)) || row.maturity);
  if (!last || !next || asOf <= last) return 0;
  const end = asOf < next ? asOf : next;
  const annualCoupon = numberValue(row.currentNominal) * numberValue(row.couponRate) / 100;
  if (row.dayCount === "30/360") return annualCoupon * daysBetween30_360(last, end) / 360;
  return annualCoupon * daysBetween(last, end) / 360;
}

function argentinaBondAccruedEur(row) {
  return argentinaBondAccruedCurrency(row) * fx(row.currency);
}

function argentinaBondCleanValueCurrency(row) {
  return numberValue(row.currentNominal) * numberValue(row.cleanPrice) / 100;
}

function argentinaBondDirtyValueCurrency(row) {
  return argentinaBondCleanValueCurrency(row) + argentinaBondAccruedCurrency(row);
}

function argentinaBondDirtyValueEur(row) {
  return argentinaBondDirtyValueCurrency(row) * fx(row.currency);
}

function argentinaNextPayment(row, reference = new Date()) {
  const today = dateIso(reference);
  const autoStart = row.autoStartDate || row.firstPayment || today;
  const processed = new Set(row.processedPayments || []);
  const date = argentinaPaymentDates(row).find(candidate => candidate >= autoStart && !processed.has(argentinaPaymentId(row, candidate)));
  if (!date) return null;
  const principal = Math.min(numberValue(row.currentNominal), argentinaPrincipalPerPayment(row));
  const paymentDate = dateValue(date);
  const previousDate = dateValue(argentinaLastPaymentDate(row, date));
  const annualCoupon = numberValue(row.currentNominal) * numberValue(row.couponRate) / 100;
  const coupon = previousDate && paymentDate
    ? annualCoupon * (row.dayCount === "30/360" ? daysBetween30_360(previousDate, paymentDate) : daysBetween(previousDate, paymentDate)) / 360
    : annualCoupon / 2;
  const todayDate = dateValue(today);
  const daysUntil = todayDate ? Math.ceil((paymentDate - todayDate) / 86400000) : 0;
  return { id: argentinaPaymentId(row, date), date, principal, coupon, total: principal + coupon, daysUntil };
}

function argentinaPaymentStatus(payment) {
  if (!payment) return "Complete";
  if (payment.daysUntil < 0) return "Due";
  if (payment.daysUntil === 0) return "Due today";
  if (payment.daysUntil <= 2) return `Due in ${payment.daysUntil}d`;
  return "Scheduled";
}

function yearsToMaturity(row) {
  const maturity = dateValue(row.maturity);
  if (!maturity) return 0;
  return Math.max(0, (maturity - new Date()) / 31557600000);
}

function cashValueEur(row) {
  return numberValue(row.amount) * fx(row.currency);
}

function cashSummary() {
  const byCurrency = new Map();
  const byBank = new Map();
  let totalEur = 0;
  let positiveAccounts = 0;
  let negativeAccounts = 0;
  state.cash.forEach(row => {
    const amount = numberValue(row.amount);
    const currency = row.currency || "EUR";
    const bank = row.bank || "Unallocated";
    const valueEur = cashValueEur(row);
    totalEur += valueEur;
    byCurrency.set(currency, (byCurrency.get(currency) || 0) + amount);
    byBank.set(bank, (byBank.get(bank) || 0) + valueEur);
    if (amount >= 0) positiveAccounts += 1;
    else negativeAccounts += 1;
  });
  const banks = [...byBank.entries()].map(([bank, value]) => ({ bank, value })).sort((a, b) => b.value - a.value);
  return { totalEur, byCurrency, banks, topBank: banks[0] || null, positiveAccounts, negativeAccounts };
}

function privateValueEur(row) {
  return numberValue(row.valueEur);
}

function realEstateGrossEur(row) {
  return numberValue(row.grossValue) * fx(row.currency);
}

function loanMonthlyPaymentCurrency(row) {
  const principal = numberValue(row.originalLoan ?? row.debt);
  const months = Math.max(0, Math.round(numberValue(row.termYears) * 12));
  if (!principal || !months) return 0;
  const monthlyRate = numberValue(row.annualRate) / 100 / 12;
  if (!monthlyRate) return principal / months;
  return principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
}

function loanElapsedPayments(row) {
  const start = dateValue(row.loanStartDate);
  if (!start) return 0;
  const today = new Date();
  let months = (today.getFullYear() - start.getFullYear()) * 12 + today.getMonth() - start.getMonth();
  if (today.getDate() < start.getDate()) months -= 1;
  return Math.max(0, Math.min(Math.round(numberValue(row.termYears) * 12), months));
}

function remainingLoanCurrency(row) {
  const principal = numberValue(row.originalLoan ?? row.debt);
  const months = Math.max(0, Math.round(numberValue(row.termYears) * 12));
  if (!principal) return 0;
  if (!months || !row.loanStartDate) return principal;
  const paid = loanElapsedPayments(row);
  if (paid >= months) return 0;
  const monthlyRate = numberValue(row.annualRate) / 100 / 12;
  const payment = loanMonthlyPaymentCurrency(row);
  if (!monthlyRate) return Math.max(0, principal - payment * paid);
  return Math.max(0, principal * Math.pow(1 + monthlyRate, paid) - payment * (Math.pow(1 + monthlyRate, paid) - 1) / monthlyRate);
}

function realEstateDebtEur(row) {
  return remainingLoanCurrency(row) * fx(row.currency);
}

function realEstateNetEur(row) {
  return realEstateGrossEur(row) - realEstateDebtEur(row);
}

function realEstateMonthlyNetRentEur(row) {
  return (numberValue(row.monthlyRent) - numberValue(row.monthlyCosts)) * fx(row.currency);
}

function realEstateMonthlyPaymentEur(row) {
  return loanMonthlyPaymentCurrency(row) * fx(row.currency);
}

function realEstateMonthlyCashflowEur(row) {
  return realEstateMonthlyNetRentEur(row) - realEstateMonthlyPaymentEur(row);
}

function diversValueEur(row) {
  return numberValue(row.qty) * numberValue(row.unitPrice) * fx(row.currency);
}

function structuredProductValueEur(row) {
  return row?.status === "active" ? numberValue(row.currentValue ?? row.notional) : 0;
}

function structuredCouponRows() {
  return (state.structuredProducts || []).flatMap(product => (product.couponSchedule || []).map((entry, index) => {
    const schedule = typeof entry === "string" ? { paymentDate: entry, observationDate: "", autocallLevel: null } : entry;
    const processed = (product.processedCoupons || []).find(item => item.paymentDate === schedule.paymentDate);
    return { product, index, ...schedule, processed };
  })).sort((a, b) => a.paymentDate.localeCompare(b.paymentDate) || a.product.name.localeCompare(b.product.name));
}

function transatEurAccount() {
  let account = state.cash.find(row => (row.currency || "EUR") === "EUR" && `${row.bank || ""} ${row.name || ""}`.toLowerCase().includes("transat"));
  if (!account) {
    account = { name: "Cash EUR", bank: "Transatlantique", currency: "EUR", amount: 0 };
    state.cash.push(account);
  }
  return account;
}

function addStructuredTransaction({ id, date, type, product, amount, note }) {
  state.transactions = Array.isArray(state.transactions) ? state.transactions : [];
  if (state.transactions.some(row => row.id === id)) return false;
  state.transactions.unshift({
    id,
    date,
    type,
    symbol: product.isin,
    name: product.name,
    bank: "Transatlantique",
    qty: type === "Structured Buy" || type === "Structured Redemption" ? numberValue(product.notional) : 1,
    price: 1,
    costPrice: 1,
    currency: "EUR",
    fees: 0,
    cashImpact: amount,
    couponAmount: type === "Structured Coupon" ? Math.max(0, amount) : 0,
    principalAmount: type === "Structured Redemption" ? Math.max(0, amount) : 0,
    realizedPnlEur: 0,
    buyDate: product.issueDate || "",
    note: note || ""
  });
  return true;
}

function ensureStructuredProductsSetup() {
  state.structuredProducts = normalizeStructuredProducts(state.structuredProducts);
  const account = transatEurAccount();
  let changed = false;
  state.structuredProducts.forEach(product => {
    const id = `structured-buy-${product.isin}`;
    if ((state.transactions || []).some(row => row.id === id)) return;
    account.amount = numberValue(account.amount) - numberValue(product.notional);
    addStructuredTransaction({
      id,
      date: product.issueDate,
      type: "Structured Buy",
      product,
      amount: -numberValue(product.notional),
      note: `Initial subscription funded from Transatlantique EUR — ${product.isin}`
    });
    changed = true;
  });
  if (!state.structuredSetupApplied) {
    state.structuredSetupApplied = true;
    changed = true;
  }
  if (changed) saveState();
  return changed;
}

function showStructuredToast(title, text) {
  if (!els.structuredToast) return;
  const key = `${title}|${text}`;
  if (key === structuredToastKey && !els.structuredToast.hidden) return;
  structuredToastKey = key;
  els.structuredToastTitle.textContent = title;
  els.structuredToastText.textContent = text;
  els.structuredToast.hidden = false;
}

let actionNotices = [];
let actionItems = [];

function addActionNotice(title, text) {
  const key = `${title}|${text}`;
  if (actionNotices.some(notice => notice.key === key)) return;
  actionNotices.push({ key, title, text });
}

function dueConditionalCoupons(asOf = todayIso()) {
  return structuredCouponRows().filter(row => row.product.kind === "phoenix" && row.product.status === "active" && row.paymentDate <= asOf && !row.processed);
}

function collectActionItems() {
  const items = [];
  const bond = nextDueBondPayment();
  if (bond) {
    items.push({
      tone: "due",
      title: `${bond.kind === "argentina" ? "Bond payment" : "Coupon"} to confirm · ${bond.symbol}`,
      meta: `Due ${bond.date} · ${money(bond.total, bond.currency, 2)}`,
      cta: "Review",
      run: () => checkBondPaymentAlert()
    });
  }
  const dews = currentDewsCreditContext();
  if (dews) {
    items.push({
      tone: "due",
      title: "DEWS contribution to confirm",
      meta: `Due ${dews.creditDate} · ${money(dews.amountUsd, "USD", 2)}`,
      cta: "Review",
      run: () => checkDewsMonthlyCredit()
    });
  }
  const conditional = dueConditionalCoupons();
  if (conditional.length) {
    items.push({
      tone: "due",
      title: `${conditional.length} Phoenix coupon${conditional.length > 1 ? "s" : ""} to check`,
      meta: "Confirm the barrier before crediting.",
      cta: "Open",
      run: () => setPage("structured")
    });
  }
  actionNotices.forEach(notice => {
    items.push({
      tone: "info",
      title: notice.title,
      meta: notice.text,
      cta: "Open",
      run: () => setPage("structured"),
      noticeKey: notice.key
    });
  });
  return items;
}

function renderActionCenter() {
  const pill = document.getElementById("actionsPill");
  const list = document.getElementById("actionsList");
  const panel = document.getElementById("actionsPanel");
  if (!pill || !list || !panel) return;
  actionItems = collectActionItems();
  const due = actionItems.filter(item => item.tone === "due").length;
  pill.hidden = actionItems.length === 0;
  if (!actionItems.length) {
    panel.hidden = true;
    pill.setAttribute("aria-expanded", "false");
  }
  pill.dataset.tone = due ? "due" : "info";
  document.getElementById("actionsCount").textContent = String(due || actionItems.length);
  document.getElementById("actionsLabel").textContent = due ? "To review" : (actionItems.length > 1 ? "Updates" : "Update");
  pill.setAttribute("aria-label", `${due || actionItems.length} ${due ? "to review" : (actionItems.length > 1 ? "updates" : "update")}`);
  list.innerHTML = actionItems.map((item, index) => `
    <li class="actions-item" data-tone="${item.tone}">
      <span class="actions-item-dot" aria-hidden="true"></span>
      <span class="actions-item-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.meta)}</span></span>
      <span class="actions-item-buttons">
        ${item.noticeKey ? `<button type="button" class="mini" data-action-dismiss="${index}" aria-label="Dismiss: ${escapeHtml(item.title)}">Dismiss</button>` : ""}
        <button type="button" class="mini ${item.tone === "due" ? "primary" : ""}" data-action-run="${index}">${escapeHtml(item.cta)}</button>
      </span>
    </li>`).join("");
}

function toggleActionsPanel(force) {
  const pill = document.getElementById("actionsPill");
  const panel = document.getElementById("actionsPanel");
  if (!pill || !panel) return;
  const open = typeof force === "boolean" ? force : panel.hidden;
  panel.hidden = !open;
  pill.setAttribute("aria-expanded", String(open));
  if (open) panel.querySelector("button")?.focus();
}

function processStructuredCouponPayments(asOf = todayIso()) {
  const account = transatEurAccount();
  const credited = [];
  let changed = false;
  (state.structuredProducts || []).filter(product => product.kind === "reverse" && product.status === "active").forEach(product => {
    (product.couponSchedule || []).forEach(paymentDate => {
      if (paymentDate > asOf || (product.processedCoupons || []).some(item => item.paymentDate === paymentDate)) return;
      const amount = numberValue(product.couponAmount);
      account.amount = numberValue(account.amount) + amount;
      product.processedCoupons.push({ paymentDate, status: "credited", amount, creditedAt: new Date().toISOString() });
      addStructuredTransaction({
        id: `structured-coupon-${product.isin}-${paymentDate}`,
        date: paymentDate,
        type: "Structured Coupon",
        product,
        amount,
        note: `Guaranteed coupon automatically credited to Transatlantique EUR — ${numberValue(product.couponRate).toFixed(3)}%`
      });
      credited.push(`${money(amount, "EUR", 0)} from ${product.isin}`);
      changed = true;
    });
  });
  if (changed) saveState();
  const dueConditional = structuredCouponRows().filter(row => row.product.kind === "phoenix" && row.product.status === "active" && row.paymentDate <= asOf && !row.processed);
  if (credited.length) addActionNotice("Coupon credited to Transatlantique EUR", credited.join(" · "));
  renderActionCenter();
  return { credited, dueConditional };
}

function formatStructuredDate(value) {
  const date = dateValue(value);
  return date ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
}

function creditStructuredCoupon(productId, paymentDate) {
  const product = (state.structuredProducts || []).find(row => row.id === productId);
  if (!product || product.status !== "active" || product.kind !== "phoenix") return;
  if ((product.processedCoupons || []).some(item => item.paymentDate === paymentDate)) return;
  const memoryApplied = Math.max(0, numberValue(product.memoryCoupons));
  const amount = numberValue(product.couponAmount) * (memoryApplied + 1);
  if (!window.confirm(`Confirm that the coupon barrier was met. Credit ${money(amount, "EUR", 0)} to Transatlantique EUR?`)) return;
  const account = transatEurAccount();
  account.amount = numberValue(account.amount) + amount;
  product.processedCoupons.push({ paymentDate, status: "credited", amount, memoryApplied, creditedAt: new Date().toISOString() });
  product.memoryCoupons = 0;
  addStructuredTransaction({
    id: `structured-coupon-${product.isin}-${paymentDate}`,
    date: paymentDate,
    type: "Structured Coupon",
    product,
    amount,
    note: `Conditional Phoenix coupon confirmed and credited${memoryApplied ? `, including ${memoryApplied} memory coupon(s)` : ""}`
  });
  saveState();
  addActionNotice("Coupon credited to Transatlantique EUR", `${money(amount, "EUR", 0)} credited for ${product.isin}.`);
  renderActionCenter();
  render();
}

function deferStructuredCoupon(productId, paymentDate) {
  const product = (state.structuredProducts || []).find(row => row.id === productId);
  if (!product || product.status !== "active" || product.kind !== "phoenix") return;
  if ((product.processedCoupons || []).some(item => item.paymentDate === paymentDate)) return;
  if (!window.confirm("Confirm that the coupon barrier was not met? This coupon will be carried in memory and no cash will be credited now.")) return;
  product.processedCoupons.push({ paymentDate, status: "memory", amount: 0, recordedAt: new Date().toISOString() });
  product.memoryCoupons = Math.max(0, numberValue(product.memoryCoupons)) + 1;
  saveState();
  render();
  setStatus(`Phoenix coupon dated ${paymentDate} carried in memory.`, "warning");
}

function endStructuredProduct(productId) {
  const product = (state.structuredProducts || []).find(row => row.id === productId);
  if (!product || product.status !== "active" || product.kind !== "phoenix") return;
  if (!window.confirm(`Mark ${product.isin} as autocalled today and credit ${money(product.notional, "EUR", 0)} principal to Transatlantique EUR?`)) return;
  const date = todayIso();
  const account = transatEurAccount();
  account.amount = numberValue(account.amount) + numberValue(product.notional);
  product.status = "autocalled";
  product.currentValue = 0;
  product.endedAt = date;
  addStructuredTransaction({
    id: `structured-redemption-${product.isin}-${date}`,
    date,
    type: "Structured Redemption",
    product,
    amount: numberValue(product.notional),
    note: "Manual early end / autocall — principal credited to Transatlantique EUR"
  });
  saveState();
  showStructuredToast("Phoenix marked as autocalled", `${money(product.notional, "EUR", 0)} principal credited to Transatlantique EUR.`);
  render();
}

function isLongTermBond(row) {
  const text = `${row.name || ""} ${row.issuer || ""} ${row.bank || ""}`.toLowerCase();
  return text.includes("absolute") || text.includes("absolut");
}

function computeTotals() {
  const stocksValue = state.stocks.reduce((sum, row) => sum + stockValueEur(row), 0);
  const stocksDayPnl = state.stocks.reduce((sum, row) => sum + stockDayPnlEur(row), 0);
  const stocksPrevious = stocksValue - stocksDayPnl;
  const stocksTotalPnl = state.stocks.reduce((sum, row) => sum + stockTotalPnlEur(row), 0);
  const argentinaBondsValue = (state.argentinaBonds || []).reduce((sum, row) => sum + argentinaBondDirtyValueEur(row), 0);
  const argentinaBondsAccrued = (state.argentinaBonds || []).reduce((sum, row) => sum + argentinaBondAccruedEur(row), 0);
  const listedBondsValue = state.bonds.reduce((sum, row) => sum + bondValueEur(row), 0);
  const longTermBondsValue = state.bonds.filter(isLongTermBond).reduce((sum, row) => sum + bondValueEur(row), 0);
  const liquidBondsValue = listedBondsValue - longTermBondsValue + argentinaBondsValue;
  const bondsValue = listedBondsValue + argentinaBondsValue;
  const bondsAccrued = state.bonds.reduce((sum, row) => sum + bondAccruedEur(row), 0) + argentinaBondsAccrued;
  const bondsPnl = state.bonds.reduce((sum, row) => sum + bondPnlEur(row), 0);
  const longTermBondsPnl = state.bonds.filter(isLongTermBond).reduce((sum, row) => sum + bondPnlEur(row), 0);
  const liquidBondsPnl = bondsPnl - longTermBondsPnl;
  const cashValue = state.cash.reduce((sum, row) => sum + cashValueEur(row), 0);
  const cashNegative = state.cash.reduce((sum, row) => sum + Math.min(0, cashValueEur(row)), 0);
  const cashPositive = cashValue - cashNegative;
  const structuredValue = (state.structuredProducts || []).reduce((sum, row) => sum + structuredProductValueEur(row), 0);
  const privateValue = state.privateAssets.reduce((sum, row) => sum + privateValueEur(row), 0);
  const realEstateValue = state.realEstate.reduce((sum, row) => sum + realEstateNetEur(row), 0);
  const diversValue = state.divers.reduce((sum, row) => sum + diversValueEur(row), 0);
  const total = stocksValue + bondsValue + structuredValue + cashValue + privateValue + realEstateValue + diversValue;
  return { stocksValue, stocksDayPnl, stocksPrevious, stocksTotalPnl, bondsValue, bondsAccrued, bondsPnl, liquidBondsValue, longTermBondsValue, liquidBondsPnl, longTermBondsPnl, structuredValue, cashValue, cashPositive, cashNegative, privateValue, realEstateValue, diversValue, total };
}

function transactionValueEur(row, value = row.cashImpact) {
  return numberValue(value) * fx(row.currency || "EUR");
}

function isTreasuryBond(row) {
  const text = `${row?.type || ""} ${row?.name || ""} ${row?.issuer || ""}`.toLowerCase();
  return text.includes("treasury") || text.includes("ust ") || text.includes("u.s. treasury");
}

function isTreasuryTransaction(row) {
  const text = `${row?.symbol || ""} ${row?.name || ""} ${row?.note || ""}`.toLowerCase();
  return text.includes("treasury") || text.includes("ust ") || text.includes("u.s. treasury");
}

function bondCleanPnlEur(row) {
  const clean = numberValue(row.nominal) * numberValue(row.cleanPrice) / 100;
  const cost = numberValue(row.nominal) * numberValue(row.costPrice) / 100;
  return (clean - cost) * fx(row.currency || "EUR");
}

function bondCouponReceivedNative(row) {
  if (row.type !== "Bond Payment") return 0;
  if (numberValue(row.couponAmount) > 0) return numberValue(row.couponAmount);
  const principal = numberValue(row.principalAmount) || numberValue(row.qty);
  return Math.max(0, numberValue(row.cashImpact) - principal);
}

function bondCouponReceivedEur(row) {
  return bondCouponReceivedNative(row) * fx(row.currency || "EUR");
}

function investmentPerformanceSummary() {
  const transactions = state.transactions || [];
  const stockUnrealized = state.stocks.reduce((sum, row) => sum + stockTotalPnlEur(row), 0);
  const stockRealized = transactions.filter(row => row.type === "Sell").reduce((sum, row) => sum + numberValue(row.realizedPnlEur), 0);
  const treasuryClean = state.bonds.filter(isTreasuryBond).reduce((sum, row) => sum + bondCleanPnlEur(row), 0);
  const otherBondClean = state.bonds.filter(row => !isTreasuryBond(row)).reduce((sum, row) => sum + bondCleanPnlEur(row), 0);
  const bondRealized = transactions.filter(row => ["Bond Sell", "Early Redemption", "Redemption"].includes(row.type)).reduce((sum, row) => sum + numberValue(row.realizedPnlEur), 0);
  const couponsReceived = transactions.filter(row => row.type === "Bond Payment").reduce((sum, row) => sum + bondCouponReceivedEur(row), 0);
  const couponAccrued = state.bonds.reduce((sum, row) => sum + bondAccruedEur(row), 0) + (state.argentinaBonds || []).reduce((sum, row) => sum + argentinaBondAccruedEur(row), 0);
  const structuredCoupons = transactions.filter(row => row.type === "Structured Coupon").reduce((sum, row) => sum + Math.max(0, transactionValueEur(row)), 0);
  const transactionFees = transactions.reduce((sum, row) => sum + numberValue(row.fees) * fx(row.currency || "EUR"), 0);
  const internalTypes = new Set(["Buy", "Sell", "Bond Sell", "Early Redemption", "Redemption", "Structured Buy", "Structured Redemption"]);
  const internalTurnover = transactions.filter(row => internalTypes.has(row.type)).reduce((sum, row) => sum + Math.abs(transactionValueEur(row)), 0);
  const marketGain = stockUnrealized + stockRealized + treasuryClean + otherBondClean + bondRealized;
  const incomeEarned = couponsReceived + couponAccrued + structuredCoupons;
  const totalReturn = marketGain + incomeEarned;
  return { stockUnrealized, stockRealized, treasuryClean, otherBondClean, bondRealized, couponsReceived, couponAccrued, structuredCoupons, transactionFees, internalTurnover, marketGain, incomeEarned, totalReturn };
}

function bondIncomeByInstrument() {
  const map = new Map();
  (state.transactions || []).filter(row => row.type === "Bond Payment").forEach(row => {
    const key = String(row.symbol || row.name || "Bond").trim();
    const entry = map.get(key) || { name: key, received: 0, treasury: isTreasuryTransaction(row) };
    entry.received += bondCouponReceivedEur(row);
    entry.treasury = entry.treasury || isTreasuryTransaction(row);
    map.set(key, entry);
  });
  state.bonds.forEach(row => {
    const key = String(row.name || row.issuer || "Bond").trim();
    const entry = map.get(key) || { name: key, received: 0, treasury: isTreasuryBond(row) };
    entry.accrued = numberValue(entry.accrued) + bondAccruedEur(row);
    entry.pricePnl = numberValue(entry.pricePnl) + bondCleanPnlEur(row);
    entry.treasury = isTreasuryBond(row);
    map.set(key, entry);
  });
  (state.argentinaBonds || []).forEach(row => {
    const key = String(row.isin || row.name || "Argentina bond").trim();
    const entry = map.get(key) || { name: key, received: 0, treasury: false };
    entry.accrued = numberValue(entry.accrued) + argentinaBondAccruedEur(row);
    map.set(key, entry);
  });
  return [...map.values()].map(row => ({ ...row, accrued: numberValue(row.accrued), pricePnl: numberValue(row.pricePnl), totalReturn: numberValue(row.pricePnl) + numberValue(row.received) + numberValue(row.accrued) })).sort((a, b) => Math.abs(b.totalReturn) - Math.abs(a.totalReturn));
}

function cashBridgeSummary() {
  const categories = { purchases: 0, income: 0, sales: 0, external: 0, other: 0 };
  (state.transactions || []).forEach(row => {
    const total = transactionValueEur(row);
    if (row.type === "Bond Payment") {
      const coupon = bondCouponReceivedEur(row);
      const principal = Math.max(0, total - coupon);
      categories.income += coupon;
      categories.sales += principal;
    } else if (row.type === "Structured Coupon") {
      categories.income += total;
    } else if (["Buy", "Structured Buy"].includes(row.type)) {
      categories.purchases += total;
    } else if (["Sell", "Bond Sell", "Early Redemption", "Redemption", "Structured Redemption"].includes(row.type)) {
      categories.sales += total;
    } else if (["Cash In", "Cash Out"].includes(row.type)) {
      categories.external += total;
    } else {
      categories.other += total;
    }
  });
  const current = cashSummary().totalEur;
  const movement = Object.values(categories).reduce((sum, value) => sum + value, 0);
  const opening = current - movement;
  return { ...categories, current, opening, movement };
}

function fxAtRate(currency, eurUsd) {
  const rate = Math.max(.0001, numberValue(eurUsd) || numberValue(state.eurUsd));
  if (currency === "USD") return 1 / rate;
  if (currency === "AED") return 1 / (USD_AED_PEG * rate);
  return 1;
}

function monthlyMoneyFromInputs(amount, currency) {
  const normalizedCurrency = ["EUR", "AED", "USD"].includes(currency) ? currency : "EUR";
  const normalizedAmount = numberValue(amount);
  return { amount: normalizedAmount, currency: normalizedCurrency, valueEur: normalizedAmount * fx(normalizedCurrency) };
}

function currentMonthlyTotals() {
  const totals = computeTotals();
  return { total: totals.total, stocks: totals.stocksValue, bonds: totals.bondsValue, structured: totals.structuredValue, cash: totals.cashValue, private: totals.privateValue, divers: totals.diversValue };
}

function currentMonthlyCashRows() {
  return state.cash.map(row => ({
    key: `${row.bank || "Unallocated"}|${row.name || "Cash"}|${row.currency || "EUR"}`,
    bank: row.bank || "Unallocated",
    name: row.name || "Cash",
    currency: row.currency || "EUR",
    amount: numberValue(row.amount),
    valueEur: cashValueEur(row)
  }));
}

function monthlyClosesSorted() {
  return [...(state.monthlyCloses || [])].sort((a, b) => a.date.localeCompare(b.date));
}

function monthlyCloseBefore(date) {
  return monthlyClosesSorted().filter(row => row.date < date).at(-1) || null;
}

function transactionInMonthlyPeriod(row, openingDate, closingDate) {
  const date = String(row?.date || "").slice(0, 10);
  return Boolean(date && date > openingDate && date <= closingDate);
}

function isDividendTransaction(row) {
  if (row.type !== "Cash In") return false;
  const text = `${row.symbol || ""} ${row.name || ""} ${row.note || ""}`.toLowerCase();
  return text.includes("dividend") || text.includes("dividende");
}

function monthlyTransactionSummary(openingDate, closingDate) {
  const result = { investmentCashFlow: 0, nonCouponInvestmentCashFlow: 0, bondCoupons: 0, structuredCoupons: 0, dividends: 0, purchases: 0, salesAndRedemptions: 0 };
  const transactions = (state.transactions || []).filter(row => transactionInMonthlyPeriod(row, openingDate, closingDate));
  transactions.forEach(row => {
    const value = transactionValueEur(row);
    const isBondPayment = row.type === "Bond Payment";
    const bondCoupon = isBondPayment ? bondCouponReceivedEur(row) : 0;
    const isStructuredCoupon = row.type === "Structured Coupon";
    const isDividend = isDividendTransaction(row);
    const coupon = bondCoupon + (isStructuredCoupon ? Math.max(0, value) : 0) + (isDividend ? Math.max(0, value) : 0);
    const investmentType = ["Buy", "Sell", "Bond Sell", "Early Redemption", "Redemption", "Bond Payment", "Structured Buy", "Structured Coupon", "Structured Redemption"].includes(row.type) || isDividend;
    if (!investmentType) return;
    result.investmentCashFlow += value;
    result.nonCouponInvestmentCashFlow += value - coupon;
    result.bondCoupons += bondCoupon;
    result.structuredCoupons += isStructuredCoupon ? Math.max(0, value) : 0;
    result.dividends += isDividend ? Math.max(0, value) : 0;
    if (value < 0) result.purchases += value;
    else if (value > 0 && !isStructuredCoupon && !isDividend && !isBondPayment) result.salesAndRedemptions += value;
    else if (isBondPayment) result.salesAndRedemptions += Math.max(0, value - bondCoupon);
  });
  return result;
}

function monthlyCashFxImpact(previousClose, closingEurUsd) {
  return (previousClose?.cashRows || []).reduce((sum, row) => sum + numberValue(row.amount) * fxAtRate(row.currency || "EUR", closingEurUsd) - numberValue(row.valueEur), 0);
}

function monthlyAnalysis(previousClose, date, inputs, totals = currentMonthlyTotals(), cashRows = currentMonthlyCashRows()) {
  if (!previousClose) return null;
  const tx = monthlyTransactionSummary(previousClose.date, date);
  const opening = previousClose.totals || {};
  const personalIncome = numberValue(inputs.salary.valueEur) + numberValue(inputs.bonus.valueEur) + numberValue(inputs.otherIncome.valueEur);
  const adjustment = numberValue(inputs.cashAdjustment.valueEur);
  const cashChange = numberValue(totals.cash) - numberValue(opening.cash);
  const cashFxImpact = monthlyCashFxImpact(previousClose, state.eurUsd);
  const rawExpenses = personalIncome + adjustment + tx.investmentCashFlow + cashFxImpact - cashChange;
  const inferredExpenses = Math.max(0, rawExpenses);
  const unexplainedCashInflow = Math.max(0, -rawExpenses);
  const stockFlow = (state.transactions || []).filter(row => transactionInMonthlyPeriod(row, previousClose.date, date) && ["Buy", "Sell"].includes(row.type)).reduce((sum, row) => sum + transactionValueEur(row), 0);
  const bondFlow = (state.transactions || []).filter(row => transactionInMonthlyPeriod(row, previousClose.date, date) && ["Bond Sell", "Early Redemption", "Redemption", "Bond Payment"].includes(row.type)).reduce((sum, row) => sum + transactionValueEur(row), 0);
  const structuredFlow = (state.transactions || []).filter(row => transactionInMonthlyPeriod(row, previousClose.date, date) && ["Structured Buy", "Structured Coupon", "Structured Redemption"].includes(row.type)).reduce((sum, row) => sum + transactionValueEur(row), 0);
  const stockPerformance = numberValue(totals.stocks) - numberValue(opening.stocks) + stockFlow;
  const bondTotalReturn = numberValue(totals.bonds) - numberValue(opening.bonds) + bondFlow;
  const bondPerformance = bondTotalReturn - tx.bondCoupons;
  const structuredTotalReturn = numberValue(totals.structured) - numberValue(opening.structured) + structuredFlow;
  const structuredPerformance = structuredTotalReturn - tx.structuredCoupons;
  const privatePerformance = numberValue(totals.private) - numberValue(opening.private);
  const otherPerformance = numberValue(totals.divers) - numberValue(opening.divers);
  const investmentIncome = tx.bondCoupons + tx.structuredCoupons + tx.dividends;
  const investmentResult = stockPerformance + bondPerformance + structuredPerformance + privatePerformance + otherPerformance + investmentIncome;
  const incomeSavings = personalIncome - inferredExpenses;
  const totalChange = numberValue(totals.total) - numberValue(opening.total);
  const fxAndReconciliation = totalChange - incomeSavings - investmentResult - adjustment;
  return { openingTotal: numberValue(opening.total), closingTotal: numberValue(totals.total), totalChange, openingCash: numberValue(opening.cash), closingCash: numberValue(totals.cash), cashChange, personalIncome, cashAdjustment: adjustment, cashFxImpact, investmentCashFlow: tx.investmentCashFlow, nonCouponInvestmentCashFlow: tx.nonCouponInvestmentCashFlow, bondCoupons: tx.bondCoupons, structuredCoupons: tx.structuredCoupons, dividends: tx.dividends, investmentIncome, inferredExpenses, unexplainedCashInflow, incomeSavings, stockPerformance, bondPerformance, structuredPerformance, privatePerformance, otherPerformance, investmentResult, fxAndReconciliation };
}

function economicBarRowsHtml(rows) {
  const max = Math.max(1, ...rows.map(row => Math.abs(numberValue(row.value))));
  return rows.map(row => {
    const value = numberValue(row.value);
    const width = Math.max(value ? 3 : 0, Math.min(48, Math.abs(value) / max * 48));
    const tone = row.tone || (value < 0 ? "negative" : "positive");
    return `<div class="economic-bar-row">
      <div class="economic-bar-label"><strong>${escapeHtml(row.label)}</strong><small>${escapeHtml(row.detail || "")}</small></div>
      <div class="economic-bar-track"><span class="economic-bar-fill ${tone}" style="--bar-width:${width.toFixed(2)}"></span></div>
      <div class="economic-bar-value ${signedClass(value)}">${displayMoney(value, row.digits ?? 0)}</div>
    </div>`;
  }).join("");
}

function economicListRowsHtml(rows) {
  return rows.map(row => `<div class="economic-list-row"><div><span>${escapeHtml(row.label)}</span>${row.badge ? `<small class="economic-badge">${escapeHtml(row.badge)}</small>` : ""}</div><strong class="${row.tone || signedClass(row.value)}">${row.text || displayMoney(row.value, row.digits ?? 0)}</strong></div>`).join("");
}

function realizedStockPnlEur() {
  return (state.transactions || [])
    .filter(row => row.type === "Sell")
    .reduce((sum, row) => sum + numberValue(row.realizedPnlEur), 0);
}

function computeFxRisk() {
  const eurUsd = Math.max(0.0001, numberValue(state.eurUsd));
  let usdNative = 0;
  let eurValue = 0;
  let otherValue = 0;

  const addCurrencyValue = (currency, nativeValue) => {
    const value = numberValue(nativeValue);
    if ((currency || "EUR") === "USD") usdNative += value;
    else if ((currency || "EUR") === "EUR") eurValue += value;
    else otherValue += value * fx(currency);
  };

  state.stocks.forEach(row => addCurrencyValue(row.currency, numberValue(row.qty) * numberValue(row.price)));
  state.bonds.forEach(row => addCurrencyValue(row.currency, bondCleanValueCurrency(row) + bondAccruedCurrency(row)));
  (state.argentinaBonds || []).forEach(row => addCurrencyValue(row.currency, argentinaBondDirtyValueCurrency(row)));
  (state.structuredProducts || []).forEach(row => addCurrencyValue(row.currency, structuredProductValueEur(row)));
  state.cash.forEach(row => addCurrencyValue(row.currency, row.amount));
  state.privateAssets.forEach(row => { eurValue += privateValueEur(row); });
  state.realEstate.forEach(row => addCurrencyValue(row.currency, numberValue(row.grossValue) - remainingLoanCurrency(row)));
  state.divers.forEach(row => addCurrencyValue(row.currency, numberValue(row.qty) * numberValue(row.unitPrice)));

  const usdValue = usdNative / eurUsd;
  const total = usdValue + eurValue + otherValue;
  const downRate = eurUsd * 0.95;
  const upRate = eurUsd * 1.05;
  const downTotal = usdNative / downRate + eurValue + otherValue;
  const upTotal = usdNative / upRate + eurValue + otherValue;
  return {
    eurUsd,
    usdValue,
    eurValue,
    otherValue,
    usdNative,
    total,
    downImpact: downTotal - total,
    upImpact: upTotal - total
  };
}

function totalsByBank() {
  const rows = new Map();
  const ensure = bank => {
    const key = bank || "Unallocated";
    if (!rows.has(key)) rows.set(key, { bank: key, stocks: 0, bonds: 0, structured: 0, cash: 0, privateValue: 0, realEstate: 0, divers: 0, pnl: 0, lines: [] });
    return rows.get(key);
  };
  state.stocks.forEach(row => {
    const bucket = ensure(row.bank);
    const value = stockValueEur(row);
    const pnl = stockTotalPnlEur(row);
    bucket.stocks += value;
    bucket.pnl += pnl;
    bucket.lines.push({ type: "Stocks", name: row.symbol || row.name || "Stock", value, pnl });
  });
  state.bonds.forEach(row => {
    const bucket = ensure(row.bank);
    const value = bondValueEur(row);
    const pnl = bondPnlEur(row);
    bucket.bonds += value;
    bucket.pnl += pnl;
    bucket.lines.push({ type: "Bonds", name: row.name || row.issuer || "Bond", value, pnl });
  });
  (state.argentinaBonds || []).forEach(row => {
    const bucket = ensure(row.bank);
    const value = argentinaBondDirtyValueEur(row);
    bucket.bonds += value;
    bucket.lines.push({ type: "Argentina bonds", name: row.isin || row.name || "Argentina bond", value });
  });
  (state.structuredProducts || []).forEach(row => {
    const bucket = ensure(row.bank);
    const value = structuredProductValueEur(row);
    bucket.structured += value;
    bucket.lines.push({ type: "Structured products", name: `${row.name} (${row.isin})`, value });
  });
  state.cash.forEach(row => {
    const bucket = ensure(row.bank);
    const value = cashValueEur(row);
    bucket.cash += value;
    bucket.lines.push({ type: "Cash", name: row.name || row.currency || "Cash", value });
  });
  state.privateAssets.forEach(row => {
    const bucket = ensure(row.bank);
    const value = privateValueEur(row);
    bucket.privateValue += value;
    bucket.lines.push({ type: "Private equity", name: row.name || "Private equity", value });
  });
  state.realEstate.forEach(row => {
    const bucket = ensure(row.bank);
    const value = realEstateNetEur(row);
    bucket.realEstate += value;
    bucket.lines.push({ type: "Real estate", name: row.name || row.city || "Property", value });
  });
  state.divers.forEach(row => {
    const bucket = ensure(row.bank);
    const value = diversValueEur(row);
    bucket.divers += value;
    bucket.lines.push({ type: "Other", name: row.name || row.category || "Other", value });
  });
  return [...rows.values()].map(row => ({ ...row, total: row.stocks + row.bonds + row.structured + row.cash + row.privateValue + row.realEstate + row.divers })).sort((a, b) => b.total - a.total);
}

function kpiValuePct(value, total) {
  return total ? pct(numberValue(value) / total * 100) : pct(0);
}

function assetClassDetailRows() {
  const t = computeTotals();
  return [
    { label: "Listed stocks", value: t.stocksValue, detail: `${state.stocks.length} line(s)`, pnl: t.stocksTotalPnl },
    { label: "Bonds", value: t.bondsValue, detail: `${state.bonds.length} line(s)`, pnl: t.bondsPnl },
    { label: "Structured products", value: t.structuredValue, detail: `${(state.structuredProducts || []).filter(row => row.status === "active").length} active product(s)` },
    { label: "Cash", value: t.cashValue, detail: `${state.cash.length} account(s)` },
    { label: "Private equity", value: t.privateValue, detail: `${state.privateAssets.length} line(s)` },
    { label: "Real estate", value: t.realEstateValue, detail: `${state.realEstate.length} property(ies)` },
    { label: "Other", value: t.diversValue, detail: `${state.divers.length} investment(s)` }
  ].filter(row => row.value || row.detail);
}

function snapshotLine(key, name, detail, value) {
  return {
    key,
    name: name || "Unnamed",
    detail: detail || "",
    value: numberValue(value)
  };
}

function snapshotDetails() {
  return {
    stocks: state.stocks.map(row => snapshotLine(
      `${String(row.symbol || row.name || "stock").trim().toUpperCase()}|${row.bank || ""}|${row.currency || ""}`,
      row.symbol || row.name || "Stock",
      `${row.name || ""} | ${row.bank || "Unallocated"} | ${numberValue(row.qty).toLocaleString("en-US", { maximumFractionDigits: 4 })} sh.`,
      stockValueEur(row)
    )),
    bonds: [
      ...state.bonds.map(row => snapshotLine(
        `${String(row.isin || row.name || row.issuer || "bond").trim().toUpperCase()}|${row.bank || ""}|${row.currency || ""}`,
        row.name || row.issuer || row.isin || "Bond",
        `${row.bank || "Unallocated"} | ${row.type || "Bond"} | nominal ${numberValue(row.nominal).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
        bondValueEur(row)
      )),
      ...(state.argentinaBonds || []).map(row => snapshotLine(
        `${String(row.isin || row.name || "argentina-bond").trim().toUpperCase()}|${row.bank || ""}|${row.currency || ""}`,
        row.isin || row.name || "Argentina bond",
        `${row.bank || "Unallocated"} | Argentina amortizing | nominal ${numberValue(row.currentNominal).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
        argentinaBondDirtyValueEur(row)
      ))
    ],
    structured: (state.structuredProducts || []).map(row => snapshotLine(
      row.isin,
      row.name,
      `${row.bank || "Transatlantique"} | ${row.status || "active"} | nominal ${numberValue(row.notional).toLocaleString("en-US")}`,
      structuredProductValueEur(row)
    )),
    cash: state.cash.map(row => snapshotLine(
      `${String(row.name || "cash").trim().toUpperCase()}|${row.bank || ""}|${row.currency || ""}`,
      row.name || row.currency || "Cash",
      `${row.bank || "Unallocated"} | ${row.currency || "EUR"} ${numberValue(row.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      cashValueEur(row)
    )),
    private: state.privateAssets.map(row => snapshotLine(
      `${String(row.name || "private").trim().toUpperCase()}|${row.bank || ""}`,
      row.name || "Private equity",
      `${row.bank || "Unallocated"} | called ${displayMoney(row.calledEur, 0)} / commitment ${displayMoney(row.commitmentEur, 0)}`,
      privateValueEur(row)
    )),
    realestate: state.realEstate.map(row => snapshotLine(
      `${String(row.name || row.city || "property").trim().toUpperCase()}|${row.city || ""}|${row.bank || ""}`,
      row.name || row.city || "Property",
      `${row.city || "No city"} | debt ${displayMoney(realEstateDebtEur(row), 0)} | gross ${displayMoney(realEstateGrossEur(row), 0)}`,
      realEstateNetEur(row)
    )),
    divers: state.divers.map(row => snapshotLine(
      `${String(row.name || row.category || "other").trim().toUpperCase()}|${row.bank || ""}|${row.currency || ""}`,
      row.name || row.category || "Other",
      `${row.bank || "Unallocated"} | ${row.category || "Other"} | ${row.currency || "EUR"}`,
      diversValueEur(row)
    ))
  };
}

function kpiRowsFor(key) {
  const t = computeTotals();
  const total = t.total;
  if (key === "total") {
    return assetClassDetailRows().map(row => ({
      name: row.label,
      detail: row.detail,
      value: row.value,
      weight: kpiValuePct(row.value, total),
      pnl: row.pnl
    })).sort((a, b) => b.value - a.value);
  }
  if (key === "liquid") {
    const liquid = t.stocksValue + t.liquidBondsValue + t.structuredValue + t.cashValue;
    return [
      { name: "Listed stocks", detail: `${state.stocks.length} line(s)`, value: t.stocksValue, weight: kpiValuePct(t.stocksValue, liquid), pnl: t.stocksTotalPnl },
      { name: "Liquid bonds", detail: `${state.bonds.filter(row => !isLongTermBond(row)).length + (state.argentinaBonds || []).length} line(s)`, value: t.liquidBondsValue, weight: kpiValuePct(t.liquidBondsValue, liquid), pnl: t.liquidBondsPnl },
      { name: "Structured products", detail: `${(state.structuredProducts || []).filter(row => row.status === "active").length} active product(s)`, value: t.structuredValue, weight: kpiValuePct(t.structuredValue, liquid) },
      { name: "Cash", detail: `${state.cash.length} account(s)`, value: t.cashValue, weight: kpiValuePct(t.cashValue, liquid) }
    ].sort((a, b) => b.value - a.value);
  }
  if (key === "longterm") {
    const longTerm = t.privateValue + t.realEstateValue + t.diversValue + t.longTermBondsValue;
    return [
      { name: "Locked bonds", detail: `${state.bonds.filter(isLongTermBond).length} Absolut/Absolute line(s)`, value: t.longTermBondsValue, weight: kpiValuePct(t.longTermBondsValue, longTerm), pnl: t.longTermBondsPnl },
      { name: "Private equity", detail: `${state.privateAssets.length} line(s)`, value: t.privateValue, weight: kpiValuePct(t.privateValue, longTerm) },
      { name: "Real estate", detail: `${state.realEstate.length} property(ies)`, value: t.realEstateValue, weight: kpiValuePct(t.realEstateValue, longTerm) },
      { name: "Other", detail: `${state.divers.length} investment(s)`, value: t.diversValue, weight: kpiValuePct(t.diversValue, longTerm) }
    ].sort((a, b) => b.value - a.value);
  }
  if (key === "daily") {
    return state.stocks.map(row => ({
      name: row.symbol || row.name || "Stock",
      detail: `${row.bank || "Unallocated"} | ${numberValue(row.qty).toLocaleString("en-US", { maximumFractionDigits: 4 })} sh.`,
      value: stockDayPnlEur(row),
      weight: kpiValuePct(stockDayPnlEur(row), Math.abs(t.stocksDayPnl) || t.stocksValue),
      pnl: stockTotalPnlEur(row)
    })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }
  if (key === "stocks") {
    return stockExposures().map(row => ({
      name: row.symbol,
      detail: `${row.name || "Unnamed"} | ${row.bankCount} bank(s)`,
      value: row.valueEur,
      weight: kpiValuePct(row.valueEur, t.stocksValue),
      pnl: row.totalPnlEur
    }));
  }
  if (key === "bonds") {
    return [
      ...state.bonds.map(row => ({
      name: row.name || row.issuer || "Bond",
      detail: `${row.bank || "Unallocated"} | ${row.type || "Bond"} | accrued ${displayMoney(bondAccruedEur(row), 2)}`,
      value: bondValueEur(row),
      weight: kpiValuePct(bondValueEur(row), t.bondsValue),
      pnl: bondPnlEur(row)
      })),
      ...(state.argentinaBonds || []).map(row => ({
        name: row.isin || row.name || "Argentina bond",
        detail: `${row.bank || "Unallocated"} | Argentina amortizing | accrued ${displayMoney(argentinaBondAccruedEur(row), 2)}`,
        value: argentinaBondDirtyValueEur(row),
        weight: kpiValuePct(argentinaBondDirtyValueEur(row), t.bondsValue),
        pnl: undefined
      }))
    ].sort((a, b) => b.value - a.value);
  }
  if (key === "structured") {
    return (state.structuredProducts || []).map(row => ({
      name: row.name,
      detail: `${row.isin} | ${row.bank} | ${row.status}`,
      value: structuredProductValueEur(row),
      weight: kpiValuePct(structuredProductValueEur(row), t.structuredValue)
    })).sort((a, b) => b.value - a.value);
  }
  if (key === "cash") {
    return state.cash.map(row => ({
      name: row.name || row.currency || "Cash",
      detail: `${row.bank || "Unallocated"} | ${row.currency || "EUR"} ${numberValue(row.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      value: cashValueEur(row),
      weight: kpiValuePct(cashValueEur(row), t.cashValue)
    })).sort((a, b) => b.value - a.value);
  }
  if (key === "private") {
    return state.privateAssets.map(row => ({
      name: row.name || "Private equity",
      detail: `${row.bank || "Unallocated"} | called ${displayMoney(row.calledEur, 0)} / commitment ${displayMoney(row.commitmentEur, 0)}`,
      value: privateValueEur(row),
      weight: kpiValuePct(privateValueEur(row), t.privateValue)
    })).sort((a, b) => b.value - a.value);
  }
  if (key === "realestate") {
    return state.realEstate.map(row => ({
      name: row.name || row.city || "Property",
      detail: `${row.city || "No city"} | debt ${displayMoney(realEstateDebtEur(row), 0)} | gross ${displayMoney(realEstateGrossEur(row), 0)}`,
      value: realEstateNetEur(row),
      weight: kpiValuePct(realEstateNetEur(row), t.realEstateValue)
    })).sort((a, b) => b.value - a.value);
  }
  if (key === "divers") {
    return state.divers.map(row => ({
      name: row.name || row.category || "Other",
      detail: `${row.bank || "Unallocated"} | ${row.category || "Other"} | ${row.currency || "EUR"}`,
      value: diversValueEur(row),
      weight: kpiValuePct(diversValueEur(row), t.diversValue)
    })).sort((a, b) => b.value - a.value);
  }
  if (key === "banks") {
    return totalsByBank().map(row => ({
      name: row.bank,
      detail: `${row.lines.length} line(s)`,
      value: row.total,
      weight: kpiValuePct(row.total, total),
      pnl: row.pnl
    }));
  }
  return [];
}

function kpiDefinition(key) {
  const t = computeTotals();
  const dayPct = t.stocksPrevious ? t.stocksDayPnl / t.stocksPrevious * 100 : 0;
  const liquidValue = t.stocksValue + t.liquidBondsValue + t.structuredValue + t.cashValue;
  const longTermValue = t.privateValue + t.realEstateValue + t.diversValue + t.longTermBondsValue;
  const defs = {
    total: {
      title: "Total wealth",
      subtitle: "Breakdown by asset class.",
      summary: [["Total", displayMoney(t.total, 2)], ["Liquid", displayMoney(liquidValue, 2)], ["Long term", displayMoney(longTermValue, 2)]]
    },
    liquid: {
      title: "Liquid assets",
      subtitle: "Stocks, liquid bonds and cash. Absolut/Absolute bonds are treated as locked until early redemption or maturity.",
      summary: [["Liquid total", displayMoney(liquidValue, 2)], ["Weight", kpiValuePct(liquidValue, t.total)], ["Lines", String(state.stocks.length + state.bonds.filter(row => !isLongTermBond(row)).length + (state.argentinaBonds || []).length + state.cash.length)]]
    },
    longterm: {
      title: "Long-term assets",
      subtitle: "Locked bonds, private equity, real estate and other manual assets.",
      summary: [["Long-term total", displayMoney(longTermValue, 2)], ["Weight", kpiValuePct(longTermValue, t.total)], ["Lines", String(state.bonds.filter(isLongTermBond).length + state.privateAssets.length + state.realEstate.length + state.divers.length)]]
    },
    daily: {
      title: "Daily PnL",
      subtitle: "Stock contribution by line, based on previous close.",
      summary: [["Daily PnL", displayMoney(t.stocksDayPnl, 2)], ["Move", pct(dayPct)], ["Stock value", displayMoney(t.stocksValue, 2)]]
    },
    stocks: {
      title: "Listed stocks",
      subtitle: "Consolidated exposure by ticker.",
      summary: [["Value", displayMoney(t.stocksValue, 2)], ["Total PnL", displayMoney(t.stocksTotalPnl, 2)], ["Lines", String(state.stocks.length)]]
    },
    bonds: {
      title: "Bonds",
      subtitle: "Dirty value by bond, including accrued coupon.",
      summary: [["Dirty value", displayMoney(t.bondsValue, 2)], ["Accrued", displayMoney(t.bondsAccrued, 2)], ["Total PnL", displayMoney(t.bondsPnl, 2)]]
    },
    structured: {
      title: "Structured products",
      subtitle: "Active reverse convertible and worst-of Phoenix positions.",
      summary: [["Value", displayMoney(t.structuredValue, 2)], ["Active products", String((state.structuredProducts || []).filter(row => row.status === "active").length)], ["Coupons credited", displayMoney(structuredCouponRows().reduce((sum, row) => sum + numberValue(row.processed?.amount), 0), 2)]]
    },
    cash: {
      title: "Cash",
      subtitle: "Cash accounts revalued in EUR.",
      summary: [["Cash total", displayMoney(t.cashValue, 2)], ["Accounts", String(state.cash.length)], ["EUR/USD", numberValue(state.eurUsd).toFixed(4)]]
    },
    private: {
      title: "Private equity",
      subtitle: "Manual private asset valuations.",
      summary: [["Value", displayMoney(t.privateValue, 2)], ["Lines", String(state.privateAssets.length)], ["Weight", kpiValuePct(t.privateValue, t.total)]]
    },
    realestate: {
      title: "Real estate",
      subtitle: "Net property value after debt.",
      summary: [["Net value", displayMoney(t.realEstateValue, 2)], ["Properties", String(state.realEstate.length)], ["Weight", kpiValuePct(t.realEstateValue, t.total)]]
    },
    divers: {
      title: "Other",
      subtitle: "Manual investments and other assets.",
      summary: [["Value", displayMoney(t.diversValue, 2)], ["Lines", String(state.divers.length)], ["Weight", kpiValuePct(t.diversValue, t.total)]]
    },
    banks: {
      title: "Institutions",
      subtitle: "Consolidated value by bank or custodian.",
      summary: [["Total", displayMoney(t.total, 2)], ["Banks", String(totalsByBank().length)], ["EUR/USD", numberValue(state.eurUsd).toFixed(4)]]
    }
  };
  return defs[key] || defs.total;
}

function openKpiDetail(key) {
  const def = kpiDefinition(key);
  const rows = kpiRowsFor(key);
  els.kpiModalEyebrow.textContent = "KPI details";
  els.kpiModalTitle.textContent = def.title;
  els.kpiModalSubtitle.textContent = def.subtitle;
  els.kpiModalSummary.innerHTML = def.summary.map(([label, value]) => `<div class="kpi-summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  els.kpiModalHead.innerHTML = `<tr><th>Name</th><th>Detail</th><th class="num">${displayCurrencyLabel()} value</th><th class="num">Weight</th><th class="num">PnL</th></tr>`;
  els.kpiModalBody.innerHTML = rows.length ? rows.map(row => `<tr>
    <td><strong>${escapeHtml(row.name)}</strong></td>
    <td>${escapeHtml(row.detail || "")}</td>
    <td class="num total-highlight">${displayMoney(row.value, 2)}</td>
    <td class="num">${escapeHtml(row.weight || "")}</td>
    <td class="num ${row.pnl === undefined ? "" : signedClass(row.pnl)}">${row.pnl === undefined ? "-" : displayMoney(row.pnl, 2)}</td>
  </tr>`).join("") : `<tr><td colspan="5"><div class="empty">No detail available for this KPI.</div></td></tr>`;
  els.kpiModalFoot.textContent = `Source: ${rows.length} row(s) from the dashboard data currently loaded in the browser.`;
  openAccessibleModal(els.kpiModal, els.kpiModalClose);
}

function transactionAssetKey(txn) {
  if (txn.type === "Sell" || txn.type === "Buy") return "stocks";
  if (["Structured Buy", "Structured Coupon", "Structured Redemption"].includes(txn.type)) return "structured";
  if (isBondTransactionType(txn.type) || isBondLikeTransactionType(txn.type)) return "bonds";
  if (isCashTransactionType(txn.type)) return "cash";
  return "";
}

function movementRowsFor(key, referenceDate) {
  const assetRows = kpiRowsFor(key).map(row => ({
    source: "Current line",
    name: row.name,
    detail: row.detail,
    value: row.value,
    activity: row.pnl === undefined ? "" : `PnL ${displayMoney(row.pnl, 2)}`
  }));
  const txns = (state.transactions || [])
    .filter(txn => String(txn.date || "") > referenceDate && transactionAssetKey(txn) === key)
    .map(txn => ({
      source: "Transaction",
      name: txn.symbol || txn.name || txn.type || "Transaction",
      detail: `${txn.date || "-"} | ${txn.type || "-"} | ${txn.bank || "Unallocated"}`,
      value: numberValue(txn.cashImpact) * fx(txn.currency || "EUR"),
      activity: txn.cashImpact ? signedMoney(txn.cashImpact, txn.currency || "EUR", 2) : "",
      note: txn.note || txn.name || ""
    }));
  return [...txns, ...assetRows].sort((a, b) => Math.abs(numberValue(b.value)) - Math.abs(numberValue(a.value)));
}

function currentSnapshotDetailRows(key) {
  return snapshotDetails()[key] || [];
}

function detailedMovementRows(key, referenceSnapshot) {
  const beforeRows = referenceSnapshot.details?.[key];
  if (!Array.isArray(beforeRows)) return null;
  const currentRows = currentSnapshotDetailRows(key);
  const map = new Map();
  beforeRows.forEach(row => {
    const entry = map.get(row.key) || { key: row.key, name: row.name, detail: row.detail, before: 0, now: 0 };
    entry.name = entry.name || row.name;
    entry.detail = entry.detail || row.detail;
    entry.before += numberValue(row.value);
    map.set(row.key, entry);
  });
  currentRows.forEach(row => {
    const entry = map.get(row.key) || { key: row.key, name: row.name, detail: row.detail, before: 0, now: 0 };
    entry.name = row.name || entry.name;
    entry.detail = row.detail || entry.detail;
    entry.now += numberValue(row.value);
    map.set(row.key, entry);
  });
  return [...map.values()].map(row => ({
    ...row,
    impact: row.now - row.before,
    status: row.before && row.now ? "Changed / held" : (row.now ? "New since snapshot" : "Removed since snapshot")
  })).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
}

function openWealthBridgeDetail(key) {
  const reference = wealthBridgeReferenceSnapshot();
  if (!reference) return;
  const t = computeTotals();
  const last = reference.snapshot;
  const totals = {
    stocks: { title: "Listed stocks", before: numberValue(last.stocksValue), now: t.stocksValue },
    bonds: { title: "Bonds", before: numberValue(last.bondsValue), now: t.bondsValue },
    structured: { title: "Structured products", before: numberValue(last.structuredValue), now: t.structuredValue },
    cash: { title: "Cash", before: numberValue(last.cashValue), now: t.cashValue },
    private: { title: "Private equity", before: numberValue(last.privateValue), now: t.privateValue },
    realestate: { title: "Real estate", before: numberValue(last.realEstateValue), now: t.realEstateValue },
    divers: { title: "Other", before: numberValue(last.diversValue), now: t.diversValue }
  };
  const def = totals[key];
  if (!def) return;
  const impact = def.now - def.before;
  const detailedRows = detailedMovementRows(key, last);
  const rows = detailedRows || movementRowsFor(key, last.date);
  els.kpiModalEyebrow.textContent = "Movement attribution";
  els.kpiModalTitle.textContent = `${def.title} movement`;
  els.kpiModalSubtitle.textContent = detailedRows
    ? `Current vs snapshot ${last.date}. Variation is shown underlying by underlying.`
    : `Current vs snapshot ${last.date}. This older snapshot has no saved line-level detail, so current lines and transactions are shown as a fallback.`;
  els.kpiModalSummary.innerHTML = [
    ["Before", displayMoney(def.before, 2)],
    ["Now", displayMoney(def.now, 2)],
    ["Impact", displayMoney(impact, 2)]
  ].map(([label, value]) => `<div class="kpi-summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  if (detailedRows) {
    els.kpiModalHead.innerHTML = `<tr><th>Underlying</th><th>Detail</th><th class="num">Snapshot</th><th class="num">Today</th><th class="num">Variation</th><th>Status</th></tr>`;
    els.kpiModalBody.innerHTML = rows.length ? rows.map(row => `<tr>
      <td><strong>${escapeHtml(row.name || "")}</strong></td>
      <td>${escapeHtml(row.detail || "")}</td>
      <td class="num">${displayMoney(row.before, 2)}</td>
      <td class="num">${displayMoney(row.now, 2)}</td>
      <td class="num ${signedClass(row.impact)}">${displayMoney(row.impact, 2)}</td>
      <td>${escapeHtml(row.status)}</td>
    </tr>`).join("") : `<tr><td colspan="6"><div class="empty">No line-level movement available for this driver.</div></td></tr>`;
    els.kpiModalFoot.textContent = "Each underlying is compared with the selected snapshot date. New and removed lines are also shown.";
  } else {
    els.kpiModalHead.innerHTML = `<tr><th>Source</th><th>Name</th><th>Detail</th><th class="num">EUR value / cash</th><th>Activity</th></tr>`;
    els.kpiModalBody.innerHTML = rows.length ? rows.map(row => `<tr>
      <td>${escapeHtml(row.source)}</td>
      <td><strong>${escapeHtml(row.name || "")}</strong></td>
      <td>${escapeHtml(row.detail || row.note || "")}</td>
      <td class="num ${row.source === "Transaction" ? signedClass(row.value) : "total-highlight"}">${displayMoney(row.value, 2)}</td>
      <td>${escapeHtml(row.activity || row.note || "")}</td>
    </tr>`).join("") : `<tr><td colspan="5"><div class="empty">No current line or transaction detail available for this driver.</div></td></tr>`;
    els.kpiModalFoot.textContent = "This reference snapshot only stored asset-class totals. Create a fresh snapshot to unlock true line-by-line attribution for future comparisons.";
  }
  openAccessibleModal(els.kpiModal, els.kpiModalClose);
}

function closeKpiDetail() {
  closeAccessibleModal(els.kpiModal);
}

function openAccessibleModal(modal, focusTarget) {
  if (!modal) return;
  modalReturnFocus.set(modal.id, document.activeElement);
  modal.classList.add("open");
  document.querySelector(".app")?.setAttribute("inert", "");
  activeModal = modal;
  window.requestAnimationFrame(() => focusTarget?.focus());
}

function closeAccessibleModal(modal) {
  if (!modal) return;
  modal.classList.remove("open");
  const remaining = document.querySelector(".kpi-modal.open");
  activeModal = remaining || null;
  if (!remaining) document.querySelector(".app")?.removeAttribute("inert");
  const returnTarget = modalReturnFocus.get(modal.id);
  modalReturnFocus.delete(modal.id);
  if (returnTarget?.isConnected) window.requestAnimationFrame(() => returnTarget.focus());
}

function trapModalFocus(event) {
  if (event.key !== "Tab" || !activeModal?.classList.contains("open")) return;
  const focusable = [...activeModal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.closest(".hidden") && element.getClientRects().length);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function makeKpiClickable(element, key, label) {
  if (!element) return;
  element.classList.add("kpi-clickable");
  element.dataset.kpiDetail = key;
  element.setAttribute("role", "button");
  element.setAttribute("tabindex", "0");
  element.setAttribute("aria-label", `View details for ${label}`);
}

function configureKpiDetails() {
  makeKpiClickable(els.dashboardHeroStat, "total", "total wealth");
  makeKpiClickable(els.totalWealth.closest(".stat"), "total", "total wealth");
  makeKpiClickable(els.dailyPnl.closest(".stat"), "daily", "daily PnL");
  makeKpiClickable(els.stocksValue.closest(".stat"), "stocks", "listed stocks");
  makeKpiClickable(els.bondsValue.closest(".stat"), "bonds", "bonds");
  makeKpiClickable(els.structuredValue.closest(".stat"), "structured", "structured products");
  makeKpiClickable(els.cashValue.closest(".stat"), "cash", "cash");
  makeKpiClickable(els.peValue.closest(".stat"), "private", "private equity");
  makeKpiClickable(els.realEstateValue.closest(".stat"), "realestate", "real estate");
  makeKpiClickable(els.diversValue.closest(".stat"), "divers", "other assets");
  makeKpiClickable(els.executiveTotal.closest(".executive-cell"), "total", "total wealth");
  makeKpiClickable(els.executiveDailyPnl.closest(".executive-cell"), "daily", "listed performance");
  makeKpiClickable(els.executiveCash.closest(".executive-cell"), "cash", "liquidity");
}

function updateField(collection, index, key, value) {
  const numeric = ["qty", "price", "previousClose", "cost", "amount", "valueEur", "commitmentEur", "calledEur", "nominal", "originalNominal", "currentNominal", "cleanPrice", "costPrice", "couponRate", "frequency", "totalPayments", "unitPrice", "grossValue", "debt", "originalLoan", "annualRate", "termYears", "monthlyRent", "monthlyCosts"];
  state[collection][index][key] = numeric.includes(key) ? numberValue(value) : value;
  saveState();
  if (collection === "stocks") {
    renderTotals();
    renderStockExposures();
    renderBanks();
    return;
  }
  render();
}

function renderInput(value, oninput, attrs = "") {
  return `<input ${attrs} value="${escapeHtml(value ?? "")}" onchange="${oninput}">`;
}

function renderLiveInput(value, oninput, attrs = "") {
  return `<input ${attrs} value="${escapeHtml(value ?? "")}" oninput="${oninput}" onchange="${oninput}">`;
}

function knownBanks() {
  const banks = new Set();
  ["stocks", "bonds", "argentinaBonds", "cash", "privateAssets", "realEstate", "divers"].forEach(collection => {
    (state[collection] || []).forEach(row => {
      const bank = String(row.bank || "").trim();
      if (bank) banks.add(bank);
    });
  });
  return [...banks].sort((a, b) => a.localeCompare(b));
}

function renderBankOptions(select, selected = "") {
  const normalizedSelected = String(selected || "").trim();
  const banks = knownBanks();
  if (normalizedSelected && !banks.includes(normalizedSelected)) banks.unshift(normalizedSelected);
  if (!banks.length) banks.push("Unallocated");
  select.innerHTML = banks.map(bank => `<option value="${escapeHtml(bank)}">${escapeHtml(bank)}</option>`).join("");
  select.value = normalizedSelected || banks[0] || "Unallocated";
}

function renderBuyBankOptions(selected = "") {
  renderBankOptions(els.buyBank, selected);
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

const sortableTables = {
  dashboardBankBody: { keys: ["bank", "total", "total"], types: ["text", "number", "number"], render: () => renderTotals() },
  stockExposureBody: { keys: [null, "symbol", "name", "qty", "avgPrice", "avgPreviousClose", "dayMovePct", "weightedCost", "valueEur", "dayPnlEur", "totalPnlEur", "bankCount"], types: [null, "text", "text", "number", "number", "number", "number", "number", "number", "number", "number", "number"], render: renderStockExposures },
  stocksBody: { collection: "stocks", keys: ["symbol", "name", "bank", "qty", "cost", "currency", "valueEur", "dayPnlEur", "totalPnlEur", null], types: ["text", "text", "text", "number", "number", "text", "number", "number", "number", null], render: renderStocks },
  transactionsBody: { keys: ["date", "type", "symbol", "bank", "qty", "price", "currency", "cashImpact", "realizedPnlEur", "note"], types: ["date", "text", "text", "text", "number", "number", "text", "number", "number", "text"], render: renderTransactions },
  bondTransactionsBody: { keys: ["date", "type", "symbol", "bank", "qty", "price", "currency", "cashImpact", "realizedPnlEur", "note"], types: ["date", "text", "text", "text", "number", "number", "text", "number", "number", "text"], render: renderBondTransactions },
  cashTransactionsBody: { keys: ["date", "type", "symbol", "bank", "cashImpact", "currency", "note"], types: ["date", "text", "text", "text", "number", "text", "text"], render: renderCashTransactions },
  journalBody: { keys: ["date", "assetClass", "type", "symbol", "bank", "qty", "price", "currency", "cashImpact", "realizedPnlEur", "note"], types: ["date", "text", "text", "text", "text", "number", "number", "text", "number", "number", "text"], render: renderJournal },
  bondsBody: { collection: "bonds", keys: ["name", "type", "bank", "issuer", "currency", "nominal", "cleanPrice", "costPrice", "couponRate", "frequency", "lastCoupon", "nextCoupon", "maturity", "dayCount", "accruedEur", "valueEur", "pnlEur", null], types: ["text", "text", "text", "text", "text", "number", "number", "number", "number", "number", "date", "date", "date", "text", "number", "number", "number", null], render: renderBonds },
  privateBody: { collection: "privateAssets", keys: ["name", "bank", "valueEur", "commitmentEur", "calledEur", "valuationDate", "note", null], types: ["text", "text", "number", "number", "number", "date", "text", null], render: renderPrivateAssets },
  realEstateBody: { collection: "realEstate", keys: ["name", "city", "bank", "currency", "grossValue", "originalLoan", "annualRate", "termYears", "loanStartDate", "monthlyPayment", "debtLeft", "netValueEur", "monthlyRent", "monthlyCosts", "cashflow", "netYield", "valuationDate", "note", null], types: ["text", "text", "text", "text", "number", "number", "number", "number", "date", "number", "number", "number", "number", "number", "number", "number", "date", "text", null], render: renderRealEstate },
  cashBody: { collection: "cash", keys: ["name", "bank", "currency", "amount", "valueEur", null], types: ["text", "text", "text", "number", "number", null], render: renderCash },
  diversBody: { collection: "divers", keys: ["category", "name", "bank", "currency", "qty", "unitPrice", "valueEur", "note", null], types: ["text", "text", "text", "text", "number", "number", "number", "text", null], render: renderDivers },
  historyBody: { keys: ["date", "total", "change", "stocksValue", "bondsValue", "structuredValue", "cashValue", "privateValue", "realEstateValue", "diversValue", null], types: ["date", "number", "number", "number", "number", "number", "number", "number", "number", "number", null], render: renderHistory },
  banksBody: { keys: [null, "bank", "stocks", "bonds", "structured", "cash", "privateValue", "realEstate", "divers", "pnl", "total", "total"], types: [null, "text", "number", "number", "number", "number", "number", "number", "number", "number", "number", "number"], render: renderBanks }
};

function configureSortableHeaders() {
  Object.entries(sortableTables).forEach(([tbodyId, config]) => {
    const tbody = document.getElementById(tbodyId);
    const table = tbody?.closest("table");
    if (!table) return;
    table.querySelectorAll("thead th").forEach((th, index) => {
      const key = config.keys[index];
      th.classList.remove("sortable", "sort-asc", "sort-desc");
      th.removeAttribute("data-sort-key");
      th.removeAttribute("data-sort-table");
      th.removeAttribute("data-sort-type");
      if (!key) return;
      th.classList.add("sortable");
      th.dataset.sortTable = tbodyId;
      th.dataset.sortKey = key;
      th.dataset.sortType = config.types[index] || "text";
      const active = sortState[tbodyId];
      if (active?.key === key) th.classList.add(active.dir === "asc" ? "sort-asc" : "sort-desc");
    });
  });
}

function sortableValue(row, key, index, rows) {
  if (!row) return "";
  if (key === "valueEur") {
    if (row.symbol !== undefined) return stockValueEur(row);
    if (row.nominal !== undefined) return bondValueEur(row);
    if (row.amount !== undefined) return cashValueEur(row);
    if (row.qty !== undefined && row.unitPrice !== undefined) return diversValueEur(row);
  }
  if (key === "netValueEur") return realEstateNetEur(row);
  if (key === "monthlyPayment") return realEstateMonthlyPaymentEur(row);
  if (key === "debtLeft") return realEstateDebtEur(row);
  if (key === "netRentEur") return realEstateMonthlyNetRentEur(row);
  if (key === "cashflow") return realEstateMonthlyCashflowEur(row);
  if (key === "netYield") return realEstateGrossEur(row) ? realEstateMonthlyNetRentEur(row) * 12 / realEstateGrossEur(row) * 100 : 0;
  if (key === "dayPnlEur") return row.dayPnlEur ?? stockDayPnlEur(row);
  if (key === "totalPnlEur") return row.totalPnlEur ?? stockTotalPnlEur(row);
  if (key === "accruedEur") return bondAccruedEur(row);
  if (key === "pnlEur") return bondPnlEur(row);
  if (key === "change") return index > 0 ? numberValue(row.total) - numberValue(rows[index - 1]?.total) : 0;
  return row[key];
}

function compareSortable(a, b, key, type, dir, aIndex, bIndex, rows) {
  let av = sortableValue(a, key, aIndex, rows);
  let bv = sortableValue(b, key, bIndex, rows);
  let result = 0;
  if (type === "number") {
    result = numberValue(av) - numberValue(bv);
  } else if (type === "date") {
    result = String(av || "").localeCompare(String(bv || ""));
  } else {
    result = String(av || "").localeCompare(String(bv || ""), undefined, { sensitivity: "base", numeric: true });
  }
  return dir === "asc" ? result : -result;
}

function sortRows(rows, tableId) {
  const active = sortState[tableId];
  if (!active) return rows;
  return [...rows].map((row, index) => ({ row, index })).sort((a, b) => {
    const result = compareSortable(a.row, b.row, active.key, active.type, active.dir, a.index, b.index, rows);
    return result || a.index - b.index;
  }).map(item => item.row);
}

function handleSortClick(th) {
  const tableId = th.dataset.sortTable;
  const config = sortableTables[tableId];
  if (!config) return;
  const key = th.dataset.sortKey;
  const type = th.dataset.sortType || "text";
  const current = sortState[tableId];
  const defaultDir = type === "number" ? "desc" : "asc";
  sortState[tableId] = { key, type, dir: current?.key === key && current.dir === defaultDir ? (defaultDir === "asc" ? "desc" : "asc") : defaultDir };
  config.render();
  configureSortableHeaders();
}

function setPage(page) {
  state.currentPage = page;
  saveState();
  document.querySelectorAll(".page").forEach(el => el.classList.toggle("active", el.id === `page-${page}`));
  document.querySelectorAll("button.nav").forEach(el => el.classList.toggle("active", el.dataset.pageTarget === page));
  const primaryTab = document.querySelector(`.tab-btn[data-tab-target="${page}"]`);
  document.querySelectorAll(".tab-btn").forEach(el => {
    const active = primaryTab ? el === primaryTab : el.id === "mobileMenuBtn";
    el.classList.toggle("active", active);
    if (el.dataset.tabTarget) el.setAttribute("aria-current", el === primaryTab ? "page" : "false");
  });
  const meta = pageMeta[page] || pageMeta.dashboard;
  els.pageEyebrow.textContent = meta[0];
  els.pageTitle.textContent = meta[1];
  els.pageSubtitle.textContent = meta[2];
  els.executiveStrip.classList.add("hidden");
  window.requestAnimationFrame(fitTopKpiValues);
}

function normalizeSearch(value) {
  return String(value || "").trim().toLowerCase();
}

function globalSearchEntries() {
  const entries = [];
  const add = (page, label, terms) => {
    const cleanLabel = String(label || "").trim();
    if (!cleanLabel) return;
    entries.push({ page, label: cleanLabel, terms: terms.filter(Boolean).map(normalizeSearch) });
  };
  state.stocks.forEach(row => add("stocks", row.symbol || row.name, [row.symbol, row.name, row.bank, "stock", "stocks"]));
  state.bonds.forEach(row => add("bonds", row.name || row.issuer, [row.name, row.issuer, row.bank, row.type, "bond", "bonds"]));
  (state.argentinaBonds || []).forEach(row => add("bonds", row.isin || row.name, [row.isin, row.name, row.bank, "argentina", "bond", "bonds"]));
  (state.structuredProducts || []).forEach(row => add("structured", row.name, [row.name, row.isin, row.bank, row.underlying, "structured products", "reverse convertible", "worst of", "phoenix"]));
  state.cash.forEach(row => add("cash", row.name || row.bank || row.currency, [row.name, row.bank, row.currency, "cash"]));
  state.privateAssets.forEach(row => add("private", row.name, [row.name, row.bank, "private equity"]));
  state.realEstate.forEach(row => add("realestate", row.name || row.city, [row.name, row.city, row.bank, "real estate"]));
  state.divers.forEach(row => add("divers", row.name || row.category, [row.name, row.category, row.bank, "other"]));
  knownBanks().forEach(bank => add("banks", bank, [bank, "bank", "banque", "custodian"]));
  return entries;
}

function syncGlobalSearchOptions() {
  if (!els.globalSearchOptions) return;
  const seen = new Set();
  els.globalSearchOptions.innerHTML = globalSearchEntries().filter(entry => {
    const key = entry.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(entry => `<option value="${escapeHtml(entry.label)}">${escapeHtml(pageMeta[entry.page]?.[1] || entry.page)}</option>`).join("");
}

function openGlobalSearchResult() {
  if (!els.globalSearch) return;
  const query = normalizeSearch(els.globalSearch.value);
  if (!query) return;
  const entries = globalSearchEntries();
  const result = entries.find(entry => normalizeSearch(entry.label) === query)
    || entries.find(entry => entry.terms.some(term => term === query))
    || entries.find(entry => entry.terms.some(term => term.includes(query)) || normalizeSearch(entry.label).includes(query));
  if (!result) {
    setStatus(`No asset or bank found for "${els.globalSearch.value}".`, "warning");
    return;
  }
  setPage(result.page);
  els.globalSearch.value = "";
  setStatus(`Opened ${pageMeta[result.page]?.[1] || result.page} for ${result.label}.`);
}

function renderMarketSettingsPanel() {
  const collapsed = state.marketSettingsCollapsed !== false;
  els.marketSettingsPanel.classList.toggle("collapsed", collapsed);
  els.marketSettingsToggle.textContent = collapsed ? "Show settings v" : "Hide settings ^";
  els.marketSettingsToggle.setAttribute("aria-expanded", String(!collapsed));
}

function toggleMarketSettings() {
  state.marketSettingsCollapsed = state.marketSettingsCollapsed === false;
  saveState();
  renderMarketSettingsPanel();
}

function renderTheme() {
  const theme = state.theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  els.themeLight.classList.toggle("active", theme === "light");
  els.themeDark.classList.toggle("active", theme === "dark");
  els.themeLight.setAttribute("aria-pressed", String(theme === "light"));
  els.themeDark.setAttribute("aria-pressed", String(theme === "dark"));
}

function setTheme(theme) {
  state.theme = theme === "light" ? "light" : "dark";
  saveState();
  render();
}

function renderPrivacyMode() {
  document.body.classList.toggle("privacy-mode", state.privacyMode === true);
  els.privacyToggle.textContent = state.privacyMode ? "Show data" : "Hide data";
  els.privacyToggle.classList.toggle("privacy-on", state.privacyMode === true);
  els.privacyToggle.setAttribute("aria-pressed", String(state.privacyMode === true));
  const menuPrivacy = document.getElementById("privacyToggleMenu");
  if (menuPrivacy) {
    menuPrivacy.textContent = state.privacyMode ? "Show data" : "Hide data";
    menuPrivacy.setAttribute("aria-pressed", String(state.privacyMode === true));
  }
}

function renderDashboardCurrencyToggle() {
  const currency = dashboardCurrency();
  els.dashboardHeroStat.dataset.currency = currency;
  els.dashboardCurrencyEur.classList.toggle("active", currency === "EUR");
  els.dashboardCurrencyUsd.classList.toggle("active", currency === "USD");
}

function renderCurrencyLabels() {
  const currency = displayCurrencyLabel();
  document.querySelectorAll("th").forEach(th => {
    th.textContent = th.textContent
      .replace(/\b(EUR|USD) value\b/g, `${currency} value`)
      .replace(/\bTotal (EUR|USD)\b/g, `Total ${currency}`)
      .replace(/\bAccrued (EUR|USD)\b/g, `Accrued ${currency}`)
      .replace(/\bNet value (EUR|USD)\b/g, `Net value ${currency}`)
      .replace(/\bClean value\b/g, `Clean value`)
      .replace(/\b(EUR|USD) impact\b/g, `${currency} impact`);
  });
  const stocksNote = els.stocksPageValue.closest(".stat")?.querySelector("small");
  if (stocksNote) stocksNote.textContent = `In ${currency}`;
}

function setDashboardCurrency(currency) {
  state.dashboardCurrency = currency === "USD" ? "USD" : "EUR";
  saveState();
  render();
}

function togglePrivacyMode() {
  state.privacyMode = state.privacyMode !== true;
  saveState();
  renderPrivacyMode();
}

function render() {
  ensureStructuredProductsSetup();
  els.apiKey.value = state.apiKey || "";
  els.eurUsd.value = state.eurUsd;
  els.refreshInterval.value = String(state.refreshInterval);
  els.weeklySnapshotDay.value = String(state.weeklySnapshotDay);
  els.lastUpdate.value = state.lastUpdate || "Never";
  renderTheme();
  renderMarketSettingsPanel();
  renderPrivacyMode();
  renderDashboardCurrencyToggle();
  renderCurrencyLabels();
  syncGlobalSearchOptions();
  updateDubaiClock();
  renderBuyBankOptions(els.buyBank.value);
  configureKpiDetails();
  processStructuredCouponPayments();
  renderActionCenter();
  renderDataStatus();
  renderTotals();
  renderEconomicPerformance();
  renderStocks();
  renderTransactions();
  renderBonds();
  renderArgentinaBonds();
  renderBondReturnMonitor();
  renderStructuredProducts();
  renderCash();
  renderCashBridge();
  renderMonthlyReview();
  renderJournal();
  renderForecast();
  renderPrivateAssets();
  renderRealEstate();
  renderDivers();
  renderHistory();
  renderBanks();
  setPage(state.currentPage || "dashboard");
  scheduleRefresh();
  scheduleIntradaySnapshots();
  scheduleWeeklySnapshots();
  scheduleDailyAutoSnapshot();
  configureSortableHeaders();
  if (initialStateLoadError) {
    setStatus(initialStateLoadError, "warning");
    initialStateLoadError = "";
  } else if (lastStorageError) {
    setStatus(lastStorageError, "warning");
  }
}

function renderStructuredProducts() {
  if (!els.structuredProductCards) return;
  const today = todayIso();
  const products = state.structuredProducts || [];
  const couponRows = structuredCouponRows();
  const creditedTotal = couponRows.reduce((sum, row) => sum + numberValue(row.processed?.amount), 0);
  const activeProducts = products.filter(row => row.status === "active");
  const futureRows = couponRows.filter(row => row.product.status === "active" && !row.processed && row.paymentDate >= today);
  const next = futureRows[0];
  const dueConditional = couponRows.filter(row => row.product.kind === "phoenix" && row.product.status === "active" && !row.processed && row.paymentDate <= today);
  els.structuredPageValue.textContent = displayMoney(products.reduce((sum, row) => sum + structuredProductValueEur(row), 0), 0);
  els.structuredCouponsPaid.textContent = displayMoney(creditedTotal, 0);
  els.structuredCouponsPaidContext.textContent = `${couponRows.filter(row => row.processed?.status === "credited").length} payment(s) to Transatlantique EUR`;
  els.structuredNextPayment.textContent = next ? formatStructuredDate(next.paymentDate) : "-";
  els.structuredNextPaymentContext.textContent = next ? `${next.product.isin} · ${money(next.product.couponAmount, "EUR", 0)}` : "No scheduled payment";
  els.structuredActiveCount.textContent = String(activeProducts.length);
  els.structuredDueAlert.hidden = dueConditional.length === 0;
  renderActionCenter();
  els.structuredDueTitle.textContent = dueConditional.length === 1 ? "1 conditional coupon requires review" : `${dueConditional.length} conditional coupons require review`;
  els.structuredDueText.textContent = dueConditional.length ? "Confirm the 70% coupon barrier, then credit the coupon or carry it in memory." : "No conditional coupon requires action.";
  const transat = transatEurAccount();
  els.structuredFundingNote.textContent = `Initial subscriptions: ${money(750000, "EUR", 0)} debited once from Transatlantique EUR (${money(500000, "EUR", 0)} reverse convertible + ${money(250000, "EUR", 0)} Phoenix). Current Transatlantique EUR balance: ${money(transat.amount, "EUR", 2)}. Coupons and redemptions are credited to this account.`;

  els.structuredProductCards.innerHTML = products.map(product => {
    const rows = couponRows.filter(row => row.product.id === product.id);
    const nextRow = rows.find(row => !row.processed && row.paymentDate >= today && product.status === "active");
    const paid = rows.reduce((sum, row) => sum + numberValue(row.processed?.amount), 0);
    const underlyings = product.kind === "phoenix"
      ? `<div class="structured-underlyings">${(product.underlyings || []).map(item => `<span>${escapeHtml(item.ticker)} · ${numberValue(item.initial).toLocaleString("en-US", { maximumFractionDigits: 3 })}</span>`).join("")}</div>`
      : `<div class="structured-underlyings"><span>${escapeHtml(product.underlying)}</span><span>${escapeHtml(product.underlyingIsin)}</span></div>`;
    const terms = product.kind === "phoenix"
      ? [["Coupon", `${numberValue(product.couponRate).toFixed(2)}% monthly`], ["Coupon barrier", `${numberValue(product.couponBarrier)}%`], ["Protection barrier", `${numberValue(product.protectionBarrier)}% continuous`], ["Autocall", "94% → 76% from month 3"]]
      : [["Coupon", `${numberValue(product.couponRate).toFixed(3)}% monthly`], ["Coupon type", "Guaranteed"], ["Clean strike", numberValue(product.strike).toFixed(4)], ["Final fixing", formatStructuredDate(product.finalFixingDate)]];
    return `<article class="structured-card">
      <div class="structured-card-head"><div><span class="structured-chip">${product.kind === "phoenix" ? "Worst-of indices" : "Reverse convertible"}</span><h3>${escapeHtml(product.name)}</h3><div class="isin">${escapeHtml(product.isin)}</div></div><span class="structured-chip ${product.status === "active" ? "active" : "ended"}">${escapeHtml(product.status)}</span></div>
      <div class="structured-value"><span>Current product value</span><strong>${displayMoney(structuredProductValueEur(product), 0)}</strong></div>
      <div class="structured-terms">${terms.map(([label, value]) => `<div class="structured-term"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>
      ${underlyings}
      <div class="structured-coupon-line"><span>Coupons credited</span><strong>${displayMoney(paid, 0)}</strong></div>
      <div class="structured-coupon-line"><span>Next payment</span><strong>${nextRow ? formatStructuredDate(nextRow.paymentDate) : (product.status === "active" ? "Schedule complete" : `Ended ${formatStructuredDate(product.endedAt)}`)}</strong></div>
      ${product.kind === "phoenix" ? `<div class="structured-coupon-line"><span>Coupons in memory</span><strong>${Math.max(0, numberValue(product.memoryCoupons))}</strong></div>` : ""}
      ${product.kind === "phoenix" && product.status === "active" ? `<div class="structured-card-actions"><button class="danger" type="button" data-end-structured="${escapeHtml(product.id)}">End product / autocalled</button></div>` : ""}
    </article>`;
  }).join("");

  els.structuredCouponBody.innerHTML = couponRows.map(row => {
    let status = "Scheduled";
    let statusClass = "";
    let credited = "-";
    let actions = "-";
    if (row.processed?.status === "credited") {
      status = "Credited";
      statusClass = "credited";
      credited = displayMoney(row.processed.amount, 2);
    } else if (row.processed?.status === "memory") {
      status = "In memory";
      statusClass = "memory";
    } else if (row.product.status !== "active") {
      status = "Cancelled after autocall";
    } else if (row.paymentDate <= today && row.product.kind === "phoenix") {
      status = "To confirm";
      statusClass = "due";
      actions = `<span class="action-stack"><button class="mini primary" type="button" data-credit-structured="${escapeHtml(row.product.id)}" data-payment-date="${escapeHtml(row.paymentDate)}">Credit</button><button class="mini" type="button" data-memory-structured="${escapeHtml(row.product.id)}" data-payment-date="${escapeHtml(row.paymentDate)}">Memory</button></span>`;
    }
    return `<tr>
      <td>${formatStructuredDate(row.paymentDate)}</td>
      <td><strong>${escapeHtml(row.product.isin)}</strong><div class="muted">${escapeHtml(row.product.kind === "phoenix" ? "Worst-of Phoenix" : "Reverse Convertible")}</div></td>
      <td>${row.product.kind === "phoenix" ? `Conditional${row.observationDate ? ` · obs. ${formatStructuredDate(row.observationDate)}` : ""}` : "Guaranteed"}</td>
      <td class="num">${displayMoney(row.product.couponAmount, 2)}</td>
      <td class="num">${credited}</td>
      <td><span class="coupon-status ${statusClass}">${escapeHtml(status)}</span></td>
      <td>${actions}</td>
    </tr>`;
  }).join("");
}

function renderEconomicPerformance() {
  if (!els.economicPerformanceBars) return;
  const p = investmentPerformanceSummary();
  els.economicPerformanceScope.textContent = "Since cost basis · EUR valuation";
  els.economicMarketGain.textContent = displayMoney(p.marketGain, 0);
  els.economicMarketGain.className = signedClass(p.marketGain);
  els.economicMarketGainContext.textContent = "Stocks + clean bond prices + realized P&L";
  els.economicIncome.textContent = displayMoney(p.incomeEarned, 0);
  els.economicIncome.className = signedClass(p.incomeEarned);
  els.economicIncomeContext.textContent = `${displayMoney(p.couponsReceived + p.structuredCoupons, 0)} received · ${displayMoney(p.couponAccrued, 0)} accrued`;
  els.economicInternalTransfers.textContent = displayMoney(0, 0);
  els.economicInternalTransfersContext.textContent = `${displayMoney(p.internalTurnover, 0)} moved between cash and assets`;
  els.economicTotalReturn.textContent = displayMoney(p.totalReturn, 0);
  els.economicTotalReturn.className = signedClass(p.totalReturn);
  const attributionRows = [
    { label: "Stocks · price return", detail: "Unrealized + realized", value: p.stockUnrealized + p.stockRealized },
    { label: "Listed Treasury · clean price", detail: "Coupon excluded", value: p.treasuryClean, tone: p.treasuryClean < 0 ? "negative" : "neutral" },
    { label: "Other bonds · clean price", detail: "OTC and coupon bonds", value: p.otherBondClean + p.bondRealized },
    { label: "Bond coupons earned", detail: "Received + current accrued", value: p.couponsReceived + p.couponAccrued, tone: "income" },
    { label: "Structured-product coupons", detail: "Credited to cash", value: p.structuredCoupons, tone: "income" }
  ];
  els.economicPerformanceBars.innerHTML = economicBarRowsHtml(attributionRows);
  els.economicPerformanceList.innerHTML = economicListRowsHtml([
    { label: "Market performance", value: p.marketGain, badge: "Performance" },
    { label: "Income earned", value: p.incomeEarned, badge: "Income" },
    { label: "Cash already received", value: p.couponsReceived + p.structuredCoupons, badge: "Cash" },
    { label: "Internal turnover", value: 0, badge: "Transfer", text: "€0 impact", tone: "" },
    { label: "Recorded fees", value: -p.transactionFees, badge: "Embedded in P&L" }
  ]);
  els.economicPerformanceNote.textContent = `Purchases and sales are economically neutral: ${displayMoney(p.internalTurnover, 0)} of recorded internal turnover has a €0 direct performance impact. Transaction fees remain embedded in the relevant position or realized P&L.`;
}

function renderBondReturnMonitor() {
  if (!els.bondReturnBars) return;
  const p = investmentPerformanceSummary();
  const rows = bondIncomeByInstrument();
  const treasuryRows = rows.filter(row => row.treasury);
  const otherRows = rows.filter(row => !row.treasury);
  const bondRealized = p.bondRealized;
  const group = (items, realized = 0) => ({
    price: items.reduce((sum, row) => sum + row.pricePnl, 0) + realized,
    received: items.reduce((sum, row) => sum + row.received, 0),
    accrued: items.reduce((sum, row) => sum + row.accrued, 0)
  });
  const treasury = group(treasuryRows, 0);
  const other = group(otherRows, bondRealized);
  treasury.total = treasury.price + treasury.received + treasury.accrued;
  other.total = other.price + other.received + other.accrued;
  const couponsEarned = p.couponsReceived + p.couponAccrued;
  const totalReturn = treasury.total + other.total;
  els.bondReturnScope.textContent = "Since cost basis · EUR valuation";
  els.bondCouponsEarned.textContent = displayMoney(couponsEarned, 2);
  els.bondCouponsEarned.className = signedClass(couponsEarned);
  els.bondCouponsReceived.textContent = displayMoney(p.couponsReceived, 2);
  els.bondCouponsReceived.className = signedClass(p.couponsReceived);
  els.bondTreasuryPnl.textContent = displayMoney(treasury.price, 2);
  els.bondTreasuryPnl.className = signedClass(treasury.price);
  els.bondTotalReturnValue.textContent = displayMoney(totalReturn, 2);
  els.bondTotalReturnValue.className = signedClass(totalReturn);
  const cardHtml = (label, values) => {
    const denominator = Math.max(1, Math.abs(values.price) + Math.abs(values.received) + Math.abs(values.accrued));
    const priceWidth = Math.abs(values.price) / denominator * 100;
    const receivedWidth = Math.abs(values.received) / denominator * 100;
    const accruedWidth = Math.abs(values.accrued) / denominator * 100;
    return `<article class="bond-return-card"><span>${escapeHtml(label)}</span><strong class="${signedClass(values.total)}">${displayMoney(values.total, 2)}</strong><div class="bond-return-stack" aria-label="${escapeHtml(label)} return composition"><span class="${values.price < 0 ? "negative" : "price"}" style="width:${priceWidth.toFixed(2)}%"></span><span class="coupon" style="width:${receivedWidth.toFixed(2)}%"></span><span class="accrued" style="width:${accruedWidth.toFixed(2)}%"></span></div><div class="bond-return-legend"><span><i class="${values.price < 0 ? "negative" : "price"}"></i>Price ${displayMoney(values.price, 2)}</span><span><i class="coupon"></i>Received ${displayMoney(values.received, 2)}</span><span><i class="accrued"></i>Accrued ${displayMoney(values.accrued, 2)}</span></div></article>`;
  };
  els.bondReturnCards.innerHTML = cardHtml("Listed Treasuries", treasury) + cardHtml("Coupon / OTC bonds", other);
  els.bondReturnBars.innerHTML = rows.length ? economicBarRowsHtml(rows.map(row => ({ label: row.name, detail: `${displayMoney(row.received, 2)} received · ${displayMoney(row.accrued, 2)} accrued`, value: row.totalReturn, tone: row.totalReturn < 0 ? "negative" : (row.treasury ? "neutral" : "income"), digits: 2 }))) : `<div class="empty">No bond return data yet.</div>`;
  const incomeRows = rows.filter(row => row.received || row.accrued).map(row => ({ label: row.name, value: row.received + row.accrued, badge: `${displayMoney(row.received, 2)} received`, digits: 2 }));
  els.bondIncomeList.innerHTML = incomeRows.length ? economicListRowsHtml(incomeRows) : `<div class="empty">No coupon received or accrued yet.</div>`;
  els.bondReturnNote.textContent = `Coupons received (${displayMoney(p.couponsReceived, 2)}) are already in cash. Current accrued income (${displayMoney(p.couponAccrued, 2)}) remains inside dirty bond values, so the payment transfer will not be counted twice.`;
}

function renderCashBridge() {
  if (!els.cashBridgeChart) return;
  const c = cashBridgeSummary();
  els.cashBridgeScope.textContent = "Recorded transaction history · EUR equivalent";
  els.cashBridgeOpening.textContent = displayMoney(c.opening, 0);
  els.cashBridgeCurrent.textContent = displayMoney(c.current, 0);
  els.cashBridgeIncome.textContent = displayMoney(c.income, 0);
  els.cashBridgeIncome.className = signedClass(c.income);
  els.cashBridgeChange.textContent = displayMoney(c.current - c.opening, 0);
  els.cashBridgeChange.className = signedClass(c.current - c.opening);
  const movements = [
    { label: "Purchases", value: c.purchases, color: "#5b78b0" },
    { label: "Income", value: c.income, color: "#4b9b84" },
    { label: "Sales / redemptions", value: c.sales, color: "#7e9bd3" },
    { label: "External flows", value: c.external, color: "#9a7bc0" },
    ...(Math.abs(c.other) > 0.005 ? [{ label: "Other", value: c.other, color: c.other < 0 ? "#c66d66" : "#bd9747" }] : [])
  ];
  let running = c.opening;
  const columns = [{ label: "Opening", type: "total", value: c.opening, before: 0, after: c.opening, color: "#bd9747" }];
  movements.forEach(item => {
    const before = running;
    running += item.value;
    columns.push({ ...item, type: "movement", before, after: running });
  });
  columns.push({ label: "Current", type: "total", value: c.current, before: 0, after: c.current, color: "#bd9747" });
  const levels = columns.flatMap(row => [row.before, row.after, 0]);
  const min = Math.min(...levels);
  const max = Math.max(...levels);
  const range = Math.max(1, max - min);
  els.cashBridgeChart.style.setProperty("--bridge-count", String(columns.length));
  els.cashBridgeChart.innerHTML = columns.map(row => {
    const low = row.type === "total" ? Math.min(0, row.after) : Math.min(row.before, row.after);
    const high = row.type === "total" ? Math.max(0, row.after) : Math.max(row.before, row.after);
    const bottom = (low - min) / range * 100;
    const height = (high - low) / range * 100;
    const shownValue = row.type === "total" ? row.after : row.value;
    return `<div class="cash-bridge-column"><strong class="cash-bridge-value ${signedClass(shownValue)}">${displayMoney(shownValue, 0)}</strong><div class="cash-bridge-plot"><span class="cash-bridge-bar" style="--bridge-bottom:${bottom.toFixed(2)};--bridge-height:${height.toFixed(2)};--bridge-color:${row.color}"></span></div><small>${escapeHtml(row.label)}</small></div>`;
  }).join("");
  els.cashBridgeList.innerHTML = economicListRowsHtml([
    { label: "Asset purchases", value: c.purchases, badge: "Internal · €0 wealth impact" },
    { label: "Coupons and investment income", value: c.income, badge: "Income" },
    { label: "Sales and redemptions", value: c.sales, badge: "Internal · €0 wealth impact" },
    { label: "External contributions / withdrawals", value: c.external, badge: "External flow" },
    ...(Math.abs(c.other) > 0.005 ? [{ label: "Other recorded movements", value: c.other, badge: "Other" }] : [])
  ]);
  els.cashBridgeNote.textContent = `${displayMoney(Math.abs(c.purchases), 0)} of purchases changed the cash balance but not investment performance. The reconstructed opening balance uses the current cash balance minus every recorded cash-impact transaction.`;
}

function monthlyInputValues() {
  return {
    salary: monthlyMoneyFromInputs(els.monthlySalaryAmount.value, els.monthlySalaryCurrency.value),
    bonus: monthlyMoneyFromInputs(els.monthlyBonusAmount.value, els.monthlyBonusCurrency.value),
    otherIncome: monthlyMoneyFromInputs(els.monthlyOtherIncomeAmount.value, els.monthlyOtherIncomeCurrency.value),
    cashAdjustment: monthlyMoneyFromInputs(els.monthlyCashAdjustmentAmount.value, els.monthlyCashAdjustmentCurrency.value)
  };
}

function renderMonthlyClosePreview() {
  if (!els.monthlyClosePreview) return;
  if (!els.monthlyCloseDate.value) els.monthlyCloseDate.value = todayIso();
  const previous = monthlyCloseBefore(els.monthlyCloseDate.value);
  const inputs = monthlyInputValues();
  const analysis = monthlyAnalysis(previous, els.monthlyCloseDate.value, inputs);
  if (!analysis) {
    els.monthlyCloseStatus.textContent = "First close creates the baseline";
    els.monthlyClosePreview.innerHTML = `<div class="monthly-preview-item"><span>Baseline</span><strong>First month</strong><small>Enter your current balances and close this month. The next close will calculate savings and performance.</small></div>`;
    return;
  }
  els.monthlyCloseStatus.textContent = `Compared with ${previous.date}`;
  const items = [
    ["Opening cash", analysis.openingCash, "Previous month-end"],
    ["Salary + bonus", inputs.salary.valueEur + inputs.bonus.valueEur, "Personal income entered"],
    ["Coupons & dividends", analysis.investmentIncome, "Detected from Journal"],
    ["Cash change", analysis.cashChange, "Opening to current balance"],
    ["Inferred spending", -analysis.inferredExpenses, analysis.unexplainedCashInflow ? `Plus ${displayMoney(analysis.unexplainedCashInflow, 0)} unclassified inflow` : "Before expense detail"]
  ];
  els.monthlyClosePreview.innerHTML = items.map(([label, value, note]) => `<div class="monthly-preview-item"><span>${escapeHtml(label)}</span><strong class="monthly-private ${signedClass(value)}">${displayMoney(value, 0)}</strong><small>${escapeHtml(note)}</small></div>`).join("");
}

function selectedMonthlyClose() {
  const closes = monthlyClosesSorted();
  return closes.find(row => row.id === activeMonthlyCloseId) || closes.at(-1) || null;
}

function monthlyWaterfallHtml(rows) {
  let running = rows[0]?.value || 0;
  const columns = rows.map((row, index) => {
    if (row.total) { running = row.value; return { ...row, before: 0, after: row.value }; }
    const before = running;
    running += row.value;
    return { ...row, before, after: running };
  });
  const levels = columns.flatMap(row => [row.before, row.after, 0]);
  const low = Math.min(...levels), high = Math.max(...levels), range = Math.max(1, high - low);
  return columns.map(row => {
    const bottomValue = row.total ? Math.min(0, row.after) : Math.min(row.before, row.after);
    const topValue = row.total ? Math.max(0, row.after) : Math.max(row.before, row.after);
    return `<div class="monthly-waterfall-column"><strong class="monthly-waterfall-value monthly-private ${signedClass(row.total ? row.after : row.value)}">${displayMoney(row.total ? row.after : row.value, 0)}</strong><div class="monthly-waterfall-plot"><span class="monthly-waterfall-bar" style="--monthly-bottom:${((bottomValue - low) / range * 100).toFixed(2)};--monthly-height:${((topValue - bottomValue) / range * 100).toFixed(2)};--monthly-color:${row.color}"></span></div><small>${escapeHtml(row.label)}</small></div>`;
  }).join("");
}

function renderMonthlyReview() {
  if (!els.monthlyCloseBody) return;
  renderMonthlyClosePreview();
  const selected = selectedMonthlyClose();
  const closes = monthlyClosesSorted();
  const analysis = selected?.analysis;
  const previous = selected ? monthlyCloseBefore(selected.date) : null;
  const hasAnalysis = Boolean(selected && previous && analysis);
  els.monthlyBaselineMessage.classList.toggle("hidden", hasAnalysis);
  els.monthlyReviewContent.classList.toggle("hidden", !hasAnalysis);
  if (!selected) {
    els.monthlyReviewScope.textContent = "No monthly close selected.";
    els.monthlyBridgeTotal.textContent = "-";
  } else if (!hasAnalysis) {
    els.monthlyReviewScope.textContent = `${selected.date} is the baseline. Close the next month to start attribution.`;
    els.monthlyBridgeTotal.textContent = displayMoney(selected.totals.total, 0);
  } else {
    els.monthlyReviewScope.textContent = `${previous.date} → ${selected.date} · frozen month-end values`;
    els.monthlyBridgeTotal.textContent = displayMoney(analysis.totalChange, 0);
    els.monthlyBridgeTotal.className = `monthly-private ${signedClass(analysis.totalChange)}`;
    const bridgeRows = [
      { label: "Opening wealth", value: analysis.openingTotal, total: true, color: "#bd9747" },
      { label: "Income savings", value: analysis.incomeSavings, color: "#4b9b84" },
      { label: "Stocks", value: analysis.stockPerformance, color: "#4e9d8b" },
      { label: "Bond price", value: analysis.bondPerformance, color: "#637fb7" },
      { label: "Coupons & dividends", value: analysis.investmentIncome, color: "#c79b42" },
      { label: "Structured", value: analysis.structuredPerformance, color: "#8b72b6" },
      { label: "Private equity", value: analysis.privatePerformance, color: "#7097a2" },
      { label: "FX & reconciliation", value: analysis.fxAndReconciliation, color: "#9a7bc0" },
      ...(Math.abs(analysis.cashAdjustment) > .005 ? [{ label: "Exceptional", value: analysis.cashAdjustment, color: "#c66d66" }] : []),
      { label: "Closing wealth", value: analysis.closingTotal, total: true, color: "#bd9747" }
    ];
    els.monthlyWealthBridge.style.setProperty("--monthly-columns", String(bridgeRows.length));
    els.monthlyWealthBridge.innerHTML = monthlyWaterfallHtml(bridgeRows);
    els.monthlyAttributionList.innerHTML = economicListRowsHtml([
      { label: "Income savings", value: analysis.incomeSavings, badge: "Salary + bonus − spending" },
      { label: "Stock market performance", value: analysis.stockPerformance, badge: "Excluding trades" },
      { label: "Bond price performance", value: analysis.bondPerformance, badge: "Coupon separate" },
      { label: "Coupons & dividends", value: analysis.investmentIncome, badge: "Investment income" },
      { label: "Structured-product valuation", value: analysis.structuredPerformance, badge: "Coupon separate" },
      { label: "Private-equity valuation", value: analysis.privatePerformance, badge: "NAV change" },
      { label: "FX & reconciliation", value: analysis.fxAndReconciliation, badge: "FX + untracked items" }
    ]);
    els.monthlyCashChange.textContent = displayMoney(analysis.cashChange, 0);
    els.monthlyCashChange.className = `monthly-private ${signedClass(analysis.cashChange)}`;
    els.monthlyCashBridge.innerHTML = economicBarRowsHtml([
      { label: "Personal income", detail: "Salary, bonus and other income", value: analysis.personalIncome, tone: "positive" },
      { label: "Coupons & dividends", detail: "Automatically detected in Journal", value: analysis.investmentIncome, tone: "income" },
      { label: "Purchases / sales", detail: "Internal investment cash movement", value: analysis.nonCouponInvestmentCashFlow, tone: "neutral" },
      { label: "FX on opening cash", detail: "USD/AED translation effect", value: analysis.cashFxImpact, tone: "neutral" },
      { label: "Exceptional adjustment", detail: "Known non-lifestyle movement", value: analysis.cashAdjustment, tone: analysis.cashAdjustment < 0 ? "negative" : "positive" },
      { label: "Inferred spending", detail: "Before category allocation", value: -analysis.inferredExpenses, tone: "negative" },
      ...(analysis.unexplainedCashInflow ? [{ label: "Unclassified cash inflow", detail: "Review the Journal or add an adjustment", value: analysis.unexplainedCashInflow, tone: "income" }] : [])
    ]);
    const openingMap = new Map((previous.cashRows || []).map(row => [row.key, row]));
    const closingMap = new Map((selected.cashRows || []).map(row => [row.key, row]));
    const cashRows = [...new Set([...openingMap.keys(), ...closingMap.keys()])].map(key => {
      const start = openingMap.get(key) || { valueEur: 0, bank: closingMap.get(key)?.bank || "Unallocated", name: closingMap.get(key)?.name || "Cash" };
      const end = closingMap.get(key) || { valueEur: 0, bank: start.bank, name: start.name };
      return { label: `${end.bank} · ${end.name}`, value: numberValue(end.valueEur) - numberValue(start.valueEur), badge: `${displayMoney(start.valueEur, 0)} → ${displayMoney(end.valueEur, 0)}` };
    }).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    els.monthlyCashByBank.innerHTML = economicListRowsHtml(cashRows);
  }
  const expenseTotal = selected ? (selected.expenses || []).reduce((sum, row) => sum + numberValue(row.valueEur), 0) : 0;
  const inferred = hasAnalysis ? Math.max(0, analysis.inferredExpenses) : 0;
  const remaining = Math.max(0, inferred - expenseTotal);
  els.monthlyExpenseRemaining.textContent = hasAnalysis ? displayMoney(remaining, 0) : "-";
  els.monthlyExpenseRemaining.className = "monthly-private";
  els.monthlyExpenseSummary.innerHTML = hasAnalysis ? `<div class="monthly-expense-summary-row"><span>Inferred spending</span><strong class="monthly-private">${displayMoney(inferred, 2)}</strong></div><div class="monthly-expense-summary-row"><span>Classified</span><strong class="monthly-private">${displayMoney(expenseTotal, 2)}</strong></div><div class="monthly-expense-summary-row"><span>Daily life not detailed</span><strong class="monthly-private">${displayMoney(remaining, 2)}</strong></div>` : `<div class="muted">Select a month with an attribution report to allocate its spending.</div>`;
  els.monthlyExpenseMeter.style.setProperty("--expense-width", String(inferred ? Math.min(100, expenseTotal / inferred * 100) : 0));
  els.monthlyExpenseRows.innerHTML = selected?.expenses?.length ? selected.expenses.map(row => `<div class="economic-list-row"><div><span>${escapeHtml(`${row.category}${row.label ? ` · ${row.label}` : ""}`)}</span><small class="economic-badge">${escapeHtml(money(row.amount, row.currency, 2))}</small></div><strong class="negative monthly-private">${displayMoney(-row.valueEur, 2)} <button data-delete-monthly-expense="${escapeHtml(row.id)}" class="mini danger" type="button">Del.</button></strong></div>`).join("") : (hasAnalysis ? `<div class="empty">No detailed expense yet. The remainder remains in daily life.</div>` : "");
  els.monthlyCloseBody.innerHTML = closes.length ? closes.map(close => {
    const prior = monthlyCloseBefore(close.date);
    const a = close.analysis;
    const active = close.id === selected?.id ? "monthly-history-active" : "";
    return `<tr class="${active}"><td>${escapeHtml(close.date)}</td><td class="num">${displayMoney(close.totals.total, 0)}</td><td class="num ${prior ? signedClass(a.totalChange) : ""}">${prior ? displayMoney(a.totalChange, 0) : "Baseline"}</td><td class="num">${prior ? displayMoney(a.incomeSavings, 0) : "-"}</td><td class="num">${prior ? displayMoney(a.investmentResult, 0) : "-"}</td><td class="num">${prior ? displayMoney(a.inferredExpenses, 0) : "-"}</td><td>${prior ? `${a.personalIncome ? pct(a.incomeSavings / a.personalIncome * 100) : "-"}` : "-"}</td><td class="actions"><button class="mini" type="button" data-monthly-close="${escapeHtml(close.id)}">View</button> <button class="mini danger" type="button" data-delete-monthly-close="${escapeHtml(close.id)}">Del.</button></td></tr>`;
  }).join("") : `<tr><td colspan="8"><div class="empty">No monthly close yet. Start with today’s fully updated balances.</div></td></tr>`;
  els.monthlyTotalChange.textContent = hasAnalysis ? displayMoney(analysis.totalChange, 0) : "-";
  els.monthlyTotalChange.className = `monthly-private ${hasAnalysis ? signedClass(analysis.totalChange) : ""}`;
  els.monthlyTotalChangeNote.textContent = hasAnalysis ? `${previous.date} → ${selected.date}` : "Close two months to start";
  els.monthlyIncomeSavings.textContent = hasAnalysis ? displayMoney(analysis.incomeSavings, 0) : "-";
  els.monthlyIncomeSavings.className = `monthly-private ${hasAnalysis ? signedClass(analysis.incomeSavings) : ""}`;
  els.monthlyInvestmentResult.textContent = hasAnalysis ? displayMoney(analysis.investmentResult, 0) : "-";
  els.monthlyInvestmentResult.className = `monthly-private ${hasAnalysis ? signedClass(analysis.investmentResult) : ""}`;
  els.monthlyInferredExpenses.textContent = hasAnalysis ? displayMoney(analysis.inferredExpenses, 0) : "-";
  els.monthlyInferredExpenses.className = "monthly-private negative";
  els.monthlyExpenseCoverage.textContent = hasAnalysis && analysis.personalIncome ? `${pct(analysis.incomeSavings / analysis.personalIncome * 100)} of income saved` : "Derived from the cash bridge";
}

function createMonthlyClose() {
  const date = els.monthlyCloseDate.value || todayIso();
  const prior = monthlyCloseBefore(date);
  const inputs = monthlyInputValues();
  const totals = currentMonthlyTotals();
  const cashRows = currentMonthlyCashRows();
  const existing = (state.monthlyCloses || []).find(row => row.monthKey === date.slice(0, 7));
  if (existing && !window.confirm(`Replace the monthly close for ${existing.monthKey}? Its existing expense details will be kept.`)) return;
  const analysis = monthlyAnalysis(prior, date, inputs, totals, cashRows) || {};
  const close = { id: existing?.id || `monthly-${date}-${Date.now()}`, date, monthKey: date.slice(0, 7), createdAt: new Date().toISOString(), note: els.monthlyCloseNote.value.trim(), eurUsd: numberValue(state.eurUsd), totals, cashRows, inputs, analysis, expenses: existing?.expenses || [] };
  state.monthlyCloses = (state.monthlyCloses || []).filter(row => row.id !== existing?.id);
  state.monthlyCloses.push(close);
  state.monthlyCloses.sort((a, b) => a.date.localeCompare(b.date));
  activeMonthlyCloseId = close.id;
  saveState();
  render();
  setStatus(prior ? `Monthly close saved for ${date}. Spending and attribution are frozen.` : `Baseline saved for ${date}. Close the following month to begin attribution.`);
}

function addMonthlyExpense() {
  const close = selectedMonthlyClose();
  if (!close || !monthlyCloseBefore(close.date)) return setStatus("Close two months before allocating spending details.", "warning");
  const amount = numberValue(els.monthlyExpenseAmount.value);
  if (amount <= 0) return setStatus("Expense detail not added: enter a positive amount.", "warning");
  const moneyValue = monthlyMoneyFromInputs(amount, els.monthlyExpenseCurrency.value);
  close.expenses.push({ id: `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`, category: els.monthlyExpenseCategory.value || "Other", label: els.monthlyExpenseLabel.value.trim(), ...moneyValue });
  els.monthlyExpenseAmount.value = "";
  els.monthlyExpenseLabel.value = "";
  saveState();
  renderMonthlyReview();
  setStatus("Expense detail added. The inferred total remains unchanged.");
}

function renderDataStatus() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekly = Number(state.weeklySnapshotDay) >= 0 ? ` Weekly snapshot: ${days[Number(state.weeklySnapshotDay)]}.` : " Weekly snapshot disabled.";
  let syncText = "Local backup active. Connect patrimoine-data.json to enable automatic OneDrive sync on this device.";
  if (dataSyncState === "remembered") syncText = dataSyncMessage || "Data file remembered. Click Connect data file once to restore permission.";
  if (dataSyncState === "connecting") syncText = dataSyncMessage || "Connecting to the OneDrive data file...";
  if (dataSyncState === "saving") syncText = `Saving automatically to ${connectedDataFileName || dataFileName}...`;
  if (dataSyncState === "synced") {
    const saved = state.dataSavedAt ? ` Last sync: ${state.dataSavedAt}.` : "";
    syncText = `Automatic sync active: ${connectedDataFileName || dataFileName}.${saved}`;
  }
  if (dataSyncState === "conflict") syncText = dataSyncMessage || "A newer OneDrive version was detected. Reconnect the data file to load it before saving.";
  if (dataSyncState === "error") syncText = dataSyncMessage || "OneDrive sync is unavailable. Changes remain saved in this browser.";
  els.dataStatus.textContent = `${syncText}${weekly} Daily auto snapshot: 23:00 Dubai time.`;
  renderSyncPill(syncText);
  renderBackupStatus();
}

function renderSyncPill(detail) {
  const pill = document.getElementById("syncPill");
  const label = document.getElementById("syncPillLabel");
  if (!pill || !label) return;
  const labels = {
    synced: ["ok", "Synced"],
    saving: ["busy", "Saving…"],
    connecting: ["busy", "Connecting…"],
    remembered: ["warn", "Reconnect sync"],
    conflict: ["bad", "Sync conflict"],
    error: ["bad", "Sync error"]
  };
  const [tone, text] = labels[dataSyncState] || ["local", "Local only"];
  pill.dataset.syncState = tone;
  label.textContent = text;
  pill.title = `${detail} Click to open Settings & sync.`;
  pill.setAttribute("aria-label", `${text}. Open Settings and sync`);
}

function renderBackupStatus() {
  if (!els.backupStatus) return;
  let text = "Weekly backup folder not connected. Select a folder to create one dated JSON copy per week.";
  if (!window.showDirectoryPicker) text = "Automatic folder backups are unavailable in this browser; Backup now will download a JSON copy.";
  if (backupState === "remembered") text = backupMessage || `Backup folder remembered${backupDirectoryName ? `: ${backupDirectoryName}` : ""}. Click Connect backup folder to restore permission.`;
  if (backupState === "connected") text = `Weekly backups active in ${backupDirectoryName || "the selected folder"}.${state.lastWeeklyBackupAt ? ` Last backup: ${state.lastWeeklyBackupAt}.` : ""}`;
  if (backupState === "saving") text = `Creating a backup in ${backupDirectoryName || "the selected folder"}...`;
  if (backupState === "error") text = backupMessage || "The weekly backup could not be created.";
  els.backupStatus.textContent = text;
}

function renderTotals() {
  const t = computeTotals();
  const dayPct = t.stocksPrevious ? t.stocksDayPnl / t.stocksPrevious * 100 : 0;
  const liquidValue = t.stocksValue + t.liquidBondsValue + t.cashPositive;
  const longTermValue = t.privateValue + t.realEstateValue + t.diversValue + t.longTermBondsValue;
  const grossAssets = t.total - t.cashNegative;
  const debtAccounts = state.cash.filter(row => cashValueEur(row) < 0).length;
  const bankCount = new Set([
    ...state.stocks.map(row => row.bank),
    ...state.bonds.map(row => row.bank),
    ...(state.structuredProducts || []).map(row => row.bank),
    ...state.cash.map(row => row.bank),
    ...state.privateAssets.map(row => row.bank),
    ...state.realEstate.map(row => row.bank),
    ...state.divers.map(row => row.bank)
  ].filter(Boolean)).size;
  renderDashboardCurrencyToggle();
  els.totalWealth.textContent = dashboardMoney(t.total);
  els.totalContext.textContent = dashboardCurrency() === "USD"
    ? `Base: ${money(t.total)} | EUR/USD ${numberValue(state.eurUsd).toFixed(4)}`
    : `Net of borrowing · ${bankCount || 0} institution${bankCount > 1 ? "s" : ""}`;
  els.heroGross.textContent = dashboardMoney(grossAssets);
  els.heroDebt.textContent = t.cashNegative < 0 ? dashboardMoney(t.cashNegative) : "None";
  els.heroDebt.closest(".hero-debt")?.classList.toggle("has-debt", t.cashNegative < 0);
  els.heroLiquid.textContent = `${dashboardMoney(liquidValue)} · ${pct(grossAssets ? liquidValue / grossAssets * 100 : 0)}`;
  els.heroLongTerm.textContent = `${dashboardMoney(longTermValue)} · ${pct(grossAssets ? longTermValue / grossAssets * 100 : 0)}`;
  els.executiveTotal.textContent = displayMoney(t.total, 0);
  els.executiveTotalNote.textContent = `${displayMoney(t.privateValue, 0)} private | ${displayMoney(t.bondsValue, 0)} bonds`;
  els.executiveDailyPnl.textContent = displayMoney(t.stocksDayPnl, 2);
  els.executiveDailyPnl.className = `executive-value ${signedClass(t.stocksDayPnl)}`;
  els.executiveDailyPnlNote.textContent = `${pct(dayPct)} on listed stocks`;
  els.executiveCash.textContent = displayMoney(t.cashValue, 0);
  els.executiveCashNote.textContent = `${state.cash.length} cash account(s), FX EUR/USD ${numberValue(state.eurUsd).toFixed(4)}`;
  els.executiveLastUpdate.textContent = state.lastUpdate || "Never";
  els.dailyPnl.textContent = dashboardMoney(t.stocksDayPnl, 2);
  els.dailyPnl.className = signedClass(t.stocksDayPnl);
  els.dailyPnlPct.textContent = `${pct(dayPct)} on listed stocks`;
  els.stocksValue.textContent = dashboardMoney(t.stocksValue);
  els.stocksPnl.textContent = `Total PnL: ${dashboardMoney(t.stocksTotalPnl, 2)}`;
  els.stocksPnl.className = signedClass(t.stocksTotalPnl);
  els.bondsValue.textContent = dashboardMoney(t.bondsValue);
  els.bondsAccrued.textContent = `Accrued coupon: ${dashboardMoney(t.bondsAccrued, 0)}`;
  els.structuredValue.textContent = dashboardMoney(t.structuredValue);
  els.structuredContext.textContent = `${(state.structuredProducts || []).filter(row => row.status === "active").length} active · ${displayMoney(structuredCouponRows().reduce((sum, row) => sum + numberValue(row.processed?.amount), 0), 0)} coupons`;
  els.cashValue.textContent = dashboardMoney(t.cashValue);
  els.cashValue.className = signedClass(t.cashValue);
  els.cashContext.textContent = debtAccounts
    ? `${displayMoney(t.cashPositive, 0)} available · ${displayMoney(t.cashNegative, 0)} borrowed (${debtAccounts} account${debtAccounts > 1 ? "s" : ""})`
    : `${state.cash.length} account(s)`;
  document.getElementById("cashKpiCard")?.classList.toggle("has-debt", debtAccounts > 0);
  [["realEstateValue", t.realEstateValue, state.realEstate.length], ["peValue", t.privateValue, state.privateAssets.length], ["diversValue", t.diversValue, state.divers.length], ["structuredValue", t.structuredValue, (state.structuredProducts || []).length]].forEach(([id, value, count]) => {
    els[id]?.closest(".kpi-card")?.classList.toggle("kpi-empty", !value && !count);
  });
  els.peValue.textContent = dashboardMoney(t.privateValue);
  els.peContext.textContent = `${state.privateAssets.length} line(s)`;
  els.realEstateValue.textContent = dashboardMoney(t.realEstateValue);
  els.realEstateContext.textContent = `${state.realEstate.length} property(ies)`;
  els.diversValue.textContent = dashboardMoney(t.diversValue);
  els.diversContext.textContent = `${state.divers.length} investment(s)`;
  els.stocksPageValue.textContent = displayMoney(t.stocksValue, 2);
  els.stocksPageDayPnl.textContent = displayMoney(t.stocksDayPnl, 2);
  els.stocksPageDayPnl.className = signedClass(t.stocksDayPnl);
  els.stocksPageDayPct.textContent = pct(dayPct);
  els.stocksPageTotalPnl.textContent = displayMoney(t.stocksTotalPnl, 2);
  els.stocksPageTotalPnl.className = signedClass(t.stocksTotalPnl);
  const realizedPnl = realizedStockPnlEur();
  const sellCount = (state.transactions || []).filter(row => row.type === "Sell").length;
  els.stocksPageRealizedPnl.textContent = displayMoney(realizedPnl, 2);
  els.stocksPageRealizedPnl.className = signedClass(realizedPnl);
  els.stocksPageRealizedContext.textContent = `${sellCount} sale transaction(s)`;
  els.bondsPageValue.textContent = displayMoney(t.bondsValue, 0);
  els.bondsPageAccrued.textContent = displayMoney(t.bondsAccrued, 0);
  els.bondsPagePnl.textContent = displayMoney(t.bondsPnl, 0);
  els.bondsPagePnl.className = signedClass(t.bondsPnl);
  const annualCoupon = state.bonds.reduce((sum, row) => sum + bondAnnualCouponEur(row), 0);
  els.bondsPageCoupon.textContent = displayMoney(annualCoupon, 0);
  els.bondsPageYield.textContent = `${pct(t.bondsValue ? annualCoupon / t.bondsValue * 100 : 0)} current yield`;
  renderAllocation(t);
  renderDashboardTopStocks(t);
  renderDashboardBanks(t.total);
  renderFxRisk();
  renderWealthPerformance(t.total);
  renderWealthBridge(t);
  renderIntradaySnapshots();
  renderMarketTicker(t);
  renderSidebarPulse(t);
  window.requestAnimationFrame(fitTopKpiValues);
}

function renderFxRisk() {
  const risk = computeFxRisk();
  els.fxUsdExposure.textContent = displayMoney(risk.usdValue, 0);
  els.fxUsdWeight.textContent = `${pct(risk.total ? risk.usdValue / risk.total * 100 : 0)} of total wealth`;
  els.fxEurExposure.textContent = displayMoney(risk.eurValue, 0);
  els.fxEurWeight.textContent = `${pct(risk.total ? risk.eurValue / risk.total * 100 : 0)} of total wealth`;
  els.fxDownImpact.textContent = displayMoney(risk.downImpact, 0);
  els.fxDownImpact.className = signedClass(risk.downImpact);
  els.fxUpImpact.textContent = displayMoney(risk.upImpact, 0);
  els.fxUpImpact.className = signedClass(risk.upImpact);
}

function wealthPerformanceForPeriod(total, period) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const startIso = period === "year" ? `${year}-01-01` : `${year}-${month}-01`;
  const todayIso = localDateIso(today);
  const reference = (state.history || [])
    .filter(row => row?.date && row.date >= startIso && row.date <= todayIso && numberValue(row.total) !== 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(0);
  if (!reference) return { available: false, startIso, period };
  const base = numberValue(reference.total);
  const change = numberValue(total) - base;
  return { available: true, date: reference.date, change, pct: base ? change / base * 100 : 0, period };
}

function renderWealthPerformanceValue(result, valueEl, amountEl, referenceEl) {
  if (!result.available) {
    valueEl.textContent = "–";
    valueEl.className = "";
    amountEl.textContent = "Not enough snapshot history";
    amountEl.className = "";
    referenceEl.textContent = `Needs a snapshot from ${result.startIso}`;
    return;
  }
  valueEl.textContent = `${result.pct >= 0 ? "+" : ""}${numberValue(result.pct).toFixed(2)} %`;
  valueEl.className = signedClass(result.pct);
  amountEl.textContent = signedMoney(dashboardValue(result.change), dashboardCurrency(), 0);
  amountEl.className = signedClass(result.change);
  referenceEl.textContent = result.period === "year"
    ? `YTD since inception ${result.date}`
    : `MTD since ${result.date}`;
}

function renderWealthPerformance(total) {
  renderWealthPerformanceValue(
    wealthPerformanceForPeriod(total, "month"),
    els.wealthMonthlyPerformance,
    els.wealthMonthlyPerformanceAmount,
    els.wealthMonthlyPerformanceRef
  );
  renderWealthPerformanceValue(
    wealthPerformanceForPeriod(total, "year"),
    els.wealthYearlyPerformance,
    els.wealthYearlyPerformanceAmount,
    els.wealthYearlyPerformanceRef
  );
}

function previousDayIso(date = new Date()) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return localDateIso(previous);
}

function renderWealthBridgeReferenceOptions(rows) {
  if (!els.wealthBridgeReferenceDate) return;
  const currentValue = state.wealthBridgeReferenceDate || "";
  const options = [`<option value="">Auto reference</option>`].concat(
    [...rows].reverse().map(row => {
      const selected = row.date === currentValue ? " selected" : "";
      const label = `${row.date} | ${displayMoney(row.total, 0)}`;
      return `<option value="${escapeHtml(row.date)}"${selected}>${escapeHtml(label)}</option>`;
    })
  );
  els.wealthBridgeReferenceDate.innerHTML = options.join("");
  if (currentValue && !rows.some(row => row.date === currentValue)) {
    state.wealthBridgeReferenceDate = "";
    saveState();
    els.wealthBridgeReferenceDate.value = "";
  } else {
    els.wealthBridgeReferenceDate.value = currentValue;
  }
}

function wealthBridgeReferenceSnapshot() {
  const rows = (state.history || []).filter(row => row?.date).sort((a, b) => a.date.localeCompare(b.date));
  renderWealthBridgeReferenceOptions(rows);
  if (state.wealthBridgeReferenceDate) {
    const selectedSnapshot = rows.find(row => row.date === state.wealthBridgeReferenceDate);
    if (selectedSnapshot) return { snapshot: selectedSnapshot, mode: "selected" };
  }
  const today = localDateIso();
  const yesterday = previousDayIso();
  const yesterdaySnapshot = rows.find(row => row.date === yesterday);
  if (yesterdaySnapshot) return { snapshot: yesterdaySnapshot, mode: "yesterday" };
  const previousSnapshot = rows.filter(row => row.date < today).at(-1);
  return previousSnapshot ? { snapshot: previousSnapshot, mode: "latest-prior" } : null;
}

function renderWealthBridge(t) {
  const reference = wealthBridgeReferenceSnapshot();
  if (!reference) {
    els.wealthBridgePeriod.textContent = "No snapshot yet.";
    els.wealthBridgeBody.innerHTML = `<tr><td colspan="6"><div class="empty">Take a snapshot on a prior date to start monitoring what drives wealth changes.</div></td></tr>`;
    els.wealthBridgeNote.textContent = "Choose a reference snapshot date, or leave Auto reference to use yesterday if available, otherwise the latest earlier snapshot.";
    return;
  }
  const last = reference.snapshot;
  const totalChange = t.total - numberValue(last.total);
  const absTotalChange = Math.abs(totalChange);
  const fxRisk = computeFxRisk();
  const previousRate = numberValue(last.eurUsd);
  const fxImpact = previousRate && numberValue(state.eurUsd)
    ? numberValue(fxRisk.usdNative) * (1 / numberValue(state.eurUsd) - 1 / previousRate)
    : 0;
  const rateText = value => value ? numberValue(value).toFixed(4) : "-";
  const rows = [
    { key: "stocks", label: "Listed stocks", before: numberValue(last.stocksValue), now: t.stocksValue, value: t.stocksValue - numberValue(last.stocksValue), read: "Price moves, buys/sells and stock FX effect." },
    { key: "bonds", label: "Bonds", before: numberValue(last.bondsValue), now: t.bondsValue, value: t.bondsValue - numberValue(last.bondsValue), read: "Price, accrued coupon, trades and bond FX effect." },
    { key: "structured", label: "Structured products", before: numberValue(last.structuredValue), now: t.structuredValue, value: t.structuredValue - numberValue(last.structuredValue), read: "Subscriptions, coupons, redemptions and manual product values." },
    { key: "cash", label: "Cash", before: numberValue(last.cashValue), now: t.cashValue, value: t.cashValue - numberValue(last.cashValue), read: "Deposits, withdrawals, stock proceeds and cash FX effect." },
    { key: "private", label: "Private equity", before: numberValue(last.privateValue), now: t.privateValue, value: t.privateValue - numberValue(last.privateValue), read: "Manual valuation changes." },
    { key: "realestate", label: "Real estate", before: numberValue(last.realEstateValue), now: t.realEstateValue, value: t.realEstateValue - numberValue(last.realEstateValue), read: "Property value, debt and rent model changes." },
    { key: "divers", label: "Other", before: numberValue(last.diversValue), now: t.diversValue, value: t.diversValue - numberValue(last.diversValue), read: "Manual assets, crypto, life insurance and other changes." },
    { label: "Estimated FX EUR/USD", beforeText: rateText(last.eurUsd), nowText: rateText(state.eurUsd), value: fxImpact, read: `FX translation estimate. USD exposure now: ${displayMoney(fxRisk.usdValue, 2)}.` },
    { label: "Total movement", before: numberValue(last.total), now: t.total, value: totalChange, read: "Current wealth minus reference snapshot.", total: true }
  ];
  const modeLabel = reference.mode === "selected" ? "selected" : (reference.mode === "yesterday" ? "yesterday" : "latest prior");
  els.wealthBridgePeriod.textContent = `Current vs ${modeLabel} snapshot ${escapeHtml(last.date)}.`;
  els.wealthBridgeBody.innerHTML = rows.map(row => {
    const contribution = row.total ? "100.00 %" : (absTotalChange ? pct(Math.abs(row.value) / absTotalChange * 100) : pct(0));
    const valueClass = row.total ? "total-highlight" : signedClass(row.value);
    const before = row.beforeText !== undefined ? row.beforeText : displayMoney(row.before, 2);
    const now = row.nowText !== undefined ? row.nowText : displayMoney(row.now, 2);
    const bridgeAttrs = row.key ? ` class="bridge-clickable" data-bridge-detail="${row.key}" tabindex="0"` : "";
    return `<tr${bridgeAttrs}>
      <td><strong>${escapeHtml(row.label)}</strong></td>
      <td class="num">${escapeHtml(before)}</td>
      <td class="num">${escapeHtml(now)}</td>
      <td class="num ${valueClass}">${displayMoney(row.value, 2)}</td>
      <td class="num">${contribution}</td>
      <td>${escapeHtml(row.read)}</td>
    </tr>`;
  }).join("");
  const exFx = totalChange - fxImpact;
  els.wealthBridgeNote.textContent = `Estimated movement excluding FX: ${displayMoney(exFx, 2)}. FX is an estimate; asset-class lines remain the accounting truth.`;
}

function canvasSetup(canvas, fallbackHeight) {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(320, Math.floor(rect.width || canvas.clientWidth || 900));
  const height = Math.max(180, Math.floor(rect.height || fallbackHeight));
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const styles = getComputedStyle(document.documentElement);
  return {
    ctx,
    width,
    height,
    text: styles.getPropertyValue("--muted").trim() || "#6d716d",
    ink: styles.getPropertyValue("--ink").trim() || "#202523",
    line: styles.getPropertyValue("--line").trim() || "#ded8cc",
    soft: styles.getPropertyValue("--line-soft").trim() || "#ece7dc",
    accent: styles.getPropertyValue("--accent").trim() || "#9c7a2f",
    good: styles.getPropertyValue("--accent-2").trim() || "#2f766d",
    bad: styles.getPropertyValue("--bad").trim() || "#b7443f"
  };
}

function drawBankChart(rows, total, canvas = els.bankChart, emptyText = "No bank exposure to display.") {
  const setup = canvasSetup(canvas, 260);
  if (!setup) return;
  const { ctx, width, height, text, ink, line, accent, good } = setup;
  const displayRows = rows.filter(row => row.total > 0).slice(0, 8);
  const compact = width < 520;
  const pad = compact
    ? { top: 20, right: 74, bottom: 24, left: 92 }
    : { top: 24, right: 120, bottom: 24, left: 150 };
  ctx.font = `${compact ? 11 : 12}px Aptos, Segoe UI, sans-serif`;
  ctx.fillStyle = text;
  if (!displayRows.length) {
    ctx.textAlign = "center";
    ctx.fillText(emptyText, width / 2, height / 2);
    return;
  }
  const max = Math.max(...displayRows.map(row => row.total), 1);
  const barGap = 12;
  const barHeight = Math.max(18, (height - pad.top - pad.bottom - barGap * (displayRows.length - 1)) / displayRows.length);
  ctx.strokeStyle = line;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top - 4);
  ctx.lineTo(pad.left, height - pad.bottom + 4);
  ctx.stroke();
  displayRows.forEach((row, index) => {
    const y = pad.top + index * (barHeight + barGap);
    const barWidth = row.total / max * (width - pad.left - pad.right);
    ctx.fillStyle = colorMixIndex(index, accent, good);
    ctx.fillRect(pad.left, y, Math.max(2, barWidth), barHeight);
    ctx.fillStyle = ink;
    ctx.textAlign = "right";
    ctx.fillText(row.bank, pad.left - 12, y + barHeight / 2 + 4);
    ctx.textAlign = "left";
    const valueLabel = compact ? displayMoney(row.total, 0) : `${displayMoney(row.total, 0)} | ${pct(total ? row.total / total * 100 : 0)}`;
    const labelX = Math.min(width - pad.right + 8, pad.left + barWidth + 10);
    ctx.fillText(valueLabel, labelX, y + barHeight / 2 + 4);
  });
}

function colorMixIndex(index, first, second) {
  return index % 2 === 0 ? first : second;
}

function canvasPointerPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function drawChartHover(ctx, point, labels, bounds, colors) {
  if (!point) return;
  const { width, height, pad } = bounds;
  const { text, ink, line, accent } = colors;
  ctx.save();
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(point.x, pad.top);
  ctx.lineTo(point.x, height - pad.bottom);
  ctx.moveTo(pad.left, point.y);
  ctx.lineTo(width - pad.right, point.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.stroke();

  ctx.font = "12px Aptos, Segoe UI, sans-serif";
  const paddingX = 10;
  const lineHeight = 18;
  const boxWidth = Math.max(...labels.map(label => ctx.measureText(label).width)) + paddingX * 2;
  const boxHeight = labels.length * lineHeight + 12;
  let boxX = point.x + 12;
  if (boxX + boxWidth > width - 8) boxX = point.x - boxWidth - 12;
  let boxY = point.y - boxHeight - 12;
  if (boxY < 8) boxY = point.y + 12;

  ctx.fillStyle = "rgba(18, 24, 22, 0.92)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
  ctx.fill();
  ctx.stroke();
  labels.forEach((label, index) => {
    ctx.fillStyle = index === 0 ? "#fffefa" : text;
    ctx.textAlign = "left";
    ctx.fillText(label, boxX + paddingX, boxY + 20 + index * lineHeight);
  });
  ctx.restore();
}

function recordIntradaySnapshot(force = false) {
  const now = Date.now();
  const last = state.intradaySnapshots?.at(-1);
  if (!force && last && now - numberValue(last.ts) < 4.5 * 60 * 1000) return;
  renderActionCenter();
  const t = computeTotals();
  state.intradaySnapshots = Array.isArray(state.intradaySnapshots) ? state.intradaySnapshots : [];
  state.intradaySnapshots.push({
    ts: now,
    savedAt: new Date(now).toISOString(),
    total: t.total,
    eurUsd: numberValue(state.eurUsd)
  });
  const keepAfter = now - 7 * 24 * 60 * 60 * 1000;
  state.intradaySnapshots = state.intradaySnapshots.filter(row => numberValue(row.ts) >= keepAfter).slice(-2016);
  saveState();
  renderIntradaySnapshots();
}

function scheduleIntradaySnapshots() {
  if (autoSnapshotTimer) window.clearInterval(autoSnapshotTimer);
  recordIntradaySnapshot(false);
  autoSnapshotTimer = window.setInterval(() => recordIntradaySnapshot(false), 5 * 60 * 1000);
}

function maybeCreateWeeklySnapshot(showStatus = false) {
  const selectedDay = Number(state.weeklySnapshotDay);
  if (selectedDay < 0) return false;
  const now = new Date();
  if (now.getDay() !== selectedDay) return false;
  const weekKey = isoWeekKey(now);
  if (state.lastWeeklySnapshotKey === weekKey) return false;
  const result = upsertSnapshot(now, "weekly");
  state.lastWeeklySnapshotKey = weekKey;
  saveState();
  renderHistory();
  renderTotals();
  if (showStatus) setStatus(`Weekly snapshot ${result.updated ? "updated" : "created"} for ${result.date}.`);
  return true;
}

function scheduleWeeklySnapshots() {
  if (weeklySnapshotTimer) window.clearInterval(weeklySnapshotTimer);
  maybeCreateWeeklySnapshot(false);
  weeklySnapshotTimer = window.setInterval(() => maybeCreateWeeklySnapshot(true), 60 * 60 * 1000);
}

function renderIntradaySnapshots() {
  const rows = (state.intradaySnapshots || []).filter(Boolean);
  const last = rows.at(-1);
  const previous = rows.at(-2);
  const change = last && previous ? last.total - previous.total : 0;
  const lastText = last ? new Date(last.ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "-";
  els.intradayRange24h.classList.toggle("active", state.intradayRange !== "7d");
  els.intradayRange7d.classList.toggle("active", state.intradayRange === "7d");
  els.intradaySnapshotStatus.textContent = last ? `Last auto snapshot ${lastText}. Next one in up to 5 min.` : "Auto snapshot every 5 min while this page is open.";
  els.intradaySnapshotNote.textContent = rows.length
    ? `${rows.length} intraday point(s) saved. Showing ${state.intradayRange === "7d" ? "7 days" : "24 hours"}. Latest total: ${displayMoney(last.total, 2)}${previous ? ` | Change: ${displayMoney(change, 2)}` : ""}`
    : "Waiting for the first automatic snapshot.";
  drawIntradayChart(rows);
}

function setIntradayRange(range) {
  state.intradayRange = range === "7d" ? "7d" : "24h";
  saveState();
  renderIntradaySnapshots();
}

function drawIntradayChart(rows) {
  const setup = canvasSetup(els.intradayChart, 260);
  if (!setup) return;
  const { ctx, width, height, text, line, accent, good } = setup;
  const now = Date.now();
  const windowMs = state.intradayRange === "7d" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const displayRows = rows.filter(row => numberValue(row.ts) >= now - windowMs);
  const pad = { top: 24, right: 22, bottom: 38, left: 76 };
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  ctx.font = "12px Aptos, Segoe UI, sans-serif";
  ctx.fillStyle = text;
  if (displayRows.length < 2) {
    ctx.textAlign = "center";
    ctx.fillText(`The ${state.intradayRange === "7d" ? "7d" : "24h"} chart appears after two automatic snapshots.`, width / 2, height / 2);
    return;
  }
  const values = displayRows.map(row => numberValue(row.total));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(1, max - min);
  const yMin = min - spread * 0.08;
  const yMax = max + spread * 0.08;
  const firstTs = displayRows[0].ts;
  const lastTs = displayRows.at(-1).ts;
  const x = ts => pad.left + (width - pad.left - pad.right) * (ts - firstTs) / Math.max(1, lastTs - firstTs);
  const y = value => pad.top + (height - pad.top - pad.bottom) * (1 - (value - yMin) / (yMax - yMin));
  for (let i = 0; i <= 4; i += 1) {
    const yy = pad.top + (height - pad.top - pad.bottom) * i / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, yy);
    ctx.lineTo(width - pad.right, yy);
    ctx.stroke();
    const value = yMax - (yMax - yMin) * i / 4;
    ctx.textAlign = "right";
    ctx.fillText(displayMoney(value, 0), pad.left - 10, yy + 4);
  }
  ctx.beginPath();
  displayRows.forEach((row, index) => {
    const xx = x(row.ts);
    const yy = y(row.total);
    if (index === 0) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
  });
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  displayRows.forEach((row, index) => {
    ctx.beginPath();
    ctx.arc(x(row.ts), y(row.total), index === displayRows.length - 1 ? 4 : 2.5, 0, Math.PI * 2);
    ctx.fillStyle = index === displayRows.length - 1 ? good : accent;
    ctx.fill();
  });
  ctx.fillStyle = text;
  ctx.textAlign = "left";
  ctx.fillText(new Date(firstTs).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), pad.left, height - 14);
  ctx.textAlign = "right";
  ctx.fillText(new Date(lastTs).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), width - pad.right, height - 14);
  if (intradayChartHover) {
    const hoverX = Math.max(pad.left, Math.min(width - pad.right, intradayChartHover.x));
    const nearest = displayRows.reduce((best, row) => {
      const distance = Math.abs(x(row.ts) - hoverX);
      return !best || distance < best.distance ? { row, distance } : best;
    }, null);
    if (nearest) {
      const point = { x: x(nearest.row.ts), y: y(nearest.row.total) };
      const timeLabel = new Date(nearest.row.ts).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      drawChartHover(ctx, point, [displayMoney(nearest.row.total, 2), timeLabel], { width, height, pad }, { text, ink: good, line, accent: good });
    }
  }
}

function allocationRows(t) {
  return [
    ["Stocks", t.stocksValue],
    ["Bonds", t.bondsValue],
    ["Structured products", t.structuredValue],
    ["Cash", t.cashValue],
    ["Private equity", t.privateValue],
    ["Real estate", t.realEstateValue],
    ["Other", t.diversValue]
  ].filter(row => row[1] > 0);
}

function allocationColors() {
  return ["#4c91de", "#2c9d95", "#657bd4", "#52a768", "#9b7ac9", "#b58a39", "#7d8880"];
}

function drawAllocationDonut(rows, total) {
  const canvas = els.allocationDonut;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const size = Math.max(120, Math.floor(Math.min(rect.width || 166, rect.height || 166)));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);
  const colors = allocationColors();
  if (!rows.length || !total) return;
  const center = size / 2;
  const radius = size * 0.4;
  const lineWidth = size * 0.19;
  let angle = -Math.PI / 2;
  rows.forEach(([label, value], index) => {
    const sweep = Math.max(0, value / total) * Math.PI * 2;
    if (sweep <= 0.04) {
      angle += sweep;
      return;
    }
    ctx.beginPath();
    ctx.strokeStyle = colors[index % colors.length];
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "butt";
    ctx.arc(center, center, radius, angle + 0.018, angle + sweep - 0.018);
    ctx.stroke();
    angle += sweep;
  });
}

function renderAllocation(t) {
  const rows = allocationRows(t);
  const colors = allocationColors();
  els.allocationBars.innerHTML = rows.length ? rows.map(([label, value], index) => {
    const weight = t.total ? value / t.total * 100 : 0;
    return `<div class="allocation-legend-row">
      <span class="allocation-dot" style="--allocation-color:${colors[index % colors.length]}"></span>
      <strong>${escapeHtml(label)}</strong>
      <div class="allocation-legend-value"><span>${displayMoney(value, 0)}</span><small>${pct(weight)}</small></div>
    </div>`;
  }).join("") : `<div class="empty">No allocation.</div>`;
  els.allocationTotal.textContent = dashboardMoney(t.total, 0);
  drawAllocationDonut(rows, t.total);
}

function bankLogoText(bank) {
  const words = String(bank || "Bank").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "BK";
  if (words.length === 1) return words[0].replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase() || "BK";
  return words.slice(0, 2).map(word => word.replace(/[^a-z0-9]/gi, "").slice(0, 2)).join("").slice(0, 4).toUpperCase() || "BK";
}

const BANK_LOGO_ASSETS = Object.freeze({
  binance: "assets/bank-logos/binance.svg",
  bnp: "assets/bank-logos/bnp.svg",
  cbh: "assets/bank-logos/cbh.png",
  fidelity: "assets/bank-logos/fidelity.png",
  hsbc: "assets/bank-logos/hsbc.svg",
  revolut: "assets/bank-logos/revolut.svg",
  transat: "assets/bank-logos/transat.png",
  zurich: "assets/bank-logos/zurich.svg"
});

function bankLogoKey(bank) {
  const normalized = String(bank || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (normalized.includes("binance")) return "binance";
  if (normalized.includes("revolut")) return "revolut";
  if (normalized.includes("fidelity")) return "fidelity";
  if (normalized.includes("transat")) return "transat";
  if (normalized.includes("zurich")) return "zurich";
  if (normalized.includes("hsbc")) return "hsbc";
  if (normalized.includes("bnp")) return "bnp";
  if (normalized.includes("cbh")) return "cbh";
  if (normalized.includes("coffre")) return "vault";
  return "";
}

function bankLogoMarkup(bank) {
  const key = bankLogoKey(bank);
  if (key === "vault") return `<span class="dashboard-bank-vault" aria-hidden="true"></span>`;
  const asset = BANK_LOGO_ASSETS[key];
  const monogram = escapeHtml(bankLogoText(bank));
  if (!asset) return `<span class="dashboard-bank-monogram">${monogram}</span>`;
  return `<img src="${asset}" alt="" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="dashboard-bank-monogram" hidden>${monogram}</span>`;
}

function bankLogoHue(bank) {
  const text = String(bank || "Bank");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  return Math.abs(hash) % 360;
}

function renderDashboardTopStocks(t) {
  const rows = stockExposures().slice(0, 5);
  const dailyMove = t.stocksPrevious ? t.stocksDayPnl / t.stocksPrevious * 100 : 0;
  els.dashboardTopStocksPnl.textContent = signedMoney(dashboardValue(t.stocksDayPnl), dashboardCurrency(), 0);
  els.dashboardTopStocksPnl.className = signedClass(t.stocksDayPnl);
  els.dashboardTopStocksMove.textContent = `${dailyMove >= 0 ? "+" : ""}${numberValue(dailyMove).toFixed(2)} %`;
  els.dashboardTopStocksMove.className = signedClass(dailyMove);
  els.dashboardTopStocksBody.innerHTML = rows.length ? rows.map(row => {
    const currency = row.displayCurrency || "EUR";
    const move = numberValue(row.dayMovePct);
    return `<div class="dashboard-stock-row">
      <span class="dashboard-stock-position"><strong>${escapeHtml(row.symbol)}</strong><small title="${escapeHtml(row.name || "Listed stock")}">${escapeHtml(row.name || "Listed stock")}</small></span>
      <span class="dashboard-stock-price">${money(row.avgPrice, currency, 2)}</span>
      <span class="dashboard-stock-move ${signedClass(move)}">${move >= 0 ? "+" : ""}${move.toFixed(2)} %</span>
      <strong class="dashboard-stock-pnl ${signedClass(row.dayPnlEur)}">${signedMoney(dashboardValue(row.dayPnlEur), dashboardCurrency(), 0)}</strong>
    </div>`;
  }).join("") : `<div class="empty">No listed stock position.</div>`;
}

function renderDashboardBanks(total) {
  const sourceRows = totalsByBank();
  const rows = sortState.dashboardBankBody
    ? sortRows(sourceRows, "dashboardBankBody")
    : [...sourceRows].sort((a, b) => numberValue(b.total) - numberValue(a.total));
  els.dashboardBankBody.innerHTML = rows.length ? rows.slice(0, 4).map(row => `<button class="dashboard-bank-card" type="button" data-dashboard-bank="${escapeHtml(row.bank)}" style="--bank-hue:${bankLogoHue(row.bank)}" aria-label="View ${escapeHtml(row.bank)} details">
    <span class="dashboard-bank-logo logo-${bankLogoKey(row.bank) || "fallback"}" aria-hidden="true">${bankLogoMarkup(row.bank)}</span>
    <span class="dashboard-bank-name" title="${escapeHtml(row.bank)}">${escapeHtml(row.bank)}</span>
    <strong class="dashboard-bank-amount">${displayMoney(row.total, 0)}</strong>
    <small class="dashboard-bank-weight">${pct(total ? row.total / total * 100 : 0)} of wealth</small>
  </button>`).join("") : `<div class="empty">No bank.</div>`;
}

function renderStocks() {
  renderStockExposures();
  const rows = sortRows(state.stocks.map((row, index) => ({ ...row, __index: index })), "stocksBody");
  els.stocksBody.innerHTML = rows.length ? rows.map(row => {
    const index = row.__index;
    const value = stockValueEur(row);
    const day = stockDayPnlEur(row);
    const total = stockTotalPnlEur(row);
    return `<tr>
      <td class="symbol">${renderLiveInput(row.symbol, `updateField('stocks', ${index}, 'symbol', this.value.toUpperCase())`, 'aria-label="Ticker"')}</td>
      <td>${renderLiveInput(row.name, `updateField('stocks', ${index}, 'name', this.value)`, 'aria-label="Name"')}</td>
      <td>${renderLiveInput(row.bank, `updateField('stocks', ${index}, 'bank', this.value)`, 'aria-label="Bank"')}</td>
      <td class="num">${renderLiveInput(row.qty, `updateField('stocks', ${index}, 'qty', this.value)`, 'type="number" step="0.0001"')}</td>
      <td class="num">${renderLiveInput(row.cost, `updateField('stocks', ${index}, 'cost', this.value)`, 'type="number" step="0.0001"')}</td>
      <td>${currencySelect("stocks", index, row.currency)}</td>
      <td class="num">${displayMoney(value, 2)}</td>
      <td class="num ${signedClass(day)}">${displayMoney(day, 2)}</td>
      <td class="num ${signedClass(total)}">${displayMoney(total, 2)}</td>
      <td class="actions"><span class="action-stack"><button class="mini trade-mini" type="button" title="Sell stock" aria-label="Sell stock" onclick="openSellModal(${index})">Sell</button><button class="mini trade-mini" type="button" title="Buy more" aria-label="Buy more" onclick="openBuyModal(${index})">Buy</button></span></td>
    </tr>`;
  }).join("") : `<tr><td colspan="10"><div class="empty">No stock line.</div></td></tr>`;
}

function renderTransactions() {
  renderTransactionTable(els.transactionsBody, state.transactions || [], "transactionsBody", "No transaction yet. Use Sell on a stock or bond line to record the first one.");
  renderBondTransactions();
  renderCashTransactions();
}

function renderBondTransactions() {
  if (!els.bondTransactionsBody) return;
  const rows = (state.transactions || []).filter(row => isBondLikeTransactionType(row.type));
  renderTransactionTable(els.bondTransactionsBody, rows, "bondTransactionsBody", "No bond transaction yet.");
}

function renderCashTransactions() {
  if (!els.cashTransactionsBody) return;
  const rows = sortRows((state.transactions || []).filter(row => Math.abs(numberValue(row.cashImpact)) > 0.00000001).map(row => ({ ...row })), "cashTransactionsBody");
  const groups = transactionGroups(rows);
  els.cashTransactionsBody.innerHTML = groups.length ? groups.map(group => {
    const isExpanded = expandedTransactionSymbols.has(group.key);
    const toggle = `<button class="expand-btn" type="button" data-transaction-key="${escapeHtml(group.key)}" aria-label="View ${escapeHtml(group.symbol)} cash movements">${isExpanded ? "-" : "+"}</button>`;
    const detailRows = isExpanded ? group.rows.map(row => cashTransactionDetailRow(row)).join("") : "";
    const cashImpact = group.rows.reduce((sum, row) => sum + numberValue(row.cashImpact), 0);
    const amountLabel = group.currencies.includes(",") ? signedMoney(dashboardValue(group.cashImpactEur), displayCurrencyLabel(), 2) : signedMoney(cashImpact, group.currencies || "EUR", 2);
    return `<tr>
      <td>${escapeHtml(group.latestDate)}</td>
      <td>${escapeHtml(group.types)}</td>
      <td class="symbol">${toggle} <strong>${escapeHtml(group.symbol)}</strong></td>
      <td>${escapeHtml(group.banks)}</td>
      <td class="num ${signedClass(group.cashImpactEur)}">${amountLabel}</td>
      <td>${escapeHtml(group.currencies)}</td>
      <td>${escapeHtml(`${group.rows.length} movement${group.lastNote ? ` | ${group.lastNote}` : ""}`)}</td>
    </tr>${detailRows}`;
  }).join("") : `<tr><td colspan="7"><div class="empty">No cash movement yet.</div></td></tr>`;
}

function forecastQuarterStart(value = new Date()) {
  const source = value instanceof Date ? new Date(value) : (dateValue(value) || new Date());
  return new Date(source.getFullYear(), Math.floor(source.getMonth() / 3) * 3, 1);
}

function forecastQuarterDate(start, offset = 0) {
  return new Date(start.getFullYear(), start.getMonth() + offset * 3, 1);
}

function forecastQuarterLabel(date) {
  return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
}

function forecastFlowEur(row) {
  return numberValue(row.amount) * fx(row.currency || "EUR");
}

function forecastRowsForQuarter(quarterStart) {
  return (state.forecastFlows || []).filter(row => {
    if (row.frequency === "One-off") return forecastQuarterStart(row.date || row.startDate).getTime() === quarterStart.getTime();
    return !row.startDate || forecastQuarterStart(row.startDate) <= quarterStart;
  });
}

function setForecastFrequency(index, value) {
  const row = state.forecastFlows[index];
  if (!row) return;
  row.frequency = value === "One-off" ? "One-off" : "Quarterly";
  if (row.frequency === "One-off") row.date = row.date || row.startDate || todayIso();
  if (row.frequency === "Quarterly") row.startDate = row.startDate || row.date || todayIso();
  saveState();
  render();
}

function renderForecast() {
  if (!els.forecastBody) return;
  const flows = Array.isArray(state.forecastFlows) ? state.forecastFlows : [];
  els.forecastBody.innerHTML = flows.length ? flows.map((row, index) => `<tr>
      <td><select onchange="updateField('forecastFlows', ${index}, 'direction', this.value)"><option value="In" ${row.direction !== "Out" ? "selected" : ""}>Inflow</option><option value="Out" ${row.direction === "Out" ? "selected" : ""}>Outflow</option></select></td>
      <td><select onchange="setForecastFrequency(${index}, this.value)"><option value="Quarterly" ${row.frequency !== "One-off" ? "selected" : ""}>Recurring quarterly</option><option value="One-off" ${row.frequency === "One-off" ? "selected" : ""}>One-off</option></select></td>
      <td>${renderInput(row.name, `updateField('forecastFlows', ${index}, 'name', this.value)`)}</td>
      <td>${renderInput(row.bank, `updateField('forecastFlows', ${index}, 'bank', this.value)`)}</td>
      <td>${currencySelect("forecastFlows", index, row.currency || "USD")}</td>
      <td class="num">${renderInput(row.amount, `updateField('forecastFlows', ${index}, 'amount', this.value)`, 'type="number" step="0.01" min="0"')}</td>
      <td>${renderInput(row.frequency === "One-off" ? (row.date || row.startDate) : row.startDate, `updateField('forecastFlows', ${index}, '${row.frequency === "One-off" ? "date" : "startDate"}', this.value)`, 'type="date"')}</td>
      <td>${renderInput(row.note, `updateField('forecastFlows', ${index}, 'note', this.value)`)}</td>
      <td class="actions"><button class="mini danger" type="button" onclick="removeRow('forecastFlows', ${index})">Del.</button></td>
    </tr>`).join("") : `<tr><td colspan="9"><div class="empty">Add a quarterly inflow, outflow or spending envelope to start the forecast.</div></td></tr>`;
  const firstQuarter = forecastQuarterStart();
  const quarters = Array.from({ length: 4 }, (_, index) => forecastQuarterDate(firstQuarter, index)).map(start => {
    const rows = forecastRowsForQuarter(start);
    const inflows = rows.filter(row => row.direction !== "Out").reduce((sum, row) => sum + forecastFlowEur(row), 0);
    const outflows = rows.filter(row => row.direction === "Out").reduce((sum, row) => sum + forecastFlowEur(row), 0);
    return { start, inflows, outflows, net: inflows - outflows };
  });
  const next = quarters[0] || { inflows: 0, outflows: 0, net: 0 };
  els.forecastNextQuarter.textContent = dashboardMoney(next.net, 0);
  els.forecastNextQuarter.className = signedClass(next.net);
  els.forecastInflows.textContent = dashboardMoney(next.inflows, 0);
  els.forecastInflows.className = signedClass(next.inflows);
  els.forecastOutflows.textContent = dashboardMoney(-next.outflows, 0);
  els.forecastOutflows.className = signedClass(-next.outflows);
  const fourQuarterNet = quarters.reduce((sum, row) => sum + row.net, 0);
  els.forecastNet.textContent = dashboardMoney(fourQuarterNet, 0);
  els.forecastNet.className = signedClass(fourQuarterNet);
  els.forecastQuarterBody.innerHTML = quarters.map(row => `<tr>
    <td><strong>${forecastQuarterLabel(row.start)}</strong></td>
    <td class="num positive">${dashboardMoney(row.inflows, 0)}</td>
    <td class="num negative">${dashboardMoney(-row.outflows, 0)}</td>
    <td class="num ${signedClass(row.net)}">${dashboardMoney(row.net, 0)}</td>
  </tr>`).join("");
  const totalInflows = flows.filter(row => row.direction !== "Out").reduce((sum, row) => sum + forecastFlowEur(row), 0);
  const totalOutflows = flows.filter(row => row.direction === "Out").reduce((sum, row) => sum + forecastFlowEur(row), 0);
  els.forecastInflowsBody.innerHTML = forecastTableRows("In");
  els.forecastOutflowsBody.innerHTML = forecastTableRows("Out");
  els.forecastInflowsTableTotal.textContent = dashboardMoney(totalInflows, 0);
  els.forecastOutflowsTableTotal.textContent = dashboardMoney(-totalOutflows, 0);
  els.forecastInflowsContext.textContent = `${flows.filter(row => row.direction !== "Out").length} flow(s) in the quarter`;
  els.forecastOutflowsContext.textContent = `${flows.filter(row => row.direction === "Out").length} flow(s) in the quarter`;
}

function forecastTableRows(direction) {
  const rows = (state.forecastFlows || []).filter(row => direction === "In" ? row.direction !== "Out" : row.direction === "Out");
  if (!rows.length) return "<tr><td colspan='5'><div class='empty'>No forecast flow.</div></td></tr>";
  return rows.map(row => {
    const dateLabel = row.frequency === "One-off" ? (row.date || row.startDate || "-") : (row.startDate || "-");
    const typeLabel = row.frequency === "One-off" ? "One-off" : "Recurring quarterly";
    return "<tr><td><strong>" + escapeHtml(row.name || "Unnamed flow") + "</strong></td><td>" + typeLabel + "</td><td>" + escapeHtml(dateLabel) + "</td><td>" + escapeHtml(row.currency || "EUR") + "</td><td class='num'>" + money(row.amount, row.currency || "EUR", 2) + "</td></tr>";
  }).join("");
}

function transactionAssetClass(row) {
  if (["Structured Buy", "Structured Coupon", "Structured Redemption"].includes(row.type)) return "Structured products";
  if (isCashTransactionType(row.type)) return "Cash";
  if (isBondLikeTransactionType(row.type) || isBondTransactionType(row.type)) return "Bonds";
  if (["Buy", "Sell"].includes(row.type)) return "Stocks";
  return "Other";
}

function setSelectOptions(select, values, allLabel = "All") {
  if (!select) return;
  const current = select.value;
  const options = [allLabel, ...values.filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: "base" }))];
  select.innerHTML = options.map((value, index) => `<option value="${index ? escapeHtml(value) : ""}">${escapeHtml(value)}</option>`).join("");
  select.value = options.includes(current) ? current : "";
}

function syncJournalFilterOptions(rows) {
  setSelectOptions(els.journalTypeFilter, [...new Set(rows.map(row => row.type))]);
  setSelectOptions(els.journalBankFilter, [...new Set(rows.map(row => row.bank || "Unallocated"))]);
  setSelectOptions(els.journalCurrencyFilter, [...new Set(rows.map(row => row.currency || "EUR"))]);
  setSelectOptions(els.journalAssetFilter, [...new Set(rows.map(transactionAssetClass))]);
}

function journalFilteredRows() {
  const allRows = (state.transactions || []).map(row => ({ ...row, assetClass: transactionAssetClass(row) }));
  const query = (els.journalSearch?.value || "").trim().toLowerCase();
  const type = els.journalTypeFilter?.value || "";
  const bank = els.journalBankFilter?.value || "";
  const currency = els.journalCurrencyFilter?.value || "";
  const assetClass = els.journalAssetFilter?.value || "";
  const from = els.journalFromDate?.value || "";
  const to = els.journalToDate?.value || "";
  return allRows.filter(row => {
    const haystack = [row.date, row.type, row.assetClass, row.symbol, row.name, row.bank, row.currency, row.note].join(" ").toLowerCase();
    if (query && !haystack.includes(query)) return false;
    if (type && row.type !== type) return false;
    if (bank && (row.bank || "Unallocated") !== bank) return false;
    if (currency && (row.currency || "EUR") !== currency) return false;
    if (assetClass && row.assetClass !== assetClass) return false;
    if (from && String(row.date) < from) return false;
    if (to && String(row.date) > to) return false;
    return true;
  });
}

function renderJournal() {
  if (!els.journalBody) return;
  const allRows = (state.transactions || []).map(row => ({ ...row }));
  syncJournalFilterOptions(allRows);
  const rows = sortRows(journalFilteredRows(), "journalBody");
  const cashImpactEur = rows.reduce((sum, row) => sum + numberValue(row.cashImpact) * fx(row.currency || "EUR"), 0);
  const realizedPnl = rows.reduce((sum, row) => sum + numberValue(row.realizedPnlEur), 0);
  const latest = [...rows].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  els.journalCount.textContent = rows.length.toLocaleString("en-US");
  els.journalCountContext.textContent = `${allRows.length.toLocaleString("en-US")} total event(s)`;
  els.journalCashImpact.textContent = signedMoney(dashboardValue(cashImpactEur), displayCurrencyLabel(), 2);
  els.journalCashImpact.className = signedClass(cashImpactEur);
  els.journalRealizedPnl.textContent = displayMoney(realizedPnl, 2);
  els.journalRealizedPnl.className = signedClass(realizedPnl);
  els.journalLatest.textContent = latest ? latest.date : "-";
  els.journalLatestContext.textContent = latest ? `${latest.type} | ${latest.symbol || latest.name || "-"}` : "No event";
  els.journalBody.innerHTML = rows.length ? rows.map(row => journalRow(row)).join("") : `<tr><td colspan="11"><div class="empty">No journal event matches the filters.</div></td></tr>`;
}

function journalRow(row) {
  const realizesPnl = ["Sell", "Bond Sell", "Early Redemption", "Redemption"].includes(row.type);
  const priceLabel = isCashTransactionType(row.type) ? "-" : ["Bond Sell", "Bond Payment", "Early Redemption", "Redemption"].includes(row.type) ? `${numberValue(row.price).toFixed(4)} %` : money(row.price, row.currency || "USD", 2);
  return `<tr>
    <td>${escapeHtml(row.date)}</td>
    <td>${escapeHtml(row.assetClass)}</td>
    <td>${escapeHtml(row.type)}</td>
    <td class="symbol"><strong>${escapeHtml(row.symbol || row.name || "-")}</strong></td>
    <td>${escapeHtml(row.bank || "Unallocated")}</td>
    <td class="num">${numberValue(row.qty).toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
    <td class="num">${priceLabel}</td>
    <td>${escapeHtml(row.currency || "EUR")}</td>
    <td class="num ${signedClass(row.cashImpact)}">${signedMoney(row.cashImpact, row.currency || "EUR", 2)}</td>
    <td class="num ${realizesPnl ? signedClass(row.realizedPnlEur) : ""}">${realizesPnl ? displayMoney(row.realizedPnlEur, 2) : "-"}</td>
    <td><span class="action-stack"><span>${escapeHtml(row.note || "")}</span><button class="mini trade-mini" type="button" title="Edit transaction" aria-label="Edit transaction" data-edit-transaction="${escapeHtml(row.id)}">Edit</button></span></td>
  </tr>`;
}

function resetJournalFilters() {
  [els.journalSearch, els.journalTypeFilter, els.journalBankFilter, els.journalCurrencyFilter, els.journalAssetFilter, els.journalFromDate, els.journalToDate].forEach(input => {
    if (input) input.value = "";
  });
  renderJournal();
  configureSortableHeaders();
}

function renderTransactionTable(tbody, sourceRows, tableId, emptyMessage) {
  const rows = sortRows(sourceRows.map(row => ({ ...row })), tableId);
  const groups = transactionGroups(rows);
  tbody.innerHTML = groups.length ? groups.map(group => {
    const isExpanded = expandedTransactionSymbols.has(group.key);
    const toggle = `<button class="expand-btn" type="button" data-transaction-key="${escapeHtml(group.key)}" aria-label="View ${escapeHtml(group.symbol)} transactions">${isExpanded ? "-" : "+"}</button>`;
    const detailRows = isExpanded ? group.rows.map(row => transactionDetailRow(row)).join("") : "";
    return `<tr>
      <td>${escapeHtml(group.latestDate)}</td>
      <td>${escapeHtml(group.types)}</td>
      <td class="symbol">${toggle} <strong>${escapeHtml(group.symbol)}</strong></td>
      <td>${escapeHtml(group.banks)}</td>
      <td class="num">${numberValue(group.qty).toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
      <td class="num">${escapeHtml(group.averagePriceLabel)}</td>
      <td>${escapeHtml(group.currencies)}</td>
      <td class="num ${signedClass(group.cashImpactEur)}">${displayMoney(group.cashImpactEur, 2)}</td>
      <td class="num ${signedClass(group.realizedPnlEur)}">${displayMoney(group.realizedPnlEur, 2)}</td>
      <td>${escapeHtml(`${group.rows.length} txn${group.lastNote ? ` | ${group.lastNote}` : ""}`)}</td>
    </tr>${detailRows}`;
  }).join("") : `<tr><td colspan="10"><div class="empty">${escapeHtml(emptyMessage)}</div></td></tr>`;
}

function transactionGroups(rows) {
  const map = new Map();
  rows.forEach(row => {
    const symbol = row.symbol || row.name || "Transaction";
    const key = symbol.toUpperCase();
    if (!map.has(key)) {
      map.set(key, {
        key,
        symbol,
        rows: [],
        qty: 0,
        priceQty: 0,
        cashImpactEur: 0,
        realizedPnlEur: 0,
        latestDate: "",
        banks: new Set(),
        currencies: new Set(),
        types: new Set(),
        lastNote: ""
      });
    }
    const group = map.get(key);
    const qty = numberValue(row.qty);
    group.rows.push(row);
    group.qty += qty;
    group.priceQty += qty * numberValue(row.price);
    group.cashImpactEur += numberValue(row.cashImpact) * fx(row.currency || "USD");
    group.realizedPnlEur += numberValue(row.realizedPnlEur);
    if (!group.latestDate || String(row.date).localeCompare(group.latestDate) > 0) group.latestDate = row.date;
    if (row.bank) group.banks.add(row.bank);
    if (row.currency) group.currencies.add(row.currency);
    if (row.type) group.types.add(row.type);
    if (!group.lastNote && row.note) group.lastNote = row.note;
  });
  return [...map.values()].map(group => {
    const currencyList = [...group.currencies];
    const typeList = [...group.types];
    const isBondGroup = typeList.some(type => ["Bond Sell", "Bond Payment", "Early Redemption", "Redemption"].includes(type));
    const isCashGroup = typeList.some(type => ["Cash In", "Cash Out"].includes(type));
    const avgPrice = group.qty ? group.priceQty / group.qty : 0;
    const averagePriceLabel = isCashGroup ? "-" : isBondGroup ? `${avgPrice.toFixed(4)} %` : currencyList.length === 1 ? money(avgPrice, currencyList[0] || "USD", 2) : "Mixed";
    return {
      ...group,
      rows: group.rows.sort((a, b) => String(b.date).localeCompare(String(a.date))),
      banks: [...group.banks].join(", ") || "Unallocated",
      currencies: currencyList.join(", ") || "USD",
      types: typeList.join(", "),
      averagePriceLabel
    };
  }).sort((a, b) => String(b.latestDate).localeCompare(String(a.latestDate)));
}

function transactionDetailRow(row) {
    const realizesPnl = ["Sell", "Bond Sell", "Early Redemption", "Redemption"].includes(row.type);
    const note = `${row.note || ""}${row.buyDate ? ` Buy date: ${row.buyDate}` : ""}`;
    const priceLabel = isCashTransactionType(row.type) ? "-" : ["Bond Sell", "Bond Payment", "Early Redemption", "Redemption"].includes(row.type) ? `${numberValue(row.price).toFixed(4)} %` : money(row.price, row.currency || "USD", 2);
    return `<tr class="detail-row">
      <td>${escapeHtml(row.date)}</td>
      <td>${escapeHtml(row.type)}</td>
      <td class="symbol"><span class="detail-label">${escapeHtml(row.symbol)}</span></td>
      <td>${escapeHtml(row.bank)}</td>
      <td class="num">${numberValue(row.qty).toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
      <td class="num">${priceLabel}</td>
      <td>${escapeHtml(row.currency || "USD")}</td>
      <td class="num">${money(row.cashImpact, row.currency || "USD", 2)}</td>
      <td class="num ${realizesPnl ? signedClass(row.realizedPnlEur) : ""}">${realizesPnl ? displayMoney(row.realizedPnlEur, 2) : "-"}</td>
      <td><span class="action-stack"><span>${escapeHtml(note)}</span><button class="mini trade-mini" type="button" title="Edit transaction" aria-label="Edit transaction" data-edit-transaction="${escapeHtml(row.id)}">Edit</button></span></td>
    </tr>`;
}

function cashTransactionDetailRow(row) {
    const note = row.note || "";
    const amount = numberValue(row.cashImpact);
    return `<tr class="detail-row">
      <td>${escapeHtml(row.date)}</td>
      <td>${escapeHtml(row.type)}</td>
      <td class="symbol"><span class="detail-label">${escapeHtml(row.symbol)}</span></td>
      <td>${escapeHtml(row.bank)}</td>
      <td class="num ${signedClass(amount)}">${signedMoney(amount, row.currency || "EUR", 2)}</td>
      <td>${escapeHtml(row.currency || "EUR")}</td>
      <td><span class="action-stack"><span>${escapeHtml(note)}</span><button class="mini trade-mini" type="button" title="Edit transaction" aria-label="Edit transaction" data-edit-transaction="${escapeHtml(row.id)}">Edit</button></span></td>
    </tr>`;
}

function renderStockExposures() {
  const rows = sortRows(stockExposures(), "stockExposureBody");
  els.stockExposureBody.innerHTML = rows.length ? rows.map(row => {
    const isExpanded = expandedStockSymbols.has(row.symbol);
    const toggle = row.bankCount > 1 ? `<button class="expand-btn" type="button" data-symbol="${escapeHtml(row.symbol)}" aria-label="View ${escapeHtml(row.symbol)} details">${isExpanded ? "-" : "+"}</button>` : "";
    const detailRows = isExpanded ? row.lines.map(line => {
      const lineValue = stockValueEur(line);
      const lineDay = stockDayPnlEur(line);
      const lineTotal = stockTotalPnlEur(line);
      return `<tr class="detail-row">
        <td></td>
        <td></td>
        <td><span class="detail-label">${escapeHtml(line.bank || "Unallocated")}</span></td>
        <td class="num">${numberValue(line.qty).toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
        <td class="num">${money(numberValue(line.price), line.currency || row.displayCurrency, 2)}</td>
        <td class="num">${money(numberValue(line.previousClose), line.currency || row.displayCurrency, 2)}</td>
        <td class="num market-highlight ${signedClass(line.previousClose ? (numberValue(line.price) - numberValue(line.previousClose)) / numberValue(line.previousClose) * 100 : 0)}">${line.previousClose ? pct((numberValue(line.price) - numberValue(line.previousClose)) / numberValue(line.previousClose) * 100) : pct(0)}</td>
        <td class="num">${money(numberValue(line.cost), line.currency || row.displayCurrency, 2)}</td>
        <td class="num">${displayMoney(lineValue, 2)}</td>
        <td class="num market-highlight ${signedClass(lineDay)}">${displayMoney(lineDay, 2)}</td>
        <td class="num ${signedClass(lineTotal)}">${displayMoney(lineTotal, 2)}</td>
        <td></td>
      </tr>`;
    }).join("") : "";
    return `<tr>
    <td class="expand-cell">${toggle}</td>
    <td class="symbol"><strong>${escapeHtml(row.symbol)}</strong></td>
    <td>${escapeHtml(row.name)}</td>
    <td class="num">${numberValue(row.qty).toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
    <td class="num">${money(row.avgPrice, row.displayCurrency, 2)}</td>
    <td class="num">${money(row.avgPreviousClose, row.displayCurrency, 2)}</td>
    <td class="num market-highlight ${signedClass(row.dayMovePct)}">${pct(row.dayMovePct)}</td>
    <td class="num">${money(row.weightedCost, row.displayCurrency, 2)}</td>
    <td class="num">${displayMoney(row.valueEur, 2)}</td>
    <td class="num market-highlight ${signedClass(row.dayPnlEur)}">${displayMoney(row.dayPnlEur, 2)}</td>
    <td class="num ${signedClass(row.totalPnlEur)}">${displayMoney(row.totalPnlEur, 2)}</td>
    <td class="num">${row.bankCount}</td>
  </tr>${detailRows}`;
  }).join("") : `<tr><td colspan="12"><div class="empty">No stock exposure.</div></td></tr>`;
}

function toggleStockExposure(symbol) {
  if (expandedStockSymbols.has(symbol)) {
    expandedStockSymbols.delete(symbol);
  } else {
    expandedStockSymbols.add(symbol);
  }
  renderStockExposures();
}

function toggleTransactionGroup(key) {
  if (expandedTransactionSymbols.has(key)) {
    expandedTransactionSymbols.delete(key);
  } else {
    expandedTransactionSymbols.add(key);
  }
  renderTransactions();
}

function renderBonds() {
  const rows = sortRows(state.bonds.map((row, index) => ({ ...row, __index: index })), "bondsBody");
  renderBondAnalytics();
  els.bondsBody.innerHTML = rows.length ? rows.map(row => {
    const index = row.__index;
    const accrued = bondAccruedEur(row);
    const value = bondValueEur(row);
    const pnl = bondPnlEur(row);
    return `<tr>
      <td>${renderInput(row.name, `updateField('bonds', ${index}, 'name', this.value)`)}</td>
      <td><select onchange="updateField('bonds', ${index}, 'type', this.value)"><option ${row.type === "Treasury US" ? "selected" : ""}>Treasury US</option><option ${row.type === "Private OTC bond" ? "selected" : ""}>Private OTC bond</option><option ${row.type === "Autre" ? "selected" : ""}>Autre</option></select></td>
      <td>${renderInput(row.bank, `updateField('bonds', ${index}, 'bank', this.value)`)}</td>
      <td>${renderInput(row.issuer, `updateField('bonds', ${index}, 'issuer', this.value)`)}</td>
      <td>${currencySelect("bonds", index, row.currency)}</td>
      <td class="num">${renderInput(row.nominal, `updateField('bonds', ${index}, 'nominal', this.value)`, 'type="number" step="1"')}</td>
      <td class="num">${renderInput(row.cleanPrice, `updateField('bonds', ${index}, 'cleanPrice', this.value)`, 'type="number" step="0.0001"')}</td>
      <td class="num">${renderInput(row.costPrice, `updateField('bonds', ${index}, 'costPrice', this.value)`, 'type="number" step="0.0001"')}</td>
      <td class="num">${renderInput(row.couponRate, `updateField('bonds', ${index}, 'couponRate', this.value)`, 'type="number" step="0.0001"')}</td>
      <td class="num">${renderInput(row.frequency, `updateField('bonds', ${index}, 'frequency', this.value)`, 'type="number" step="1" min="1"')}</td>
      <td>${renderInput(row.lastCoupon, `updateField('bonds', ${index}, 'lastCoupon', this.value)`, 'type="date"')}</td>
      <td>${renderInput(row.nextCoupon, `updateField('bonds', ${index}, 'nextCoupon', this.value)`, 'type="date"')}</td>
      <td>${renderInput(row.maturity, `updateField('bonds', ${index}, 'maturity', this.value)`, 'type="date"')}</td>
      <td><select onchange="updateField('bonds', ${index}, 'dayCount', this.value)"><option ${row.dayCount === "ACT/ACT" ? "selected" : ""}>ACT/ACT</option><option ${row.dayCount === "ACT/360" ? "selected" : ""}>ACT/360</option><option ${row.dayCount === "ACT/365" ? "selected" : ""}>ACT/365</option><option ${row.dayCount === "30/360" ? "selected" : ""}>30/360</option></select></td>
      <td class="num">${displayMoney(accrued, 0)}</td>
      <td class="num">${displayMoney(value, 0)}</td>
      <td class="num ${signedClass(pnl)}">${displayMoney(pnl, 0)}</td>
      <td class="actions"><span class="action-stack"><button class="mini trade-mini" type="button" title="Sell bond" aria-label="Sell bond" onclick="openBondSellModal(${index})">S</button><button class="mini trade-mini" type="button" title="Early redemption" aria-label="Early redemption" onclick="openBondSellModal(${index}, 'Early Redemption')">Early</button></span></td>
    </tr>`;
  }).join("") : `<tr><td colspan="18"><div class="empty">No bond line.</div></td></tr>`;
}

function renderArgentinaBonds() {
  const rows = state.argentinaBonds || [];
  const alerts = [];
  els.argentinaBondsBody.innerHTML = rows.length ? rows.map((row, index) => {
    const payment = argentinaNextPayment(row);
    const principalPaid = Math.max(0, numberValue(row.originalNominal) - numberValue(row.currentNominal));
    const accrued = argentinaBondAccruedEur(row);
    const dirty = argentinaBondDirtyValueEur(row);
    const status = argentinaPaymentStatus(payment);
    if (payment && payment.daysUntil >= 0 && payment.daysUntil <= 2) alerts.push(`${row.isin}: ${status}, expected ${displayMoney(payment.total * fx(row.currency), 0)}`);
  if (payment && payment.daysUntil < 0) alerts.push(`${row.isin}: payment due, confirmation required.`);
    return `<tr>
      <td><strong>${escapeHtml(row.isin)}</strong></td>
      <td>${renderInput(row.name, `updateField('argentinaBonds', ${index}, 'name', this.value)`)}</td>
      <td>${renderInput(row.bank, `updateField('argentinaBonds', ${index}, 'bank', this.value)`)}</td>
      <td class="num">${renderInput(row.originalNominal, `updateField('argentinaBonds', ${index}, 'originalNominal', this.value)`, 'type="number" step="0.01"')}</td>
      <td class="num">${renderInput(row.currentNominal, `updateField('argentinaBonds', ${index}, 'currentNominal', this.value)`, 'type="number" step="0.01"')}</td>
      <td class="num">${renderInput(row.cleanPrice, `updateField('argentinaBonds', ${index}, 'cleanPrice', this.value)`, 'type="number" step="0.0001"')}</td>
      <td>${renderInput(row.priceDate, `updateField('argentinaBonds', ${index}, 'priceDate', this.value)`, 'type="date"')}</td>
      <td class="num">${renderInput(row.couponRate, `updateField('argentinaBonds', ${index}, 'couponRate', this.value)`, 'type="number" step="0.0001"')}</td>
      <td>${payment ? escapeHtml(payment.date) : "-"}</td>
      <td class="num">${payment ? money(payment.principal, row.currency, 0) : "-"}</td>
      <td class="num">${payment ? money(payment.coupon, row.currency, 0) : "-"}</td>
      <td class="num total-highlight">${payment ? money(payment.total, row.currency, 0) : "-"}</td>
      <td class="num">${displayMoney(dirty, 0)}</td>
      <td>${escapeHtml(status)}<br><small class="muted">Paid principal ${money(principalPaid, row.currency, 0)} | accrued ${displayMoney(accrued, 0)}</small></td>
      <td class="actions"><span class="action-stack"><button class="mini trade-mini" type="button" title="Sell Argentina bond" aria-label="Sell Argentina bond" onclick="openBondSellModal(${index}, 'Bond Sell', 'argentinaBonds')">S</button></span></td>
    </tr>`;
  }).join("") : `<tr><td colspan="15"><div class="empty">No Argentina amortizing bond.</div></td></tr>`;
  els.argentinaBondNotice.textContent = alerts.length ? alerts.join(" | ") : "Next Argentina payments are monitored at dashboard open and require confirmation.";
  els.argentinaBondNotice.className = alerts.length ? "muted negative" : "muted";
}

function addMonthsToDate(value, months) {
  const date = dateValue(value);
  if (!date) return value;
  date.setMonth(date.getMonth() + Math.max(1, Number(months) || 1));
  return dateIso(date);
}

function nextDueBondPayment() {
  const today = todayIso();
  const regularIndex = state.bonds.findIndex(row => row.nextCoupon && row.nextCoupon <= today && numberValue(row.nominal) > 0 && numberValue(row.couponRate) > 0);
  if (regularIndex >= 0) {
    const row = state.bonds[regularIndex];
    const coupon = numberValue(row.nominal) * numberValue(row.couponRate) / 100 / Math.max(1, numberValue(row.frequency));
    return { kind: "regular", row, index: regularIndex, date: row.nextCoupon, principal: 0, coupon, total: coupon, currency: row.currency || "USD", symbol: row.name || row.issuer || "Bond" };
  }
  for (let index = 0; index < (state.argentinaBonds || []).length; index += 1) {
    const row = state.argentinaBonds[index];
    const payment = argentinaNextPayment(row);
    if (payment && payment.date <= today && numberValue(row.currentNominal) > 0) {
      return { kind: "argentina", row, index, date: payment.date, principal: payment.principal, coupon: payment.coupon, total: payment.total, currency: row.currency || "EUR", symbol: row.isin || row.name || "Argentina bond", paymentId: payment.id };
    }
  }
  return null;
}

function checkBondPaymentAlert() {
  if (document.querySelector(".kpi-modal.open")) return false;
  const payment = nextDueBondPayment();
  if (!payment) return false;
  pendingBondPayment = payment;
  const isArgentina = payment.kind === "argentina";
  els.bondCouponModalSummary.innerHTML = [
    ["Bond", payment.symbol],
    ["Payment date", payment.date],
    ["Coupon", money(payment.coupon, payment.currency, 2)],
    ...(isArgentina ? [["Capital repayment", money(payment.principal, payment.currency, 2)]] : []),
    ["Total to credit", money(payment.total, payment.currency, 2)],
    ["Bank / custodian", payment.row.bank || "Unallocated"]
  ].map(([label, value]) => `<div class="kpi-summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  els.bondCouponModalSubtitle.textContent = isArgentina ? "An Argentina bond payment is due." : "A regular coupon payment is due.";
  els.confirmBondCouponBtn.textContent = isArgentina ? "Confirm payment" : "Confirm coupon";
  els.bondCouponAmountInput.value = payment.total;
  els.bondCouponAmountInput.readOnly = true;
  els.bondCouponAmountField.classList.add("hidden");
  els.editBondCouponAmountBtn.textContent = "Edit amount";
  openAccessibleModal(els.bondCouponModal, els.confirmBondCouponBtn);
  return true;
}

function toggleBondCouponAmountEdit() {
  const editing = els.bondCouponAmountField.classList.toggle("hidden");
  els.bondCouponAmountInput.readOnly = editing;
  els.editBondCouponAmountBtn.textContent = editing ? "Edit amount" : "Use edited amount";
  if (!editing) {
    els.bondCouponAmountInput.focus();
    els.bondCouponAmountInput.select();
  }
}

function closeBondCouponModal() {
  closeAccessibleModal(els.bondCouponModal);
  pendingBondPayment = null;
  renderActionCenter();
}

function confirmBondCoupon() {
  const payment = pendingBondPayment || nextDueBondPayment();
  if (!payment) return closeBondCouponModal();
  const currency = payment.currency;
  const creditedAmount = Math.max(0, numberValue(els.bondCouponAmountInput.value));
  if (!creditedAmount) {
    setStatus("Bond payment not recorded: amount must be positive.", "warning");
    return;
  }
  const account = ensureCashAccount(payment.row.bank, currency);
  account.amount = numberValue(account.amount) + creditedAmount;
  state.transactions = Array.isArray(state.transactions) ? state.transactions : [];
  if (payment.kind === "argentina") {
    payment.row.currentNominal = Math.max(0, numberValue(payment.row.currentNominal) - payment.principal);
    payment.row.processedPayments = Array.isArray(payment.row.processedPayments) ? payment.row.processedPayments : [];
    if (!payment.row.processedPayments.includes(payment.paymentId)) payment.row.processedPayments.push(payment.paymentId);
    state.transactions.unshift({
      id: `txn-${Date.now()}`,
      date: payment.date,
      type: "Bond Payment",
      symbol: payment.symbol,
      name: payment.row.name || "",
      bank: payment.row.bank || "Unallocated",
      qty: payment.principal,
      price: 100,
      costPrice: 100,
      currency,
      fees: 0,
      cashImpact: creditedAmount,
      couponAmount: payment.coupon,
      principalAmount: payment.principal,
      realizedPnlEur: 0,
      buyDate: "",
      note: `Principal ${money(payment.principal, currency, 2)} + coupon ${money(payment.coupon, currency, 2)} | credited ${money(creditedAmount, currency, 2)}`
    });
  } else {
    payment.row.lastCoupon = payment.date;
    payment.row.nextCoupon = addMonthsToDate(payment.date, 12 / Math.max(1, numberValue(payment.row.frequency)));
    state.transactions.unshift({
      id: `txn-${Date.now()}`,
      date: payment.date,
      type: "Bond Payment",
      symbol: payment.symbol,
      name: payment.row.name || "",
      bank: payment.row.bank || "Unallocated",
      qty: 0,
      price: 100,
      costPrice: 100,
      currency,
      fees: 0,
      cashImpact: creditedAmount,
      couponAmount: creditedAmount,
      principalAmount: 0,
      realizedPnlEur: 0,
      buyDate: "",
      note: `Coupon expected ${money(payment.coupon, currency, 2)} | credited ${money(creditedAmount, currency, 2)}`
    });
  }
  state.transactions.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  saveState();
  closeBondCouponModal();
  render();
  setStatus(`Bond payment confirmed: ${money(creditedAmount, currency, 2)} credited to ${account.bank}.`);
}

function bondAnalyticsRows() {
  const regularRows = state.bonds.map(row => {
    const clean = bondCleanValueEur(row);
    const accrued = bondAccruedEur(row);
    const dirty = bondValueEur(row);
    const pnl = bondPnlEur(row);
    const annualCoupon = bondAnnualCouponEur(row);
    return { ...row, clean, accrued, dirty, pnl, annualCoupon, currentYield: bondCurrentYield(row), years: yearsToMaturity(row) };
  });
  const argentinaRows = (state.argentinaBonds || []).map(row => {
    const clean = argentinaBondCleanValueCurrency(row) * fx(row.currency);
    const accrued = argentinaBondAccruedEur(row);
    const dirty = argentinaBondDirtyValueEur(row);
    const annualCoupon = numberValue(row.currentNominal) * numberValue(row.couponRate) / 100 * fx(row.currency);
    return {
      ...row,
      name: `${row.isin || ""} ${row.name || "Argentina amortizing"}`.trim(),
      clean,
      accrued,
      dirty,
      pnl: undefined,
      annualCoupon,
      currentYield: dirty ? annualCoupon / dirty * 100 : 0,
      years: yearsToMaturity(row)
    };
  });
  return [...regularRows, ...argentinaRows].sort((a, b) => b.dirty - a.dirty);
}

function renderBondAnalytics() {
  const rows = bondAnalyticsRows();
  els.bondAnalyticsBody.innerHTML = rows.length ? rows.map(row => `<tr>
    <td><strong>${escapeHtml(row.name || row.issuer || "Bond")}</strong></td>
    <td>${escapeHtml(row.bank || "Unallocated")}</td>
    <td>${escapeHtml(row.currency || "EUR")}</td>
    <td class="num">${displayMoney(row.clean, 0)}</td>
    <td class="num">${displayMoney(row.accrued, 0)}</td>
    <td class="num total-highlight">${displayMoney(row.dirty, 0)}</td>
    <td class="num ${row.pnl === undefined ? "" : signedClass(row.pnl)}">${row.pnl === undefined ? "-" : displayMoney(row.pnl, 0)}</td>
    <td class="num">${displayMoney(row.annualCoupon, 0)}</td>
    <td class="num">${pct(row.currentYield)}</td>
    <td class="num">${row.years ? row.years.toFixed(1) : "-"}</td>
  </tr>`).join("") : `<tr><td colspan="10"><div class="empty">No bond analytics.</div></td></tr>`;
  drawBondCompositionChart(rows);
}

function drawBondCompositionChart(rows = bondAnalyticsRows()) {
  const setup = canvasSetup(els.bondCompositionChart, 300);
  if (!setup) return;
  const { ctx, width, height, text, ink, line, accent, good } = setup;
  const displayRows = rows.filter(row => row.dirty > 0).slice(0, 8);
  els.bondChartNote.textContent = displayRows.length
    ? `Showing ${displayRows.length} bond line(s). Light segment is accrued coupon.`
    : "No bond exposure to display.";
  ctx.font = "12px Aptos, Segoe UI, sans-serif";
  ctx.fillStyle = text;
  if (!displayRows.length) {
    ctx.textAlign = "center";
    ctx.fillText("No bond exposure to display.", width / 2, height / 2);
    return;
  }
  const compact = width < 620;
  const pad = compact ? { top: 22, right: 84, bottom: 24, left: 120 } : { top: 26, right: 150, bottom: 28, left: 190 };
  const max = Math.max(...displayRows.map(row => row.dirty), 1);
  const gap = 12;
  const barHeight = Math.max(18, (height - pad.top - pad.bottom - gap * (displayRows.length - 1)) / displayRows.length);
  ctx.strokeStyle = line;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top - 4);
  ctx.lineTo(pad.left, height - pad.bottom + 4);
  ctx.stroke();
  displayRows.forEach((row, index) => {
    const y = pad.top + index * (barHeight + gap);
    const cleanWidth = row.clean / max * (width - pad.left - pad.right);
    const accruedWidth = Math.max(0, row.accrued) / max * (width - pad.left - pad.right);
    ctx.fillStyle = accent;
    ctx.fillRect(pad.left, y, Math.max(2, cleanWidth), barHeight);
    if (accruedWidth > 0) {
      ctx.fillStyle = good;
      ctx.fillRect(pad.left + cleanWidth, y, Math.max(2, accruedWidth), barHeight);
    }
    ctx.fillStyle = ink;
    ctx.textAlign = "right";
    const label = row.name || row.issuer || "Bond";
    ctx.fillText(label.length > 24 ? `${label.slice(0, 23)}...` : label, pad.left - 12, y + barHeight / 2 + 4);
    ctx.textAlign = "left";
    const valueLabel = compact ? displayMoney(row.dirty, 0) : `${displayMoney(row.dirty, 0)} | accrued ${displayMoney(row.accrued, 0)}`;
    ctx.fillText(valueLabel, Math.min(width - pad.right + 8, pad.left + cleanWidth + accruedWidth + 10), y + barHeight / 2 + 4);
  });
}

function renderCash() {
  const summary = cashSummary();
  const eurAmount = summary.byCurrency.get("EUR") || 0;
  const usdAmount = summary.byCurrency.get("USD") || 0;
  els.cashPageTotal.textContent = displayMoney(summary.totalEur, 2);
  els.cashPageEur.textContent = money(eurAmount, "EUR", 2);
  els.cashPageEurContext.textContent = `${summary.positiveAccounts} positive account(s)${summary.negativeAccounts ? ` | ${summary.negativeAccounts} negative` : ""}`;
  els.cashPageUsd.textContent = money(usdAmount, "USD", 2);
  els.cashPageUsdContext.textContent = `${displayCurrencyLabel()} equivalent: ${displayMoney(usdAmount * fx("USD"), 2)}`;
  els.cashPageTopBank.textContent = summary.topBank ? summary.topBank.bank : "-";
  els.cashPageTopBankContext.textContent = summary.topBank ? displayMoney(summary.topBank.value, 2) : "No cash account";
  const cashBankRows = summary.banks.map(row => ({ bank: row.bank, total: row.value }));
  drawBankChart(cashBankRows, Math.max(0, summary.totalEur), els.cashBankChart, "No cash by bank to display.");
  const rows = sortRows(state.cash.map((row, index) => ({ ...row, __index: index })), "cashBody");
  els.cashBody.innerHTML = rows.length ? rows.map(row => {
    const index = row.__index;
    return `<tr>
    <td>${renderInput(row.name, `updateField('cash', ${index}, 'name', this.value)`)}</td>
    <td>${renderInput(row.bank, `updateField('cash', ${index}, 'bank', this.value)`)}</td>
    <td>${currencySelect("cash", index, row.currency)}</td>
    <td class="num">${renderInput(row.amount, `updateField('cash', ${index}, 'amount', this.value)`, 'type="number" step="0.01"')}</td>
    <td class="num">${displayMoney(cashValueEur(row), 2)}</td>
    <td class="actions"><button class="mini danger" type="button" onclick="removeRow('cash', ${index})">Del.</button></td>
  </tr>`;
  }).join("") : `<tr><td colspan="6"><div class="empty">No cash line.</div></td></tr>`;
}

function renderPrivateAssets() {
  const totalValue = state.privateAssets.reduce((sum, row) => sum + privateValueEur(row), 0);
  const totalCommitment = state.privateAssets.reduce((sum, row) => sum + numberValue(row.commitmentEur), 0);
  const totalCalled = state.privateAssets.reduce((sum, row) => sum + numberValue(row.calledEur), 0);
  const unfunded = Math.max(0, totalCommitment - totalCalled);
  const largest = [...state.privateAssets].sort((a, b) => privateValueEur(b) - privateValueEur(a))[0];
  els.privatePageValue.textContent = displayMoney(totalValue, 2);
  els.privatePageCommitment.textContent = displayMoney(totalCommitment, 2);
  els.privatePageCommitmentContext.textContent = `${state.privateAssets.length} deal(s) | unfunded ${displayMoney(unfunded, 2)}`;
  els.privatePageCalled.textContent = displayMoney(totalCalled, 2);
  els.privatePageCalledContext.textContent = totalCommitment ? `${pct(totalCalled / totalCommitment * 100)} called` : "No commitment";
  els.privatePageLargest.textContent = largest ? (largest.name || "Unnamed deal") : "-";
  els.privatePageLargestContext.textContent = largest ? displayMoney(privateValueEur(largest), 2) : "No private asset";
  const rows = sortRows(state.privateAssets.map((row, index) => ({ ...row, __index: index })), "privateBody");
  els.privateBody.innerHTML = rows.length ? rows.map(row => {
    const index = row.__index;
    return `<tr>
    <td>${renderInput(row.name, `updateField('privateAssets', ${index}, 'name', this.value)`)}</td>
    <td>${renderInput(row.bank, `updateField('privateAssets', ${index}, 'bank', this.value)`)}</td>
    <td class="num">${renderInput(row.valueEur, `updateField('privateAssets', ${index}, 'valueEur', this.value)`, 'type="number" step="1"')}</td>
    <td class="num">${renderInput(row.commitmentEur, `updateField('privateAssets', ${index}, 'commitmentEur', this.value)`, 'type="number" step="1"')}</td>
    <td class="num">${renderInput(row.calledEur, `updateField('privateAssets', ${index}, 'calledEur', this.value)`, 'type="number" step="1"')}</td>
    <td>${renderInput(row.valuationDate, `updateField('privateAssets', ${index}, 'valuationDate', this.value)`, 'type="date"')}</td>
    <td>${renderInput(row.note, `updateField('privateAssets', ${index}, 'note', this.value)`)}</td>
    <td class="actions"><button class="mini danger" type="button" onclick="removeRow('privateAssets', ${index})">Del.</button></td>
  </tr>`;
  }).join("") : `<tr><td colspan="8"><div class="empty">No private equity asset.</div></td></tr>`;
}

function renderRealEstate() {
  const totalGross = state.realEstate.reduce((sum, row) => sum + realEstateGrossEur(row), 0);
  const totalDebt = state.realEstate.reduce((sum, row) => sum + realEstateDebtEur(row), 0);
  const totalNet = state.realEstate.reduce((sum, row) => sum + realEstateNetEur(row), 0);
  const monthlyNetRent = state.realEstate.reduce((sum, row) => sum + realEstateMonthlyNetRentEur(row), 0);
  const monthlyPayments = state.realEstate.reduce((sum, row) => sum + realEstateMonthlyPaymentEur(row), 0);
  const monthlyCashflow = state.realEstate.reduce((sum, row) => sum + realEstateMonthlyCashflowEur(row), 0);
  const netYield = totalGross ? monthlyCashflow * 12 / totalGross * 100 : 0;
  const ltv = totalGross ? totalDebt / totalGross * 100 : 0;
  els.realEstatePageNet.textContent = displayMoney(totalNet, 2);
  els.realEstatePageDebt.textContent = displayMoney(totalDebt, 2);
  els.realEstatePageDebtContext.textContent = `${pct(ltv)} LTV | ${displayMoney(monthlyPayments, 2)} monthly payments`;
  els.realEstatePageRent.textContent = displayMoney(monthlyCashflow, 2);
  els.realEstatePageRent.className = signedClass(monthlyCashflow);
  els.realEstatePageRentContext.textContent = `${displayMoney(monthlyNetRent, 2)} net rent before debt`;
  els.realEstatePageYield.textContent = pct(netYield);
  els.realEstatePageYieldContext.textContent = `${displayMoney(monthlyCashflow * 12, 2)} annualized after debt`;
  const rows = sortRows(state.realEstate.map((row, index) => ({ ...row, __index: index })), "realEstateBody");
  els.realEstateBody.innerHTML = rows.length ? rows.map(row => {
    const index = row.__index;
    const netValue = realEstateNetEur(row);
    const netRent = realEstateMonthlyNetRentEur(row);
    const monthlyPayment = realEstateMonthlyPaymentEur(row);
    const debtLeft = realEstateDebtEur(row);
    const cashflow = realEstateMonthlyCashflowEur(row);
    const yieldNet = realEstateGrossEur(row) ? cashflow * 12 / realEstateGrossEur(row) * 100 : 0;
    return `<tr>
    <td>${renderInput(row.name, `updateField('realEstate', ${index}, 'name', this.value)`)}</td>
    <td>${renderInput(row.city, `updateField('realEstate', ${index}, 'city', this.value)`)}</td>
    <td>${renderInput(row.bank, `updateField('realEstate', ${index}, 'bank', this.value)`)}</td>
    <td>${currencySelect("realEstate", index, row.currency)}</td>
    <td class="num">${renderInput(row.grossValue, `updateField('realEstate', ${index}, 'grossValue', this.value)`, 'type="number" step="1"')}</td>
    <td class="num">${renderInput(row.originalLoan ?? row.debt, `updateField('realEstate', ${index}, 'originalLoan', this.value)`, 'type="number" step="1"')}</td>
    <td class="num">${renderInput(row.annualRate, `updateField('realEstate', ${index}, 'annualRate', this.value)`, 'type="number" step="0.0001"')}</td>
    <td class="num">${renderInput(row.termYears, `updateField('realEstate', ${index}, 'termYears', this.value)`, 'type="number" step="0.1"')}</td>
    <td>${renderInput(row.loanStartDate, `updateField('realEstate', ${index}, 'loanStartDate', this.value)`, 'type="date"')}</td>
    <td class="num">${displayMoney(monthlyPayment, 2)}</td>
    <td class="num">${displayMoney(debtLeft, 2)}</td>
    <td class="num">${displayMoney(netValue, 2)}</td>
    <td class="num">${renderInput(row.monthlyRent, `updateField('realEstate', ${index}, 'monthlyRent', this.value)`, 'type="number" step="1"')}</td>
    <td class="num">${renderInput(row.monthlyCosts, `updateField('realEstate', ${index}, 'monthlyCosts', this.value)`, 'type="number" step="1"')}</td>
    <td class="num ${signedClass(cashflow)}">${displayMoney(cashflow, 2)}</td>
    <td class="num">${pct(yieldNet)}</td>
    <td>${renderInput(row.valuationDate, `updateField('realEstate', ${index}, 'valuationDate', this.value)`, 'type="date"')}</td>
    <td>${renderInput(row.note, `updateField('realEstate', ${index}, 'note', this.value)`)}</td>
    <td class="actions"><button class="mini danger" type="button" onclick="removeRow('realEstate', ${index})">Del.</button></td>
  </tr>`;
  }).join("") : `<tr><td colspan="19"><div class="empty">No property.</div></td></tr>`;
}

function renderDivers() {
  const rowsRaw = state.divers.map(row => ({ ...row, valueEur: diversValueEur(row) }));
  const totalValue = rowsRaw.reduce((sum, row) => sum + row.valueEur, 0);
  const largest = [...rowsRaw].sort((a, b) => b.valueEur - a.valueEur)[0];
  const categories = new Set(rowsRaw.map(row => row.category || "Other"));
  const usdNative = rowsRaw.filter(row => row.currency === "USD").reduce((sum, row) => sum + numberValue(row.qty) * numberValue(row.unitPrice), 0);
  const usdValue = usdNative * fx("USD");
  els.diversPageValue.textContent = displayMoney(totalValue, 2);
  els.diversPageLargest.textContent = largest ? (largest.name || largest.category || "Unnamed asset") : "-";
  els.diversPageLargestContext.textContent = largest ? `${largest.category || "Other"} | ${displayMoney(largest.valueEur, 2)}` : "No other asset";
  els.diversPageCategories.textContent = String(categories.size);
  els.diversPageCategoriesContext.textContent = `${state.divers.length} investment(s)`;
  els.diversPageUsd.textContent = displayMoney(usdValue, 2);
  els.diversPageUsdContext.textContent = `${pct(totalValue ? usdValue / totalValue * 100 : 0)} of Other`;
  const rows = sortRows(state.divers.map((row, index) => ({ ...row, __index: index })), "diversBody").sort((a, b) => {
    const priority = row => /DEWS|PENSION/i.test(`${row.name || ""} ${row.category || ""}`) ? 0 : 1;
    return priority(a) - priority(b);
  });
  els.diversBody.innerHTML = rows.length ? rows.map(row => {
    const index = row.__index;
    const isDews = String(row.name || "").trim().toUpperCase().includes("DEWS");
    const dewsTooltip = isDews ? ` class="quick-tooltip" data-tooltip="DEWS automatic credit: 1,216.24 USD added on the 5th of each month."` : "";
    return `<tr${dewsTooltip}>
    <td><select onchange="updateField('divers', ${index}, 'category', this.value)"><option value="Montre" ${row.category === "Montre" || row.category === "Watch" ? "selected" : ""}>Watch</option><option value="Bitcoin" ${row.category === "Bitcoin" ? "selected" : ""}>Bitcoin</option><option value="Assurance vie" ${row.category === "Assurance vie" || row.category === "Life insurance" ? "selected" : ""}>Life insurance</option><option value="Autre" ${row.category === "Autre" || row.category === "Other" ? "selected" : ""}>Other</option></select></td>
    <td>${renderInput(row.name, `updateField('divers', ${index}, 'name', this.value)`)}</td>
    <td>${renderInput(row.bank, `updateField('divers', ${index}, 'bank', this.value)`)}</td>
    <td>${currencySelect("divers", index, row.currency)}</td>
    <td class="num">${renderInput(row.qty, `updateField('divers', ${index}, 'qty', this.value)`, 'type="number" step="0.00000001"')}</td>
    <td class="num">${renderInput(row.unitPrice, `updateField('divers', ${index}, 'unitPrice', this.value)`, 'type="number" step="0.01"')}</td>
    <td class="num">${displayMoney(diversValueEur(row), 2)}</td>
    <td>${renderInput(row.note, `updateField('divers', ${index}, 'note', this.value)`)}</td>
    <td class="actions"><button class="mini danger" type="button" onclick="removeRow('divers', ${index})">Del.</button></td>
  </tr>`;
  }).join("") : `<tr><td colspan="9"><div class="empty">No other investment.</div></td></tr>`;
}

function currentDewsCreditContext() {
  const dubai = dubaiDateTimeParts();
  const currentMonth = dubai.date.slice(0, 7);
  const row = state.divers.find(item => String(item.name || "").trim().toUpperCase().includes("DEWS"));
  if (!row || Number(dubai.date.slice(-2)) < 5 || state.lastDewsCreditMonth === currentMonth) return null;
  const currency = row.currency || "USD";
  const amountUsd = 1216.24;
  const amountNative = currency === "EUR" ? amountUsd * fx("USD") : amountUsd;
  return { currentMonth, creditDate: `${currentMonth}-05`, row, currency, amountUsd, amountNative };
}

function checkDewsMonthlyCredit() {
  const context = currentDewsCreditContext();
  if (!context || document.querySelector(".kpi-modal.open")) return false;
  const { currentMonth, creditDate, row, currency, amountUsd, amountNative } = context;
  els.dewsCreditModalSummary.innerHTML = [
    ["Due date", creditDate],
    ["Asset", row.name || "DIFC DEWS Pension"],
    ["Contribution", money(amountUsd, "USD", 2)],
    ["Dashboard value", money(amountNative, currency, 2)]
  ].map(([label, value]) => `<div class="kpi-summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  openAccessibleModal(els.dewsCreditModal, els.confirmDewsCreditBtn);
  return true;
}

function closeDewsCreditModal() {
  closeAccessibleModal(els.dewsCreditModal);
  renderActionCenter();
}

function confirmDewsCredit() {
  const context = currentDewsCreditContext();
  if (!context) {
    closeDewsCreditModal();
    return;
  }
  const { currentMonth, creditDate, row, currency, amountUsd, amountNative } = context;
  const unitPrice = Math.max(0.00000001, numberValue(row.unitPrice) || 1);
  row.qty = numberValue(row.qty) + amountNative / unitPrice;
  state.transactions = Array.isArray(state.transactions) ? state.transactions : [];
  state.transactions.unshift({
    id: `txn-${Date.now()}`,
    date: creditDate,
    type: "DEWS Contribution",
    symbol: "DEWS",
    name: row.name || "DIFC DEWS Pension",
    bank: row.bank || "DEWS",
    qty: 1,
    price: amountNative,
    costPrice: amountNative,
    currency,
    fees: 0,
    cashImpact: 0,
    realizedPnlEur: 0,
    buyDate: creditDate,
    note: `Monthly employer contribution: ${money(amountUsd, "USD", 2)}`
  });
  state.lastDewsCreditMonth = currentMonth;
  saveState();
  closeDewsCreditModal();
  render();
  setStatus(`DEWS credit confirmed: ${money(amountUsd, "USD", 2)} added for ${currentMonth}.`);
}

function localDateIso(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dubaiDateTimeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute)
  };
}

function updateDubaiClock() {
  if (!els.dubaiClock) return;
  const label = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(new Date()).replace(",", "");
  els.dubaiClock.textContent = `Dubai ${label}`;
}

function isoWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function upsertSnapshot(date = new Date(), source = "manual", dateKey = localDateIso(date)) {
  syncSettings();
  const t = computeTotals();
  const fxRisk = computeFxRisk();
  const today = dateKey;
  const snapshot = {
    date: today,
    savedAt: new Date().toLocaleString("en-US"),
    source,
    total: t.total,
    stocksValue: t.stocksValue,
    bondsValue: t.bondsValue,
    structuredValue: t.structuredValue,
    cashValue: t.cashValue,
    privateValue: t.privateValue,
    realEstateValue: t.realEstateValue,
    diversValue: t.diversValue,
    stocksDayPnl: t.stocksDayPnl,
    eurUsd: state.eurUsd,
    fxUsdNative: fxRisk.usdNative,
    fxUsdValue: fxRisk.usdValue,
    fxEurValue: fxRisk.eurValue,
    details: snapshotDetails()
  };
  const existing = state.history.findIndex(row => row.date === today);
  if (existing >= 0) {
    state.history[existing] = snapshot;
  } else {
    state.history.push(snapshot);
  }
  state.history.sort((a, b) => a.date.localeCompare(b.date));
  saveState();
  return { date: today, updated: existing >= 0 };
}

function maybeCreateDailyAutoSnapshot(showStatus = false) {
  const dubai = dubaiDateTimeParts();
  if (dubai.hour < 23) return false;
  if (state.lastDailyAutoSnapshotDate === dubai.date) return false;
  const result = upsertSnapshot(new Date(), "daily-auto", dubai.date);
  state.lastDailyAutoSnapshotDate = dubai.date;
  saveState();
  renderHistory();
  renderTotals();
  renderDataStatus();
  if (showStatus) setStatus(`Daily auto snapshot ${result.updated ? "updated" : "created"} for ${result.date} at 23:00 Dubai time.`);
  return true;
}

function scheduleDailyAutoSnapshot() {
  if (dailySnapshotTimer) window.clearInterval(dailySnapshotTimer);
  maybeCreateDailyAutoSnapshot(false);
  dailySnapshotTimer = window.setInterval(() => maybeCreateDailyAutoSnapshot(true), 60 * 1000);
}

function snapshotToday() {
  const result = upsertSnapshot(new Date(), "manual");
  setStatus(`Snapshot dated ${result.date} ${result.updated ? "updated" : "added"}.`);
  render();
}

function removeSnapshot(index) {
  state.history.splice(index, 1);
  saveState();
  render();
  setStatus("Snapshot deleted.", "warning");
}

function renderHistory() {
  const rows = state.history || [];
  const displayRows = sortRows(rows.map((row, index) => ({ ...row, originalIndex: index, change: index > 0 ? numberValue(row.total) - numberValue(rows[index - 1]?.total) : 0 })), "historyBody");
  const last = rows.at(-1);
  const previous = rows.at(-2);
  const change = last && previous ? last.total - previous.total : 0;
  const changePct = previous && previous.total ? change / previous.total * 100 : 0;
  els.historyLastTotal.textContent = last ? displayMoney(last.total, 0) : "-";
  els.historyLastDate.textContent = last ? `Snapshot dated ${last.date}` : "No snapshot";
  els.historyLastChange.textContent = last && previous ? displayMoney(change, 2) : "-";
  els.historyLastChange.className = last && previous ? signedClass(change) : "";
  els.historyLastChangePct.textContent = last && previous ? pct(changePct) : "Add at least two snapshots";
  els.historyCount.textContent = String(rows.length);
  els.historyBody.innerHTML = displayRows.length ? displayRows.map(row => {
    const diff = row.change;
    return `<tr>
      <td>${escapeHtml(row.date)}</td>
      <td class="num">${displayMoney(row.total, 2)}</td>
      <td class="num ${row.originalIndex > 0 ? signedClass(diff) : ""}">${row.originalIndex > 0 ? displayMoney(diff, 2) : "-"}</td>
      <td class="num">${displayMoney(row.stocksValue, 2)}</td>
      <td class="num">${displayMoney(row.bondsValue, 2)}</td>
      <td class="num">${displayMoney(row.structuredValue, 2)}</td>
      <td class="num">${displayMoney(row.cashValue, 2)}</td>
      <td class="num">${displayMoney(row.privateValue, 2)}</td>
      <td class="num">${displayMoney(row.realEstateValue, 2)}</td>
      <td class="num">${displayMoney(row.diversValue, 2)}</td>
      <td class="actions"><button class="mini danger" type="button" onclick="removeSnapshot(${row.originalIndex})">Del.</button></td>
    </tr>`;
  }).join("") : `<tr><td colspan="11"><div class="empty">No snapshot. Click Snapshot today to start tracking history.</div></td></tr>`;
  drawHistoryChart(rows);
}

function drawHistoryChart(rows) {
  const canvas = els.historyChart;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(320, Math.floor(rect.width || canvas.clientWidth || 900));
  const height = 320;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const styles = getComputedStyle(document.documentElement);
  const text = styles.getPropertyValue("--muted").trim() || "#6d716d";
  const line = styles.getPropertyValue("--line").trim() || "#ded8cc";
  const accent = styles.getPropertyValue("--accent").trim() || "#9c7a2f";
  const good = styles.getPropertyValue("--accent-2").trim() || "#2f766d";
  const pad = { top: 24, right: 22, bottom: 38, left: 72 };
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  ctx.font = "12px Aptos, Segoe UI, sans-serif";
  ctx.fillStyle = text;
  if (rows.length < 2) {
    ctx.textAlign = "center";
    ctx.fillText("Add at least two snapshots to display a chart.", width / 2, height / 2);
    return;
  }
  const values = rows.map(row => row.total);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(1, max - min);
  const yMin = min - spread * 0.08;
  const yMax = max + spread * 0.08;
  const x = index => pad.left + (width - pad.left - pad.right) * index / Math.max(1, rows.length - 1);
  const y = value => pad.top + (height - pad.top - pad.bottom) * (1 - (value - yMin) / (yMax - yMin));
  for (let i = 0; i <= 4; i += 1) {
    const yy = pad.top + (height - pad.top - pad.bottom) * i / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, yy);
    ctx.lineTo(width - pad.right, yy);
    ctx.stroke();
    const value = yMax - (yMax - yMin) * i / 4;
    ctx.textAlign = "right";
    ctx.fillText(displayMoney(value, 0), pad.left - 10, yy + 4);
  }
  ctx.beginPath();
  rows.forEach((row, index) => {
    const xx = x(index);
    const yy = y(row.total);
    if (index === 0) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
  });
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  rows.forEach((row, index) => {
    ctx.beginPath();
    ctx.arc(x(index), y(row.total), 4, 0, Math.PI * 2);
    ctx.fillStyle = index === rows.length - 1 ? good : accent;
    ctx.fill();
  });
  ctx.fillStyle = text;
  ctx.textAlign = "left";
  ctx.fillText(rows[0].date, pad.left, height - 14);
  ctx.textAlign = "right";
  ctx.fillText(rows.at(-1).date, width - pad.right, height - 14);
  if (historyChartHover) {
    const hoverX = Math.max(pad.left, Math.min(width - pad.right, historyChartHover.x));
    const nearest = rows.reduce((best, row, index) => {
      const distance = Math.abs(x(index) - hoverX);
      return !best || distance < best.distance ? { row, index, distance } : best;
    }, null);
    if (nearest) {
      const point = { x: x(nearest.index), y: y(nearest.row.total) };
      drawChartHover(ctx, point, [displayMoney(nearest.row.total, 2), nearest.row.date], { width, height, pad }, { text, ink: good, line, accent: good });
    }
  }
}

function renderBanks() {
  const total = computeTotals().total;
  const rows = sortRows(totalsByBank(), "banksBody");
  const cardMode = state.bankViewMode === "cards";
  els.bankTableWrap.classList.toggle("hidden", cardMode);
  els.bankCardGrid.classList.toggle("hidden", !cardMode);
  els.bankTableViewBtn.classList.toggle("active", !cardMode);
  els.bankCardViewBtn.classList.toggle("active", cardMode);
  els.bankTableViewBtn.setAttribute("aria-pressed", String(!cardMode));
  els.bankCardViewBtn.setAttribute("aria-pressed", String(cardMode));
  els.bankCardCurrencyToggle.classList.toggle("hidden", !cardMode);
  const cardCurrency = bankCardCurrency();
  els.bankCardCurrencyEur.classList.toggle("active", cardCurrency === "EUR");
  els.bankCardCurrencyUsd.classList.toggle("active", cardCurrency === "USD");
  els.bankCardCurrencyEur.setAttribute("aria-pressed", String(cardCurrency === "EUR"));
  els.bankCardCurrencyUsd.setAttribute("aria-pressed", String(cardCurrency === "USD"));
  drawBankChart(rows, total);
  els.banksBody.innerHTML = rows.length ? rows.map(row => {
    const isExpanded = expandedBanks.has(row.bank);
    const toggle = row.lines.length ? `<button class="expand-btn" type="button" data-bank="${escapeHtml(row.bank)}" aria-label="View ${escapeHtml(row.bank)} details">${isExpanded ? "-" : "+"}</button>` : "";
    const detailRows = isExpanded ? row.lines.map(line => `<tr class="detail-row">
      <td></td>
      <td><span class="detail-label">${escapeHtml(line.type)}</span></td>
      <td colspan="7">${escapeHtml(line.name)}</td>
      <td class="num ${line.pnl === undefined ? "" : signedClass(line.pnl)}">${line.pnl === undefined ? "-" : displayMoney(line.pnl, 2)}</td>
      <td class="num total-highlight">${displayMoney(line.value, 2)}</td>
      <td></td>
    </tr>`).join("") : "";
    return `<tr>
    <td class="expand-cell">${toggle}</td>
    <td>${escapeHtml(row.bank)}</td>
    <td class="num">${displayMoney(row.stocks, 2)}</td>
    <td class="num">${displayMoney(row.bonds, 2)}</td>
    <td class="num">${displayMoney(row.structured, 2)}</td>
    <td class="num">${displayMoney(row.cash, 2)}</td>
    <td class="num">${displayMoney(row.privateValue, 2)}</td>
    <td class="num">${displayMoney(row.realEstate, 2)}</td>
    <td class="num">${displayMoney(row.divers, 2)}</td>
    <td class="num ${signedClass(row.pnl)}">${displayMoney(row.pnl, 2)}</td>
    <td class="num total-highlight">${displayMoney(row.total, 2)}</td>
    <td class="num">${pct(total ? row.total / total * 100 : 0)}</td>
  </tr>${detailRows}`;
  }).join("") : `<tr><td colspan="12"><div class="empty">No bank.</div></td></tr>`;
  els.bankCardGrid.innerHTML = rows.length ? rows.map(row => {
    const isExpanded = expandedBanks.has(row.bank);
    const breakdown = [
      ["Stocks", row.stocks],
      ["Bonds", row.bonds],
      ["Structured products", row.structured],
      ["Cash", row.cash],
      ["Private equity", row.privateValue],
      ["Real estate", row.realEstate],
      ["Other", row.divers]
    ].filter(([, value]) => Math.abs(numberValue(value)) > 0);
    const details = isExpanded ? `<div class="bank-card-details">
      <div class="bank-card-details-title">Positions</div>
      ${row.lines.map(line => `<div class="bank-card-detail">
        <span>${escapeHtml(line.type)}</span>
        <span title="${escapeHtml(line.name)}">${escapeHtml(line.name)}</span>
        <strong>${bankCardMoney(line.value, 2)}</strong>
      </div>`).join("")}
    </div>` : "";
    return `<article class="bank-card" style="--bank-hue:${bankLogoHue(row.bank)}">
      <div class="bank-card-head">
        <div class="bank-card-brand">
          <span class="bank-card-logo logo-${bankLogoKey(row.bank) || "fallback"}" aria-hidden="true">${bankLogoMarkup(row.bank)}</span>
          <h3 title="${escapeHtml(row.bank)}">${escapeHtml(row.bank)}</h3>
        </div>
        <span class="bank-card-weight">${pct(total ? row.total / total * 100 : 0)}</span>
      </div>
      <div class="bank-card-total">
        <span>Total ${cardCurrency}</span>
        <strong>${bankCardMoney(row.total, 2)}</strong>
      </div>
      <div class="bank-card-breakdown">
        ${breakdown.length ? breakdown.map(([label, value]) => `<div class="bank-card-row"><span>${label}</span><strong>${bankCardMoney(value, 2)}</strong></div>`).join("") : `<div class="muted">No assets.</div>`}
      </div>
      <div class="bank-card-footer">
        <span class="${signedClass(row.pnl)}">P&amp;L ${bankCardMoney(row.pnl, 2)}</span>
        ${row.lines.length ? `<button class="mini" type="button" data-bank-card="${escapeHtml(row.bank)}" aria-expanded="${isExpanded}">${isExpanded ? "Hide positions" : `View ${row.lines.length} position${row.lines.length === 1 ? "" : "s"}`}</button>` : ""}
      </div>
      ${details}
    </article>`;
  }).join("") : `<div class="empty">No bank.</div>`;
}

function setBankView(mode) {
  state.bankViewMode = mode === "cards" ? "cards" : "table";
  saveState();
  renderBanks();
  configureSortableHeaders();
}

function setBankCardCurrency(currency) {
  state.bankCardCurrency = currency === "USD" ? "USD" : "EUR";
  saveState();
  renderBanks();
  configureSortableHeaders();
}

function toggleBank(bank) {
  if (expandedBanks.has(bank)) {
    expandedBanks.delete(bank);
  } else {
    expandedBanks.add(bank);
  }
  renderBanks();
}

function currencySelect(collection, index, value) {
  return `<select onchange="updateField('${collection}', ${index}, 'currency', this.value)"><option value="EUR" ${value === "EUR" ? "selected" : ""}>EUR</option><option value="USD" ${value === "USD" ? "selected" : ""}>USD</option><option value="AED" ${value === "AED" ? "selected" : ""}>AED</option></select>`;
}

function removeRow(collection, index) {
  state[collection].splice(index, 1);
  saveState();
  render();
}

function addStock() {
  state.stocks.push({ symbol: "", name: "", bank: "", portfolio: "", qty: 0, price: 0, previousClose: 0, cost: 0, currency: "USD" });
  saveState();
  render();
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function sellPreviewValues() {
  const row = state.stocks[pendingSellIndex];
  if (!row) return null;
  const qty = Math.max(0, numberValue(els.sellQty.value));
  const price = Math.max(0, numberValue(els.sellPrice.value));
  const fees = Math.max(0, numberValue(els.sellFees.value));
  const currency = row.currency || "USD";
  const cashImpact = qty * price - fees;
  const realizedPnlEur = (qty * (price - numberValue(row.cost)) - fees) * fx(currency);
  return { row, qty, price, fees, currency, cashImpact, realizedPnlEur };
}

function renderSellPreview() {
  const preview = sellPreviewValues();
  if (!preview) return;
  els.sellPreview.textContent = `Cash +${money(preview.cashImpact, preview.currency, 2)} | Realized PnL ${displayMoney(preview.realizedPnlEur, 2)}`;
  els.sellPreview.className = `muted ${signedClass(preview.realizedPnlEur)}`;
}

function openSellModal(index) {
  const row = state.stocks[index];
  if (!row) return;
  pendingSellIndex = index;
  const currency = row.currency || "USD";
  els.sellModalSummary.innerHTML = [
    ["Ticker", row.symbol || "-"],
    ["Available", numberValue(row.qty).toLocaleString("en-US", { maximumFractionDigits: 4 })],
    ["Cost basis", money(row.cost, currency, 2)]
  ].map(([label, value]) => `<div class="kpi-summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  els.sellDate.value = todayIso();
  els.sellQty.max = String(numberValue(row.qty));
  els.sellQty.value = numberValue(row.qty);
  els.sellPrice.value = numberValue(row.price);
  els.sellCurrency.value = currency;
  els.sellBank.value = row.bank || "Unallocated";
  els.sellFees.value = 0;
  els.sellBuyDate.value = "";
  els.sellNote.value = "";
  renderSellPreview();
  openAccessibleModal(els.sellModal, els.sellQty);
  window.requestAnimationFrame(() => els.sellQty.select());
}

function closeSellModal() {
  closeAccessibleModal(els.sellModal);
  pendingSellIndex = null;
}

function ensureCashAccount(bank, currency) {
  const normalizedBank = bank || "Unallocated";
  const normalizedCurrency = currency || "USD";
  let account = state.cash.find(row => (row.bank || "Unallocated") === normalizedBank && (row.currency || "EUR") === normalizedCurrency && String(row.name || "").toLowerCase().includes("cash"));
  if (!account) {
    account = { name: `Cash ${normalizedCurrency}`, bank: normalizedBank, currency: normalizedCurrency, amount: 0 };
    state.cash.push(account);
  }
  return account;
}

function confirmSell() {
  const preview = sellPreviewValues();
  if (!preview) return;
  const { row, qty, price, fees, currency, cashImpact, realizedPnlEur } = preview;
  const available = numberValue(row.qty);
  if (!qty || qty <= 0) {
    setStatus("Sale not recorded: quantity must be positive.", "warning");
    return;
  }
  if (qty > available) {
    setStatus(`Sale not recorded: max available quantity is ${available}.`, "warning");
    return;
  }
  if (!price || price <= 0) {
    setStatus("Sale not recorded: sale price must be positive.", "warning");
    return;
  }

  const account = ensureCashAccount(row.bank, currency);
  account.amount = numberValue(account.amount) + cashImpact;
  row.qty = Math.max(0, available - qty);
  state.transactions = Array.isArray(state.transactions) ? state.transactions : [];
  state.transactions.unshift({
    id: `txn-${Date.now()}`,
    date: els.sellDate.value || todayIso(),
    type: "Sell",
    symbol: (row.symbol || "").trim().toUpperCase(),
    name: row.name || "",
    bank: row.bank || "Unallocated",
    qty,
    price,
    costPrice: numberValue(row.cost),
    currency,
    fees,
    cashImpact,
    realizedPnlEur,
    buyDate: els.sellBuyDate.value || "",
    note: els.sellNote.value || ""
  });
  state.stocks = state.stocks.filter(stock => numberValue(stock.qty) > 0.00000001 || stock !== row);
  saveState();
  closeSellModal();
  render();
  setStatus(`Sale recorded: ${qty} ${(row.symbol || "stock").toUpperCase()} sold. Cash increased by ${money(cashImpact, currency, 2)} at ${account.bank}.`);
}

function buyPreviewValues() {
  const qty = Math.max(0, numberValue(els.buyQty.value));
  const price = Math.max(0, numberValue(els.buyPrice.value));
  const fees = Math.max(0, numberValue(els.buyFees.value));
  const currency = els.buyCurrency.value || "USD";
  const cashImpact = -(qty * price + fees);
  return { qty, price, fees, currency, cashImpact };
}

function renderBuyPreview() {
  const preview = buyPreviewValues();
  els.buyPreview.textContent = `Cash ${money(preview.cashImpact, preview.currency, 2)} | Cost incl. fees ${money(-preview.cashImpact, preview.currency, 2)}`;
}

function openBuyModal(index = null) {
  const row = Number.isInteger(index) ? state.stocks[index] : null;
  const selectedBank = row ? row.bank || "Unallocated" : "";
  renderBuyBankOptions(selectedBank);
  els.buyDate.value = todayIso();
  els.buySymbol.value = row ? (row.symbol || "").trim().toUpperCase() : "";
  els.buyName.value = row ? row.name || "" : "";
  els.buyBank.value = selectedBank || els.buyBank.value;
  els.buyQty.value = "";
  els.buyPrice.value = row ? numberValue(row.price) : "";
  els.buyCurrency.value = row ? row.currency || "USD" : "USD";
  els.buyFees.value = 0;
  els.buyNote.value = row ? `Increase ${((row.symbol || row.name || "position")).trim()}` : "";
  renderBuyPreview();
  openAccessibleModal(els.buyModal, row ? els.buyQty : els.buySymbol);
}

function closeBuyModal() {
  closeAccessibleModal(els.buyModal);
}

function confirmBuy() {
  const symbol = els.buySymbol.value.trim().toUpperCase();
  const bank = els.buyBank.value.trim() || "Unallocated";
  const name = els.buyName.value.trim();
  const preview = buyPreviewValues();
  const { qty, price, fees, currency, cashImpact } = preview;
  if (!symbol) {
    setStatus("Purchase not recorded: ticker is required.", "warning");
    return;
  }
  if (!qty || qty <= 0) {
    setStatus("Purchase not recorded: quantity must be positive.", "warning");
    return;
  }
  if (!price || price <= 0) {
    setStatus("Purchase not recorded: purchase price must be positive.", "warning");
    return;
  }

  const account = ensureCashAccount(bank, currency);
  account.amount = numberValue(account.amount) + cashImpact;
  const existing = state.stocks.find(row => (row.symbol || "").trim().toUpperCase() === symbol && (row.bank || "Unallocated") === bank && (row.currency || "USD") === currency);
  if (existing) {
    const oldQty = numberValue(existing.qty);
    const newQty = oldQty + qty;
    const oldCostTotal = oldQty * numberValue(existing.cost);
    const newCostTotal = qty * price + fees;
    existing.qty = newQty;
    existing.cost = newQty ? (oldCostTotal + newCostTotal) / newQty : price;
    existing.price = numberValue(existing.price) || price;
    existing.previousClose = numberValue(existing.previousClose) || price;
    if (name) existing.name = name;
  } else {
    state.stocks.push({
      symbol,
      name,
      bank,
      portfolio: "",
      qty,
      price,
      previousClose: price,
      cost: qty ? (qty * price + fees) / qty : price,
      currency
    });
  }
  state.transactions = Array.isArray(state.transactions) ? state.transactions : [];
  state.transactions.unshift({
    id: `txn-${Date.now()}`,
    date: els.buyDate.value || todayIso(),
    type: "Buy",
    symbol,
    name,
    bank,
    qty,
    price,
    costPrice: price,
    currency,
    fees,
    cashImpact,
    realizedPnlEur: 0,
    buyDate: els.buyDate.value || todayIso(),
    note: els.buyNote.value || ""
  });
  saveState();
  closeBuyModal();
  render();
  setStatus(`Purchase recorded: ${qty} ${symbol} bought. Cash decreased by ${money(-cashImpact, currency, 2)} at ${bank}.`);
}

function bondSellPreviewValues() {
  const row = pendingBondSellCollection === "argentinaBonds" ? (state.argentinaBonds || [])[pendingBondSellIndex] : state.bonds[pendingBondSellIndex];
  if (!row) return null;
  const nominal = Math.max(0, numberValue(els.bondSellNominal.value));
  const cleanPrice = Math.max(0, numberValue(els.bondSellPrice.value));
  const accrued = Math.max(0, numberValue(els.bondSellAccrued.value));
  const fees = Math.max(0, numberValue(els.bondSellFees.value));
  const currency = row.currency || "EUR";
  const cleanProceeds = nominal * cleanPrice / 100;
  const cashImpact = cleanProceeds + accrued - fees;
  const isArgentina = pendingBondSellCollection === "argentinaBonds";
  const cost = nominal * numberValue(row.costPrice) / 100;
  const realizedPnlEur = isArgentina ? 0 : (cleanProceeds + accrued - cost - fees) * fx(currency);
  return { row, nominal, cleanPrice, accrued, fees, currency, cashImpact, realizedPnlEur, isArgentina };
}

function renderBondSellPreview() {
  const preview = bondSellPreviewValues();
  if (!preview) return;
  els.bondSellPreview.textContent = preview.isArgentina
    ? `Cash +${money(preview.cashImpact, preview.currency, 0)} | Realized PnL not tracked`
    : `Cash +${money(preview.cashImpact, preview.currency, 0)} | Realized PnL ${displayMoney(preview.realizedPnlEur, 0)}`;
  els.bondSellPreview.className = `muted ${signedClass(preview.realizedPnlEur)}`;
}

function openBondSellModal(index, operation = "Bond Sell", collection = "bonds") {
  const row = collection === "argentinaBonds" ? (state.argentinaBonds || [])[index] : state.bonds[index];
  if (!row) return;
  pendingBondSellIndex = index;
  pendingBondSellCollection = collection;
  const currency = row.currency || "EUR";
  const isArgentina = collection === "argentinaBonds";
  const accrued = isArgentina ? argentinaBondAccruedCurrency(row) : bondAccruedCurrency(row);
  const available = isArgentina ? numberValue(row.currentNominal) : numberValue(row.nominal);
  els.bondSellModalSummary.innerHTML = [
    ["Bond", isArgentina ? `${row.isin || ""} ${row.name || ""}`.trim() : row.name || row.issuer || "-"],
    ["Available nominal", money(available, currency, 0)],
    ["Cost price", isArgentina ? "Not tracked" : `${numberValue(row.costPrice).toFixed(4)} %`],
    ["Current accrued", money(accrued, currency, 2)]
  ].map(([label, value]) => `<div class="kpi-summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  els.bondSellDate.value = todayIso();
  els.bondSellType.value = operation;
  els.bondSellNominal.max = String(available);
  els.bondSellNominal.value = available;
  els.bondSellPrice.value = operation === "Early Redemption" || operation === "Redemption" ? 100 : numberValue(row.cleanPrice);
  els.bondSellAccrued.value = String(Math.round(accrued));
  els.bondSellCurrency.value = currency;
  els.bondSellBank.value = row.bank || "Unallocated";
  els.bondSellFees.value = 0;
  els.bondSellNote.value = "";
  renderBondSellPreview();
  openAccessibleModal(els.bondSellModal, els.bondSellNominal);
  window.requestAnimationFrame(() => els.bondSellNominal.select());
}

function closeBondSellModal() {
  closeAccessibleModal(els.bondSellModal);
  pendingBondSellIndex = null;
  pendingBondSellCollection = "bonds";
}

function cashMovementPreviewValues() {
  const type = els.cashMovementType.value || "Cash Out";
  const amount = Math.max(0, numberValue(els.cashMovementAmount.value));
  const currency = els.cashMovementCurrency.value || "EUR";
  const cashImpact = type === "Cash In" ? amount : -amount;
  return { type, amount, currency, cashImpact };
}

function renderCashMovementPreview() {
  const preview = cashMovementPreviewValues();
  els.cashMovementPreview.textContent = `Cash ${money(preview.cashImpact, preview.currency, 2)}`;
  els.cashMovementPreview.className = `muted ${signedClass(preview.cashImpact)}`;
}

function openCashMovementModal() {
  renderBankOptions(els.cashMovementBank, "");
  els.cashMovementDate.value = todayIso();
  els.cashMovementType.value = "Cash Out";
  els.cashMovementAmount.value = "";
  els.cashMovementCurrency.value = "EUR";
  els.cashMovementReason.value = "Cash withdrawal";
  els.cashMovementNote.value = "";
  renderCashMovementPreview();
  openAccessibleModal(els.cashMovementModal, els.cashMovementAmount);
}

function closeCashMovementModal() {
  closeAccessibleModal(els.cashMovementModal);
}

function confirmCashMovement() {
  const preview = cashMovementPreviewValues();
  const bank = els.cashMovementBank.value || "Unallocated";
  const reason = els.cashMovementReason.value || "Cash movement";
  if (!preview.amount || preview.amount <= 0) {
    setStatus("Cash movement not recorded: amount must be positive.", "warning");
    return;
  }
  const account = ensureCashAccount(bank, preview.currency);
  account.amount = numberValue(account.amount) + preview.cashImpact;
  state.transactions = Array.isArray(state.transactions) ? state.transactions : [];
  state.transactions.unshift({
    id: `txn-${Date.now()}`,
    date: els.cashMovementDate.value || todayIso(),
    type: preview.type,
    symbol: reason,
    name: reason,
    bank,
    qty: preview.amount,
    price: 1,
    costPrice: 1,
    currency: preview.currency,
    fees: 0,
    cashImpact: preview.cashImpact,
    realizedPnlEur: 0,
    buyDate: "",
    note: els.cashMovementNote.value || reason
  });
  saveState();
  closeCashMovementModal();
  render();
  setStatus(`Cash movement recorded: ${money(preview.cashImpact, preview.currency, 2)} at ${bank}.`);
}

function confirmBondSell() {
  const preview = bondSellPreviewValues();
  if (!preview) return;
  const { row, nominal, cleanPrice, accrued, fees, currency, cashImpact, realizedPnlEur, isArgentina } = preview;
  const available = isArgentina ? numberValue(row.currentNominal) : numberValue(row.nominal);
  if (!nominal || nominal <= 0) {
    setStatus("Bond operation not recorded: nominal must be positive.", "warning");
    return;
  }
  if (nominal > available) {
    setStatus(`Bond operation not recorded: max available nominal is ${available}.`, "warning");
    return;
  }
  if (!cleanPrice || cleanPrice <= 0) {
    setStatus("Bond operation not recorded: clean price must be positive.", "warning");
    return;
  }

  const account = ensureCashAccount(row.bank, currency);
  account.amount = numberValue(account.amount) + cashImpact;
  if (isArgentina) {
    row.currentNominal = Math.max(0, available - nominal);
    row.cleanPrice = cleanPrice;
    row.priceDate = els.bondSellDate.value || todayIso();
  } else {
    row.nominal = Math.max(0, available - nominal);
  }
  state.transactions = Array.isArray(state.transactions) ? state.transactions : [];
  state.transactions.unshift({
    id: `txn-${Date.now()}`,
    date: els.bondSellDate.value || todayIso(),
    type: els.bondSellType.value || "Bond Sell",
    symbol: isArgentina ? row.isin : row.name || row.issuer || "Bond",
    name: row.name || "",
    bank: row.bank || "Unallocated",
    qty: nominal,
    price: cleanPrice,
    costPrice: isArgentina ? 0 : numberValue(row.costPrice),
    currency,
    fees,
    cashImpact,
    realizedPnlEur,
    buyDate: "",
    note: els.bondSellNote.value || `Accrued coupon ${money(accrued, currency, 0)}`
  });
  if (!isArgentina) state.bonds = state.bonds.filter(bond => numberValue(bond.nominal) > 0.00000001 || bond !== row);
  saveState();
  closeBondSellModal();
  render();
  setStatus(`Bond operation recorded: ${money(nominal, currency, 0)} nominal. Cash increased by ${money(cashImpact, currency, 2)} at ${account.bank}.`);
}

function isBondTransactionType(type) {
  return ["Bond Sell", "Early Redemption", "Redemption"].includes(type);
}

function isArgentinaBondPayment(type) {
  return type === "Bond Payment";
}

function isBondLikeTransactionType(type) {
  return isBondTransactionType(type) || isArgentinaBondPayment(type);
}

function isCashTransactionType(type) {
  return ["Cash In", "Cash Out"].includes(type);
}

function transactionFromEditForm(previous = null) {
  const type = els.txnEditType.value || "Sell";
  const rawSymbol = els.txnEditSymbol.value.trim();
  const qty = Math.max(0, numberValue(els.txnEditQty.value));
  const price = Math.max(0, numberValue(els.txnEditPrice.value));
  const fees = Math.max(0, numberValue(els.txnEditFees.value));
  const currency = els.txnEditCurrency.value || "USD";
  const costPrice = Math.max(0, numberValue(els.txnEditCostPrice.value));
  let cashImpact = 0;
  let realizedPnlEur = 0;
  if (type === "Buy") {
    cashImpact = -(qty * price + fees);
  } else if (isCashTransactionType(type)) {
    cashImpact = type === "Cash In" ? qty : -qty;
  } else if (type === "DEWS Contribution") {
    cashImpact = 0;
    realizedPnlEur = 0;
  } else if (isArgentinaBondPayment(type)) {
    cashImpact = numberValue(previous?.cashImpact) || qty + fees;
  } else if (isBondTransactionType(type)) {
    const oldAccrued = previous && isBondTransactionType(previous.type)
      ? Math.max(0, numberValue(previous.cashImpact) - numberValue(previous.qty) * numberValue(previous.price) / 100 + numberValue(previous.fees))
      : 0;
    const accrued = previous && numberValue(previous.qty) ? oldAccrued * qty / numberValue(previous.qty) : oldAccrued;
    const isArgentinaSale = (state.argentinaBonds || []).some(row => (row.isin || "").trim().toUpperCase() === rawSymbol.toUpperCase() && (row.bank || "Unallocated") === (els.txnEditBank.value || "Unallocated") && (row.currency || "EUR") === currency);
    cashImpact = qty * price / 100 + accrued - fees;
    realizedPnlEur = isArgentinaSale ? 0 : (cashImpact - qty * costPrice / 100) * fx(currency);
  } else {
    cashImpact = qty * price - fees;
    realizedPnlEur = (qty * (price - costPrice) - fees) * fx(currency);
  }
  return {
    id: previous?.id || `txn-${Date.now()}`,
    date: els.txnEditDate.value || todayIso(),
    type,
    symbol: isBondTransactionType(type) || isArgentinaBondPayment(type) ? rawSymbol.toUpperCase() : rawSymbol.toUpperCase(),
    name: els.txnEditName.value.trim(),
    bank: els.txnEditBank.value || "Unallocated",
    qty,
    price,
    costPrice,
    currency,
    fees,
    cashImpact,
    realizedPnlEur,
    buyDate: previous?.buyDate || "",
    note: els.txnEditNote.value || ""
  };
}

function findStockForTransaction(txn) {
  const symbol = (txn.symbol || "").trim().toUpperCase();
  return state.stocks.find(row => (row.symbol || "").trim().toUpperCase() === symbol && (row.bank || "Unallocated") === (txn.bank || "Unallocated") && (row.currency || "USD") === (txn.currency || "USD"));
}

function findBondForTransaction(txn) {
  const symbol = (txn.symbol || "").trim().toUpperCase();
  return state.bonds.find(row => ((row.name || row.issuer || "Bond").trim().toUpperCase() === symbol) && (row.bank || "Unallocated") === (txn.bank || "Unallocated") && (row.currency || "EUR") === (txn.currency || "EUR"));
}

function findArgentinaBondForTransaction(txn) {
  const symbol = (txn.symbol || "").trim().toUpperCase();
  return (state.argentinaBonds || []).find(row => (row.isin || "").trim().toUpperCase() === symbol && (row.bank || "Unallocated") === (txn.bank || "Unallocated") && (row.currency || "EUR") === (txn.currency || "EUR"));
}

function applyTransactionEffects(txn, direction) {
  const currency = txn.currency || "USD";
  const bank = txn.bank || "Unallocated";
  const account = ensureCashAccount(bank, currency);
  account.amount = numberValue(account.amount) + direction * numberValue(txn.cashImpact);

  if (isArgentinaBondPayment(txn.type)) {
    const bond = findArgentinaBondForTransaction(txn);
    if (bond) {
      bond.currentNominal = Math.max(0, numberValue(bond.currentNominal) - direction * numberValue(txn.qty));
      if (direction < 0 && txn.date) {
        bond.processedPayments = (bond.processedPayments || []).filter(id => id !== argentinaPaymentId(bond, txn.date));
      }
    }
    return;
  }

  if (isCashTransactionType(txn.type)) {
    return;
  }

  if (isBondTransactionType(txn.type)) {
    const argentinaBond = findArgentinaBondForTransaction(txn);
    if (argentinaBond) {
      argentinaBond.currentNominal = Math.max(0, numberValue(argentinaBond.currentNominal) - direction * numberValue(txn.qty));
      if (direction > 0) {
        argentinaBond.cleanPrice = numberValue(txn.price);
        argentinaBond.priceDate = txn.date || todayIso();
      }
      return;
    }
    let bond = findBondForTransaction(txn);
    if (!bond && direction < 0) {
      bond = { name: txn.symbol || txn.name || "Bond", type: "Autre", bank, issuer: txn.name || "", currency, nominal: 0, cleanPrice: numberValue(txn.price), costPrice: numberValue(txn.costPrice), couponRate: 0, frequency: 1, lastCoupon: "", nextCoupon: "", maturity: "", dayCount: "ACT/ACT" };
      state.bonds.push(bond);
    }
    if (bond) {
      bond.nominal = Math.max(0, numberValue(bond.nominal) - direction * numberValue(txn.qty));
      if (direction > 0) bond.cleanPrice = numberValue(txn.price);
      if (numberValue(txn.costPrice)) bond.costPrice = numberValue(txn.costPrice);
    }
    state.bonds = state.bonds.filter(row => numberValue(row.nominal) > 0.00000001);
    return;
  }

  const signedQty = txn.type === "Buy" ? numberValue(txn.qty) : -numberValue(txn.qty);
  let stock = findStockForTransaction(txn);
  if (!stock && direction * signedQty > 0) {
    stock = { symbol: (txn.symbol || "").trim().toUpperCase(), name: txn.name || "", bank, portfolio: "", qty: 0, price: numberValue(txn.price), previousClose: numberValue(txn.price), cost: numberValue(txn.costPrice) || numberValue(txn.price), currency };
    state.stocks.push(stock);
  }
  if (!stock) return;
  const oldQty = numberValue(stock.qty);
  const delta = direction * signedQty;
  if (txn.type === "Buy" && direction > 0 && delta > 0) {
    const newQty = oldQty + delta;
    const oldCostTotal = oldQty * numberValue(stock.cost);
    const newCostTotal = numberValue(txn.qty) * numberValue(txn.price) + numberValue(txn.fees);
    stock.cost = newQty ? (oldCostTotal + newCostTotal) / newQty : numberValue(txn.price);
  }
  stock.qty = Math.max(0, oldQty + delta);
  stock.price = numberValue(stock.price) || numberValue(txn.price);
  stock.previousClose = numberValue(stock.previousClose) || numberValue(txn.price);
  if (txn.name) stock.name = txn.name;
  state.stocks = state.stocks.filter(row => numberValue(row.qty) > 0.00000001);
}

function transactionValidationError(txn) {
  if (txn.type === "Sell") {
    const stock = findStockForTransaction(txn);
    if (!stock) return `Correction not saved: ${txn.symbol} is not held at ${txn.bank} in ${txn.currency}.`;
    const available = numberValue(stock.qty);
    if (numberValue(txn.qty) > available + 0.00000001) {
      return `Correction not saved: max available quantity for ${txn.symbol} is ${available}.`;
    }
  }
  if (isBondTransactionType(txn.type)) {
    const argentinaBond = findArgentinaBondForTransaction(txn);
    if (argentinaBond) {
      const available = numberValue(argentinaBond.currentNominal);
      if (numberValue(txn.qty) > available + 0.00000001) {
        return `Correction not saved: max available nominal for ${txn.symbol} is ${available}.`;
      }
      return "";
    }
    const bond = findBondForTransaction(txn);
    if (!bond) return `Correction not saved: ${txn.symbol} is not held at ${txn.bank} in ${txn.currency}.`;
    const available = numberValue(bond.nominal);
    if (numberValue(txn.qty) > available + 0.00000001) {
      return `Correction not saved: max available nominal for ${txn.symbol} is ${available}.`;
    }
  }
  return "";
}

function renderTxnEditPreview() {
  const previous = (state.transactions || []).find(row => row.id === pendingTxnEditId);
  const edited = transactionFromEditForm(previous);
  if (isCashTransactionType(edited.type)) {
    els.txnEditPreview.textContent = `Cash ${signedMoney(edited.cashImpact, edited.currency, 2)}`;
    els.txnEditPreview.className = `muted ${signedClass(edited.cashImpact)}`;
    return;
  }
  els.txnEditPreview.textContent = `Cash ${money(edited.cashImpact, edited.currency, 2)} | Realized PnL ${displayMoney(edited.realizedPnlEur, 2)}`;
  els.txnEditPreview.className = `muted ${signedClass(edited.realizedPnlEur)}`;
}

function openTxnEditModal(id) {
  const txn = (state.transactions || []).find(row => row.id === id);
  if (!txn) return;
  pendingTxnEditId = id;
  renderBankOptions(els.txnEditBank, txn.bank || "Unallocated");
  els.txnEditDate.value = txn.date || todayIso();
  els.txnEditType.value = txn.type || "Sell";
  els.txnEditSymbol.value = txn.symbol || "";
  els.txnEditName.value = txn.name || "";
  els.txnEditBank.value = txn.bank || "Unallocated";
  els.txnEditQty.value = numberValue(txn.qty);
  els.txnEditPrice.value = numberValue(txn.price);
  els.txnEditCurrency.value = txn.currency || "USD";
  els.txnEditFees.value = numberValue(txn.fees);
  els.txnEditCostPrice.value = numberValue(txn.costPrice);
  els.txnEditNote.value = txn.note || "";
  renderTxnEditPreview();
  openAccessibleModal(els.txnEditModal, els.txnEditQty);
  window.requestAnimationFrame(() => els.txnEditQty.select());
}

function closeTxnEditModal() {
  closeAccessibleModal(els.txnEditModal);
  pendingTxnEditId = null;
}

function confirmTxnEdit() {
  const index = (state.transactions || []).findIndex(row => row.id === pendingTxnEditId);
  if (index < 0) return;
  const previous = { ...state.transactions[index] };
  const edited = transactionFromEditForm(previous);
  if (!edited.symbol) {
    setStatus("Correction not saved: instrument is required.", "warning");
    return;
  }
  if (!edited.qty || edited.qty <= 0 || !edited.price || edited.price <= 0) {
    setStatus("Correction not saved: quantity and price must be positive.", "warning");
    return;
  }
  applyTransactionEffects(previous, -1);
  const validationError = transactionValidationError(edited);
  if (validationError) {
    applyTransactionEffects(previous, 1);
    render();
    setStatus(validationError, "warning");
    return;
  }
  applyTransactionEffects(edited, 1);
  state.transactions[index] = edited;
  state.transactions.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  saveState();
  closeTxnEditModal();
  render();
  setStatus(`Transaction corrected: ${edited.type} ${edited.symbol}.`);
}

function cancelTxnOperation() {
  const index = (state.transactions || []).findIndex(row => row.id === pendingTxnEditId);
  if (index < 0) return;
  const previous = state.transactions[index];
  if (!window.confirm(`Cancel this operation and reverse its cash / position impact?`)) return;
  applyTransactionEffects(previous, -1);
  state.transactions.splice(index, 1);
  saveState();
  closeTxnEditModal();
  render();
  setStatus(`Operation cancelled: ${previous.type} ${previous.symbol}.`);
}

function addBond() {
  state.bonds.push({ name: "", type: "Treasury US", bank: "", issuer: "", currency: "USD", nominal: 0, cleanPrice: 100, costPrice: 100, couponRate: 0, frequency: 2, lastCoupon: "", nextCoupon: "", maturity: "", dayCount: "ACT/ACT" });
  saveState();
  render();
}

function addCash() {
  state.cash.push({ name: "", bank: "", currency: "EUR", amount: 0 });
  saveState();
  render();
}

function addPrivateAsset() {
  state.privateAssets.push({ name: "", bank: "", valueEur: 0, commitmentEur: 0, calledEur: 0, valuationDate: "", note: "" });
  saveState();
  render();
}

function addRealEstate() {
  state.realEstate.push({ name: "", city: "", bank: "Direct", currency: "EUR", grossValue: 0, originalLoan: 0, annualRate: 0, termYears: 0, loanStartDate: "", monthlyRent: 0, monthlyCosts: 0, valuationDate: "", note: "" });
  saveState();
  render();
}

function addDivers() {
  state.divers.push({ category: "Autre", name: "", bank: "", currency: "EUR", qty: 1, unitPrice: 0, note: "" });
  saveState();
  render();
}

function addForecastFlow() {
  state.forecastFlows = Array.isArray(state.forecastFlows) ? state.forecastFlows : [];
  state.forecastFlows.push({ direction: "In", frequency: "Quarterly", name: "", bank: "", currency: "USD", amount: 0, startDate: todayIso(), date: "", note: "" });
  saveState();
  render();
  setPage("forecast");
}

async function fetchJson(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

async function mapWithConcurrency(items, limit, worker) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(Math.max(1, limit), queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function refreshFxRate() {
  const applyRate = (eurUsd, source) => {
    const rate = Number(eurUsd);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error(`Invalid EUR/USD rate from ${source}`);
    state.eurUsd = rate;
    return { ok: true, eurUsd: rate, source };
  };

  try {
    const data = await fetchJson("https://fxapi.app/api/EUR/USD.json");
    return applyRate(data?.rate, "fxapi 5m");
  } catch (error) {
    console.warn("fxapi EUR/USD refresh failed, trying Frankfurter fallback", error);
  }

  try {
    const rate = await fetchJson("https://api.frankfurter.dev/v2/rate/EUR/USD");
    return applyRate(rate?.rate, "Frankfurter reference");
  } catch (error) {
    console.warn("Fallback EUR/USD refresh failed", error);
    return { ok: false, source: "" };
  }
}

async function refreshQuotes() {
  state.apiKey = els.apiKey.value.trim();
  const apiKey = state.apiKey;
  saveState();
  if (!apiKey) {
    setStatus("Add a Finnhub key to update stock prices and EUR/USD automatically.", "warning");
    return;
  }
  const symbols = [...new Set(state.stocks.map(row => row.symbol.trim().toUpperCase()).filter(Boolean))];
  setStatus(`Refreshing EUR/USD${symbols.length ? ` and ${symbols.length} ticker(s)` : ""}...`);
  const fxResult = await refreshFxRate();
  let ok = 0;
  let failed = 0;
  await mapWithConcurrency(symbols, 3, async symbol => {
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(apiKey)}`;
      const quote = await fetchJson(url);
      if (!quote || !Number.isFinite(Number(quote.c)) || Number(quote.c) <= 0) throw new Error("Invalid price");
      state.stocks.filter(row => row.symbol.trim().toUpperCase() === symbol).forEach(row => {
        row.price = Number(quote.c);
        if (Number.isFinite(Number(quote.pc)) && Number(quote.pc) > 0) row.previousClose = Number(quote.pc);
      });
      ok += 1;
    } catch (error) {
      failed += 1;
      console.warn(`Refresh failed for ${symbol}`, error);
    }
  });
  if (fxResult.ok || ok) state.lastUpdate = new Date().toLocaleString("en-US");
  saveState();
  render();
  const fxText = fxResult.ok ? `EUR/USD updated to ${fxResult.eurUsd.toFixed(4)} via ${fxResult.source}` : "EUR/USD not updated";
  const stockText = symbols.length ? `${ok} ticker(s) updated${failed ? `, ${failed} failure(s)` : ""}` : "no ticker to refresh";
  setStatus(`${fxText}; ${stockText}.${fxResult.ok ? "" : " Check your network connection."}`, fxResult.ok || ok ? "" : "warning");
}

function setStatus(message, type = "") {
  els.statusLine.textContent = message;
  els.statusLine.className = `status ${type}`;
}

function scheduleRefresh() {
  if (timer) window.clearInterval(timer);
  const seconds = numberValue(state.refreshInterval);
  if (seconds > 0) {
    timer = window.setInterval(refreshQuotes, seconds * 1000);
    if (!els.statusLine.textContent.includes("updated") && !els.statusLine.textContent.includes("Refresh de")) {
      setStatus(`Manual refresh available at any time. Auto refresh active every ${seconds === 60 ? "1 min" : `${seconds} sec`}.`);
    }
  } else if (!els.statusLine.textContent.includes("updated") && !els.statusLine.textContent.includes("Refresh de")) {
    setStatus("Manual refresh available at any time. Auto refresh disabled.");
  }
}

function syncSettings() {
  state.apiKey = els.apiKey.value.trim();
  state.eurUsd = numberValue(els.eurUsd.value);
  state.refreshInterval = numberValue(els.refreshInterval.value);
  state.weeklySnapshotDay = Number(els.weeklySnapshotDay.value);
  saveState();
}

const dataFileName = "patrimoine-data.json";
const dataPickerId = "patrimoine-dashboard-json";
const dataPickerTypes = [{ description: "Wealth data JSON", accept: { "application/json": [".json"] } }];
const dataPickerStartIn = "desktop";
const dataHandleDbName = "patrimoine-dashboard-sync";
const dataHandleStoreName = "handles";
const dataHandleKey = "onedrive-data-file";
const backupDirectoryKey = "weekly-backup-directory-v3";
const dataDeviceIdKey = "patrimoine-dashboard-device-id";

function setDataSyncState(nextState, message = "") {
  dataSyncState = nextState;
  dataSyncMessage = message;
  if (els?.dataStatus) renderDataStatus();
}

function deviceId() {
  let id = localStorage.getItem(dataDeviceIdKey);
  if (!id) {
    id = window.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(dataDeviceIdKey, id);
  }
  return id;
}

function openDataHandleDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = indexedDB.open(dataHandleDbName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(dataHandleStoreName)) request.result.createObjectStore(dataHandleStoreName);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Unable to open sync storage"));
  });
}

async function storeDataHandle(handle) {
  try {
    const db = await openDataHandleDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(dataHandleStoreName, "readwrite");
      tx.objectStore(dataHandleStoreName).put(handle, dataHandleKey);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Unable to remember data file"));
    });
    db.close();
  } catch (error) {
    console.warn("Unable to remember the data file", error);
  }
}

async function rememberedDataHandle() {
  try {
    const db = await openDataHandleDb();
    const handle = await new Promise((resolve, reject) => {
      const tx = db.transaction(dataHandleStoreName, "readonly");
      const request = tx.objectStore(dataHandleStoreName).get(dataHandleKey);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("Unable to restore data file"));
    });
    db.close();
    return handle;
  } catch {
    return null;
  }
}

function setBackupState(nextState, message = "") {
  backupState = nextState;
  backupMessage = message;
  renderBackupStatus();
}

async function storeBackupDirectoryHandle(handle) {
  try {
    const db = await openDataHandleDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(dataHandleStoreName, "readwrite");
      tx.objectStore(dataHandleStoreName).put(handle, backupDirectoryKey);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Unable to remember backup folder"));
    });
    db.close();
  } catch (error) {
    console.warn("Unable to remember the backup folder", error);
  }
}

async function rememberedBackupDirectoryHandle() {
  try {
    const db = await openDataHandleDb();
    const handle = await new Promise((resolve, reject) => {
      const tx = db.transaction(dataHandleStoreName, "readonly");
      const request = tx.objectStore(dataHandleStoreName).get(backupDirectoryKey);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("Unable to restore backup folder"));
    });
    db.close();
    return handle;
  } catch {
    return null;
  }
}

async function dataHandlePermission(handle, requestPermission = false) {
  if (!handle) return false;
  const options = { mode: "readwrite" };
  if (!handle.queryPermission) return true;
  if (await handle.queryPermission(options) === "granted") return true;
  return requestPermission && handle.requestPermission && await handle.requestPermission(options) === "granted";
}

async function readDataHandle(handle) {
  const file = await handle.getFile();
  const text = await file.text();
  if (!text.trim()) return { file, data: null };
  const data = JSON.parse(text);
  validateImportedPayload(data);
  return { file, data };
}

function exportableStateJson() {
  const payload = structuredClone(state);
  payload.schemaVersion = 3;
  return JSON.stringify(payload, null, 2);
}

function backupFileName(manual = false, now = new Date()) {
  const date = localDateIso(now);
  if (!manual) return `patrimoine-data-backup-${isoWeekKey(now)}-${date}.json`;
  const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  return `patrimoine-data-backup-${date}-${time}.json`;
}

async function writeWeeklyBackup(options = {}) {
  if (!backupDirectoryHandle) return false;
  const allowed = await dataHandlePermission(backupDirectoryHandle, Boolean(options.requestPermission));
  if (!allowed) {
    setBackupState("remembered", `Backup folder remembered${backupDirectoryName ? `: ${backupDirectoryName}` : ""}. Click Connect backup folder to restore permission.`);
    return false;
  }
  const previousKey = state.lastWeeklyBackupKey || "";
  const previousAt = state.lastWeeklyBackupAt || "";
  const now = new Date();
  setBackupState("saving");
  try {
    state.apiKey = els.apiKey.value.trim();
    state.lastWeeklyBackupKey = isoWeekKey(now);
    state.lastWeeklyBackupAt = now.toLocaleString("en-US");
    const filename = backupFileName(Boolean(options.manual), now);
    const fileHandle = await backupDirectoryHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(exportableStateJson());
    await writable.close();
    saveState({ skipCloud: true });
    setBackupState("connected");
    if (options.announce) setStatus(`Backup created: ${filename}.`);
    return true;
  } catch (error) {
    state.lastWeeklyBackupKey = previousKey;
    state.lastWeeklyBackupAt = previousAt;
    setBackupState("error", `Backup failed: ${error?.message || "folder unavailable"}.`);
    if (options.announce) setStatus("Backup failed. Reconnect the backup folder and try again.", "warning");
    return false;
  }
}

function downloadBackupCopy() {
  state.apiKey = els.apiKey.value.trim();
  const now = new Date();
  state.lastWeeklyBackupKey = isoWeekKey(now);
  state.lastWeeklyBackupAt = now.toLocaleString("en-US");
  saveState({ skipCloud: true });
  const blob = new Blob([exportableStateJson()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = backupFileName(true, now);
  link.click();
  URL.revokeObjectURL(url);
  renderBackupStatus();
  setStatus(`${link.download} downloaded.`, "");
}

async function connectBackupDirectory() {
  if (!window.showDirectoryPicker) {
    downloadBackupCopy();
    return false;
  }
  try {
    const handle = await window.showDirectoryPicker({ id: "patrimoine-weekly-backups", mode: "readwrite", startIn: "documents" });
    backupDirectoryHandle = handle;
    backupDirectoryName = handle.name || "Backup folder";
    await storeBackupDirectoryHandle(handle);
    setBackupState("connected");
    await writeWeeklyBackup({ manual: true, requestPermission: true, announce: true });
    scheduleWeeklyBackups();
    return true;
  } catch (error) {
    if (error?.name === "AbortError") {
      setStatus("Backup folder selection cancelled.", "warning");
      return false;
    }
    setBackupState("error", `Backup folder unavailable: ${error?.message || "access denied"}.`);
    return false;
  }
}

async function backupNow() {
  if (!window.showDirectoryPicker) return downloadBackupCopy();
  if (!backupDirectoryHandle) return connectBackupDirectory();
  const saved = await writeWeeklyBackup({ manual: true, requestPermission: true, announce: true });
  if (!saved && backupState === "remembered") await connectBackupDirectory();
}

async function maybeCreateWeeklyBackup(showStatus = false) {
  if (!backupDirectoryHandle || state.lastWeeklyBackupKey === isoWeekKey(new Date())) return false;
  return writeWeeklyBackup({ manual: false, requestPermission: false, announce: showStatus });
}

function scheduleWeeklyBackups() {
  if (weeklyBackupTimer) window.clearInterval(weeklyBackupTimer);
  maybeCreateWeeklyBackup(false);
  weeklyBackupTimer = window.setInterval(() => maybeCreateWeeklyBackup(true), 6 * 60 * 60 * 1000);
}

async function restoreBackupDirectory() {
  if (!window.showDirectoryPicker) {
    renderBackupStatus();
    return;
  }
  const handle = await rememberedBackupDirectoryHandle();
  if (!handle) return;
  backupDirectoryHandle = handle;
  backupDirectoryName = handle.name || "Backup folder";
  try {
    if (await dataHandlePermission(handle, false)) {
      setBackupState("connected");
      scheduleWeeklyBackups();
    } else {
      setBackupState("remembered", `Backup folder remembered: ${backupDirectoryName}. Click Connect backup folder to restore permission.`);
    }
  } catch (error) {
    setBackupState("error", `The remembered backup folder is unavailable: ${error?.message || "access denied"}.`);
  }
}

function scheduleConnectedDataSave(delay = 900) {
  if (!connectedDataHandle || dataSyncState === "conflict" || applyingRemoteData) return;
  if (dataSyncTimer) window.clearTimeout(dataSyncTimer);
  dataSyncTimer = window.setTimeout(() => {
    dataSyncTimer = null;
    writeConnectedDataFile().catch(error => {
      console.warn("Automatic OneDrive save failed", error);
      setDataSyncState("error", "Automatic OneDrive save failed. Changes remain saved in this browser; use Save now to retry.");
    });
  }, delay);
}

async function writeConnectedDataFile(options = {}) {
  if (!connectedDataHandle) return false;
  if (dataSyncWriting) {
    dataSyncQueued = true;
    return false;
  }
  dataSyncWriting = true;
  setDataSyncState("saving");
  try {
    if (!await dataHandlePermission(connectedDataHandle, Boolean(options.requestPermission))) {
      setDataSyncState("remembered", `Permission is required for ${connectedDataFileName || dataFileName}. Click Connect data file to resume automatic sync.`);
      return false;
    }
    let diskData = null;
    try {
      diskData = (await readDataHandle(connectedDataHandle)).data;
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
    const diskUpdatedAt = diskData?.syncMeta?.updatedAt || "";
    if (!options.force && diskUpdatedAt && diskUpdatedAt !== connectedRemoteUpdatedAt) {
      setDataSyncState("conflict", "A newer OneDrive version was detected. Automatic saving is paused. Click Connect data file to load that version first.");
      setStatus("Newer OneDrive data detected. Reconnect the data file before making another save.", "warning");
      return false;
    }
    const now = new Date();
    const revision = Math.max(numberValue(state.syncMeta?.revision), numberValue(diskData?.syncMeta?.revision)) + 1;
    state.dataSavedAt = now.toLocaleString("en-US");
    state.syncMeta = { version: 1, updatedAt: now.toISOString(), revision, deviceId: deviceId() };
    saveState({ skipCloud: true });
    const writable = await connectedDataHandle.createWritable();
    await writable.write(exportableStateJson());
    await writable.close();
    connectedRemoteUpdatedAt = state.syncMeta.updatedAt;
    setDataSyncState("synced");
    if (options.announce) setStatus(`Data and snapshots saved to ${connectedDataFileName || dataFileName}.`);
    return true;
  } catch (error) {
    setDataSyncState("error", "OneDrive sync is unavailable. Changes remain saved in this browser; use Save now to retry.");
    throw error;
  } finally {
    dataSyncWriting = false;
    if (dataSyncQueued && dataSyncState !== "conflict") {
      dataSyncQueued = false;
      scheduleConnectedDataSave(150);
    }
  }
}

async function activateDataHandle(handle, options = {}) {
  setDataSyncState("connecting");
  connectedDataHandle = handle;
  connectedDataFileName = handle.name || dataFileName;
  await storeDataHandle(handle);
  if (!await dataHandlePermission(handle, Boolean(options.requestPermission))) {
    setDataSyncState("remembered", `Data file remembered. Click Connect data file to grant access to ${connectedDataFileName}.`);
    return false;
  }
  const { data } = await readDataHandle(handle);
  if (data) {
    connectedRemoteUpdatedAt = data.syncMeta?.updatedAt || "";
    applyingRemoteData = true;
    try {
      state = normalizeState(data);
      state.dataLoadedAt = new Date().toLocaleString("en-US");
      saveState({ skipCloud: true });
      render();
    } finally {
      applyingRemoteData = false;
    }
    setDataSyncState("synced");
    if (options.announce) setStatus(`Connected to ${connectedDataFileName}. Data and snapshots loaded; automatic sync is active.`);
    scheduleConnectedDataSave(1200);
  } else {
    connectedRemoteUpdatedAt = "";
    await writeConnectedDataFile({ force: true, announce: Boolean(options.announce) });
  }
  return true;
}

async function restoreConnectedDataFile() {
  if (!window.showOpenFilePicker) return;
  const handle = await rememberedDataHandle();
  if (!handle) return;
  connectedDataFileName = handle.name || dataFileName;
  try {
    await activateDataHandle(handle, { requestPermission: false, announce: false });
  } catch (error) {
    console.warn("Unable to restore OneDrive sync", error);
    setDataSyncState("error", "The remembered data file could not be opened. Click Connect data file to choose it again.");
  }
}

function exportJson() {
  syncSettings();
  state.dataSavedAt = new Date().toLocaleString("en-US");
  saveState({ skipCloud: true });
  const blob = new Blob([exportableStateJson()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = dataFileName;
  link.click();
  URL.revokeObjectURL(url);
  renderDataStatus();
  setStatus(`${dataFileName} downloaded. Replace it in your OneDrive Dashboard folder; automatic sync is not available in this browser.`, "warning");
}

async function saveDataFile() {
  syncSettings();
  if (dataSyncTimer) {
    window.clearTimeout(dataSyncTimer);
    dataSyncTimer = null;
  }
  if (connectedDataHandle) {
    try {
      await writeConnectedDataFile({ requestPermission: true, announce: true });
      return;
    } catch (error) {
      console.warn("Connected save failed", error);
    }
  }
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        id: dataPickerId,
        startIn: dataPickerStartIn,
        suggestedName: dataFileName,
        types: dataPickerTypes
      });
      connectedDataHandle = handle;
      connectedDataFileName = handle.name || dataFileName;
      await storeDataHandle(handle);
      let existing = null;
      let existingReadError = null;
      try {
        existing = (await readDataHandle(handle)).data;
        connectedRemoteUpdatedAt = existing?.syncMeta?.updatedAt || "";
      } catch (error) {
        existingReadError = error;
        connectedRemoteUpdatedAt = "";
      }
      if (existingReadError && !window.confirm(`${connectedDataFileName} could not be validated (${existingReadError.message || "invalid data"}). Replace it anyway?`)) {
        setStatus("Save cancelled: the unreadable data file was not changed.", "warning");
        return;
      }
      if (existing && !window.confirm(`${connectedDataFileName} already contains portfolio data. Replace that file with the current V3 data?`)) {
        setStatus("Save cancelled: the existing data file was not changed.", "warning");
        return;
      }
      await writeConnectedDataFile({ force: true, requestPermission: true, announce: true });
      return;
    } catch (error) {
      if (error && error.name === "AbortError") {
        setStatus("Save cancelled.", "warning");
        return;
      }
      console.warn("Direct save failed", error);
    }
  }
  exportJson();
}

async function loadDataFile() {
  if (window.showOpenFilePicker) {
    try {
      const [handle] = await window.showOpenFilePicker({
        id: dataPickerId,
        startIn: dataPickerStartIn,
        multiple: false,
        types: dataPickerTypes
      });
      await activateDataHandle(handle, { requestPermission: true, announce: true });
      return;
    } catch (error) {
      if (error && error.name === "AbortError") {
        setStatus("Load cancelled.", "warning");
        return;
      }
      console.warn("Direct load failed", error);
    }
  }
  els.importFile.click();
}

function importJson(file) {
  if (!file || file.size > 5 * 1024 * 1024) {
    setStatus("Import failed: the JSON file must be smaller than 5 MB.", "warning");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      validateImportedPayload(imported);
      state = normalizeState(imported);
      state.dataLoadedAt = new Date().toLocaleString("en-US");
      saveState({ skipCloud: true });
      render();
      setStatus(`Data loaded from ${file.name}. This browser requires manual Save now downloads.`);
    } catch {
      setStatus("Import failed: invalid JSON file.", "warning");
    }
  };
  reader.readAsText(file);
}

document.addEventListener("click", event => {
  const th = event.target.closest("th.sortable");
  if (th) handleSortClick(th);
  const editTransaction = event.target.closest("[data-edit-transaction]");
  if (editTransaction) openTxnEditModal(editTransaction.dataset.editTransaction);
  const tickerItem = event.target.closest("[data-ticker-page]");
  if (tickerItem) {
    setPage(tickerItem.dataset.tickerPage || "dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const kpi = event.target.closest("[data-kpi-detail]");
  if (kpi) openKpiDetail(kpi.dataset.kpiDetail);
  const bridge = event.target.closest("[data-bridge-detail]");
  if (bridge) openWealthBridgeDetail(bridge.dataset.bridgeDetail);
  if (event.target.closest("[data-close-kpi]")) closeKpiDetail();
  if (event.target.closest("[data-close-sell]")) closeSellModal();
  if (event.target.closest("[data-close-buy]")) closeBuyModal();
  if (event.target.closest("[data-close-bond-sell]")) closeBondSellModal();
  if (event.target.closest("[data-close-cash-movement]")) closeCashMovementModal();
  if (event.target.closest("[data-close-txn-edit]")) closeTxnEditModal();
});
document.addEventListener("keydown", event => {
  trapModalFocus(event);
  const kpi = event.target.closest?.("[data-kpi-detail]");
  if (kpi && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openKpiDetail(kpi.dataset.kpiDetail);
  }
  const bridge = event.target.closest?.("[data-bridge-detail]");
  if (bridge && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openWealthBridgeDetail(bridge.dataset.bridgeDetail);
  }
  if (event.key === "Escape" && els.kpiModal.classList.contains("open")) closeKpiDetail();
  if (event.key === "Escape" && els.dewsCreditModal.classList.contains("open")) closeDewsCreditModal();
  if (event.key === "Escape" && els.bondCouponModal.classList.contains("open")) closeBondCouponModal();
  if (event.key === "Escape" && els.sellModal.classList.contains("open")) closeSellModal();
  if (event.key === "Escape" && els.buyModal.classList.contains("open")) closeBuyModal();
  if (event.key === "Escape" && els.bondSellModal.classList.contains("open")) closeBondSellModal();
  if (event.key === "Escape" && els.cashMovementModal.classList.contains("open")) closeCashMovementModal();
  if (event.key === "Escape" && els.txnEditModal.classList.contains("open")) closeTxnEditModal();
});
document.querySelectorAll("button.nav").forEach(button => button.addEventListener("click", () => setPage(button.dataset.pageTarget)));

const phoneLayout = window.matchMedia("(max-width: 780px)");
function setNavDrawer(open) {
  const menuBtn = document.getElementById("mobileMenuBtn");
  const backdrop = document.getElementById("navBackdrop");
  const sidebar = document.getElementById("appSidebar");
  const wasOpen = document.body.classList.contains("nav-open");
  document.body.classList.toggle("nav-open", open);
  if (backdrop) backdrop.hidden = !open;
  menuBtn?.setAttribute("aria-expanded", String(open));
  if (open) sidebar?.querySelector("button.nav.active, button.nav")?.focus();
  else if (wasOpen) menuBtn?.focus();
}
document.querySelectorAll(".tab-btn[data-tab-target]").forEach(button => button.addEventListener("click", () => {
  setNavDrawer(false);
  setPage(button.dataset.tabTarget);
  window.scrollTo({ top: 0 });
}));
document.getElementById("mobileMenuBtn")?.addEventListener("click", () => setNavDrawer(!document.body.classList.contains("nav-open")));
document.getElementById("navBackdrop")?.addEventListener("click", () => setNavDrawer(false));
document.querySelectorAll("#appSidebar button.nav").forEach(button => button.addEventListener("click", () => {
  if (!phoneLayout.matches) return;
  setNavDrawer(false);
  window.scrollTo({ top: 0 });
}));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && document.body.classList.contains("nav-open")) setNavDrawer(false);
});
phoneLayout.addEventListener("change", event => { if (!event.matches) setNavDrawer(false); });
document.getElementById("syncPill")?.addEventListener("click", () => setPage("settings"));
document.getElementById("actionsPill")?.addEventListener("click", event => {
  event.stopPropagation();
  toggleActionsPanel();
});
document.getElementById("actionsPanel")?.addEventListener("click", event => {
  event.stopPropagation();
  const dismiss = event.target.closest("[data-action-dismiss]");
  if (dismiss) {
    const item = actionItems[Number(dismiss.dataset.actionDismiss)];
    actionNotices = actionNotices.filter(notice => notice.key !== item?.noticeKey);
    renderActionCenter();
    if (actionItems.length) document.querySelector("#actionsPanel button")?.focus();
    else document.getElementById("syncPill")?.focus();
    return;
  }
  const run = event.target.closest("[data-action-run]");
  if (!run) return;
  const item = actionItems[Number(run.dataset.actionRun)];
  toggleActionsPanel(false);
  item?.run();
});
document.addEventListener("click", event => {
  const panel = document.getElementById("actionsPanel");
  if (panel && !panel.hidden && !event.target.closest(".action-center")) toggleActionsPanel(false);
});
document.addEventListener("keydown", event => {
  const panel = document.getElementById("actionsPanel");
  if (event.key === "Escape" && panel && !panel.hidden) {
    toggleActionsPanel(false);
    document.getElementById("actionsPill")?.focus();
  }
});
els.marketTickerToggle.addEventListener("click", () => setTickerPaused(!tickerPaused()));
els.sidebarPulse.addEventListener("click", () => {
  setPage("dashboard");
  window.scrollTo({ top: 0, behavior: "smooth" });
});
els.sidebarPulse.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    els.sidebarPulse.click();
  }
});
els.dashboardStocksViewAll.addEventListener("click", () => {
  setPage("stocks");
  window.scrollTo({ top: 0, behavior: "smooth" });
});
els.dashboardBanksViewAll.addEventListener("click", () => {
  setPage("banks");
  window.scrollTo({ top: 0, behavior: "smooth" });
});
els.structuredProductCards.addEventListener("click", event => {
  const button = event.target.closest("[data-end-structured]");
  if (button) endStructuredProduct(button.dataset.endStructured);
});
els.structuredCouponBody.addEventListener("click", event => {
  const credit = event.target.closest("[data-credit-structured]");
  if (credit) creditStructuredCoupon(credit.dataset.creditStructured, credit.dataset.paymentDate);
  const memory = event.target.closest("[data-memory-structured]");
  if (memory) deferStructuredCoupon(memory.dataset.memoryStructured, memory.dataset.paymentDate);
});
els.structuredDueOpen.addEventListener("click", () => {
  setPage("structured");
  els.structuredCouponBody.closest(".panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
});
els.structuredToastOpen.addEventListener("click", () => {
  els.structuredToast.hidden = true;
  setPage("structured");
});
els.structuredToastDismiss.addEventListener("click", () => { els.structuredToast.hidden = true; });
els.dashboardBankBody.addEventListener("click", event => {
  const card = event.target.closest("[data-dashboard-bank]");
  if (!card) return;
  expandedBanks.add(card.dataset.dashboardBank);
  setPage("banks");
  renderBanks();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document.querySelectorAll("[data-dashboard-currency]").forEach(button => button.addEventListener("click", () => setDashboardCurrency(button.dataset.dashboardCurrency)));
document.querySelectorAll("[data-theme-choice]").forEach(button => button.addEventListener("click", () => setTheme(button.dataset.themeChoice)));
document.querySelectorAll("[data-intraday-range]").forEach(button => button.addEventListener("click", () => setIntradayRange(button.dataset.intradayRange)));
els.wealthBridgeReferenceDate.addEventListener("change", () => {
  state.wealthBridgeReferenceDate = els.wealthBridgeReferenceDate.value;
  saveState();
  renderTotals();
});
els.intradayChart.addEventListener("mousemove", event => {
  intradayChartHover = canvasPointerPosition(els.intradayChart, event);
  drawIntradayChart((state.intradaySnapshots || []).filter(Boolean));
});
els.intradayChart.addEventListener("mouseleave", () => {
  intradayChartHover = null;
  drawIntradayChart((state.intradaySnapshots || []).filter(Boolean));
});
els.historyChart.addEventListener("mousemove", event => {
  historyChartHover = canvasPointerPosition(els.historyChart, event);
  drawHistoryChart(state.history || []);
});
els.historyChart.addEventListener("mouseleave", () => {
  historyChartHover = null;
  drawHistoryChart(state.history || []);
});
els.globalSearch.addEventListener("change", openGlobalSearchResult);
els.globalSearch.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    openGlobalSearchResult();
  }
});
document.getElementById("addStockBtn").addEventListener("click", addStock);
document.getElementById("buyStockBtn").addEventListener("click", openBuyModal);
document.getElementById("addBondBtn").addEventListener("click", addBond);
document.getElementById("cashMovementBtn").addEventListener("click", openCashMovementModal);
document.getElementById("addCashBtn").addEventListener("click", addCash);
document.getElementById("addPrivateBtn").addEventListener("click", addPrivateAsset);
document.getElementById("addRealEstateBtn").addEventListener("click", addRealEstate);
document.getElementById("addDiversBtn").addEventListener("click", addDivers);
document.getElementById("addForecastBtn").addEventListener("click", addForecastFlow);
document.getElementById("addSnapshotBtn").addEventListener("click", snapshotToday);
els.createMonthlyCloseBtn.addEventListener("click", createMonthlyClose);
[els.monthlyCloseDate, els.monthlySalaryAmount, els.monthlySalaryCurrency, els.monthlyBonusAmount, els.monthlyBonusCurrency, els.monthlyOtherIncomeAmount, els.monthlyOtherIncomeCurrency, els.monthlyCashAdjustmentAmount, els.monthlyCashAdjustmentCurrency].forEach(input => input.addEventListener("input", renderMonthlyClosePreview));
els.monthlyExpenseForm.addEventListener("submit", event => { event.preventDefault(); addMonthlyExpense(); });
els.monthlyCloseBody.addEventListener("click", event => {
  const selected = event.target.closest("[data-monthly-close]");
  const deleted = event.target.closest("[data-delete-monthly-close]");
  if (selected) { activeMonthlyCloseId = selected.dataset.monthlyClose; renderMonthlyReview(); }
  if (deleted) {
    const row = (state.monthlyCloses || []).find(item => item.id === deleted.dataset.deleteMonthlyClose);
    if (row && window.confirm(`Delete the monthly close for ${row.date}?`)) {
      state.monthlyCloses = state.monthlyCloses.filter(item => item.id !== row.id);
      activeMonthlyCloseId = "";
      saveState();
      render();
      setStatus(`Monthly close ${row.date} deleted.`, "warning");
    }
  }
});
els.monthlyExpenseRows.addEventListener("click", event => {
  const button = event.target.closest("[data-delete-monthly-expense]");
  const close = selectedMonthlyClose();
  if (button && close) {
    close.expenses = (close.expenses || []).filter(item => item.id !== button.dataset.deleteMonthlyExpense);
    saveState();
    renderMonthlyReview();
  }
});
document.getElementById("refreshBtn").addEventListener("click", refreshQuotes);
document.getElementById("privacyToggle").addEventListener("click", togglePrivacyMode);
document.getElementById("privacyToggleMenu")?.addEventListener("click", togglePrivacyMode);
function setSearchOpen(open) {
  const header = document.querySelector("header");
  const toggle = document.getElementById("searchToggle");
  header?.classList.toggle("search-open", open);
  toggle?.setAttribute("aria-expanded", String(open));
  if (open) document.getElementById("globalSearch")?.focus();
}
document.getElementById("searchToggle")?.addEventListener("click", () => {
  setSearchOpen(!document.querySelector("header")?.classList.contains("search-open"));
});
document.getElementById("globalSearch")?.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    setSearchOpen(false);
    document.getElementById("searchToggle")?.focus();
  }
});
document.getElementById("globalSearch")?.addEventListener("blur", event => {
  if (!event.target.value && event.relatedTarget?.id !== "searchToggle") setSearchOpen(false);
});
els.kpiModalClose.addEventListener("click", closeKpiDetail);
els.dewsCreditModalClose.addEventListener("click", closeDewsCreditModal);
els.confirmDewsCreditBtn.addEventListener("click", confirmDewsCredit);
els.bondCouponModalClose.addEventListener("click", closeBondCouponModal);
els.editBondCouponAmountBtn.addEventListener("click", toggleBondCouponAmountEdit);
els.confirmBondCouponBtn.addEventListener("click", confirmBondCoupon);
els.sellModalClose.addEventListener("click", closeSellModal);
els.confirmSellBtn.addEventListener("click", confirmSell);
els.sellForm.addEventListener("submit", event => {
  event.preventDefault();
  confirmSell();
});
[els.sellQty, els.sellPrice, els.sellFees].forEach(input => input.addEventListener("input", renderSellPreview));
els.buyModalClose.addEventListener("click", closeBuyModal);
els.confirmBuyBtn.addEventListener("click", confirmBuy);
els.buyForm.addEventListener("submit", event => {
  event.preventDefault();
  confirmBuy();
});
[els.buyQty, els.buyPrice, els.buyFees, els.buyCurrency].forEach(input => input.addEventListener("input", renderBuyPreview));
els.bondSellModalClose.addEventListener("click", closeBondSellModal);
els.confirmBondSellBtn.addEventListener("click", confirmBondSell);
els.bondSellForm.addEventListener("submit", event => {
  event.preventDefault();
  confirmBondSell();
});
[els.bondSellType, els.bondSellNominal, els.bondSellPrice, els.bondSellAccrued, els.bondSellFees].forEach(input => input.addEventListener("input", renderBondSellPreview));
els.cashMovementModalClose.addEventListener("click", closeCashMovementModal);
document.getElementById("confirmCashMovementBtn").addEventListener("click", confirmCashMovement);
els.cashMovementForm.addEventListener("submit", event => {
  event.preventDefault();
  confirmCashMovement();
});
[els.cashMovementType, els.cashMovementAmount, els.cashMovementCurrency].forEach(input => input.addEventListener("input", renderCashMovementPreview));
els.txnEditModalClose.addEventListener("click", closeTxnEditModal);
els.confirmTxnEditBtn.addEventListener("click", confirmTxnEdit);
els.cancelTxnBtn.addEventListener("click", cancelTxnOperation);
els.txnEditForm.addEventListener("submit", event => {
  event.preventDefault();
  confirmTxnEdit();
});
[els.txnEditDate, els.txnEditType, els.txnEditSymbol, els.txnEditName, els.txnEditBank, els.txnEditQty, els.txnEditPrice, els.txnEditCurrency, els.txnEditFees, els.txnEditCostPrice, els.txnEditNote].forEach(input => input.addEventListener("input", renderTxnEditPreview));
[els.journalSearch, els.journalTypeFilter, els.journalBankFilter, els.journalCurrencyFilter, els.journalAssetFilter, els.journalFromDate, els.journalToDate].forEach(input => input?.addEventListener("input", () => { renderJournal(); configureSortableHeaders(); }));
document.getElementById("journalResetBtn").addEventListener("click", resetJournalFilters);
document.getElementById("saveDataBtn").addEventListener("click", saveDataFile);
document.getElementById("loadDataBtn").addEventListener("click", loadDataFile);
els.connectBackupBtn.addEventListener("click", connectBackupDirectory);
els.backupNowBtn.addEventListener("click", backupNow);
document.getElementById("marketSettingsToggle").addEventListener("click", toggleMarketSettings);
document.getElementById("hideKeyBtn").addEventListener("click", () => {
  const isPassword = els.apiKey.type === "password";
  els.apiKey.type = isPassword ? "text" : "password";
  document.getElementById("hideKeyBtn").textContent = isPassword ? "Hide key" : "Show key";
});
els.importFile.addEventListener("change", event => {
  const file = event.target.files[0];
  if (file) importJson(file);
  event.target.value = "";
});
els.apiKey.addEventListener("change", syncSettings);
els.eurUsd.addEventListener("change", () => { syncSettings(); render(); });
els.refreshInterval.addEventListener("change", () => { syncSettings(); render(); });
els.weeklySnapshotDay.addEventListener("change", () => { syncSettings(); renderDataStatus(); scheduleWeeklySnapshots(); });
els.stockExposureBody.addEventListener("click", event => {
  const button = event.target.closest(".expand-btn");
  if (button && button.dataset.symbol) toggleStockExposure(button.dataset.symbol);
});
els.transactionsBody.addEventListener("click", event => {
  const button = event.target.closest(".expand-btn");
  if (button && button.dataset.transactionKey) toggleTransactionGroup(button.dataset.transactionKey);
});
els.bondTransactionsBody?.addEventListener("click", event => {
  const button = event.target.closest(".expand-btn");
  if (button && button.dataset.transactionKey) toggleTransactionGroup(button.dataset.transactionKey);
});
els.cashTransactionsBody?.addEventListener("click", event => {
  const button = event.target.closest(".expand-btn");
  if (button && button.dataset.transactionKey) toggleTransactionGroup(button.dataset.transactionKey);
});
els.banksBody.addEventListener("click", event => {
  const button = event.target.closest(".expand-btn");
  if (button && button.dataset.bank) toggleBank(button.dataset.bank);
});
els.bankCardGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-bank-card]");
  if (button) toggleBank(button.dataset.bankCard);
});
els.bankTableViewBtn.addEventListener("click", () => setBankView("table"));
els.bankCardViewBtn.addEventListener("click", () => setBankView("cards"));
els.bankCardCurrencyEur.addEventListener("click", () => setBankCardCurrency("EUR"));
els.bankCardCurrencyUsd.addEventListener("click", () => setBankCardCurrency("USD"));

function updateBankStickyOffset() {
  const appHeader = document.querySelector("header");
  const offset = appHeader ? Math.ceil(appHeader.getBoundingClientRect().height + 8) : 8;
  document.documentElement.style.setProperty("--bank-sticky-top", `${offset}px`);
  document.documentElement.style.setProperty("--app-header-height", `${Math.max(0, offset - 8)}px`);
  window.requestAnimationFrame(fitMarketTicker);
}

const appHeader = document.querySelector("header");
if (appHeader && window.ResizeObserver) new ResizeObserver(updateBankStickyOffset).observe(appHeader);

window.updateField = updateField;
window.removeRow = removeRow;
window.openSellModal = openSellModal;
window.openBuyModal = openBuyModal;
window.openBondSellModal = openBondSellModal;
window.openTxnEditModal = openTxnEditModal;
window.removeSnapshot = removeSnapshot;
window.addEventListener("resize", () => {
  updateBankStickyOffset();
  window.requestAnimationFrame(fitTopKpiValues);
  const totals = computeTotals();
  drawHistoryChart(state.history || []);
  drawIntradayChart(state.intradaySnapshots || []);
  drawBondCompositionChart();
  drawAllocationDonut(allocationRows(totals), totals.total);
  drawBankChart(sortRows(totalsByBank(), "banksBody"), totals.total);
  const cashSummaryRows = cashSummary().banks.map(row => ({ bank: row.bank, total: row.value }));
  drawBankChart(cashSummaryRows, Math.max(0, cashSummary().totalEur), els.cashBankChart, "No cash by bank to display.");
});
updateDubaiClock();
window.setInterval(updateDubaiClock, 30000);
setTickerPaused(tickerPaused());
ensureStructuredProductsSetup();
render();
updateBankStickyOffset();
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }).catch(error => {
      console.warn("Service worker registration failed", error);
    });
  });
}
restoreConnectedDataFile().finally(() => restoreBackupDirectory());
