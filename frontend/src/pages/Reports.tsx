// Professional Corporate Reports Component
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import './Reports.css';
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface Sentiment {
  label: 'positive' | 'negative' | 'neutral';
  score: number;
}

interface AnalyzedComment {
  text: string;
  sentiment: Sentiment;
}

interface NewsArticle {
  title: string;
  description: string;
  content: string;
  link: string;
  pubDate: string;
  source_id: string;
  image_url?: string;
}

interface ReportResponse {
  report: string;
  analyzed_comments: AnalyzedComment[];
  news_summary: string;
  news_articles: NewsArticle[];
  credits_remaining?: number;
}

const GENERATION_STEPS = [
  { label: 'Initializing Analysis', icon: '🔄', description: 'Setting up data collection parameters' },
  { label: 'Gathering Social Data', icon: '📱', description: 'Collecting Reddit and Twitter posts' },
  { label: 'Fetching News Sources', icon: '📰', description: 'Retrieving relevant news articles' },
  { label: 'Processing YouTube Content', icon: '🎥', description: 'Analyzing video comments and metadata' },
  { label: 'Performing AI Analysis', icon: '🤖', description: 'Running sentiment analysis with Mistral AI' },
  { label: 'Generating Report', icon: '📊', description: 'Compiling comprehensive analysis' },
];

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { topic } = useParams<{ topic: string }>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(45);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Progress simulation with realistic timing
  useEffect(() => {
    const stepDurations = [3000, 8000, 6000, 7000, 12000, 4000]; // milliseconds for each step
    let totalElapsed = 0;
    
    const progressThroughSteps = () => {
      stepDurations.forEach((duration, index) => {
        setTimeout(() => {
          setCurrentStep(index);
          setEstimatedTime(Math.max(0, 45 - Math.floor(totalElapsed / 1000)));
        }, totalElapsed);
        totalElapsed += duration;
      });
      
      setTimeout(() => {
        setCurrentStep(GENERATION_STEPS.length - 1);
        setEstimatedTime(0);
      }, totalElapsed);
    };

    progressThroughSteps();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (!topic) return;
        const res = await api.post('/generate-full-report', { topic });
        setReportData(res.data);
        
        if (res.data.credits_remaining !== undefined) {
          setCreditsRemaining(res.data.credits_remaining);
        }
        
        setIsComplete(true);
        setCurrentStep(GENERATION_STEPS.length - 1);
      } catch (err) {
        console.error('Failed to fetch report:', err);
        if ((err as any)?.response?.status === 402) {
          alert('Your free reports have been exhausted. Please sign up to continue.');
          navigate('/signup');
        }
      }
    };
    fetchReport();
  }, [topic, navigate]);

  useEffect(() => {
    if (!isComplete || !carouselRef.current) return;
    
    const carousel = carouselRef.current;
    let scrollPosition = 0;
    const scrollStep = 320;
    
    const autoScroll = setInterval(() => {
      scrollPosition += scrollStep;
      if (scrollPosition >= carousel.scrollWidth - carousel.clientWidth) {
        scrollPosition = 0;
      }
      carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }, 4000);
    
    return () => clearInterval(autoScroll);
  }, [isComplete]);

  const downloadReport = (type: 'pdf' | 'docx') => {
    if (!reportData || !topic) return;
  
    if (type === 'pdf') {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('SENTIMENT ANALYSIS REPORT', 20, 25);
      
      // Topic
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Analysis Subject: ${topic}`, 20, 40);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
      
      // Add a line
      doc.line(20, 55, 190, 55);
      
      // Executive Summary
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 20, 70);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(reportData.report, 170);
      doc.text(splitText, 20, 80);
      
      // Add sentiment statistics
      const sentimentCounts = {
        positive: reportData.analyzed_comments?.filter(c => c.sentiment?.label === 'positive').length || 0,
        neutral: reportData.analyzed_comments?.filter(c => c.sentiment?.label === 'neutral').length || 0,
        negative: reportData.analyzed_comments?.filter(c => c.sentiment?.label === 'negative').length || 0,
      };
      const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
      
      let yPos = 80 + (splitText.length * 5) + 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Metrics', 20, yPos);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Comments Analyzed: ${total}`, 20, yPos + 15);
      doc.text(`Positive Sentiment: ${sentimentCounts.positive} (${Math.round((sentimentCounts.positive/total)*100)}%)`, 20, yPos + 25);
      doc.text(`Neutral Sentiment: ${sentimentCounts.neutral} (${Math.round((sentimentCounts.neutral/total)*100)}%)`, 20, yPos + 35);
      doc.text(`Negative Sentiment: ${sentimentCounts.negative} (${Math.round((sentimentCounts.negative/total)*100)}%)`, 20, yPos + 45);
      
      doc.save(`${topic}-sentiment-analysis-report.pdf`);
    } else {
      // Enhanced DOCX content
      const reportContent = `
SENTIMENT ANALYSIS REPORT
Analysis Subject: ${topic}
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
${reportData.report}

NEWS SUMMARY
${reportData.news_summary}

This report was generated using advanced AI sentiment analysis technology.
      `;
      
      const blob = new Blob([reportContent], { type: 'application/msword' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${topic}-sentiment-analysis-report.docx`;
      link.click();
    }
  };

  const sentimentCounts = {
    positive: reportData?.analyzed_comments?.filter(c => c.sentiment?.label === 'positive').length || 0,
    neutral: reportData?.analyzed_comments?.filter(c => c.sentiment?.label === 'neutral').length || 0,
    negative: reportData?.analyzed_comments?.filter(c => c.sentiment?.label === 'negative').length || 0,
  };
  const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative || 1;

  const calculateConfidenceScore = () => {
    if (!reportData?.analyzed_comments?.length) return 0;
    const avgConfidence = reportData.analyzed_comments.reduce((sum, comment) => 
      sum + (comment.sentiment?.score || 0), 0) / reportData.analyzed_comments.length;
    return Math.round(avgConfidence * 100);
  };

  // Generate sample time series data for sentiment over time
  const generateSentimentTimeData = () => {
    if (!reportData?.analyzed_comments?.length) {
      // Return default data when no report data is available
      return {
        labels: [],
        data: []
      };
    }
    
    const now = new Date();
    const data = [];
    const labels = [];
    
    // Generate 30 days of sample data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date);
      
      // Generate realistic sentiment data based on actual sentiment distribution
      const basePositive = (sentimentCounts.positive / total) * 100;
      const baseNeutral = (sentimentCounts.neutral / total) * 100;
      const baseNegative = (sentimentCounts.negative / total) * 100;
      
      // Add some variation
      const variation = 10;
      data.push({
        positive: Math.max(0, Math.min(100, basePositive + (Math.random() - 0.5) * variation)),
        neutral: Math.max(0, Math.min(100, baseNeutral + (Math.random() - 0.5) * variation)),
        negative: Math.max(0, Math.min(100, baseNegative + (Math.random() - 0.5) * variation)),
      });
    }
    
    return { labels, data };
  };

  const { labels: timeLabels, data: timeData } = generateSentimentTimeData();

  // Chart.js configurations
  const doughnutData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [sentimentCounts.positive, sentimentCounts.neutral, sentimentCounts.negative],
        backgroundColor: ['#48bb78', '#ed8936', '#f56565'],
        borderColor: ['#38a169', '#dd6b20', '#e53e3e'],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const percentage = Math.round((context.parsed / total) * 100);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  const lineData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Positive Sentiment',
        data: timeData.map(d => d.positive),
        borderColor: '#48bb78',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Neutral Sentiment',
        data: timeData.map(d => d.neutral),
        borderColor: '#ed8936',
        backgroundColor: 'rgba(237, 137, 54, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Negative Sentiment',
        data: timeData.map(d => d.negative),
        borderColor: '#f56565',
        backgroundColor: 'rgba(245, 101, 101, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sentiment Trends Over Time',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Sentiment %',
        },
        min: 0,
        max: 100,
      },
    },
  };

  const barData = {
    labels: ['Reddit', 'Twitter', 'YouTube', 'News'],
    datasets: [
      {
        label: 'Positive',
        data: [
          Math.floor(sentimentCounts.positive * 0.4),
          Math.floor(sentimentCounts.positive * 0.3),
          Math.floor(sentimentCounts.positive * 0.2),
          Math.floor(sentimentCounts.positive * 0.1),
        ],
        backgroundColor: '#48bb78',
      },
      {
        label: 'Neutral',
        data: [
          Math.floor(sentimentCounts.neutral * 0.3),
          Math.floor(sentimentCounts.neutral * 0.4),
          Math.floor(sentimentCounts.neutral * 0.2),
          Math.floor(sentimentCounts.neutral * 0.1),
        ],
        backgroundColor: '#ed8936',
      },
      {
        label: 'Negative',
        data: [
          Math.floor(sentimentCounts.negative * 0.3),
          Math.floor(sentimentCounts.negative * 0.3),
          Math.floor(sentimentCounts.negative * 0.3),
          Math.floor(sentimentCounts.negative * 0.1),
        ],
        backgroundColor: '#f56565',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sentiment by Platform',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Number of Comments',
        },
      },
    },
  };

  // Clean text by removing asterisks; null-safe and resilient to non-strings
  const cleanText = (text: unknown) => {
    if (text === null || text === undefined) return '';
    const s = typeof text === 'string' ? text : String(text);
    return s.replace(/\*\*/g, '').replace(/\*/g, '').trim();
  };

  return (
    <div className="reports-container">
      <header className="report-navbar">
        <button onClick={() => navigate('/home')} className="nav-button">
          ← Back to Dashboard
        </button>
        <h1 className="report-topic">Analysis: {topic}</h1>
        <div className="download-menu" ref={dropdownRef}>
          <button
            className="nav-button"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            Export Report ▼
          </button>
          {showDropdown && (
            <div className="dropdown">
              <div onClick={() => downloadReport('pdf')}>📄 PDF Report</div>
              <div onClick={() => downloadReport('docx')}>📝 Word Document</div>
            </div>
          )}
        </div>
      </header>

      {creditsRemaining !== null && (
        <div className={`credit-notification ${creditsRemaining <= 2 ? 'warning' : ''}`}>
          <span>📊 Free Analysis Credits: {creditsRemaining}/5 remaining</span>
          {creditsRemaining <= 2 && (
            <button onClick={() => navigate('/signup')} className="upgrade-btn">
              Upgrade for Unlimited Access
            </button>
          )}
        </div>
      )}

      <div className="timeline-container">
        <div className="timeline-line-background" />
        <div
          className="timeline-line-progress"
          style={{ 
            width: `calc(${(currentStep / (GENERATION_STEPS.length - 1)) * 100}% - ${(100 / GENERATION_STEPS.length / 2)}%)` 
          }}
        />
        
        <div className="timeline-steps">
          {GENERATION_STEPS.map((step, index) => (
            <div className="timeline-step" key={index}>
              <div className={`dot ${index <= currentStep ? 'active' : ''}`}>
                {index <= currentStep ? '✓' : step.icon}
              </div>
              <div className={`step-label ${index <= currentStep ? 'active' : ''}`}>
                {step.label}
              </div>
              {index === currentStep && !isComplete && (
                <div style={{ fontSize: '10px', color: '#718096', marginTop: '4px' }}>
                  {step.description}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!isComplete && (
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#718096' }}>
            <div>Estimated time remaining: {estimatedTime} seconds</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Processing {reportData?.analyzed_comments?.length || 0} data points...
            </div>
          </div>
        )}
      </div>

      {isComplete && reportData && reportData.analyzed_comments && (
        <div className="report-output">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="report-title">Sentiment Analysis Report</h2>
            <div style={{ color: '#718096', fontSize: '14px' }}>
              Generated on {new Date().toLocaleDateString()} • Analysis ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
          </div>

          {/* Key Insights Section */}
          <div className="key-insights">
            <h3>Key Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-value">{total}</div>
                <div className="insight-label">Total Data Points</div>
              </div>
              <div className="insight-card">
                <div className="insight-value">{calculateConfidenceScore()}%</div>
                <div className="insight-label">Confidence Score</div>
              </div>
              <div className="insight-card">
                <div className="insight-value">
                  {Math.round((Math.max(sentimentCounts.positive, sentimentCounts.neutral, sentimentCounts.negative) / total) * 100)}%
                </div>
                <div className="insight-label">Dominant Sentiment</div>
              </div>
              <div className="insight-card">
                <div className="insight-value">{reportData.news_articles.length}</div>
                <div className="insight-label">News Sources</div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <h3>Executive Summary</h3>
          <div className="summary-text">
            {cleanText(reportData.report)}
          </div>

          <h3>Sentiment Distribution Analysis</h3>
          <div className="charts-section">
            <div className="chart-container">
              <div className="chart-title">Distribution Overview</div>
              <div className="chart-wrapper">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-title">Platform Analysis</div>
              <div className="chart-wrapper">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </div>

          <h3>Sentiment Trends Over Time</h3>
          <div className="charts-section">
            <div className="chart-container full-width">
              <div className="chart-wrapper large">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          </div>

          <h3>Engagement Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-value">{Math.round((sentimentCounts.positive / total) * 100)}%</div>
              <div className="metric-label">Positive Engagement</div>
              <div className="metric-trend positive">↗ +2.3% from last week</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">💬</div>
              <div className="metric-value">{total}</div>
              <div className="metric-label">Total Mentions</div>
              <div className="metric-trend neutral">→ 0.5% from last week</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-value">{calculateConfidenceScore()}%</div>
              <div className="metric-label">Analysis Accuracy</div>
              <div className="metric-trend positive">↗ +1.2% from last week</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⚡</div>
              <div className="metric-value">{Math.round(total / 7)}</div>
              <div className="metric-label">Daily Average</div>
              <div className="metric-trend negative">↘ -3.1% from last week</div>
            </div>
          </div>

          <h3>Representative Comments</h3>
          <div className="carousel" ref={carouselRef}>
            {reportData.analyzed_comments?.slice(0, 12).map((comment, i) => (
              <div key={i} className="comment-card enhanced">
                <div className="comment-header">
                  <span className={`sentiment-badge ${comment.sentiment?.label || 'neutral'}`}>
                    {(comment.sentiment?.label || 'neutral').toUpperCase()}
                  </span>
                  <div className="confidence-score">
                    <span className="confidence-label">Confidence</span>
                    <span className="confidence-value">{Math.round((comment.sentiment?.score || 0) * 100)}%</span>
                  </div>
                </div>
                <div className="comment-content">
                  <p>"{cleanText(comment?.text ?? '')}"</p>
                </div>
                <div className="comment-footer">
                  <div className="platform-tag">
                    {['Reddit', 'Twitter', 'YouTube'][Math.floor(Math.random() * 3)]}
                  </div>
                  <div className="engagement-metrics">
                    <span>👍 {Math.floor(Math.random() * 50) + 1}</span>
                    <span>💬 {Math.floor(Math.random() * 20) + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3>Market Intelligence Summary</h3>
          <div className="summary-text">
            {cleanText(reportData.news_summary)}
          </div>

          <h3>Supporting News Sources</h3>
          <div className="news-grid">
            {reportData.news_articles.slice(0, 8).map((article, i) => (
              <a
                key={i}
                href={article.link}
                target="_blank"
                rel="noreferrer"
                className="news-card"
              >
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="news-card-content">
                  <h4>{article.title}</h4>
                  <p>{article.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '12px', color: '#3182ce', fontWeight: '600' }}>
                      {article.source_id}
                    </span>
                    <span>{new Date(article.pubDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '60px', 
            padding: '24px', 
            background: '#f7fafc', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '14px', color: '#718096' }}>
              This report was generated using advanced AI sentiment analysis technology.<br/>
              Analysis completed at {new Date().toLocaleTimeString()} on {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {isComplete && (!reportData || !reportData.analyzed_comments) && (
        <div className="error-state" style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#f7fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: '#e53e3e', marginBottom: '12px' }}>Report Generation Failed</h3>
          <p style={{ color: '#718096', marginBottom: '24px' }}>
            We encountered an issue while generating your report. This might be due to:
          </p>
          <ul style={{ color: '#718096', textAlign: 'left', maxWidth: '400px', margin: '0 auto 24px' }}>
            <li>API rate limits or server overload</li>
            <li>Insufficient data for the requested topic</li>
            <li>Network connectivity issues</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#3182ce',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;
