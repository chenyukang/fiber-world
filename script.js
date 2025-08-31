// Step navigation functionality
let currentStep = 1;
const totalSteps = 4;

function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });

    // Show current step
    const currentStepElement = document.querySelector(`[data-step="${stepNumber}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }

    // Update indicators
    document.querySelectorAll('.indicator').forEach(indicator => {
        indicator.classList.remove('active');
    });

    const currentIndicator = document.querySelector(`.indicator[data-step="${stepNumber}"]`);
    if (currentIndicator) {
        currentIndicator.classList.add('active');
    }

    currentStep = stepNumber;
}

function nextStep() {
    if (currentStep < totalSteps) {
        showStep(currentStep + 1);
    } else {
        showStep(1); // Loop back to first step
    }
}

function previousStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    } else {
        showStep(totalSteps); // Loop to last step
    }
}

// Auto-advance steps every 5 seconds
let autoAdvanceInterval;

function startAutoAdvance() {
    autoAdvanceInterval = setInterval(nextStep, 5000);
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
            behavior: 'smooth'
        });
    }
}

// Navbar scroll effect
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(251, 251, 253, 0.95)';
        navbar.style.borderBottomColor = 'rgba(210, 210, 215, 0.5)';
    } else {
        navbar.style.background = 'rgba(251, 251, 253, 0.8)';
        navbar.style.borderBottomColor = 'var(--border-color)';
    }
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Observe hybrid features
    document.querySelectorAll('.hybrid-feature').forEach(feature => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(30px)';
        feature.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(feature);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize step navigation
    showStep(1);
    startAutoAdvance();

    // Initialize network animation
    initNetworkAnimation();

    // Add click event listeners to step indicators
    document.querySelectorAll('.indicator').forEach(indicator => {
        indicator.addEventListener('click', function() {
            const stepNumber = parseInt(this.getAttribute('data-step'));
            showStep(stepNumber);
            stopAutoAdvance();
            setTimeout(startAutoAdvance, 10000); // Restart auto-advance after 10 seconds
        });
    });

    // Add hover events to pause auto-advance
    const stepsContainer = document.querySelector('.steps-container');
    if (stepsContainer) {
        stepsContainer.addEventListener('mouseenter', stopAutoAdvance);
        stepsContainer.addEventListener('mouseleave', startAutoAdvance);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            smoothScroll(target);
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);

    // Initialize scroll animations
    initScrollAnimations();

    // Add keyboard navigation for steps
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            previousStep();
            stopAutoAdvance();
            setTimeout(startAutoAdvance, 10000);
        } else if (e.key === 'ArrowRight') {
            nextStep();
            stopAutoAdvance();
            setTimeout(startAutoAdvance, 10000);
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
    constructor(selector = '#networkCanvas') {
        this.canvas = document.querySelector(selector);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        // HiDPI
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = 0;
        this.height = 0;

        // Data
        this.nodes = [];   // {x,y,r,type,color,ring,neighbors:[]}
        this.edges = [];   // {a,b,w}
        this.routes = [];  // active payments
        this.hover = {x: -1, y: -1, active: false};
        this.time = 0;
        this.seed = 1337;
        this.rand = () => (this.seed = (1664525 * this.seed + 1013904223) >>> 0, this.seed / 0xffffffff);

        // 新增：DOM overlay、热点边集合与性能参数
        this.overlay = document.querySelector('.network-overlay');
        this.hotEdges = new Set(); // 仅绘制被“加热”的边，减少每帧遍历
        this.maxRoutes = 12;       // 支付流上限，后续可动态调节
        this.prevTs = 0;
        this.frameAvg = 16;        // ms

        // Offscreen base layer for static channels/nodes
        this.edgeIndex = new Map(); // key "a-b" -> edge idx（无向）
        this.base = document.createElement('canvas');
        this.bctx = this.base.getContext('2d');
        // 统计显示缓动
        this.displayStats = { nodes: 0, channels: 0, tps: 0 };
        // 初始化脉冲数组
        this.pulses = [];

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.bindInteraction();

        this.generateGraph();
        this.preRenderStatic();
        this.updateOverlayHubs(); // 同步 overlay 的 hub 指示器到真实节点
        this.spawnRoutes(10);
        this.updateStats();
        this.statsTimer = setInterval(() => this.updateStats(), 1200);

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
            if (parent && getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
            this.overlay.style.position = 'absolute';
            this.overlay.style.pointerEvents = 'none';
            this.overlay.style.left = '0px';
            this.overlay.style.top = '0px';
            this.overlay.style.width = `${this.width}px`;
            this.overlay.style.height = `${this.height}px`;
        }

        // 重新绘制静态层以匹配尺寸变化
        if (this.nodes.length) this.preRenderStatic();
    }

    bindInteraction() {
        const onMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.hover.x = (e.clientX - rect.left);
            this.hover.y = (e.clientY - rect.top);
            this.hover.active = true;
        };
        const onLeave = () => this.hover.active = false;
        this.canvas.addEventListener('mousemove', onMove);
        this.canvas.addEventListener('mouseleave', onLeave);
        this.canvas.addEventListener('click', () => this.spawnRoutes(2)); // 点击增加支付流
    }

    palette() {
        // 外环颜色（接近参考图的多彩圆环）
        return ['#7CFFB2', '#FF6767', '#FFE15D', '#66B3FF', '#B266FF', '#FF9E66', '#5CFFC7', '#FF66C4'];
    }

    blueTone(alpha = 1) {
        return `rgba(120, 220, 255, ${alpha})`;
    }

    addNode(x, y, r, type) {
        const ringColors = this.palette();
        const ring = ringColors[Math.floor(this.rand() * ringColors.length)];
        const color = 'rgba(200,240,255,0.9)';
        this.nodes.push({ x, y, r, type, color, ring, neighbors: [] });
        return this.nodes.length - 1;
    }

    // 生成更接近 Lightning Explorer 的密集拓扑（减少总节点数）
    generateGraph() {
        this.nodes = [];
        this.edges = [];

        const area = this.width * this.height;
        const targetNodes = Math.round(Math.min(1100, Math.max(420, area / 650))); // 降低整体密度

        // 预设几个大型 hub 聚类锚点（左右两侧各有明显聚簇）
        const hubs = [
            { x: this.width * 0.18, y: this.height * (0.45 + (this.rand() - 0.5) * 0.2), r: 10 },
            { x: this.width * 0.35, y: this.height * (0.50 + (this.rand() - 0.5) * 0.2), r: 12 },
            { x: this.width * 0.55, y: this.height * (0.50 + (this.rand() - 0.5) * 0.2), r: 12 },
            { x: this.width * 0.80, y: this.height * (0.48 + (this.rand() - 0.5) * 0.15), r: 14 },
            { x: this.width * 0.08, y: this.height * (0.25 + (this.rand() - 0.5) * 0.1), r: 9 },
        ];

        const hubIdx = hubs.map(h => this.addNode(h.x, h.y, h.r, 'hub'));

        // 密度调低
        const clusterPerHub = 3;
        const microPerHub = 30;
        const secondPerHub = 18;

        hubs.forEach((h) => {
            for (let i = 0; i < secondPerHub; i++) {
                const ang = (i / secondPerHub) * Math.PI * 2 + this.rand() * 0.6;
                const dist = 35 + this.rand() * 60;
                const x = h.x + Math.cos(ang) * dist;
                const y = h.y + Math.sin(ang) * dist;
                this.addNode(x, y, 3 + this.rand() * 2.2, 'secondary');
            }
            for (let i = 0; i < microPerHub; i++) {
                const ang = this.rand() * Math.PI * 2;
                const dist = 70 + this.rand() * 110;
                const x = h.x + Math.cos(ang) * dist;
                const y = h.y + Math.sin(ang) * dist;
                this.addNode(x, y, 1 + this.rand() * 1.4, 'micro');
            }
            for (let c = 0; c < clusterPerHub; c++) {
                const ang = this.rand() * Math.PI * 2;
                const base = 110 + this.rand() * 150;
                const cx = h.x + Math.cos(ang) * base;
                const cy = h.y + Math.sin(ang) * base;
                const size = 8 + Math.floor(this.rand() * 16);
                for (let i = 0; i < size; i++) {
                    const a2 = this.rand() * Math.PI * 2;
                    const d2 = 10 + this.rand() * 36;
                    const x = cx + Math.cos(a2) * d2;
                    const y = cy + Math.sin(a2) * d2;
                    this.addNode(x, y, 1 + this.rand() * 1.1, 'micro');
                }
            }
        });

        // 中央密集带（适度减少）
        const bandNodes = Math.max(120, Math.round(targetNodes - this.nodes.length));
        for (let i = 0; i < bandNodes; i++) {
            const x = this.width * (0.16 + this.rand() * 0.68);
            const y = this.height * (0.32 + this.rand() * 0.36) + (this.rand() - 0.5) * 10;
            this.addNode(x, y, 1 + this.rand() * 1.3, 'micro');
        }

        this.buildEdges();
    }

    buildEdges() {
        const pts = this.nodes;
        const gridSize = 40; // 网格加速近邻
        const cols = Math.ceil(this.width / gridSize);
        const rows = Math.ceil(this.height / gridSize);
        const grid = new Array(cols * rows).fill(0).map(() => []);
        const gi = (x, y) => Math.max(0, Math.min(cols - 1, Math.floor(x / gridSize))) +
                             Math.max(0, Math.min(rows - 1, Math.floor(y / gridSize))) * cols;

        pts.forEach((p, i) => grid[gi(p.x, p.y)].push(i));

        const maxDeg = (i) => pts[i].type === 'hub' ? 24 : pts[i].type === 'secondary' ? 8 : 4;
        const radius = (i) => pts[i].type === 'hub' ? 220 : pts[i].type === 'secondary' ? 140 : 75;

        const seen = new Set();
        const addEdge = (a, b, w) => {
            const key = a < b ? `${a}-${b}` : `${b}-${a}`;
            if (seen.has(key)) return;
            seen.add(key);
            this.edges.push({ a, b, w, heat: 0 });
            pts[a].neighbors.push(b);
            pts[b].neighbors.push(a);
        };

        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            const cx = Math.floor(p.x / gridSize);
            const cy = Math.floor(p.y / gridSize);
            const r = radius(i);
            const cells = [];
            const rx = Math.ceil(r / gridSize);
            for (let dx = -rx; dx <= rx; dx++) {
                for (let dy = -rx; dy <= rx; dy++) {
                    const gx = cx + dx, gy = cy + dy;
                    if (gx >= 0 && gy >= 0 && gx < cols && gy < rows) cells.push(gx + gy * cols);
                }
            }
            const candidates = [];
            cells.forEach(ci => {
                grid[ci].forEach(j => { if (j !== i) candidates.push(j); });
            });

            candidates.sort((j, k) => (this.dist2(p, pts[j]) - this.dist2(p, pts[k])));
            const deg = maxDeg(i);
            let added = 0;
            for (let c of candidates) {
                if (added >= deg) break;
                const d = Math.sqrt(this.dist2(p, pts[c]));
                if (d <= r) {
                    addEdge(i, c, 1 - d / (r + 1));
                    added++;
                }
            }
        }

        // 为边建立索引，便于快速加热
        if (!this.edgeIndex) this.edgeIndex = new Map();
        else this.edgeIndex.clear();
        for (let i = 0; i < this.edges.length; i++) {
            const e = this.edges[i];
            const k = e.a < e.b ? `${e.a}-${e.b}` : `${e.b}-${e.a}`;
            this.edgeIndex.set(k, i);
        }
    }

    // 同步 overlay 上的 hub-indicator 到真实 hub 节点位置
    updateOverlayHubs() {
        if (!this.overlay) return;
        const hubs = this.nodes.filter(n => n.type === 'hub');
        // 确保元素数量匹配
        let elems = Array.from(this.overlay.querySelectorAll('.hub-indicator'));
        const need = Math.min(hubs.length, 5);
        // 创建缺少的元素
        while (elems.length < need) {
            const el = document.createElement('div');
            el.className = 'hub-indicator';
            this.overlay.appendChild(el);
            elems.push(el);
        }
        // 位置同步
        for (let i = 0; i < elems.length; i++) {
            const el = elems[i];
            const hub = hubs[i];
            if (!hub) { el.style.display = 'none'; continue; }
            el.style.display = 'block';
            el.style.left = `${hub.x}px`;
            el.style.top = `${hub.y}px`;
        }
    }

    // 仅绘制被加热的边（热点通道），并逐帧衰减
    drawHotEdges() {
        const ctx = this.ctx;
        if (!this.hotEdges.size) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        const toDelete = [];
        for (const idx of this.hotEdges) {
            const e = this.edges[idx];
            if (!e) { toDelete.push(idx); continue; }
            if (e.heat <= 0.01) { toDelete.push(idx); continue; }
            const a = this.nodes[e.a], b = this.nodes[e.b];
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
        ctx.globalCompositeOperation = 'lighter';
        for (let i = this.pulses.length - 1; i >= 0; i--) {
            const p = this.pulses[i];
            if (!p || !isFinite(p.r) || !isFinite(p.maxR)) { this.pulses.splice(i, 1); continue; }
            const maxR = Math.max(1, p.maxR);
            const t = Math.max(0, Math.min(1, p.r / maxR));
            const alpha = (p.alpha ?? 0.9) * (1 - t);
            if (alpha <= 0) { this.pulses.splice(i, 1); continue; }
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

    preRenderStatic() {
        const ctx = this.bctx;
        const w = this.width, h = this.height;
        ctx.clearRect(0, 0, w, h);

        // 背景微光叠加
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const radial = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.6);
        radial.addColorStop(0, 'rgba(80,180,255,0.06)');
        radial.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // 画通道（细线，青色叠加）
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        for (const e of this.edges) {
            const a = this.nodes[e.a], b = this.nodes[e.b];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineWidth = 0.6 + e.w * 1.4;
            ctx.strokeStyle = `rgba(120, 230, 255, ${0.05 + e.w * 0.18})`;
            ctx.shadowColor = 'rgba(120,230,255,0.3)';
            ctx.shadowBlur = 6;
            ctx.stroke();
        }
        ctx.restore();

        // 画节点（带彩色环）
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const n of this.nodes) {
            // 外环
            ctx.beginPath();
            ctx.arc(n.x, n.y, Math.max(1, n.r + 1.2), 0, Math.PI * 2);
            ctx.strokeStyle = this.alpha(n.ring, 0.9);
            ctx.lineWidth = n.type === 'hub' ? 2.4 : n.type === 'secondary' ? 1.6 : 1.2;
            ctx.stroke();
            // 内核
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(1, n.r + 0.5));
            g.addColorStop(0, 'rgba(255,255,255,0.95)');
            g.addColorStop(1, 'rgba(180,240,255,0.75)');
            ctx.fillStyle = g;
            ctx.shadowColor = 'rgba(120,220,255,0.6)';
            ctx.shadowBlur = n.type === 'hub' ? 16 : n.type === 'secondary' ? 10 : 6;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // 将新增边绘制到静态层（与 preRenderStatic 中样式一致）
    drawEdgeToBase(e) {
        const ctx = this.bctx;
        const a = this.nodes[e.a], b = this.nodes[e.b];
        if (!a || !b) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineWidth = 0.6 + e.w * 1.4;
        ctx.strokeStyle = `rgba(120, 230, 255, ${0.05 + e.w * 0.18})`;
        ctx.shadowColor = 'rgba(120,230,255,0.3)';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.restore();
    }

    // 随机动态增加一条边（通道），并触发热点与统计更新
    addRandomEdge() {
        if (this.nodes.length < 2) return;
        const a = Math.floor(this.rand() * this.nodes.length);
        let best = -1, bestD = Infinity;
        const pa = this.nodes[a];
        const radius = pa.type === 'hub' ? 220 : pa.type === 'secondary' ? 140 : 90;
        for (let b = 0; b < this.nodes.length; b++) {
            if (b === a) continue;
            // 已经相邻则跳过
            if (pa.neighbors && pa.neighbors.includes(b)) continue;
            const d2 = this.dist2(pa, this.nodes[b]);
            if (d2 < bestD && Math.sqrt(d2) < radius) { bestD = d2; best = b; }
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
        this.pulses.push({ x: pa.x, y: pa.y, r: pa.r + 3, maxR: pa.r + 26, alpha: 0.7, hue });
        const pb = this.nodes[best];
        this.pulses.push({ x: pb.x, y: pb.y, r: pb.r + 3, maxR: pb.r + 26, alpha: 0.7, hue });
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
        for (let i = 0; i < count; i++) {
            const start = this.pickNode(x => x.x < this.width * (0.35 + this.rand() * 0.2));
            const end = this.pickNode(x => x.x > this.width * (0.55 - this.rand() * 0.2));
            if (start === -1 || end === -1) continue;
            const path = this.findPath(start, end, 8 + Math.floor(this.rand() * 3), 3 + Math.floor(this.rand() * 2));
            if (path.length < 2) continue;
            this.routes.push({ path, seg: 0, t: this.rand(), speed: 0.012 + this.rand() * 0.012, hue: 30 + Math.floor(this.rand() * 60) });
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
            let next = -1, best = Infinity;
            const target = this.nodes[bIdx];
            for (const n of nbrs) {
                if (visited.has(n)) continue;
                const d = this.dist2(this.nodes[n], target);
                if (d < best) { best = d; next = n; }
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
        ctx.globalCompositeOperation = 'lighter';
        const pts = route.path.map(i => this.nodes[i]);

        // 高亮路径通道
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = `hsla(${route.hue}, 100%, 60%, 0.20)`;
        ctx.shadowColor = `hsla(${route.hue}, 100%, 60%, 0.35)`;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();

        // 沿路整体轻微加热，当前段显著加热
        for (let i = 0; i < route.path.length - 1; i++) this.addHeat(route.path[i], route.path[i + 1], 0.035);

        // 沿边移动的支付粒子
        const segA = pts[route.seg];
        const segB = pts[route.seg + 1] || segA;
        const x = segA.x + (segB.x - segA.x) * route.t;
        const y = segA.y + (segB.y - segA.y) * route.t;

        // 当前段强加热并带动局部发光
        this.addHeat(route.path[route.seg], route.path[route.seg + 1], 0.45);

        // 拖尾
        for (let i = 0; i < 6; i++) {
            const k = Math.max(0, 1 - i * 0.18);
            ctx.beginPath();
            ctx.arc(x - (segB.x - segA.x) * i * 0.05, y - (segB.y - segA.y) * i * 0.05, 3.2 * k, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${route.hue}, 100%, ${70 - i * 8}%, ${0.35 - i * 0.05})`;
            ctx.shadowColor = `hsla(${route.hue}, 100%, 60%, ${0.5 - i * 0.08})`;
            ctx.shadowBlur = 16 * k;
            ctx.fill();
        }

        // 主粒子
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${route.hue}, 100%, 60%, 1)`;
        ctx.shadowColor = `hsla(${route.hue}, 100%, 60%, 1)`;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.restore();

        // 推进
        route.t += route.speed;
        if (route.t >= 1) {
            // 在抵达节点时爆发一个彩色脉冲
            const n = this.nodes[route.path[route.seg + 1]];
            if (n) this.pulses.push({ x: n.x, y: n.y, r: n.r + 3, maxR: n.r + 26, alpha: 0.9, hue: route.hue });

            route.t = 0;
            route.seg++;
            if (route.seg >= route.path.length - 1) {
                // 终点更强的脉冲
                const last = this.nodes[route.path[route.path.length - 1]];
                if (last) this.pulses.push({ x: last.x, y: last.y, r: last.r + 4, maxR: last.r + 36, alpha: 0.95, hue: route.hue });
                // 结束后重新生成一条新路径
                route.seg = 0;
                route.path = this.findPath(this.pickNode(n => n.x < this.width * 0.4), this.pickNode(n => n.x > this.width * 0.6), 4 + Math.floor(this.rand() * 5));
            }
        }
    }

    drawHover() {
        if (!this.hover.active) return;
        // 找最近的节点
        let idx = -1, best = 9007199254740991;
        for (let i = 0; i < this.nodes.length; i++) {
            const d2 = this.dist2(this.nodes[i], this.hover);
            if (d2 < best) { best = d2; idx = i; }
        }
        if (idx === -1 || Math.sqrt(best) > 60) return;
        const n = this.nodes[idx];
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

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
        ctx.strokeStyle = 'rgba(160, 240, 255, 0.5)';
        ctx.shadowColor = 'rgba(160, 240, 255, 0.7)';
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
        if (this.frameAvg > 22 && this.dpr > 1) { this.dpr = 1; this.maxRoutes = 10; this.resize(); }
        // 恢复一点清晰度：流畅时稍抬 dpr 但不超过 1.35
        else if (this.frameAvg < 15 && this.dpr < 1.35) { this.dpr = Math.min(1.35, this.dpr + 0.05); this.resize(); }

        // 清屏并绘制静态层
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.base, 0, 0, this.width, this.height);

        // 热点通道辉光（仅绘制热点）
        this.drawHotEdges();

        // 轻微的全局呼吸亮度
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
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
        if (this.routes.length > this.maxRoutes) this.routes.length = this.maxRoutes;
        if (this.routes.length < this.maxRoutes && Math.random() > 0.988) this.spawnRoutes(1);

        requestAnimationFrame(this.animate);
    }

    updateStats(force = false) {
        const nodeEl = document.getElementById('node-count');
        const chEl = document.getElementById('channel-count');
        const tpsEl = document.getElementById('tps-count');
        if (!nodeEl || !chEl || !tpsEl) return;
        const targetNodes = this.nodes.length;
        const targetChannels = this.edges.length;
        const targetTps = Math.round((this.routes.length * (180 + Math.random() * 160)) * (0.8 + Math.random() * 0.4));
        // 初始化
        if (this.displayStats.nodes === 0 && this.displayStats.channels === 0 && !force) {
            this.displayStats.nodes = targetNodes;
            this.displayStats.channels = targetChannels;
            this.displayStats.tps = targetTps;
        }
        // 缓动到目标
        const ease = (cur, tgt, k = 0.3) => cur + Math.sign(tgt - cur) * Math.max(1, Math.floor(Math.abs(tgt - cur) * k));
        this.displayStats.nodes = ease(this.displayStats.nodes, targetNodes, 0.25);
        this.displayStats.channels = ease(this.displayStats.channels, targetChannels, 0.25);
        this.displayStats.tps = ease(this.displayStats.tps, targetTps, 0.35);
        nodeEl.textContent = this.displayStats.nodes.toLocaleString();
        chEl.textContent = this.displayStats.channels.toLocaleString();
        tpsEl.textContent = this.displayStats.tps.toLocaleString();
    }

    alpha(hex, a) {
        // hex -> rgba string with alpha
        const c = hex.replace('#', '');
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    dist2(a, b) {
        const dx = a.x - b.x, dy = a.y - b.y;
        return dx * dx + dy * dy;
    }
}

// Initialize network visualization when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('networkCanvas')) {
        window.lnVis = new LightningNetworkCanvas('#networkCanvas');
    }
});
