// Fully updated Reports.tsx to fix timeline, chart logic, and download menu
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import './Reports.css';
import jsPDF from 'jspdf';


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
}

const steps = [
  'Fetching Reddit comments...',
  'Fetching Twitter posts...',
  'Fetching News articles...',
  'Fetching the YouTube comments...',
  'Summarizing with Mistral...',
  'Report Ready!',
];

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { topic } = useParams<{ topic: string }>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
        setIsComplete(true);
        setCurrentStep(steps.length - 1);
      } catch (err) {
        console.error('Failed to fetch report:', err);
      }
    };
    fetchReport();
  }, [topic]);

  useEffect(() => {
    if (!isComplete) return;
    const carousel = carouselRef.current;
    if (!carousel) return;

    let scrollPosition = 0;
    const scrollStep = 270;
    const autoScroll = setInterval(() => {
      if (!carousel) return;
      scrollPosition += scrollStep;
      if (scrollPosition >= carousel.scrollWidth) {
        scrollPosition = 0;
      }
      carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }, 3000);
    return () => clearInterval(autoScroll);
  }, [isComplete]);

  const downloadReport = (type: 'pdf' | 'docx') => {
    if (!reportData) return;
  
    if (type === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Sentiment Analysis Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Topic: ${topic}`, 20, 30);
      doc.text(reportData.report, 20, 40, { maxWidth: 170 });
      doc.save(`${topic}-report.pdf`);
    } else {
      // DOCX logic placeholder (for client-side .docx you’d use docx library or export server-side)
      const blob = new Blob([reportData.report], { type: 'application/msword' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${topic}-report.docx`;
      link.click();
    }
  };

  const sentimentCounts = {
    positive: reportData?.analyzed_comments.filter(c => c.sentiment.label === 'positive').length || 0,
    neutral: reportData?.analyzed_comments.filter(c => c.sentiment.label === 'neutral').length || 0,
    negative: reportData?.analyzed_comments.filter(c => c.sentiment.label === 'negative').length || 0,
  };
  const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative || 1;

  return (
    <div className="reports-container">
      <header className="report-navbar">
        <button onClick={() => navigate('/home')} className="nav-button">← Back</button>
        <h1 className="report-topic">{topic}</h1>
        <div className="download-menu" ref={dropdownRef}>
  <button
    className="nav-button"
    onClick={() => setShowDropdown((prev) => !prev)}
  >
    Download Report ▼
  </button>
  {showDropdown && (
    <div className="dropdown">
      <div onClick={() => downloadReport('pdf')}>PDF</div>
      <div onClick={() => downloadReport('docx')}>DOCX</div>
    </div>
  )}
</div>

      </header>

      <div className="timeline-container">
  <div className="timeline-line-background" />
  <div
  className="timeline-line-progress"
  style={{ width: `calc(${(currentStep / (steps.length - 1)) * 100}% - ${(100 / steps.length / 2)}%)` }}
/>

  <div className="timeline-steps">
    {steps.map((step, index) => (
      <div className="timeline-step" key={index}>
        <div className={`dot ${index <= currentStep ? 'active' : ''}`} />
        <div className={`step-label ${index <= currentStep ? 'active' : ''}`}>{step}</div>
      </div>
    ))}
  </div>
</div>


      {isComplete && reportData && (
        <div className="report-output">
          <h2 className="report-title">Sentiment Analysis Report</h2>
          <p className="summary-text">{reportData.report}</p>

          <h3>Sentiment Distribution</h3>
          <div className="charts-section">
            <div className="chart-container">
              <div
                className="pie-chart"
                style={{
                  '--positive-deg': `${(sentimentCounts.positive / total) * 360}deg`,
                  '--neutral-end-deg': `${((sentimentCounts.positive + sentimentCounts.neutral) / total) * 360}deg`,
                } as React.CSSProperties}
              >
                <div className="pie-center">
                  <div className="pie-total">{total}</div>
                  <div className="pie-label">Total</div>
                </div>
              </div>
              <div className="pie-legend">
                {(['positive', 'neutral', 'negative'] as const).map(label => (
                  <div className="legend-item" key={label}>
                    <div className="legend-color" style={{ background: label === 'positive' ? '#27ae60' : label === 'neutral' ? '#f39c12' : '#e74c3c' }}></div>
                    <div className="legend-text">{label[0].toUpperCase() + label.slice(1)}</div>
                    <div className="legend-percentage">{Math.round((sentimentCounts[label] / total) * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-container">
              <div className="bar-chart">
                {(['positive', 'neutral', 'negative'] as const).map(label => {
                  const count = sentimentCounts[label];
                  const percentage = (count / total) * 100;
                  return (
                    <div key={label} className="bar-item">
                      <div
                        className={`bar ${label}`}
                        style={{ height: `${percentage * 2}px` }}
                      >
                        <div className="bar-count">{count}</div>
                        <div className="bar-percentage">{Math.round(percentage)}%</div>
                      </div>
                      <div className="bar-label">{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <h3>User Comments</h3>
          <div className="carousel" ref={carouselRef}>
            {reportData.analyzed_comments.slice(0, 10).map((comment, i) => (
              <div key={i} className="comment-card">
                <p>{comment.text}</p>
                <span className={`sentiment ${comment.sentiment.label}`}>
                  {comment.sentiment.label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <h3>News Summary</h3>
          <p className="summary-text">{reportData.news_summary}</p>

          <h3>News Sources</h3>
          <div className="news-grid">
            {reportData.news_articles.slice(0, 6).map((article, i) => (
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
                  <span>{new Date(article.pubDate).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
