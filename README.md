"# SentiantAI

[![Demo Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://drive.google.com/file/d/1jMhOr-MFE0CfSvO6rZZU2uRJMS1IeTTx/view)

SentiantAI is a modern AI-powered analytics platform that combines real-time data processing with advanced machine learning capabilities. Built with a robust frontend and backend architecture, it provides powerful insights and visualization tools for your data analysis needs.

## Features

- Real-time data processing and analysis
- Advanced AI/ML capabilities
- Interactive visualizations with Chart.js and Recharts
- Social media integration
- News API integration
- PDF report generation
- Modern, responsive UI with Framer Motion animations
- Secure authentication system

## Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **UI Libraries**: React Icons, Recharts, Chart.js
- **State Management**: React Context/Redux
- **Styling**: CSS Modules
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **API Client**: Axios
- **PDF Generation**: jsPDF
- **Canvas**: html2canvas

### Backend
- **Framework**: FastAPI
- **Database**: Supabase
- **AI/ML**: Transformers, PyTorch
- **Data Processing**: Motor (MongoDB), Scikit-learn
- **Social Media**: Tweepy (Twitter), PRAW (Reddit)
- **News**: Google News API
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ridh1234/SentiantAI.git
cd SentiantAI
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../Backend
pip install -r requirements.txt
```

### Environment Setup

Create a `.env` file in the Backend directory with the following variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
MONGODB_URI=your_mongodb_uri
NEWS_API_KEY=your_news_api_key
```

### Running the Application

1. Start the backend server:
```bash
cd Backend
uvicorn app.main:app --reload
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```

## Project Structure

```
SentiantAI/
├── Backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── utils/
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers directly.
