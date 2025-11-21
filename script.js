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

// Advanced Network Visualization (Cardano-style 3D Particle Network)
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

    // 3D Network Data
    this.nodes = []; // {x, y, z, tx, ty, type, ...}
    this.connections = []; // {a, b, opacity}
    this.packets = []; // {path: [nodeIdx, ...], currentIdx, progress, speed, ...}
    
    // Animation Parameters
    this.rotation = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.mouse = { x: 0, y: 0 };
    this.isHovering = false;
    this.introProgress = 0; // For expansion effect
    
    // Stats
    this.displayStats = { nodes: 0, channels: 0, tps: 0 };

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
      this.mouse.x = (e.clientX - this.width / 2) * 0.0005;
      this.mouse.y = (e.clientY - this.height / 2) * 0.0005;
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
    const nodeCount = isMobile ? 70 : 180; // Increased node count
    // Increased scale to occupy ~3/4 of screen visually
    const baseScale = Math.min(this.width, this.height) * (isMobile ? 0.9 : 1.3); 
    const connectionDistance = baseScale * 0.3; // Adjusted for density
    
    // Create Nodes in a 3D sphere/cloud
    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      // Distribute nodes: some core, some outer shell for depth
      const dist = (Math.random() * 0.6 + 0.4) * baseScale / 2; 
      
      this.nodes.push({
        x: dist * Math.sin(phi) * Math.cos(theta),
        y: dist * Math.sin(phi) * Math.sin(theta),
        z: dist * Math.cos(phi),
        // Store original positions for expansion animation
        targetX: dist * Math.sin(phi) * Math.cos(theta),
        targetY: dist * Math.sin(phi) * Math.sin(theta),
        targetZ: dist * Math.cos(phi),
        type: Math.random() > 0.92 ? 'hub' : 'node',
        size: Math.random() > 0.92 ? 10 : 3, // Larger hubs (was 6)
        pulse: Math.random() * Math.PI,
        connections: []
      });
    }

    // Pre-calculate connections based on 3D distance (initial topology)
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const d = this.dist3d(this.nodes[i], this.nodes[j]);
        // Limit connections per node to avoid clutter
        if (d < connectionDistance && this.nodes[i].connections.length < 5 && this.nodes[j].connections.length < 5) {
          this.connections.push({ a: i, b: j });
          this.nodes[i].connections.push(j);
          this.nodes[j].connections.push(i);
        }
      }
    }
  }

  dist3d(p1, p2) {
    // Use target positions for distance calculation so topology is stable during expansion
    const x1 = p1.targetX || p1.x;
    const y1 = p1.targetY || p1.y;
    const z1 = p1.targetZ || p1.z;
    const x2 = p2.targetX || p2.x;
    const y2 = p2.targetY || p2.y;
    const z2 = p2.targetZ || p2.z;

    return Math.sqrt(
      Math.pow(x1 - x2, 2) + 
      Math.pow(y1 - y2, 2) + 
      Math.pow(z1 - z2, 2)
    );
  }

  project(p) {
    // Simple perspective projection
    const fov = 1000; // Increased FOV for less distortion at edges
    const scale = fov / (fov + p.z + 600); 
    return {
      x: p.x * scale + this.width / 2,
      y: p.y * scale + this.height / 2,
      scale: scale,
      visible: scale > 0
    };
  }

  rotatePoint(p, rotX, rotY) {
    // Rotate Y
    let x = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
    let z = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    let y = p.y;

    // Rotate X
    let y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
    let z2 = y * Math.sin(rotX) + z * Math.cos(rotX);

    return { x: x, y: y2, z: z2 };
  }

  spawnPacket() {
    if (this.packets.length > 15) return; // Limit active packets
    
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
    const length = 3 + Math.floor(Math.random() * 5);
    
    for(let i=0; i<length; i++) {
      const neighbors = this.nodes[current].connections;
      if (neighbors.length === 0) break;
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      path.push(next);
      current = next;
    }

    if (path.length > 1) {
      this.packets.push({
        path: path,
        segment: 0,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01, // Slower animation (was 0.03)
        color: Math.random() > 0.5 ? this.themeColors.payment : this.themeColors.paymentAlt
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Expansion Effect (Intro)
    // Smoothly interpolate introProgress from 0 to 1
    this.introProgress += (1 - this.introProgress) * 0.03;
    
    // Update Rotation
    if (this.isHovering) {
      this.targetRotation.x = -this.mouse.y * 1.5;
      this.targetRotation.y = this.mouse.x * 1.5;
    } else {
      this.targetRotation.x = 0;
      this.targetRotation.y += 0.0015; // Slightly faster auto rotate
    }
    
    // Smooth rotation
    this.rotation.x += (this.targetRotation.x - this.rotation.x) * 0.05;
    this.rotation.y += (this.targetRotation.y - this.rotation.y) * 0.05;

    // Update and Project Nodes
    const projectedNodes = [];
    this.nodes.forEach((node, i) => {
      // Pulse effect
      node.pulse += 0.05;
      
      // Apply expansion
      node.x = node.targetX * this.introProgress;
      node.y = node.targetY * this.introProgress;
      node.z = node.targetZ * this.introProgress;
      
      // Rotate
      const rotated = this.rotatePoint(node, this.rotation.x, this.rotation.y);
      const proj = this.project(rotated);
      
      projectedNodes[i] = { ...proj, z: rotated.z, original: node };
    });

    // Draw Connections
    this.ctx.lineWidth = this.isDarkMode ? 1.2 : 1.5; // Thicker lines
    this.connections.forEach(conn => {
      const p1 = projectedNodes[conn.a];
      const p2 = projectedNodes[conn.b];
      
      if (p1.visible && p2.visible && p1.z < 800 && p2.z < 800) { // Depth culling
        const avgZ = (p1.z + p2.z) / 2;
        // Calculate opacity based on depth and intro progress
        let alpha = Math.max(0, (1 - (avgZ + 600) / 1200));
        alpha *= this.introProgress; // Fade in with expansion
        
        if (alpha > 0.05) {
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            
            if (this.isDarkMode) {
                this.ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.5})`;
            } else {
                // Much darker, stronger lines in light mode
                this.ctx.strokeStyle = `rgba(20, 40, 100, ${alpha * 0.6})`;
            }
            this.ctx.stroke();
        }
      }
    });

    // Draw Active Paths (Highlight entire route)
    this.ctx.save();
    this.packets.forEach(pkt => {
        if (!pkt.path || pkt.path.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = pkt.color;
        this.ctx.lineWidth = this.isDarkMode ? 2 : 3; // Thicker path
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        // Fade out path based on packet progress to simulate tail or just keep it steady
        this.ctx.globalAlpha = this.isDarkMode ? 0.3 : 0.4; 

        let started = false;
        for (let i = 0; i < pkt.path.length - 1; i++) {
            const idxA = pkt.path[i];
            const idxB = pkt.path[i+1];
            const pA = projectedNodes[idxA];
            const pB = projectedNodes[idxB];

            if (pA.visible && pB.visible && pA.z < 800 && pB.z < 800) {
                this.ctx.moveTo(pA.x, pA.y);
                this.ctx.lineTo(pB.x, pB.y);
            }
        }
        this.ctx.stroke();
    });
    this.ctx.restore();

    // Draw Nodes
    projectedNodes.forEach(p => {
      if (p.visible) {
        const alpha = Math.max(0, (1 - (p.z + 600) / 1200)) * this.introProgress;
        if (alpha <= 0) return;

        const size = p.original.size * p.scale * (1 + Math.sin(p.original.pulse) * 0.2);
        
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        
        if (p.original.type === 'hub') {
            this.ctx.fillStyle = this.themeColors.nodeHub;
        } else {
            this.ctx.fillStyle = this.themeColors.nodeRegular;
        }
        
        this.ctx.globalAlpha = alpha;
        this.ctx.fill();
        
        // Geeky: Add a ring around hubs
        if (p.original.type === 'hub') {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, size * 1.8, 0, Math.PI * 2);
          this.ctx.strokeStyle = this.themeColors.nodeHub;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
      }
    });

    // Draw Packets
    this.ctx.globalCompositeOperation = this.isDarkMode ? 'lighter' : 'source-over';
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const pkt = this.packets[i];
      pkt.progress += pkt.speed;
      
      if (pkt.progress >= 1) {
        pkt.progress = 0;
        pkt.segment++;
        if (pkt.segment >= pkt.path.length - 1) {
          this.packets.splice(i, 1);
          continue;
        }
      }

      const idxA = pkt.path[pkt.segment];
      const idxB = pkt.path[pkt.segment + 1];
      const pA = projectedNodes[idxA];
      const pB = projectedNodes[idxB];

      if (pA.visible && pB.visible) {
        const x = pA.x + (pB.x - pA.x) * pkt.progress;
        const y = pA.y + (pB.y - pA.y) * pkt.progress;
        const scale = pA.scale + (pB.scale - pA.scale) * pkt.progress;
        
        // Glow effect for both modes
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = pkt.color;
        
        // Outer glow/halo for light mode to make it visible
        if (!this.isDarkMode) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8 * scale, 0, Math.PI * 2);
            this.ctx.fillStyle = pkt.color;
            this.ctx.fill();
            this.ctx.restore();
        }

        this.ctx.beginPath();
        this.ctx.arc(x, y, 4 * scale, 0, Math.PI * 2);
        this.ctx.fillStyle = pkt.color;
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
      }
    }
    this.ctx.globalCompositeOperation = 'source-over';

    // Randomly spawn packets
    if (Math.random() > 0.92) this.spawnPacket();

    requestAnimationFrame(this.animate);
  }

  updateStats() {
    const nodeEl = document.getElementById("node-count");
    const chEl = document.getElementById("channel-count");
    const tpsEl = document.getElementById("tps-count");
    if (!nodeEl || !chEl || !tpsEl) return;

    // Fake stats that look realistic based on the visual
    const targetNodes = this.nodes.length * 12; 
    const targetChannels = this.connections.length * 8;
    const targetTps = Math.floor(this.packets.length * 150 + Math.random() * 50);

    // Smooth interpolation
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
        nodeHub: '#0044CC',      // Stronger Blue
        nodeRegular: '#444444',  // Darker Grey
        payment: '#FF4400',      // Intense Orange
        paymentAlt: '#009977'    // Darker Teal
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
