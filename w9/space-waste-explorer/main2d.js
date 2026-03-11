// simple 2D canvas animation of falling fragments
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('scene2d');
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Fragment {
    constructor(x, y, isArticle=false, article=null) {
      this.x = x;
      this.y = y;
      this.vy = -1 + Math.random() * 2; // allow upward movement too
      this.vx = (Math.random()-0.5) * 1;
      this.size = 4 + Math.random() * 8;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random()-0.5) * 0.1;
      this.opacity = 1;
      this.isArticle = isArticle;
      this.article = article;
      if (isArticle) {
        this.color = '#ffcc00';
      } else {
        const hue = 20 + Math.random() * 40;
        this.color = `hsl(${hue},70%,50%)`;
      }
    }
    update() {
      this.y += this.vy;
      this.x += this.vx;
      this.vy += 0.02; // gravity
      this.rotation += this.rotSpeed;
      // fade slowly
      this.opacity -= 0.002;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      if (this.isArticle) {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size*1.5, this.size*1.5);
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', 0, 3);
      } else {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
      }
      ctx.restore();
    }
    contains(x,y) {
      return Math.hypot(x - this.x, y - this.y) < this.size;
    }
  }

  const fragments = [];
  const articles = [
    {title:'ESA Space Environment Report 2025', url:'https://download.esa.int/esoc/downloads/BR-336_Space_Debris_WEB.pdf'},
    {title:'Space Debris: Is it a Crisis?', url:'https://www.esa.int/ESA_Multimedia/Videos/2025/04/Space_Debris_Is_it_a_Crisis'},
    {title:'NASA Orbital Debris Program', url:'https://science.nasa.gov/solar-system/10-things-whats-that-space-rock'},
    {title:'ESA Active Debris Removal', url:'https://www.esa.int/Space_Safety/Space_Debris/Active_debris_removal'},
  ];

  function spawn(n=10) {
    for (let i = 0; i < n; i++) {
      // occasionally spawn an article fragment
      if (Math.random() < 0.05) {
        const art = articles[Math.floor(Math.random() * articles.length)];
        fragments.push(new Fragment(Math.random() * width, -10, true, art));
      } else {
        fragments.push(new Fragment(Math.random() * width, -10));
      }
    }
  }

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // check if clicked on an article fragment
    for (const f of fragments) {
      if (f.isArticle && f.contains(x,y)) {
        window.open(f.article.url, '_blank');
        return;
      }
    }
    fragments.push(new Fragment(x, y));
  });

  function drawEarth() {
    const radius = height * 0.35;
    const cx = width / 2;
    const cy = height + radius * 0.6;
    // gradient for atmosphere
    const grad = ctx.createRadialGradient(cx, cy, radius*0.8, cx, cy, radius+50);
    grad.addColorStop(0, '#003366');
    grad.addColorStop(1, '#000');
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function animate() {
    // atmospheric gradient background
    const bg = ctx.createLinearGradient(0,0,0,height);
    bg.addColorStop(0, '#000');
    bg.addColorStop(1, '#111');
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,width,height);

    drawEarth();
    for (let i = fragments.length - 1; i >= 0; i--) {
      const f = fragments[i];
      f.update();
      f.draw(ctx);
      if (f.y > height + 20 || f.opacity <= 0) fragments.splice(i, 1);
    }
    requestAnimationFrame(animate);
  }

  spawn(100);
  animate();
});
