const COLUMNS = 3;
const TOTAL_CHAR_SLOTS = 9; 
const closing = document.getElementById('gateClose');
const gates = document.querySelectorAll('.gate');
const clickToEnter = document.getElementById('clickToEnter');
const boomSound = document.getElementById('boom');
const charMusic = document.getElementById('charMusic');
const plupluSound = document.getElementById('pluplupluSound');
const plipSound = document.getElementById('plipSound');
const darkenbg = document.getElementById('darken');
const grid = document.querySelector('.charGrid');
const slots = document.querySelectorAll('.slot'); 
const muteButt = document.getElementById('muteButt'); 
const mutePic = document.getElementById('mutePic');
let videoContainer = document.getElementById('videoContainer');
let video = document.getElementById('portfolioVideo');
const description = document.querySelector('.descriptionForChange');
const activeSprite = document.getElementById('spriteFanta');
let lastScrollPosition = 0;
let gridIndex = 0;
let isLocked = false;
let isMuted = false;
let lockAnimationTimeout = null; 
let fadeInterval = null;
const CHAR_ANIMATION_TIMES = [
    560, 
    380,
    500,  
    1210, 
    490,  
    380,  
    200, 
    1120, 
    2030  
];

function triggerSlam() {
    if (clickToEnter) clickToEnter.style.display = 'none';
    
    if (closing) {
        closing.style.setProperty('background', '#000000', 'important');
    }
    gates.forEach(g => {
        g.style.transition = "transform 0.35s ease-out"; 
        g.classList.add('gateAnimation');
    });
    if (closing) closing.classList.add('gatesClosed');
    setTimeout(() => {
        if (boomSound) { boomSound.currentTime = 0; boomSound.play().catch(e => {}); }
        if (closing) closing.classList.add('shakeEffect');
        
        setTimeout(() => {
            if (closing) closing.classList.remove('shakeEffect');
            if (closing) {
                closing.style.background = 'transparent';
            }
        }, 500);
    }, 350);
}

function startGame() {
    gates.forEach(g => {
        g.style.transition = "";
    });
    if (closing) {
        closing.classList.remove('gatesClosed');
        closing.classList.add('gatesOpen');
    }
    if (charMusic) { 
        charMusic.currentTime = 0;
        charMusic.volume = 1; 
        charMusic.play().catch(e => {}); 
    }
    setTimeout(() => { 
        if (closing && closing.classList.contains('gatesOpen')) {
            closing.style.display = 'none'; 
        }
    }, 600);
}

function playPlipSound() {
    if (plipSound) { plipSound.currentTime = 0; plipSound.play().catch(e => {}); }
}

function toggleMute() {
    isMuted = !isMuted;
    if (!charMusic) return;
    clearInterval(fadeInterval);
    if (isMuted) {
        let currentVol = charMusic.volume;
        fadeInterval = setInterval(() => {
            if (currentVol > 0.05) {
                currentVol -= 0.05;
                charMusic.volume = currentVol;
            } else {
                charMusic.volume = 0;
                charMusic.muted = true;
                charMusic.pause();
                clearInterval(fadeInterval);
            }
        }, 20); 
    } else {
        charMusic.muted = false;
        charMusic.volume = 0;
        charMusic.play().catch(e => {});
        let currentVol = 0;
        fadeInterval = setInterval(() => {
            if (currentVol < 0.95) {
                currentVol += 0.05;
                charMusic.volume = currentVol;
            } else {
                charMusic.volume = 1;
                clearInterval(fadeInterval);
            }
        }, 20);
    }
    if (mutePic) {
        mutePic.innerText = isMuted ? "🔇" : "🔊";
    }
}

function fadeMusic(fadeOut = true) {
    if (isMuted || !charMusic) return;
    clearInterval(fadeInterval);
    let vol = fadeOut ? charMusic.volume : 0;
    if (!fadeOut) {
        charMusic.currentTime = 0;
        charMusic.play().catch(e => {});
    }
    fadeInterval = setInterval(() => {
        if (fadeOut && vol > 0.05) {
            vol -= 0.05;
            charMusic.volume = vol;
        } else if (!fadeOut && vol < 0.95) {
            vol += 0.05;
            charMusic.volume = vol;
        } else {
            if (fadeOut) {
                charMusic.pause();
                charMusic.volume = 0;
            } else {
                charMusic.volume = 1;
            }
            clearInterval(fadeInterval);
        }
    }, 25);
}

