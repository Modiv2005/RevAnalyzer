Enterprise AI Revenue Forecasting & Decision Intelligence
Welcome to the AI Revenue Forecasting & Business Intelligence Dashboard, a production-grade full-stack financial analytics and compliance dashboard built to mimic top-tier SaaS platforms like Wolters Kluwer.

Below is the complete walkthrough of the platform's architectural layers, data science modeling engines, conversational RAG assistants, and Obsidian Dark interface design.

1. Architectural Architecture & Folder Layout
The platform uses a modular, professional repository structure. Below is a layout of our codebases:

HTTP Port 3000 / Proxy /api
SQLAlchemy Core
Scikit-Learn / Statsmodels
Isolation Forest / LOF
Local vector overlap indexes
Vite React-TS Client
FastAPI Gateway Port 8000
SQLite/Postgres Database
Predictive Forecasting Engine
Risk Anomaly Engine
RAG & Local AI Analyst
File Hierarchy & Modular Packaging
All source files are neatly structured inside our workspace directory:

backend/app/config.py
: Core configurations (passwords, JWT secrets, DB fallbacks).
backend/app/database.py
: Session bounds (thread-safe SQLite pools).
backend/app/models.py
: Normalized schema representing accounts ledgers, columns statistical summaries, forecast rows, anomaly incidents, and audit logs.
backend/app/services/
:
dataset_service.py: Automated ETL column type profiling and a Mock Ledger Generator injecting real seasonal transaction peaks and fraud spikes.
forecasting_service.py: Statistical ARIMA/Holt-Winters predictions plus lag-feature engineered Random Forest & Gradient Boosting regressors.
anomaly_service.py: Unsupervised Isolation Forest, Local Outlier Density, and Z-Score estimators.
kpi_service.py: Auto-profile margins and moving cash totals.
rag_service.py & llm_service.py: Word-token overlap vector lookups feeding a sophisticated Local AI Heuristic Analyst that drafts structured analytical markdown reports, working out of the box even without OpenAI keys.
frontend/src/store/
: Zustand global state storage blocks for user auth sessions, active ledger targets, chat conversations, and risk alert tickers.
frontend/src/pages/
: Dedicated workspace modules for Executive Dashboard, Ingestion center, exploratory correlation heatmaps, model predictions, anomaly explorers, and RAG chats.
2. Unsupervised Outlier Scanners & Machine Learning Projections
The decision intelligence layer houses statistical modeling code:

Machine Learning Forecasting
ML models (Random Forest, Gradient Boosting) convert standard time-series histories into supervised regressors by dynamically constructing historical lag features:

lag_1, lag_2, lag_3 fields are computed alongside temporal month integers.
The engine trains recursive estimators, calculating forecast horizons period-by-period.
Standard deviations are estimated across model residuals to output 95% Confidence Intervals.
Statistical engines (ARIMA, exponential_smoothing) isolate trend and seasonal coefficients to forecast projections.
Anomaly Scanners
Isolation Forests: Build splitting forest trees. Outliers are isolated closer to the root of the tree, yielding high severity scores.
Local Outlier Factor (LOF): Computes local density deviations relative to nearest transaction neighbors. Coordinates with lower relative density score indicators are flagged as fraud risks.
Auditor Resolution Logs: Custom DB log entries allow analysts to flag, mark, and resolve events, shifting telemetry states in real-time.
3. Grounded Explainable RAG & AI Analysts
To secure compliance-grade decision insights, the conversational BI engine avoids hallucinations by running RAG groundings:

Schema Vectors: Ingested column descriptive stats, model validations, and flagged outlier logs are chunked into structured text lists.
Local Overlap Similarity: User questions are parsed against overlap coefficients to pull the most matching facts.
Local AI Analyst: When no OPENAI_API_KEY is provided, a highly sophisticated local rule engine detects query intent:
Outlier Intent: Extracts anomalies, prints Z-scores, and outlines regulatory audits.
Forecast Intent: Extracts predictions and builds beautiful markdown forecasts.
KPI Intent: Summarizes operational margins.
4. Obsidian Dark Theme Tokens
The client interface features an obsidian theme (using Tailwind CSS v4 compiler configurations in 
index.css
):

Color Gradients: Fixed deep gradients (#0b0f19 backdrops with radial cobalt glows) create a visually impressive look.
Glassmorphism Panels: Semi-transparent card overlays (glass-panel) utilize blur effects to overlay charts.
Micro-Animations: Custom scrollbars, glow borders, and indicator badges bounce and glow depending on health severity states.
5. Developer Quickstart
To launch and evaluate the entire platform:

Verify Sandbox Health: Make sure you have python and node modules active. The build has been completely validated:

bash
cd frontend
npm run build
Boot Platform Servers: Run the root start script:

bash
./start.sh
Explore Gateways:

Access client panel: http://localhost:3000
Access FastAPI Swagger docs: http://localhost:8000/api/v1/docs
Instant Evaluation:

Register a new Analyst credential.
Jump to Ingestion Workspace and click Generate Demo Ledger to instantly populate the platform databases.
Explore Descriptive Analytics heatmaps, train ML Projections, review Risk Outliers, and consult the BI Conversational Assistant!
