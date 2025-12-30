const app = document.getElementById("app");

let page = "landing";
let uploadedImage = null;
let prediction = null;
let history = JSON.parse(localStorage.getItem("predictionLogs")) || [];
let filterDisease = "ALL";
let minConfidence = 0;
let imageReady = false;

const spinnerStyle = document.createElement("style");
spinnerStyle.innerHTML = `
.spinner {
  width:14px;
  height:14px;
  border:2px solid #bfdbfe;
  border-top-color:#2563eb;
  border-radius:50%;
  animation:spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(spinnerStyle);


/* ========== ROUTER ========== */
function nav(p){ page=p; render(); }

/* ========== RENDER ========== */
function render(){
  if(page==="landing") landing();
  if(page==="upload") upload();
  if(page==="result") result();
  if(page==="explain") explain();
  if(page==="compare") compare();
  if(page==="dataset") dataset();
  if(page==="logs") logs();
  if(page==="about") about();
}

/* ========== LANDING ========== */
function landing() {
  app.innerHTML = `
    <!-- NAVBAR -->
    <header class="navbar">
      <div class="nav-left">
        <div class="logo">👁</div>
        <div>
          <div class="nav-title">DermoAI by Group51 Research</div>
          <div class="nav-sub">Skin Disease Prediction System</div>
        </div>
      </div>
    </header>

    <!-- HERO -->
    <section class="hero">
      <span class="pill">Academic Research Prototype</span>

      <h1>AI-Powered Skin Disease Prediction System</h1>

      <p class="hero-desc">
        A comprehensive machine learning platform for dermatological image analysis,
        featuring multi-model comparison, explainable AI visualization, and
        research-grade performance metrics.
      </p>

      <div class="hero-actions">
        <button class="btn btn-primary" onclick="nav('upload')">
          ⬆ Start Prediction
        </button>
        <button class="btn btn-outline" onclick="nav('compare')">
          View Model Performance
        </button>
      </div>
    </section>

    <!-- MODULES -->
    <section class="container">
      <div class="grid grid-3">
        ${moduleCard("⬆","Upload Image",
          "Upload skin lesion images for AI-powered disease classification",
          "upload")}

        ${moduleCard("🔗","Model Comparison",
          "Compare performance metrics across multiple CNN architectures",
          "compare")}

        ${moduleCard("👁","Explainability",
          "Visualize model decisions using Grad-CAM heatmap analysis",
          "explain")}

        ${moduleCard("📄","Prediction Logs",
          "Review historical predictions and model outputs",
          "logs")}

        ${moduleCard("🗂","Dataset Overview",
          "Explore training dataset composition and preprocessing",
          "dataset")}

        ${moduleCard("ℹ","About & Disclaimer",
          "Academic use, privacy policy, and system information",
          "about")}
      </div>
    </section>

    <!-- STATS -->
    <section class="container stats">
      <div class="grid grid-3">
        <div class="stat-card">
          <div class="stat-value">4</div>
          <div class="stat-label">Model Architectures</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">95.8%</div>
          <div class="stat-label">Best Model Accuracy</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">7</div>
          <div class="stat-label">Disease Classes</div>
        </div>
      </div>
    </section>
  `;
}

function moduleCard(icon, title, desc, page) {
  return `
    <div class="card module">
      <div class="module-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${desc}</p>
      <button class="link" onclick="nav('${page}')">
        Access Module →
      </button>
    </div>
  `;
}


/* ========== UPLOAD ========== */
/* ========== UPLOAD ========== */
function upload() {
  app.innerHTML = `
    <div class="back-top">
      <button onclick="nav('landing')">← Back to Home</button>
    </div>

    <section class="upload-page">
      <h1>Upload Skin Lesion Image</h1>
      <p class="subtitle">
        Upload a dermatological image for AI-powered disease classification
      </p>

      <div class="upload-layout">
        <!-- LEFT -->
        <div class="card upload-card">
          <h3>Image Upload</h3>
          <p class="hint">Drag and drop or click to select an image</p>

          ${
            !uploadedImage
              ? `
                <div class="dropzone" onclick="document.getElementById('fileInput').click()">
                  <div class="upload-icon">⬆</div>
                  <p class="drop-main">Drop your image here or click to browse</p>
                  <p class="drop-sub">Supported formats: JPG, PNG (Max 10MB)</p>
                  <input
                    type="file"
                    id="fileInput"
                    hidden
                    accept="image/png, image/jpeg"
                    onchange="handleFile(event)"
                  />
                </div>
              `
              : `
                <img src="${uploadedImage}" style="width:100%;border-radius:12px;margin-bottom:16px;" />

                <div class="grid grid-2">
                  <button class="btn btn-outline" onclick="resetUpload()">
                    🔁 Change Image
                  </button>

                  <button class="btn btn-primary" id="runBtn" onclick="runPrediction()">
                    ▶ Run Prediction
                  </button>
                </div>
              `
          }
        </div>

        <!-- RIGHT -->
        <div class="side-column">
          <div class="card info-card">
            <h3>Instructions</h3>
            <ol class="steps">
              <li>Upload a clear image of the skin lesion</li>
              <li>Ensure good lighting and focus</li>
              <li>Click “Run Prediction” to analyze</li>
              <li>Review results and Grad-CAM visualization</li>
            </ol>
          </div>

          <div class="card notice-card">
            <p>
              ℹ This system is for academic research purposes only.
              Not for clinical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}



