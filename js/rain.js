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

	function newLine(cls = '') {
		const p = document.createElement('p');
		p.className = cls;
		term.appendChild(p);
		while (term.children.length > 26) term.firstChild.remove();
		return p;
	}

	async function type(text, cls = '', speed = 32) {
		const p = newLine(cls);
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
		for (;;) {
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
	let buf = '';
	addEventListener('keydown', async (e) => {
		if (e.key.length !== 1) return;
		buf = (buf + e.key.toLowerCase()).slice(-6);
		if (buf.endsWith('cicada') || buf.endsWith('3301')) {
			buf = '';
			glitch(600);
			await type('YOU WERE NOT SUPPOSED TO SEE THIS', 'warn');
			await type('THE FIRST ANSWER IS WHERE YOU STARTED');
			await type('VIEW SOURCE');
		}
	});

	console.log('%c3301', 'color:#7de17d;font-size:32px;text-shadow:0 0 8px #7de17d');
	console.log('base64 : TG9vayBjbG9zZXI=');

	boot();
})();
