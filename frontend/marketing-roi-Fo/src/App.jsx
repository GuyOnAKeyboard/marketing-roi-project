import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer,
} from 'recharts';

// --- Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000'; 

// --- Standard CSS Styles defined as JavaScript Objects (CSS-in-JS) ---
const styles = {
    // Layout Styles
    dashboardLayout: {
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '32px',
        fontFamily: 'Inter, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
    },
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
    },
    // Updated header to be a flex container for responsiveness
    header: {
        marginBottom: '32px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '16px',
        display: 'flex', 
        justifyContent: 'space-between', // Pushes title and filters apart
        alignItems: 'flex-end',
    },
    headerText: {
        // Keeps title and subtitle grouped
    },
    title: {
        fontSize: '30px',
        fontWeight: '800',
        color: '#111827',
        margin: 0,
    },
    subtitle: {
        fontSize: '14px',
        color: '#6b7280',
        margin: '4px 0 0 0',
    },
    // Grid styles for responsiveness 
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)', 
        gap: '24px',
    },
    chartCard: {
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        padding: '24px',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#1f2937',
        borderBottom: '1px solid #f3f4f6',
        paddingBottom: '8px',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '384px',
    },
    rawDataView: {
        height: '256px',
        overflowY: 'auto',
        fontSize: '12px',
        fontFamily: 'monospace',
        backgroundColor: '#f9fafb',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
    },
    dataRow: {
        borderBottom: '1px solid #f3f4f6',
        padding: '4px 0',
        display: 'flex',
        justifyContent: 'space-between',
        color: '#374151',
    },
    // Filter styles (New)
    filterGroup: {
        display: 'flex',
        gap: '8px',
    },
    filterButton: (isSelected) => ({
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: isSelected ? '600' : '500',
        border: isSelected ? '1px solid #10b981' : '1px solid #d1d5db',
        backgroundColor: isSelected ? '#ecfdf5' : 'white',
        color: isSelected ? '#059669' : '#4b5563',
        transition: 'all 0.2s',
        '&:hover': {
            borderColor: '#10b981',
        }
    }),
    // Analysis styles (New)
    analysisMetrics: {
        display: 'flex',
        justifyContent: 'space-around',
        textAlign: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #f3f4f6',
    },
    metricBox: {
        padding: '10px',
        borderRadius: '8px',
    },
    metricValue: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1f2937',
        margin: '0',
    },
    metricLabel: {
        fontSize: '14px',
        color: '#6b7280',
        marginTop: '4px',
    },
    analysisText: {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#374151',
    },
    errorButton: {
        padding: '10px 24px',
        backgroundColor: '#dc2626',
        color: 'white',
        fontWeight: '500',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '16px',
        border: 'none',
    },
};

// --- Helper Components ---

const DashboardLayout = ({ children }) => (
  <div style={styles.dashboardLayout}>
    {/* Injecting keyframes and responsive grid CSS */}
    <style>{`
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        /* Desktop: 3-column grid */
        @media (min-width: 1024px) { 
            .grid-container {
                grid-template-columns: repeat(3, 1fr);
            }
            .wide-chart {
                grid-column: span 2 / span 2;
            }
            .full-span {
                grid-column: span 3 / span 3;
            }
        }
    `}</style>
    <div style={styles.container}>
      {children}
    </div>
  </div>
);

const ChartCard = ({ title, children, className = '' }) => (
  <div className={className} style={{ ...styles.chartCard, minHeight: '400px' }}>
    <h2 style={styles.cardTitle}>{title}</h2>
    {children}
  </div>
);

