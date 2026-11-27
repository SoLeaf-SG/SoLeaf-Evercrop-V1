// Animated reward tree shared by the homepage and the shopper portal.
// Needs an <svg> containing #plant, #drops and the #leaf / #fruit / #bark defs.
window.evercropTree = (() => {
  const SVG = 'http://www.w3.org/2000/svg';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plant = document.querySelector('#plant');
  const drops = document.querySelector('#drops');
  let currentStage = null;

  // Web Animations helper: instant when the visitor prefers reduced motion.
  function play(el, frames, opts) {
    return el.animate(frames, { fill: 'both', easing: 'ease-out', ...opts, ...(reduceMotion && { duration: 0, delay: 0 }) });
  }

  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    parent?.append(el);
    return el;
  }

  // Each stage: wood paths [d, width] and leaf clusters [x, y, radius, count].
  const STAGES = {
    sprout: { wood: [['M120 198C120 190 121 182 120 172', 3]], stem: true, clusters: [[120, 172, 3, 4]], fruit: 0 },
    sapling: {
      wood: [['M120 198C118 175 122 150 120 120', 6], ['M120 158C112 150 104 144 96 134', 3], ['M120 146C130 138 138 132 146 122', 3]],
      clusters: [[120, 112, 20, 26], [96, 130, 14, 14], [146, 118, 14, 14]], fruit: 0
    },
    grown: {
      wood: [['M120 198C114 160 126 130 120 92', 13], ['M120 150C104 136 88 122 70 104', 7], ['M120 138C138 122 154 108 170 92', 7], ['M120 112C110 96 102 82 94 64', 5], ['M120 106C132 90 140 78 148 60', 5]],
      clusters: [[120, 64, 36, 80], [70, 98, 28, 46], [170, 86, 28, 46], [92, 60, 24, 36], [150, 56, 24, 36], [120, 100, 28, 40]], fruit: 12
    }
  };
  const LEAF_COLORS = ['#2f6b25', '#3d7c2e', '#4c8d36', '#5c9e40', '#6fb04c', '#82c05a'];

  function growTree(key) {
    if (key === currentStage) {
      // Same stage: a little rustle so every order still feels like it did something.
      play(plant.lastElementChild, [{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 600, delay: 700 });
      return;
    }
    currentStage = key;
    const spec = STAGES[key];
    const old = plant.lastElementChild;
    const g = svgEl('g', { class: 'stage' }, plant);

    spec.wood.forEach(([d, w], i) => {
      const p = svgEl('path', { d, 'stroke-width': w, pathLength: 1, class: spec.stem ? 'stem' : 'wood' }, g);
      play(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 800, delay: 200 + i * 180 });
    });

    const leaves = [];
    for (const [cx, cy, r, n] of spec.clusters) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * r;
        const x = cx + Math.cos(a) * dist;
        const y = cy + Math.sin(a) * dist * 0.85;
        // Point leaves outward from the cluster centre, with some jitter.
        const rot = (spec.stem ? (i % 2 ? 50 : -50) : Math.atan2(y - cy, x - cx) * 57.3 + 90) + (Math.random() * 40 - 20);
        leaves.push({ x, y, rot, scale: (spec.stem ? 0.75 : 0.7 + Math.random() * 0.45) });
      }
    }
    leaves.sort((a, b) => b.y - a.y); // lower leaves behind, so the top catches the light
    const woodTime = 200 + spec.wood.length * 180 + 500;
    leaves.forEach((leaf, i) => {
      const holder = svgEl('g', { transform: `translate(${leaf.x.toFixed(1)} ${leaf.y.toFixed(1)}) rotate(${leaf.rot.toFixed(0)})` }, g);
      const tone = LEAF_COLORS[Math.min(LEAF_COLORS.length - 1, Math.floor((1 - i / leaves.length) * 2 + Math.random() * 4))];
      const use = svgEl('use', { href: '#leaf', fill: tone }, holder);
      play(use, [{ transform: 'scale(0)' }, { transform: `scale(${leaf.scale})` }], { duration: 500, delay: woodTime + i * (900 / leaves.length), easing: 'cubic-bezier(.34,1.56,.64,1)' });
    });

    const top = spec.clusters.slice(0, 3);
    for (let i = 0; i < spec.fruit; i++) {
      const [cx, cy, r] = top[i % top.length];
      const holder = svgEl('g', { transform: `translate(${(cx + (Math.random() * 2 - 1) * r * 0.8).toFixed(1)} ${(cy + (Math.random() * 2 - 1) * r * 0.6).toFixed(1)})` }, g);
      const fruit = svgEl('circle', { r: 5, fill: 'url(#fruit)' }, holder);
      play(fruit, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 450, delay: woodTime + 1100 + i * 110, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    }

    if (old) play(old, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: woodTime + 800 }).finished.then(() => old.remove());
  }

  function waterTree() {
    if (reduceMotion) return;
    for (let i = 0; i < 5; i++) {
      const drop = svgEl('path', { d: 'M0-6C2-2 3 0 3 1.5A3 3 0 0 1-3 1.5C-3 0-2-2 0-6Z', class: 'drop', transform: `translate(${95 + Math.random() * 50} 10)` }, drops);
      play(drop, [{ translate: '0 0', opacity: 0 }, { opacity: 1, offset: 0.15 }, { translate: '0 175px', opacity: 0 }], { duration: 900, delay: i * 110, easing: 'ease-in' }).finished.then(() => drop.remove());
    }
  }


  // Points -> [label, stage key]; 50 and 100 are the milestones.
  const stageFor = (points) => (points >= 100 ? ['Full tree', 'grown'] : points >= 50 ? ['Sapling', 'sapling'] : ['Seedling', 'sprout']);
  return { grow: growTree, water: waterTree, stageFor };
})();
