const sidebar = document.querySelector(".sidebar-container");

if (sidebar) {
  // sidebar 요소가 있을 때만 실행
  document.querySelector(".nav-left")?.addEventListener("click", () => {
    sidebar.classList.add("active");
  });

  sidebar.addEventListener("click", (e) => {
    if (e.target === sidebar) {
      sidebar.classList.remove("active");
    }
  });

  document.querySelector("#closeSidebarBtn")?.addEventListener("click", () => {
    sidebar.classList.remove("active");
  });
}

const carouselItems = document.querySelectorAll(".carousel-item");
let idx = 0;

if (carouselItems.length > 0) {
  // 요소가 존재할 때만 실행
  setInterval(() => {
    const current = carouselItems[idx];
    const nextIdx = (idx + 1) % carouselItems.length;
    const next = carouselItems[nextIdx];

    // 현재 아이템 위로 올리기
    current.style.transition = "top 0.5s ease-in-out, opacity 0.5s";
    current.style.top = "-100%";
    current.style.opacity = "0";

    // 다음 아이템 밑에서 위로 등장
    next.style.transition = "none";
    next.style.top = "100%";
    next.style.opacity = "0";

    // 다음 아이템 애니메이션
    setTimeout(() => {
      next.style.transition = "top 0.5s ease, opacity 0.5s";
      next.style.top = "0";
      next.style.opacity = "1";
    }, 50);

    idx = nextIdx;
  }, 2500);
}

const slide = document.querySelector(".main-carousel-slide");

