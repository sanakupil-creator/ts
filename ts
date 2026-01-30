<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Simulasi Tata Surya Interaktif</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --space-bg: #0b0d17;
            --orbit-color: rgba(255, 255, 255, 0.15);
            --sun-glow: rgba(255, 204, 0, 0.6);
        }

        body {
            background-color: var(--space-bg);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            touch-action: none; /* Mencegah scroll saat drag */
            user-select: none;
        }

        /* Latar Belakang Bintang */
        .star {
            position: absolute;
            background: white;
            border-radius: 50%;
            opacity: 0.8;
            animation: twinkle var(--duration) infinite alternate;
        }

        @keyframes twinkle {
            from { opacity: 0.3; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1.2); }
        }

        /* Area Game Utama */
        #game-area {
            position: relative;
            width: 100vw;
            height: 100vh;
            display: flex;
            overflow: hidden;
        }

        /* Zona Orbit (Kiri/Tengah) */
        #orbit-zone {
            flex: 1;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1;
        }

        /* Sidebar Planet (Kanan) */
        #planet-sidebar {
            width: 140px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 10px;
            gap: 15px;
            overflow-y: auto;
            z-index: 10;
            transition: transform 0.3s ease;
        }

        @media (max-width: 768px) {
            #planet-sidebar {
                width: 80px;
                padding: 10px 5px;
            }
        }

        /* Matahari */
        .sun {
            width: 80px;
            height: 80px;
            background: radial-gradient(circle, #ffd700, #ff8c00);
            border-radius: 50%;
            position: absolute;
            box-shadow: 0 0 40px var(--sun-glow);
            z-index: 2;
            animation: sun-pulse 3s infinite ease-in-out;
        }

        @keyframes sun-pulse {
            0%, 100% { box-shadow: 0 0 30px var(--sun-glow); transform: scale(1); }
            50% { box-shadow: 0 0 60px var(--sun-glow); transform: scale(1.05); }
        }

        /* Garis Orbit */
        .orbit-ring {
            position: absolute;
            border: 1px dashed var(--orbit-color);
            border-radius: 50%;
            pointer-events: none;
            transition: border-color 0.3s;
        }
        
        .orbit-ring.highlight {
            border-color: rgba(100, 255, 100, 0.5);
            border-width: 2px;
        }

        /* Planet Styling */
        .planet {
            border-radius: 50%;
            cursor: grab;
            position: relative;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: inset -2px -2px 6px rgba(0,0,0,0.5);
            z-index: 20;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .planet:active {
            cursor: grabbing;
            transform: scale(1.1);
        }

        .planet-label {
            position: absolute;
            bottom: -20px;
            font-size: 10px;
            white-space: nowrap;
            text-shadow: 0 1px 2px black;
            opacity: 1;
            transition: opacity 0.3s;
            pointer-events: none;
        }
        
        .planet.placed .planet-label {
            opacity: 0; /* Sembunyikan label saat di orbit agar bersih */
        }

        /* Cincin Saturnus & Uranus */
        .ringed::after {
            content: '';
            position: absolute;
            width: 160%;
            height: 160%;
            border-radius: 50%;
            border: 2px solid rgba(200, 200, 200, 0.6);
            top: -30%;
            left: -30%;
            transform: rotateX(70deg);
            pointer-events: none;
        }

        /* Animasi Orbit setelah ditempatkan */
        @keyframes orbit-animation {
            from { transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg); }
            to { transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg); }
        }

        .orbiting-wrapper {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            z-index: 5;
            animation: orbit-animation linear infinite;
        }

        /* UI Overlays */
        #feedback-modal {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #4ade80;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            display: none;
            z-index: 100;
            backdrop-filter: blur(5px);
        }

        #tooltip {
            position: absolute;
            background: rgba(255, 255, 255, 0.9);
            color: #1f2937;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            pointer-events: none;
            display: none;
            z-index: 50;
            max-width: 200px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }

        .slot-correct {
            animation: correct-pulse 0.5s ease-out;
        }

        @keyframes correct-pulse {
            0% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.5); filter: brightness(2); }
            100% { transform: scale(1); filter: brightness(1); }
        }

        #reset-btn {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 50;
        }
        
        #progress-bar-container {
            position: absolute;
            top: 20px;
            right: 160px;
            width: 200px;
            height: 10px;
            background: rgba(255,255,255,0.2);
            border-radius: 5px;
            overflow: hidden;
            z-index: 50;
        }
        
        #progress-bar {
            height: 100%;
            width: 0%;
            background: #4ade80;
            transition: width 0.5s;
        }

        @media (max-width: 600px) {
            #progress-bar-container { right: 100px; width: 100px; }
            .sun { width: 50px; height: 50px; }
            #planet-sidebar { flex-direction: row; width: 100%; height: 80px; bottom: 0; top: auto; padding: 0 10px; }
            #game-area { flex-direction: column; }
            #orbit-zone { flex: 1; }
        }
    </style>
</head>
<body>

    <!-- Stars Background (Generated by JS) -->
    <div id="stars-container"></div>

    <!-- UI Elements -->
    <button id="reset-btn" onclick="resetGame()" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-full shadow-lg transition text-sm">
        <i class="fas fa-redo"></i> Ulangi
    </button>

    <div id="progress-bar-container">
        <div id="progress-bar"></div>
    </div>
    <div class="absolute top-8 right-40 md:right-96 text-xs text-gray-300 flex items-center gap-2">
        <span>Progress</span>
        <span id="progress-text" class="font-bold text-green-400">0%</span>
    </div>

    <div id="tooltip"></div>

    <div id="feedback-modal">
        <h2 class="text-2xl font-bold text-green-400 mb-2">Selamat! 🎉</h2>
        <p class="text-white mb-4">Tata surya telah tersusun dengan sempurna.</p>
        <button onclick="resetGame()" class="bg-green-600 hover:bg-green-500 text-white py-2 px-6 rounded-full">Main Lagi</button>
    </div>

    <!-- Audio (Optional - using silent logic mostly, visual feedback priority) -->

    <div id="game-area">
        <!-- Main Orbit Zone -->
        <div id="orbit-zone">
            <!-- Sun -->
            <div class="sun"></div>
            <!-- Orbits will be injected here via JS -->
        </div>

        <!-- Sidebar for Planets -->
        <div id="planet-sidebar">
            <!-- Planets injected here -->
        </div>
    </div>

    <script>
        // --- Data & Konfigurasi ---
        const planetData = [
            { id: 'merkurius', name: 'Merkurius', color: 'linear-gradient(45deg, #a5a5a5, #5e5e5e)', size: 20, orbitIndex: 0, fact: "Planet terkecil dan terdekat dengan Matahari.", orbitTime: 5 },
            { id: 'venus', name: 'Venus', color: 'linear-gradient(45deg, #e6c229, #d4af37)', size: 28, orbitIndex: 1, fact: "Planet terpanas di Tata Surya karena efek rumah kaca.", orbitTime: 8 },
            { id: 'bumi', name: 'Bumi', color: 'linear-gradient(45deg, #4b90ff, #2e8b57)', size: 30, orbitIndex: 2, fact: "Satu-satunya planet yang diketahui memiliki kehidupan.", orbitTime: 12 },
            { id: 'mars', name: 'Mars', color: 'linear-gradient(45deg, #ff4500, #8b0000)', size: 24, orbitIndex: 3, fact: "Dikenal sebagai Planet Merah karena oksida besi.", orbitTime: 15 },
            { id: 'jupiter', name: 'Jupiter', color: 'linear-gradient(180deg, #d2b48c 20%, #8b4513 50%, #d2b48c 80%)', size: 55, orbitIndex: 4, fact: "Planet terbesar di Tata Surya.", orbitTime: 25 },
            { id: 'saturnus', name: 'Saturnus', color: 'linear-gradient(45deg, #f4a460, #deb887)', size: 48, orbitIndex: 5, fact: "Memiliki sistem cincin yang paling indah dan kompleks.", isRinged: true, orbitTime: 35 },
            { id: 'uranus', name: 'Uranus', color: 'linear-gradient(45deg, #afeeee, #00ced1)', size: 38, orbitIndex: 6, fact: "Berotasi menyamping, menggelinding mengelilingi Matahari.", isRinged: true, orbitTime: 45 },
            { id: 'neptunus', name: 'Neptunus', color: 'linear-gradient(45deg, #4169e1, #00008b)', size: 36, orbitIndex: 7, fact: "Planet terjauh, sangat dingin dan berangin kencang.", orbitTime: 55 }
        ];

        let orbitRadii = [];
        let placedCount = 0;
        const totalPlanets = planetData.length;
        
        const orbitZone = document.getElementById('orbit-zone');
        const sidebar = document.getElementById('planet-sidebar');
        const tooltip = document.getElementById('tooltip');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        let draggedElement = null;
        let originalParent = null;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        // --- Inisialisasi ---
        function initGame() {
            createStars();
            calculateOrbits();
            createOrbits();
            spawnPlanets();
            window.addEventListener('resize', () => {
                calculateOrbits();
                resizeOrbits();
            });
        }

        // Membuat efek bintang
        function createStars() {
            const container = document.getElementById('stars-container');
            for(let i=0; i<100; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                const xy = [Math.random() * 100, Math.random() * 100];
                const duration = Math.random() * 3 + 2;
                const size = Math.random() * 2 + 1;
                star.style.left = xy[0] + '%';
                star.style.top = xy[1] + '%';
                star.style.width = size + 'px';
                star.style.height = size + 'px';
                star.style.setProperty('--duration', duration + 's');
                container.appendChild(star);
            }
        }

        // Menghitung jari-jari orbit responsif
        function calculateOrbits() {
            const minDim = Math.min(orbitZone.clientWidth, orbitZone.clientHeight);
            const sunSize = 80; // Sesuaikan dengan CSS
            // Hitung step agar semua orbit muat
            // Max radius kira-kira (minDim / 2) - padding
            const maxRadius = (minDim / 2) - 30; 
            const step = (maxRadius - (sunSize/2) - 20) / totalPlanets;
            
            orbitRadii = planetData.map((_, i) => (sunSize/2) + 20 + (step * (i + 1)));
        }

        function createOrbits() {
            // Hapus orbit lama jika ada
            document.querySelectorAll('.orbit-ring').forEach(el => el.remove());

            orbitRadii.forEach((radius, index) => {
                const ring = document.createElement('div');
                ring.className = 'orbit-ring';
                ring.style.width = (radius * 2) + 'px';
                ring.style.height = (radius * 2) + 'px';
                ring.dataset.orbitIndex = index;
                orbitZone.appendChild(ring);
            });
        }
        
        function resizeOrbits() {
             const rings = document.querySelectorAll('.orbit-ring');
             rings.forEach((ring, index) => {
                 ring.style.width = (orbitRadii[index] * 2) + 'px';
                 ring.style.height = (orbitRadii[index] * 2) + 'px';
             });
             
             // Update juga posisi planet yang sudah ditempatkan
             const placedWrappers = document.querySelectorAll('.orbiting-wrapper');
             placedWrappers.forEach(wrap => {
                 const pId = wrap.dataset.planetId;
                 const pData = planetData.find(p => p.id === pId);
                 wrap.style.setProperty('--orbit-radius', orbitRadii[pData.orbitIndex] + 'px');
             });
        }

        function spawnPlanets() {
            sidebar.innerHTML = '';
            
            // Buat salinan array dan acak urutannya (Fisher-Yates Shuffle sederhana atau sort random)
            const shuffledPlanets = [...planetData].sort(() => Math.random() - 0.5);

            shuffledPlanets.forEach(data => {
                const p = document.createElement('div');
                p.className = 'planet';
                p.id = data.id;
                p.style.width = data.size + 'px';
                p.style.height = data.size + 'px';
                p.style.background = data.color;
                p.dataset.id = data.id;
                
                if (data.isRinged) {
                    p.classList.add('ringed');
                }

                // Label
                const label = document.createElement('span');
                label.className = 'planet-label';
                label.innerText = data.name;
                p.appendChild(label);

                // Event Listeners untuk Dragging
                p.addEventListener('mousedown', startDrag);
                p.addEventListener('touchstart', startDrag, {passive: false});
                
                // Tooltip events
                p.addEventListener('mouseenter', (e) => showTooltip(e, data.fact));
                p.addEventListener('mouseleave', hideTooltip);

                sidebar.appendChild(p);
            });
        }

        // --- Drag & Drop Logic ---

        function startDrag(e) {
            e.preventDefault();
            // Jika sudah ditempatkan, jangan di-drag lagi (kecuali kita mau fitur mindahin, tapi lebih baik dikunci)
            if (e.target.closest('.orbiting-wrapper')) return;

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            draggedElement = e.target.closest('.planet');
            originalParent = draggedElement.parentElement;

            // Pindahkan ke body agar bebas bergerak
            const rect = draggedElement.getBoundingClientRect();
            dragOffsetX = clientX - rect.left;
            dragOffsetY = clientY - rect.top;

            draggedElement.style.position = 'fixed';
            draggedElement.style.left = rect.left + 'px';
            draggedElement.style.top = rect.top + 'px';
            draggedElement.style.zIndex = 1000;
            document.body.appendChild(draggedElement);

            document.addEventListener('mousemove', onDrag);
            document.addEventListener('touchmove', onDrag, {passive: false});
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchend', endDrag);
        }

        function onDrag(e) {
            if (!draggedElement) return;
            e.preventDefault();
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            draggedElement.style.left = (clientX - dragOffsetX) + 'px';
            draggedElement.style.top = (clientY - dragOffsetY) + 'px';
            
            // Highlight orbit terdekat
            highlightNearestOrbit(clientX, clientY);
        }

        function endDrag(e) {
            if (!draggedElement) return;

            // Hapus listener
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('touchmove', onDrag);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchend', endDrag);

            // Validasi Posisi
            const rect = draggedElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Pusat Orbit Zone
            const zoneRect = orbitZone.getBoundingClientRect();
            const zoneCenterX = zoneRect.left + zoneRect.width / 2;
            const zoneCenterY = zoneRect.top + zoneRect.height / 2;

            // Hitung jarak dari matahari
            const dist = Math.sqrt(Math.pow(centerX - zoneCenterX, 2) + Math.pow(centerY - zoneCenterY, 2));

            const pData = planetData.find(p => p.id === draggedElement.dataset.id);
            const targetRadius = orbitRadii[pData.orbitIndex];
            
            // Toleransi (pixel)
            const tolerance = 25; 

            if (Math.abs(dist - targetRadius) < tolerance) {
                // Benar!
                snapToOrbit(draggedElement, pData);
            } else {
                // Salah - Kembalikan ke sidebar
                returnToSidebar(draggedElement);
                // Show hint
                if (dist < targetRadius) showToast(`Terlalu dekat! ${pData.name} orbitnya lebih jauh.`);
                else showToast(`Terlalu jauh! ${pData.name} orbitnya lebih dekat.`);
            }
            
            clearHighlights();
            draggedElement = null;
        }

        function snapToOrbit(element, data) {
            // Animasi sukses visual
            element.classList.add('placed', 'slot-correct');
            
            // Buat wrapper rotasi
            const wrapper = document.createElement('div');
            wrapper.className = 'orbiting-wrapper';
            wrapper.style.animationDuration = data.orbitTime + 's';
            wrapper.style.setProperty('--orbit-radius', orbitRadii[data.orbitIndex] + 'px');
            wrapper.dataset.planetId = data.id;

            // Reset style element planet agar relatif terhadap wrapper
            element.style.position = 'absolute';
            element.style.left = '-'+ (data.size/2) +'px'; // Center horizontally
            element.style.top = '-'+ (data.size/2) +'px';  // Center vertically
            element.style.transform = '';
            
            wrapper.appendChild(element);
            orbitZone.appendChild(wrapper);

            // Update Progress
            placedCount++;
            updateProgress();

            if (placedCount === totalPlanets) {
                setTimeout(() => {
                    document.getElementById('feedback-modal').style.display = 'block';
                }, 1000);
            }
        }

        function returnToSidebar(element) {
            element.style.transition = 'top 0.5s ease, left 0.5s ease';
            
            // Kembalikan ke DOM sidebar nanti, tapi animasi dulu visualnya
            // Cara gampang: langsung append kembali ke sidebar, style reset
            element.style.position = 'relative';
            element.style.left = 'auto';
            element.style.top = 'auto';
            element.style.zIndex = 20;
            sidebar.appendChild(element);
            
            // Hapus transition setelah animasi selesai (sedikit hacky di sini untuk simplicity)
            setTimeout(() => {
                element.style.transition = 'transform 0.2s, box-shadow 0.2s';
            }, 500);
        }

        // --- Helper Visual ---

        function highlightNearestOrbit(x, y) {
            clearHighlights();
            const zoneRect = orbitZone.getBoundingClientRect();
            const cx = zoneRect.left + zoneRect.width/2;
            const cy = zoneRect.top + zoneRect.height/2;
            const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));

            let closestIndex = -1;
            let minDiff = Infinity;

            orbitRadii.forEach((r, i) => {
                const diff = Math.abs(dist - r);
                if (diff < 25 && diff < minDiff) {
                    minDiff = diff;
                    closestIndex = i;
                }
            });

            if (closestIndex !== -1) {
                const rings = document.querySelectorAll('.orbit-ring');
                if(rings[closestIndex]) rings[closestIndex].classList.add('highlight');
            }
        }

        function clearHighlights() {
            document.querySelectorAll('.orbit-ring').forEach(r => r.classList.remove('highlight'));
        }

        function showTooltip(e, text) {
            if (draggedElement) return; // Jangan muncul saat drag
            tooltip.innerText = text;
            tooltip.style.display = 'block';
            
            // Posisi
            const x = e.clientX;
            const y = e.clientY;
            
            // Prevent overflow kanan
            if (x + 200 > window.innerWidth) {
                tooltip.style.left = (x - 210) + 'px';
            } else {
                tooltip.style.left = (x + 15) + 'px';
            }
            tooltip.style.top = (y + 10) + 'px';
        }

        function hideTooltip() {
            tooltip.style.display = 'none';
        }

        function showToast(msg) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm animate-bounce';
            toast.innerText = msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }

        function updateProgress() {
            const pct = (placedCount / totalPlanets) * 100;
            progressBar.style.width = pct + '%';
            progressText.innerText = Math.round(pct) + '%';
        }

        function resetGame() {
            document.getElementById('feedback-modal').style.display = 'none';
            placedCount = 0;
            updateProgress();
            
            // Hapus wrappers di orbit zone
            document.querySelectorAll('.orbiting-wrapper').forEach(el => el.remove());
            
            // Re-spawn planets di sidebar
            spawnPlanets();
        }

        // Start
        initGame();

    </script>
</body>
</html>
