// Theme toggle functionality
function toggleTheme() {
  console.log('toggleTheme called'); // Debug log
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  console.log('Switching from', currentTheme, 'to', newTheme); // Debug log

  // Set the new theme
  document.documentElement.setAttribute('data-theme', newTheme);

  // Store the preference in localStorage
  localStorage.setItem('theme', newTheme);

  // Update navbar scroll effect immediately
  handleNavbarScroll();
}

// Make sure the function is globally available
window.toggleTheme = toggleTheme;

// Initialize theme from localStorage or system preference
function initTheme() {
  console.log('initTheme called'); // Debug log
  const storedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  console.log('Stored theme:', storedTheme, 'System prefers dark:', systemPrefersDark); // Debug log

  if (storedTheme) {
    document.documentElement.setAttribute('data-theme', storedTheme);
    console.log('Set theme from storage:', storedTheme); // Debug log
  } else if (systemPrefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    console.log('Set theme from system preference: dark'); // Debug log
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    console.log('Set default theme: light'); // Debug log
  }
}

// Step navigation functionality
let currentStep = 1;
const totalSteps = 4;
let userInteracted = false; // 标记用户是否手动操作过

function showStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll(".step").forEach((step) => {
    step.classList.remove("active");
  });

  // Show current step
  const currentStepElement = document.querySelector(
    `[data-step="${stepNumber}"]`
  );
  if (currentStepElement) {
    currentStepElement.classList.add("active");
  }

  // Update indicators
  document.querySelectorAll(".indicator").forEach((indicator) => {
    indicator.classList.remove("active");
  });

  const currentIndicator = document.querySelector(
    `.indicator[data-step="${stepNumber}"]`
  );
  if (currentIndicator) {
    currentIndicator.classList.add("active");
  }

  currentStep = stepNumber;
}

function nextStep(userTriggered = false) {
  if (userTriggered) {
    userInteracted = true; // 标记用户已交互
  }

  if (currentStep < totalSteps) {
    showStep(currentStep + 1);
  } else {
    showStep(1); // Loop back to first step
  }

  if (userTriggered) {
    stopAutoAdvance();
    setTimeout(startAutoAdvance, 10000);
  }
}

function previousStep(userTriggered = false) {
  if (userTriggered) {
    userInteracted = true; // 标记用户已交互
  }

  if (currentStep > 1) {
    showStep(currentStep - 1);
  } else {
    showStep(totalSteps); // Loop to last step
  }

  if (userTriggered) {
    stopAutoAdvance();
    setTimeout(startAutoAdvance, 10000);
  }
}

// Auto-advance steps every 5 seconds (or 20 seconds after user interaction)
let autoAdvanceInterval;

function startAutoAdvance() {
  const interval = userInteracted ? 20000 : 5000; // 20秒 vs 5秒
  autoAdvanceInterval = setInterval(nextStep, interval);
}

function stopAutoAdvance() {
  if (autoAdvanceInterval) {
    clearInterval(autoAdvanceInterval);
  }
}

// Smooth scrolling for navigation links
function smoothScroll(target) {
  const element = document.querySelector(target);
  if (element) {
    const offsetTop = element.offsetTop - 80; // Account for fixed navbar
    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });
  }
}

// Navbar scroll effect
function handleNavbarScroll() {
  const navbar = document.querySelector(".navbar");

  // Detect current theme - prioritize data-theme attribute
  const dataTheme = document.documentElement.getAttribute('data-theme');
  const isDarkMode = dataTheme === 'dark';

  if (window.scrollY > 50) {
    if (isDarkMode) {
      navbar.style.background = "rgba(28, 28, 30, 0.95)";
      navbar.style.borderBottomColor = "rgba(56, 56, 58, 0.5)";
    } else {
      navbar.style.background = "rgba(251, 251, 253, 0.95)";
      navbar.style.borderBottomColor = "rgba(210, 210, 215, 0.5)";
    }
  } else {
    // Reset to CSS variable values
    navbar.style.background = "";
    navbar.style.borderBottomColor = "";
  }
}

