(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const v=[{id:"first_sale",name:"첫 판매",description:"첫 사과를 팔았어요!",icon:"🎉",reward:500},{id:"first_day",name:"첫 날 완료",description:"Day 1을 마쳤어요",icon:"📅",reward:1e3},{id:"sales_10",name:"열 개 판매",description:"총 10개 판매",icon:"🍎",reward:500},{id:"sales_50",name:"50개 돌파",description:"총 50개 판매",icon:"🍎🍎",reward:1500},{id:"sales_100",name:"백 개 판매",description:"총 100개 판매",icon:"🏆",reward:3e3},{id:"sales_500",name:"500개 돌파",description:"총 500개 판매",icon:"👑",reward:1e4},{id:"money_10k",name:"만원 달성",description:"현금 1만원 보유",icon:"💰",reward:0},{id:"money_50k",name:"5만원 달성",description:"현금 5만원 보유",icon:"💵",reward:0},{id:"money_100k",name:"10만원 달성",description:"현금 10만원 보유",icon:"💎",reward:0},{id:"combo_5",name:"5콤보!",description:"5연속 판매 달성",icon:"🔥",reward:1e3},{id:"combo_10",name:"10콤보!",description:"10연속 판매 달성",icon:"🔥🔥",reward:3e3},{id:"goals_3",name:"목표 달성자",description:"목표 3회 달성",icon:"🎯",reward:2e3},{id:"goals_7",name:"목표 달인",description:"목표 7회 달성",icon:"🏅",reward:5e3},{id:"day_7",name:"일주일 생존",description:"Day 7 도달",icon:"📆",reward:5e3},{id:"day_30",name:"한 달 생존",description:"Day 30 도달",icon:"🗓️",reward:2e4},{id:"no_loss",name:"완벽한 하루",description:"손님 이탈 0으로 하루 마감",icon:"⭐",reward:2e3},{id:"shop_lv3",name:"확장 사업",description:"가게 레벨 3 달성",icon:"🏪",reward:5e3}],y=[{id:"market_day",name:"시장의 날",description:"손님이 2배!",icon:"🎪",effect:{customerMultiplier:2}},{id:"festival",name:"축제",description:"팁이 많아요!",icon:"🎉",effect:{tipMultiplier:2}},{id:"heat_wave",name:"폭염",description:"사과가 빨리 상해요",icon:"🥵",effect:{spoilageMultiplier:2}},{id:"harvest",name:"수확철",description:"손님들이 넉넉해요",icon:"🌾",effect:{priceMultiplier:1.3}},{id:"slow_day",name:"한산한 날",description:"손님이 적어요",icon:"😴",effect:{customerMultiplier:.5}}],g={normal:{emoji:["👩","👨","🧑","👧","👦"],name:"손님",tipChance:0,bulkChance:0},regular:{emoji:["👩‍🦰","👨‍🦱","🧓"],name:"단골",tipChance:.5,bulkChance:.2},bulk:{emoji:["👔","👩‍💼","🧑‍🍳"],name:"대량구매",tipChance:.3,bulkChance:1},picky:{emoji:["🧐","😤","🤨"],name:"까다로운 손님",tipChance:0,bulkChance:0}},p=[{type:"sunny",customerMultiplier:1.2,description:"☀️ 맑음 - 손님 많음!"},{type:"cloudy",customerMultiplier:1,description:"⛅ 흐림 - 평범한 하루"},{type:"rainy",customerMultiplier:.6,description:"🌧️ 비 - 손님 적음"}];class b{state;customerQueue=[];nextCustomerId=1;listeners=[];constructor(){this.state=this.getInitialState()}getInitialState(){return{day:1,timeOfDay:"morning",cash:1e4,apples:0,appleCost:200,applePrice:350,transactions:[],totalRevenue:0,totalExpenses:0,reputation:3,shopLevel:1,dailySales:0,dailyRevenue:0,dailyCustomersServed:0,dailyCustomersLost:0,combo:0,maxCombo:0,dailyGoal:this.generateDailyGoal(1),weather:this.generateWeather(),dayEvent:null,tutorialStep:0,tutorialCompleted:!1,bestDailyRevenue:0,totalDaysPlayed:0,gameSpeed:1,achievements:v.map(e=>({...e,unlocked:!1})),totalSales:0,goalsCompleted:0,newAchievements:[]}}generateDailyGoal(e){const t=2e3+(e-1)*500;return{type:"revenue",target:t,current:0,reward:Math.floor(t*.2),completed:!1}}generateWeather(){const e=Math.random();return e<.5?p[0]:e<.8?p[1]:p[2]}generateDayEvent(e){return e<3||Math.random()>.25?null:y[Math.floor(Math.random()*y.length)]}getState(){return{...this.state}}getCustomerQueue(){return[...this.customerQueue]}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){this.listeners.forEach(e=>e())}advanceTutorial(){this.state.tutorialStep<5?(this.state.tutorialStep++,this.notify()):(this.state.tutorialCompleted=!0,this.notify())}skipTutorial(){this.state.tutorialCompleted=!0,this.state.tutorialStep=99,this.notify()}setGameSpeed(e){this.state.gameSpeed=e,this.notify()}cycleGameSpeed(){const e=[1,2,3],t=e.indexOf(this.state.gameSpeed);this.state.gameSpeed=e[(t+1)%3],this.notify()}checkAchievements(){this.state.newAchievements=[];const e=t=>{const a=this.state.achievements.find(s=>s.id===t);a&&!a.unlocked&&(a.unlocked=!0,a.unlockedAt=this.state.day,this.state.cash+=a.reward,this.state.newAchievements.push(t))};this.state.totalSales>=1&&e("first_sale"),this.state.totalSales>=10&&e("sales_10"),this.state.totalSales>=50&&e("sales_50"),this.state.totalSales>=100&&e("sales_100"),this.state.totalSales>=500&&e("sales_500"),this.state.cash>=1e4&&e("money_10k"),this.state.cash>=5e4&&e("money_50k"),this.state.cash>=1e5&&e("money_100k"),this.state.maxCombo>=5&&e("combo_5"),this.state.maxCombo>=10&&e("combo_10"),this.state.goalsCompleted>=3&&e("goals_3"),this.state.goalsCompleted>=7&&e("goals_7"),this.state.day>=7&&e("day_7"),this.state.day>=30&&e("day_30"),this.state.shopLevel>=3&&e("shop_lv3")}getNewAchievements(){return this.state.achievements.filter(e=>this.state.newAchievements.includes(e.id))}clearNewAchievements(){this.state.newAchievements=[]}buyApples(e){const t=e*this.state.appleCost;return this.state.cash>=t?(this.state.cash-=t,this.state.apples+=e,this.state.totalExpenses+=t,this.state.transactions.push({type:"expense",category:"매입",amount:t,description:`🍎 사과 ${e}개 구매`,day:this.state.day}),this.state.tutorialStep===1&&this.advanceTutorial(),this.notify(),!0):!1}setPrice(e){this.state.applePrice=Math.max(this.state.appleCost,Math.min(1e3,e)),this.notify()}generateCustomer(){if(this.state.apples===0||this.customerQueue.length>=5||this.state.timeOfDay!=="noon")return null;let e=this.state.weather.customerMultiplier;if(this.state.dayEvent?.effect.customerMultiplier&&(e*=this.state.dayEvent.effect.customerMultiplier),Math.random()>e*.4)return null;let t="normal";const a=Math.random();this.state.reputation>=4&&a<.2?t="regular":a<.1?t="bulk":a<.15&&(t="picky");const s=g[t];let i=Math.min(Math.floor(Math.random()*4)+1,this.state.apples);t==="bulk"&&(i=Math.min(Math.floor(Math.random()*6)+5,this.state.apples));let n=1+Math.random()*.5;t==="picky"?n=.8+Math.random()*.3:t==="regular"&&(n=1.2+Math.random()*.5),this.state.dayEvent?.effect.priceMultiplier&&(n*=this.state.dayEvent.effect.priceMultiplier);const l=Math.floor(this.state.appleCost*n);let r=0,d=s.tipChance;this.state.dayEvent?.effect.tipMultiplier&&(d*=this.state.dayEvent.effect.tipMultiplier),t==="regular"&&Math.random()<d?r=Math.floor(i*50*Math.random()):this.state.dayEvent?.effect.tipMultiplier&&Math.random()<.2&&(r=Math.floor(i*30*Math.random()));const c={id:this.nextCustomerId++,emoji:s.emoji[Math.floor(Math.random()*s.emoji.length)],type:t,name:s.name,quantity:i,maxPrice:l,patience:100,mood:"happy",tip:r};return this.customerQueue.push(c),this.state.tutorialStep===2&&this.customerQueue.length===1&&this.advanceTutorial(),this.notify(),c}decreasePatience(){let e=!1;this.customerQueue.forEach(a=>{let s=5;a.type==="picky"&&(s=8),a.type==="regular"&&(s=3),a.patience-=s,a.patience>60?a.mood="happy":a.patience>30?a.mood="neutral":a.mood="angry"});const t=this.customerQueue.filter(a=>a.patience<=0);return t.length>0&&(e=!0,this.state.dailyCustomersLost+=t.length,this.state.reputation=Math.max(0,this.state.reputation-.1*t.length),this.state.combo=0),this.customerQueue=this.customerQueue.filter(a=>a.patience>0),this.notify(),e}sellToCustomer(e){const t=this.customerQueue.findIndex(c=>c.id===e);if(t===-1)return{success:!1,revenue:0,tip:0,combo:0,message:"손님이 없어요",isCombo:!1};const a=this.customerQueue[t];if(this.state.applePrice>a.maxPrice){this.customerQueue.splice(t,1),this.state.dailyCustomersLost++,this.state.reputation=Math.max(0,this.state.reputation-.05),this.state.combo=0,this.notify();const c=["너무 비싸요! 😤","가격이 좀...","다른 데 갈게요"];return{success:!1,revenue:0,tip:0,combo:0,message:c[Math.floor(Math.random()*c.length)],isCombo:!1}}const s=a.quantity*this.state.applePrice,i=a.tip,n=s+i;this.state.apples-=a.quantity,this.state.cash+=n,this.state.totalRevenue+=n,this.state.dailySales+=a.quantity,this.state.totalSales+=a.quantity,this.state.dailyRevenue+=n,this.state.dailyCustomersServed++,this.state.combo++;const l=this.state.combo>=2;this.state.combo>this.state.maxCombo&&(this.state.maxCombo=this.state.combo);let r=0;this.state.combo>=3&&(r=Math.floor(s*.1*(this.state.combo-2)),this.state.cash+=r,this.state.dailyRevenue+=r),this.state.applePrice<a.maxPrice*.8&&(this.state.reputation=Math.min(5,this.state.reputation+.05)),this.state.dailyGoal&&!this.state.dailyGoal.completed&&(this.state.dailyGoal.current=this.state.dailyRevenue,this.state.dailyGoal.current>=this.state.dailyGoal.target&&(this.state.dailyGoal.completed=!0,this.state.cash+=this.state.dailyGoal.reward)),this.state.transactions.push({type:"income",category:"매출",amount:n+r,description:`🍎 ${a.quantity}개 판매${i>0?" (+팁)":""}${r>0?` (+콤보 ${r}원)`:""}`,day:this.state.day}),this.customerQueue.splice(t,1),this.state.tutorialStep===3&&this.advanceTutorial(),this.checkAchievements(),this.notify();const d=i>0?["고마워요! 팁이에요~ 💕","맛있겠다! 팁 드릴게요!"]:["감사합니다! 😊","좋은 사과네요!","또 올게요~","잘 먹을게요!"];return{success:!0,revenue:n+r,tip:i,combo:this.state.combo,message:d[Math.floor(Math.random()*d.length)],isCombo:l}}advanceTime(){return this.state.timeOfDay==="morning"?(this.state.timeOfDay="noon",this.state.tutorialStep===1||this.state.tutorialStep===2||this.state.tutorialCompleted,this.notify(),{newDay:!1}):this.state.timeOfDay==="noon"?(this.state.timeOfDay="evening",this.state.dailyCustomersLost+=this.customerQueue.length,this.customerQueue=[],this.notify(),{newDay:!1}):{newDay:!0,summary:this.endDay()}}endDay(){const e={day:this.state.day,sales:this.state.dailySales,revenue:this.state.dailyRevenue,expenses:this.state.transactions.filter(s=>s.day===this.state.day&&s.type==="expense").reduce((s,i)=>s+i.amount,0),profit:0,customersServed:this.state.dailyCustomersServed,customersLost:this.state.dailyCustomersLost,spoiledApples:0,maxCombo:this.state.maxCombo,goalCompleted:this.state.dailyGoal?.completed||!1,goalReward:this.state.dailyGoal?.reward||0,weather:this.state.weather,isNewRecord:!1};if(e.profit=e.revenue-e.expenses,e.revenue>this.state.bestDailyRevenue&&(this.state.bestDailyRevenue=e.revenue,e.isNewRecord=!0),e.goalCompleted&&this.state.goalsCompleted++,e.customersLost===0&&e.customersServed>0){const s=this.state.achievements.find(i=>i.id==="no_loss");s&&!s.unlocked&&(s.unlocked=!0,s.unlockedAt=this.state.day,this.state.cash+=s.reward,this.state.newAchievements.push("no_loss"))}if(this.state.day===1){const s=this.state.achievements.find(i=>i.id==="first_day");s&&!s.unlocked&&(s.unlocked=!0,s.unlockedAt=1,this.state.cash+=s.reward,this.state.newAchievements.push("first_day"))}let t=.1;e.weather.type==="rainy"&&(t=.05),this.state.dayEvent?.effect.spoilageMultiplier&&(t*=this.state.dayEvent.effect.spoilageMultiplier);const a=Math.floor(this.state.apples*t);if(a>0){e.spoiledApples=a,this.state.apples-=a;const s=a*this.state.appleCost;this.state.totalExpenses+=s,this.state.transactions.push({type:"expense",category:"감모손실",amount:s,description:`🗑️ 상한 사과 ${a}개 폐기`,day:this.state.day})}return this.state.day++,this.state.totalDaysPlayed++,this.state.timeOfDay="morning",this.state.dailySales=0,this.state.dailyRevenue=0,this.state.dailyCustomersServed=0,this.state.dailyCustomersLost=0,this.state.combo=0,this.state.maxCombo=0,this.state.dailyGoal=this.generateDailyGoal(this.state.day),this.state.weather=this.generateWeather(),this.state.dayEvent=this.generateDayEvent(this.state.day),this.state.tutorialStep>=4&&!this.state.tutorialCompleted&&(this.state.tutorialCompleted=!0),this.autoSave(),this.notify(),e}upgradeShop(){const e=this.state.shopLevel*5e3;return this.state.cash>=e?(this.state.cash-=e,this.state.shopLevel++,this.state.transactions.push({type:"expense",category:"투자",amount:e,description:`🏪 가게 업그레이드 Lv.${this.state.shopLevel}`,day:this.state.day}),this.notify(),!0):!1}getTotalProfit(){return this.state.totalRevenue-this.state.totalExpenses}reset(){this.state=this.getInitialState(),this.customerQueue=[],this.nextCustomerId=1,this.notify()}save(){const e={state:this.state,nextCustomerId:this.nextCustomerId,savedAt:Date.now()};localStorage.setItem("apple-shop-save",JSON.stringify(e))}load(){const e=localStorage.getItem("apple-shop-save");if(!e)return!1;try{const t=JSON.parse(e),a=this.getInitialState();return this.state={...a,...t.state},this.state.achievements=v.map(s=>{const i=t.state.achievements?.find(n=>n.id===s.id);return i?{...s,unlocked:i.unlocked,unlockedAt:i.unlockedAt}:{...s,unlocked:!1}}),this.nextCustomerId=t.nextCustomerId||1,this.customerQueue=[],this.state.timeOfDay="morning",this.state.newAchievements=[],this.notify(),!0}catch(t){return console.error("Failed to load save:",t),!1}}deleteSave(){localStorage.removeItem("apple-shop-save")}hasSave(){return localStorage.getItem("apple-shop-save")!==null}autoSave(){this.save()}}const o=new b;class C{container;isPlaying=!1;constructor(){this.container=document.getElementById("app"),this.showTitleScreen()}showTitleScreen(){const e=o.hasSave(),t=Array.from({length:15},()=>{const a=Math.random()*100,s=Math.random()*5,i=4+Math.random()*3,n=["🍎","🍏","✨","💰"][Math.floor(Math.random()*4)];return`<span class="falling-apple" style="left:${a}%;animation-delay:${s}s;animation-duration:${i}s;">${n}</span>`}).join("");this.container.innerHTML=`
      <div class="title-screen">
        <div class="falling-apples">${t}</div>
        <div class="title-logo"><div class="highlight"></div></div>
        <div class="title-text">사과 가게</div>
        <div class="title-subtitle">✨ 회계 시뮬레이션 ✨</div>
        ${e?`
          <button class="start-btn continue-btn">▶️ 이어하기</button>
          <button class="start-btn new-btn">🆕 새 게임</button>
        `:`
          <button class="start-btn">🎮 시작하기</button>
        `}
        <div class="title-hint">
          <div class="title-hint-text">
            🍎 사과를 매입하고 판매하며<br>
            📊 회계의 기초를 배워보세요!<br>
            <small>v4.3 - Premium Edition</small>
          </div>
        </div>
      </div>
    `,e?(this.container.querySelector(".continue-btn")?.addEventListener("click",()=>{o.load(),this.startGame(!0)}),this.container.querySelector(".new-btn")?.addEventListener("click",()=>{confirm("저장된 게임을 삭제하고 새로 시작할까요?")&&(o.deleteSave(),this.startGame())})):this.container.querySelector(".start-btn")?.addEventListener("click",()=>this.startGame())}startGame(e=!1){if(this.isPlaying=!0,e||o.reset(),this.renderGameScreen(),this.setupEventListeners(),this.startGameLoop(),e||setTimeout(()=>this.showTutorialStep(),500),e){const t=o.getState();t.dayEvent&&setTimeout(()=>this.showEventPopup(t.dayEvent),300)}}renderGameScreen(){const e=o.getState(),t=o.getCustomerQueue();this.container.innerHTML=`
      <div class="game-container">
        <!-- 상단 바 -->
        <div class="top-bar">
          <div class="day-info">
            <div class="day-text">Day ${e.day}</div>
            <div class="time-badge">
              ${this.getTimeIcon(e.timeOfDay)} ${this.getTimeName(e.timeOfDay)}
            </div>
          </div>
          <div class="currency-display">
            <div class="currency-item">
              <span class="currency-icon">💰</span>
              <span class="currency-value ${this.getCashClass(e.cash)}" id="cash-display">
                ${this.formatNumber(e.cash)}
              </span>
            </div>
            <div class="currency-item">
              <span class="currency-icon">🍎</span>
              <span class="currency-value ${this.getAppleClass(e.apples)}" id="apple-display">
                ${e.apples}
              </span>
            </div>
          </div>
        </div>

        <!-- 날씨 & 이벤트 & 목표 바 -->
        <div class="info-bar">
          <div class="weather-badge" id="weather-badge">
            ${e.weather.description}
          </div>
          ${e.dayEvent?`
            <div class="event-badge" id="event-badge">
              ${e.dayEvent.icon} ${e.dayEvent.name}
            </div>
          `:""}
          <div class="goal-badge ${e.dailyGoal?.completed?"completed":""}" id="goal-badge">
            🎯 목표: ${this.formatNumber(e.dailyGoal?.current||0)} / ${this.formatNumber(e.dailyGoal?.target||0)}원
            ${e.dailyGoal?.completed?"✅":""}
          </div>
        </div>

        <!-- 콤보 표시 -->
        <div class="combo-display ${e.combo>=2?"active":""}" id="combo-display">
          ${e.combo>=2?`🔥 ${e.combo} COMBO!`:""}
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
                  ${e.shopLevel>1?`<span class="shop-level">Lv.${e.shopLevel}</span>`:""}
                </div>
                <div class="display-stand" id="apple-display-stand">
                  ${this.renderApples(e.apples)}
                </div>
              </div>
              <div class="price-tag">
                <span class="price-tag-value" id="price-tag">₩${e.applePrice}</span>
              </div>
            </div>
          </div>

          <!-- 손님 대기열 -->
          <div class="customer-area">
            <div class="customer-area-label">손님 대기열</div>
            <div class="customer-queue" id="customer-queue">
              ${this.renderCustomers(t)}
            </div>
          </div>
        </div>

        <!-- 하단 액션 바 -->
        <div class="action-bar">
          <!-- 가격 조절 -->
          <div class="price-control" id="price-control">
            <span class="price-control-label">판매가</span>
            <button class="price-btn price-btn-minus" id="price-minus">−</button>
            <span class="price-control-value" id="price-value">₩${e.applePrice}</span>
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
            <button class="action-btn action-btn-achieve" id="btn-achieve">
              <span class="action-btn-icon">🏆</span>
              <span class="action-btn-label">업적</span>
            </button>
            <button class="action-btn action-btn-next" id="btn-next">
              <span class="action-btn-icon">⏭️</span>
              <span class="action-btn-label">다음</span>
            </button>
            <button class="action-btn action-btn-speed" id="btn-speed">
              <span class="action-btn-icon" id="speed-icon">▶️</span>
              <span class="action-btn-label" id="speed-label">1x</span>
            </button>
          </div>
        </div>

        <!-- 튜토리얼 오버레이 -->
        <div class="tutorial-overlay" id="tutorial-overlay" style="display:none;"></div>
      </div>
    `}setupEventListeners(){document.getElementById("price-minus")?.addEventListener("click",()=>{const e=o.getState();o.setPrice(e.applePrice-50),this.updatePriceDisplay()}),document.getElementById("price-plus")?.addEventListener("click",()=>{const e=o.getState();o.setPrice(e.applePrice+50),this.updatePriceDisplay()}),document.getElementById("btn-buy")?.addEventListener("click",()=>this.showBuyModal()),document.getElementById("btn-ledger")?.addEventListener("click",()=>this.showLedgerModal()),document.getElementById("btn-upgrade")?.addEventListener("click",()=>this.showUpgradeModal()),document.getElementById("btn-achieve")?.addEventListener("click",()=>this.showAchievementModal()),document.getElementById("btn-next")?.addEventListener("click",()=>this.handleNext()),document.getElementById("btn-speed")?.addEventListener("click",()=>this.handleSpeedChange()),o.subscribe(()=>this.updateUI())}customerTimer=null;patienceTimer=null;startGameLoop(){this.scheduleCustomerGeneration(),this.schedulePatienceDecrease()}getSpeedMultiplier(){return o.getState().gameSpeed}scheduleCustomerGeneration(){this.customerTimer&&clearTimeout(this.customerTimer);const t=2500/this.getSpeedMultiplier();this.customerTimer=setTimeout(()=>{this.isPlaying&&o.getState().timeOfDay==="noon"&&o.generateCustomer(),this.scheduleCustomerGeneration()},t)}schedulePatienceDecrease(){this.patienceTimer&&clearTimeout(this.patienceTimer);const t=1500/this.getSpeedMultiplier();this.patienceTimer=setTimeout(()=>{this.isPlaying&&o.getState().timeOfDay==="noon"&&o.decreasePatience()&&this.showFloatingText("손님이 떠났어요 😢",!1,"center"),this.schedulePatienceDecrease()},t)}handleSpeedChange(){o.cycleGameSpeed(),this.updateSpeedUI(),this.scheduleCustomerGeneration(),this.schedulePatienceDecrease()}updateSpeedUI(){const e=o.getState(),t=document.getElementById("speed-icon"),a=document.getElementById("speed-label");if(t&&a){const s={1:"▶️",2:"⏩",3:"⏭️"};t.textContent=s[e.gameSpeed],a.textContent=`${e.gameSpeed}x`}}showTutorialStep(){const e=o.getState();if(e.tutorialCompleted)return;const t=document.getElementById("tutorial-overlay");if(!t)return;const a=[{message:"🍎 사과 가게에 오신 걸 환영해요!<br><br>사과를 사서 팔아 돈을 벌어보세요.<br>회계의 기초를 배울 수 있어요!",highlight:null,buttonText:"시작하기"},{message:"🛒 먼저 <b>매입</b> 버튼을 눌러<br>사과를 구매하세요!<br><br>원가 200원에 사서<br>비싸게 팔면 이익이에요.",highlight:"btn-buy",buttonText:"알겠어요"},{message:"⏭️ <b>다음</b> 버튼을 눌러<br>낮(영업시간)으로 넘어가세요!<br><br>손님이 찾아올 거예요.",highlight:"btn-next",buttonText:"알겠어요"},{message:"👆 손님 카드를 <b>터치</b>하면<br>사과를 판매할 수 있어요!<br><br>손님이 떠나기 전에 빨리!",highlight:"customer-queue",buttonText:"알겠어요"},{message:"🎯 매일 <b>목표 매출</b>을 달성하면<br>보너스를 받아요!<br><br>🔥 연속 판매하면 <b>콤보 보너스</b>도!",highlight:"goal-badge",buttonText:"시작!"}],s=e.tutorialStep;if(s>=a.length){t.style.display="none",o.advanceTutorial();return}const i=a[s];if(i.highlight){const n=document.getElementById(i.highlight);n&&n.classList.add("tutorial-highlight")}t.style.display="flex",t.innerHTML=`
      <div class="tutorial-bubble">
        <div class="tutorial-message">${i.message}</div>
        <button class="tutorial-btn" id="tutorial-next">${i.buttonText}</button>
        <button class="tutorial-skip" id="tutorial-skip">튜토리얼 건너뛰기</button>
      </div>
    `,document.getElementById("tutorial-next")?.addEventListener("click",()=>{document.querySelectorAll(".tutorial-highlight").forEach(l=>{l.classList.remove("tutorial-highlight")}),o.advanceTutorial(),o.getState().tutorialStep<a.length?this.showTutorialStep():t.style.display="none"}),document.getElementById("tutorial-skip")?.addEventListener("click",()=>{document.querySelectorAll(".tutorial-highlight").forEach(n=>{n.classList.remove("tutorial-highlight")}),t.style.display="none",o.skipTutorial()})}updateUI(){const e=o.getState(),t=o.getCustomerQueue(),a=document.getElementById("cash-display");if(a){const f=parseInt(a.textContent?.replace(/[^0-9]/g,"")||"0"),u=e.cash;a.textContent=this.formatNumber(u),a.className=`currency-value ${this.getCashClass(u)}`,u>f&&(a.classList.add("bump"),setTimeout(()=>a.classList.remove("bump"),300))}const s=document.getElementById("apple-display");s&&(s.textContent=String(e.apples),s.className=`currency-value ${this.getAppleClass(e.apples)}`);const i=document.getElementById("apple-display-stand");i&&(i.innerHTML=this.renderApples(e.apples));const n=document.getElementById("customer-queue");n&&(n.innerHTML=this.renderCustomers(t),this.attachCustomerListeners());const l=this.container.querySelector(".day-text");l&&(l.textContent=`Day ${e.day}`);const r=this.container.querySelector(".time-badge");r&&(r.innerHTML=`${this.getTimeIcon(e.timeOfDay)} ${this.getTimeName(e.timeOfDay)}`);const d=document.getElementById("weather-badge");d&&(d.textContent=e.weather.description);const c=document.getElementById("goal-badge");c&&e.dailyGoal&&(c.innerHTML=`🎯 목표: ${this.formatNumber(e.dailyGoal.current)} / ${this.formatNumber(e.dailyGoal.target)}원 ${e.dailyGoal.completed?"✅":""}`,c.className=`goal-badge ${e.dailyGoal.completed?"completed":""}`);const m=document.getElementById("combo-display");m&&(e.combo>=2?(m.innerHTML=`🔥 ${e.combo} COMBO!`,m.className="combo-display active"):(m.innerHTML="",m.className="combo-display"))}updatePriceDisplay(){const e=o.getState(),t=document.getElementById("price-value");t&&(t.textContent=`₩${e.applePrice}`);const a=document.getElementById("price-tag");a&&(a.textContent=`₩${e.applePrice}`)}attachCustomerListeners(){document.querySelectorAll(".customer-card").forEach(t=>{t.addEventListener("click",()=>{const a=parseInt(t.getAttribute("data-id")||"0");this.handleCustomerSale(a)})})}handleCustomerSale(e){const t=o.sellToCustomer(e);if(t.success){let a=`+₩${this.formatNumber(t.revenue)}`;t.tip>0&&(a+=" (+팁!)"),this.showFloatingText(a,!0),this.showCoinEffect(),t.isCombo&&this.showComboEffect(t.combo),this.showCustomerMessage(t.message,!0),this.checkNewAchievements()}else this.showFloatingText(t.message,!1),this.showCustomerMessage(t.message,!1)}checkNewAchievements(){const e=o.getNewAchievements();e.length>0&&(e.forEach((t,a)=>{setTimeout(()=>this.showAchievementUnlock(t),a*1500)}),o.clearNewAchievements())}showEventPopup(e){const t=document.createElement("div");t.className="event-popup",t.innerHTML=`
      <div class="event-popup-icon">${e.icon}</div>
      <div class="event-popup-name">${e.name}</div>
      <div class="event-popup-desc">${e.description}</div>
      <button class="event-popup-close">확인</button>
    `,this.container.appendChild(t),setTimeout(()=>t.classList.add("show"),10),t.querySelector(".event-popup-close")?.addEventListener("click",()=>{t.classList.remove("show"),setTimeout(()=>t.remove(),400)})}showAchievementUnlock(e){const t=document.createElement("div");t.className="achievement-popup",t.innerHTML=`
      <div class="achievement-popup-icon">${e.icon}</div>
      <div class="achievement-popup-content">
        <div class="achievement-popup-title">업적 달성!</div>
        <div class="achievement-popup-name">${e.name}</div>
        ${e.reward>0?`<div class="achievement-popup-reward">+₩${this.formatNumber(e.reward)}</div>`:""}
      </div>
    `,this.container.appendChild(t),setTimeout(()=>t.classList.add("show"),10),setTimeout(()=>{t.classList.remove("show"),setTimeout(()=>t.remove(),500)},3e3)}showFloatingText(e,t,a="center"){const s=this.container.querySelector(".game-area");if(!s)return;const i=document.createElement("div");i.className=`floating-text ${t?"positive":"negative"}`,i.textContent=e,i.style.left="50%",i.style.top=a==="center"?"30%":"50%",i.style.transform="translateX(-50%)",s.appendChild(i),setTimeout(()=>i.remove(),1200)}showCoinEffect(){const e=document.createElement("div");e.className="sale-burst",e.innerHTML='<div class="sale-burst-ring"></div><div class="sale-burst-ring" style="animation-delay:0.1s;border-color:#FF6B6B;"></div>',document.body.appendChild(e),setTimeout(()=>e.remove(),1e3);const t=document.createElement("div");t.className="sale-coins",t.style.top="50%",t.style.left="50%";const a=["💰","💵","✨","🪙","💎"];for(let s=0;s<12;s++){const i=document.createElement("span");i.className="sale-coin",i.textContent=a[Math.floor(Math.random()*a.length)];const n=s/12*Math.PI*2,l=80+Math.random()*60;i.style.setProperty("--tx",`${Math.cos(n)*l}px`),i.style.setProperty("--ty",`${Math.sin(n)*l}px`),i.style.animationDelay=`${s*.03}s`,t.appendChild(i)}document.body.appendChild(t),setTimeout(()=>t.remove(),1200)}showComboEffect(e){const t=document.createElement("div");if(t.className="combo-flash",document.body.appendChild(t),setTimeout(()=>t.remove(),500),e>=3){const s=document.createElement("div");s.className="combo-big",s.textContent=`${e}x COMBO!`,document.body.appendChild(s),setTimeout(()=>s.remove(),1e3)}const a=document.getElementById("combo-display");a&&(a.classList.add("pulse"),setTimeout(()=>a.classList.remove("pulse"),500))}showCustomerMessage(e,t){const a=this.container.querySelector(".customer-area");if(!a)return;const s=document.createElement("div");s.className=`customer-message ${t?"positive":"negative"}`,s.textContent=e,a.appendChild(s),setTimeout(()=>s.remove(),2e3)}handleNext(){const e=o.advanceTime();if(e.newDay&&e.summary)setTimeout(()=>this.checkNewAchievements(),500),this.showSummaryModal(e.summary);else{this.updateUI();const t=o.getState();!t.tutorialCompleted&&t.tutorialStep===2&&t.timeOfDay==="noon"&&setTimeout(()=>this.showTutorialStep(),500)}}showBuyModal(){const e=o.getState();let t=20;const a=Math.floor(e.cash/e.appleCost),s=document.createElement("div");s.className="modal-overlay",s.innerHTML=`
      <div class="modal-panel">
        <button class="modal-close">✕</button>
        <div class="modal-title">🛒 도매상 매입</div>
        
        <div style="text-align:center;margin-bottom:20px;">
          <div class="modal-apple-icon"></div>
          <div style="color:#666;margin-top:8px;">개당 <b>₩${e.appleCost}</b></div>
        </div>

        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px;">
          <button class="price-btn price-btn-minus" id="modal-qty-minus">−</button>
          <span id="modal-qty" style="font-family:var(--font-numbers);font-size:36px;font-weight:800;color:#E74C3C;min-width:100px;text-align:center;">${t}개</span>
          <button class="price-btn price-btn-plus" id="modal-qty-plus">+</button>
        </div>

        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:14px;color:#666;margin-bottom:4px;">합계</div>
          <div id="modal-total" style="font-family:var(--font-numbers);font-size:28px;font-weight:700;color:#333;">₩${this.formatNumber(t*e.appleCost)}</div>
          <div style="font-size:12px;color:#999;margin-top:4px;">보유: ₩${this.formatNumber(e.cash)}</div>
        </div>

        <button id="modal-buy-btn" class="modal-primary-btn">🛒 구매하기</button>
      </div>
    `,this.container.appendChild(s);const i=document.getElementById("modal-qty"),n=document.getElementById("modal-total"),l=()=>{i.textContent=`${t}개`,n.textContent=`₩${this.formatNumber(t*e.appleCost)}`};document.getElementById("modal-qty-minus")?.addEventListener("click",()=>{t=Math.max(5,t-5),l()}),document.getElementById("modal-qty-plus")?.addEventListener("click",()=>{t=Math.min(a,t+5),l()}),document.getElementById("modal-buy-btn")?.addEventListener("click",()=>{o.buyApples(t),s.remove(),this.showFloatingText(`🍎 ${t}개 구매!`,!0)}),s.querySelector(".modal-close")?.addEventListener("click",()=>s.remove()),s.addEventListener("click",r=>{r.target===s&&s.remove()})}showLedgerModal(){const e=o.getState(),t=e.transactions.filter(l=>l.day===e.day),a=t.filter(l=>l.type==="income").reduce((l,r)=>l+r.amount,0),s=t.filter(l=>l.type==="expense").reduce((l,r)=>l+r.amount,0),i=a-s,n=document.createElement("div");n.className="modal-overlay",n.innerHTML=`
      <div class="modal-panel" style="max-height:85vh;overflow-y:auto;">
        <button class="modal-close">✕</button>
        <div class="modal-title">📒 장부</div>
        
        <div class="ledger-cash-card">
          <div class="ledger-cash-label">현금 잔고</div>
          <div class="ledger-cash-value">₩${this.formatNumber(e.cash)}</div>
        </div>

        <div class="ledger-section">
          <div class="ledger-section-title">📋 오늘의 거래</div>
          <div class="ledger-transactions">
            ${t.length===0?'<div class="ledger-empty">아직 거래가 없습니다</div>':t.slice(-6).map(l=>`
                <div class="ledger-tx-row">
                  <span class="ledger-tx-desc">${l.description}</span>
                  <span class="ledger-tx-amount ${l.type}">${l.type==="income"?"+":"-"}₩${this.formatNumber(l.amount)}</span>
                </div>
              `).join("")}
          </div>
        </div>

        <div class="ledger-summary">
          <div class="ledger-summary-item income">
            <div class="ledger-summary-label">오늘 매출</div>
            <div class="ledger-summary-value">+₩${this.formatNumber(a)}</div>
          </div>
          <div class="ledger-summary-item expense">
            <div class="ledger-summary-label">오늘 비용</div>
            <div class="ledger-summary-value">-₩${this.formatNumber(s)}</div>
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
    `,this.container.appendChild(n),n.querySelector(".modal-close")?.addEventListener("click",()=>n.remove()),n.addEventListener("click",l=>{l.target===n&&n.remove()})}showUpgradeModal(){const e=o.getState(),t=e.shopLevel*5e3,a=e.cash>=t,s=document.createElement("div");s.className="modal-overlay",s.innerHTML=`
      <div class="modal-panel">
        <button class="modal-close">✕</button>
        <div class="modal-title">⬆️ 가게 업그레이드</div>
        
        <div style="text-align:center;margin:20px 0;">
          <div style="font-size:64px;">🏪</div>
          <div style="font-size:20px;font-weight:700;margin-top:8px;">현재 레벨: ${e.shopLevel}</div>
          <div style="color:#666;margin-top:4px;">업그레이드하면 평판이 더 빨리 올라요!</div>
        </div>

        <div style="text-align:center;margin-bottom:20px;color:#666;">
          업그레이드 비용: <b>₩${this.formatNumber(t)}</b>
        </div>

        <button class="modal-primary-btn ${a?"":"disabled"}" id="modal-upgrade-btn">
          ${a?"⬆️ 업그레이드!":"💸 자금 부족"}
        </button>
      </div>
    `,this.container.appendChild(s),a&&document.getElementById("modal-upgrade-btn")?.addEventListener("click",()=>{o.upgradeShop(),s.remove(),this.showFloatingText("🏪 업그레이드 완료!",!0)}),s.querySelector(".modal-close")?.addEventListener("click",()=>s.remove()),s.addEventListener("click",i=>{i.target===s&&s.remove()})}showAchievementModal(){const e=o.getState(),t=e.achievements.filter(i=>i.unlocked).length,a=e.achievements.length,s=document.createElement("div");s.className="modal-overlay",s.innerHTML=`
      <div class="modal-panel achievement-modal">
        <button class="modal-close">✕</button>
        <div class="modal-title">🏆 업적</div>
        
        <div class="achievement-progress">
          <div class="achievement-progress-text">${t} / ${a} 달성</div>
          <div class="achievement-progress-bar">
            <div class="achievement-progress-fill" style="width:${t/a*100}%"></div>
          </div>
        </div>

        <div class="achievement-list">
          ${e.achievements.map(i=>`
            <div class="achievement-item ${i.unlocked?"unlocked":"locked"}">
              <div class="achievement-icon">${i.unlocked?i.icon:"🔒"}</div>
              <div class="achievement-info">
                <div class="achievement-name">${i.unlocked?i.name:"???"}</div>
                <div class="achievement-desc">${i.unlocked?i.description:"업적을 달성하면 공개됩니다"}</div>
                ${i.unlocked&&i.reward>0?`<div class="achievement-reward">보상: ₩${this.formatNumber(i.reward)}</div>`:""}
              </div>
              ${i.unlocked&&i.unlockedAt?`<div class="achievement-day">Day ${i.unlockedAt}</div>`:""}
            </div>
          `).join("")}
        </div>
      </div>
    `,this.container.appendChild(s),s.querySelector(".modal-close")?.addEventListener("click",()=>s.remove()),s.addEventListener("click",i=>{i.target===s&&s.remove()})}showSummaryModal(e){const t=e.profit>=0,a=document.createElement("div");a.className="modal-overlay",a.innerHTML=`
      <div class="modal-panel summary-modal">
        <div class="summary-header">
          <div class="summary-weather">${e.weather.description}</div>
          <div class="summary-day">Day ${e.day} 결산</div>
          <div class="summary-title">${t?"🎉 수고했어요!":"😢 힘내세요!"}</div>
          ${e.isNewRecord?'<div class="summary-record">🏆 신기록!</div>':""}
        </div>

        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label">🍎 판매량</span>
            <span class="summary-value">${e.sales}개</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">👥 손님</span>
            <span class="summary-value">${e.customersServed}명 응대 / ${e.customersLost}명 이탈</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">🔥 최대 콤보</span>
            <span class="summary-value">${e.maxCombo}x</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">💵 매출</span>
            <span class="summary-value positive">+₩${this.formatNumber(e.revenue)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">📦 비용</span>
            <span class="summary-value negative">-₩${this.formatNumber(e.expenses)}</span>
          </div>
          ${e.spoiledApples>0?`
          <div class="summary-row">
            <span class="summary-label">🗑️ 감모손실</span>
            <span class="summary-value negative">${e.spoiledApples}개</span>
          </div>
          `:""}
        </div>

        ${e.goalCompleted?`
        <div class="summary-goal-reward">
          <div>🎯 목표 달성 보너스!</div>
          <div class="summary-goal-amount">+₩${this.formatNumber(e.goalReward)}</div>
        </div>
        `:""}

        <div class="summary-profit ${t?"":"loss"}">
          <div class="summary-profit-label">순이익</div>
          <div class="summary-profit-value">${t?"+":""}₩${this.formatNumber(e.profit)}</div>
        </div>

        <button class="summary-next-btn" id="summary-next">▶️ 다음 날로</button>
      </div>
    `,this.container.appendChild(a),(t||e.goalCompleted||e.isNewRecord)&&this.showConfetti(),document.getElementById("summary-next")?.addEventListener("click",()=>{a.remove(),this.updateUI();const s=o.getState();s.dayEvent&&setTimeout(()=>this.showEventPopup(s.dayEvent),300)})}showConfetti(){const e=["🎉","✨","💰","⭐","🍎","🎊","🏆"];for(let t=0;t<25;t++){const a=document.createElement("div");a.className="confetti",a.textContent=e[Math.floor(Math.random()*e.length)],a.style.left=`${Math.random()*100}%`,a.style.animationDelay=`${Math.random()*2}s`,a.style.animationDuration=`${2+Math.random()*2}s`,document.body.appendChild(a),setTimeout(()=>a.remove(),5e3)}}renderApples(e){if(e===0)return'<div class="empty-stand">재고 없음<br><small>매입 버튼을 눌러주세요</small></div>';const t=Math.min(e,12);let a="";for(let s=0;s<t;s++)a+='<div class="apple-item"></div>';return e>12&&(a+=`<span class="apple-count-badge">+${e-12}</span>`),a}renderCustomers(e){if(e.length===0){const t=o.getState();return t.timeOfDay==="noon"?'<div class="empty-queue">손님을 기다리는 중... ⏳</div>':t.timeOfDay==="morning"?'<div class="empty-queue">아침이에요! 먼저 사과를 매입하세요 🛒</div>':'<div class="empty-queue">영업 종료! 내일을 기다려요 🌙</div>'}return e.map(t=>{const a=t.type!=="normal"?`customer-${t.type}`:"",s=t.type==="regular"?'<span class="customer-type-badge regular">단골</span>':t.type==="bulk"?'<span class="customer-type-badge bulk">대량</span>':t.type==="picky"?'<span class="customer-type-badge picky">까다로움</span>':"";return`
        <div class="customer-card ${t.mood} ${a}" data-id="${t.id}">
          ${s}
          <div class="customer-avatar">${t.emoji}</div>
          <div class="customer-mood">${this.getMoodEmoji(t.mood)}</div>
          <div class="customer-order">🍎×${t.quantity}</div>
          ${t.tip>0?'<div class="customer-tip-hint">💕</div>':""}
          <div class="customer-patience">
            <div class="customer-patience-bar ${this.getPatienceClass(t.patience)}" style="width:${t.patience}%"></div>
          </div>
        </div>
      `}).join("")}getMoodEmoji(e){switch(e){case"happy":return"😊";case"neutral":return"😐";case"angry":return"😠";default:return"😊"}}getPatienceClass(e){return e>60?"":e>30?"warning":"danger"}getTimeIcon(e){switch(e){case"morning":return"🌅";case"noon":return"☀️";case"evening":return"🌆";default:return"☀️"}}getTimeName(e){switch(e){case"morning":return"아침 (매입)";case"noon":return"낮 (영업)";case"evening":return"저녁 (마감)";default:return""}}getCashClass(e){return e>=1e4?"positive":e>=3e3?"warning":"danger"}getAppleClass(e){return e>10?"":e>0?"warning":"danger"}formatNumber(e){return e.toLocaleString()}}new C;
