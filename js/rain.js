(() => {
	const $ = (s) => document.querySelector(s);
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const rnd = (n) => Math.floor(Math.random() * n);
	const pick = (a) => a[rnd(a.length)];
	const hex = (n) => Array.from({ length: n }, () => rnd(256).toString(16).padStart(2, '0').toUpperCase()).join(' ');

	/* ---------- Pluie matrix (canvas) ---------- */
	const cv = $('#rain');
	const ctx = cv.getContext('2d');
	const glyphs = '01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ3301ABCDEF<>/\\';
	const fs = 18;
	let cols, drops;

	function resize() {
		cv.width = innerWidth;
		cv.height = innerHeight;
		cols = Math.ceil(cv.width / fs);
		drops = Array.from({ length: cols }, () => Math.random() * -50);
	}
	addEventListener('resize', resize);
	resize();

	setInterval(() => {
		ctx.fillStyle = 'rgba(5,10,5,0.12)';
		ctx.fillRect(0, 0, cv.width, cv.height);
		ctx.font = fs + 'px VT323, monospace';
		for (let i = 0; i < cols; i++) {
			ctx.fillStyle = Math.random() > 0.975 ? 'rgba(200,255,200,0.9)' : 'rgba(60,160,60,0.6)';
			ctx.fillText(glyphs[rnd(glyphs.length)], i * fs, drops[i] * fs);
			if (drops[i] * fs > cv.height && Math.random() > 0.975) drops[i] = 0;
			drops[i] += 1;
		}
	}, 50);

	/* ---------- Terminal ---------- */
	const term = $('#term');

	const stage = $('#stage');
	const logo = $('#logo');
	let locked = false; // vrai une fois la scène secrète lancée : le terminal se tait

	function newLine(cls = '', root = term) {
		const p = document.createElement('p');
		p.className = cls;
		root.appendChild(p);
		if (root === term) while (term.children.length > 26) term.firstChild.remove();
		return p;
	}

	async function type(text, cls = '', speed = 32, root = term) {
		if (locked && root === term) return;
		const p = newLine(cls, root);
		for (const ch of text) {
			p.textContent += ch;
			await sleep(speed + rnd(35));
		}
		return p;
	}

	function drawBar(p, v) {
		const filled = Math.floor(v / 5);
		p.textContent = '[' + '█'.repeat(filled).padEnd(20, '░') + '] ' + v.toFixed(2).padStart(5, ' ') + '%';
	}

	async function progress(target) {
		const p = newLine('bar');
		for (let v = 0; v < target; v += rnd(4) + 0.7) {
			drawBar(p, v);
			await sleep(50 + rnd(110));
		}
		drawBar(p, target);
	}

	function glitch(ms = 260) {
		document.body.classList.add('glitch');
		setTimeout(() => document.body.classList.remove('glitch'), ms);
	}

	/* ---------- Séquence ---------- */
	const murmurs = [
		'SOME THINGS ARE NOT MEANT TO LOAD',
		'THE PATTERN IS NOT IN THE RAIN',
		'STILL LISTENING',
		'WHO IS WATCHING THIS SCREEN ?',
		'CHECKSUM MISMATCH',
		'NODE 7 DID NOT ANSWER',
		'SEASON 1 OF 4 : ARCHIVED',
		'DO NOT TRUST THE PROGRESS BAR',
		'THE ANSWER WAS ALREADY HERE',
		'SIGNAL LOST. SIGNAL FOUND.',
	];

	async function boot() {
		await sleep(700);
		await type('SIGNAL DETECTED');
		await sleep(500);
		await type('SOURCE ........ UNKNOWN');
		await type('HANDSHAKE ..... OK');
		await sleep(400);
		await type('DECRYPTING PAYLOAD 1/7');
		await sleep(300);
		// = LOOK CLOSER
		await type('4C 4F 4F 4B 20 43 4C 4F 53 45 52', 'hex', 45);
		await sleep(900);
		await progress(33.01);
		await sleep(1600);
		glitch(400);
		await type('SEQUENCE INCOMPLETE', 'warn');
		await type('4 SEASONS REMAIN');
		await sleep(1800);
		idle();
	}

	async function idle() {
		let n = 0;
		while (!locked) {
			await sleep(1800 + rnd(3500));
			n++;
			const r = Math.random();
			if (r < 0.45) await type(pick(murmurs), '', 40);
			else if (r < 0.85) await type(hex(6 + rnd(4)), 'hex', 18);
			else { glitch(); await type(hex(4), 'hex', 10); }
			if (n % 7 === 0) {
				await type('RETRYING ...');
				await progress(33.01);
				await sleep(1200);
				glitch(350);
				await type('SEQUENCE INCOMPLETE', 'warn');
			}
		}
	}

	/* ---------- Secret : tape "cicada" ou "3301" ---------- */
	// Chaque lieu donne sa première lettre : P-R-I-M-U-S
	// (Paris, Rome, Istanbul, Madrid, Uluru, Sydney). Change cette liste pour ta propre énigme.
	const COORDS = [
		'48.8584° N,   2.2945° E',
		'41.8902° N,  12.4922° E',
		'41.0086° N,  28.9802° E',
		'40.4179° N,   3.7143° W',
		'25.3444° S, 131.0369° E',
		'33.8568° S, 151.2153° E',
	];
	const NEXT_WORD = 'primus'; // le mot à taper ensuite

	/* Logo : une cigale dessinée avec des 3, 0 et 1 */
	const LW = 51, LH = 28;
	const mask = [];
	(function buildMask() {
		const rot = (dx, dy, deg) => {
			const t = (deg * Math.PI) / 180;
			return [dx * Math.sin(t) + dy * Math.cos(t), dx * Math.cos(t) - dy * Math.sin(t)];
		};
		const ring = (ax, y, cx, cy, a, b, deg) => {
			const [al, pe] = rot(ax - cx, y - cy, deg);
			const e = (al / a) ** 2 + (pe / b) ** 2;
			return e <= 1 && e > 0.6;
		};
		for (let r = 0; r < LH; r++) {
			const row = [];
			for (let c = 0; c < LW; c++) {
				const ax = Math.abs((c - 25) * 0.5);
				const eye = (ax - 4.6) ** 2 + (r - 3) ** 2 <= 2.9;
				const head = (ax / 4.2) ** 2 + ((r - 3) / 2.2) ** 2 <= 1;
				const thorax = (ax / 3.2) ** 2 + ((r - 8.5) / 3.6) ** 2 <= 1;
				const hw = 2.4 * (1 - ((r - 12) / 13) ** 2) + 0.5;
				const abdomen = r >= 12 && r <= 25 && ax <= hw && !(r > 13 && r % 3 === 0);
				let t = 0;
				if (eye || head || thorax || abdomen) t = 1;
				else if (ring(ax, r, 5.5, 15, 10.5, 3.6, 28) || ring(ax, r, 6.5, 10.5, 6, 2.6, 60)) t = 2;
				row.push(t);
			}
			mask.push(row);
		}
	})();

	const grid = mask.map((row) => row.map(() => '3301'[rnd(4)]));
	let shown = 0;

	function drawLogo() {
		let html = '';
		for (let r = 0; r < LH; r++) {
			for (let c = 0; c < LW; c++) {
				if (Math.random() < 0.06) grid[r][c] = '3301'[rnd(4)];
				const t = r < shown ? mask[r][c] : 0;
				html += t === 2 ? '<i>' + grid[r][c] + '</i>' : t ? grid[r][c] : ' ';
			}
			html += '\n';
		}
		logo.innerHTML = html;
	}

	function startLogo() {
		shown = 0;
		drawLogo();
		setInterval(() => {
			if (shown < LH) shown++;
			drawLogo();
		}, 100);
	}

	/* Scène secrète */
	let buf = '', busy = false, ready = false;

	async function reveal() {
		busy = true;
		glitch(600);
		await type('YOU WERE NOT SUPPOSED TO SEE THIS', 'warn');
		await sleep(1500);
		glitch(900);
		locked = true;
		term.replaceChildren();
		document.body.classList.add('stage-on');
		startLogo();
		await sleep(3300);
		await type('3301', 'big', 90, stage);
		await sleep(700);
		await type('LIBER PRIMUS HAS NOT BEEN SOLVED', '', 40, stage);
		await sleep(600);
		await type('WE ARE DISAPPOINTED', 'warn', 55, stage);
		await sleep(600);
		await type('WE HAVE NOT FORGOTTEN YOU ALL', '', 40, stage);
		await sleep(1300);
		for (const c of COORDS) await type(c, 'coord', 14, stage);
		busy = false;
		ready = true;
	}

	async function unlock() {
		busy = true;
		glitch(700);
		await type('ACCESS GRANTED', 'warn', 40, stage);
		await type('THE FIRST WORD IS NEVER THE LAST', '', 40, stage);
		await type('NEXT SEQUENCE LOADING ...', '', 40, stage);
		// TODO : suite de l'énigme (nouvelle page, autre mot à taper, etc.)
	}

	addEventListener('keydown', (e) => {
		if (e.key.length !== 1 || busy) return;
		buf = (buf + e.key.toLowerCase()).slice(-6);
		if (!locked && (buf.endsWith('cicada') || buf.endsWith('3301'))) {
			buf = '';
			reveal();
		} else if (ready && buf === NEXT_WORD) {
			buf = '';
			ready = false;
			unlock();
		}
	});

	console.log('%c3301', 'color:#7de17d;font-size:32px;text-shadow:0 0 8px #7de17d');
	console.log('base64 : TG9vayBjbG9zZXI=');

	boot();
})();