function updateVideoPreview() {
    if (gridIndex === 9) return; 
    
    // 1. Скрываем все видео в контейнере, тушим их и убираем старый ID
    const allVideos = document.querySelectorAll('.portfolio-video');
    allVideos.forEach(v => {
        v.classList.remove('active');
        v.classList.add('hidden');
        v.removeAttribute('id-active'); // на всякий случай очищаем маркеры
        v.id = v.getAttribute('data-original-id') || v.id; // возвращаем родной ID обратно в пул
        v.pause();
    });

    // 2. Включаем превью текущего персонажа из сетки
    const currentVideo = document.getElementById(`portfolioVideo-${gridIndex}`);
    if (currentVideo) {
        // Сохраняем родной ID в кастомный атрибут, если еще не сохранили
        if (!currentVideo.getAttribute('data-original-id')) {
            currentVideo.setAttribute('data-original-id', currentVideo.id);
        }
        
        currentVideo.classList.remove('hidden');
        currentVideo.classList.add('active');
        
        // ВРЕМЕННО ПРИСВАЕВАЕМ СТАРЫЙ ID, ЧТОБЫ ВЕРНУТЬ CSS СТИЛИ НА МЕСТО
        currentVideo.id = 'portfolioVideo'; 
        
        currentVideo.muted = true; 
        currentVideo.play().catch(e => {});
    }
}

function updateSelectionUI() {
    if (isLocked) return;
    slots.forEach(s => s.classList.remove('active'));
    if (muteButt) muteButt.classList.remove('active');
    if (gridIndex === 9) {
        if (muteButt) muteButt.classList.add('active');
    } else {
        if (slots[gridIndex]) slots[gridIndex].classList.add('active');
        const CHAR_DESCRIPTIONS = [
            `
            <p><strong>GRID SLOT 1: THE ACROBAT</strong></p>
            <p><strong>The Clip:</strong> A character executes a stylized dance while another character runs, climbs a stack of boxes, and lands a flawless gainer backflip in the background.</p>
            <p><strong>The Breakdown:</strong> An exercise in comedic timing, environmental interaction, and rhythmic movement. Both the background parkour and the foreground dance choreography were entirely hand-keyed from scratch to showcase clean arc trajectories, momentum, and precise weight distribution.</p>
            <p><strong>Focus:</strong> 100% hand-keyed choreography, environmental parkour, and aerial arcs.</p>
            `,
            `
            <p><strong>GRID SLOT 2: THE WEAPON MASTER (PART 1)</strong></p>
            <p><strong>The Clip:</strong> First-person perspective (FPV) tactical sequences featuring aggressive AK-47, M4, G3GS1, Light Machine Gun reloads.</p>
            <p><strong>The Breakdown:</strong> Focused on intense mechanical realism. Features an AK Speed Reload paired with an Underhand Charge that generates a distinct, realistic weapon shake, alongside a tactical left-handed M4 bolt-release slap, and left-handed G3SG1 manipulation with highly realistic, articulate finger positioning. For the LMG, the animation shows the character physically struggling against the weight of the heavy gun.</p>
            <p><strong>Focus:</strong> FPV mechanical reloads, articulate finger animation, and heavy weight resistance.</p>
            `,
            `
            <p><strong>GRID SLOT 3: THE WEAPON MASTER (PART 2)</strong></p>
            <p><strong>The Clip:</strong> First-person perspective (FPV) high-caliber firefights featuring the AWP sniper and combat shotgun.</p>
            <p><strong>The Breakdown:</strong> Studies the physical impact of heavy firepower. Features a bullet impact on the AWP and shotgun are weighted with realistic, violent camera shake and recoil recovery.</p>
            <p><strong>Focus:</strong> Heavy recoil simulation, weapon weight distribution, and micro-motion recovery.</p>
            `,
            `
            <p><strong>GRID SLOT 4: THE DUELISTS</strong></p>
            <p><strong>Engine:</strong> Source 2 Filmmaker (S2FM)</p>
            <p><strong>The Clip:</strong> A dynamic, narrative-driven sword fight between a Counter-Terrorist (CT) and a Terrorist (T).</p>
            <p><strong>The Breakdown:</strong> A deep dive into body mechanics, momentum, and character storytelling. Highlights include:<br>
            • <strong>The CT Kick:</strong> The CT's torso shifts backward to counter-balance the forward momentum of the kick, followed by a posture reset before jumping for a mid-air Katana strike.<br>
            • <strong>The T Evade:</strong> The downed T tracking the threat, rolling his upper body away, and using that momentum to slice the CT's arm.<br>
            • <strong>The Aftermath:</strong> Character personality through physics. The T struggles using two hands to lift his massive, heavy sword due to exhaustion. The CT stands nonchalantly, swinging his hands out to shake off the pain, holding his Katana easily with one hand because of its lighter weight.</p>
            <p><strong>Focus:</strong> Combat choreography, counter-balancing, weight contrast, and visual storytelling.</p>
            `,
            `
            <p><strong>GRID SLOT 5: THE BREACH (Cinematic Part 1)</strong></p>
            <p><strong>The Clip:</strong> A Terrorist squad aggressively breaches a bomb site.</p>
            <p><strong>The Breakdown:</strong> A masterclass in momentum and group coordination.<br>
            • Features the gainer backflip from Slot 1, re-contextualized into a realistic tactical run. The landing forces the character's hands and feet down first, bending the torso inward to absorb the impact before using multiple recovery steps to handle the forward inertia.<br>
            • Secondary animations show one character sliding to a stop to change direction, and another tripping their legs before crawling to plant the bomb.<br>
            • Ends with a realistic tactical boost: One character backs against a wall and cups his hands; the runner pulls his torso back to decelerate, steps into the hand-launch, and drives his legs upward to reach the mezzanine.</p>
            <p><strong>Focus:</strong> Group choreography, inertia absorption, deceleration physics, and multi-character interaction.</p>
            `,
            `
            <p><strong>GRID SLOT 6: THE GUNSLINGER (Cinematic Part 2)</strong></p>
            <p><strong>The Clip:</strong> A Desert Eagle firefight shown from both an FPV angle and a third-person right-side profile.</p>
            <p><strong>The Breakdown:</strong> Designed to show authenticity from multiple viewing angles. The recoil force pushes the hand straight back first before rotating the wrist upward. The third-person profile showcases how the violent energy of the Deagle blast transfers through the arm and forces the character's entire torso backward.</p>
            <p><strong>Focus:</strong> Recoil physics, multi-angle consistency, and force transfer.</p>
            `,
            `
            <p><strong>GRID SLOT 7: THE REACTION (Cinematic Part 3)</strong></p>
            <p><strong>The Clip:</strong> A high-intensity dodge, combat roll, and slow-motion kill shot.</p>
            <p><strong>The Breakdown:</strong> Complex camera tracking matched with variable timing. The camera tracks behind the character, orbits 180 degrees during a stand-to-roll-to-sit transition, and locks in front for the shot. In slow-motion, the bullet tears through the target without causing immediate impact, adhering to realistic velocity principles—the target only flies backward once the scene returns to normal speed.</p>
            <p><strong>Focus:</strong> Camera orbiting, fluid posture transitions, and variable-speed impact physics.</p>
            `,
            `
            <p><strong>GRID SLOT 8: THE DEFUSAL (Cinematic Part 4)</strong></p>
            <p><strong>The Clip:</strong> A top-down perspective of a CT defusing and securing the bomb.</p>
            <p><strong>The Breakdown:</strong> Driven entirely by micro-movements and personality. The CT pulls out a multi-tool, changes his mind, and switches a physical lever to deactivate the bomb. While trying to pick it up, his slippery tactical gloves cause the bomb to slide away multiple times until he cuts off its path with his other hand. It concludes with a slick bomb flip, a Shaka sign, and a relaxed exit gesture.</p>
            <p><strong>Focus:</strong> Micro-expressions, hand eye-coordination, friction/prop physics, and character flair.</p>
            `,
            `
            <p><strong>GRID SLOT 9: THE BONUS ROUND</strong></p>
            <p><strong>Engine:</strong> Source 2 Filmmaker (S2FM)</p>
            <p><strong>The Clip:</strong> A compilation of funny, fast-paced, low-effort animations.</p>
            <p><strong>The Breakdown:</strong> Every game needs its easter eggs. These are quick, stylized animations created as comedic relief for a larger 13-minute project. While less technically demanding than the core cinematic slots, they demonstrate fast turnaround times, expressive character poses, and comedic timing.</p>
            <p><strong>Focus:</strong> Rapid iteration, comedy, and posing.</p>
            `
        ];
        const videoDescElement = document.getElementById('descriptionInChange');
        if (videoDescElement && CHAR_DESCRIPTIONS[gridIndex]) {
            videoDescElement.innerHTML = CHAR_DESCRIPTIONS[gridIndex];
        }
        if (activeSprite) {
            activeSprite.src = `pictures/char_${gridIndex}_idle.gif`;
        }
        updateVideoPreview(); 
    }
}

function selectCharacter() {
    if (isLocked || gridIndex === 9) return;
    isLocked = true;
    if (activeSprite) {
        // ЭТАП 2: Врубается твоя анимация выбора _chosen.gif
        activeSprite.src = `pictures/char_${gridIndex}_chosen.gif`;
        if (lockAnimationTimeout) clearTimeout(lockAnimationTimeout);
        const dynamicDuration = CHAR_ANIMATION_TIMES[gridIndex] || 1200;
        
        lockAnimationTimeout = setTimeout(() => {
            if (isLocked && activeSprite) {
                activeSprite.src = `pictures/char_${gridIndex}_static.png`;
            }
        }, dynamicDuration); 
        
        const videoDelay = dynamicDuration + 400;
        fadeMusic(true); 
        const activeSlot = slots[gridIndex];
        if (activeSlot) activeSlot.classList.add('locked'); 
        if (grid) grid.classList.add('glowing');      
        if (plupluSound) plupluSound.play().catch(e => {});
        
        setTimeout(() => {
            // ЭТАП 3: Экран темнеет, открывается видео на весь экран
            if (darkenbg) darkenbg.classList.add('active');
            document.body.classList.add('scroll-locked');
            if (videoContainer) videoContainer.classList.add('show'); 
            
            // ИСПРАВЛЕНО: Ищем видео по ID 'portfolioVideo', так как оно уже переименовано в updateVideoPreview!
            const activeVideo = document.getElementById('portfolioVideo');
            if (activeVideo) {
                activeVideo.muted = isMuted; // ВКЛЮЧАЕМ ЗВУК (применяем глобальный статус звука сайта)
                activeVideo.currentTime = 0; // Сбрасываем синематик на начало
                activeVideo.play().catch(e => console.log("Ошибка воспроизведения звука:", e));
            }
        }, videoDelay); 
    }
}
function unlockSelection() {
    isLocked = false;
    if (lockAnimationTimeout) {
        clearTimeout(lockAnimationTimeout);
        lockAnimationTimeout = null;
    }
    if (darkenbg) darkenbg.classList.remove('active');
    document.body.classList.remove('scroll-locked');
    if (slots[gridIndex]) slots[gridIndex].classList.remove('locked');
    if (grid) grid.classList.remove('glowing');
    if (videoContainer) videoContainer.classList.remove('show');
    const fullScreen = document.querySelector('.fullScreen');
    const videoInfo = document.getElementById('videoInfo');
    const infoHide = document.getElementById('infoHide');
    if (fullScreen) fullScreen.classList.remove('shifted-up');
    if (videoInfo) videoInfo.style.display = 'block';
    if (infoHide) infoHide.style.display = 'none';
    document.body.style.backgroundColor = "black";
    
    // ИСПРАВЛЕНО: Просто прячем и останавливаем все видео в пуле
    const allVideos = document.querySelectorAll('.portfolio-video');
    allVideos.forEach(v => {
        v.pause();
        v.muted = true;
        v.classList.remove('active');
        v.classList.add('hidden');
    });
    
    if (activeSprite) {
        activeSprite.src = `pictures/char_${gridIndex}_idle.gif`;
    }
    window.scrollTo({
        top: lastScrollPosition,
        behavior: 'auto'
    });
    fadeMusic(false); 
}

slots.forEach((slot, index) => {
    slot.addEventListener('mouseenter', () => { if (!isLocked && gridIndex !== index) { gridIndex = index; updateSelectionUI(); playPlipSound(); } });
    slot.addEventListener('click', selectCharacter);
});

if (muteButt) {
    muteButt.addEventListener('mouseenter', () => { if (!isLocked && gridIndex !== 9) { gridIndex = 9; updateSelectionUI(); playPlipSound(); } });
    muteButt.addEventListener('click', toggleMute);
}

window.addEventListener('keydown', (e) => {
    if (closing && closing.style.display !== 'none') return;
    if (isLocked) {
        const fullScreen = document.querySelector('.fullScreen');
        const videoInfo = document.getElementById('videoInfo');
        const infoHide = document.getElementById('infoHide');
        if (e.key === 'Escape') { 
            unlockSelection(); 
            e.preventDefault();
            return; 
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            return;
        }
        if (e.key === ' ') {
            e.preventDefault();
            video = document.getElementById('portfolioVideo');
            if (video) {
                if (video.paused) { video.play().catch(e => {}); } else { video.pause(); }
            }
            return;
        }
        if (e.key.toLowerCase() === 's' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (fullScreen && !fullScreen.classList.contains('shifted-up')) {
                fullScreen.classList.add('shifted-up');
                if (videoInfo) videoInfo.style.display = 'none';
                if (infoHide) infoHide.style.display = 'block';
                video = document.getElementById('portfolioVideo');
                if (video && !video.paused) video.pause();
            }
            return;
        }
        if (e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (fullScreen && fullScreen.classList.contains('shifted-up')) {
                fullScreen.classList.remove('shifted-up');
                if (videoInfo) videoInfo.style.display = 'block';
                if (infoHide) infoHide.style.display = 'none';
                video = document.getElementById('portfolioVideo');
                if (video && video.paused && !isMuted) video.play().catch(e => {});
            }
            return;
        }
        return; 
    }
    const key = e.key.toLowerCase();
    const oldIndex = gridIndex;
    if (key === 'd' && gridIndex < 8 && gridIndex % 3 < 2) gridIndex++;
    if (key === 'a' && gridIndex > 0 && gridIndex % 3 > 0) gridIndex--;
    if (key === 'w') {
        if (gridIndex === 9) gridIndex = 7;
        else if (gridIndex >= 3) gridIndex -= 3;
    }
    if (key === 's') {
        if (gridIndex >= 6 && gridIndex <= 8) gridIndex = 9;
        else if (gridIndex <= 5) gridIndex += 3;
    }
    if (gridIndex !== oldIndex) { updateSelectionUI(); playPlipSound(); }
    
    if (e.key === 'Enter' && !isLocked) {
        if (gridIndex === 9) toggleMute();
        else selectCharacter();
    }
});

window.addEventListener('scroll', () => {
    const scroll = window.pageYOffset;
    const bg = document.querySelector('.bGround');
    if (bg) bg.style.transform = `translateY(-${scroll * 0.18}px)`;
});

