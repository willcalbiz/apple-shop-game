(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function e(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=e(a);fetch(a.href,i)}})();const v={normal:{emoji:["👩","👨","🧑","👧","👦"],name:"손님",tipChance:0,bulkChance:0},regular:{emoji:["👩‍🦰","👨‍🦱","🧓"],name:"단골",tipChance:.5,bulkChance:.2},bulk:{emoji:["👔","👩‍💼","🧑‍🍳"],name:"대량구매",tipChance:.3,bulkChance:1},picky:{emoji:["🧐","😤","🤨"],name:"까다로운 손님",tipChance:0,bulkChance:0}},p=[{type:"sunny",customerMultiplier:1.2,description:"☀️ 맑음 - 손님 많음!"},{type:"cloudy",customerMultiplier:1,description:"⛅ 흐림 - 평범한 하루"},{type:"rainy",customerMultiplier:.6,description:"🌧️ 비 - 손님 적음"}];class g{state;customerQueue=[];nextCustomerId=1;listeners=[];constructor(){this.state=this.getInitialState()}getInitialState(){return{day:1,timeOfDay:"morning",cash:1e4,apples:0,appleCost:200,applePrice:350,transactions:[],totalRevenue:0,totalExpenses:0,reputation:3,shopLevel:1,dailySales:0,dailyRevenue:0,dailyCustomersServed:0,dailyCustomersLost:0,combo:0,maxCombo:0,dailyGoal:this.generateDailyGoal(1),weather:this.generateWeather(),tutorialStep:0,tutorialCompleted:!1,bestDailyRevenue:0,totalDaysPlayed:0}}generateDailyGoal(t){const e=2e3+(t-1)*500;return{type:"revenue",target:e,current:0,reward:Math.floor(e*.2),completed:!1}}generateWeather(){const t=Math.random();return t<.5?p[0]:t<.8?p[1]:p[2]}getState(){return{...this.state}}getCustomerQueue(){return[...this.customerQueue]}subscribe(t){return this.listeners.push(t),()=>{this.listeners=this.listeners.filter(e=>e!==t)}}notify(){this.listeners.forEach(t=>t())}advanceTutorial(){this.state.tutorialStep<5?(this.state.tutorialStep++,this.notify()):(this.state.tutorialCompleted=!0,this.notify())}skipTutorial(){this.state.tutorialCompleted=!0,this.state.tutorialStep=99,this.notify()}buyApples(t){const e=t*this.state.appleCost;return this.state.cash>=e?(this.state.cash-=e,this.state.apples+=t,this.state.totalExpenses+=e,this.state.transactions.push({type:"expense",category:"매입",amount:e,description:`🍎 사과 ${t}개 구매`,day:this.state.day}),this.state.tutorialStep===1&&this.advanceTutorial(),this.notify(),!0):!1}setPrice(t){this.state.applePrice=Math.max(this.state.appleCost,Math.min(1e3,t)),this.notify()}generateCustomer(){if(this.state.apples===0||this.customerQueue.length>=5||this.state.timeOfDay!=="noon"||Math.random()>this.state.weather.customerMultiplier*.4)return null;let t="normal";const e=Math.random();this.state.reputation>=4&&e<.2?t="regular":e<.1?t="bulk":e<.15&&(t="picky");const s=v[t];let a=Math.min(Math.floor(Math.random()*4)+1,this.state.apples);t==="bulk"&&(a=Math.min(Math.floor(Math.random()*6)+5,this.state.apples));let i=1+Math.random()*.5;t==="picky"?i=.8+Math.random()*.3:t==="regular"&&(i=1.2+Math.random()*.5);const o=Math.floor(this.state.appleCost*i);let n=0;t==="regular"&&Math.random()<s.tipChance&&(n=Math.floor(a*50*Math.random()));const r={id:this.nextCustomerId++,emoji:s.emoji[Math.floor(Math.random()*s.emoji.length)],type:t,name:s.name,quantity:a,maxPrice:o,patience:100,mood:"happy",tip:n};return this.customerQueue.push(r),this.state.tutorialStep===2&&this.customerQueue.length===1&&this.advanceTutorial(),this.notify(),r}decreasePatience(){let t=!1;this.customerQueue.forEach(s=>{let a=5;s.type==="picky"&&(a=8),s.type==="regular"&&(a=3),s.patience-=a,s.patience>60?s.mood="happy":s.patience>30?s.mood="neutral":s.mood="angry"});const e=this.customerQueue.filter(s=>s.patience<=0);return e.length>0&&(t=!0,this.state.dailyCustomersLost+=e.length,this.state.reputation=Math.max(0,this.state.reputation-.1*e.length),this.state.combo=0),this.customerQueue=this.customerQueue.filter(s=>s.patience>0),this.notify(),t}sellToCustomer(t){const e=this.customerQueue.findIndex(c=>c.id===t);if(e===-1)return{success:!1,revenue:0,tip:0,combo:0,message:"손님이 없어요",isCombo:!1};const s=this.customerQueue[e];if(this.state.applePrice>s.maxPrice){this.customerQueue.splice(e,1),this.state.dailyCustomersLost++,this.state.reputation=Math.max(0,this.state.reputation-.05),this.state.combo=0,this.notify();const c=["너무 비싸요! 😤","가격이 좀...","다른 데 갈게요"];return{success:!1,revenue:0,tip:0,combo:0,message:c[Math.floor(Math.random()*c.length)],isCombo:!1}}const a=s.quantity*this.state.applePrice,i=s.tip,o=a+i;this.state.apples-=s.quantity,this.state.cash+=o,this.state.totalRevenue+=o,this.state.dailySales+=s.quantity,this.state.dailyRevenue+=o,this.state.dailyCustomersServed++,this.state.combo++;const n=this.state.combo>=2;this.state.combo>this.state.maxCombo&&(this.state.maxCombo=this.state.combo);let r=0;this.state.combo>=3&&(r=Math.floor(a*.1*(this.state.combo-2)),this.state.cash+=r,this.state.dailyRevenue+=r),this.state.applePrice<s.maxPrice*.8&&(this.state.reputation=Math.min(5,this.state.reputation+.05)),this.state.dailyGoal&&!this.state.dailyGoal.completed&&(this.state.dailyGoal.current=this.state.dailyRevenue,this.state.dailyGoal.current>=this.state.dailyGoal.target&&(this.state.dailyGoal.completed=!0,this.state.cash+=this.state.dailyGoal.reward)),this.state.transactions.push({type:"income",category:"매출",amount:o+r,description:`🍎 ${s.quantity}개 판매${i>0?" (+팁)":""}${r>0?` (+콤보 ${r}원)`:""}`,day:this.state.day}),this.customerQueue.splice(e,1),this.state.tutorialStep===3&&this.advanceTutorial(),this.notify();const d=i>0?["고마워요! 팁이에요~ 💕","맛있겠다! 팁 드릴게요!"]:["감사합니다! 😊","좋은 사과네요!","또 올게요~","잘 먹을게요!"];return{success:!0,revenue:o+r,tip:i,combo:this.state.combo,message:d[Math.floor(Math.random()*d.length)],isCombo:n}}advanceTime(){return this.state.timeOfDay==="morning"?(this.state.timeOfDay="noon",this.state.tutorialStep===1||this.state.tutorialStep===2||this.state.tutorialCompleted,this.notify(),{newDay:!1}):this.state.timeOfDay==="noon"?(this.state.timeOfDay="evening",this.state.dailyCustomersLost+=this.customerQueue.length,this.customerQueue=[],this.notify(),{newDay:!1}):{newDay:!0,summary:this.endDay()}}endDay(){const t={day:this.state.day,sales:this.state.dailySales,revenue:this.state.dailyRevenue,expenses:this.state.transactions.filter(s=>s.day===this.state.day&&s.type==="expense").reduce((s,a)=>s+a.amount,0),profit:0,customersServed:this.state.dailyCustomersServed,customersLost:this.state.dailyCustomersLost,spoiledApples:0,maxCombo:this.state.maxCombo,goalCompleted:this.state.dailyGoal?.completed||!1,goalReward:this.state.dailyGoal?.reward||0,weather:this.state.weather,isNewRecord:!1};t.profit=t.revenue-t.expenses,t.revenue>this.state.bestDailyRevenue&&(this.state.bestDailyRevenue=t.revenue,t.isNewRecord=!0);const e=Math.floor(this.state.apples*.1);if(e>0){t.spoiledApples=e,this.state.apples-=e;const s=e*this.state.appleCost;this.state.totalExpenses+=s,this.state.transactions.push({type:"expense",category:"감모손실",amount:s,description:`🗑️ 상한 사과 ${e}개 폐기`,day:this.state.day})}return this.state.day++,this.state.totalDaysPlayed++,this.state.timeOfDay="morning",this.state.dailySales=0,this.state.dailyRevenue=0,this.state.dailyCustomersServed=0,this.state.dailyCustomersLost=0,this.state.combo=0,this.state.maxCombo=0,this.state.dailyGoal=this.generateDailyGoal(this.state.day),this.state.weather=this.generateWeather(),this.state.tutorialStep>=4&&!this.state.tutorialCompleted&&(this.state.tutorialCompleted=!0),this.notify(),t}upgradeShop(){const t=this.state.shopLevel*5e3;return this.state.cash>=t?(this.state.cash-=t,this.state.shopLevel++,this.state.transactions.push({type:"expense",category:"투자",amount:t,description:`🏪 가게 업그레이드 Lv.${this.state.shopLevel}`,day:this.state.day}),this.notify(),!0):!1}getTotalProfit(){return this.state.totalRevenue-this.state.totalExpenses}reset(){this.state=this.getInitialState(),this.customerQueue=[],this.nextCustomerId=1,this.notify()}}const l=new g;class f{container;isPlaying=!1;constructor(){this.container=document.getElementById("app"),this.showTitleScreen()}showTitleScreen(){this.container.innerHTML=`
      <div class="title-screen">
        <div class="title-logo"></div>
        <div class="title-text">사과 가게</div>
        <div class="title-subtitle">💰 회계 시뮬레이션 💰</div>
        <button class="start-btn">🎮 시작하기</button>
        <div class="title-hint">
          <div class="title-hint-text">
            🍎 사과를 매입하고 판매하며<br>
            📊 회계의 기초를 배워보세요!<br>
            <small style="color:#999;">v4.0 - 튜토리얼 & 목표 시스템</small>
          </div>
        </div>
      </div>
    `,this.container.querySelector(".start-btn").addEventListener("click",()=>this.startGame())}startGame(){this.isPlaying=!0,l.reset(),this.renderGameScreen(),this.setupEventListeners(),this.startGameLoop(),setTimeout(()=>this.showTutorialStep(),500)}renderGameScreen(){const t=l.getState(),e=l.getCustomerQueue();this.container.innerHTML=`
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
                ${this.formatNumber(t.cash)}
              </span>
            </div>
            <div class="currency-item">
              <span class="currency-icon">🍎</span>
              <span class="currency-value ${this.getAppleClass(t.apples)}" id="apple-display">
                ${t.apples}
              </span>
            </div>
          </div>
        </div>

        <!-- 날씨 & 목표 바 -->
        <div class="info-bar">
          <div class="weather-badge" id="weather-badge">
            ${t.weather.description}
          </div>
          <div class="goal-badge ${t.dailyGoal?.completed?"completed":""}" id="goal-badge">
            🎯 목표: ${this.formatNumber(t.dailyGoal?.current||0)} / ${this.formatNumber(t.dailyGoal?.target||0)}원
            ${t.dailyGoal?.completed?"✅":""}
          </div>
        </div>

        <!-- 콤보 표시 -->
        <div class="combo-display ${t.combo>=2?"active":""}" id="combo-display">
          ${t.combo>=2?`🔥 ${t.combo} COMBO!`:""}
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
                  ${t.shopLevel>1?`<span class="shop-level">Lv.${t.shopLevel}</span>`:""}
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
          <div class="price-control" id="price-control">
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

        <!-- 튜토리얼 오버레이 -->
        <div class="tutorial-overlay" id="tutorial-overlay" style="display:none;"></div>
      </div>
    `}setupEventListeners(){document.getElementById("price-minus")?.addEventListener("click",()=>{const t=l.getState();l.setPrice(t.applePrice-50),this.updatePriceDisplay()}),document.getElementById("price-plus")?.addEventListener("click",()=>{const t=l.getState();l.setPrice(t.applePrice+50),this.updatePriceDisplay()}),document.getElementById("btn-buy")?.addEventListener("click",()=>this.showBuyModal()),document.getElementById("btn-ledger")?.addEventListener("click",()=>this.showLedgerModal()),document.getElementById("btn-upgrade")?.addEventListener("click",()=>this.showUpgradeModal()),document.getElementById("btn-next")?.addEventListener("click",()=>this.handleNext()),l.subscribe(()=>this.updateUI())}startGameLoop(){window.setInterval(()=>{if(!this.isPlaying)return;l.getState().timeOfDay==="noon"&&l.generateCustomer()},2500),window.setInterval(()=>{if(!this.isPlaying)return;l.getState().timeOfDay==="noon"&&l.decreasePatience()&&this.showFloatingText("손님이 떠났어요 😢",!1,"center")},1500)}showTutorialStep(){const t=l.getState();if(t.tutorialCompleted)return;const e=document.getElementById("tutorial-overlay");if(!e)return;const s=[{message:"🍎 사과 가게에 오신 걸 환영해요!<br><br>사과를 사서 팔아 돈을 벌어보세요.<br>회계의 기초를 배울 수 있어요!",highlight:null,buttonText:"시작하기"},{message:"🛒 먼저 <b>매입</b> 버튼을 눌러<br>사과를 구매하세요!<br><br>원가 200원에 사서<br>비싸게 팔면 이익이에요.",highlight:"btn-buy",buttonText:"알겠어요"},{message:"⏭️ <b>다음</b> 버튼을 눌러<br>낮(영업시간)으로 넘어가세요!<br><br>손님이 찾아올 거예요.",highlight:"btn-next",buttonText:"알겠어요"},{message:"👆 손님 카드를 <b>터치</b>하면<br>사과를 판매할 수 있어요!<br><br>손님이 떠나기 전에 빨리!",highlight:"customer-queue",buttonText:"알겠어요"},{message:"🎯 매일 <b>목표 매출</b>을 달성하면<br>보너스를 받아요!<br><br>🔥 연속 판매하면 <b>콤보 보너스</b>도!",highlight:"goal-badge",buttonText:"시작!"}],a=t.tutorialStep;if(a>=s.length){e.style.display="none",l.advanceTutorial();return}const i=s[a];if(i.highlight){const o=document.getElementById(i.highlight);o&&o.classList.add("tutorial-highlight")}e.style.display="flex",e.innerHTML=`
      <div class="tutorial-bubble">
        <div class="tutorial-message">${i.message}</div>
        <button class="tutorial-btn" id="tutorial-next">${i.buttonText}</button>
        <button class="tutorial-skip" id="tutorial-skip">튜토리얼 건너뛰기</button>
      </div>
    `,document.getElementById("tutorial-next")?.addEventListener("click",()=>{document.querySelectorAll(".tutorial-highlight").forEach(n=>{n.classList.remove("tutorial-highlight")}),l.advanceTutorial(),l.getState().tutorialStep<s.length?this.showTutorialStep():e.style.display="none"}),document.getElementById("tutorial-skip")?.addEventListener("click",()=>{document.querySelectorAll(".tutorial-highlight").forEach(o=>{o.classList.remove("tutorial-highlight")}),e.style.display="none",l.skipTutorial()})}updateUI(){const t=l.getState(),e=l.getCustomerQueue(),s=document.getElementById("cash-display");if(s){const y=parseInt(s.textContent?.replace(/[^0-9]/g,"")||"0"),m=t.cash;s.textContent=this.formatNumber(m),s.className=`currency-value ${this.getCashClass(m)}`,m>y&&(s.classList.add("bump"),setTimeout(()=>s.classList.remove("bump"),300))}const a=document.getElementById("apple-display");a&&(a.textContent=String(t.apples),a.className=`currency-value ${this.getAppleClass(t.apples)}`);const i=document.getElementById("apple-display-stand");i&&(i.innerHTML=this.renderApples(t.apples));const o=document.getElementById("customer-queue");o&&(o.innerHTML=this.renderCustomers(e),this.attachCustomerListeners());const n=this.container.querySelector(".day-text");n&&(n.textContent=`Day ${t.day}`);const r=this.container.querySelector(".time-badge");r&&(r.innerHTML=`${this.getTimeIcon(t.timeOfDay)} ${this.getTimeName(t.timeOfDay)}`);const d=document.getElementById("weather-badge");d&&(d.textContent=t.weather.description);const c=document.getElementById("goal-badge");c&&t.dailyGoal&&(c.innerHTML=`🎯 목표: ${this.formatNumber(t.dailyGoal.current)} / ${this.formatNumber(t.dailyGoal.target)}원 ${t.dailyGoal.completed?"✅":""}`,c.className=`goal-badge ${t.dailyGoal.completed?"completed":""}`);const u=document.getElementById("combo-display");u&&(t.combo>=2?(u.innerHTML=`🔥 ${t.combo} COMBO!`,u.className="combo-display active"):(u.innerHTML="",u.className="combo-display"))}updatePriceDisplay(){const t=l.getState(),e=document.getElementById("price-value");e&&(e.textContent=`₩${t.applePrice}`);const s=document.getElementById("price-tag");s&&(s.textContent=`₩${t.applePrice}`)}attachCustomerListeners(){document.querySelectorAll(".customer-card").forEach(e=>{e.addEventListener("click",()=>{const s=parseInt(e.getAttribute("data-id")||"0");this.handleCustomerSale(s)})})}handleCustomerSale(t){const e=l.sellToCustomer(t);if(e.success){let s=`+₩${this.formatNumber(e.revenue)}`;e.tip>0&&(s+=" (+팁!)"),this.showFloatingText(s,!0),this.showCoinEffect(),e.isCombo&&this.showComboEffect(e.combo),this.showCustomerMessage(e.message,!0)}else this.showFloatingText(e.message,!1),this.showCustomerMessage(e.message,!1)}showFloatingText(t,e,s="center"){const a=this.container.querySelector(".game-area");if(!a)return;const i=document.createElement("div");i.className=`floating-text ${e?"positive":"negative"}`,i.textContent=t,i.style.left="50%",i.style.top=s==="center"?"30%":"50%",i.style.transform="translateX(-50%)",a.appendChild(i),setTimeout(()=>i.remove(),1200)}showCoinEffect(){const t=this.container.querySelector(".game-area");if(!t)return;const e=["💰","💵","✨","🪙"];for(let s=0;s<6;s++){const a=document.createElement("div");a.className="coin-particle",a.textContent=e[Math.floor(Math.random()*e.length)],a.style.left=`${40+Math.random()*20}%`,a.style.top="50%",a.style.animation=`float-up 1s ease-out ${s*.08}s forwards`,t.appendChild(a),setTimeout(()=>a.remove(),1200)}}showComboEffect(t){const e=document.getElementById("combo-display");e&&(e.classList.add("pulse"),setTimeout(()=>e.classList.remove("pulse"),500))}showCustomerMessage(t,e){const s=this.container.querySelector(".customer-area");if(!s)return;const a=document.createElement("div");a.className=`customer-message ${e?"positive":"negative"}`,a.textContent=t,s.appendChild(a),setTimeout(()=>a.remove(),2e3)}handleNext(){const t=l.advanceTime();if(t.newDay&&t.summary)this.showSummaryModal(t.summary);else{this.updateUI();const e=l.getState();!e.tutorialCompleted&&e.tutorialStep===2&&e.timeOfDay==="noon"&&setTimeout(()=>this.showTutorialStep(),500)}}showBuyModal(){const t=l.getState();let e=20;const s=Math.floor(t.cash/t.appleCost),a=document.createElement("div");a.className="modal-overlay",a.innerHTML=`
      <div class="modal-panel">
        <button class="modal-close">✕</button>
        <div class="modal-title">🛒 도매상 매입</div>
        
        <div style="text-align:center;margin-bottom:20px;">
          <div class="modal-apple-icon"></div>
          <div style="color:#666;margin-top:8px;">개당 <b>₩${t.appleCost}</b></div>
        </div>

        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px;">
          <button class="price-btn price-btn-minus" id="modal-qty-minus">−</button>
          <span id="modal-qty" style="font-family:var(--font-numbers);font-size:36px;font-weight:800;color:#E74C3C;min-width:100px;text-align:center;">${e}개</span>
          <button class="price-btn price-btn-plus" id="modal-qty-plus">+</button>
        </div>

        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:14px;color:#666;margin-bottom:4px;">합계</div>
          <div id="modal-total" style="font-family:var(--font-numbers);font-size:28px;font-weight:700;color:#333;">₩${this.formatNumber(e*t.appleCost)}</div>
          <div style="font-size:12px;color:#999;margin-top:4px;">보유: ₩${this.formatNumber(t.cash)}</div>
        </div>

        <button id="modal-buy-btn" class="modal-primary-btn">🛒 구매하기</button>
      </div>
    `,this.container.appendChild(a);const i=document.getElementById("modal-qty"),o=document.getElementById("modal-total"),n=()=>{i.textContent=`${e}개`,o.textContent=`₩${this.formatNumber(e*t.appleCost)}`};document.getElementById("modal-qty-minus")?.addEventListener("click",()=>{e=Math.max(5,e-5),n()}),document.getElementById("modal-qty-plus")?.addEventListener("click",()=>{e=Math.min(s,e+5),n()}),document.getElementById("modal-buy-btn")?.addEventListener("click",()=>{l.buyApples(e),a.remove(),this.showFloatingText(`🍎 ${e}개 구매!`,!0)}),a.querySelector(".modal-close")?.addEventListener("click",()=>a.remove()),a.addEventListener("click",r=>{r.target===a&&a.remove()})}showLedgerModal(){const t=l.getState(),e=t.transactions.filter(n=>n.day===t.day),s=e.filter(n=>n.type==="income").reduce((n,r)=>n+r.amount,0),a=e.filter(n=>n.type==="expense").reduce((n,r)=>n+r.amount,0),i=s-a,o=document.createElement("div");o.className="modal-overlay",o.innerHTML=`
      <div class="modal-panel" style="max-height:85vh;overflow-y:auto;">
        <button class="modal-close">✕</button>
        <div class="modal-title">📒 장부</div>
        
        <div class="ledger-cash-card">
          <div class="ledger-cash-label">현금 잔고</div>
          <div class="ledger-cash-value">₩${this.formatNumber(t.cash)}</div>
        </div>

        <div class="ledger-section">
          <div class="ledger-section-title">📋 오늘의 거래</div>
          <div class="ledger-transactions">
            ${e.length===0?'<div class="ledger-empty">아직 거래가 없습니다</div>':e.slice(-6).map(n=>`
                <div class="ledger-tx-row">
                  <span class="ledger-tx-desc">${n.description}</span>
                  <span class="ledger-tx-amount ${n.type}">${n.type==="income"?"+":"-"}₩${this.formatNumber(n.amount)}</span>
                </div>
              `).join("")}
          </div>
        </div>

        <div class="ledger-summary">
          <div class="ledger-summary-item income">
            <div class="ledger-summary-label">오늘 매출</div>
            <div class="ledger-summary-value">+₩${this.formatNumber(s)}</div>
          </div>
          <div class="ledger-summary-item expense">
            <div class="ledger-summary-label">오늘 비용</div>
            <div class="ledger-summary-value">-₩${this.formatNumber(a)}</div>
          </div>
        </div>

        <div class="ledger-profit ${i>=0?"positive":"negative"}">
          <div class="ledger-profit-label">오늘 순이익</div>
          <div class="ledger-profit-value">${i>=0?"+":""}₩${this.formatNumber(i)}</div>
        </div>

        <div class="ledger-tip">
          💡 순이익 = 매출 - 비용
        </div>
      </div>
    `,this.container.appendChild(o),o.querySelector(".modal-close")?.addEventListener("click",()=>o.remove()),o.addEventListener("click",n=>{n.target===o&&o.remove()})}showUpgradeModal(){const t=l.getState(),e=t.shopLevel*5e3,s=t.cash>=e,a=document.createElement("div");a.className="modal-overlay",a.innerHTML=`
      <div class="modal-panel">
        <button class="modal-close">✕</button>
        <div class="modal-title">⬆️ 가게 업그레이드</div>
        
        <div style="text-align:center;margin:20px 0;">
          <div style="font-size:64px;">🏪</div>
          <div style="font-size:20px;font-weight:700;margin-top:8px;">현재 레벨: ${t.shopLevel}</div>
          <div style="color:#666;margin-top:4px;">업그레이드하면 평판이 더 빨리 올라요!</div>
        </div>

        <div style="text-align:center;margin-bottom:20px;color:#666;">
          업그레이드 비용: <b>₩${this.formatNumber(e)}</b>
        </div>

        <button class="modal-primary-btn ${s?"":"disabled"}" id="modal-upgrade-btn">
          ${s?"⬆️ 업그레이드!":"💸 자금 부족"}
        </button>
      </div>
    `,this.container.appendChild(a),s&&document.getElementById("modal-upgrade-btn")?.addEventListener("click",()=>{l.upgradeShop(),a.remove(),this.showFloatingText("🏪 업그레이드 완료!",!0)}),a.querySelector(".modal-close")?.addEventListener("click",()=>a.remove()),a.addEventListener("click",i=>{i.target===a&&a.remove()})}showSummaryModal(t){const e=t.profit>=0,s=document.createElement("div");s.className="modal-overlay",s.innerHTML=`
      <div class="modal-panel summary-modal">
        <div class="summary-header">
          <div class="summary-weather">${t.weather.description}</div>
          <div class="summary-day">Day ${t.day} 결산</div>
          <div class="summary-title">${e?"🎉 수고했어요!":"😢 힘내세요!"}</div>
          ${t.isNewRecord?'<div class="summary-record">🏆 신기록!</div>':""}
        </div>

        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label">🍎 판매량</span>
            <span class="summary-value">${t.sales}개</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">👥 손님</span>
            <span class="summary-value">${t.customersServed}명 응대 / ${t.customersLost}명 이탈</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">🔥 최대 콤보</span>
            <span class="summary-value">${t.maxCombo}x</span>
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
        </div>

        ${t.goalCompleted?`
        <div class="summary-goal-reward">
          <div>🎯 목표 달성 보너스!</div>
          <div class="summary-goal-amount">+₩${this.formatNumber(t.goalReward)}</div>
        </div>
        `:""}

        <div class="summary-profit ${e?"":"loss"}">
          <div class="summary-profit-label">순이익</div>
          <div class="summary-profit-value">${e?"+":""}₩${this.formatNumber(t.profit)}</div>
        </div>

        <button class="summary-next-btn" id="summary-next">▶️ 다음 날로</button>
      </div>
    `,this.container.appendChild(s),(e||t.goalCompleted||t.isNewRecord)&&this.showConfetti(),document.getElementById("summary-next")?.addEventListener("click",()=>{s.remove(),this.updateUI()})}showConfetti(){const t=["🎉","✨","💰","⭐","🍎","🎊","🏆"];for(let e=0;e<25;e++){const s=document.createElement("div");s.className="confetti",s.textContent=t[Math.floor(Math.random()*t.length)],s.style.left=`${Math.random()*100}%`,s.style.animationDelay=`${Math.random()*2}s`,s.style.animationDuration=`${2+Math.random()*2}s`,document.body.appendChild(s),setTimeout(()=>s.remove(),5e3)}}renderApples(t){if(t===0)return'<div class="empty-stand">재고 없음<br><small>매입 버튼을 눌러주세요</small></div>';const e=Math.min(t,12);let s="";for(let a=0;a<e;a++)s+='<div class="apple-item"></div>';return t>12&&(s+=`<span class="apple-count-badge">+${t-12}</span>`),s}renderCustomers(t){if(t.length===0){const e=l.getState();return e.timeOfDay==="noon"?'<div class="empty-queue">손님을 기다리는 중... ⏳</div>':e.timeOfDay==="morning"?'<div class="empty-queue">아침이에요! 먼저 사과를 매입하세요 🛒</div>':'<div class="empty-queue">영업 종료! 내일을 기다려요 🌙</div>'}return t.map(e=>{const s=e.type!=="normal"?`customer-${e.type}`:"",a=e.type==="regular"?'<span class="customer-type-badge regular">단골</span>':e.type==="bulk"?'<span class="customer-type-badge bulk">대량</span>':e.type==="picky"?'<span class="customer-type-badge picky">까다로움</span>':"";return`
        <div class="customer-card ${e.mood} ${s}" data-id="${e.id}">
          ${a}
          <div class="customer-avatar">${e.emoji}</div>
          <div class="customer-mood">${this.getMoodEmoji(e.mood)}</div>
          <div class="customer-order">🍎×${e.quantity}</div>
          ${e.tip>0?'<div class="customer-tip-hint">💕</div>':""}
          <div class="customer-patience">
            <div class="customer-patience-bar ${this.getPatienceClass(e.patience)}" style="width:${e.patience}%"></div>
          </div>
        </div>
      `}).join("")}getMoodEmoji(t){switch(t){case"happy":return"😊";case"neutral":return"😐";case"angry":return"😠";default:return"😊"}}getPatienceClass(t){return t>60?"":t>30?"warning":"danger"}getTimeIcon(t){switch(t){case"morning":return"🌅";case"noon":return"☀️";case"evening":return"🌆";default:return"☀️"}}getTimeName(t){switch(t){case"morning":return"아침 (매입)";case"noon":return"낮 (영업)";case"evening":return"저녁 (마감)";default:return""}}getCashClass(t){return t>=1e4?"positive":t>=3e3?"warning":"danger"}getAppleClass(t){return t>10?"":t>0?"warning":"danger"}formatNumber(t){return t.toLocaleString()}}new f;