const LoadingState = () => (
    <div style={styles.loadingContainer}>
        <div style={{...styles.loadingSpinner, borderBottom: '4px solid #1f2937', borderTop: '4px solid transparent', animation: 'spin 1s linear infinite', borderRadius: '50%', height: '48px', width: '48px'}}></div>
        <p style={{marginLeft: '16px', fontSize: '18px', color: '#4b5563'}}>Loading metrics from database...</p>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div style={{...styles.chartCard, minHeight: '400px', gridColumn: 'span 3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <svg style={{width: '48px', height: '48px', color: '#dc2626', marginBottom: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#991b1b', marginBottom: '8px'}}>Data Loading Failed</h2>
        <p style={{color: '#b91c1c', marginBottom: '16px'}}>{message}</p>
        <button 
            onClick={onRetry}
            style={styles.errorButton}
        >
            Retry Fetch
        </button>
    </div>
);

// New component for the platform filter buttons
const FilterButtons = ({ selectedPlatform, setSelectedPlatform }) => (
    <div style={styles.filterGroup}>
        {['All Platforms', 'Facebook', 'Google'].map(platform => (
            <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                style={styles.filterButton(selectedPlatform === platform)}
            >
                {platform}
            </button>
        ))}
    </div>
);

// New component for the dynamic analysis card
const DataAnalysis = ({ metrics }) => {
    // Calculate total metrics from the filtered data
    const totalSpend = metrics.reduce((sum, m) => sum + (m.total_spend || 0), 0);
    const totalClicks = metrics.reduce((sum, m) => sum + (m.total_clicks || 0), 0);
    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    
    let analysisTitle = "Summary Analysis";
    let suggestion = "Review the metrics above to determine your next optimization step. Filtering to a single platform will provide platform-specific insights.";

    if (metrics.length > 0) {
        // Determine the platform currently being analyzed
        const platform = metrics.length === 1 ? metrics[0].platform : 
                         metrics.every(m => m.platform === 'Facebook') ? 'Facebook' :
                         metrics.every(m => m.platform === 'Google') ? 'Google' : 
                         null; // null indicates "All Platforms" view

        
        if (platform === 'Facebook') {
            analysisTitle = "Facebook Campaign Performance Analysis";
            suggestion = avgCPC < 0.5 ? "Your Cost Per Click on Facebook is **excellent**. Focus on scaling your budget while maintaining this low efficiency." : "CPC is increasing. **Test new ad creatives** and refine audience targeting to bring down customer acquisition costs.";
        } else if (platform === 'Google') {
            analysisTitle = "Google Search & Display Analysis";
            suggestion = avgCPC < 1.5 ? "Google's Cost Per Click is healthy. Focus on **improving landing page experience** to boost conversion rates." : "Spend is high relative to clicks. Analyze your Search Impression Share to ensure you aren't bidding on overly competitive or irrelevant terms.";
        } else { // All Platforms selected
            analysisTitle = "Cross-Platform Performance Comparison";
            const facebookMetrics = metrics.filter(m => m.platform === 'Facebook');
            const googleMetrics = metrics.filter(m => m.platform === 'Google');
            const fbSpend = facebookMetrics.reduce((sum, m) => sum + (m.total_spend || 0), 0);
            const goSpend = googleMetrics.reduce((sum, m) => sum + (m.total_spend || 0), 0);
            
            if (fbSpend > goSpend * 1.2) { // Facebook budget is 20% higher
                 suggestion = "You are spending significantly more on **Facebook**. Ensure Facebook's ROI is justifying the budget allocation compared to Google.";
            } else if (goSpend > fbSpend * 1.2) { // Google budget is 20% higher
                 suggestion = "Google currently commands the larger budget. Test moving a portion of the Google budget to Facebook to explore efficiency gains from lower funnel social targeting.";
            } else {
                 suggestion = "Budget allocation is balanced. Look at the **Daily Spend Trend** chart to identify any major shifts or imbalances over time.";
            }
        }
    }

    return (
        <ChartCard title={analysisTitle} className="full-span" style={{ minHeight: 'auto' }}>
            <div style={styles.analysisMetrics}>
                <div style={styles.metricBox}>
                    <p style={styles.metricValue}>${totalSpend.toFixed(2)}</p>
                    <p style={styles.metricLabel}>Total Spend</p>
                </div>
                <div style={styles.metricBox}>
                    <p style={styles.metricValue}>{totalClicks.toLocaleString()}</p>
                    <p style={styles.metricLabel}>Total Clicks</p>
                </div>
                <div style={styles.metricBox}>
                    <p style={styles.metricValue}>${avgCPC.toFixed(3)}</p>
                    <p style={styles.metricLabel}>Avg. Cost Per Click (CPC)</p>
                </div>
            </div>
            <div style={styles.analysisText}>
                <p><strong>Recommendation:</strong> {suggestion}</p>
            </div>
        </ChartCard>
    );
};


/**
 * Main application component for the Marketing ROI War Room dashboard.
 */
const App = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // New state for filter selection
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms'); 

  // Function to fetch data (runs only on mount)
  const fetchData = useCallback(async () => {
    console.log('--- API CALL TRIGGERED ---');
    setLoading(true);
    setError(null);
    try {
      // Exponential backoff logic for API call
      let response;
      const maxRetries = 3;
      for (let i = 0; i < maxRetries; i++) {
        response = await fetch(`${API_BASE_URL}/api/metrics`);
        if (response.ok) break;
        if (i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      if (!response || !response.ok) {
        throw new Error(`HTTP error! status: ${response ? response.status : 'Network error'}`);
      }
      const data = await response.json();
      setMetrics(data.metrics || []); 
    } catch (e) {
      console.error("Failed to fetch metrics:", e);
      setError(`Failed to load data. Is the backend API running on ${API_BASE_URL}? Console error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchData();
  }, []); 


  // --- Data Filtering and Transformation (Updated to use selectedPlatform) ---
  const filteredMetrics = useMemo(() => {
    if (selectedPlatform === 'All Platforms') {
      return metrics;
    }
    // Filter the raw data by the selected platform
    return metrics.filter(m => m.platform === selectedPlatform);
  }, [metrics, selectedPlatform]);


  const { spendData, clicksData } = useMemo(() => {
    const groupedByDate = filteredMetrics.reduce((acc, current) => {
      if (!acc[current.date]) {
        acc[current.date] = { date: current.date };
      }
      // Line chart data structure
      if (selectedPlatform === 'All Platforms') {
          // Use platform-specific keys for the combined view
          if (current.platform === 'Facebook') {
            acc[current.date].facebook_spend = current.total_spend;
            acc[current.date].facebook_clicks = current.total_clicks;
          } else if (current.platform === 'Google') {
            acc[current.date].google_spend = current.total_spend;
            acc[current.date].google_clicks = current.total_clicks;
          }
      } else { 
          // Use generic keys for single platform view
          acc[current.date].Spend = (acc[current.date].Spend || 0) + current.total_spend; // Sum multiple days if present (shouldn't happen with filtered data)
          acc[current.date].Clicks = (acc[current.date].Clicks || 0) + current.total_clicks;
      }
      return acc;
    }, {});

    const chartData = Object.values(groupedByDate).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Clicks Comparison (Bar Chart) logic 
    let clicksComparison = [];
    if (selectedPlatform === 'All Platforms') {
        const totalClicks = filteredMetrics.reduce(
            (acc, day) => {
                acc[day.platform] = (acc[day.platform] || 0) + (day.total_clicks || 0);
                return acc;
            },
            {}
        );
        clicksComparison = [
            { platform: 'Facebook', clicks: totalClicks['Facebook'] || 0 },
            { platform: 'Google', clicks: totalClicks['Google'] || 0 },
        ];
    } else {
        // If filtered, show total clicks for that platform only
        const totalClicks = filteredMetrics.reduce((sum, m) => sum + (m.total_clicks || 0), 0);
        clicksComparison = [{ platform: selectedPlatform, clicks: totalClicks }];
    }

    return { spendData: chartData, clicksData: clicksComparison };
  }, [filteredMetrics, selectedPlatform]);


  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={fetchData} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerText}>
            <h1 style={styles.title}>Marketing ROI Difference</h1>
            <p style={styles.subtitle}>Unified Metrics from Facebook & Google Ads</p>
          </div>
          {/* Filter Buttons added here */}
          <FilterButtons selectedPlatform={selectedPlatform} setSelectedPlatform={setSelectedPlatform} />
        </header>

        {/* Apply the CSS class 'grid-container' for responsive styling defined in the <style> tag */}
        <div style={styles.grid} className="grid-container">
          
          {/* Card 1: Analysis & Suggestions (New Card) */}
          <DataAnalysis metrics={filteredMetrics} />

          {/* Card 2: Total Daily Spend Comparison (Line Chart) */}
          <ChartCard title={`Daily Spend Trend (USD) - ${selectedPlatform}`} className="wide-chart">
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={spendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  interval="preserveEnd" 
                  tickFormatter={date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                  style={{ fontSize: '10px' }} 
                />
                <YAxis tickFormatter={value => `$${(value / 1000).toFixed(0)}k`} /> 
                <Tooltip 
                    formatter={(value, name) => [`$${value.toFixed(2)}`, name.includes('facebook') ? 'Facebook Spend' : name.includes('google') ? 'Google Spend' : 'Daily Spend']} 
                />
                <Legend />
                {/* Dynamically render lines based on filter */}
                {selectedPlatform === 'All Platforms' ? (
                    <>
                        <Line type="monotone" dataKey="facebook_spend" name="Facebook Spend" stroke="#4c79d3" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="google_spend" name="Google Spend" stroke="#e3372c" strokeWidth={2} dot={false} />
                    </>
                ) : (
                    <Line type="monotone" dataKey="Spend" name={`${selectedPlatform} Spend`} stroke={selectedPlatform === 'Facebook' ? '#4c79d3' : '#e3372c'} strokeWidth={3} dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Card 3: Total Clicks Comparison (Bar Chart) */}
          <ChartCard title={`Total Clicks - ${selectedPlatform === 'All Platforms' ? 'Comparison' : selectedPlatform}`}>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={clicksData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} Clicks`, 'Total Clicks']} />
                <Bar dataKey="clicks" name="Total Clicks" radius={[4, 4, 0, 0]}>
                  {clicksData.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.platform === 'Facebook' ? '#4c79d3' : entry.platform === 'Google' ? '#e3372c' : '#059669'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          
          {/* Card 4: Raw Data View (Now uses filteredMetrics) */}
          <ChartCard title={`Raw Aggregated Data Sample (${selectedPlatform})`} className="full-span">
              <div style={styles.rawDataView}>
                  {filteredMetrics.slice(0, 10).map((row, index) => (
                      <div key={index} style={styles.dataRow}>
                          <span>Date: <span style={{ fontWeight: 'bold', color: '#111827' }}>{row.date}</span></span>
                          <span>Platform: <span style={{ color: '#4b5563' }}>{row.platform}</span></span>
                          <span>Spend: <span style={{ color: '#059669', fontWeight: 'bold' }}>${row.total_spend.toFixed(2)}</span></span>
                          <span>Clicks: <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{row.total_clicks}</span></span>
                      </div>
                  ))}
                  {filteredMetrics.length > 10 && <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#6b7280', paddingTop: '8px' }}>... Showing first 10 of {filteredMetrics.length} records.</div>}
                  {filteredMetrics.length === 0 && <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#6b7280', paddingTop: '8px' }}>No data available for {selectedPlatform}.</div>}
              </div>
          </ChartCard>
        </div>
        
        {/* Footer Section */}
        <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>Data pipeline: ETL (Python) → DB (Neon) → API (FastAPI) → Frontend (React).</p>
        <p style={{ marginTop: '8px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
            &copy; {new Date().getFullYear()} Aniruddha Ganguly. All rights reserved.
        </p>
      </div>
    </DashboardLayout>
  );
};


export default App;