if (slide) {
  const items = document.querySelectorAll(".main-carousel-item");
  const indicators = document.querySelectorAll(".main-carousel-indicators span");

  const itemWidth = 600;
  let currentIndex = 0;

  // 마지막에 첫 번째 아이템을 복제하여 추가
  const clone = items[0].cloneNode(true);
  slide.appendChild(clone);

  const totalItems = items.length + 1; // 복제된 슬라이드 포함

  function moveTo(index) {
    slide.style.transition = "transform 0.5s ease";
    slide.style.transform = `translateX(-${index * itemWidth}px)`;

    // 인디케이터 업데이트 (복제된 슬라이드는 제외)
    indicators.forEach((dot, i) => {
      dot.classList.toggle("active", i === index % (totalItems - 1));
    });
  }

  function resetToFirst() {
    slide.style.transition = "none";
    slide.style.transform = `translateX(0px)`;
    currentIndex = 0;
  }

  setInterval(() => {
    currentIndex++;
    moveTo(currentIndex);

    // 복제된 슬라이드에 도달했을 경우 → 0번째로 즉시 이동
    if (currentIndex === totalItems - 1) {
      setTimeout(() => {
        resetToFirst();
      }, 500); // transition 끝난 후
    }
  }, 3000);
}

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "receiptBtn") {
    window.open("/receipt", "receiptPopup", "width=385,height=633,scrollbars=yes,resizable=yes");
  }
});

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "paymentBtn") {
    const popupWidth = 530;
    const popupHeight = 919;

    // 현재 브라우저 창 위치 및 크기
    const screenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
    const screenTop = window.screenTop !== undefined ? window.screenTop : screen.top;
    const screenWidth = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
    const screenHeight = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

    // 중앙 계산
    const left = screenLeft + (screenWidth - popupWidth) / 2;
    const top = screenTop + (screenHeight - popupHeight) + 84;

    // 팝업 열기
    window.open(
      "/payment",
      "paymentPopup",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${0},scrollbars=yes,resizable=yes`
    );
  }
});

const track = document.querySelector(".carousel-track");

if (track) {
  const slides = document.querySelectorAll(".carousel-slide");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  const slideWidth = 480;
  const visibleSlides = 3;

  let index = 0;

  // 무한 루프 위해 앞뒤 복제 (visibleSlides만큼)
  for (let i = 0; i < visibleSlides; i++) {
    const prepend = slides[slides.length - 1 - i].cloneNode(true);
    const append = slides[i].cloneNode(true);
    track.insertBefore(prepend, track.firstChild);
    track.appendChild(append);
  }

  let currentPosition = -(slideWidth * visibleSlides);
  track.style.transform = `translateX(${currentPosition}px)`;

  function moveToSlide(newIndex) {
    index = newIndex;
    currentPosition = -(slideWidth * (index + visibleSlides));
    track.style.transition = "transform 0.5s ease";
    track.style.transform = `translateX(${currentPosition}px)`;
  }

  nextBtn.addEventListener("click", () => {
    if (index >= slides.length - visibleSlides) {
      moveToSlide(index + visibleSlides);
      setTimeout(() => {
        track.style.transition = "none";
        index = 0;
        currentPosition = -(slideWidth * visibleSlides);
        track.style.transform = `translateX(${currentPosition}px)`;
      }, 500);
    } else {
      moveToSlide(index + visibleSlides);
    }
  });

  prevBtn.addEventListener("click", () => {
    if (index <= 0) {
      moveToSlide(index - visibleSlides);
      setTimeout(() => {
        track.style.transition = "none";
        index = slides.length - visibleSlides;
        currentPosition = -(slideWidth * (index + visibleSlides));
        track.style.transform = `translateX(${currentPosition}px)`;
      }, 500);
    } else {
      moveToSlide(index - visibleSlides);
    }
  });

  // 자동 슬라이드 (원하면)
  setInterval(() => {
    nextBtn.click();
  }, 4000);
}

let lastScrollY = window.scrollY;

const imageBtn = document.getElementById("imageBtn");
const imageBtn1 = document.getElementById("imageBtn1");
const textBtn = document.getElementById("textBtn"); // 페이지 2에는 null
const upBtn = document.getElementById("upBtn");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const scrollingDown = currentScrollY > lastScrollY;

  // 맨 위
  if (currentScrollY === 0) {
    if (imageBtn) imageBtn.classList.remove("hidden");
    if (textBtn) textBtn.classList.remove("hidden");
    if (upBtn) upBtn.style.display = "none";
  }
  // 스크롤 내림
  else if (scrollingDown) {
    if (imageBtn1) imageBtn1.classList.add("hidden"); // ✅ 반드시 숨김
    if (textBtn) textBtn.classList.add("hidden");
    if (upBtn) {
      upBtn.style.display = "flex";
      upBtn.style.bottom = "15px"; // 내릴 때 기존 버튼 자리
    }
  }
  // 스크롤 올림
  else {
    if (imageBtn1) imageBtn1.classList.remove("hidden");
    if (textBtn) textBtn.classList.remove("hidden");
    if (upBtn) {
      upBtn.style.display = "flex";
      upBtn.style.bottom = textBtn ? "125px" : "70px"; // 페이지 구분
    }
  }

  lastScrollY = currentScrollY;
});

// 위로 가기 버튼 클릭
if (upBtn) {
  upBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const login_btn = document.querySelector("#login_btn");
if (login_btn) {
  login_btn.addEventListener("click", () => localStorage.setItem("login", "true"));
}

function checkLoginStatus() {
  // localStorage에서 'login' 키 값 확인
  const isLoggedIn = localStorage.getItem("login");

  // 요소들 가져오기
  const loggedInUser = document.getElementById("loggedInUser");
  const loginForm = document.getElementById("loginForm");

  if (isLoggedIn === "true") {
    // 로그인 상태 - 마이페이지 링크 보여주기
    loggedInUser.classList.remove("hidden");
    loginForm.classList.add("hidden");
  } else {
    // 로그인 안 한 상태 - 로그인 링크 보여주기
    loginForm.classList.remove("hidden");
    loggedInUser.classList.add("hidden");
  }
}

const deleteSidebarBtn = document.querySelector("#deleteSidebarBtn");
if (deleteSidebarBtn) {
  deleteSidebarBtn.addEventListener("click", () => localStorage.clear());
}

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", checkLoginStatus);
