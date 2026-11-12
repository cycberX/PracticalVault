import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static file directories
app.use('/files/aiml', express.static(path.join(__dirname, 'aiml')));
app.use('/files/dbms', express.static(path.join(__dirname, 'dbms')));
app.use('/files/dsa', express.static(path.join(__dirname, 'DSA', 'files')));
app.use('/files/dmsm', express.static(path.join(__dirname, 'dmsm', 'public')));

// Universal foolproof PDF delivery endpoint
app.get('/pdf/:subject/:file', (req, res) => {
    const { subject, file } = req.params;
    let safeDir = '';

    if (subject === 'aiml') safeDir = path.join(__dirname, 'aiml');
    else if (subject === 'dbms') safeDir = path.join(__dirname, 'dbms');
    else if (subject === 'dsa') safeDir = path.join(__dirname, 'DSA', 'files');
    else return res.status(404).send('Subject not found');

    const cleanFilename = path.basename(file);
    const fullPath = path.join(safeDir, cleanFilename);

    if (!fs.existsSync(fullPath)) {
        return res.status(404).send('PDF file not found: ' + cleanFilename);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + cleanFilename + '"');
    res.sendFile(fullPath);
});

// Backward-compatible routes
app.get('/view-pdf', (req, res) => {
    const pdfPath = path.join(__dirname, 'dbms', 'dbms.pdf');
    if (fs.existsSync(pdfPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="dbms.pdf"');
        res.sendFile(pdfPath);
    } else {
        res.status(404).send('dbms.pdf not found in dbms folder');
    }
});

app.get('/view-md', (req, res) => {
    const filePath = path.join(__dirname, 'dbms', 'dbms.md');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading DBMS markdown file');

        const htmlContent = marked.parse(data);

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>DBMS Practical Solutions</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { background-color: #f8fafc; }
                        .markdown-body {
                            box-sizing: border-box;
                            min-width: 200px;
                            max-width: 980px;
                            margin: 0 auto;
                            padding: 24px 20px 80px 20px;
                            background-color: #ffffff;
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                        }
                        .copy-btn {
                            position: absolute;
                            top: 8px;
                            right: 8px;
                            background: #f1f5f9;
                            color: #334155;
                            border: 1px solid #cbd5e1;
                            border-radius: 6px;
                            padding: 4px 10px;
                            font-size: 11px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                        }
                        .copy-btn:hover {
                            background: #2563eb;
                            color: #ffffff;
                            border-color: #2563eb;
                        }
                    </style>
                </head>
                <body class="p-4 sm:p-6 text-slate-800">
                    <div class="max-w-4xl mx-auto mb-4 flex items-center justify-between">
                        <a href="/?index=1" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-semibold shadow-sm transition-all">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                            Back to Dashboard
                        </a>
                        <span class="text-xs text-slate-500 font-medium">Click Copy button on any query</span>
                    </div>

                    <article class="markdown-body shadow-sm">
                        ${htmlContent}
                    </article>

                    <script>
                        document.querySelectorAll('pre').forEach(pre => {
                            pre.style.position = 'relative';
                            const code = pre.querySelector('code') || pre;
                            const btn = document.createElement('button');
                            btn.className = 'copy-btn';
                            btn.textContent = 'Copy';
                            btn.onclick = () => {
                                navigator.clipboard.writeText(code.innerText).then(() => {
                                    btn.textContent = 'Copied!';
                                    btn.style.background = '#16a34a';
                                    btn.style.color = '#ffffff';
                                    setTimeout(() => {
                                        btn.textContent = 'Copy';
                                        btn.style.background = '';
                                        btn.style.color = '';
                                    }, 2000);
                                });
                            };
                            pre.appendChild(btn);
                        });
                    </script>
                </body>
            </html>
        `);
    });
});

// API endpoint to retrieve python code
app.get('/api/code/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(__dirname, 'DSA', 'files', filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({ filename, content });
});

// DM&SM experiments dataset
const dmsmExperiments = [
    {
        id: 1,
        title: "Keyword Research & SEO",
        desc: "A complete workflow for finding high-ranking keywords and creating social media marketing assets.",
        sites: [
            { name: "Semrush Analytics", url: "www.semrush.com/analytics/keywordoverview/" },
            { name: "Facebook", url: "facebook.com" },
            { name: "Instagram", url: "instagram.com" },
            { name: "Canva Design", url: "canva.com" },
            { name: "Demo Websites", url: "github.com/topics/landingpage?l=html" }
        ],
        plugins: ["Keyword Overview", "Off-page SEO", "Graphic Design", "Social Posting"],
        points: [
            "<strong>SEO Basics:</strong> Applied <strong>On-Page SEO</strong> (fixing content on the site) and <strong>Off-Page SEO</strong> (building links from Facebook/Instagram).",
            "<strong>Keyword Selection:</strong> Found high-value words that people type into Google to find information.",
            "<strong>Monthly Search Volume:</strong> Analyzed how many people search for these keywords every 30 days.",
            "<strong>Keyword Difficulty (KD):</strong> Checked how hard it is to rank on the first page of Google for specific terms.",
            "<strong>Search Intent:</strong> Identified if the user wants to buy something, find a site, or just get information.",
            "<strong>CPC (Cost Per Click):</strong> Checked the value of keywords if we were to run paid ads.",
            "<strong>SERP Analysis:</strong> Studied the top 10 results on Google to see what the competition is doing right."
        ]
    },
    {
        id: 2,
        title: "Buffer: Social Media Management",
        desc: "Using Buffer to connect multiple social channels and schedule a full week of content in advance.",
        sites: [
            { name: "Buffer Dashboard", url: "buffer.com" },
            { name: "Facebook", url: "facebook.com" },
            { name: "Instagram", url: "instagram.com" },
            { name: "Canva", url: "canva.com" }
        ],
        plugins: ["Buffer Scheduler", "Canva Integration", "Content Calendar", "Social Analytics"],
        points: [
            "<strong>Tool Purpose:</strong> Used <strong>Buffer</strong> as a central hub to manage Facebook and Instagram from one dashboard.",
            "<strong>Login & Access:</strong> Successfully authenticated into Buffer using primary credentials to access the management panel.",
            "<strong>Account Logic:</strong> Grouped social media accounts into specific 'Brands' to keep business posts organized.",
            "<strong>Channel Connection:</strong> Connected <strong>Facebook Pages</strong> and <strong>Instagram Business</strong> accounts as active channels.",
            "<strong>Content Design:</strong> Used <strong>Canva</strong> to design 7 high-quality posters (one for each day of the week).",
            "<strong>Scheduling Logic:</strong> Uploaded designs to Buffer and set specific time slots for 1 full week (7 days) to ensure consistent posting.",
            "<strong>Automation Benefit:</strong> Verified that posts go live automatically without manual intervention each day."
        ]
    },
    {
        id: 3,
        title: "Facebook Ads & Campaign Management",
        desc: "Setting up a paid advertising campaign using Meta Business Suite and Ads Manager.",
        sites: [
            { name: "Meta Business Suite", url: "business.facebook.com/latest/" },
            { name: "Ads Manager", url: "adsmanager.facebook.com" },
            { name: "Canva", url: "canva.com" }
        ],
        plugins: ["Meta Pixel", "Ad Creative", "Audience Insights", "Budget Tool"],
        points: [
            "<strong>Theory of Ad Hierarchy:</strong> Understanding the structure: <strong>Campaign</strong> (Goal) > <strong>Ad Set</strong> (Audience/Budget) > <strong>Ad</strong> (Creative).",
            "<strong>Design Phase:</strong> Created a high-converting ad poster in <strong>Canva</strong> using the 1080x1080 (Square) format for best visibility.",
            "<strong>Objective Selection:</strong> Chose a Campaign objective (e.g., Traffic or Awareness) inside <strong>Meta Business Suite</strong>.",
            "<strong>Targeting Logic:</strong> Defined the <strong>Audience</strong> based on location, age, and interests to reduce wasted ad spend.",
            "<strong>Ad Placement:</strong> Selected where the ad appears (Facebook Feed, Instagram Stories, or Audience Network).",
            "<strong>Budgeting:</strong> Set a Daily Budget vs. Lifetime Budget to control the experiment costs.",
            "<strong>Final Publishing:</strong> Uploaded the Canva media, added a 'Call to Action' (CTA) button, and hit <strong>Publish</strong> to start the campaign."
        ]
    },
    {
        id: 4,
        title: "Email Marketing & WP Integration",
        desc: "Setting up a professional newsletter system by connecting WordPress to Mailchimp using sample data.",
        sites: [
            { name: "Mailchimp Portal", url: "login.mailchimp.com/" },
            { name: "Mockaroo (Data Gen)", url: "www.mockaroo.com/" },
            { name: "WordPress Admin", url: "#" }
        ],
        plugins: ["MC4WP (Mailchimp for WordPress)", "Contact Form 7", "SMTP Mailer"],
        points: [
            "<strong>Data Generation:</strong> Used <strong>Mockaroo</strong> to generate a CSV file of sample names and emails for testing the system.",
            "<strong>Audience Setup:</strong> Imported the sample data into <strong>Mailchimp</strong> to create a mock subscriber list.",
            "<strong>WP Connection:</strong> Installed and configured the <strong>MC4WP</strong> plugin on a WordPress site to link the front-end to the Mailchimp API.",
            "<strong>Form Logic:</strong> Created a 'Sign-up' form that automatically adds website visitors to the specific Mailchimp audience list.",
            "<strong>Theory of Automation:</strong> Understanding <strong>Double Opt-in</strong> (user confirms email) vs <strong>Single Opt-in</strong> (added immediately).",
            "<strong>Important Note:</strong> This setup allows for automatic synchronization between WordPress users and Mailchimp marketing campaigns."
        ]
    },
    {
        id: 5,
        title: "Influencer Outreach & Brand Promotion",
        desc: "Executing a strategic campaign to promote eco-friendly skincare through Instagram influencers.",
        sites: [
            { name: "Instagram (Search/DM)", url: "instagram.com" }
        ],
        plugins: ["Instagram Insights"],
        points: [
            "<strong>Campaign Goal:</strong> Focused on increasing visibility for sustainable skincare with a target of 100K reach and 500 orders in 30 days.",
            "<strong>Target Persona:</strong> Targeted environmentally-conscious females aged 20-35 interested in vegan and clean beauty.",
            "<strong>Influencer Discovery:</strong> Used hashtags like #SustainableBeauty and competitor analysis (Mamaearth, Plum) to find micro-influencers (10K-100K followers).",
            "<strong>Outreach Strategy:</strong> Sent professional emails and DMs offering collaboration through sponsored Reels, product reviews, and affiliate partnerships.",
            "<strong>Content Deliverables:</strong> Requested high-impact assets including 'Unboxing' Stories, 'Before vs After' Reels, and ingredient highlight posts.",
            "<strong>Sales Conversion:</strong> Implemented trackable discount codes (e.g., ECO10) and swipe-up links to drive and measure direct online sales.",
            "<strong>Performance Tracking:</strong> Analyzed success using Instagram Insights and Google Analytics to track Reach, Engagement, and ROI."
        ]
    },
    {
        id: 6,
        title: "YouTube Visual Branding",
        desc: "Designing professional-grade Channel Art, Logos, and Thumbnails using precise pixel dimensions.",
        sites: [
            { name: "Canva Design", url: "canva.com" },
            { name: "YouTube Studio", url: "studio.youtube.com" },
            { name: "YouTube Channel View", url: "youtube.com" }
        ],
        plugins: ["Canva Brand Kit", "Background Remover", "YouTube UI Preview"],
        points: [
            "<strong>YouTube Logo:</strong> Designed a square asset at <strong>800 x 800 px</strong> (1:1 ratio). <em>Note: It displays as a circle, so keep text in the center.</em>",
            "<strong>Channel Banner:</strong> Created a large-scale image at <strong>2560 x 1440 px</strong> (16:9 ratio).",
            "<strong>Banner Safe Area:</strong> Focused all important text within the 1546 x 423 px center block to ensure visibility on mobile and desktop.",
            "<strong>Video Thumbnail:</strong> Designed a high-impact graphic at <strong>1280 x 720 px</strong> (16:9 ratio) under 2MB in size.",
            "<strong>Theory of Contrast:</strong> Used bright colors and bold outlines to make the thumbnail stand out in the YouTube 'Suggested' sidebar.",
            "<strong>Important Note:</strong> Successfully uploaded these assets to <strong>YouTube Studio > Customization > Branding</strong> to verify the live look on the channel."
        ]
    },
    {
        id: 7,
        title: "WordPress Development & Free Hosting",
        desc: "Building a live website from scratch using InfinityFree hosting and the Elementor page builder.",
        sites: [
            { name: "InfinityFree Hosting", url: "www.infinityfree.com/" },
            { name: "Control Panel (vPanel)", url: "#" },
            { name: "Softaculous App Installer", url: "#" }
        ],
        plugins: ["Elementor (Page Builder)", "MC4WP (Mailchimp)", "Yoast SEO / RankMath", "Classic Editor"],
        points: [
            "<strong>Domain Provisioning:</strong> Created a custom subdomain through <strong>InfinityFree</strong> to act as the web address.",
            "<strong>Server Management:</strong> Used the <strong>Control Panel (vPanel)</strong> to manage file directories and databases.",
            "<strong>Automated Installation:</strong> Utilized the <strong>Softaculous App Installer</strong> to deploy WordPress files to the server automatically.",
            "<strong>Plugin Ecosystem:</strong> Configured <strong>Elementor</strong> for drag-and-drop design and <strong>SEO plugins</strong> for search engine visibility.",
            "<strong>Content Architecture:</strong> Created and structured the primary pages (Home, About, Contact) using the WordPress Pages menu.",
            "<strong>Live Deployment:</strong> Verified the 'Publish' status to ensure the website is accessible to the public internet."
        ]
    },
    {
        id: 8,
        title: "Google Analytics & Traffic Tracking",
        desc: "Setting up Google Analytics 4 (GA4) on a live website to track visitor data and engagement metrics.",
        sites: [
            { name: "Google Analytics", url: "analytics.google.com/" },
            { name: "Google Sites", url: "sites.google.com/" }
        ],
        plugins: ["Measurement ID", "Real-time Tracking"],
        points: [
            "<strong>Platform Setup:</strong> Created a professional sample website using <strong>Google Sites</strong> to act as the data source.",
            "<strong>Property Configuration:</strong> Registered a new <strong>GA4 Property</strong> and set the reporting time zone and currency.",
            "<strong>Data Stream:</strong> Created a 'Web' stream by providing the website URL and giving the stream a unique name.",
            "<strong>Measurement ID:</strong> Extracted the unique <strong>G-XXXXXXX</strong> code from the Google Analytics dashboard.",
            "<strong>Backend Connection:</strong> Pasted the Measurement ID into the Google Sites 'Analytics' settings to link the two platforms.",
            "<strong>Real-time Verification:</strong> Used the <strong>Real-time Report</strong> in Analytics to verify that the connection is active and tracking live visits."
        ]
    },
    {
        id: 9,
        title: "Practical Write-ups & Documentation",
        desc: "A centralized repository of all technical documentation, lab reports, and step-by-step guides for the semester.",
        sites: [
            { name: "Google Drive Folder", url: "drive.google.com/drive/folders/1QCj-BowM7N7AymlOJWulkBg21s7SrFkQ?usp=sharing" }
        ],
        plugins: ["Google Drive Cloud Storage", "PDF Reports"],
        points: [
            "<strong>Centralized Storage:</strong> Hosted all practical work on <strong>Google Drive</strong> for easy access and cloud-based backup.",
            "<strong>Standardized Formatting:</strong> Created a consistent template for all write-ups to ensure high-clarity and professional standards.",
            "<strong>Asset Organization:</strong> Used a structured folder system to separate raw data, screenshots, and final PDF reports.",
            "<strong>Collaboration Logic:</strong> Configured 'Viewer' permissions on the drive link to allow external review without compromising file integrity.",
            "<strong>Technical Documentation:</strong> Compiled detailed guides for SEO, Social Media, Ads, and Web Development into a single resource hub.",
            "<strong>Important Note:</strong> This repository serves as the primary evidence of all practical experiments performed during the course."
        ]
    }
];

// Main Dashboard route
app.get('/', (req, res) => {
    // 1. AIML clean practical list
    const aimlPracticals = [
        { title: "Intelligent Agents & PEAS Representation", file: "intelligent-agents-peas.pdf" },
        { title: "Breadth First Search (BFS) & Depth First Search (DFS)", file: "bfs-dfs.pdf" },
        { title: "Greedy Best-First Search & A* Search", file: "greedy-a-star.pdf" },
        { title: "Forward & Backward Chaining", file: "forward-backward-chaining.pdf" },
        { title: "Data Preprocessing", file: "data-preprocessing.pdf" },
        { title: "Decision Tree & Naive Bayes", file: "decision-tree-naive-bayes.pdf" },
        { title: "Linear Regression & Polynomial Regression", file: "linear-polynomial-regression.pdf" },
        { title: "Logistic Regression & K-Nearest Neighbors (KNN)", file: "logistic-regression-knn.pdf" },
        { title: "SVM, Random Forest & AdaBoost", file: "svm-random-forest-adaboost.pdf" },
        { title: "K-Means & Hierarchical Clustering", file: "kmeans-hierarchical-clustering.pdf" },
        { title: "Principal Component Analysis (PCA)", file: "pca.pdf" }
    ];

    // 2. Preload DSA Python code for 0-latency instant copy
    const dsaDir = path.join(__dirname, 'DSA', 'files');
    const dsaCodeFiles = {};
    if (fs.existsSync(dsaDir)) {
        const files = fs.readdirSync(dsaDir);
        files.forEach(f => {
            if (f.endsWith('.py')) {
                dsaCodeFiles[f] = fs.readFileSync(path.join(dsaDir, f), 'utf8');
            }
        });
    }

    // 3. DBMS Markdown HTML Content
    let dbmsHtml = '';
    const dbmsMdPath = path.join(__dirname, 'dbms', 'dbms.md');
    if (fs.existsSync(dbmsMdPath)) {
        const mdText = fs.readFileSync(dbmsMdPath, 'utf8');
        dbmsHtml = marked.parse(mdText);
    }

    // 4. DSA structured topic list
    const dsaTopics = [
        {
            title: "AI Search Algorithm (BFS Maze Solver)",
            pdf: "ai-search-algo.pdf",
            code: "ai-search-algo.py"
        },
        {
            title: "Binary Search Tree (BST)",
            pdf: "bst.pdf",
            code: "bst.py"
        },
        {
            title: "Divide & Conquer (Merge Sort)",
            pdf: "divide-conquer.pdf",
            code: "divide-conquer-merge-sort.py"
        },
        {
            title: "Graph (Minimum Spanning Tree - Kruskal & Prim)",
            pdf: "graph-mst.pdf",
            code: "graph-mst.py"
        },
        {
            title: "Greedy Algorithm (Fractional Knapsack)",
            pdf: "greedy-algo.pdf",
            code: "greedy-fractional-knapsack.py"
        },
        {
            title: "Heap Data Structure & Heap Sort",
            pdf: "heap.pdf",
            code: "heap.py"
        },
        {
            title: "String Processing (Naive String Matching)",
            pdf: "naive-string-matching.pdf",
            code: "naive-string-matching.py"
        },
        {
            title: "Queue Data Structure",
            pdf: "queue.pdf",
            code: null
        },
        {
            title: "Search & Sort Algorithms",
            pdf: "search-and-sort.pdf",
            code: null
        },
        {
            title: "Stack Data Structure",
            pdf: "stack.pdf",
            code: null
        }
    ];

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PracticalVault</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
    <style>
        body { background-color: #f8fafc; }
        .markdown-body {
            background-color: transparent !important;
            font-size: 13.5px;
        }
        .markdown-body pre {
            background-color: #f1f5f9 !important;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            position: relative;
        }
        .copy-sql-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #ffffff;
            color: #334155;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 3px 8px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
        }
        .copy-sql-btn:hover {
            background: #2563eb;
            color: #ffffff;
            border-color: #2563eb;
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen font-sans antialiased selection:bg-blue-100 selection:text-blue-900">

    <!-- Top Clean Header (White Theme) -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    PV
                </div>
                <div>
                    <h1 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        PracticalVault
                        <span id="headerBadge" class="text-xs px-2 py-0.5 rounded-md font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            AIML
                        </span>
                    </h1>
                </div>
            </div>

            <!-- Desktop View Selector Pills -->
            <div class="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button onclick="switchSubject(0)" id="top-tab-0" class="px-3 py-1 rounded-md transition-all font-medium">AIML</button>
                <button onclick="switchSubject(1)" id="top-tab-1" class="px-3 py-1 rounded-md transition-all font-medium">DBMS</button>
                <button onclick="switchSubject(2)" id="top-tab-2" class="px-3 py-1 rounded-md transition-all font-medium">DM&SM</button>
                <button onclick="switchSubject(3)" id="top-tab-3" class="px-3 py-1 rounded-md transition-all font-medium">DSA</button>
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 pt-5 pb-28">

        <!-- ========================================== -->
        <!-- SUBJECT 0: AIML (Default open)             -->
        <!-- ========================================== -->
        <section id="subject-0" class="space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                        Artificial Intelligence & Machine Learning
                    </h2>
                    <p class="text-xs text-slate-500 mt-0.5">11 Solved practical PDF documents</p>
                </div>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    ${aimlPracticals.length} Practicals
                </span>
            </div>

            <!-- 3 cards per line on desktop -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${aimlPracticals.map((p, i) => `
                <div class="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between">
                    <div>
                        <div class="flex items-start justify-between gap-2">
                            <span class="text-xs font-bold text-slate-400">#${i + 1}</span>
                            <span class="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded truncate max-w-[200px]" title="${p.file}">
                                ${p.file}
                            </span>
                        </div>
                        <h3 class="text-sm font-semibold text-slate-900 mt-2">
                            ${p.title}
                        </h3>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <a href="/pdf/aiml/${p.file}" target="_blank" 
                           class="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors truncate">
                            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                            <span>Open</span>
                        </a>
                        <button onclick="previewPdf('/pdf/aiml/${p.file}', '${p.title}')"
                           class="inline-flex items-center justify-center py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors">
                            Preview
                        </button>
                        <a href="/pdf/aiml/${p.file}" download="${p.file}" 
                           class="inline-flex items-center justify-center py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium border border-slate-200 transition-colors shrink-0" title="Download">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/></svg>
                        </a>
                    </div>
                </div>`).join('')}
            </div>
        </section>


        <!-- ========================================== -->
        <!-- SUBJECT 1: DBMS                            -->
        <!-- ========================================== -->
        <section id="subject-1" class="hidden space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                        Database Management Systems
                    </h2>
                    <p class="text-xs text-slate-500 mt-0.5">Practical cheat sheet, queries & schema</p>
                </div>
            </div>

            <!-- Quick Cards (3 on desktop) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- PDF Solution -->
                <div class="bg-white border border-slate-200 rounded-xl p-4.5 hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                        <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs mb-3 border border-rose-100">
                            PDF
                        </div>
                        <h3 class="text-sm font-bold text-slate-900">Full Solution PDF</h3>
                        <p class="text-xs text-slate-500 mt-1">Complete solved DBMS practical queries and outputs.</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <a href="/pdf/dbms/dbms.pdf" target="_blank" class="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium text-center transition-colors">
                            Open PDF
                        </a>
                        <button onclick="previewPdf('/pdf/dbms/dbms.pdf', 'DBMS Full Solution PDF')" class="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors">
                            Preview
                        </button>
                    </div>
                </div>

                <!-- Markdown Solution -->
                <div class="bg-white border border-slate-200 rounded-xl p-4.5 hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                        <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs mb-3 border border-amber-100">
                            MD
                        </div>
                        <h3 class="text-sm font-bold text-slate-900">Solution Markdown</h3>
                        <p class="text-xs text-slate-500 mt-1">Structured markdown with copyable SQL table triggers & procedures.</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <a href="/view-md" target="_blank" class="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium text-center transition-colors">
                            Full Page View
                        </a>
                        <button onclick="toggleDbmsInlineView()" class="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors">
                            View Below
                        </button>
                    </div>
                </div>

                <!-- AI Assistant -->
                <div class="bg-white border border-slate-200 rounded-xl p-4.5 hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3 border border-emerald-100">
                            AI
                        </div>
                        <h3 class="text-sm font-bold text-slate-900">ChatGPT Query Assist</h3>
                        <p class="text-xs text-slate-500 mt-1">Explain concepts or debug queries in ChatGPT.</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-100">
                        <a href="https://chatgpt.com/share/6a00d7a7-9a2c-8321-8550-ab9f5c2cacf8" target="_blank" class="block w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium text-center transition-colors">
                            Launch Assistant ↗
                        </a>
                    </div>
                </div>
            </div>

            <!-- Inline Markdown Viewer -->
            <div id="dbmsInlineContainer" class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                    <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">DBMS Solved Solutions (Copyable SQL)</span>
                    <a href="/view-md" target="_blank" class="text-xs text-blue-600 hover:underline font-medium">
                        Open Separate Tab ↗
                    </a>
                </div>
                <div class="markdown-body" id="inlineDbmsMd">
                    ${dbmsHtml}
                </div>
            </div>
        </section>


        <!-- ========================================== -->
        <!-- SUBJECT 2: DM&SM                           -->
        <!-- ========================================== -->
        <section id="subject-2" class="hidden space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                        Digital Marketing & Social Media
                    </h2>
                    <p class="text-xs text-slate-500 mt-0.5">Experiment registry, connected marketing sites & points</p>
                </div>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    ${dmsmExperiments.length} Experiments
                </span>
            </div>

            <!-- Experiments Grid View (3 cards on desktop) -->
            <div id="dmsmListView" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${dmsmExperiments.map(exp => `
                <div onclick="showDmsmDetail(${exp.id})" class="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between">
                    <div>
                        <div class="flex items-start justify-between gap-2">
                            <h3 class="text-sm font-semibold text-slate-900">
                                ${exp.title}
                            </h3>
                            <span class="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
                                #${exp.id}
                            </span>
                        </div>
                        <p class="text-xs text-slate-500 mt-2 line-clamp-2">
                            ${exp.desc}
                        </p>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div class="flex items-center gap-1.5">
                            <span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                ${exp.sites.length} Sites
                            </span>
                            <span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                ${exp.plugins.length} Plugins
                            </span>
                        </div>
                        <span class="text-blue-600 font-medium">
                            Details →
                        </span>
                    </div>
                </div>
                `).join('')}
            </div>

            <!-- Experiment Detail View -->
            <div id="dmsmDetailView" class="hidden space-y-4">
                <button onclick="hideDmsmDetail()" class="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600 text-xs font-semibold bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-sm transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    Back to All Experiments
                </button>

                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div id="dmsmDetHeader" class="p-5 bg-slate-50 border-b border-slate-200">
                        <!-- Populated by JS -->
                    </div>

                    <div class="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Sites -->
                        <div class="space-y-3">
                            <h4 class="text-xs font-bold uppercase text-slate-500 tracking-wider">Connected Sites</h4>
                            <div id="dmsmDetSites" class="space-y-2"></div>
                        </div>

                        <!-- Plugins -->
                        <div class="space-y-3">
                            <h4 class="text-xs font-bold uppercase text-slate-500 tracking-wider">Active Plugins</h4>
                            <div id="dmsmDetPlugins" class="flex flex-wrap gap-1.5"></div>
                        </div>

                        <!-- Points -->
                        <div class="space-y-3">
                            <h4 class="text-xs font-bold uppercase text-slate-500 tracking-wider">Key Points</h4>
                            <ul id="dmsmDetPoints" class="space-y-2 text-xs text-slate-600"></ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <!-- ========================================== -->
        <!-- SUBJECT 3: DSA                             -->
        <!-- ========================================== -->
        <section id="subject-3" class="hidden space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                        Data Structures & Algorithms
                    </h2>
                    <p class="text-xs text-slate-500 mt-0.5">Practical algorithms with solved PDFs and copyable Python codes</p>
                </div>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    ${dsaTopics.length} Topics
                </span>
            </div>

            <!-- 3 cards per line on desktop -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${dsaTopics.map((topic, i) => {
                    const hasPdf = Boolean(topic.pdf);
                    const hasCode = Boolean(topic.code);
                    return `
                    <div class="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-xs font-bold text-slate-400">#${i + 1}</span>
                                <div class="flex items-center gap-1.5">
                                    ${hasPdf ? `<span class="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-medium">PDF</span>` : ''}
                                    ${hasCode ? `<span class="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">Python</span>` : ''}
                                </div>
                            </div>

                            <h3 class="text-sm font-semibold text-slate-900 mt-2">
                                ${topic.title}
                            </h3>
                        </div>

                        <div class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                            ${hasPdf ? `
                                <a href="/pdf/dsa/${topic.pdf}" target="_blank" 
                                   class="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                    PDF
                                </a>
                                <button onclick="previewPdf('/pdf/dsa/${topic.pdf}', '${topic.title}')"
                                   class="inline-flex items-center py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors">
                                    Preview
                                </button>
                            ` : ''}

                            ${hasCode ? `
                                <button onclick="openCodeModal('${topic.code}')" 
                                        class="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                                    Code
                                </button>
                                <button onclick="copyDsaCode('${topic.code}', this)" 
                                        class="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-colors">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                                    Copy
                                </button>
                            ` : ''}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </section>

    </main>

    <!-- ========================================== -->
    <!-- IN-PAGE PDF PREVIEW MODAL                  -->
    <!-- ========================================== -->
    <div id="pdfModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-3 sm:p-6" onclick="closePdfModal()">
        <div class="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden" onclick="event.stopPropagation()">
            <div class="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">PDF Preview:</span>
                    <span id="pdfModalTitle" class="text-sm font-semibold text-slate-800 truncate max-w-xs sm:max-w-md"></span>
                </div>
                <div class="flex items-center gap-2">
                    <a id="pdfModalNewTab" href="#" target="_blank" class="text-xs text-blue-600 hover:text-blue-700 font-medium px-2.5 py-1 rounded bg-blue-50 border border-blue-200">
                        Open in New Tab ↗
                    </a>
                    <button onclick="closePdfModal()" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 text-lg leading-none">
                        ✕
                    </button>
                </div>
            </div>
            <div class="flex-1 bg-slate-100">
                <iframe id="pdfModalIframe" class="w-full h-full border-none" src=""></iframe>
            </div>
        </div>
    </div>

    <!-- ========================================== -->
    <!-- CODE VIEWER MODAL                          -->
    <!-- ========================================== -->
    <div id="codeModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-3 sm:p-6" onclick="closeCodeModal()">
        <div class="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden" onclick="event.stopPropagation()">
            <div class="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                <div>
                    <h3 id="modalCodeTitle" class="text-sm sm:text-base font-bold text-slate-900 font-mono"></h3>
                    <p class="text-[11px] text-slate-500">Python Implementation</p>
                </div>
                <div class="flex items-center gap-2">
                    <button id="modalCopyBtn" onclick="copyCurrentModalCode()" class="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        Copy Code
                    </button>
                    <a id="modalDownloadBtn" href="#" download class="inline-flex items-center py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200" title="Download">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/></svg>
                    </a>
                    <button onclick="closeCodeModal()" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 text-lg leading-none">
                        ✕
                    </button>
                </div>
            </div>

            <div class="p-4 sm:p-5 overflow-auto bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed flex-1">
                <pre><code id="modalCodeContent" class="block whitespace-pre"></code></pre>
            </div>
        </div>
    </div>


    <!-- ========================================== -->
    <!-- BOTTOM NAVIGATION BAR (White Theme)        -->
    <!-- ========================================== -->
    <nav class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-1.5 shadow-lg">
        <div class="max-w-md mx-auto grid grid-cols-4 px-2 gap-1">
            <!-- 0: AIML -->
            <button onclick="switchSubject(0)" id="tab-0" class="tab-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all">
                <svg class="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>
                <span class="text-[11px] font-bold">AIML</span>
            </button>
            <!-- 1: DBMS -->
            <button onclick="switchSubject(1)" id="tab-1" class="tab-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all">
                <svg class="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                <span class="text-[11px] font-bold">DBMS</span>
            </button>
            <!-- 2: DM&SM -->
            <button onclick="switchSubject(2)" id="tab-2" class="tab-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all">
                <svg class="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                <span class="text-[11px] font-bold">DM&SM</span>
            </button>
            <!-- 3: DSA -->
            <button onclick="switchSubject(3)" id="tab-3" class="tab-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all">
                <svg class="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>
                <span class="text-[11px] font-bold">DSA</span>
            </button>
        </div>
    </nav>


    <!-- Embedded Data & Scripts -->
    <script>
        // =========================================================================
        // CONFIGURATION: Default open subject
        //
        // Which subject opens on site load depends on this single number:
        //   0 = AIML
        //   1 = DBMS
        //   2 = DM&SM
        //   3 = DSA
        //
        // By default, index = 0 (AIML is shown first).
        // Change this number to 1, 2, or 3 to default to another subject!
        // =========================================================================
        let index = 0;

        const subjects = [
            { id: 0, name: "AIML", label: "AIML" },
            { id: 1, name: "DBMS", label: "DBMS" },
            { id: 2, name: "DM&SM", label: "DM&SM" },
            { id: 3, name: "DSA", label: "DSA" }
        ];

        // Preloaded DSA Code map for instant copy
        const dsaCodeMap = ${JSON.stringify(dsaCodeFiles)};

        // Preloaded DM&SM Experiments
        const dmsmExperiments = ${JSON.stringify(dmsmExperiments)};

        let activeModalFile = '';

        // Switch active subject
        function switchSubject(targetIndex) {
            index = parseInt(targetIndex, 10);
            if (isNaN(index) || index < 0 || index >= subjects.length) {
                index = 0;
            }

            for (let i = 0; i < subjects.length; i++) {
                const sec = document.getElementById('subject-' + i);
                const tab = document.getElementById('tab-' + i);
                const topTab = document.getElementById('top-tab-' + i);

                if (i === index) {
                    if (sec) sec.classList.remove('hidden');
                    if (tab) {
                        tab.className = 'tab-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all text-blue-600 bg-blue-50 font-bold border border-blue-100';
                    }
                    if (topTab) {
                        topTab.className = 'px-3 py-1 rounded-md transition-all font-semibold bg-white text-blue-600 shadow-sm border border-slate-200';
                    }
                } else {
                    if (sec) sec.classList.add('hidden');
                    if (tab) {
                        tab.className = 'tab-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all text-slate-500 hover:text-slate-800 hover:bg-slate-50';
                    }
                    if (topTab) {
                        topTab.className = 'px-3 py-1 rounded-md transition-all font-medium text-slate-500 hover:text-slate-800';
                    }
                }
            }

            const badge = document.getElementById('headerBadge');
            if (badge) badge.textContent = subjects[index].label;

            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('index', index);
            history.replaceState(null, '', currentUrl.toString());

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Copy helper with fallback
        function copyText(text, btnElement, successMsg = 'Copied!') {
            const originalHtml = btnElement.innerHTML;
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => {
                    btnElement.textContent = successMsg;
                    btnElement.style.background = '#16a34a';
                    btnElement.style.color = '#ffffff';
                    setTimeout(() => {
                        btnElement.innerHTML = originalHtml;
                        btnElement.style.background = '';
                        btnElement.style.color = '';
                    }, 2000);
                }).catch(() => fallbackCopy(text, btnElement, originalHtml, successMsg));
            } else {
                fallbackCopy(text, btnElement, originalHtml, successMsg);
            }
        }

        function fallbackCopy(text, btnElement, originalHtml, successMsg) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            try {
                document.execCommand('copy');
                btnElement.textContent = successMsg;
                btnElement.style.background = '#16a34a';
                btnElement.style.color = '#ffffff';
                setTimeout(() => {
                    btnElement.innerHTML = originalHtml;
                    btnElement.style.background = '';
                    btnElement.style.color = '';
                }, 2000);
            } catch (e) {
                btnElement.textContent = 'Error';
                setTimeout(() => { btnElement.innerHTML = originalHtml; }, 2000);
            }
            document.body.removeChild(ta);
        }

        function copyDsaCode(filename, btnElement) {
            const code = dsaCodeMap[filename];
            if (!code) {
                btnElement.textContent = 'Not found';
                setTimeout(() => { btnElement.textContent = 'Copy Code'; }, 2000);
                return;
            }
            copyText(code, btnElement, 'Copied!');
        }

        // Code Modal handlers
        function openCodeModal(filename) {
            activeModalFile = filename;
            const code = dsaCodeMap[filename] || '# File not found';
            
            document.getElementById('modalCodeTitle').textContent = filename;
            document.getElementById('modalCodeContent').textContent = code;
            
            const dlBtn = document.getElementById('modalDownloadBtn');
            dlBtn.href = '/files/dsa/' + encodeURIComponent(filename);
            dlBtn.setAttribute('download', filename);

            const modal = document.getElementById('codeModal');
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeCodeModal() {
            document.getElementById('codeModal').classList.add('hidden');
            document.body.style.overflow = '';
        }

        function copyCurrentModalCode() {
            const code = dsaCodeMap[activeModalFile];
            const btn = document.getElementById('modalCopyBtn');
            if (code && btn) {
                copyText(code, btn, 'Copied!');
            }
        }

        // PDF In-Page Preview handlers
        function previewPdf(pdfUrl, title) {
            document.getElementById('pdfModalTitle').textContent = title || pdfUrl;
            document.getElementById('pdfModalIframe').src = pdfUrl;
            document.getElementById('pdfModalNewTab').href = pdfUrl;
            document.getElementById('pdfModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closePdfModal() {
            document.getElementById('pdfModal').classList.add('hidden');
            document.getElementById('pdfModalIframe').src = '';
            document.body.style.overflow = '';
        }

        // DBMS Inline view
        function toggleDbmsInlineView() {
            const el = document.getElementById('dbmsInlineContainer');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }

        // DM&SM Detail view handlers
        function showDmsmDetail(id) {
            const exp = dmsmExperiments.find(e => e.id === id);
            if (!exp) return;

            document.getElementById('dmsmDetHeader').innerHTML = \`
                <div class="text-[11px] font-mono text-blue-600 mb-1 font-semibold">
                    EXPERIMENT #\${exp.id}
                </div>
                <h3 class="text-xl sm:text-2xl font-bold text-slate-900">\${exp.title}</h3>
                <p class="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">\${exp.desc}</p>
            \`;

            document.getElementById('dmsmDetSites').innerHTML = exp.sites.map(s => {
                const href = s.url.startsWith('http') ? s.url : (s.url === '#' ? '#' : 'https://' + s.url);
                return \`
                    <a href="\${href}" target="_blank" class="block p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-600 hover:text-blue-700 transition-colors text-xs font-medium truncate flex items-center justify-between">
                        <span class="truncate">\${s.name}</span>
                        <span class="text-slate-400">↗</span>
                    </a>
                \`;
            }).join('');

            document.getElementById('dmsmDetPlugins').innerHTML = exp.plugins.map(p => \`
                <span class="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium">
                    \${p}
                </span>
            \`).join('') || '<span class="text-xs text-slate-400">None</span>';

            document.getElementById('dmsmDetPoints').innerHTML = exp.points.map(pt => \`
                <li class="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span class="text-blue-600 shrink-0 font-bold">•</span>
                    <span class="leading-relaxed">\${pt}</span>
                </li>
            \`).join('');

            document.getElementById('dmsmListView').classList.add('hidden');
            document.getElementById('dmsmDetailView').classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function hideDmsmDetail() {
            document.getElementById('dmsmDetailView').classList.add('hidden');
            document.getElementById('dmsmListView').classList.remove('hidden');
        }

        // Markdown SQL copy button setup
        function setupMarkdownCopyButtons() {
            document.querySelectorAll('#inlineDbmsMd pre').forEach(pre => {
                if (pre.querySelector('.copy-sql-btn')) return;
                pre.style.position = 'relative';
                const code = pre.querySelector('code') || pre;
                const btn = document.createElement('button');
                btn.className = 'copy-sql-btn';
                btn.textContent = 'Copy SQL';
                btn.onclick = () => {
                    copyText(code.innerText, btn, 'Copied!');
                };
                pre.appendChild(btn);
            });
        }

        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeCodeModal();
                closePdfModal();
            }
        });

        // Initialize on DOM ready
        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('index')) {
                const paramIndex = parseInt(urlParams.get('index'), 10);
                if (!isNaN(paramIndex) && paramIndex >= 0 && paramIndex < subjects.length) {
                    index = paramIndex;
                }
            }

            switchSubject(index);
            setupMarkdownCopyButtons();
        });
    </script>
</body>
</html>`);
});

app.listen(PORT, () => {
    console.log(`PracticalVault Server running at http://localhost:${PORT}`);
});

export default app;
