// -------------------------
// 색상 변환 및 생성 함수
// -------------------------

function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return { r: r / 255, g: g / 255, b: b / 255 };
}

function rgbToHsl(r, g, b) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; 
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function generateHueVariations(baseHex, count, step) {
    const rgb = hexToRgb(baseHex);
    if (!rgb) return [];
    const { h: baseH, s: baseS, l: baseL } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const colors = [];
    for (let i = 0; i < count; i++) {
        const newH = (((baseH + i * step) % 360) + 360) % 360;
        colors.push({ h: newH, s: baseS, l: baseL });
    }
    return colors;
}

// -------------------------
// 탭 전환 기능 (수정됨)
// -------------------------
function openTab(tabName, clickedButton) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active-tab');
        button.style.color = '#4B4B4B'; // 비활성 탭 텍스트 색상 (pastel-text)
        button.style.backgroundColor = '#F3F4F6'; // 비활성 탭 배경색
    });

    const selectedContent = document.getElementById(`content-${tabName}`);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }

    if (clickedButton) {
        const activeColor = clickedButton.style.getPropertyValue('--active-color');
        
        clickedButton.classList.add('active-tab');
        clickedButton.style.color = 'white';
        clickedButton.style.backgroundColor = activeColor;

        // 메인 타이틀 색상 변경
        const mainTitle = document.getElementById('main-title');
        if (mainTitle) {
            mainTitle.style.color = activeColor;
        }

        // 화살표 색상 변경
        const scrollLeftArrow = document.querySelector('#scroll-left svg');
        const scrollRightArrow = document.querySelector('#scroll-right svg');
        if (scrollLeftArrow && scrollRightArrow) {
            scrollLeftArrow.style.stroke = activeColor;
            scrollRightArrow.style.stroke = activeColor;
        }

        // 탭을 중앙으로 스크롤
        clickedButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    
    if (tabName === 'outcome') {
        carousels.outcome?.goToSlide(0);
    }
    updateScrollButtons();
}

function updateScrollButtons() {
    const container = document.querySelector('.tabs-container');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');

    if (container.scrollWidth > container.clientWidth) {
        if (container.scrollLeft > 0) {
            scrollLeftBtn.classList.remove('hidden');
        } else {
            scrollLeftBtn.classList.add('hidden');
        }

        if (container.scrollLeft < container.scrollWidth - container.clientWidth - 1) {
            scrollRightBtn.classList.remove('hidden');
        } else {
            scrollRightBtn.classList.add('hidden');
        }
    } else {
        scrollLeftBtn.classList.add('hidden');
        scrollRightBtn.classList.add('hidden');
    }
}

// -------------------------
// 이미지 캐러셀 기능
// -------------------------

let carousels = {}; 
const autoSlideInterval = 5000;

function createCarousel(id) {
    let currentSlide = 0;
    const slides = document.querySelectorAll(`#carousel-track-${id} .carousel-item`);
    const indicatorsContainer = document.getElementById(`carousel-indicators-${id}`);
    let indicators = [];
    let intervalId;

    if (slides.length === 0) return null;

    function goToSlide(n) {
        if (n >= slides.length) n = 0;
        if (n < 0) n = slides.length - 1;

        clearInterval(intervalId);
        startAutoSlide(); 

        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index !== n) {
                 slide.style.position = 'absolute';
            }
        });

        slides[n].classList.add('active');
        slides[n].style.position = 'static'; 

        indicators.forEach((indicator, index) => {
            indicator.classList.remove('bg-pastel-primary');
            indicator.classList.add('bg-gray-300');
            if (index === n) {
                indicator.classList.remove('bg-gray-300');
                indicator.classList.add('bg-pastel-primary');
            }
        });

        currentSlide = n;
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    function startAutoSlide() {
        if (id === 'outcome') {
            intervalId = setInterval(nextSlide, autoSlideInterval);
        }
    }

    function initialize() {
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = '';
            indicators = [];
            for (let i = 0; i < slides.length; i++) {
                const indicator = document.createElement('button');
                indicator.classList.add('w-3', 'h-3', 'rounded-full', 'bg-gray-300', 'transition');
                indicator.onclick = () => goToSlide(i);
                indicatorsContainer.appendChild(indicator);
                indicators.push(indicator);
            }
        }
        goToSlide(0);
        startAutoSlide(); 
    }

    initialize();
    
    return {
        next: nextSlide,
        prev: prevSlide,
        goToSlide: goToSlide
    };
}

function nextSlideOutcome() { carousels.outcome?.next(); }
function prevSlideOutcome() { carousels.outcome?.prev(); }


window.onload = function() {
    
    // --- 1. 모든 탭을 위한 바리에이션 색상 설정 ---
    const taskBaseColor = '#a4a7e0'; 
    const taskHueStep = -15; // [수정] Hue 변경폭 -15로 변경
    const taskTabIds = ['plan', 'task1', 'task2', 'task3', 'outcome']; // [수정] 'plan' 포함
    const taskColorsHsl = generateHueVariations(taskBaseColor, taskTabIds.length, taskHueStep); // count = 5

    taskTabIds.forEach((id, index) => {
        const button = document.getElementById(`tab-${id}`);
        const contentDiv = document.getElementById(`content-${id}`);
        
        if (button && taskColorsHsl[index]) {
            const { h, s, l } = taskColorsHsl[index];
            
            const activeColor = `hsl(${h}, ${s}%, ${l}%)`;
            const hoverColor = `hsl(${h}, ${s}%, ${l - 10}%)`; 
            const tabHoverBg = `hsl(${h}, ${s}%, ${l}%, 0.1)`; 
            const cardBgColor = `hsl(${h}, ${s}%, ${l}%, 0.2)`; 
            
            button.style.setProperty('--active-color', activeColor);
            button.style.setProperty('--active-color-hover-bg', tabHoverBg);
            
            if (contentDiv) {
                contentDiv.style.setProperty('--active-color', activeColor);
                contentDiv.style.setProperty('--hover-color', hoverColor);
                contentDiv.style.setProperty('--card-bg-color', cardBgColor); 
            }
        }
    });
    
    // --- 2. 초기화 실행 ---
    const initialTab = document.getElementById('tab-plan');
    if (initialTab) {
        openTab('plan', initialTab);
    }
    carousels.outcome = createCarousel('outcome');

    // --- 3. 스크롤 버튼 설정 ---
    const container = document.querySelector('.tabs-container');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');

    scrollLeftBtn.addEventListener('click', () => {
        container.scrollBy({ left: -200, behavior: 'smooth' });
    });

    scrollRightBtn.addEventListener('click', () => {
        container.scrollBy({ left: 200, behavior: 'smooth' });
    });

    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    updateScrollButtons();

    // --- 4. 로딩 화면 숨기기 ---
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
};