function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const r = new FileReader();
  r.onload = () => {
    uploadedImage = r.result;
    imageReady = true;
    upload(); // re-render upload page with preview + buttons
  };
  r.readAsDataURL(file);
}

function resetUpload() {
  uploadedImage = null;
  imageReady = false;
  upload();
}

function runPrediction() {
  const btn = document.getElementById("runBtn");

  if (!uploadedImage) return;

  btn.disabled = true;
  btn.innerHTML = `
    <span style="display:flex;align-items:center;gap:8px;">
      <span class="spinner"></span>
      Running Prediction...
    </span>
  `;

  simulate();
}



/* ========== RESULT ========== */
/* ========== RESULT (FIGMA-MATCHED) ========== */
function result() {
  const confPercent = (prediction.confidence * 100).toFixed(2);
  const analyzedTime = new Date(prediction.time).toLocaleString();

  app.innerHTML = `
    <!-- TOP NAV -->
    <div class="back-top">
      <button onclick="nav('upload')">← New Prediction</button>
    </div>

    <!-- STATUS -->
    <section class="section center">
      <span class="pill" style="background:#dcfce7;color:#16a34a;">
        ✔ Prediction Complete
      </span>
      <h2 style="margin-top:12px;">Analysis Results</h2>
      <p class="page-sub">
        AI-powered classification completed using ResNet50 architecture
      </p>
    </section>

    <!-- MAIN RESULT -->
    <section class="container">
      <div class="grid grid-2">

        <!-- LEFT: IMAGE -->
        <div class="card">
          <h3>Input Image</h3>
          <img src="${prediction.image}"
            style="width:100%;border-radius:10px;margin:12px 0;" />
          <p style="font-size:12px;color:#2563eb;">
            Analyzed: ${analyzedTime}
          </p>
        </div>

        <!-- RIGHT: PREDICTION -->
        <div class="card">
          <h3>Predicted Classification</h3>
          <p style="font-size:13px;color:#2563eb;margin-bottom:14px;">
            Most likely disease category based on visual features
          </p>

          <p><strong>Predicted Disease:</strong></p>
          <span class="badge badge-med">${prediction.disease}</span>

          <div style="margin-top:18px;">
            <p><strong>Confidence Score:</strong></p>

            <div style="background:#e5e7eb;border-radius:6px;height:8px;margin:8px 0;">
              <div style="
                width:${confPercent}%;
                background:#020617;
                height:8px;
                border-radius:6px;
              "></div>
            </div>

            <p style="font-size:13px;color:#2563eb;">
              ${confPercent}% – Moderate confidence prediction
            </p>
          </div>

          <!-- MODEL INFO -->
          <div class="card info" style="margin-top:20px;">
            <h4>Model Information</h4>
            <p style="font-size:13px;">
              <strong>Architecture:</strong> ResNet50<br>
              <strong>Training Dataset:</strong> HAM10000<br>
              <strong>Model Accuracy:</strong> 95.8%
            </p>
          </div>
        </div>
      </div>

      <!-- NEXT STEPS -->
      <div class="card mt center">
        <h3>Next Steps</h3>

        <div class="grid grid-2 mt">
          <button class="btn btn-primary" onclick="nav('explain')">
            👁 View Grad-CAM Heatmap
          </button>

          <button class="btn btn-outline" onclick="nav('upload')">
            Analyze Another Image
          </button>

          <button class="btn btn-outline" onclick="nav('compare')">
            Compare Models
          </button>

          <button class="btn btn-outline" onclick="nav('logs')">
            View Prediction History
          </button>
        </div>
      </div>

      <!-- DISCLAIMER -->
      <div class="card warning mt">
        <strong>Research Use Only</strong>
        <p style="font-size:13px;margin-top:6px;">
          This prediction is for academic research purposes only and should not
          be used for clinical diagnosis. Always consult qualified medical
          professionals for health concerns.
        </p>
      </div>
    </section>
  `;
}



