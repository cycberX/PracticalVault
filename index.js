import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories (safe for both Windows and Linux / Vercel case sensitivity)
const osDir = path.join(__dirname, 'os');
const aimlDir = path.join(__dirname, 'aiml');
const dbmsDir = path.join(__dirname, 'dbms');
const dsaDir = fs.existsSync(path.join(__dirname, 'dsa', 'files'))
    ? path.join(__dirname, 'dsa', 'files')
    : path.join(__dirname, 'DSA', 'files');
const dmsmDir = path.join(__dirname, 'dmsm', 'public');

// Static file directories
app.use('/files/os', express.static(osDir));
app.use('/files/aiml', express.static(aimlDir));
app.use('/files/dbms', express.static(dbmsDir));
app.use('/files/dsa', express.static(dsaDir));
app.use('/files/dmsm', express.static(dmsmDir));

// Universal foolproof PDF delivery endpoint
app.get('/pdf/:subject/:file', (req, res) => {
    const { subject, file } = req.params;
    let safeDir = '';

    if (subject === 'os') safeDir = osDir;
    else if (subject === 'aiml') safeDir = aimlDir;
    else if (subject === 'dbms') safeDir = dbmsDir;
    else if (subject === 'dsa') safeDir = dsaDir;
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
    const pdfPath = fs.existsSync(path.join(dbmsDir, 'DBMS.pdf'))
        ? path.join(dbmsDir, 'DBMS.pdf')
        : path.join(dbmsDir, 'dbms.pdf');
    if (fs.existsSync(pdfPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="DBMS.pdf"');
        res.sendFile(pdfPath);
    } else {
        res.status(404).send('DBMS.pdf not found in dbms folder');
    }
});

app.get('/view-md', (req, res) => {
    const filePath = fs.existsSync(path.join(dbmsDir, 'DBMS.md'))
        ? path.join(dbmsDir, 'DBMS.md')
        : path.join(dbmsDir, 'dbms.md');

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
                        <a href="/?index=2" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-semibold shadow-sm transition-all">
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

// ==========================================
// DATASETS: OS (0), AIML (1), DBMS (2), DM&SM (3), DSA (4)
// ==========================================

// 0. OS Practicals Dataset (Index 0)
const osPracticals = [
    {
        id: 1,
        title: "Shell Scripting: Student Database Management System",
        category: "Shell Scripting",
        language: "Bash / Shell",
        desc: "Interactive menu-driven shell script for student database with create, insert, search, display, modify, and delete operations using sed and grep.",
        files: [
            {
                name: "exp1.sh",
                label: "Shell Script (.sh)",
                badge: "Bash",
                badgeColor: "amber",
                cmd: "bash exp1.sh",
                id: "1",
                curlPath: "os/1"
            }
        ]
    },
    {
        id: 2,
        title: "Process Creation & Execution Control (fork, wait, getpid)",
        category: "Process Control",
        language: "C",
        desc: "Demonstrates process creation with fork(), synchronization with wait(), and sorting execution in parent and child processes with PID tracking.",
        files: [
            {
                name: "exp2.c",
                label: "C Source (.c)",
                badge: "C",
                badgeColor: "blue",
                cmd: "gcc exp2.c -o exp2 && ./exp2",
                id: "2",
                curlPath: "os/2"
            }
        ]
    },
    {
        id: 3,
        title: "Producer-Consumer Problem (Semaphores & Mutex)",
        category: "Process Synchronization",
        language: "C / POSIX",
        desc: "Classic process synchronization problem solving bounded-buffer producer-consumer race conditions using sem_wait, sem_post, and pthread_mutex.",
        files: [
            {
                name: "exp3.c",
                label: "C Source (.c)",
                badge: "C Threads",
                badgeColor: "indigo",
                cmd: "gcc exp3.c -o exp3 -pthread && ./exp3",
                id: "3",
                curlPath: "os/3"
            }
        ]
    },
    {
        id: 4,
        title: "Dining Philosophers Problem using Semaphores",
        category: "Deadlock & Synchronization",
        language: "C / POSIX",
        desc: "Simulation of five philosophers thinking and eating with shared forks using semaphore-based mutual exclusion to avoid deadlock and starvation.",
        files: [
            {
                name: "exp4.c",
                label: "C Source (.c)",
                badge: "C Threads",
                badgeColor: "indigo",
                cmd: "gcc exp4.c -o exp4 -pthread && ./exp4",
                id: "4",
                curlPath: "os/4"
            }
        ]
    },
    {
        id: 5,
        title: "Banker's Algorithm for Deadlock Avoidance",
        category: "Deadlock Avoidance",
        language: "C",
        desc: "Implements Dijkstra's Banker's algorithm to analyze allocation, max, need, and available vectors/matrices, calculating safe execution sequences.",
        files: [
            {
                name: "exp5.c",
                label: "C Source (.c)",
                badge: "C",
                badgeColor: "blue",
                cmd: "gcc exp5.c -o exp5 && ./exp5",
                id: "5",
                curlPath: "os/5"
            }
        ]
    },
    {
        id: 6,
        title: "Inter-Process Communication using Named Pipes (FIFO)",
        category: "IPC - FIFO / Named Pipes",
        language: "C",
        desc: "Two-way communication between unrelated processes using POSIX FIFOs (mkfifo). Server sends a message; client analyzes lines, words, and characters and sends back statistics.",
        files: [
            {
                name: "exp6_server.c",
                label: "Server Process (.c)",
                badge: "Server",
                badgeColor: "emerald",
                cmd: "gcc exp6_server.c -o exp6_server && ./exp6_server",
                id: "6s",
                curlPath: "os/6s"
            },
            {
                name: "exp6_client.c",
                label: "Client Process (.c)",
                badge: "Client",
                badgeColor: "cyan",
                cmd: "gcc exp6_client.c -o exp6_client && ./exp6_client",
                id: "6c",
                curlPath: "os/6c"
            }
        ]
    },
    {
        id: 7,
        title: "Inter-Process Communication using Ordinary Pipes (pipe)",
        category: "IPC - Ordinary Pipes",
        language: "C",
        desc: "Unidirectional IPC between related parent and child processes using the pipe() system call. Parent sends file name through pipe, child reads and displays file content.",
        files: [
            {
                name: "exp7.c",
                label: "C Source (.c)",
                badge: "C",
                badgeColor: "blue",
                cmd: "gcc exp7.c -o exp7 && ./exp7",
                id: "7",
                curlPath: "os/7"
            }
        ]
    },
    {
        id: 8,
        title: "Disk Scheduling Algorithms (SSTF, SCAN, C-LOOK)",
        category: "Disk Scheduling",
        language: "C",
        desc: "Implementation and comparative head movement analysis of Shortest Seek Time First (SSTF), Elevator (SCAN), and Circular LOOK (C-LOOK) disk arm scheduling.",
        files: [
            {
                name: "exp8.c",
                label: "C Source (.c)",
                badge: "C",
                badgeColor: "blue",
                cmd: "gcc exp8.c -o exp8 && ./exp8",
                id: "8",
                curlPath: "os/8"
            }
        ]
    }
];

// 1. AIML Practicals Dataset
const aimlPracticals = [
    { id: 1, title: "Intelligent Agents & PEAS Representation", file: "intelligent-agents-peas.pdf" },
    { id: 2, title: "Breadth First Search (BFS) & Depth First Search (DFS)", file: "bfs-dfs.pdf" },
    { id: 3, title: "Greedy Best-First Search & A* Search", file: "greedy-a-star.pdf" },
    { id: 4, title: "Forward & Backward Chaining", file: "forward-backward-chaining.pdf" },
    { id: 5, title: "Data Preprocessing", file: "data-preprocessing.pdf" },
    { id: 6, title: "Decision Tree & Naive Bayes", file: "decision-tree-naive-bayes.pdf" },
    { id: 7, title: "Linear Regression & Polynomial Regression", file: "linear-polynomial-regression.pdf" },
    { id: 8, title: "Logistic Regression & K-Nearest Neighbors (KNN)", file: "logistic-regression-knn.pdf" },
    { id: 9, title: "SVM, Random Forest & AdaBoost", file: "svm-random-forest-adaboost.pdf" },
    { id: 10, title: "K-Means & Hierarchical Clustering", file: "kmeans-hierarchical-clustering.pdf" },
    { id: 11, title: "Principal Component Analysis (PCA)", file: "pca.pdf" }
];

// 2. DM&SM Experiments Dataset
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

// 4. DSA Topics Dataset (Index 4)
const dsaTopics = [
    {
        id: 1,
        title: "AI Search Algorithm (BFS Maze Solver)",
        pdf: "ai-search-algo.pdf",
        code: "ai-search-algo.py",
        desc: "Breadth-First Search (BFS) graph algorithm finding the shortest path in a 2D grid/maze."
    },
    {
        id: 2,
        title: "Binary Search Tree (BST)",
        pdf: "bst.pdf",
        code: "bst.py",
        desc: "Binary Search Tree with insertion, deletion, and in-order, pre-order, and post-order traversals."
    },
    {
        id: 3,
        title: "Divide & Conquer (Merge Sort)",
        pdf: "divide-conquer.pdf",
        code: "divide-conquer-merge-sort.py",
        desc: "Recursive divide-and-conquer sorting algorithm with guaranteed O(n log n) time complexity."
    },
    {
        id: 4,
        title: "Graph (Minimum Spanning Tree - Kruskal & Prim)",
        pdf: "graph-mst.pdf",
        code: "graph-mst.py",
        desc: "Greedy graph algorithms calculating minimum spanning tree weights using Prim and Kruskal."
    },
    {
        id: 5,
        title: "Greedy Algorithm (Fractional Knapsack)",
        pdf: "greedy-algo.pdf",
        code: "greedy-fractional-knapsack.py",
        desc: "Greedy choice property maximizing item value density under fixed capacity limit."
    },
    {
        id: 6,
        title: "Heap Data Structure & Heap Sort",
        pdf: "heap.pdf",
        code: "heap.py",
        desc: "Binary max-heap construction, sift-down heapify, and in-place sorting routines."
    },
    {
        id: 7,
        title: "String Processing (Naive String Matching)",
        pdf: "naive-string-matching.pdf",
        code: "naive-string-matching.py",
        desc: "Pattern search algorithm checking every sliding position against the target text."
    },
    {
        id: null,
        title: "Queue Data Structure",
        pdf: "queue.pdf",
        code: null,
        desc: "First-In-First-Out (FIFO) linear data structure operations and applications."
    },
    {
        id: null,
        title: "Search & Sort Algorithms",
        pdf: "search-and-sort.pdf",
        code: null,
        desc: "Comprehensive reference of linear/binary search and elementary sorting algorithms."
    },
    {
        id: null,
        title: "Stack Data Structure",
        pdf: "stack.pdf",
        code: null,
        desc: "Last-In-First-Out (LIFO) stack operations, recursion modeling, and expression evaluation."
    }
];

// Helper to read all DSA code files
function getDsaCodeFiles() {
    const codeFiles = {};
    if (fs.existsSync(dsaDir)) {
        const files = fs.readdirSync(dsaDir);
        files.forEach(f => {
            if (f.endsWith('.py')) {
                codeFiles[f] = fs.readFileSync(path.join(dsaDir, f), 'utf8');
            }
        });
    }
    return codeFiles;
}

// Helper to read all OS code files
function getOsCodeFiles() {
    const codeFiles = {};
    if (fs.existsSync(osDir)) {
        const files = fs.readdirSync(osDir);
        files.forEach(f => {
            if (f.endsWith('.c') || f.endsWith('.sh')) {
                codeFiles[f] = fs.readFileSync(path.join(osDir, f), 'utf8');
            }
        });
    }
    return codeFiles;
}

// Helper to read DBMS markdown
function getDbmsText() {
    const p = fs.existsSync(path.join(dbmsDir, 'DBMS.md'))
        ? path.join(dbmsDir, 'DBMS.md')
        : path.join(dbmsDir, 'dbms.md');
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

// Check if incoming request is from curl / terminal client
function isCurlRequest(req) {
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const accept = (req.headers['accept'] || '').toLowerCase();
    return req.query.format === 'text' ||
           req.query.raw === '1' ||
           ua.includes('curl') ||
           ua.includes('wget') ||
           ua.includes('httpie') ||
           ua.includes('powershell') ||
           (accept.includes('text/plain') && !accept.includes('text/html'));
}

// Resolution map for OS files
const osAliasMap = {
    '1': 'exp1.sh',
    'exp1': 'exp1.sh',
    'exp1.sh': 'exp1.sh',
    '2': 'exp2.c',
    'exp2': 'exp2.c',
    'exp2.c': 'exp2.c',
    '3': 'exp3.c',
    'exp3': 'exp3.c',
    'exp3.c': 'exp3.c',
    '4': 'exp4.c',
    'exp4': 'exp4.c',
    'exp4.c': 'exp4.c',
    '5': 'exp5.c',
    'exp5': 'exp5.c',
    'exp5.c': 'exp5.c',
    '6': 'exp6_server.c',
    '6s': 'exp6_server.c',
    'server': 'exp6_server.c',
    'exp6_server': 'exp6_server.c',
    'exp6_server.c': 'exp6_server.c',
    '6c': 'exp6_client.c',
    'client': 'exp6_client.c',
    'exp6_client': 'exp6_client.c',
    'exp6_client.c': 'exp6_client.c',
    '7': 'exp7.c',
    'exp7': 'exp7.c',
    'exp7.c': 'exp7.c',
    '8': 'exp8.c',
    'exp8': 'exp8.c',
    'exp8.c': 'exp8.c'
};

// Resolution map for DSA files (numbers 1-7 match DSA files)
const dsaAliasMap = {
    '1': 'ai-search-algo.py',
    '2': 'bst.py',
    '3': 'divide-conquer-merge-sort.py',
    '4': 'graph-mst.py',
    '5': 'greedy-fractional-knapsack.py',
    '6': 'heap.py',
    '7': 'naive-string-matching.py',
    'bst': 'bst.py',
    'bst.py': 'bst.py',
    'heap': 'heap.py',
    'heap.py': 'heap.py',
    'ai': 'ai-search-algo.py',
    'ai-search': 'ai-search-algo.py',
    'ai-search-algo.py': 'ai-search-algo.py',
    'merge': 'divide-conquer-merge-sort.py',
    'divide': 'divide-conquer-merge-sort.py',
    'divide-conquer': 'divide-conquer-merge-sort.py',
    'divide-conquer-merge-sort.py': 'divide-conquer-merge-sort.py',
    'graph': 'graph-mst.py',
    'mst': 'graph-mst.py',
    'graph-mst.py': 'graph-mst.py',
    'greedy': 'greedy-fractional-knapsack.py',
    'knapsack': 'greedy-fractional-knapsack.py',
    'greedy-fractional-knapsack.py': 'greedy-fractional-knapsack.py',
    'string': 'naive-string-matching.py',
    'naive': 'naive-string-matching.py',
    'naive-string-matching.py': 'naive-string-matching.py'
};

// Universal code file resolver
function resolveCodeFile(subject, query) {
    if (!subject || !query) return null;
    const sub = subject.toLowerCase().trim();
    const q = query.toLowerCase().trim();

    if (sub === 'os') {
        const mapped = osAliasMap[q] || q;
        const filePath = path.join(osDir, mapped);
        if (fs.existsSync(filePath)) {
            return {
                filename: mapped,
                content: fs.readFileSync(filePath, 'utf8'),
                lang: mapped.endsWith('.sh') ? 'bash' : 'c',
                subject: 'os'
            };
        }
    } else if (sub === 'dsa') {
        const mapped = dsaAliasMap[q] || q;
        const filePath = path.join(dsaDir, mapped);
        if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
            return {
                filename: mapped,
                content: fs.readFileSync(filePath, 'utf8'),
                lang: 'python',
                subject: 'dsa'
            };
        }
    } else if (sub === 'dbms') {
        const content = getDbmsText();
        if (content) {
            return {
                filename: 'DBMS.md',
                content,
                lang: 'markdown',
                subject: 'dbms'
            };
        }
    }
    return null;
}

// Clean helper to pad string
function pad(str, len) {
    str = String(str || '');
    return str.padEnd(len, ' ');
}

// Generate OS practical list for curl
function generateOsCurlList(req) {
    const host = req.get('host') || 'localhost:3000';
    const proto = req.protocol || 'http';
    const base = `${proto}://${host}`;

    let out = `[OS] AVAILABLE PRACTICAL FILES & ACCESSING IDs:\n`;
    out += `--------------------------------------------------------------------------------\n`;
    out += `${pad('ID', 5)} ${pad('FILE', 18)} ${pad('CURL COMMAND', 28)} DESCRIPTION\n`;
    out += `--------------------------------------------------------------------------------\n`;

    osPracticals.forEach(p => {
        p.files.forEach(f => {
            const shortDesc = p.title.replace('Shell Scripting: ', '').replace('Inter-Process Communication using ', 'IPC: ');
            out += `${pad(f.id, 5)} ${pad(f.name, 18)} ${pad(`curl -s ${base}/${f.curlPath}`, 28)} ${shortDesc}\n`;
        });
    });

    out += `--------------------------------------------------------------------------------\n`;
    out += `Fetch file: curl -s ${base}/os/<id>\n`;
    out += `Save file:  curl -s ${base}/os/<id> > <filename>\n`;
    out += `Run bash:   curl -s ${base}/os/1 | bash\n`;
    return out;
}

// Generate DSA practical list for curl
function generateDsaCurlList(req) {
    const host = req.get('host') || 'localhost:3000';
    const proto = req.protocol || 'http';
    const base = `${proto}://${host}`;

    let out = `[DSA] AVAILABLE PRACTICAL FILES & ACCESSING IDs:\n`;
    out += `--------------------------------------------------------------------------------\n`;
    out += `${pad('ID', 5)} ${pad('FILE', 30)} ${pad('CURL COMMAND', 28)} DESCRIPTION\n`;
    out += `--------------------------------------------------------------------------------\n`;

    dsaTopics.filter(t => t.code).forEach(t => {
        out += `${pad(t.id, 5)} ${pad(t.code, 30)} ${pad(`curl -s ${base}/dsa/${t.id}`, 28)} ${t.title}\n`;
    });

    out += `--------------------------------------------------------------------------------\n`;
    out += `Fetch file: curl -s ${base}/dsa/<id>  (or curl -s ${base}/dsa/<filename>)\n`;
    out += `Save file:  curl -s ${base}/dsa/<id> > <filename>\n`;
    out += `Run python: curl -s ${base}/dsa/<id> | python3\n`;
    return out;
}

// Generate DBMS practical list for curl
function generateDbmsCurlList(req) {
    const host = req.get('host') || 'localhost:3000';
    const proto = req.protocol || 'http';
    const base = `${proto}://${host}`;

    let out = `[DBMS] AVAILABLE PRACTICAL FILES & ACCESSING IDs:\n`;
    out += `--------------------------------------------------------------------------------\n`;
    out += `${pad('ID', 5)} ${pad('FILE', 18)} ${pad('CURL COMMAND', 28)} DESCRIPTION\n`;
    out += `--------------------------------------------------------------------------------\n`;
    out += `${pad('1', 5)} ${pad('DBMS.md', 18)} ${pad(`curl -s ${base}/dbms/1`, 28)} Full Solved SQL Queries & Schema (MD)\n`;
    out += `${pad('2', 5)} ${pad('DBMS.pdf', 18)} ${pad(`curl -s ${base}/dbms/2`, 28)} Full DBMS Practical Lab Report (PDF)\n`;
    out += `--------------------------------------------------------------------------------\n`;
    out += `Fetch SQL Markdown: curl -s ${base}/dbms/1\n`;
    out += `Download Lab PDF:   curl -s -O ${base}/dbms/2\n`;
    return out;
}

// Generate AIML practical list for curl
function generateAimlCurlList(req) {
    const host = req.get('host') || 'localhost:3000';
    const proto = req.protocol || 'http';
    const base = `${proto}://${host}`;

    let out = `[AIML] AVAILABLE PRACTICAL FILES & ACCESSING IDs:\n`;
    out += `--------------------------------------------------------------------------------\n`;
    out += `${pad('ID', 5)} ${pad('FILE', 35)} ${pad('CURL COMMAND', 30)} TITLE\n`;
    out += `--------------------------------------------------------------------------------\n`;

    aimlPracticals.forEach(p => {
        out += `${pad(p.id, 5)} ${pad(p.file, 35)} ${pad(`curl -s -O ${base}/aiml/${p.id}`, 30)} ${p.title}\n`;
    });

    out += `--------------------------------------------------------------------------------\n`;
    out += `Download PDF: curl -s -O ${base}/aiml/<id>  (or curl -s -O ${base}/aiml/<filename>)\n`;
    return out;
}

// Generate DM&SM practical list for curl
function generateDmsmCurlList(req) {
    const host = req.get('host') || 'localhost:3000';
    const proto = req.protocol || 'http';
    const base = `${proto}://${host}`;

    let out = `[DM&SM] AVAILABLE EXPERIMENTS & ACCESSING IDs:\n`;
    out += `--------------------------------------------------------------------------------\n`;
    out += `${pad('ID', 5)} ${pad('CURL COMMAND', 28)} EXPERIMENT TITLE\n`;
    out += `--------------------------------------------------------------------------------\n`;

    dmsmExperiments.forEach(e => {
        out += `${pad(e.id, 5)} ${pad(`curl -s ${base}/dmsm/${e.id}`, 28)} ${e.title}\n`;
    });

    out += `--------------------------------------------------------------------------------\n`;
    out += `Fetch experiment notes: curl -s ${base}/dmsm/<id>\n`;
    return out;
}

// Generate Global Curl CheatSheet
function generateCurlCheatSheet(req) {
    const host = req.get('host') || 'localhost:3000';
    const proto = req.protocol || 'http';
    const base = `${proto}://${host}`;

    let out = `PRACTICALVAULT - ALL SUBJECTS & CURL ACCESS:\n`;
    out += `--------------------------------------------------------------------------------\n`;
    out += `${pad('SUBJECT', 10)} ${pad('CURL COMMAND', 28)} DESCRIPTION\n`;
    out += `--------------------------------------------------------------------------------\n`;
    out += `${pad('os', 10)} ${pad(`curl -s ${base}/os`, 28)} Operating Systems (C & Bash Practicals)\n`;
    out += `${pad('aiml', 10)} ${pad(`curl -s ${base}/aiml`, 28)} Artificial Intelligence & Machine Learning\n`;
    out += `${pad('dbms', 10)} ${pad(`curl -s ${base}/dbms`, 28)} Database Management Systems (SQL & Schema)\n`;
    out += `${pad('dmsm', 10)} ${pad(`curl -s ${base}/dmsm`, 28)} Digital Marketing & Social Media\n`;
    out += `${pad('dsa', 10)} ${pad(`curl -s ${base}/dsa`, 28)} Data Structures & Algorithms (Python)\n`;
    out += `--------------------------------------------------------------------------------\n`;
    out += `Show files for any subject: curl -s ${base}/<subject>\n`;
    out += `Fetch file directly by ID:  curl -s ${base}/<subject>/<id>\n`;
    return out;
}

// ==========================================
// CURL & TERMINAL API ROUTES
// ==========================================

// Global CLI / curl cheatsheet
app.get(['/curl', '/terminal', '/cli', '/api/curl'], (req, res) => {
    if (isCurlRequest(req)) {
        return res.type('text/plain; charset=utf-8').send(generateCurlCheatSheet(req));
    }

    // If viewed in browser, render clean visual documentation page
    const host = req.get('host') || 'localhost:3000';
    const proto = req.protocol || 'http';
    const base = `${proto}://${host}`;

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminal Curl API - PracticalVault</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #0b0f19; color: #f1f5f9; }
        pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    </style>
</head>
<body class="p-4 sm:p-8 max-w-5xl mx-auto">
    <div class="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold mb-2">
                ⚡ TERMINAL CURL API
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">PracticalVault via Terminal</h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">Directly fetch, pipe, and compile any practical code from your command line using simple numeric IDs.</p>
        </div>
        <div class="flex items-center gap-2">
            <a href="/?index=0" class="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors">
                ← Web Vault
            </a>
            <a href="/curl?format=text" class="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors">
                Raw Text
            </a>
        </div>
    </div>

    <!-- Quick instructions -->
    <div class="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 class="text-sm font-bold text-slate-200">How to use from terminal</h2>
        <p class="text-xs text-slate-400">Run any of the following commands directly in your terminal (macOS, Linux, WSL, Git Bash, or PowerShell):</p>
        <div class="bg-black/60 rounded-lg p-3 text-xs font-mono text-emerald-400 border border-slate-800/80 space-y-1">
            <p><span class="text-slate-500"># Fetch and run OS Exp 1 (Student DB):</span></p>
            <p>curl -s ${base}/os/1 > exp1.sh && bash exp1.sh</p>
            <p class="pt-2"><span class="text-slate-500"># Fetch and compile OS Exp 2 (Process Fork/Wait):</span></p>
            <p>curl -s ${base}/os/2 > exp2.c && gcc exp2.c -o exp2 && ./exp2</p>
            <p class="pt-2"><span class="text-slate-500"># Run DSA Binary Search Tree in Python:</span></p>
            <p>curl -s ${base}/dsa/2 | python3</p>
            <p class="pt-2"><span class="text-slate-500"># List available files for any subject:</span></p>
            <p>curl -s ${base}/os</p>
            <p>curl -s ${base}/dsa</p>
        </div>
    </div>

    <!-- OS Section -->
    <div class="mt-8 space-y-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span>Operating Systems (OS) Endpoints</span>
            <span class="text-xs font-normal text-slate-400 font-mono">/os/:id</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${osPracticals.map(p => `
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-blue-400">#${p.id} ${p.category}</span>
                        <span class="font-mono text-slate-500 text-[11px]">${p.files.map(f => f.name).join(', ')}</span>
                    </div>
                    <div class="text-sm font-semibold text-slate-200">${p.title}</div>
                    <div class="space-y-1.5 pt-1">
                        ${p.files.map(f => `
                            <div class="flex items-center justify-between bg-black/60 px-2.5 py-1.5 rounded text-xs font-mono border border-slate-800">
                                <span class="text-emerald-400 truncate">curl -s ${base}/${f.curlPath}</span>
                                <button onclick="navigator.clipboard.writeText('curl -s ${base}/${f.curlPath}'); this.textContent='✓'; setTimeout(()=>this.textContent='Copy', 1500);" class="ml-2 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
                                    Copy
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <!-- DSA Section -->
    <div class="mt-8 space-y-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span>Data Structures & Algorithms (DSA) Endpoints</span>
            <span class="text-xs font-normal text-slate-400 font-mono">/dsa/:id</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${dsaTopics.filter(t => t.code).map(t => `
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-purple-400">#${t.id} Python Algorithm</span>
                        <span class="font-mono text-slate-500 text-[11px]">${t.code}</span>
                    </div>
                    <div class="text-sm font-semibold text-slate-200">${t.title}</div>
                    <div class="flex items-center justify-between bg-black/60 px-2.5 py-1.5 rounded text-xs font-mono border border-slate-800">
                        <span class="text-emerald-400 truncate">curl -s ${base}/dsa/${t.id}</span>
                        <button onclick="navigator.clipboard.writeText('curl -s ${base}/dsa/${t.id}'); this.textContent='✓'; setTimeout(()=>this.textContent='Copy', 1500);" class="ml-2 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
                            Copy
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="mt-12 text-center text-xs text-slate-500 pb-12">
        PracticalVault • Fast curl & browser access for academic coding practicals
    </div>
</body>
</html>`);
});

// OS Practical Curl Route (/os, /os/:file)
app.get('/os', (req, res) => {
    if (isCurlRequest(req)) {
        return res.type('text/plain; charset=utf-8').send(generateOsCurlList(req));
    }
    // Browser access redirects directly to OS tab (index 0) in web dashboard
    res.redirect('/?index=0');
});

app.get('/os/:file', (req, res) => {
    const file = req.params.file;
    const resolved = resolveCodeFile('os', file);
    if (!resolved) {
        return res.status(404).type('text/plain; charset=utf-8').send(`Error: OS Practical file '${file}' not found.\nUse 'curl -s ${req.protocol}://${req.get('host')}/os' to list all available OS files and IDs.\n`);
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(resolved.content);
});

// DSA Practical Curl Route (/dsa, /dsa/:file)
app.get('/dsa', (req, res) => {
    if (isCurlRequest(req)) {
        return res.type('text/plain; charset=utf-8').send(generateDsaCurlList(req));
    }
    res.redirect('/?index=4');
});

app.get('/dsa/:file', (req, res) => {
    const file = req.params.file;
    const resolved = resolveCodeFile('dsa', file);
    if (!resolved) {
        return res.status(404).type('text/plain; charset=utf-8').send(`Error: DSA file '${file}' not found.\nUse 'curl -s ${req.protocol}://${req.get('host')}/dsa' to list all available DSA files and IDs.\n`);
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(resolved.content);
});

// DBMS Practical Curl Route (/dbms, /dbms/:file)
app.get('/dbms', (req, res) => {
    if (isCurlRequest(req)) {
        return res.type('text/plain; charset=utf-8').send(generateDbmsCurlList(req));
    }
    res.redirect('/?index=2');
});

app.get('/dbms/:file', (req, res) => {
    const file = req.params.file.toLowerCase().trim();
    if (file === '2' || file === 'pdf' || file === 'dbms.pdf') {
        const pdfPath = fs.existsSync(path.join(dbmsDir, 'DBMS.pdf'))
            ? path.join(dbmsDir, 'DBMS.pdf')
            : path.join(dbmsDir, 'dbms.pdf');
        if (fs.existsSync(pdfPath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="DBMS.pdf"');
            return res.sendFile(pdfPath);
        }
        return res.status(404).type('text/plain').send('DBMS.pdf not found');
    }
    const content = getDbmsText();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
});

// AIML Curl Route (/aiml, /aiml/:id)
app.get('/aiml', (req, res) => {
    if (isCurlRequest(req)) {
        return res.type('text/plain; charset=utf-8').send(generateAimlCurlList(req));
    }
    res.redirect('/?index=1');
});

app.get('/aiml/:id', (req, res) => {
    const id = req.params.id.toLowerCase().trim();
    let targetPdf = '';
    const numericIndex = parseInt(id, 10);
    if (!isNaN(numericIndex) && numericIndex >= 1 && numericIndex <= aimlPracticals.length) {
        targetPdf = aimlPracticals[numericIndex - 1].file;
    } else {
        const found = aimlPracticals.find(p => p.file.toLowerCase() === id || p.file.toLowerCase() === id + '.pdf');
        if (found) targetPdf = found.file;
    }

    if (!targetPdf) {
        return res.status(404).type('text/plain').send(`Error: AIML file '${id}' not found. Use 'curl -s ${req.protocol}://${req.get('host')}/aiml' for available IDs.\n`);
    }

    const fullPath = path.join(aimlDir, targetPdf);
    if (fs.existsSync(fullPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + targetPdf + '"');
        return res.sendFile(fullPath);
    }
    res.status(404).type('text/plain').send('PDF file not found on disk');
});

// DM&SM Curl Route (/dmsm, /dmsm/:id)
app.get('/dmsm', (req, res) => {
    if (isCurlRequest(req)) {
        return res.type('text/plain; charset=utf-8').send(generateDmsmCurlList(req));
    }
    res.redirect('/?index=3');
});

app.get('/dmsm/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const exp = dmsmExperiments.find(e => e.id === id);
    if (!exp) {
        return res.status(404).type('text/plain').send(`Error: Experiment '${req.params.id}' not found. Use 'curl -s ${req.protocol}://${req.get('host')}/dmsm' for available IDs.\n`);
    }

    let out = `EXPERIMENT #${exp.id}: ${exp.title}\n`;
    out += `Description: ${exp.desc}\n\n`;
    out += `CONNECTED SITES:\n`;
    exp.sites.forEach(s => out += ` - ${s.name}: ${s.url}\n`);
    out += `\nACTIVE PLUGINS:\n`;
    exp.plugins.forEach(p => out += ` - ${p}\n`);
    out += `\nKEY POINTS:\n`;
    exp.points.forEach(pt => {
        out += ` • ${pt.replace(/<[^>]*>/g, '')}\n`;
    });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(out);
});

// Universal Raw Route (/raw/:subject/:file)
app.get('/raw/:subject/:file', (req, res) => {
    const { subject, file } = req.params;
    const resolved = resolveCodeFile(subject, file);
    if (!resolved) {
        return res.status(404).type('text/plain; charset=utf-8').send(`Error: File '${file}' not found in subject '${subject}'.`);
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(resolved.content);
});

// API endpoint to retrieve code by filename
app.get('/api/code/:subject/:filename', (req, res) => {
    const { subject, filename } = req.params;
    const resolved = resolveCodeFile(subject, filename);
    if (!resolved) {
        return res.status(404).json({ error: 'File not found' });
    }
    res.json(resolved);
});

app.get('/api/code/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    const osResolved = resolveCodeFile('os', filename);
    if (osResolved) return res.json(osResolved);
    const dsaResolved = resolveCodeFile('dsa', filename);
    if (dsaResolved) return res.json(dsaResolved);
    return res.status(404).json({ error: 'File not found' });
});


// ==========================================
// MAIN DASHBOARD ROUTE (GET /)
// ==========================================
app.get('/', (req, res) => {
    if (isCurlRequest(req)) {
        return res.type('text/plain; charset=utf-8').send(generateCurlCheatSheet(req));
    }

    // Preload DSA Python code for 0-latency instant copy
    const dsaCodeFiles = getDsaCodeFiles();

    // Preload OS C & Bash code for 0-latency instant copy
    const osCodeFiles = getOsCodeFiles();

    // Preload DBMS Markdown HTML
    let dbmsHtml = '';
    const dbmsMdText = getDbmsText();
    if (dbmsMdText) {
        dbmsHtml = marked.parse(dbmsMdText);
    }

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
                            OS
                        </span>
                    </h1>
                </div>
            </div>

            <!-- Desktop View Selector Pills (OS at index 0) + Curl Button -->
            <div class="flex items-center gap-2">
                <div class="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                    <button onclick="switchSubject(0)" id="top-tab-0" class="px-3 py-1 rounded-md transition-all font-semibold bg-white text-blue-600 shadow-sm border border-slate-200">OS</button>
                    <button onclick="switchSubject(1)" id="top-tab-1" class="px-3 py-1 rounded-md transition-all font-medium text-slate-500 hover:text-slate-800">AIML</button>
                    <button onclick="switchSubject(2)" id="top-tab-2" class="px-3 py-1 rounded-md transition-all font-medium text-slate-500 hover:text-slate-800">DBMS</button>
                    <button onclick="switchSubject(3)" id="top-tab-3" class="px-3 py-1 rounded-md transition-all font-medium text-slate-500 hover:text-slate-800">DM&SM</button>
                    <button onclick="switchSubject(4)" id="top-tab-4" class="px-3 py-1 rounded-md transition-all font-medium text-slate-500 hover:text-slate-800">DSA</button>
                </div>
                <a href="/curl" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all border border-slate-800" title="Terminal Curl API">
                    <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                    <span>curl API</span>
                </a>
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 pt-5 pb-28">

        <!-- ========================================== -->
        <!-- SUBJECT 0: OS (Default open at Index 0)    -->
        <!-- ========================================== -->
        <section id="subject-0" class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                        Operating Systems (OS)
                        <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            C & Bash Practicals
                        </span>
                    </h2>
                    <p class="text-xs text-slate-500 mt-0.5">Shell scripting, process management, synchronization, deadlocks & IPC with instant copy and curl access</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        ${osPracticals.length} Practicals (9 Files)
                    </span>
                    <button onclick="copyCurlCommand('curl -s ' + window.location.origin + '/os', this)" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium transition-colors">
                        <span>curl /os</span>
                        <span class="text-slate-400">📋</span>
                    </button>
                </div>
            </div>

            <!-- OS Practicals Grid (3 cards on desktop) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${osPracticals.map(exp => `
                <div class="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-bold text-slate-400">#${exp.id}</span>
                            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                ${exp.category}
                            </span>
                        </div>

                        <h3 class="text-sm font-semibold text-slate-900 mt-2">
                            ${exp.title}
                        </h3>
                        <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            ${exp.desc}
                        </p>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                        ${exp.files.map(file => `
                            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
                                        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                        ${file.name}
                                    </span>
                                    <span class="text-[10px] px-1.5 py-0.5 rounded font-medium ${file.badgeColor === 'amber' ? 'bg-amber-50 text-amber-700 border border-amber-200' : (file.badgeColor === 'emerald' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (file.badgeColor === 'cyan' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-blue-50 text-blue-700 border border-blue-200'))}">
                                        ${file.badge}
                                    </span>
                                </div>

                                <!-- Compile / Run command snippet -->
                                <div class="flex items-center justify-between bg-slate-900 text-slate-200 px-2.5 py-1.5 rounded text-[11px] font-mono shadow-inner">
                                    <span class="truncate max-w-[200px]" title="${file.cmd}">$ ${file.cmd}</span>
                                    <button onclick="copyText('${file.cmd.replace(/'/g, "\\'")}', this, 'Copied!')" class="text-slate-400 hover:text-white ml-1 text-[11px] shrink-0 font-medium" title="Copy command">
                                        📋 Copy
                                    </button>
                                </div>

                                <!-- Action buttons -->
                                <div class="flex items-center gap-1.5 pt-0.5">
                                    <button onclick="openCodeModal('${file.name}', 'os', '${file.cmd.replace(/'/g, "\\'")}', '${file.curlPath}')"
                                            class="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                                        Code
                                    </button>

                                    <button onclick="copyOsCode('${file.name}', this)"
                                            class="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                                        Copy
                                    </button>

                                    <a href="/files/os/${file.name}" download="${file.name}"
                                       class="inline-flex items-center justify-center py-1.5 px-2 rounded-md bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 transition-colors shrink-0" title="Download ${file.name}">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/></svg>
                                    </a>

                                    <button onclick="copyCurlCommand('curl -s ' + window.location.origin + '/${file.curlPath}', this)"
                                            class="inline-flex items-center justify-center py-1.5 px-2 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-medium transition-colors shrink-0" title="Copy curl command for terminal">
                                        curl
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                `).join('')}
            </div>
        </section>


        <!-- ========================================== -->
        <!-- SUBJECT 1: AIML                            -->
        <!-- ========================================== -->
        <section id="subject-1" class="hidden space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                        Artificial Intelligence & Machine Learning
                    </h2>
                    <p class="text-xs text-slate-500 mt-0.5">11 Solved practical PDF documents</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        ${aimlPracticals.length} Practicals
                    </span>
                    <button onclick="copyCurlCommand('curl -s ' + window.location.origin + '/aiml', this)" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium transition-colors">
                        <span>curl /aiml</span>
                        <span class="text-slate-400">📋</span>
                    </button>
                </div>
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
        <!-- SUBJECT 2: DBMS                            -->
        <!-- ========================================== -->
        <section id="subject-2" class="hidden space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                        Database Management Systems
                    </h2>
                    <p class="text-xs text-slate-500 mt-0.5">Practical cheat sheet, queries & schema with instant copy</p>
                </div>
                <button onclick="copyCurlCommand('curl -s ' + window.location.origin + '/dbms', this)" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium transition-colors">
                    <span>curl /dbms</span>
                    <span class="text-slate-400">📋</span>
                </button>
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
                        <a href="/pdf/dbms/DBMS.pdf" target="_blank" class="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium text-center transition-colors">
                            Open PDF
                        </a>
                        <button onclick="previewPdf('/pdf/dbms/DBMS.pdf', 'DBMS Full Solution PDF')" class="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors">
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
        <!-- SUBJECT 3: DM&SM                           -->
        <!-- ========================================== -->
        <section id="subject-3" class="hidden space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                        Digital Marketing & Social Media
                    </h2>
                    <p class="text-xs text-slate-500 mt-0.5">Experiment registry, connected marketing sites & points</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        ${dmsmExperiments.length} Experiments
                    </span>
                    <button onclick="copyCurlCommand('curl -s ' + window.location.origin + '/dmsm', this)" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium transition-colors">
                        <span>curl /dmsm</span>
                        <span class="text-slate-400">📋</span>
                    </button>
                </div>
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
        <!-- SUBJECT 4: DSA                             -->
        <!-- ========================================== -->
        <section id="subject-4" class="hidden space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                        Data Structures & Algorithms
                    </h2>
                    <p class="text-xs text-slate-500 mt-0.5">Practical algorithms with solved PDFs, copyable Python codes & curl API</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        ${dsaTopics.length} Topics
                    </span>
                    <button onclick="copyCurlCommand('curl -s ' + window.location.origin + '/dsa', this)" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium transition-colors">
                        <span>curl /dsa</span>
                        <span class="text-slate-400">📋</span>
                    </button>
                </div>
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
                            ${topic.desc ? `<p class="text-xs text-slate-500 mt-1 leading-relaxed">${topic.desc}</p>` : ''}
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
                                <button onclick="openCodeModal('${topic.code}', 'dsa', 'python3 ${topic.code}', 'dsa/${topic.id}')" 
                                        class="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                                    Code
                                </button>
                                <button onclick="copyDsaCode('${topic.code}', this)" 
                                        class="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-colors">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                                    Copy
                                </button>
                                <button onclick="copyCurlCommand('curl -s ' + window.location.origin + '/dsa/${topic.id}', this)" 
                                        class="inline-flex items-center gap-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-medium shadow-sm transition-colors" title="Copy curl command">
                                    curl
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
        <div class="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onclick="event.stopPropagation()">
            <div class="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                <div>
                    <h3 id="modalCodeTitle" class="text-sm sm:text-base font-bold text-slate-900 font-mono"></h3>
                    <p id="modalCodeSub" class="text-[11px] text-slate-500 font-medium"></p>
                </div>
                <div class="flex items-center gap-2">
                    <button id="modalCopyBtn" onclick="copyCurrentModalCode()" class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        Copy Code
                    </button>
                    <a id="modalDownloadBtn" href="#" download class="inline-flex items-center py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors" title="Download">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/></svg>
                    </a>
                    <button onclick="closeCodeModal()" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 text-lg leading-none">
                        ✕
                    </button>
                </div>
            </div>

            <!-- Terminal Run & Curl Command Bar in Modal -->
            <div id="modalCmdBar" class="px-5 py-2.5 bg-slate-900 text-slate-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800">
                <div class="flex items-center gap-2 truncate">
                    <span class="text-emerald-400 font-bold">$</span>
                    <span id="modalCmdText" class="truncate text-slate-300"></span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button id="modalCopyCmdBtn" onclick="copyModalCmd()" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-sans">
                        Copy Run Command
                    </button>
                    <button id="modalCopyCurlBtn" onclick="copyModalCurl()" class="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-sans font-semibold">
                        Copy curl Command
                    </button>
                </div>
            </div>

            <div class="p-4 sm:p-5 overflow-auto bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed flex-1">
                <pre><code id="modalCodeContent" class="block whitespace-pre"></code></pre>
            </div>
        </div>
    </div>


    <!-- ========================================== -->
    <!-- BOTTOM NAVIGATION BAR (OS at Tab 0)        -->
    <!-- ========================================== -->
    <nav class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-1.5 shadow-lg">
        <div class="max-w-md mx-auto grid grid-cols-5 px-2 gap-1">
            <!-- 0: OS -->
            <button onclick="switchSubject(0)" id="tab-0" class="tab-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all text-blue-600 bg-blue-50 font-bold border border-blue-100">
                <svg class="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                <span class="text-[10px] font-bold">OS</span>
            </button>
            <!-- 1: AIML -->
            <button onclick="switchSubject(1)" id="tab-1" class="tab-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all text-slate-500 hover:text-slate-800 hover:bg-slate-50">
                <svg class="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>
                <span class="text-[10px] font-bold">AIML</span>
            </button>
            <!-- 2: DBMS -->
            <button onclick="switchSubject(2)" id="tab-2" class="tab-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all text-slate-500 hover:text-slate-800 hover:bg-slate-50">
                <svg class="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                <span class="text-[10px] font-bold">DBMS</span>
            </button>
            <!-- 3: DM&SM -->
            <button onclick="switchSubject(3)" id="tab-3" class="tab-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all text-slate-500 hover:text-slate-800 hover:bg-slate-50">
                <svg class="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                <span class="text-[10px] font-bold">DM&SM</span>
            </button>
            <!-- 4: DSA -->
            <button onclick="switchSubject(4)" id="tab-4" class="tab-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all text-slate-500 hover:text-slate-800 hover:bg-slate-50">
                <svg class="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>
                <span class="text-[10px] font-bold">DSA</span>
            </button>
        </div>
    </nav>


    <!-- Embedded Data & Scripts -->
    <script>
        // Default open subject is 0 = OS
        let index = 0;

        const subjects = [
            { id: 0, name: "OS", label: "OS" },
            { id: 1, name: "AIML", label: "AIML" },
            { id: 2, name: "DBMS", label: "DBMS" },
            { id: 3, name: "DM&SM", label: "DM&SM" },
            { id: 4, name: "DSA", label: "DSA" }
        ];

        // Preloaded Code Maps for 0-latency instant copy
        const osCodeMap = ${JSON.stringify(osCodeFiles)};
        const dsaCodeMap = ${JSON.stringify(dsaCodeFiles)};
        const dmsmExperiments = ${JSON.stringify(dmsmExperiments)};

        let activeModalFile = '';
        let activeModalSubject = 'os';
        let activeModalCmd = '';
        let activeModalCurl = '';

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

        // Copy helper with guaranteed clipboard fallback
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

        // Instant OS code copy
        function copyOsCode(filename, btnElement) {
            const code = osCodeMap[filename];
            if (!code) {
                btnElement.textContent = 'Not found';
                setTimeout(() => { btnElement.textContent = 'Copy'; }, 2000);
                return;
            }
            copyText(code, btnElement, 'Copied!');
        }

        // Instant DSA code copy
        function copyDsaCode(filename, btnElement) {
            const code = dsaCodeMap[filename];
            if (!code) {
                btnElement.textContent = 'Not found';
                setTimeout(() => { btnElement.textContent = 'Copy'; }, 2000);
                return;
            }
            copyText(code, btnElement, 'Copied!');
        }

        // Copy curl command helper
        function copyCurlCommand(cmd, btnElement) {
            copyText(cmd, btnElement, 'Copied curl!');
        }

        // Code Modal handlers
        function openCodeModal(filename, subject = 'os', cmd = '', curlPath = '') {
            activeModalFile = filename;
            activeModalSubject = subject;
            activeModalCmd = cmd;
            activeModalCurl = curlPath ? ('curl -s ' + window.location.origin + '/' + curlPath) : ('curl -s ' + window.location.origin + '/' + subject + '/' + filename);

            let code = '';
            let fileUrl = '';
            let langLabel = 'Source Code';

            if (subject === 'os') {
                code = osCodeMap[filename] || '// File not found';
                fileUrl = '/files/os/' + encodeURIComponent(filename);
                langLabel = filename.endsWith('.sh') ? 'Shell Script (Bash)' : 'C Systems Program';
            } else {
                code = dsaCodeMap[filename] || '# File not found';
                fileUrl = '/files/dsa/' + encodeURIComponent(filename);
                langLabel = 'Python Implementation';
            }

            document.getElementById('modalCodeTitle').textContent = filename;
            document.getElementById('modalCodeSub').textContent = langLabel;
            document.getElementById('modalCodeContent').textContent = code;

            const dlBtn = document.getElementById('modalDownloadBtn');
            dlBtn.href = fileUrl;
            dlBtn.setAttribute('download', filename);

            const cmdText = document.getElementById('modalCmdText');
            if (cmd) {
                cmdText.textContent = cmd;
            } else {
                cmdText.textContent = activeModalCurl;
            }

            const modal = document.getElementById('codeModal');
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeCodeModal() {
            document.getElementById('codeModal').classList.add('hidden');
            document.body.style.overflow = '';
        }

        function copyCurrentModalCode() {
            let code = '';
            if (activeModalSubject === 'os') {
                code = osCodeMap[activeModalFile];
            } else {
                code = dsaCodeMap[activeModalFile];
            }
            const btn = document.getElementById('modalCopyBtn');
            if (code && btn) {
                copyText(code, btn, 'Copied Code!');
            }
        }

        function copyModalCmd() {
            if (!activeModalCmd) return;
            const btn = document.getElementById('modalCopyCmdBtn');
            copyText(activeModalCmd, btn, 'Copied!');
        }

        function copyModalCurl() {
            if (!activeModalCurl) return;
            const btn = document.getElementById('modalCopyCurlBtn');
            copyText(activeModalCurl, btn, 'Copied curl!');
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

        // Initialize on DOM ready (Index 0 = OS is active)
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

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`PracticalVault Server running at http://localhost:${PORT}`);
    });
}

export default app;
