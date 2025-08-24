import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Calculator, TrendingUp, DollarSign, Calendar, AlertCircle, Info, Brain, Upload, FileText } from 'lucide-react';

const RetirementPlanner = () => {
  const [inputs, setInputs] = useState({
    currentAge: 50,
    retirementAge: 62,
    currentSavings: 1000000,
    monthlyContribution: 3000,
    expectedReturn: 6,
    inflationRate: 3,
    retirementExpenses: 10000,
    socialSecurity: 4000,
    safeWithdrawalRate: 4
  });

  const [errors, setErrors] = useState({});
  const [aiInsights, setAiInsights] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [AIConnected, setAIConnected] = useState(false);
  const API_KEY = '';
  const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const API_MODEL = 'llama-3.1-8b-instant';
  
  // Financial data from your images
  const [financialData, setFinancialData] = useState({
    netWorth: 1000000,
    netWorthGrowth: 6000, // 6 month growth
    spending2024: 89000.30,
    spending2023: 12990.88,
    hasRealData: true
  });

  const validateInputs = (newInputs) => {
    const newErrors = {};
    
    if (newInputs.currentAge < 18 || newInputs.currentAge > 80) {
      newErrors.currentAge = 'Age must be between 18 and 80';
    }
    
    if (newInputs.retirementAge <= newInputs.currentAge) {
      newErrors.retirementAge = 'Retirement age must be greater than current age';
    }
    
    if (newInputs.currentSavings < 0) {
      newErrors.currentSavings = 'Current savings cannot be negative';
    }
    
    if (newInputs.monthlyContribution < 0) {
      newErrors.monthlyContribution = 'Monthly contribution cannot be negative';
    }
    
    if (newInputs.expectedReturn < 0 || newInputs.expectedReturn > 20) {
      newErrors.expectedReturn = 'Expected return should be between 0% and 20%';
    }
    
    if (newInputs.inflationRate < 0 || newInputs.inflationRate > 10) {
      newErrors.inflationRate = 'Inflation rate should be between 0% and 10%';
    }
    
    if (newInputs.safeWithdrawalRate < 1 || newInputs.safeWithdrawalRate > 10) {
      newErrors.safeWithdrawalRate = 'Safe withdrawal rate should be between 1% and 10%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    const newInputs = { ...inputs, [field]: numValue };
    setInputs(newInputs);
    validateInputs(newInputs);
  };

  // Check AI connection
  const checkAIConnection = async () => {
    setAIConnected(true);
    return true; // Simulate connection check
   
  };

  // Get AI insights using AI
  const getAIInsights = async () => {
    setIsLoadingAI(true);
    console.log('Godan 1')
    try {
      // Check connection first
      const connected = await checkAIConnection();
      if (!connected) {
        setAiInsights('❌ AI not connected. Please ensure AI is running.\n\nTo start AI:\n1. Download from https://AI.ai\n2. Run: AI serve\n3. Pull a model: AI pull llama2');
        setIsLoadingAI(false);
        return;
      }
      console.log('Godan 2')

        const prompt = `You are a financial advisor AI analyzing retirement planning data. Based on the following information, provide personalized insights and recommendations:

        CURRENT FINANCIAL SITUATION:
        - Net Worth: $${financialData.netWorth.toLocaleString()}
        - Net Worth Growth (6 months): +$${financialData.netWorthGrowth.toLocaleString()}
        - 2024 Spending: $${financialData.spending2024.toLocaleString()}
        - 2023 Spending: $${financialData.spending2023.toLocaleString()}

        RETIREMENT PLANNING INPUTS:
        - Current Age: ${inputs.currentAge}
        - Retirement Age: ${inputs.retirementAge}
        - Current Savings: $${inputs.currentSavings.toLocaleString()}
        - Monthly Contribution: $${inputs.monthlyContribution}
        - Expected Return: ${inputs.expectedReturn}%
        - Expected Monthly Retirement Expenses: $${inputs.retirementExpenses}

        Please provide:
        1. Analysis of current financial trajectory
        2. Specific recommendations for retirement planning
        3. Assessment of spending patterns and their impact
        4. Actionable steps to optimize retirement readiness
        5. Risk factors and opportunities

        Keep response concise but insightful (max 500 words).`;

      const requestBody = {
        messages: [{
          role: 'user',
          content: prompt,
        }],
        // Using a popular and fast Groq-hosted model.
        model: API_MODEL,
      };
      console.log('requestBody:', requestBody);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      console.log('requestBody:', requestBody);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAiInsights(data.choices[0].message.content || 'No insights generated.');
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setAiInsights(`❌ Error connecting to AI: ${error.message}\n\nPlease ensure:\n1. AI is installed and running\n2. A model is available (try: AI pull llama2)\n3. AI is accessible on localhost:11434`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Use real financial data for calculations
  const enhancedInputs = useMemo(() => {
    if (financialData.hasRealData) {
      return {
        ...inputs,
        currentSavings: financialData.netWorth,
        retirementExpenses: Math.round((financialData.spending2024 + financialData.spending2023) / 2 / 12) // Average monthly
      };
    }
    return inputs;
  }, [inputs, financialData]);

  const calculations = useMemo(() => {
    if (!validateInputs(enhancedInputs)) {
      return null;
    }

    const {
      currentAge,
      retirementAge,
      currentSavings,
      monthlyContribution,
      expectedReturn,
      inflationRate,
      retirementExpenses,
      socialSecurity,
      safeWithdrawalRate
    } = enhancedInputs;

    const yearsToRetirement = retirementAge - currentAge;
    const monthlyReturnRate = expectedReturn / 100 / 12;
    const totalMonths = yearsToRetirement * 12;

    // Future value of current savings
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetirement);

    // Future value of monthly contributions (annuity)
    const futureValueContributions = monthlyContribution * 
      (Math.pow(1 + monthlyReturnRate, totalMonths) - 1) / monthlyReturnRate;

    const totalRetirementSavings = futureValueCurrentSavings + futureValueContributions;

    // Adjust for inflation
    const inflationAdjustedExpenses = retirementExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    const inflationAdjustedSocialSecurity = socialSecurity * Math.pow(1 + inflationRate / 100, yearsToRetirement);

    const netMonthlyNeed = inflationAdjustedExpenses - inflationAdjustedSocialSecurity;
    const requiredSavings = (netMonthlyNeed * 12) / (safeWithdrawalRate / 100);

    const surplus = totalRetirementSavings - requiredSavings;
    const isOnTrack = surplus >= 0;

    // Generate yearly projection data
    const projectionData = [];
    let currentBalance = currentSavings;
    
    for (let year = 0; year <= yearsToRetirement; year++) {
      const age = currentAge + year;
      const yearlyReturn = currentBalance * (expectedReturn / 100);
      const yearlyContributions = monthlyContribution * 12;
      
      if (year > 0) {
        currentBalance = currentBalance + yearlyReturn + yearlyContributions;
      }
      
      projectionData.push({
        age,
        year,
        balance: Math.round(currentBalance),
        contributions: Math.round(yearlyContributions * year),
        returns: Math.round(currentBalance - currentSavings - (yearlyContributions * year))
      });
    }

    return {
      yearsToRetirement,
      totalRetirementSavings: Math.round(totalRetirementSavings),
      requiredSavings: Math.round(requiredSavings),
      surplus: Math.round(surplus),
      isOnTrack,
      monthlyIncomeAtRetirement: Math.round(totalRetirementSavings * (safeWithdrawalRate / 100) / 12),
      inflationAdjustedExpenses: Math.round(inflationAdjustedExpenses),
      projectionData,
      totalContributions: Math.round(monthlyContribution * 12 * yearsToRetirement),
      totalReturns: Math.round(totalRetirementSavings - currentSavings - (monthlyContribution * 12 * yearsToRetirement))
    };
  }, [enhancedInputs]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    wrapper: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#1a1a1a',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    subtitle: {
      color: '#666',
      fontSize: '1.1rem'
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '24px',
      marginBottom: '24px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    inputGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    inputGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '4px'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '2px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#ef4444'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '0.75rem',
      marginTop: '4px'
    },
    statusCard: {
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '16px',
      border: '2px solid'
    },
    statusSuccess: {
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      color: '#166534'
    },
    statusError: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      color: '#dc2626'
    },
    statusTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    metricCard: {
      padding: '16px',
      borderRadius: '8px'
    },
    metricTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '4px'
    },
    metricValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    aiCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      gridColumn: 'span 3'
    },
    aiButton: {
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
      transition: 'background-color 0.2s'
    },
    aiInsights: {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      minHeight: '200px',
      whiteSpace: 'pre-wrap',
      fontFamily: 'monospace',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    realDataBadge: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
      marginLeft: '8px'
    },
    dataOverview: {
      backgroundColor: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    },
    dataTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#0369a1',
      marginBottom: '8px'
    },
    dataRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '4px',
      fontSize: '13px'
    },
    chartCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      gridColumn: 'span 3'
    },
    errorContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      color: '#666'
    },
    connectedIndicator: {
      color: '#10b981',
      fontSize: '12px'
    }
  };

  const renderAICardTitle = () => {
    return (
      <div style={styles.cardTitle}>
        <Brain size={24} color="#8b5cf6" />
        AI Financial Advisor
        {AIConnected && (
          <span style={styles.connectedIndicator}>● Connected</span>
        )}
      </div>
    );
  };

  const renderRealDataBadge = () => {
    if (financialData.hasRealData) {
      return <span style={styles.realDataBadge}>REAL DATA</span>;
    }
    return null;
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Calculator size={40} color="#3b82f6" />
            AI-Enhanced Retirement Planner
            {renderRealDataBadge()}
          </h1>
          <p style={styles.subtitle}>Intelligent retirement planning with AI insights based on your actual financial data</p>
        </div>

        <div style={styles.mainGrid}>
          {/* Input Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <DollarSign size={24} color="#10b981" />
              Planning Inputs
            </h2>

            {financialData.hasRealData && (
              <div style={styles.dataOverview}>
                <div style={styles.dataTitle}>Your Financial Snapshot</div>
                <div style={styles.dataRow}>
                  <span>Net Worth:</span>
                  <span><strong>{formatCurrency(financialData.netWorth)}</strong></span>
                </div>
                <div style={styles.dataRow}>
                  <span>6-Month Growth:</span>
                  <span style={{color: '#10b981'}}>+{formatCurrency(financialData.netWorthGrowth)}</span>
                </div>
                <div style={styles.dataRow}>
                  <span>2024 Spending:</span>
                  <span>{formatCurrency(financialData.spending2024)}</span>
                </div>
              </div>
            )}

            <div style={styles.inputGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Current Age</label>
                <input
                  type="number"
                  value={inputs.currentAge}
                  onChange={(e) => handleInputChange('currentAge', e.target.value)}
                  style={{
                    ...styles.input,
                    ...(errors.currentAge ? styles.inputError : {})
                  }}
                />
                {errors.currentAge && (
                  <p style={styles.errorText}>{errors.currentAge}</p>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Retirement Age</label>
                <input
                  type="number"
                  value={inputs.retirementAge}
                  onChange={(e) => handleInputChange('retirementAge', e.target.value)}
                  style={{
                    ...styles.input,
                    ...(errors.retirementAge ? styles.inputError : {})
                  }}
                />
                {errors.retirementAge && (
                  <p style={styles.errorText}>{errors.retirementAge}</p>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Monthly Contribution ($)</label>
                <input
                  type="number"
                  value={inputs.monthlyContribution}
                  onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                  style={{
                    ...styles.input,
                    ...(errors.monthlyContribution ? styles.inputError : {})
                  }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Expected Return (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.expectedReturn}
                  onChange={(e) => handleInputChange('expectedReturn', e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Inflation Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.inflationRate}
                  onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Social Security ($)</label>
                <input
                  type="number"
                  value={inputs.socialSecurity}
                  onChange={(e) => handleInputChange('socialSecurity', e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <TrendingUp size={24} color="#3b82f6" />
              Retirement Projection
            </h2>

            {calculations ? (
              <div>
                <div style={{
                  ...styles.statusCard,
                  ...(calculations.isOnTrack ? styles.statusSuccess : styles.statusError)
                }}>
                  <div style={styles.statusTitle}>
                    {calculations.isOnTrack ? (
                      <React.Fragment>
                        <TrendingUp size={20} />
                        <span>Excellent Position!</span>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <AlertCircle size={20} />
                        <span>Needs Optimization</span>
                      </React.Fragment>
                    )}
                  </div>
                  <p>
                    {calculations.isOnTrack 
                      ? `Surplus: ${formatCurrency(Math.abs(calculations.surplus))}`
                      : `Shortfall: ${formatCurrency(Math.abs(calculations.surplus))}`
                    }
                  </p>
                </div>

                <div style={styles.metricsGrid}>
                  <div style={{ ...styles.metricCard, backgroundColor: '#dbeafe' }}>
                    <h3 style={{ ...styles.metricTitle, color: '#1e40af' }}>Total at Retirement</h3>
                    <p style={{ ...styles.metricValue, color: '#1d4ed8' }}>
                      {formatCurrency(calculations.totalRetirementSavings)}
                    </p>
                  </div>

                  <div style={{ ...styles.metricCard, backgroundColor: '#f3e8ff' }}>
                    <h3 style={{ ...styles.metricTitle, color: '#7c2d12' }}>Required Savings</h3>
                    <p style={{ ...styles.metricValue, color: '#a855f7' }}>
                      {formatCurrency(calculations.requiredSavings)}
                    </p>
                  </div>

                  <div style={{ ...styles.metricCard, backgroundColor: '#e0e7ff' }}>
                    <h3 style={{ ...styles.metricTitle, color: '#3730a3' }}>Monthly Income</h3>
                    <p style={{ ...styles.metricValue, color: '#6366f1' }}>
                      {formatCurrency(calculations.monthlyIncomeAtRetirement)}
                    </p>
                  </div>

                  <div style={{ ...styles.metricCard, backgroundColor: '#f9fafb' }}>
                    <h3 style={{ ...styles.metricTitle, color: '#374151' }}>Years to Retirement</h3>
                    <p style={{ ...styles.metricValue, color: '#4b5563' }}>
                      {calculations.yearsToRetirement}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.errorContainer}>
                <AlertCircle size={24} color="#666" style={{ marginRight: '8px' }} />
                Please correct input errors to see projections.
              </div>
            )}
          </div>

          {/* AI Insights Section */}
          <div style={styles.card}>
            {renderAICardTitle()}

            <button
              style={{
                ...styles.aiButton,
                ...(isLoadingAI ? {opacity: 0.7, cursor: 'not-allowed'} : {})
              }}
              onClick={getAIInsights}
              disabled={isLoadingAI}
              onMouseOver={(e) => !isLoadingAI && (e.target.style.backgroundColor = '#7c3aed')}
              onMouseOut={(e) => !isLoadingAI && (e.target.style.backgroundColor = '#8b5cf6')}
            >
              <Brain size={16} />
              {isLoadingAI ? 'Analyzing...' : 'Get AI Insights'}
            </button>

            <div style={styles.aiInsights}>
              {aiInsights || 'Click "Get AI Insights" for personalized financial analysis using your actual data.\n\nThe AI will analyze:\n• Your net worth trajectory\n• Spending patterns and trends\n• Retirement readiness\n• Specific recommendations\n• Risk assessment\n\nRequires AI running locally.'}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {calculations && (
          <div style={styles.chartCard}>
            <h2 style={styles.cardTitle}>
              <Calendar size={24} color="#10b981" />
              Wealth Growth Projection
            </h2>
            
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calculations.projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="age" 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), name]}
                    labelFormatter={(age) => `Age: ${age}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Total Portfolio"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetirementPlanner;