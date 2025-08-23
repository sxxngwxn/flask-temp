const dbReq = indexedDB.open("orderDatas", 1);

let db;
dbReq.addEventListener("success", function (event) {
  db = event.target.result;
});

dbReq.addEventListener("upgradeneeded", function (event) {
  db = event.target.result;
  db.createObjectStore("datas", { keyPath: "id", autoIncrement: true });
});

const dataSaveBtn = document.getElementById("saveSidebarBtn");
if (dataSaveBtn) {
  dataSaveBtn.addEventListener("click", function (e) {
    let store = db.transaction("datas", "readwrite").objectStore("datas");
    const orderNumber = document.getElementById("orderNumber").value;
    const orderImages = toStringList("orderImages");
    const orderBrands = toStringList("orderBrands");
    const orderProducts = toStringList("orderProducts");
    const orderOptions = toStringList("orderOptions");
    const orderPrices = toIntList("orderPrices");
    const orderName = document.getElementById("orderName").value;
    const orderAddress = document.getElementById("orderAddress").value;
    const orderPhone = document.getElementById("orderPhone").value;
    const productPrice = parseInt(document.getElementById("productPrice").value);
    const discountPrice = parseInt(document.getElementById("discountPrice").value);
    const useSaving = parseInt(document.getElementById("useSaving").value);
    const discountPercent = parseInt(document.getElementById("discountPercent").value);
    const payPrice = parseInt(document.getElementById("payPrice").value);
    const payMethod = document.getElementById("payMethod").value;
    const allDiscountPrice = parseInt(document.getElementById("allDiscountPrice").value);
    const accruedPrice = parseInt(document.getElementById("accruedPrice").value);
    const howPayment = document.getElementById("howPayment").value;
    const productNames = toStringList("productNames");
    const options = toStringList("options");
    const prices = toIntList("prices");
    const amounts = toStringList("amounts");
    let addReq = store.add({
      orderNumber: orderNumber,
      orderImages: orderImages,
      orderBrands: orderBrands,
      orderProducts: orderProducts,
      orderOptions: orderOptions,
      orderPrices: orderPrices,
      orderName: orderName,
      orderAddress: orderAddress,
      orderPhone: orderPhone,
      productPrice: productPrice,
      discountPrice: discountPrice,
      useSaving: useSaving,
      discountPercent: discountPercent,
      payPrice: payPrice,
      payMethod: payMethod,
      allDiscountPrice: allDiscountPrice,
      accruedPrice: accruedPrice,
      howPayment: howPayment,
      productNames: productNames,
      options: options,
      prices: prices,
      amounts: amounts,
    });
    addReq.addEventListener("success", function (event) {
      console.log(event.target.result);
    });
  });
}

function getOrderDatas() {
  return new Promise((resolve, reject) => {
    let store = db.transaction("datas", "readonly").objectStore("datas");
    let getAllReq = store.getAll();

    getAllReq.onsuccess = (e) => resolve(e.target.result);
    getAllReq.onerror = (e) => reject(e.target.error);
  });
}

function toIntList(elementId) {
  return document
    .getElementById(elementId)
    .value.split(",")
    .map((x) => parseInt(x.trim(), 10));
}

function toStringList(elementId) {
  return document
    .getElementById(elementId)
    .value.split(",")
    .map((x) => x.trim());
}

// 숫자를 포맷팅해서 반환
function formatPrice(num, options = { negativePrefix: false, addWon: false }) {
  let absNum = Math.abs(num);

  // 천 단위 콤마 추가
  let formatted = absNum.toLocaleString();

  // 음수 표시: negativePrefix가 true일 때만 0 제외하고 음수로 표시
  if (options.negativePrefix && num !== 0) {
    formatted = "-" + formatted;
  } else if (num < 0 && !options.negativePrefix) {
    // negativePrefix가 false이면 실제 음수만 - 표시
    formatted = "-" + formatted;
  }

  // 원 붙이기
  if (options.addWon) {
    formatted += "원";
  }

  return formatted;
}

// 주문번호를 포맷팅 변환
function formatOrderDate(orderNum) {
  const str = String(orderNum);

  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6, 8);
  const hour = str.slice(8, 10);
  const minute = str.slice(10, 12);

  // 랜덤 초 0~59
  const second = String(Math.floor(Math.random() * 60)).padStart(2, "0");

  return {
    short: `${year.slice(2)}.${month}.${day}`,
    mid: `${year}.${month}.${day} ${hour}:${minute}`,
    full: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
  };
}

// 이름 포맷팅
function formatName(name) {
  if (!name || name.length <= 2) return name; // 2글자 이하면 그대로

  const first = name[0];
  const last = name[name.length - 1];
  const middle = "*".repeat(name.length - 2);

  return first + middle + last;
}

// 주소뒤 별표시
function addStars(str) {
  // 6 ~ 12 사이의 랜덤 정수
  const count = Math.floor(Math.random() * 7) + 6;
  const stars = "*".repeat(count);
  return str + stars;
}

// 주소 포멧팅
function formatAddress(address) {
  if (!address) return "";

  const parts = address.trim().split(" ");

  // 주소가 짧거나 상세주소가 없으면 그대로 반환
  if (parts.length <= 3) return address;

  // 마지막 2단어 정도를 마스킹 대상로 설정
  const maskWordCount = Math.min(2, parts.length - 3);

  if (maskWordCount <= 0) return address;

  // 앞부분 그대로
  const visibleParts = parts.slice(0, parts.length - maskWordCount);

  // 뒷부분: 상세주소 마스킹 (공백 없이 붙이기)
  const maskedParts = parts
    .slice(parts.length - maskWordCount)
    .map((p) => "*".repeat(p.length))
    .join("");

  return [...visibleParts, maskedParts].join(" ");
}

// 전화번호 포멧팅
function formatPhoneNumber(phone) {
  if (!phone) return "";

  // 숫자만 남기기
  const digits = phone.replace(/\D/g, "");

  if (digits.length !== 11) return phone; // 11자리 아니면 그대로 반환

  const first = digits.slice(0, 3); // 010
  const middle = "****"; // 가운데 4자리 마스킹
  const last = digits.slice(7); // 마지막 4자리

  return `${first}-${middle}-${last}`;
}

// ?? 외 ? 개
function formatProductList(products) {
  if (!Array.isArray(products) || products.length === 0) return "";

  if (products.length === 1) return products[0];

  const first = products[0];
  const restCount = products.length - 1;

  return `${first} 외 ${restCount}개`;
}

// 총 결제 금액에서 부가세와 공급가 계산
function formatVAT(totalPrice) {
  if (typeof totalPrice !== "number" || totalPrice < 0) return null;

  const vatPrice = Math.round(totalPrice / 11); // 부가세 = 총액 ÷ 11
  const supplyPrice = totalPrice - vatPrice; // 공급가 = 총액 - 부가세

  return {
    supply: supplyPrice, // 공급가액
    vat: vatPrice, // 부가세
  };
}

// 카드 번호 생성
function generateMaskedCardNumber(cardCompany) {
  let firstDigits = "";

  switch (cardCompany.toLowerCase()) {
    case "visa":
      firstDigits = "4";
      break;
    case "mastercard":
      firstDigits = "5";
      break;
    case "amex":
      firstDigits = "3";
      break;
    case "discover":
      firstDigits = "6";
      break;
    default:
      firstDigits = "9"; // 기타 카드
  }

  // 나머지 앞 4자리 채우기
  while (firstDigits.length < 4) {
    firstDigits += Math.floor(Math.random() * 10);
  }

  // 뒤 4자리 생성
  let lastDigits = "";
  for (let i = 0; i < 4; i++) {
    lastDigits += Math.floor(Math.random() * 10);
  }

  // 최종 마스킹 카드번호
  const maskedCard = `${firstDigits}-****-****-${lastDigits}`;
  return maskedCard;
}

// ulr 별 요소 추가
window.onload = async () => {
  const datas = await getOrderDatas();
  if (!datas || datas.length === 0) return;
  const last = datas.length - 1;
  const data = datas[last];
  console.log(data);

  const path = window.location.pathname;

  switch (true) {
    case path.includes("order-list"):
      renderOrderList(data);
      break;

    case path.includes("order-detail"):
      renderOrderDetail(data);
      break;

    case path.includes("receipt"):
      renderReceipt(data);
      break;

    case path.includes("payment"):
      renderPayment(data);
      break;

    default:
      history.pushState({}, "", "https://www.musinsa.com/main/musinsa/recommend?gf=A");
      console.log("알 수 없는 페이지:", path);
  }
};

function renderOrderList(data) {
  const orderCard = document.querySelector(".order-card");
  if (!orderCard) return;

  // --- order-header 한 번만 추가 ---
  if (!orderCard.querySelector(".order-header")) {
    const headerHTML = `
      <div class="order-header">
        <span class="order-date">${formatOrderDate(data.orderNumber).short}</span>
        <a href="order-detail" class="order-detail">주문 상세</a>
      </div>
    `;
    orderCard.insertAdjacentHTML("beforeend", headerHTML);
  }

  // --- orderProducts 길이만큼 order-what 추가 ---
  for (let i = 0; i < data.orderProducts.length; i++) {
    const orderHTML = `
      <div class="order-what">
        <div class="about-item">
          <div class="order-status"><p>구매 확정</p></div>

          <div class="order-body">
            <img src="${data.orderImages[i]}" alt="상품 이미지" class="product-img" />
            <div class="product-info">
              <p class="product-brand">${data.orderBrands[i]}</p>
              <p class="product-name">${data.orderProducts[i]}</p>
              <p class="product-option">${data.orderOptions[i]}</p>
              <p class="product-price">${formatPrice(data.orderPrices[i], { negativePrefix: false, addWon: true })}</p>
            </div>
          </div>
        </div>

        <div class="order-buttons">
          <button class="review-btn">후기 작성 (최대 1,500원 적립)</button>
          <div class="bottom-btns">
            <button class="normal-btn">배송 조회</button>
            <button class="normal-btn">재구매</button>
          </div>
        </div>
      </div>
    `;

    orderCard.insertAdjacentHTML("beforeend", orderHTML);
  }
}

function renderOrderDetail(data) {
  const wrapper = document.querySelector(".order-detail-wrapper");
  if (!wrapper) return;

  // --- order-header 한 번만 추가 ---
  if (!wrapper.querySelector(".order-detail-header")) {
    console.log("나왔다 시발아");
    const headerHTML = `
        <div class="order-detail-header">
            <div class="order-detail-date">${formatOrderDate(data.orderNumber).short}</div>
            <div class="order-detail-order-number">주문번호 ${data.orderNumber}</div>
        </div>

        <div class="divide-line">
            <div></div>
        </div>

          <!-- 배송지 정보 -->
        <div class="order-detail-orderinfo">
            <div class="order-detail-person">${formatName(data.orderName)}</div>
            <div class="order-detail-address">${addStars(data.orderAddress)}</div>
            <div class="order-detail-number">${formatPhoneNumber(data.orderPhone)}</div>
            <div class="order-detail-horse">문 앞에 놔주세요</div>
        </div>

        <div class="divide-line">
            <div></div>
        </div>

        <div class="order-detail-product-count">주문 상품 ${data.orderProducts.length}개</div>

    `;
    wrapper.insertAdjacentHTML("beforeend", headerHTML);
  }

  // --- orderProducts 길이만큼 order-what 추가 ---
  for (let i = 0; i < data.orderProducts.length; i++) {
    const orderHTML = `
      <div class="order-detail-product">
            <div class="order-detail-product-status">구매 확정</div>
            <div class="order-detail-product-item">
              <img
                src="${data.orderImages[i]}"
                alt="상품 이미지"
              />
              <div class="order-detail-product-info">
                <div class="order-detail-seller">
                  <span class="order-detail-brand">${data.orderBrands[i]}</span>
                  <span class="order-detail-seller-info">판매자 정보</span>
                </div>
                <div class="order-detail-item">${data.orderProducts[i]}</div>
                <div class="order-detail-option">${data.orderOptions[i]}</div>
                <div class="order-detail-product-price">${formatPrice(data.orderPrices[i], {
                  negativePrefix: false,
                  addWon: true,
                })}</div>
              </div>
            </div>
            <button class="order-detail-bbtn">후기 작성 (최대 1,500원 적립)</button>
            <div class="order-detail-product-actions">
              <button class="order-detail-btn">배송 조회</button>
              <button class="order-detail-btn">재구매</button>
            </div>
          </div>
    `;

    wrapper.insertAdjacentHTML("beforeend", orderHTML);
  }

  if (!wrapper.querySelector(".order-detail-payment")) {
    const payHTML = `
                  <div class="divide-line">
            <div></div>
          </div>

          <!-- 결제 정보 -->
          <div class="order-detail-payment">
            <div class="order-detail-payment-head">
              <span>결제 정보</span>
              <div>
                <button id="receiptBtn">영수증</button>
                <button id="paymentBtn">거래명세서</button>
              </div>
            </div>

            <!-- 상품 금액 -->
            <div class="order-detail-payment-body">
              <span class="order-detail-13-reg">상품 금액</span>
              <div>
                <p class="order-detail-13-reg">${formatPrice(data.productPrice, {
                  negativePrefix: false,
                  addWon: true,
                })}</p>
              </div>
            </div>

            <!-- 할인 금액 -->
            <div class="order-detail-payment-body">
              <span class="order-detail-13-reg">할인 금액</span>
              <div class="pointter">
                <p class="order-detail-blue order-detail-13-reg">${formatPrice(data.discountPrice, {
                  negativePrefix: true,
                  addWon: true,
                })}</p>
                <img src="/static/asset/imgs/down-arrow.png" alt="" />
              </div>
            </div>

            <!-- 적립금 사용 -->
            <div class="order-detail-payment-body">
              <span class="order-detail-13-reg">적립금 사용</span>
              ${
                data.useSaving === 0
                  ? `<div>
             <p class="order-detail-black order-detail-13-reg">${formatPrice(data.useSaving, {
               negativePrefix: true,
               addWon: true,
             })}</p>
           </div>`
                  : `<div class="pointter">
             <p class="order-detail-blue order-detail-13-reg">${formatPrice(data.useSaving, {
               negativePrefix: true,
               addWon: true,
             })}</p>
             <img src="/static/asset/imgs/down-arrow.png" alt="" />
           </div>`
              }
            </div>

            <!-- 배송비 -->
            <div class="order-detail-payment-body">
              <span class="order-detail-13-reg">배송비</span>
              <div>
                <p class="order-detail-blue order-detail-13-reg">무료배송</p>
              </div>
            </div>

            <!-- 결제 금액 -->
            <div class="order-detail-payment-body-1">
              <span class="order-detail-14-bold">결제 금액</span>
              <div id="order-detail-payment-discount">
                <p class="order-detail-red order-detail-14-bold">${data.discountPercent}%</p>
                <p class="order-detail-14-bold">${formatPrice(data.payPrice, {
                  negativePrefix: false,
                  addWon: true,
                })}</p>
              </div>
            </div>

            <!-- 결제 수단 -->
            <div class="order-detail-payment-body">
              <span class="order-detail-13-reg">결제 수단</span>
              <div>
                <p class="order-detail-13-reg">${data.payMethod}</p>
              </div>
            </div>
          </div>

          <div class="divide-line">
            <div></div>
          </div>

          <!-- 혜택 정보 -->
          <div class="order-detail-benefit">
            <!-- 이번 주문으로 받은 혜택 -->
            <div class="order-detail-benefit-head">
              <div>
                이번 주문으로 받은 혜택
                <img src="/static/asset/imgs/info-icon.png" alt="" />
              </div>
            </div>

            <!-- 총 할인 금액 -->
            <div class="order-detail-payment-body">
              <span class="order-detail-13-reg">총 할인 금액</span>
              <div>
                <p class="order-detail-13-reg">${formatPrice(data.allDiscountPrice, {
                  negativePrefix: false,
                  addWon: true,
                })}</p>
              </div>
            </div>

            <!-- 배송비 -->
            <div class="order-detail-payment-body">
              <span class="order-detail-13-reg">배송비</span>
              <div>
                <p class="order-detail-13-reg">무료배송</p>
              </div>
            </div>

            <!-- 후기 적립 -->
            <div class="order-detail-payment-body">
              <span class="order-detail-13-reg">후기 적립</span>
              <div>
                <p class="order-detail-13-reg">최대 ${formatPrice(data.accruedPrice, {
                  negativePrefix: false,
                  addWon: true,
                })}</p>
              </div>
            </div>

            <!-- 총 혜택 -->
            <div class="order-detail-benefit-body">
              <span class="order-detail-14-bold">받은 총 혜택</span>
              <div id="order-detail-payment-discount">
                <p class="order-detail-blue order-detail-14-bold">
                ${formatPrice(data.allDiscountPrice + data.accruedPrice, {
                  negativePrefix: false,
                  addWon: true,
                })}</p>
              </div>
            </div>
          </div>

          <!-- 주문 삭제 -->
          <div class="order-detail-delete">
            <button>주문 내역 삭제</button>
          </div>

    `;
    wrapper.insertAdjacentHTML("beforeend", payHTML);
  }
}

function renderReceipt(data) {
  const container = document.querySelector(".receipt-container");
  if (!container) return;

  // --- order-header 한 번만 추가 ---
  if (!container.querySelector(".receipt-top")) {
    const headerHTML = `
      <div class="receipt-top">
        <p class="receipt-title">신용/체크카드 매출전표</p>
        <img src="/static/asset/imgs/chain.png" alt="" />
      </div>

      <div class="receipt-section">
        <ul class="receipt-list">
          <li><span>주문번호</span><span>${data.orderNumber}</span></li>
          <li><span>구매자</span><span>${formatName(data.orderName)}</span></li>
          <li><span>구매상품</span><span>${formatProductList(data.orderProducts)}</span></li>
        </ul>

        <ul class="receipt-list">
          <li><span>카드종류</span><span>현대카드</span></li>
          <li><span>카드번호</span><span>5588-****-****-9406</span></li>
          <li><span>할부</span><span>일시불</span></li>
          <li><span>결제상태</span><span>결제완료</span></li>
          <li><span>승인번호</span><span>00063076</span></li>
        </ul>

        <ul class="receipt-list">
          <li>
            <span>
              승인
              <div class="receipt-list-def-date">${formatOrderDate(data.orderNumber).full}</div>
            </span>
            <span>${formatPrice(data.payPrice, { negativePrefix: false, addWon: true })}</span>
          </li>
        </ul>

        <ul class="receipt-list">
          <li><span>공급가액</span><span>${formatPrice(formatVAT(data.payPrice).supply, {
            negativePrefix: false,
            addWon: true,
          })}</span></li>
          <li><span>면세가액</span><span>0원</span></li>
          <li><span>부가세</span><span>${formatPrice(formatVAT(data.payPrice).vat, {
            negativePrefix: false,
            addWon: true,
          })}</span></li>
          <li class="highlight"><span>합계</span><span>${formatPrice(data.payPrice, {
            negativePrefix: false,
            addWon: true,
          })}</span></li>
        </ul>
      </div>
    `;
    container.insertAdjacentHTML("afterbegin", headerHTML);
  }
}

function renderPayment(data) {
  const container = document.querySelector(".receipt-container");
  if (!container) return;

  // --- order-header 한 번만 추가 ---
  if (!container.querySelector(".order-header")) {
    const headerHTML = `
      <div class="receipt-title">거래명세서</div>

      <div class="receipt-list">
        <dl>
          <dt>주문 번호</dt>
          <dd>${data.orderNumber}</dd>
        </dl>
        <dl>
          <dt>주문 일자</dt>
          <dd>${formatOrderDate(data.orderNumber).mid}</dd>
        </dl>
        <dl>
          <dt>주문자</dt>
          <dd>${data.orderName}</dd>
        </dl>
        <dl>
          <dt>주문 금액</dt>
          <dd>${formatPrice(data.productPrice, { negativePrefix: false, addWon: true })}</dd>
        </dl>
        <dl>
          <dt>할인 금액</dt>
          <dd>${formatPrice(data.discountPrice, { negativePrefix: true, addWon: true })}</dd>
        </dl>
        <dl>
          <dt>결제 금액</dt>
          <dd>${formatPrice(data.payPrice, { negativePrefix: false, addWon: true })}</dd>
        </dl>
        <dl>
          <dt>결제 수단</dt>
          <dd>${data.howPayment}</dd>
        </dl>
      </div>

      <div class="divider"></div>
    `;
    container.insertAdjacentHTML("afterbegin", headerHTML);
  }

  const section = document.querySelector(".product-section");

  // --- orderProducts 길이만큼 order-what 추가 ---
  for (let i = 0; i < data.productNames.length; i++) {
    const orderHTML = `
      <div class="product-row">
          <dl>
            <dt>
              <span>${data.productNames[i]}</span>
              <span> 옵션 : ${data.options[i]}</span>
            </dt>
            <dd>
              <span>${formatPrice(data.prices[i], { negativePrefix: false, addWon: true })}</span>
              <span>수량 ${data.amounts[i]}개</span>
            </dd>
          </dl>
        </div>
    `;

    section.insertAdjacentHTML("beforeend", orderHTML);
  }
}