// Intersection Observer for animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe feature cards
  document.querySelectorAll(".feature-card").forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(card);
  });

  // Observe hybrid features
  document.querySelectorAll(".hybrid-feature").forEach((feature) => {
    feature.style.opacity = "0";
    feature.style.transform = "translateY(30px)";
    feature.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(feature);
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize theme first
  initTheme();

  // Initialize step navigation
  showStep(1);
  startAutoAdvance();

  // Initialize network animation
  initNetworkAnimation();

  // Add click event listeners to step indicators
  document.querySelectorAll(".indicator").forEach((indicator) => {
    indicator.addEventListener("click", function () {
      const stepNumber = parseInt(this.getAttribute("data-step"));
      userInteracted = true; // 标记用户已交互
      showStep(stepNumber);
      stopAutoAdvance();
      setTimeout(startAutoAdvance, 10000); // Restart auto-advance after 10 seconds
    });
  });

  // Add hover events to pause auto-advance
  const stepsContainer = document.querySelector(".steps-container");
  if (stepsContainer) {
    stepsContainer.addEventListener("mouseenter", stopAutoAdvance);
    stepsContainer.addEventListener("mouseleave", startAutoAdvance);
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = this.getAttribute("href");
      smoothScroll(target);
    });
  });

  // Navbar scroll effect
  window.addEventListener("scroll", handleNavbarScroll);

  // Listen for theme changes to update navbar scroll effect
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addListener(() => handleNavbarScroll());
  }

  // Listen for manual theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        handleNavbarScroll();
      }
    });
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // Initialize scroll animations
  initScrollAnimations();

  // Add keyboard navigation for steps
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      previousStep(true); // 传入用户触发标识
    } else if (e.key === "ArrowRight") {
      nextStep(true); // 传入用户触发标识
    }
  });
});

// Network Animation Functions
function initNetworkAnimation() {
  // 交由 Canvas 可视化负责渲染与统计
  // 此处保持占位，避免重复的 CSS 节点/连线模拟逻辑
}

// Advanced Network Visualization (2D Clustered Map Style)
class LightningNetworkCanvas {
  constructor(selector = "#networkCanvas") {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    // HiDPI
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;

    // Dark mode detection and theme colors
    this.isDarkMode = this.detectDarkMode();
    this.themeColors = this.getThemeColors();

    // Listen for theme changes
    this.initThemeListener();

    // Network Data
    this.nodes = []; 
    this.connections = []; 
    this.packets = []; 
    
    // Animation Parameters
    this.mouse = { x: 0, y: 0 };
    this.isHovering = false;
    this.introProgress = 0; // For expansion effect
    
    // Stats
    this.displayStats = { nodes: 0, channels: 0, tps: 0 };

    // World Map Data (Simplified Continents)
    this.mapPolygons = [
        // North America
        [[0.1, 0.1], [0.3, 0.05], [0.45, 0.05], [0.4, 0.3], [0.25, 0.45], [0.15, 0.35], [0.05, 0.2]],
        // South America
        [[0.28, 0.5], [0.4, 0.48], [0.45, 0.6], [0.38, 0.85], [0.3, 0.75], [0.25, 0.6]],
        // Europe
        [[0.45, 0.15], [0.55, 0.1], [0.6, 0.2], [0.55, 0.28], [0.48, 0.25]],
        // Africa
        [[0.45, 0.35], [0.6, 0.35], [0.65, 0.55], [0.55, 0.75], [0.45, 0.55]],
        // Asia
        [[0.62, 0.1], [0.9, 0.1], [0.95, 0.4], [0.8, 0.55], [0.65, 0.45], [0.6, 0.25]],
        // Australia
        [[0.75, 0.65], [0.9, 0.65], [0.9, 0.8], [0.75, 0.75]]
    ];

    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.bindInteraction();

    // Initialize
    this.initNetwork();
    
    // Start Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
    
    // Stats updater
    setInterval(() => this.updateStats(), 1000);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    
    // Re-init network on resize to fit new dimensions better
    if (this.nodes && this.nodes.length > 0) {
        this.initNetwork();
    }
  }

