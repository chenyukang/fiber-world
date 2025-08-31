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

// Advanced Network Visualization (Lightning-style Canvas)
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

    // Data
    this.nodes = []; // {x,y,r,type,color,ring,neighbors:[]}
    this.edges = []; // {a,b,w}
    this.routes = []; // active payments
    this.hover = { x: -1, y: -1, active: false };
    this.time = 0;
    this.seed = 1337;
    this.rand = () => (
      (this.seed = (1664525 * this.seed + 1013904223) >>> 0),
      this.seed / 0xffffffff
    );

    // 新增：DOM overlay、热点边集合与性能参数
    this.overlay = document.querySelector(".network-overlay");
    this.hotEdges = new Set(); // 仅绘制被“加热”的边，减少每帧遍历
    this.maxRoutes = 12; // 支付流上限，后续可动态调节
    this.prevTs = 0;
    this.frameAvg = 16; // ms

    // Offscreen base layer for static channels/nodes
    this.edgeIndex = new Map(); // key "a-b" -> edge idx（无向）
    this.base = document.createElement("canvas");
    this.bctx = this.base.getContext("2d");
    // 统计显示缓动
    this.displayStats = { nodes: 0, channels: 0, tps: 0 };
    // 初始化脉冲数组
    this.pulses = [];

    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.bindInteraction();

    // 减少初始路由数量，延迟加载
    this.generateGraph();
    this.preRenderStatic();
    this.updateOverlayHubs();

    // 延迟生成路由，先显示静态网络
    setTimeout(() => {
      this.spawnRoutes(5); // 减少初始路由数
      this.updateStats();
    }, 100);

    this.statsTimer = setInterval(() => this.updateStats(), 1500); // 降低更新频率

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(300, rect.width);
    this.height = Math.max(220, rect.height);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.base.width = this.canvas.width;
    this.base.height = this.canvas.height;
    this.bctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // 同步 overlay 尺寸与定位，确保与画布坐标一致
    if (this.overlay) {
      const parent = this.canvas.parentElement;
      if (parent && getComputedStyle(parent).position === "static")
        parent.style.position = "relative";
      this.overlay.style.position = "absolute";
      this.overlay.style.pointerEvents = "none";
      this.overlay.style.left = "0px";
      this.overlay.style.top = "0px";
      this.overlay.style.width = `${this.width}px`;
      this.overlay.style.height = `${this.height}px`;
    }

    // 重新绘制静态层以匹配尺寸变化
    if (this.nodes.length) this.preRenderStatic();
  }

  bindInteraction() {
    const onMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.hover.x = e.clientX - rect.left;
      this.hover.y = e.clientY - rect.top;
      this.hover.active = true;
    };
    const onLeave = () => (this.hover.active = false);
    this.canvas.addEventListener("mousemove", onMove);
    this.canvas.addEventListener("mouseleave", onLeave);
    this.canvas.addEventListener("click", () => this.spawnRoutes(2)); // 点击增加支付流
  }

  palette() {
    // 外环颜色（接近参考图的多彩圆环）
    return [
      "#7CFFB2",
      "#FF6767",
      "#FFE15D",
      "#66B3FF",
      "#B266FF",
      "#FF9E66",
      "#5CFFC7",
      "#FF66C4",
    ];
  }

  blueTone(alpha = 1) {
    return `rgba(120, 220, 255, ${alpha})`;
  }

  addNode(x, y, r, type) {
    const ringColors = this.palette();
    const ring = ringColors[Math.floor(this.rand() * ringColors.length)];
    const color = "rgba(200,240,255,0.9)";
    this.nodes.push({ x, y, r, type, color, ring, neighbors: [] });
    return this.nodes.length - 1;
  }

  // 生成精简的网络拓扑（增加节点数量以获得更丰富的网络效果）
  generateGraph() {
    this.nodes = [];
    this.edges = [];

    // 增加节点总数，创建更丰富的网络
    const maxNodes = Math.min(
      350,
      Math.max(120, (this.width * this.height) / 2500)
    );

    // 画布中心坐标
    const centerX = this.width * 0.45;
    const centerY = this.height * 0.52;

    // 定义网络的有效分布区域（相对于中心的半径） - 增大网络占用空间
    const networkRadiusX = Math.min(this.width * 0.5, 380); // 水平半径增大
    const networkRadiusY = Math.min(this.height * 0.5, 350); // 垂直半径增大
    const margin = 5; // 边界边距进一步减小

    // 边界检查函数 - 基于中心分布
    const clampToSafeBounds = (x, y, nodeRadius = 5) => {
      const minX = margin + nodeRadius;
      const maxX = this.width - margin - nodeRadius;
      const minY = margin + nodeRadius;
      const maxY = this.height - margin - nodeRadius;
      return {
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y))
      };
    };

    // Hub 节点 - 以中心为基准，在椭圆区域内分布
    const hubs = [
      {
        x: centerX + networkRadiusX * (-0.5),
        y: centerY + networkRadiusY * (-0.1),
        r: 8
      },
      {
        x: centerX + networkRadiusX * (-0.1),
        y: centerY + networkRadiusY * (-0.5),
        r: 6
      },
      {
        x: centerX + networkRadiusX * (0.1),
        y: centerY + networkRadiusY * (0),
        r: 10
      },
      {
        x: centerX + networkRadiusX * (0.5),
        y: centerY + networkRadiusY * (-0.2),
        r: 7
      },
      {
        x: centerX + networkRadiusX * (0.6),
        y: centerY + networkRadiusY * (0.3),
        r: 9
      },
    ];

    const hubIdx = hubs.map((h) => this.addNode(h.x, h.y, h.r, "hub"));

    // 每个 hub 周围更多节点
    const secondPerHub = 12; // 从8增加到12
    const microPerHub = 18; // 从12增加到18

    hubs.forEach((h) => {
      // 二级节点 - 围绕 hub 分布
      for (let i = 0; i < secondPerHub; i++) {
        const ang = (i / secondPerHub) * Math.PI * 2 + this.rand() * 0.5;
        const dist = 30 + this.rand() * 40; // 稍微减小距离，保持紧凑
        const rawX = h.x + Math.cos(ang) * dist;
        const rawY = h.y + Math.sin(ang) * dist;
        const clamped = clampToSafeBounds(rawX, rawY, 5);
        this.addNode(clamped.x, clamped.y, 3 + this.rand() * 2, "secondary");
      }
      // 微节点 - 围绕 hub 分布，距离稍远
      for (let i = 0; i < microPerHub; i++) {
        const ang = this.rand() * Math.PI * 2;
        const dist = 60 + this.rand() * 60; // 调整距离，保持在中心区域
        const rawX = h.x + Math.cos(ang) * dist;
        const rawY = h.y + Math.sin(ang) * dist;
        const clamped = clampToSafeBounds(rawX, rawY, 3);
        this.addNode(clamped.x, clamped.y, 1 + this.rand() * 1.2, "micro");
      }
    });

    // 中央区域节点 - 在网络中心区域随机分布
    const remainingNodes = Math.max(20, maxNodes - this.nodes.length);
    for (let i = 0; i < remainingNodes; i++) {
      // 在椭圆区域内生成随机位置
      const angle = this.rand() * Math.PI * 2;
      const radiusFactor = Math.sqrt(this.rand()) * 0.7; // 使用平方根分布，让节点更集中在中心
      const x = centerX + Math.cos(angle) * networkRadiusX * radiusFactor;
      const y = centerY + Math.sin(angle) * networkRadiusY * radiusFactor;
      const clamped = clampToSafeBounds(x, y, 3);
      this.addNode(clamped.x, clamped.y, 1 + this.rand() * 1.2, "micro");
    }

    this.buildEdges();
  }

  // 优化边生成算法，减少计算复杂度
  buildEdges() {
    const pts = this.nodes;
    if (pts.length < 2) return;

    // 简化网格，使用更大的网格尺寸
    const gridSize = 60;
    const cols = Math.ceil(this.width / gridSize);
    const rows = Math.ceil(this.height / gridSize);
    const grid = new Array(cols * rows).fill(0).map(() => []);
    const gi = (x, y) => {
      const col = Math.max(0, Math.min(cols - 1, Math.floor(x / gridSize)));
      const row = Math.max(0, Math.min(rows - 1, Math.floor(y / gridSize)));
      return col + row * cols;
    };

    pts.forEach((p, i) => grid[gi(p.x, p.y)].push(i));

    // 减少最大连接数
    const maxDeg = (i) =>
      pts[i].type === "hub" ? 12 : pts[i].type === "secondary" ? 6 : 3;
    const radius = (i) =>
      pts[i].type === "hub" ? 180 : pts[i].type === "secondary" ? 120 : 60;

    const seen = new Set();
    const addEdge = (a, b, w) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (seen.has(key)) return;
      seen.add(key);
      this.edges.push({ a, b, w, heat: 0 });
      if (!pts[a].neighbors) pts[a].neighbors = [];
      if (!pts[b].neighbors) pts[b].neighbors = [];
      pts[a].neighbors.push(b);
      pts[b].neighbors.push(a);
    };

    // 简化邻居查找
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const cx = Math.floor(p.x / gridSize);
      const cy = Math.floor(p.y / gridSize);
      const r = radius(i);

      // 减少搜索范围
      const searchRange = Math.min(2, Math.ceil(r / gridSize));
      const candidates = [];

      for (let dx = -searchRange; dx <= searchRange; dx++) {
        for (let dy = -searchRange; dy <= searchRange; dy++) {
          const gx = cx + dx,
            gy = cy + dy;
          if (gx >= 0 && gy >= 0 && gx < cols && gy < rows) {
            const cellIndex = gx + gy * cols;
            if (grid[cellIndex]) {
              grid[cellIndex].forEach((j) => {
                if (j !== i) candidates.push(j);
              });
            }
          }
        }
      }

      // 限制候选节点数量
      const maxCandidates = Math.min(30, candidates.length);
      if (candidates.length > maxCandidates) {
        candidates.length = maxCandidates;
      }

      candidates.sort((j, k) => this.dist2(p, pts[j]) - this.dist2(p, pts[k]));

      const maxConnections = maxDeg(i);
      let added = 0;

      for (let c of candidates) {
        if (added >= maxConnections) break;
        const d = Math.sqrt(this.dist2(p, pts[c]));
        if (d <= r) {
          addEdge(i, c, Math.max(0.1, 1 - d / (r + 1)));
          added++;
        }
      }
    }

    // 建立边索引
    this.edgeIndex = new Map();
    for (let i = 0; i < this.edges.length; i++) {
      const e = this.edges[i];
      const k = e.a < e.b ? `${e.a}-${e.b}` : `${e.b}-${e.a}`;
      this.edgeIndex.set(k, i);
    }
  }

  // 同步 overlay 上的 hub-indicator 到真实 hub 节点位置
  updateOverlayHubs() {
    if (!this.overlay) return;
    const hubs = this.nodes.filter((n) => n.type === "hub");
    // 确保元素数量匹配
    let elems = Array.from(this.overlay.querySelectorAll(".hub-indicator"));
    const need = Math.min(hubs.length, 5);
    // 创建缺少的元素
    while (elems.length < need) {
      const el = document.createElement("div");
      el.className = "hub-indicator";
      this.overlay.appendChild(el);
      elems.push(el);
    }
    // 位置同步
    for (let i = 0; i < elems.length; i++) {
      const el = elems[i];
      const hub = hubs[i];
      if (!hub) {
        el.style.display = "none";
        continue;
      }
      el.style.display = "block";
      el.style.left = `${hub.x}px`;
      el.style.top = `${hub.y}px`;
    }
  }

  // 仅绘制被加热的边（热点通道），并逐帧衰减
  drawHotEdges() {
    const ctx = this.ctx;
    if (!this.hotEdges.size) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    const toDelete = [];
    for (const idx of this.hotEdges) {
      const e = this.edges[idx];
      if (!e) {
        toDelete.push(idx);
        continue;
      }
      if (e.heat <= 0.01) {
        toDelete.push(idx);
        continue;
      }
      const a = this.nodes[e.a],
        b = this.nodes[e.b];
      const alpha = Math.min(0.6, 0.06 + e.heat * 0.55);
      const w = 1.0 + e.w * 1.6 + e.heat * 2.0;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineWidth = w;
      ctx.strokeStyle = `rgba(140, 240, 255, ${alpha})`;
      ctx.shadowColor = `rgba(140, 240, 255, ${alpha})`;
      ctx.shadowBlur = 10 + e.heat * 10;
      ctx.stroke();
      e.heat *= 0.93; // 衰减
    }
    for (const i of toDelete) this.hotEdges.delete(i);
    ctx.restore();
  }

  addHeat(a, b, amount = 0.25) {
    if (a == null || b == null) return;
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    const idx = this.edgeIndex.get(k);
    if (idx == null) return;
    const e = this.edges[idx];
    e.heat = Math.min(1.0, e.heat + amount);
    this.hotEdges.add(idx); // 标记热点
  }

  // 新增：节点脉冲（支付到达节点时一个彩色扩散波纹）
  drawPulses() {
    const ctx = this.ctx;
    // 防御：确保脉冲数组存在
    if (!Array.isArray(this.pulses)) this.pulses = [];
    if (this.pulses.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      if (!p || !isFinite(p.r) || !isFinite(p.maxR)) {
        this.pulses.splice(i, 1);
        continue;
      }
      const maxR = Math.max(1, p.maxR);
      const t = Math.max(0, Math.min(1, p.r / maxR));
      const alpha = (p.alpha ?? 0.9) * (1 - t);
      if (alpha <= 0) {
        this.pulses.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.lineWidth = 2 + (1 - t) * 2;
      const hue = p.hue ?? 50;
      ctx.strokeStyle = `hsla(${hue}, 100%, ${60 + (1 - t) * 20}%, ${alpha})`;
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, ${alpha})`;
      ctx.shadowBlur = 18;
      ctx.stroke();
      p.r += 1.8; // 扩散速度
    }
    ctx.restore();
  }

  // 优化静态层渲染，减少绘制操作
  preRenderStatic() {
    const ctx = this.bctx;
    const w = this.width,
      h = this.height;
    ctx.clearRect(0, 0, w, h);

    // Theme-aware background effect
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const radial = ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      10,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.5
    );

    if (this.isDarkMode) {
      radial.addColorStop(0, "rgba(0,122,255,0.06)");
      radial.addColorStop(1, "rgba(0,0,0,0)");
    } else {
      radial.addColorStop(0, "rgba(80,180,255,0.04)");
      radial.addColorStop(1, "rgba(0,0,0,0)");
    }

    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // 批量绘制边，减少状态切换
    if (this.edges.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      // Theme-aware shadow
      if (this.isDarkMode) {
        ctx.shadowColor = "rgba(0,122,255,0.3)";
      } else {
        ctx.shadowColor = "rgba(120,230,255,0.2)";
      }
      ctx.shadowBlur = 4;

      // 按权重分批绘制
      const heavyEdges = this.edges.filter((e) => e.w > 0.6);
      const lightEdges = this.edges.filter((e) => e.w <= 0.6);

      // 粗边
      if (heavyEdges.length > 0) {
        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(120, 230, 255, 0.15)";
        heavyEdges.forEach((e) => {
          const a = this.nodes[e.a],
            b = this.nodes[e.b];
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        });
        ctx.stroke();
      }

      // 细边
      if (lightEdges.length > 0) {
        ctx.beginPath();
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = this.isDarkMode ? "rgba(0,122,255,0.12)" : "rgba(120, 230, 255, 0.08)";
        lightEdges.forEach((e) => {
          const a = this.nodes[e.a],
            b = this.nodes[e.b];
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        });
        ctx.stroke();
      }
      ctx.restore();
    }

    // 批量绘制节点
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // 按类型分批绘制
    const hubs = this.nodes.filter((n) => n.type === "hub");
    const secondaries = this.nodes.filter((n) => n.type === "secondary");
    const micros = this.nodes.filter((n) => n.type === "micro");

    // Hub 节点
    hubs.forEach((n) => {
      // 外环
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = this.alpha(n.ring, 0.9);
      ctx.lineWidth = 2.2;
      ctx.stroke();
      // 内核
      ctx.fillStyle = this.isDarkMode ? "rgba(242,242,247,0.9)" : "rgba(255,255,255,0.9)";
      ctx.shadowColor = this.isDarkMode ? "rgba(0,122,255,0.6)" : "rgba(120,220,255,0.5)";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 二级节点
    secondaries.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 1, 0, Math.PI * 2);
      ctx.strokeStyle = this.alpha(n.ring, 0.8);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = this.isDarkMode ? "rgba(152,152,157,0.8)" : "rgba(220,240,255,0.8)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 微节点
    ctx.shadowBlur = 3;
    micros.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = this.alpha(n.ring, 0.7);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = this.isDarkMode ? "rgba(98,98,157,0.7)" : "rgba(200,235,255,0.7)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // 将新增边绘制到静态层（与 preRenderStatic 中样式一致）
  drawEdgeToBase(e) {
    const ctx = this.bctx;
    const a = this.nodes[e.a],
      b = this.nodes[e.b];
    if (!a || !b) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineWidth = 0.6 + e.w * 1.4;
    ctx.strokeStyle = `rgba(120, 230, 255, ${0.05 + e.w * 0.18})`;
    ctx.shadowColor = "rgba(120,230,255,0.3)";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();
  }

  // 随机动态增加一条边（通道），并触发热点与统计更新
  addRandomEdge() {
    if (this.nodes.length < 2) return;
    const a = Math.floor(this.rand() * this.nodes.length);
    let best = -1,
      bestD = Infinity;
    const pa = this.nodes[a];
    const radius = pa.type === "hub" ? 220 : pa.type === "secondary" ? 140 : 90;
    for (let b = 0; b < this.nodes.length; b++) {
      if (b === a) continue;
      // 已经相邻则跳过
      if (pa.neighbors && pa.neighbors.includes(b)) continue;
      const d2 = this.dist2(pa, this.nodes[b]);
      if (d2 < bestD && Math.sqrt(d2) < radius) {
        bestD = d2;
        best = b;
      }
    }
    if (best === -1) return;
    const d = Math.sqrt(bestD);
    const w = Math.max(0.05, 1 - d / (radius + 1));
    const e = { a, b: best, w, heat: 0.9 };
    this.edges.push(e);
    this.nodes[a].neighbors.push(best);
    this.nodes[best].neighbors.push(a);
    const key = a < best ? `${a}-${best}` : `${best}-${a}`;
    this.edgeIndex.set(key, this.edges.length - 1);
    // 绘制到静态层
    this.drawEdgeToBase(e);
    // 触发热点辉光
    this.hotEdges.add(this.edges.length - 1);
    // 轻微节点脉冲
    const hue = 40 + Math.floor(this.rand() * 50);
    this.pulses.push({
      x: pa.x,
      y: pa.y,
      r: pa.r + 3,
      maxR: pa.r + 26,
      alpha: 0.7,
      hue,
    });
    const pb = this.nodes[best];
    this.pulses.push({
      x: pb.x,
      y: pb.y,
      r: pb.r + 3,
      maxR: pb.r + 26,
      alpha: 0.7,
      hue,
    });
    // 更新统计立即可见
    this.updateStats(true);
  }

  // 随机选择一个节点（可带过滤条件），无候选时返回 -1
  pickNode(predicate) {
    const candidates = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      if (!n) continue;
      if (!predicate || predicate(n)) candidates.push(i);
    }
    if (candidates.length === 0) return -1;
    return candidates[Math.floor(this.rand() * candidates.length)];
  }

  spawnRoutes(count = 6) {
    // 定义不同类型支付路径的颜色主题
    const colorThemes = [
      { hue: 60, name: "Bitcoin", range: 20 },      // 金色系
      { hue: 120, name: "Ethereum", range: 25 },    // 绿色系
      { hue: 240, name: "Lightning", range: 30 },   // 蓝色系
      { hue: 300, name: "DeFi", range: 25 },        // 紫色系
      { hue: 0, name: "Emergency", range: 15 },     // 红色系
      { hue: 180, name: "Stablecoin", range: 20 },  // 青色系
      { hue: 30, name: "P2P", range: 15 },          // 橙色系
    ];

    for (let i = 0; i < count; i++) {
      const start = this.pickNode(
        (x) => x.x < this.width * (0.35 + this.rand() * 0.2)
      );
      const end = this.pickNode(
        (x) => x.x > this.width * (0.55 - this.rand() * 0.2)
      );
      if (start === -1 || end === -1) continue;
      const path = this.findPath(
        start,
        end,
        8 + Math.floor(this.rand() * 3),
        3 + Math.floor(this.rand() * 2)
      );
      if (path.length < 2) continue;

      // 选择随机颜色主题
      const theme = colorThemes[Math.floor(this.rand() * colorThemes.length)];
      const hue = theme.hue + (this.rand() - 0.5) * theme.range;

      this.routes.push({
        path,
        seg: 0,
        t: this.rand(),
        speed: 0.012 + this.rand() * 0.012,
        hue: Math.max(0, Math.min(360, hue)),
        theme: theme.name,
        // 添加额外的视觉属性
        intensity: 0.7 + this.rand() * 0.3, // 支付强度影响亮度
        priority: Math.random() > 0.7 ? 'high' : 'normal' // 高优先级支付更亮
      });
    }
  }

  // 贪心多跳路径，限制为相邻节点，支持最小跳数
  findPath(aIdx, bIdx, maxHops = 6, minHops = 2) {
    const path = [aIdx];
    let current = aIdx;
    const visited = new Set([aIdx]);
    for (let hop = 0; hop < maxHops; hop++) {
      const nbrs = this.nodes[current].neighbors;
      if (!nbrs || !nbrs.length) break;
      let next = -1,
        best = Infinity;
      const target = this.nodes[bIdx];
      for (const n of nbrs) {
        if (visited.has(n)) continue;
        const d = this.dist2(this.nodes[n], target);
        if (d < best) {
          best = d;
          next = n;
        }
      }
      if (next === -1) break;
      path.push(next);
      visited.add(next);
      current = next;
      if (current === bIdx && path.length >= minHops + 1) break;
    }
    return path.length >= 2 ? path : [];
  }

  drawRoute(route) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const pts = route.path.map((i) => this.nodes[i]);

    // 根据支付类型和优先级计算颜色和强度
    const intensity = route.intensity || 0.8;
    const baseAlpha = route.priority === 'high' ? 0.3 : 0.2;
    const lightness = route.priority === 'high' ? 65 : 60;
    const saturation = Math.min(100, 80 + intensity * 20);

    // 高亮路径通道，使用增强的颜色
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `hsla(${route.hue}, ${saturation}%, ${lightness}%, ${baseAlpha})`;
    ctx.shadowColor = `hsla(${route.hue}, 100%, ${lightness}%, ${baseAlpha + 0.15})`;
    ctx.shadowBlur = route.priority === 'high' ? 16 : 12;
    ctx.lineWidth = route.priority === 'high' ? 2.5 : 2;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();

    // 沿路整体轻微加热，当前段显著加热
    for (let i = 0; i < route.path.length - 1; i++)
      this.addHeat(route.path[i], route.path[i + 1], 0.035 * intensity);

    // 沿边移动的支付粒子
    const segA = pts[route.seg];
    const segB = pts[route.seg + 1] || segA;
    const x = segA.x + (segB.x - segA.x) * route.t;
    const y = segA.y + (segB.y - segA.y) * route.t;

    // 当前段强加热并带动局部发光
    this.addHeat(route.path[route.seg], route.path[route.seg + 1], 0.45 * intensity);

    // 增强的拖尾效果，根据支付类型调整
    const tailLength = route.priority === 'high' ? 8 : 6;
    for (let i = 0; i < tailLength; i++) {
      const k = Math.max(0, 1 - i * (route.priority === 'high' ? 0.15 : 0.18));
      const tailRadius = route.priority === 'high' ? 3.8 * k : 3.2 * k;
      ctx.beginPath();
      ctx.arc(
        x - (segB.x - segA.x) * i * 0.05,
        y - (segB.y - segA.y) * i * 0.05,
        tailRadius,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `hsla(${route.hue}, ${saturation}%, ${lightness - i * 6}%, ${
        (0.35 - i * 0.04) * intensity
      })`;
      ctx.shadowColor = `hsla(${route.hue}, 100%, ${lightness}%, ${(0.5 - i * 0.06) * intensity})`;
      ctx.shadowBlur = 16 * k;
      ctx.fill();
    }

    // 增强的主粒子
    const mainRadius = route.priority === 'high' ? 4.2 : 3.5;
    ctx.beginPath();
    ctx.arc(x, y, mainRadius, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${route.hue}, ${saturation}%, ${lightness + 10}%, ${intensity})`;
    ctx.shadowColor = `hsla(${route.hue}, 100%, ${lightness + 15}%, ${intensity})`;
    ctx.shadowBlur = route.priority === 'high' ? 25 : 20;
    ctx.fill();
    ctx.restore();

    // 推进
    route.t += route.speed;
    if (route.t >= 1) {
      // 在抵达节点时爆发一个彩色脉冲
      const n = this.nodes[route.path[route.seg + 1]];
      if (n)
        this.pulses.push({
          x: n.x,
          y: n.y,
          r: n.r + 3,
          maxR: n.r + 26,
          alpha: 0.9,
          hue: route.hue,
        });

      route.t = 0;
      route.seg++;
      if (route.seg >= route.path.length - 1) {
        // 终点更强的脉冲
        const last = this.nodes[route.path[route.path.length - 1]];
        if (last)
          this.pulses.push({
            x: last.x,
            y: last.y,
            r: last.r + 4,
            maxR: last.r + 36,
            alpha: 0.95,
            hue: route.hue,
          });
        // 结束后重新生成一条新路径
        route.seg = 0;
        route.path = this.findPath(
          this.pickNode((n) => n.x < this.width * 0.4),
          this.pickNode((n) => n.x > this.width * 0.6),
          4 + Math.floor(this.rand() * 5)
        );
      }
    }
  }

  drawHover() {
    if (!this.hover.active) return;
    // 找最近的节点
    let idx = -1,
      best = 9007199254740991;
    for (let i = 0; i < this.nodes.length; i++) {
      const d2 = this.dist2(this.nodes[i], this.hover);
      if (d2 < best) {
        best = d2;
        idx = i;
      }
    }
    if (idx === -1 || Math.sqrt(best) > 60) return;
    const n = this.nodes[idx];
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // 放大环与节点光晕
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = this.alpha(n.ring, 1);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = this.alpha(n.ring, 1);
    ctx.shadowBlur = 18;
    ctx.stroke();

    // 连线高亮
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(160, 240, 255, 0.5)";
    ctx.shadowColor = "rgba(160, 240, 255, 0.7)";
    ctx.shadowBlur = 10;
    for (const j of n.neighbors.slice(0, 8)) {
      const m = this.nodes[j];
      ctx.beginPath();
      ctx.moveTo(n.x, n.y);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  animate(ts) {
    // 简单性能自适应：根据帧间隔调节分辨率与并发路由
    if (this.prevTs) {
      const dt = Math.max(1, ts - this.prevTs);
      this.frameAvg = this.frameAvg * 0.9 + dt * 0.1;
    }
    this.prevTs = ts;

    // 降画质：低于 ~45fps 时将 dpr 限到 1，并降低路由上限
    if (this.frameAvg > 22 && this.dpr > 1) {
      this.dpr = 1;
      this.maxRoutes = 10;
      this.resize();
    }
    // 恢复一点清晰度：流畅时稍抬 dpr 但不超过 1.35
    else if (this.frameAvg < 15 && this.dpr < 1.35) {
      this.dpr = Math.min(1.35, this.dpr + 0.05);
      this.resize();
    }

    // 清屏并绘制静态层
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.base, 0, 0, this.width, this.height);

    // 热点通道辉光（仅绘制热点）
    this.drawHotEdges();

    // 轻微的全局呼吸亮度
    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    const amp = 0.04 + Math.sin((ts || 0) * 0.002) * 0.018;
    this.ctx.fillStyle = `rgba(120,220,255,${amp})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();

    // 动态支付流
    for (const r of this.routes) this.drawRoute(r);

    // 节点脉冲与交互
    this.drawPulses();
    this.drawHover();

    // 动态新增通道（少量、随机）
    if (Math.random() > 0.996) this.addRandomEdge();
    // 控制并发路由并偶尔补充
    if (this.routes.length > this.maxRoutes)
      this.routes.length = this.maxRoutes;
    if (this.routes.length < this.maxRoutes && Math.random() > 0.988)
      this.spawnRoutes(1);

    requestAnimationFrame(this.animate);
  }

  updateStats(force = false) {
    const nodeEl = document.getElementById("node-count");
    const chEl = document.getElementById("channel-count");
    const tpsEl = document.getElementById("tps-count");
    if (!nodeEl || !chEl || !tpsEl) return;
    const targetNodes = this.nodes.length;
    const targetChannels = this.edges.length;
    const targetTps = Math.round(
      this.routes.length *
        (180 + Math.random() * 160) *
        (0.8 + Math.random() * 0.4)
    );
    // 初始化
    if (
      this.displayStats.nodes === 0 &&
      this.displayStats.channels === 0 &&
      !force
    ) {
      this.displayStats.nodes = targetNodes;
      this.displayStats.channels = targetChannels;
      this.displayStats.tps = targetTps;
    }
    // 缓动到目标
    const ease = (cur, tgt, k = 0.3) =>
      cur +
      Math.sign(tgt - cur) * Math.max(1, Math.floor(Math.abs(tgt - cur) * k));
    this.displayStats.nodes = ease(this.displayStats.nodes, targetNodes, 0.25);
    this.displayStats.channels = ease(
      this.displayStats.channels,
      targetChannels,
      0.25
    );
    this.displayStats.tps = ease(this.displayStats.tps, targetTps, 0.35);
    nodeEl.textContent = this.displayStats.nodes.toLocaleString();
    chEl.textContent = this.displayStats.channels.toLocaleString();
    tpsEl.textContent = this.displayStats.tps.toLocaleString();
  }

  alpha(hex, a) {
    // hex -> rgba string with alpha
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  dist2(a, b) {
    const dx = a.x - b.x,
      dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  // Dark mode detection and theme handling
  detectDarkMode() {
    // Check for data-theme attribute first
    const themeAttr = document.documentElement.getAttribute('data-theme');
    if (themeAttr) {
      return themeAttr === 'dark';
    }

    // Fallback to prefers-color-scheme
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  getThemeColors() {
    if (this.isDarkMode) {
      return {
        background: '#000000',
        nodeDefault: '#38383A',
        nodeHub: '#007AFF',
        nodeRegular: '#5856D6',
        edge: '#38383A',
        edgeActive: '#007AFF',
        payment: '#FF9500',
        text: '#F2F2F7'
      };
    } else {
      return {
        background: '#FBFBFD',
        nodeDefault: '#D2D2D7',
        nodeHub: '#007AFF',
        nodeRegular: '#5856D6',
        edge: '#D2D2D7',
        edgeActive: '#007AFF',
        payment: '#FF9500',
        text: '#1D1D1F'
      };
    }
  }

  initThemeListener() {
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addListener((e) => {
        this.isDarkMode = e.matches;
        this.themeColors = this.getThemeColors();
        this.preRenderStatic(); // Re-render with new colors
      });
    }

    // Listen for manual theme changes (if implemented)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          this.isDarkMode = this.detectDarkMode();
          this.themeColors = this.getThemeColors();
          this.preRenderStatic(); // Re-render with new colors
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }
}

// Initialize network visualization when page loads
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("networkCanvas")) {
    window.lnVis = new LightningNetworkCanvas("#networkCanvas");
  }
});