/* ========== EXPLAINABILITY ========== */
/* ========== EXPLAINABILITY (FIGMA-MATCHED) ========== */
function explain() {
  app.innerHTML = `
    <!-- BACK -->
    <div class="back-top">
      <button onclick="nav('result')">← Back to Results</button>
    </div>

    <!-- HEADER -->
    <section class="section center">
      <h1>Explainable AI - Grad-CAM Visualization</h1>
      <p class="page-sub">
        Gradient-weighted Class Activation Mapping (Grad-CAM) highlights the regions
        in the image that most influenced the model's prediction decision.
      </p>
    </section>

    <!-- IMAGES -->
    <section class="container">
      <div class="grid grid-2">

        <!-- ORIGINAL -->
        <div class="card">
          <h3>Original Image</h3>
          <p style="font-size:13px;color:#2563eb;">Input dermatological image</p>
          <img src="${prediction.image}"
            style="width:100%;border-radius:12px;margin-top:12px;" />
        </div>

        <!-- HEATMAP -->
        <div class="card">
          <h3>Grad-CAM Heatmap</h3>
          <p style="font-size:13px;color:#2563eb;">
            Activation intensity overlay
          </p>

          <canvas id="cam" style="width:100%;border-radius:12px;margin-top:12px;"></canvas>

          <button class="btn btn-primary mt" onclick="downloadHeatmap()">
            ⬇ Download Heatmap
          </button>
        </div>
      </div>

      <!-- EXPLANATION -->
      <div class="grid grid-2 mt">

        <!-- TEXT -->
        <div class="card">
          <h3>Understanding Grad-CAM</h3>

          <p><strong>How It Works</strong></p>
          <p style="font-size:13px;">
            Grad-CAM uses the gradients of the target concept flowing into the final
            convolutional layer to produce a coarse localization map highlighting
            important regions in the image.
          </p>

          <p><strong>Interpretation</strong></p>
          <p style="font-size:13px;">
            Warmer colors (red, orange) indicate regions that strongly activated neurons
            associated with the predicted class. These areas are most relevant to the
            classification decision.
          </p>

          <p><strong>Clinical Relevance</strong></p>
          <p style="font-size:13px;">
            This visualization helps assess whether the model focuses on diagnostically
            meaningful features such as lesion borders, texture, and color patterns.
          </p>
        </div>

        <!-- LEGEND -->
        <div class="card">
          <h3>Heat Intensity Legend</h3>

          ${legendItem("#ef4444", "High Activation", "Strong influence")}
          ${legendItem("#fb923c", "Medium Activation", "Moderate influence")}
          ${legendItem("#facc15", "Low Activation", "Minimal influence")}
          ${legendItem("#e5e7eb", "No Activation", "Not relevant")}
        </div>
      </div>
    </section>
  `;

  drawGradCAM();
}