const galleryContainer = document.getElementById('galleryVideos');
if (galleryContainer) {
    galleryContainer.innerHTML = ''; 
    const PORTFOLIO_PROJECTS = [
        {
            title: "CINEMATIC 1",
            desc: "The project that started my long journey with 3D manipulation. Before diving into this creation, I didn't have the slightest idea of what 3D animation even entailed. I still remember spending three straight days in absolute agony just to assemble a basic running animation sequence.",
            videoSrc: "pictures/gallery0.mp4",
            isYouTube: false
        },
        {
            title: "LIGHTING SHOWCASE",
            desc: "Perfecting the lighting design was easily as exhausting as animating the 3D models themselves. As you can see, every single clip relies on its own unique atmospheric setup; the reflections cast along the walls and the specialized highlight maps baked across the models were all handcrafted from scratch.",
            videoSrc: "pictures/gallery1.mp4",
            isYouTube: false
        },
        {
            title: "FULL MOVIE",
            desc: "If you would like to experience my creation in its entirety, feel free to sit back and watch the full video. I promise you won't regret it!",
            videoSrc: "https://www.youtube.com/watch?v=XtdxQ9FXvfI&t=304s", 
            isYouTube: true,
            thumbSrc: "pictures/youtube_preview_1.png"
        },
        {
            title: "FPV GUNS ANIMATIONS",
            desc: "By far the most exhausting challenge of them all. It looks simple animating just a pair of hands and a weapon, but I ultimately rebuilt 12 unique guns from scratch—five of which included an extra mirrored variant for left-handed use. It was an absolute headache, but what you see here are the best-looking animations pruned down from 17 total sequences. Full video: https://www.youtube.com/watch?v=N4Njbzx8PVM&t=257s",
            videoSrc: "pictures/gallery2.mp4",
            isYouTube: false
        },
        {
            title: "CINEMATIC 2",
            desc: "Huge upgrade compared to the first cinematic. Characters now move realistically smooth paced with energetic music.",
            videoSrc: "pictures/gallery3.mp4",
            isYouTube: false
        },
        {
            title: "FULL MOVIE",
            desc: "5 month of agony for 13 minutes of happiness! If you are a Counter Strike player, you will most definetely enjoy this video",
            videoSrc: "https://www.youtube.com/watch?v=nJxc6o9Jle4&pp=0gcJCRsMAYcqIYzv", 
            isYouTube: true,
            thumbSrc: "pictures/youtube_preview_2.png"
        }
    ];
    PORTFOLIO_PROJECTS.forEach((project, index) => {
    const visualContent = project.isYouTube 
        ? `<div class="galleryYoutubePlaceholder" style="background-image: url('${project.thumbSrc}');"></div>`
        : `<video class="galleryThumbLoop" muted loop playsinline src="${project.videoSrc}"></video>`;
    
    galleryContainer.innerHTML += `
        <div class="galleryVideo" data-gallery-id="${index}">
            <div class="galleryVideoPreviewBox">
                ${visualContent}
            </div>
            <div class="desc">
                <h3>${project.title}</h3>
                <p>${project.desc}</p>
            </div>
        </div>`;
});
    document.querySelectorAll('.galleryVideo').forEach(item => {
        const thumbVideo = item.querySelector('.galleryThumbLoop');
        if (thumbVideo) {
            thumbVideo.play().catch(e => {}); 
        }
        item.querySelector('.galleryVideoPreviewBox').addEventListener('click', () => {
            const projectData = PORTFOLIO_PROJECTS[item.getAttribute('data-gallery-id')];
            if (projectData.isYouTube) {
                window.open(projectData.videoSrc, '_blank'); 
                return; 
            }
            if (isLocked) return; 
            lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            isLocked = true;
            const videoDescElement = document.getElementById('descriptionInChange');
            
            // 1. Полностью прячем и останавливаем сетку персонажей
            const allVideos = document.querySelectorAll('.portfolio-video');
            allVideos.forEach(v => { 
                v.classList.remove('active'); 
                v.classList.add('hidden'); 
                v.pause(); 
                if (v.getAttribute('data-original-id')) {
                    v.id = v.getAttribute('data-original-id');
                }
            });

            // 2. Достаем цифру из имени файла (например, из "pictures/gallery2.mp4" берем 2)
            const fileNumber = projectData.videoSrc.match(/\d+/); 
            const targetGalleryVideo = document.getElementById(`galleryVideo-${fileNumber}`);
            
            if (targetGalleryVideo) {
                // Бэкапим родной ID, чтобы верстка не ломалась при закрытии окна
                if (!targetGalleryVideo.getAttribute('data-original-id')) {
                    targetGalleryVideo.setAttribute('data-original-id', targetGalleryVideo.id);
                }

                targetGalleryVideo.classList.remove('hidden');
                targetGalleryVideo.classList.add('active');
                
                // Переименовываем в 'portfolioVideo', чтобы подсосать твои оригинальные CSS размеры
                targetGalleryVideo.id = 'portfolioVideo'; 
                
                targetGalleryVideo.muted = isMuted; 
                targetGalleryVideo.currentTime = 0;
            }

            if (videoDescElement) videoDescElement.innerText = projectData.desc;
            fadeMusic(true);
            if (plupluSound) plupluSound.play().catch(e => {});
            if (darkenbg) darkenbg.classList.add('active');
            document.body.classList.add('scroll-locked');
            if (videoContainer) videoContainer.classList.add('show');
            if (targetGalleryVideo) {
                targetGalleryVideo.play().catch(e => {});
            }
        });
    });
}

