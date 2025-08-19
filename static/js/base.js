// script.js
document.addEventListener("DOMContentLoaded", function () {
  // 부드러운 스크롤
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // 폼 유효성 검사 개선
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input[required]");

    inputs.forEach((input) => {
      // 실시간 유효성 검사
      input.addEventListener("blur", function () {
        validateInput(this);
      });

      input.addEventListener("input", function () {
        if (this.classList.contains("error")) {
          validateInput(this);
        }
      });
    });

    // 폼 제출 시 로딩 상태
    form.addEventListener("submit", function (e) {
      const submitBtn = this.querySelector('.btn[type="submit"]');
      if (submitBtn && !submitBtn.disabled) {
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> 처리중...';
        submitBtn.disabled = true;

        // 3초 후 원상복구 (실제로는 서버 응답 후 처리)
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 3000);
      }
    });
  });

  // 입력 유효성 검사 함수
  function validateInput(input) {
    const errorMsg = input.parentNode.querySelector(".error-message");

    if (input.validity.valid) {
      input.classList.remove("error");
      if (errorMsg) errorMsg.remove();
    } else {
      input.classList.add("error");
      if (!errorMsg) {
        const error = document.createElement("div");
        error.className = "error-message";
        error.style.color = "#ef4444";
        error.style.fontSize = "0.875rem";
        error.style.marginTop = "0.25rem";

        if (input.validity.valueMissing) {
          error.textContent = "이 필드는 필수입니다.";
        } else if (input.validity.typeMismatch) {
          error.textContent = "올바른 형식으로 입력해주세요.";
        } else if (input.validity.tooShort) {
          error.textContent = `최소 ${input.minLength}자 이상 입력해주세요.`;
        }

        input.parentNode.appendChild(error);
      }
    }
  }

  // 테이블 정렬 기능
  const tables = document.querySelectorAll(".styled-table");
  tables.forEach((table) => {
    const headers = table.querySelectorAll("th");
    headers.forEach((header, index) => {
      if (header.textContent.trim()) {
        header.style.cursor = "pointer";
        header.addEventListener("click", () => sortTable(table, index));
      }
    });
  });

  function sortTable(table, column) {
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const isAscending = table.dataset.sortOrder !== "asc";

    rows.sort((a, b) => {
      const aValue = a.cells[column].textContent.trim();
      const bValue = b.cells[column].textContent.trim();

      // 숫자인지 확인
      const aNum = parseFloat(aValue.replace(/[^0-9.-]/g, ""));
      const bNum = parseFloat(bValue.replace(/[^0-9.-]/g, ""));

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return isAscending ? aNum - bNum : bNum - aNum;
      }

      return isAscending ? aValue.localeCompare(bValue, "ko") : bValue.localeCompare(aValue, "ko");
    });

    tbody.innerHTML = "";
    rows.forEach((row) => tbody.appendChild(row));

    // 정렬 표시 업데이트
    table.querySelectorAll("th").forEach((th) => {
      th.classList.remove("sorted-asc", "sorted-desc");
    });

    const currentHeader = table.querySelectorAll("th")[column];
    currentHeader.classList.add(isAscending ? "sorted-asc" : "sorted-desc");
    table.dataset.sortOrder = isAscending ? "asc" : "desc";
  }

  // 반응형 테이블 처리
  function handleResponsiveTables() {
    const tables = document.querySelectorAll(".styled-table");
    tables.forEach((table) => {
      const wrapper = table.closest(".table-wrapper");
      if (table.offsetWidth > wrapper.offsetWidth) {
        wrapper.classList.add("scrollable");
      } else {
        wrapper.classList.remove("scrollable");
      }
    });
  }

  // 페이지 로드 및 리사이즈 시 테이블 확인
  window.addEventListener("resize", handleResponsiveTables);
  handleResponsiveTables();

  // 스크롤 시 헤더 그림자 효과
  let lastScrollY = window.scrollY;
  const header = document.querySelector(".header");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      header.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1)";
    } else {
      header.style.boxShadow = "none";
    }
    lastScrollY = window.scrollY;
  });

  // 요금제 카드 호버 효과 개선
  const planCards = document.querySelectorAll(".plan");
  planCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-12px)";
    });

    card.addEventListener("mouseleave", function () {
      if (!this.classList.contains("popular")) {
        this.style.transform = "translateY(0)";
      }
    });
  });

  // 인터섹션 옵저버를 사용한 애니메이션
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

  // 애니메이션 대상 요소들
  const animateElements = document.querySelectorAll(".form-box, .plan, .hero");
  animateElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

  // 키보드 네비게이션 개선
  document.addEventListener("keydown", function (e) {
    // Tab 키로 포커스 이동 시 시각적 표시 개선
    if (e.key === "Tab") {
      document.body.classList.add("using-keyboard");
    }
  });

  document.addEventListener("mousedown", function () {
    document.body.classList.remove("using-keyboard");
  });

  console.log("✨ UI/UX 개선 스크립트 로드 완료");
});

// CSS 추가 스타일 (JavaScript로 동적 추가)
const additionalStyles = `
    .using-keyboard *:focus {
        outline: 2px solid var(--primary-color) !important;
        outline-offset: 2px !important;
    }
    
    .table-wrapper.scrollable::after {
        content: '→';
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
        font-size: 1.2rem;
        pointer-events: none;
    }
    
    .sorted-asc::after {
        content: ' ↑';
    }
    
    .sorted-desc::after {
        content: ' ↓';
    }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
