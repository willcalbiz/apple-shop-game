(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function e(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(s){if(s.ep)return;s.ep=!0;const i=e(s);fetch(s.href,i)}})();const d=["👩","👨","👵","👴","🧑","👧","👦","🧓"],u=["손님","단골","관광객","학생","직장인","주부","어르신","아이"];class p{state={day:1,timeOfDay:"morning",cash:1e4,apples:0,appleCost:200,applePrice:350,transactions:[],totalRevenue:0,totalExpenses:0,reputation:3,customersServed:0,customersLost:0,shopLevel:1,dailySales:0,dailyProfit:0};customerQueue=[];nextCustomerId=1;listeners=[];getState(){return{...this.state}}getCustomerQueue(){return[...this.customerQueue]}subscribe(t){return this.listeners.push(t),()=>{this.listeners=this.listeners.filter(e=>e!==t)}}notify(){this.listeners.forEach(t=>t())}buyApples(t){const e=t*this.state.appleCost;return this.state.cash>=e?(this.state.cash-=e,this.state.apples+=t,this.state.totalExpenses+=e,this.state.transactions.push({type:"expense",category:"매입",amount:e,description:`🍎 사과 ${t}개 구매`,day:this.state.day}),this.notify(),!0):!1}setPrice(t){this.state.applePrice=Math.max(this.state.appleCost,t),this.notify()}generateCustomer(){if(this.state.apples===0||this.customerQueue.length>=5||this.state.timeOfDay!=="noon")return null;const t=Math.min(Math.floor(Math.random()*5)+1,this.state.apples),e=.8+Math.random()*.6,a=Math.floor(this.state.appleCost*e*1.5),s={id:this.nextCustomerId++,emoji:d[Math.floor(Math.random()*d.length)],name:u[Math.floor(Math.random()*u.length)],quantity:t,maxPrice:a,patience:100,mood:"happy"};return this.customerQueue.push(s),this.notify(),s}decreasePatience(){this.customerQueue.forEach(e=>{e.patience-=5,e.patience>60?e.mood="happy":e.patience>30?e.mood="neutral":e.mood="angry"}),this.customerQueue.filter(e=>e.patience<=0).forEach(()=>{this.state.customersLost++,this.state.reputation=Math.max(0,this.state.reputation-.1)}),this.customerQueue=this.customerQueue.filter(e=>e.patience>0),this.notify()}sellToCustomer(t){const e=this.customerQueue.findIndex(i=>i.id===t);if(e===-1)return{success:!1,revenue:0,message:"손님을 찾을 수 없어요"};const a=this.customerQueue[e];if(this.state.applePrice>a.maxPrice)return this.customerQueue.splice(e,1),this.state.customersLost++,this.state.reputation=Math.max(0,this.state.reputation-.05),this.notify(),{success:!1,revenue:0,message:"너무 비싸요! 😤"};const s=a.quantity*this.state.applePrice;return this.state.apples-=a.quantity,this.state.cash+=s,this.state.totalRevenue+=s,this.state.customersServed++,this.state.dailySales+=a.quantity,this.state.dailyProfit+=s-a.quantity*this.state.appleCost,this.state.applePrice<a.maxPrice*.8&&(this.state.reputation=Math.min(5,this.state.reputation+.1)),this.state.transactions.push({type:"income",category:"매출",amount:s,description:`🍎 ${a.quantity}개 판매 (@${this.state.applePrice}원)`,day:this.state.day}),this.customerQueue.splice(e,1),this.notify(),{success:!0,revenue:s,message:"고마워요! 💕"}}advanceTime(){return this.state.timeOfDay==="morning"?(this.state.timeOfDay="noon",this.notify(),{newDay:!1}):this.state.timeOfDay==="noon"?(this.state.timeOfDay="evening",this.state.customersLost+=this.customerQueue.length,this.customerQueue=[],this.notify(),{newDay:!1}):{newDay:!0,summary:this.endDay()}}endDay(){const t={day:this.state.day,sales:this.state.dailySales,revenue:this.state.transactions.filter(a=>a.day===this.state.day&&a.type==="income").reduce((a,s)=>a+s.amount,0),expenses:this.state.transactions.filter(a=>a.day===this.state.day&&a.type==="expense").reduce((a,s)=>a+s.amount,0),profit:0,customersServed:this.state.customersServed,customersLost:this.state.customersLost,spoiledApples:0,reputation:this.state.reputation};t.profit=t.revenue-t.expenses;const e=Math.floor(this.state.apples*.1);if(e>0){t.spoiledApples=e,this.state.apples-=e;const a=e*this.state.appleCost;this.state.totalExpenses+=a,this.state.transactions.push({type:"expense",category:"감모손실",amount:a,description:`🗑️ 상한 사과 ${e}개 폐기`,day:this.state.day})}return this.state.day++,this.state.timeOfDay="morning",this.state.dailySales=0,this.state.dailyProfit=0,this.state.customersServed=0,this.state.customersLost=0,this.notify(),t}upgradeShop(){const t=this.state.shopLevel*5e3;return this.state.cash>=t?(this.state.cash-=t,this.state.shopLevel++,this.state.transactions.push({type:"expense",category:"투자",amount:t,description:`🏪 가게 업그레이드 Lv.${this.state.shopLevel}`,day:this.state.day}),this.notify(),!0):!1}getTotalProfit(){return this.state.totalRevenue-this.state.totalExpenses}}const o=new p;class m{container;isPlaying=!1;constructor(){this.container=document.getElementById("app"),this.showTitleScreen()}showTitleScreen(){this.container.innerHTML=`
      <div class="title-screen">
        <div class="title-logo"></div>
        <div class="title-text">사과 가게</div>
        <div class="title-subtitle">💰 회계 시뮬레이션 💰</div>
        <button class="start-btn">🎮 시작하기</button>
        <div class="title-hint">
          <div class="title-hint-text">
            🍎 사과를 매입하고 판매하며<br>
            📊 회계의 기초를 배워보세요!
          </div>
        </div>
      </div>
    `,this.container.querySelector(".start-btn").addEventListener("click",()=>this.startGame())}startGame(){this.isPlaying=!0,this.renderGameScreen(),this.setupEventListeners(),this.startGameLoop()}renderGameScreen(){const t=o.getState(),e=o.getCustomerQueue();this.container.innerHTML=`
      <div class="game-container">
        <!-- 상단 바 -->
        <div class="top-bar">
          <div class="day-info">
            <div class="day-text">Day ${t.day}</div>
            <div class="time-badge">
              ${this.getTimeIcon(t.timeOfDay)} ${this.getTimeName(t.timeOfDay)}
            </div>
          </div>
          <div class="currency-display">
            <div class="currency-item">
              <span class="currency-icon">💰</span>
              <span class="currency-value ${this.getCashClass(t.cash)}" id="cash-display">
                ${this.formatNumber(t.cash)}원
              </span>
            </div>
            <div class="currency-item">
              <span class="currency-icon">🍎</span>
              <span class="currency-value ${this.getAppleClass(t.apples)}" id="apple-display">
                ${t.apples}개
              </span>
            </div>
          </div>
        </div>

        <!-- 게임 영역 -->
        <div class="game-area">
          <!-- 가게 -->
          <div class="shop-area">
            <div class="shop-building">
              <div class="shop-roof"></div>
              <div class="shop-body">
                <div class="shop-sign">
                  <span class="shop-sign-text">🍎 사과 가게</span>
                </div>
                <div class="display-stand" id="apple-display-stand">
                  ${this.renderApples(t.apples)}
                </div>
              </div>
              <div class="price-tag">
                <span class="price-tag-value" id="price-tag">₩${t.applePrice}</span>
              </div>
            </div>
          </div>

          <!-- 손님 대기열 -->
          <div class="customer-area">
            <div class="customer-area-label">손님 대기열</div>
            <div class="customer-queue" id="customer-queue">
              ${this.renderCustomers(e)}
            </div>
          </div>
        </div>

        <!-- 하단 액션 바 -->
        <div class="action-bar">
          <!-- 가격 조절 -->
          <div class="price-control">
            <span class="price-control-label">판매가</span>
            <button class="price-btn price-btn-minus" id="price-minus">−</button>
            <span class="price-control-value" id="price-value">₩${t.applePrice}</span>
            <button class="price-btn price-btn-plus" id="price-plus">+</button>
            <span class="price-control-label" style="color:#999;font-size:11px;">원가₩200</span>
          </div>

          <!-- 액션 버튼 -->
          <div class="action-buttons">
            <button class="action-btn action-btn-buy" id="btn-buy">
              <span class="action-btn-icon">🛒</span>
              <span class="action-btn-label">매입</span>
            </button>
            <button class="action-btn action-btn-ledger" id="btn-ledger">
              <span class="action-btn-icon">📒</span>
              <span class="action-btn-label">장부</span>
            </button>
            <button class="action-btn action-btn-upgrade" id="btn-upgrade">
              <span class="action-btn-icon">⬆️</span>
              <span class="action-btn-label">업그레이드</span>
            </button>
            <button class="action-btn action-btn-next" id="btn-next">
              <span class="action-btn-icon">⏭️</span>
              <span class="action-btn-label">다음</span>
            </button>
          </div>
        </div>
      </div>
    `}setupEventListeners(){document.getElementById("price-minus")?.addEventListener("click",()=>{const t=o.getState(),e=Math.max(200,t.applePrice-50);o.setPrice(e),this.updatePriceDisplay()}),document.getElementById("price-plus")?.addEventListener("click",()=>{const t=o.getState(),e=Math.min(1e3,t.applePrice+50);o.setPrice(e),this.updatePriceDisplay()}),document.getElementById("btn-buy")?.addEventListener("click",()=>this.showBuyModal()),document.getElementById("btn-ledger")?.addEventListener("click",()=>this.showLedgerModal()),document.getElementById("btn-upgrade")?.addEventListener("click",()=>this.showUpgradeModal()),document.getElementById("btn-next")?.addEventListener("click",()=>this.handleNext()),o.subscribe(()=>this.updateUI())}startGameLoop(){setInterval(()=>{if(!this.isPlaying)return;o.getState().timeOfDay==="noon"&&Math.random()<.3&&o.generateCustomer()},2500),setInterval(()=>{this.isPlaying&&o.decreasePatience()},1500)}updateUI(){const t=o.getState(),e=o.getCustomerQueue(),a=document.getElementById("cash-display");a&&(a.textContent=`${this.formatNumber(t.cash)}원`,a.className=`currency-value ${this.getCashClass(t.cash)}`);const s=document.getElementById("apple-display");s&&(s.textContent=`${t.apples}개`,s.className=`currency-value ${this.getAppleClass(t.apples)}`);const i=document.getElementById("apple-display-stand");i&&(i.innerHTML=this.renderApples(t.apples));const r=document.getElementById("customer-queue");r&&(r.innerHTML=this.renderCustomers(e),this.attachCustomerListeners());const n=this.container.querySelector(".day-text");n&&(n.textContent=`Day ${t.day}`);const l=this.container.querySelector(".time-badge");l&&(l.innerHTML=`${this.getTimeIcon(t.timeOfDay)} ${this.getTimeName(t.timeOfDay)}`)}updatePriceDisplay(){const t=o.getState(),e=document.getElementById("price-value");e&&(e.textContent=`₩${t.applePrice}`);const a=document.getElementById("price-tag");a&&(a.textContent=`₩${t.applePrice}`)}attachCustomerListeners(){document.querySelectorAll(".customer-card").forEach(e=>{e.addEventListener("click",()=>{const a=parseInt(e.getAttribute("data-id")||"0");this.handleCustomerSale(a)})})}handleCustomerSale(t){const e=o.sellToCustomer(t);e.success?(this.showFloatingText(`+₩${this.formatNumber(e.revenue)}`,!0),this.showCoinEffect()):this.showFloatingText(e.message,!1)}showFloatingText(t,e){const a=this.container.querySelector(".game-area");if(!a)return;const s=document.createElement("div");s.className=`floating-text ${e?"positive":"negative"}`,s.textContent=t,s.style.left="50%",s.style.top="40%",s.style.transform="translateX(-50%)",a.appendChild(s),setTimeout(()=>s.remove(),1200)}showCoinEffect(){const t=this.container.querySelector(".game-area");if(!t)return;const e=["💰","💵","✨"];for(let a=0;a<5;a++){const s=document.createElement("div");s.className="coin-particle",s.textContent=e[Math.floor(Math.random()*e.length)],s.style.left=`${40+Math.random()*20}%`,s.style.top="50%",s.style.animation=`float-up 1s ease-out ${a*.1}s forwards`,t.appendChild(s),setTimeout(()=>s.remove(),1200)}}handleNext(){const t=o.advanceTime();t.newDay&&t.summary?this.showSummaryModal(t.summary):this.updateUI()}showBuyModal(){const t=o.getState();let e=20;const a=Math.floor(t.cash/t.appleCost),s=document.createElement("div");s.className="modal-overlay",s.innerHTML=`
      <div class="modal-panel">
        <button class="modal-close">✕</button>
        <div class="modal-title">🛒 도매상 매입</div>
        
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:60px;margin-bottom:8px;">🍎</div>
          <div style="color:#666;">개당 ₩${t.appleCost}</div>
        </div>

        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px;">
          <button class="price-btn price-btn-minus" id="modal-qty-minus">−</button>
          <span id="modal-qty" style="font-family:var(--font-numbers);font-size:32px;font-weight:800;color:#E74C3C;min-width:80px;text-align:center;">${e}개</span>
          <button class="price-btn price-btn-plus" id="modal-qty-plus">+</button>
        </div>

        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:14px;color:#666;margin-bottom:4px;">합계</div>
          <div id="modal-total" style="font-family:var(--font-numbers);font-size:24px;font-weight:700;color:#333;">₩${this.formatNumber(e*t.appleCost)}</div>
        </div>

        <button id="modal-buy-btn" style="width:100%;background:linear-gradient(180deg,#22C55E 0%,#16A34A 100%);border:none;border-bottom:4px solid #15803D;border-radius:16px;padding:16px;font-family:var(--font-primary);font-size:18px;font-weight:800;color:white;cursor:pointer;">🛒 구매하기</button>
      </div>
    `,this.container.appendChild(s);const i=document.getElementById("modal-qty"),r=document.getElementById("modal-total"),n=()=>{i.textContent=`${e}개`,r.textContent=`₩${this.formatNumber(e*t.appleCost)}`};document.getElementById("modal-qty-minus")?.addEventListener("click",()=>{e=Math.max(5,e-5),n()}),document.getElementById("modal-qty-plus")?.addEventListener("click",()=>{e=Math.min(a,e+5),n()}),document.getElementById("modal-buy-btn")?.addEventListener("click",()=>{o.buyApples(e),s.remove()}),s.querySelector(".modal-close")?.addEventListener("click",()=>s.remove()),s.addEventListener("click",l=>{l.target===s&&s.remove()})}showLedgerModal(){const t=o.getState(),e=t.transactions.filter(n=>n.day===t.day),a=e.filter(n=>n.type==="income").reduce((n,l)=>n+l.amount,0),s=e.filter(n=>n.type==="expense").reduce((n,l)=>n+l.amount,0),i=a-s,r=document.createElement("div");r.className="modal-overlay",r.innerHTML=`
      <div class="modal-panel" style="max-height:80vh;overflow-y:auto;">
        <button class="modal-close">✕</button>
        <div class="modal-title">📒 장부</div>
        
        <div style="background:linear-gradient(180deg,#22C55E 0%,#16A34A 100%);border-radius:16px;padding:16px;margin-bottom:16px;text-align:center;">
          <div style="color:rgba(255,255,255,0.8);font-size:14px;margin-bottom:4px;">현금 잔고</div>
          <div style="font-family:var(--font-numbers);font-size:28px;font-weight:800;color:white;">₩${this.formatNumber(t.cash)}</div>
        </div>

        <div style="margin-bottom:16px;">
          <div style="font-weight:700;color:#8B7355;margin-bottom:8px;">📋 오늘의 거래</div>
          <div style="background:#F8F8F8;border-radius:12px;padding:12px;">
            ${e.length===0?'<div style="color:#999;text-align:center;">아직 거래가 없습니다</div>':e.slice(-5).map(n=>`
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #EEE;">
                  <span style="font-size:14px;color:#666;">${n.description}</span>
                  <span style="font-family:var(--font-numbers);font-weight:700;color:${n.type==="income"?"#22C55E":"#EF4444"};">
                    ${n.type==="income"?"+":"-"}₩${this.formatNumber(n.amount)}
                  </span>
                </div>
              `).join("")}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="background:#F0FFF4;border-radius:12px;padding:12px;text-align:center;">
            <div style="font-size:12px;color:#666;">오늘 매출</div>
            <div style="font-family:var(--font-numbers);font-size:18px;font-weight:700;color:#22C55E;">+₩${this.formatNumber(a)}</div>
          </div>
          <div style="background:#FEF2F2;border-radius:12px;padding:12px;text-align:center;">
            <div style="font-size:12px;color:#666;">오늘 비용</div>
            <div style="font-family:var(--font-numbers);font-size:18px;font-weight:700;color:#EF4444;">-₩${this.formatNumber(s)}</div>
          </div>
        </div>

        <div style="margin-top:16px;background:${i>=0?"#F0FFF4":"#FEF2F2"};border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:14px;color:#666;">오늘 순이익</div>
          <div style="font-family:var(--font-numbers);font-size:24px;font-weight:800;color:${i>=0?"#22C55E":"#EF4444"};">
            ${i>=0?"+":""}₩${this.formatNumber(i)}
          </div>
        </div>

        <div style="margin-top:16px;background:#FFF8DC;border:2px solid #DAA520;border-radius:12px;padding:12px;text-align:center;">
          <div style="font-size:13px;color:#8B7355;">💡 순이익 = 매출 - 비용</div>
        </div>
      </div>
    `,this.container.appendChild(r),r.querySelector(".modal-close")?.addEventListener("click",()=>r.remove()),r.addEventListener("click",n=>{n.target===r&&r.remove()})}showUpgradeModal(){const t=o.getState(),e=t.shopLevel*5e3,a=t.cash>=e,s=document.createElement("div");s.className="modal-overlay",s.innerHTML=`
      <div class="modal-panel">
        <button class="modal-close">✕</button>
        <div class="modal-title">⬆️ 가게 업그레이드</div>
        
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:60px;margin-bottom:8px;">🏪</div>
          <div style="font-size:18px;font-weight:700;">현재 레벨: ${t.shopLevel}</div>
        </div>

        <div style="text-align:center;margin-bottom:20px;color:#666;">
          업그레이드 비용: ₩${this.formatNumber(e)}
        </div>

        <button id="modal-upgrade-btn" style="width:100%;background:linear-gradient(180deg,${a?"#A855F7":"#CCC"} 0%,${a?"#9333EA":"#AAA"} 100%);border:none;border-bottom:4px solid ${a?"#7C3AED":"#999"};border-radius:16px;padding:16px;font-family:var(--font-primary);font-size:18px;font-weight:800;color:white;cursor:${a?"pointer":"not-allowed"};">
          ${a?"⬆️ 업그레이드!":"💸 자금 부족"}
        </button>
      </div>
    `,this.container.appendChild(s),a&&document.getElementById("modal-upgrade-btn")?.addEventListener("click",()=>{o.upgradeShop(),s.remove()}),s.querySelector(".modal-close")?.addEventListener("click",()=>s.remove()),s.addEventListener("click",i=>{i.target===s&&s.remove()})}showSummaryModal(t){const e=t.profit>=0,a=document.createElement("div");a.className="modal-overlay",a.innerHTML=`
      <div class="modal-panel summary-modal">
        <div class="summary-header">
          <div class="summary-day">Day ${t.day} 결산</div>
          <div class="summary-title">${e?"🎉 수고했어요!":"😢 힘내세요!"}</div>
        </div>

        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label">🍎 판매량</span>
            <span class="summary-value">${t.sales}개</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">💵 매출</span>
            <span class="summary-value positive">+₩${this.formatNumber(t.revenue)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">📦 비용</span>
            <span class="summary-value negative">-₩${this.formatNumber(t.expenses)}</span>
          </div>
          ${t.spoiledApples>0?`
          <div class="summary-row">
            <span class="summary-label">🗑️ 감모손실</span>
            <span class="summary-value negative">${t.spoiledApples}개</span>
          </div>
          `:""}
          <div class="summary-row">
            <span class="summary-label">👥 손님</span>
            <span class="summary-value">${t.customersServed}명 응대 / ${t.customersLost}명 이탈</span>
          </div>
        </div>

        <div class="summary-profit ${e?"":"loss"}">
          <div class="summary-profit-label">순이익</div>
          <div class="summary-profit-value">${e?"+":""}₩${this.formatNumber(t.profit)}</div>
        </div>

        <button class="summary-next-btn" id="summary-next">▶️ 다음 날로</button>
      </div>
    `,this.container.appendChild(a),e&&this.showConfetti(),document.getElementById("summary-next")?.addEventListener("click",()=>{a.remove(),this.updateUI()})}showConfetti(){const t=["🎉","✨","💰","⭐","🍎","🎊"];for(let e=0;e<20;e++){const a=document.createElement("div");a.className="confetti",a.textContent=t[Math.floor(Math.random()*t.length)],a.style.left=`${Math.random()*100}%`,a.style.animationDelay=`${Math.random()*2}s`,document.body.appendChild(a),setTimeout(()=>a.remove(),5e3)}}renderApples(t){if(t===0)return'<div style="color:#999;font-size:14px;">재고 없음</div>';const e=Math.min(t,12);let a="";for(let s=0;s<e;s++)a+='<div class="apple-item"></div>';return t>12&&(a+=`<span class="apple-count-badge">+${t-12}</span>`),a}renderCustomers(t){return t.length===0?'<div style="color:#999;font-size:14px;">손님을 기다리는 중...</div>':t.map(e=>`
      <div class="customer-card ${e.mood}" data-id="${e.id}">
        <div class="customer-avatar">${e.emoji}</div>
        <div class="customer-mood">${this.getMoodEmoji(e.mood)}</div>
        <div class="customer-order">🍎×${e.quantity}</div>
        <div class="customer-patience">
          <div class="customer-patience-bar ${this.getPatienceClass(e.patience)}" style="width:${e.patience}%"></div>
        </div>
      </div>
    `).join("")}getMoodEmoji(t){switch(t){case"happy":return"😊";case"neutral":return"😐";case"angry":return"😠";default:return"😊"}}getPatienceClass(t){return t>60?"":t>30?"warning":"danger"}getTimeIcon(t){switch(t){case"morning":return"🌅";case"noon":return"☀️";case"evening":return"🌆";default:return"☀️"}}getTimeName(t){switch(t){case"morning":return"아침 (매입)";case"noon":return"낮 (영업)";case"evening":return"저녁 (마감)";default:return""}}getCashClass(t){return t>=1e4?"positive":t>=3e3?"warning":"danger"}getAppleClass(t){return t>10?"":t>0?"warning":"danger"}formatNumber(t){return t.toLocaleString()}}new m;