  bindInteraction() {
    document.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.isHovering = true;
    });
    
    document.addEventListener("mouseleave", () => {
      this.isHovering = false;
    });
  }

  initNetwork() {
    this.nodes = [];
    this.connections = [];
    
    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 100 : 300; 
    
    // Continent Centers for Hubs (approximate)
    const continentCenters = [
        {x: 0.25, y: 0.25, name: "NA"}, // North America
        {x: 0.35, y: 0.65, name: "SA"}, // South America
        {x: 0.52, y: 0.2, name: "EU"},  // Europe
        {x: 0.55, y: 0.55, name: "AF"}, // Africa
        {x: 0.75, y: 0.3, name: "AS"},  // Asia
        {x: 0.82, y: 0.7, name: "AU"}   // Australia
    ];

    // Create Super Hubs at continent centers
    const hubs = [];
    continentCenters.forEach((center, i) => {
        // Add some randomness to exact position
        const hx = (center.x * this.width) + (Math.random() - 0.5) * (this.width * 0.05);
        const hy = (center.y * this.height) + (Math.random() - 0.5) * (this.height * 0.05);
        
        hubs.push({
            x: hx,
            y: hy,
            id: i
        });
    });

    // Create Nodes
    for (let i = 0; i < nodeCount; i++) {
      let x, y, type, size;
      
      const rand = Math.random();
      
      if (i < hubs.length) {
          // Explicit super hubs
          type = 'super_hub';
          size = isMobile ? 8 : 12; 
          x = hubs[i].x;
          y = hubs[i].y;
      } else if (rand > 0.90) {
          type = 'hub';
          size = isMobile ? 5 : 7;
          // Place hubs near continent centers
          const continent = continentCenters[Math.floor(Math.random() * continentCenters.length)];
          const dist = Math.random() * (Math.min(this.width, this.height) * 0.15);
          const angle = Math.random() * Math.PI * 2;
          x = (continent.x * this.width) + Math.cos(angle) * dist;
          y = (continent.y * this.height) + Math.sin(angle) * dist;
      } else {
          type = 'node';
          size = isMobile ? 2 : 3;
          // Place nodes distributed across continents
          const continent = continentCenters[Math.floor(Math.random() * continentCenters.length)];
          // Wider distribution for leaf nodes
          const dist = Math.random() * (Math.min(this.width, this.height) * 0.25);
          const angle = Math.random() * Math.PI * 2;
          x = (continent.x * this.width) + Math.cos(angle) * dist;
          y = (continent.y * this.height) + Math.sin(angle) * dist;
      }

      // Soft bounds check
      x = Math.max(20, Math.min(this.width - 20, x));
      y = Math.max(20, Math.min(this.height - 20, y));

      this.nodes.push({
        x: x,
        y: y,
        targetX: x,
        targetY: y,
        startX: this.width / 2,
        startY: this.height / 2,
        vx: 0, vy: 0, // Static
        type: type,
        size: size,
        pulse: Math.random() * Math.PI,
        flash: 0,
        connections: []
      });
    }

    // Connect Nodes
    // 1. Connect everything to nearest hub(s)
    // 2. Connect nearby nodes
    const connectionDistance = Math.min(this.width, this.height) * 0.2;
    
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeA = this.nodes[i];
      // Sort other nodes by distance
      const neighbors = [];
      for (let j = 0; j < this.nodes.length; j++) {
          if (i === j) continue;
          const nodeB = this.nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < connectionDistance) {
              neighbors.push({ idx: j, dist: dist });
          }
       }
      neighbors.sort((a, b) => a.dist - b.dist);
      
      // Connect to closest k neighbors
      const maxConnections = nodeA.type === 'super_hub' ? 40 : (nodeA.type === 'hub' ? 20 : 4);
      
      for (let k = 0; k < Math.min(neighbors.length, maxConnections); k++) {
          const targetIdx = neighbors[k].idx;
          // Avoid duplicates
          if (!nodeA.connections.includes(targetIdx)) {
              // Add connection if target also has capacity (or is a hub)
              const targetNode = this.nodes[targetIdx];
              const targetMax = targetNode.type === 'super_hub' ? 40 : (targetNode.type === 'hub' ? 20 : 4);
              
              if (targetNode.connections.length < targetMax) {
                  this.connections.push({ a: i, b: targetIdx, opacity: 1, state: 'stable' });
                  nodeA.connections.push(targetIdx);
                  targetNode.connections.push(i);
              }
          }
      }
    }
  }

  spawnPacket() {
    if (this.packets.length > 50) return; // Increased limit for more activity
    
    // Find a random start node that has connections
    let startIdx = Math.floor(Math.random() * this.nodes.length);
    let attempts = 0;
    while (this.nodes[startIdx].connections.length === 0 && attempts < 10) {
      startIdx = Math.floor(Math.random() * this.nodes.length);
      attempts++;
    }
    
    if (this.nodes[startIdx].connections.length === 0) return;

    // Generate a random path
    const path = [startIdx];
    let current = startIdx;
    const minLength = 4; // At least 3 hops (A->B->C->D)
    const targetLength = 4 + Math.floor(Math.random() * 8); // Longer paths
    
    for(let i=0; i<targetLength; i++) {
      const neighbors = this.nodes[current].connections;
      if (neighbors.length === 0) break;
      
      // Try to find a neighbor not already in path to avoid loops
      let validNeighbors = neighbors.filter(n => !path.includes(n));
      if (validNeighbors.length === 0) validNeighbors = neighbors; // Fallback
      
      // Prefer hubs for next hop to simulate routing
      // Weight neighbors: Super Hubs > Hubs > Nodes
      let weightedNeighbors = [];
      validNeighbors.forEach(nIdx => {
          const n = this.nodes[nIdx];
          let weight = 1;
          if (n.type === 'super_hub') weight = 20; // Heavily prefer super hubs
          else if (n.type === 'hub') weight = 5;
          
          for(let k=0; k<weight; k++) weightedNeighbors.push(nIdx);
      });
      
      const next = weightedNeighbors[Math.floor(Math.random() * weightedNeighbors.length)];
      path.push(next);
      current = next;
    }

    if (path.length >= minLength) {
      // Unique bright neon color for each packet
      const hue = Math.floor(Math.random() * 360);
      const color = `hsl(${hue}, 100%, 60%)`;
      
      this.packets.push({
        path: path,
        segment: 0,
        progress: 0,
        speed: 0.008 + Math.random() * 0.008, // Slightly slower to see the relay
        color: color,
        size: 1.5 + Math.random() * 1.5, // Thinner
        trail: [] // Add trail array
      });
    }
  }

  drawWorldMap() {
    this.ctx.save();
    this.ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
    this.ctx.lineWidth = 1;

    this.mapPolygons.forEach(poly => {
        this.ctx.beginPath();
        poly.forEach((pt, i) => {
            const x = pt[0] * this.width;
            const y = pt[1] * this.height;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    });
    this.ctx.restore();
  }

  drawGrid() {
    const gridSize = 50;
    const time = Date.now() * 0.001;
    
    this.ctx.save();
    this.ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
    this.ctx.lineWidth = 1;
    
    // Moving grid
    const offsetX = (time * 10) % gridSize;
    const offsetY = (time * 10) % gridSize;
    
    this.ctx.beginPath();
    for (let x = offsetX; x < this.width; x += gridSize) {
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.height);
    }
    for (let y = offsetY; y < this.height; y += gridSize) {
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawHexagon(x, y, radius, fill = true) {
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = x + radius * Math.cos(angle);
      const hy = y + radius * Math.sin(angle);
      if (i === 0) this.ctx.moveTo(hx, hy);
      else this.ctx.lineTo(hx, hy);
    }
    this.ctx.closePath();
    if (fill) this.ctx.fill();
    else this.ctx.stroke();
  }

  updateTopology() {
    // Randomly add/remove connections to simulate network churn
    if (Math.random() > 0.05) return; // Low probability per frame

    // 1. Shutdown a connection (Remove)
    // Find a stable connection to close
    const stableConns = this.connections.filter(c => c.state === 'stable');
    if (stableConns.length > 0 && Math.random() > 0.5) {
        const conn = stableConns[Math.floor(Math.random() * stableConns.length)];
        conn.state = 'closing';
        
        // Remove from nodes' connection lists immediately so packets don't route through it
        const nodeA = this.nodes[conn.a];
        const nodeB = this.nodes[conn.b];
        
        nodeA.connections = nodeA.connections.filter(id => id !== conn.b);
        nodeB.connections = nodeB.connections.filter(id => id !== conn.a);
    }

    // 2. Construct a connection (Add)
    // Pick a random node
    const idxA = Math.floor(Math.random() * this.nodes.length);
    const nodeA = this.nodes[idxA];
    
    // Find a close neighbor not connected
    const connectionDistance = Math.min(this.width, this.height) * 0.2;
    
    for (let i = 0; i < 10; i++) { // Try 10 times
        const idxB = Math.floor(Math.random() * this.nodes.length);
        if (idxA === idxB) continue;
        if (nodeA.connections.includes(idxB)) continue;
        
        const nodeB = this.nodes[idxB];
        const dx = nodeA.currentX - nodeB.currentX;
        const dy = nodeA.currentY - nodeB.currentY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < connectionDistance) {
            this.connections.push({ a: idxA, b: idxB, state: 'new', opacity: 0 });
            nodeA.connections.push(idxB);
            nodeB.connections.push(idxA);
            break;
        }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Dynamic Topology Updates
    this.updateTopology();
    
    // Expansion Effect (Intro)
    this.introProgress += (1 - this.introProgress) * 0.05; // Faster intro
    
    // Update Nodes (Static)
    this.nodes.forEach(node => {
        node.pulse += 0.05;
        if (node.flash > 0.01) node.flash *= 0.9;
        
        // No Drift - Static Positions
        
        // Interpolate for intro expansion
        node.currentX = node.startX + (node.targetX - node.startX) * this.introProgress;
        node.currentY = node.startY + (node.targetY - node.startY) * this.introProgress;
    });

    // Draw Background Grid (Geek Effect)
    this.drawWorldMap();
    this.drawGrid();

    // Draw Connections
    this.ctx.lineWidth = this.isDarkMode ? 1 : 1.5;
    
    // Calculate center for boundary fade
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.max(this.width, this.height) * 0.8; // Much wider fade

    // Clean up closed connections
    this.connections = this.connections.filter(c => c.opacity > 0 || c.state !== 'closing');

    this.connections.forEach(conn => {
      // Update opacity based on state
      if (conn.state === 'new') {
          conn.opacity += 0.02;
          if (conn.opacity >= 1) { conn.opacity = 1; conn.state = 'stable'; }
      } else if (conn.state === 'closing') {
          conn.opacity -= 0.02;
      }

      const p1 = this.nodes[conn.a];
      const p2 = this.nodes[conn.b];
      
      // Distance fade (existing logic)
      const dx = p1.currentX - p2.currentX;
      const dy = p1.currentY - p2.currentY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const maxDist = Math.min(this.width, this.height) * 0.3; // Increased range
      
      let alpha = Math.max(0.05, 1 - dist / maxDist); // Always keep a faint line
      alpha *= this.introProgress;
      
      // Boundary Fade Out
      const midX = (p1.currentX + p2.currentX) / 2;
      const midY = (p1.currentY + p2.currentY) / 2;
      const distFromCenter = Math.sqrt(Math.pow(midX - centerX, 2) + Math.pow(midY - centerY, 2));
      const boundaryAlpha = Math.max(0, 1 - Math.pow(distFromCenter / maxRadius, 3)); // Cubic falloff
      
      alpha *= boundaryAlpha;
      
      // Lifecycle opacity
      alpha *= conn.opacity;

      if (alpha > 0.01) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.currentX, p1.currentY);
          this.ctx.lineTo(p2.currentX, p2.currentY);
          
          if (conn.state === 'new') {
             this.ctx.strokeStyle = this.isDarkMode ? '#00FF00' : '#00AA00'; // Green for new
             this.ctx.lineWidth = 2;
             this.ctx.globalAlpha = conn.opacity;
          } else if (conn.state === 'closing') {
             this.ctx.strokeStyle = this.isDarkMode ? '#FF0000' : '#AA0000'; // Red for closing
             this.ctx.lineWidth = 2;
             this.ctx.globalAlpha = conn.opacity;
          } else {
             if (this.isDarkMode) {
                 this.ctx.strokeStyle = `rgba(80, 80, 100, ${alpha * 0.4})`;
             } else {
                 this.ctx.strokeStyle = `rgba(100, 100, 120, ${alpha * 0.3})`; // Subtle in light mode
             }
             this.ctx.lineWidth = this.isDarkMode ? 1 : 1.5;
             this.ctx.globalAlpha = 1; // Alpha handled in strokeStyle
          }
          
          this.ctx.stroke();
          this.ctx.globalAlpha = 1; // Reset
      }
    });

    // Draw Active Paths (Highlight entire route)
    this.ctx.save();
    this.packets.forEach(pkt => {
        if (!pkt.path || pkt.path.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = pkt.color;
        this.ctx.lineWidth = 2; // Visible path
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Apply boundary fade to path as well
        const pStart = this.nodes[pkt.path[0]];
        const distFromCenter = Math.sqrt(Math.pow(pStart.currentX - centerX, 2) + Math.pow(pStart.currentY - centerY, 2));
        const boundaryAlpha = Math.max(0, 1 - Math.pow(distFromCenter / maxRadius, 3));
        
        this.ctx.globalAlpha = (this.isDarkMode ? 0.4 : 0.5) * boundaryAlpha; // Clearly visible

        // Draw the full path
        for (let i = 0; i < pkt.path.length - 1; i++) {
            const idxA = pkt.path[i];
            const idxB = pkt.path[i+1];
            const pA = this.nodes[idxA];
            const pB = this.nodes[idxB];
            
            // Only draw if fully expanded (to avoid messy lines during intro)
            if (this.introProgress > 0.8) {
                this.ctx.moveTo(pA.currentX, pA.currentY);
                this.ctx.lineTo(pB.currentX, pB.currentY);
            }
        }
        this.ctx.stroke();
    });
    this.ctx.restore();

    // Draw Nodes
    this.nodes.forEach(p => {
        const size = p.size * (1 + Math.sin(p.pulse) * 0.1) * this.introProgress;
        if (size <= 0) return;
        
        // Boundary Fade for nodes
        const distFromCenter = Math.sqrt(Math.pow(p.currentX - centerX, 2) + Math.pow(p.currentY - centerY, 2));
        const boundaryAlpha = Math.max(0, 1 - Math.pow(distFromCenter / maxRadius, 3));
        
        if (boundaryAlpha <= 0.01) return;

        // Geek Style: Hexagons instead of circles
        const currentSize = size + (p.flash * 6);

        if (p.type === 'super_hub' || p.type === 'hub') {
            this.ctx.fillStyle = this.themeColors.nodeHub;
        } else {
            this.ctx.fillStyle = this.themeColors.nodeRegular;
        }
        
        // Flash makes it brighter/white
        if (p.flash > 0.1) {
            this.ctx.fillStyle = this.isDarkMode ? '#FFFFFF' : '#000000';
        }
        
        this.ctx.globalAlpha = Math.min(1, (0.8 + p.flash) * this.introProgress * boundaryAlpha);
        
        // Draw Shape
        if (p.type === 'super_hub') {
             this.ctx.beginPath();
             this.ctx.arc(p.currentX, p.currentY, currentSize, 0, Math.PI * 2);
             this.ctx.fill();
        } else {
             this.drawHexagon(p.currentX, p.currentY, currentSize);
        }
        
        // Tech rings for hubs
        if (p.type === 'super_hub') {
           this.ctx.strokeStyle = this.themeColors.nodeHub;
           this.ctx.lineWidth = 1;
           this.ctx.globalAlpha = 0.3 * this.introProgress * boundaryAlpha;
           
           // Rotating outer ring
           this.ctx.save();
           this.ctx.translate(p.currentX, p.currentY);
           this.ctx.rotate(Date.now() * 0.001);
           this.ctx.beginPath();
           this.ctx.arc(0, 0, size * 2.0, 0, Math.PI * 1.5); // Broken ring
           this.ctx.stroke();
           this.ctx.restore();
        }
    });

    // Draw Packets
    this.ctx.globalCompositeOperation = this.isDarkMode ? 'lighter' : 'source-over';
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const pkt = this.packets[i];
      pkt.progress += pkt.speed;
      
      if (pkt.progress >= 1) {
        pkt.progress = 0;
        
        // Trigger flash
        const reachedNodeIdx = pkt.path[pkt.segment + 1];
        if (this.nodes[reachedNodeIdx]) {
            this.nodes[reachedNodeIdx].flash = 1.0;
        }

        pkt.segment++;
        if (pkt.segment >= pkt.path.length - 1) {
          this.packets.splice(i, 1);
          continue;
        }
      }

      const idxA = pkt.path[pkt.segment];
      const idxB = pkt.path[pkt.segment + 1];
      const pA = this.nodes[idxA];
      const pB = this.nodes[idxB];

      const x = pA.currentX + (pB.currentX - pA.currentX) * pkt.progress;
      const y = pA.currentY + (pB.currentY - pA.currentY) * pkt.progress;
      
      // Add to trail
      pkt.trail.push({x, y, age: 1.0});
      if (pkt.trail.length > 15) pkt.trail.shift();

      // Draw Trail
      if (pkt.trail.length > 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(pkt.trail[0].x, pkt.trail[0].y);
          for (let t = 1; t < pkt.trail.length; t++) {
              this.ctx.lineTo(pkt.trail[t].x, pkt.trail[t].y);
          }
          this.ctx.strokeStyle = pkt.color;
          this.ctx.lineWidth = pkt.size * 0.8;
          this.ctx.globalAlpha = 0.6;
          this.ctx.stroke();
          
          // Decay trail
          pkt.trail.forEach(t => t.age -= 0.05);
      }

      // Glow effect
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = pkt.color;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, pkt.size, 0, Math.PI * 2);
      this.ctx.fillStyle = pkt.color;
      this.ctx.globalAlpha = 1;
      this.ctx.fill();
      
      this.ctx.shadowBlur = 0;
    }
    this.ctx.globalCompositeOperation = 'source-over';

    // Randomly spawn packets
    // Increased spawn rate
    if (Math.random() > 0.7) this.spawnPacket();

    requestAnimationFrame(this.animate);
  }

  updateStats() {
    const nodeEl = document.getElementById("node-count");
    const chEl = document.getElementById("channel-count");
    const tpsEl = document.getElementById("tps-count");
    if (!nodeEl || !chEl || !tpsEl) return;

    // Fake stats
    const targetNodes = this.nodes.length * 15; 
    const targetChannels = this.connections.length * 10;
    const targetTps = Math.floor(this.packets.length * 200 + Math.random() * 50);

    this.displayStats.nodes += (targetNodes - this.displayStats.nodes) * 0.1;
    this.displayStats.channels += (targetChannels - this.displayStats.channels) * 0.1;
    this.displayStats.tps += (targetTps - this.displayStats.tps) * 0.2;

    nodeEl.textContent = Math.floor(this.displayStats.nodes).toLocaleString();
    chEl.textContent = Math.floor(this.displayStats.channels).toLocaleString();
    tpsEl.textContent = Math.floor(this.displayStats.tps).toLocaleString();
  }

  detectDarkMode() {
    const themeAttr = document.documentElement.getAttribute('data-theme');
    if (themeAttr) return themeAttr === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  getThemeColors() {
    if (this.isDarkMode) {
      return {
        nodeHub: '#007AFF',
        nodeRegular: '#5856D6',
        payment: '#FF9500',
        paymentAlt: '#00FFCC'
      };
    } else {
      // Light mode: Darker, technical colors for better visibility
      return {
        nodeHub: '#0055FF',      
        nodeRegular: '#666666',  
        payment: '#FF5500',      
        paymentAlt: '#00AA88'    
      };
    }
  }

  initThemeListener() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          this.isDarkMode = this.detectDarkMode();
          this.themeColors = this.getThemeColors();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
}

// Initialize network visualization when page loads
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("networkCanvas")) {
    window.lnVis = new LightningNetworkCanvas("#networkCanvas");
  }
});