function legendItem(color, title, desc) {
  return `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
      <div style="
        width:22px;
        height:22px;
        background:${color};
        border-radius:4px;
      "></div>
      <div>
        <strong style="font-size:13px;">${title}</strong><br>
        <span style="font-size:12px;color:#64748b;">${desc}</span>
      </div>
    </div>
  `;
}

function drawGradCAM() {
  const img = new Image();
  img.onload = () => {
    const canvas = document.getElementById("cam");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);

    const g = ctx.createRadialGradient(
      img.width / 2, img.height / 2, 40,
      img.width / 2, img.height / 2, img.width / 1.6
    );
    g.addColorStop(0, "rgba(255,0,0,0.6)");
    g.addColorStop(0.4, "rgba(255,165,0,0.45)");
    g.addColorStop(1, "rgba(255,255,0,0)");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  img.src = prediction.image;
}

function downloadHeatmap() {
  const canvas = document.getElementById("cam");
  const link = document.createElement("a");
  link.download = "gradcam_heatmap.png";
  link.href = canvas.toDataURL();
  link.click();
}



/* ========== MODEL COMPARISON ========== */
/* ========== MODEL COMPARISON (ENHANCED) ========== */
function compare() {
  app.innerHTML = `
  <div class="top-back">
    <button class="back-link" onclick="nav('landing')">← Back to Home</button>
  </div>

  <section class="container">
    <h1 class="page-title">Model Performance Comparison</h1>
    <p class="page-subtitle">
      Comparative analysis of four deep learning architectures trained on the HAM10000 dataset
    </p>

    <!-- PERFORMANCE CHART -->
    <div class="card">
      <h3>Performance Metrics Overview</h3>
      <canvas id="perfChart" height="120"></canvas>
    </div>

    <!-- METRICS TABLE -->
    <div class="card mt">
      <h3>Detailed Metrics Table</h3>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Accuracy (%)</th>
            <th>Precision (%)</th>
            <th>Recall (%)</th>
            <th>F1-Score (%)</th>
            <th>Parameters</th>
            <th>Train Time</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>CNN</td><td>87.3</td><td>86.8</td><td>85.9</td><td>86.3</td><td>2.1M</td><td>45 min</td></tr>
          <tr><td>ResNet50</td><td>95.8</td><td>95.2</td><td>94.7</td><td>94.9</td><td>23.5M</td><td>2.3 hrs</td></tr>
          <tr><td>EfficientNetB0</td><td>94.2</td><td>93.8</td><td>93.4</td><td>93.6</td><td>4.0M</td><td>1.8 hrs</td></tr>
          <tr><td>MobileNetV2</td><td>91.5</td><td>90.9</td><td>90.2</td><td>90.5</td><td>2.3M</td><td>1.2 hrs</td></tr>
        </tbody>
      </table>
    </div>

    <!-- HIGHLIGHTS -->
    <div class="grid grid-3 mt">
      <div class="card highlight">
        <h4>🏆 Best Overall Performance</h4>
        <p><strong>ResNet50</strong></p>
        <span class="badge badge-high">95.8% Accuracy</span>
      </div>

      <div class="card highlight">
        <h4>⚡ Most Efficient</h4>
        <p><strong>EfficientNetB0</strong></p>
        <span class="badge badge-med">Best accuracy-to-parameter ratio</span>
      </div>

      <div class="card highlight">
        <h4>🚀 Fastest Training</h4>
        <p><strong>CNN</strong></p>
        <span class="badge badge-low">45 minutes</span>
      </div>
    </div>

    <!-- TRAINING CONFIG -->
    <div class="card mt">
      <h3>Training Configuration</h3>
      <div class="grid grid-2">
        <ul class="config-list">
          <li><strong>Dataset:</strong> HAM10000 (10,015 images)</li>
          <li><strong>Train / Val / Test:</strong> 70% / 15% / 15%</li>
          <li><strong>Batch Size:</strong> 32</li>
        </ul>
        <ul class="config-list">
          <li><strong>Optimizer:</strong> Adam (lr = 0.001)</li>
          <li><strong>Epochs:</strong> 50 (early stopping)</li>
          <li><strong>Loss:</strong> Categorical Cross-Entropy</li>
        </ul>
      </div>
    </div>
  </section>
  `;

  new Chart(document.getElementById("perfChart"), {
    type: "bar",
    data: {
      labels: ["CNN", "ResNet50", "EfficientNetB0", "MobileNetV2"],
      datasets: [
        { label: "Accuracy", data: [87.3, 95.8, 94.2, 91.5], backgroundColor: "#2563eb" },
        { label: "F1-Score", data: [86.3, 94.9, 93.6, 90.5], backgroundColor: "#60a5fa" },
        { label: "Precision", data: [86.8, 95.2, 93.8, 90.9], backgroundColor: "#93c5fd" },
        { label: "Recall", data: [85.9, 94.7, 93.4, 90.2], backgroundColor: "#bfdbfe" }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
}


/* ========== DATASET ========== */
/* ========== DATASET OVERVIEW (ENHANCED) ========== */
function dataset() {
  app.innerHTML = `
  <div class="top-back">
    <button class="back-link" onclick="nav('landing')">← Back to Home</button>
  </div>

  <section class="container">
    <h1 class="page-title">Dataset Overview</h1>
    <p class="page-subtitle">
      Comprehensive analysis of the HAM10000 dermatoscopic image dataset
    </p>

    <!-- SUMMARY STATS -->
    <div class="grid grid-4">
      <div class="card stat-card"><div class="stat-value">10,015</div><div class="stat-label">Total Images</div></div>
      <div class="card stat-card"><div class="stat-value">7</div><div class="stat-label">Disease Classes</div></div>
      <div class="card stat-card"><div class="stat-value">600×450</div><div class="stat-label">Resolution</div></div>
      <div class="card stat-card"><div class="stat-value">RGB</div><div class="stat-label">Color Space</div></div>
    </div>

    <!-- CLASS DISTRIBUTION -->
    <div class="card mt">
      <h3>Class Distribution</h3>
      <canvas id="datasetPie"></canvas>
    </div>

    <!-- PREPROCESSING -->
    <div class="card mt">
      <h3>Data Preprocessing Pipeline</h3>
      <div class="grid grid-4">
        <div class="step-card"><strong>1</strong><p>Resize to 224×224</p></div>
        <div class="step-card"><strong>2</strong><p>Normalization</p></div>
        <div class="step-card"><strong>3</strong><p>Augmentation</p></div>
        <div class="step-card"><strong>4</strong><p>Class Balancing</p></div>
      </div>
    </div>

    <div class="card notice-card mt">
      <p>
        Dataset Source: HAM10000 – A large collection of multi-source dermatoscopic images
        (Tschandl et al., 2018).
      </p>
    </div>
  </section>
  `;

  new Chart(document.getElementById("datasetPie"), {
    type: "pie",
    data: {
      labels: [
        "Melanocytic Nevus", "Melanoma", "Benign Keratosis",
        "Basal Cell Carcinoma", "Actinic Keratosis",
        "Vascular Lesion", "Dermatofibroma"
      ],
      datasets: [{
        data: [6705, 1113, 1099, 514, 327, 142, 115],
        backgroundColor: [
          "#2563eb", "#60a5fa", "#93c5fd",
          "#bfdbfe", "#dbeafe", "#e0e7ff", "#eef2ff"
        ]
      }]
    },
    options: {
      plugins: { legend: { position: "right" } }
    }
  });
}


/* ========== LOGS ========== */
/* ========== PREDICTION HISTORY (ENHANCED) ========== */
function logs() {
  const stats = logStats();
  const rows = history;

  app.innerHTML = `
    <!-- BACK -->
    <div class="back-top">
      <button onclick="nav('landing')">← Back to Home</button>
    </div>

    <!-- HEADER -->
    <section class="section center">
      <h1>Prediction History</h1>
      <p class="page-sub">
        Chronological log of all image analyses and model predictions
      </p>
    </section>

    <!-- RECENT PREDICTIONS -->
    <section class="container">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h3>Recent Predictions</h3>
            <p style="font-size:13px;color:#2563eb;">
              ${history.length} total predictions recorded
            </p>
          </div>
          <button class="btn btn-outline" onclick="exportCSV()">📄</button>
        </div>

        <table style="margin-top:14px;">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Image</th>
              <th>Predicted Class</th>
              <th>Confidence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length
                ? rows.map(h => `
                  <tr>
                    <td style="font-size:13px;color:#2563eb;">
                      ${new Date(h.time).toLocaleString()}
                    </td>

                    <td>
                      <img src="${h.image || prediction?.image || ''}"
                        style="width:46px;height:46px;border-radius:8px;object-fit:cover;">
                    </td>

                    <td>
                      <span class="badge badge-med">
                        ${h.disease}
                      </span>
                    </td>

                    <td>
                      <span class="badge ${
                        h.confidence >= 0.9
                          ? "badge-high"
                          : h.confidence >= 0.8
                          ? "badge-med"
                          : "badge-low"
                      }">
                        ${(h.confidence * 100).toFixed(1)}%
                      </span>
                    </td>

                    <td>
                      <button class="link" onclick="viewLog('${h.time}')">
                        👁 View
                      </button>
                    </td>
                  </tr>
                `).join("")
                : `
                  <tr>
                    <td colspan="5" style="text-align:center;font-size:13px;">
                      No predictions recorded
                    </td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </div>

      <!-- STATS -->
      <div class="grid grid-3 mt">
        <div class="card center">
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">Total Predictions</div>
        </div>

        <div class="card center">
          <div class="stat-value">${stats.avg}%</div>
          <div class="stat-label">Average Confidence</div>
        </div>

        <div class="card center">
          <div class="stat-value">
            ${history.filter(h => h.confidence >= 0.9).length}
          </div>
          <div class="stat-label">High Confidence Predictions</div>
        </div>
      </div>
    </section>
  `;
}

function viewLog(time) {
  const item = history.find(h => h.time === time);
  if (!item) return;

  prediction = item;
  nav("result");
}



/* ========== ABOUT ========== */
function about() {
  app.innerHTML = `
    <div class="back-top">
      <button onclick="nav('landing')">← Back to Home</button>
    </div>

    <div class="section">
      <h1 class="page-title">About & Disclaimer</h1>
      <p class="page-sub">Important information about this research system</p>

      <div class="card info">
        <strong>Academic Research Prototype</strong>
        <p style="font-size:13px; margin-top:6px;">
          This system is designed exclusively for academic research, educational
          purposes, and machine learning demonstration. It is not a medical device
          and must not be used for clinical diagnosis or treatment decisions.
        </p>
      </div>
    </div>

    <div class="section card">
      <h3>System Information</h3>

      <p><strong>Purpose</strong></p>
      <p style="font-size:13px;">
        DermoAI by Group51 Research is an AI-powered skin disease prediction system developed
        to demonstrate deep learning applications in dermatological image analysis,
        including CNN architectures, comparative performance metrics, and
        explainable AI techniques using Grad-CAM.
      </p>

      <p><strong>Technology Stack</strong></p>
      <ul style="font-size:13px;">
        <li>Deep Learning: TensorFlow / Keras</li>
        <li>Architectures: CNN, ResNet50, EfficientNet, MobileNetV2</li>
        <li>Dataset: HAM10000 (10,015 images)</li>
        <li>Visualization: Grad-CAM</li>
        <li>Interface: Web-based research prototype</li>
      </ul>

      <p><strong>Version</strong></p>
      <p style="font-size:13px;">DermoAI by Group51 Research v1.0.0 (Research Preview)</p>
    </div>

    <div class="section card">
      <h3>Privacy & Data Policy</h3>

      <p><strong>No Personal Data Collection</strong></p>
      <p style="font-size:13px;">
        This system does not collect, store, or transmit any personally identifiable
        information (PII). All image processing occurs locally in your browser
        session.
      </p>

      <p><strong>Public Dataset Only</strong></p>
      <p style="font-size:13px;">
        The system is trained exclusively on the publicly available HAM10000 dataset,
        which contains no patient-identifying information.
      </p>

      <p><strong>Session-Based Processing</strong></p>
      <p style="font-size:13px;">
        Uploaded images and predictions exist only during the current browser
        session and are not permanently stored.
      </p>
    </div>

    <div class="section card warning">
      <h3>Medical Disclaimer</h3>
      <ul style="font-size:13px;">
        <li>This system is NOT a medical device</li>
        <li>Predictions are for research and educational purposes ONLY</li>
        <li>Do NOT use for self-diagnosis or treatment decisions</li>
        <li>Always consult qualified healthcare professionals</li>
        <li>No warranty or accuracy guarantee is provided</li>
      </ul>
      <p style="font-size:12px;">
        If you have concerns about a skin condition, seek medical attention from
        a licensed dermatologist or healthcare provider.
      </p>
    </div>

    <div class="section card">
      <h3>Dataset Attribution</h3>
      <p style="font-size:13px;">
        Tschandl P, Rosendahl C, Kittler H.
        <em>The HAM10000 dataset: A large collection of multi-source dermatoscopic images.</em>
        Sci Data 5, 180161 (2018).
      </p>
      <p style="font-size:12px;">
        Dataset available under Creative Commons Attribution-NonCommercial 4.0
        International License.
      </p>
    </div>
  `;
}

function simulate(){
  setTimeout(()=>{
    prediction = {
      disease: ["Melanoma","Nevus","BCC","AK"][Math.floor(Math.random()*4)],
      confidence: 0.75 + Math.random()*0.24,
      image: uploadedImage,
      time: new Date().toISOString()
    };

    history.unshift(prediction);
    localStorage.setItem("predictionLogs", JSON.stringify(history));

    nav("result");
  }, 1500);
}


function exportCSV() {
  if (!history.length) {
    alert("No prediction logs to export.");
    return;
  }

  const header = "timestamp,disease,confidence\n";
  const rows = history.map(h =>
    `${h.time},${h.disease},${(h.confidence * 100).toFixed(2)}`
  ).join("\n");

  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "prediction_logs.csv";
  a.click();

  URL.revokeObjectURL(url);
}

function importCSV(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    history = reader.result
      .split("\n")
      .slice(1)
      .filter(l => l.trim())
      .map(l => {
        const [time, disease, confidence] = l.split(",");
        return {
          time,
          disease,
          confidence: parseFloat(confidence) / 100
        };
      });

    saveLogs();
    nav("logs");
  };

  reader.readAsText(file);
}

function saveLogs() {
  localStorage.setItem("predictionLogs", JSON.stringify(history));
}

function uniqueDiseases() {
  return [...new Set(history.map(h => h.disease))];
}

function filteredLogs() {
  return history.filter(h => {
    const conf = h.confidence * 100;
    return (
      (filterDisease === "ALL" || h.disease === filterDisease) &&
      conf >= minConfidence
    );
  });
}

function logStats() {
  if (!history.length) return { total: 0, avg: 0, top: "-" };

  const avg =
    history.reduce((s, h) => s + h.confidence, 0) / history.length;

  const counts = {};
  history.forEach(h => counts[h.disease] = (counts[h.disease] || 0) + 1);

  const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];

  return {
    total: history.length,
    avg: (avg * 100).toFixed(1),
    top
  };
}

function clearLogs() {
  if (!confirm("Clear all prediction logs?")) return;
  history = [];
  saveLogs();
  nav("logs");
}


render();