function initSubpageAudioEngine() {
    const isSubpage = window.location.pathname.includes('contact.html') || window.location.pathname.includes('about.html');
    if (isSubpage && charMusic) {
        const startAudioContext = () => {
            charMusic.muted = isMuted;
            charMusic.volume = isMuted ? 0 : 1;
            if (!isMuted) {
                charMusic.play().catch(e => console.log("Autoplay blocked"));
            }
            const prompt = document.getElementById('clickForMusic');
            if (prompt) {
                prompt.style.display = 'none';
            }
            document.removeEventListener('click', startAudioContext);
            document.removeEventListener('keydown', startAudioContext);
        };
        document.addEventListener('click', startAudioContext);
        document.addEventListener('keydown', startAudioContext);
        if (muteButt) {
            muteButt.replaceWith(muteButt.cloneNode(true));
            const freshSubpageMuteButt = document.getElementById('muteButt');
            const freshMutePic = document.getElementById('mutePic');
            freshSubpageMuteButt.addEventListener('click', (e) => {
                e.stopPropagation(); 
                e.preventDefault();
                const prompt = document.getElementById('clickForMusic');
                if (prompt) prompt.style.display = 'none';
                isMuted = !isMuted;
                if (!charMusic) return;
                clearInterval(fadeInterval);
                if (isMuted) {
                    let currentVol = charMusic.volume;
                    fadeInterval = setInterval(() => {
                        if (currentVol > 0.05) {
                            currentVol -= 0.05;
                            charMusic.volume = currentVol;
                        } else {
                            charMusic.volume = 0;
                            charMusic.muted = true;
                            charMusic.pause();
                            clearInterval(fadeInterval);
                        }
                    }, 20); 
                } else {
                    charMusic.muted = false;
                    charMusic.volume = 0;
                    charMusic.play().catch(err => {});
                    let currentVol = 0;
                    fadeInterval = setInterval(() => {
                        if (currentVol < 0.95) {
                            currentVol += 0.05;
                            charMusic.volume = currentVol;
                        } else {
                            charMusic.volume = 1;
                            clearInterval(fadeInterval);
                        }
                    }, 20);
                }
                if (freshMutePic) {
                    freshMutePic.innerText = isMuted ? "🔇" : "🔊";
                }
            });
        }
    }
}

function checkBypassState() {
    const isSubpage = window.location.pathname.includes('contact.html') || window.location.pathname.includes('about.html');
    const isMainPage = !isSubpage;
    if (isMainPage) {
        if (window.location.hash.includes('bypass')) {
            if (clickToEnter) clickToEnter.style.display = 'none';
            if (closing) {
                gates.forEach(g => g.style.transition = 'none');
                closing.classList.add('gatesClosed');
                closing.style.display = 'block'; 
            }
            const explicitShield = document.getElementById('bypassShield');
            if (explicitShield) {
                explicitShield.remove();
            }
            if (closing) {
                closing.style.setProperty('background', 'transparent');
            }
            if (window.location.hash.includes('bypass-gallery')) {
                const startButt = document.querySelector('.gateButtons .butt:first-child');
                if (startButt) {
                    startButt.addEventListener('click', () => {
                        setTimeout(() => {
                            const gallerySec = document.getElementById('gallery');
                            if (gallerySec) {
                                gallerySec.scrollIntoView({ behavior: 'smooth' });
                            }
                        }, 600);
                    });
                }
            }
        } else {
            if (clickToEnter && clickToEnter.style.display !== 'none') {
                if (closing) {
                    closing.style.display = 'block';
                    closing.style.setProperty('background', '#000000', 'important');
                    closing.classList.remove('gatesClosed', 'gatesOpen', 'shakeEffect');
                }
                gates.forEach(g => {
                    g.style.transition = ""; 
                    g.classList.remove('gateAnimation');
                });
            }
        }
    }
}
window.animateExitAndGo = function(event, destinationUrl) {
    event.preventDefault(); 
    const subpageClosing = document.getElementById('gateClose');
    if (subpageClosing) {
        subpageClosing.style.display = 'block';
        setTimeout(() => {
            subpageClosing.classList.remove('gatesOpen');
            subpageClosing.classList.add('gatesClosed');
        }, 10);
        setTimeout(() => {
            const subpageBoomSound = document.getElementById('boom');
            if (subpageBoomSound) { 
                subpageBoomSound.currentTime = 0; 
                subpageBoomSound.play().catch(e => {}); 
            }
            document.body.classList.add('shakeEffect');
        }, 350); 
        setTimeout(() => {
            document.body.classList.remove('shakeEffect');
            window.location.href = destinationUrl;
        }, 800); 
    } else {
        window.location.href = destinationUrl;
    }
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkBypassState();
        initSubpageAudioEngine();
    });
} else {
    checkBypassState();
    initSubpageAudioEngine();
}
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contactForm');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const button = form.querySelector('button');
            const originalButtonText = button.textContent;
            button.textContent = 'SENDING...';
            button.disabled = true;

            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    alert('SOUL SENT!');
                    form.reset();
                } else {
                    const data = await response.json();
                    alert(data.errors ? data.errors.map(e => e.message).join(', ') : 'Sending error');
                }
            } catch (error) {
                alert('Network issue. Try again later.');
            } finally {
                button.textContent = originalButtonText;
                button.disabled = false;
            }
        });
    }
});