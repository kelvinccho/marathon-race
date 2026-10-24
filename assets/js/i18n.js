(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MRI18n = api;
})(globalThis, function () {
  const UI = {
    "Skip to content": "跳至內容",
    "Marathon Race": "馬拉松賽事",
    "Home": "首頁",
    "Events": "賽事",
    "Plan your race": "規劃賽事",
    "About": "關於",
    "Get Alerts": "接收提醒",
    "Get alerts": "接收提醒",
    "Language": "語言",
    "Primary": "主要",
    "Checked": "查核日期",
    "Independent calendar. Not affiliated with Abbott World Marathon Majors or any race organiser.": "獨立行事曆。與 Abbott World Marathon Majors 或任何賽事主辦單位無關。",
    "Data": "資料",
    "World Marathon Majors": "世界馬拉松大滿貫",
    "Every date between the ballot and the start.": "從抽籤到起跑之間的每一個日期。",
    "Ballot open, ballot close, result, payment, expo, and race day. The clock is the next real instant. The bars sit on the race city's own date. Each race keeps one pale colour, and a darker mark means a more important date.": "抽籤開始、抽籤截止、結果、繳費、博覽會與比賽日。時鐘倒數的是下一個確實時刻。色條用的是比賽城市自己的日期。每場賽事一種淺色，顏色愈深，日期愈重要。",
    "Month calendar": "月曆",
    "Previous month": "上個月",
    "Prev": "上個月",
    "Today": "今天",
    "Next": "下個月",
    "Up next": "下一個",
    "Ballot, lightest": "抽籤，最淺",
    "Result, border only": "結果，只有框線",
    "Payment": "繳費",
    "Expo, dark": "博覽會，較深",
    "Race day, darkest": "比賽日，最深",
    "A darker cap is the day that window closes. Today's date is the filled circle.": "較深的一端是該時段截止的那一天。實心圓是今天。",
    "Matching the races and milestones selected above.": "只顯示上方選取的賽事與節點。",
    "In order of the next date on each race.": "依每場賽事的下一個日期排列。",
    "Upcoming": "即將到來",
    "Nothing matches this filter.": "這個篩選沒有符合的項目。",
    "closes": "截止",
    "opens": "開始",
    "open": "開放中",
    "Nothing scheduled on this date. Open ballots still show as bars across their window.": "這一天沒有排定的節點。仍在開放的抽籤會以橫條跨過整個時段。",
    "Nothing in this filter.": "這個篩選沒有符合的項目。",
    "Choose another race or milestone, or show all of them.": "改選其他賽事或節點，或改為全部顯示。",
    "Nothing dated ahead.": "往後還沒有已公布的日期。",
    "New windows land in the JSON when an organiser publishes them.": "主辦單位公布後，新的時段會寫進 JSON。",
    "In progress": "進行中",
    "Next up": "下一項",
    "Open now": "現正開放",
    "Expo opens": "博覽會開始",
    "Race day": "比賽日",
    "After that": "其後",
    "Event page": "賽事頁",
    "Show on calendar": "在月曆顯示",
    "Date": "日期",
    "Dates not announced": "日期尚未公布",
    "The majors, and the candidate.": "大滿貫，以及候選賽事。",
    "Eight World Marathon Majors, the New York race still in race week, and Shanghai while it is being assessed. Open a race for the full date list and the official page.": "八場世界馬拉松大滿貫、仍在比賽週的紐約賽事，以及尚在評估中的上海。開啟一場賽事可看完整日期與官方頁面。",
    "Status": "狀態",
    "All": "全部",
    "Open": "開放中",
    "Awaiting result": "等待結果",
    "Decided": "已有結果",
    "Not announced": "尚未公布",
    "Candidate": "候選",
    "Major": "大滿貫",
    "Event not found.": "找不到這場賽事。",
    "World Marathon Major": "世界馬拉松大滿貫",
    "Entry page": "報名頁",
    "Official site": "官方網站",
    "This race": "這場比賽",
    "Dates": "日期",
    "Entry": "報名",
    "Fee": "費用",
    "Odds": "錄取機率",
    "Field": "名額",
    "Watch": "注意",
    "16-week block": "16 週週期",
    "This is a planning anchor, not a workout plan.": "這只是規劃的起點，不是訓練課表。",
    "Not enough of a race date to count.": "比賽日期不足，無法推算。",
    "In your plan": "已加入計劃",
    "Add to your plan": "加入計劃",
    "Download dates": "下載日期",
    "Sources": "資料來源",
    "Source": "來源",
    "Your own deadline list.": "你自己的截止日期。",
    "Choose the races you are actually chasing. The list stays in this browser. A 16-week block is counted back to the Monday 111 days before race Sunday, or the Sunday before a Monday race.": "選出你真正要跑的賽事。清單只留在這個瀏覽器。16 週週期會回推到比賽週日之前 111 天的週一；若比賽在週一，則回推到前一個週日。",
    "Races": "賽事",
    "Application submitted": "已送出申請",
    "Result checked": "已查看結果",
    "Fee paid": "已繳費",
    "Travel booked": "已訂行程",
    "Expo visit planned": "已安排博覽會",
    "Training block started": "已開始訓練週期",
    "Race date not fixed.": "比賽日期尚未確定。",
    "Open the event page": "開啟賽事頁",
    "Coming up": "接下來",
    "No dated milestones left.": "沒有剩下的已公布日期。",
    "Nothing selected": "尚未選取",
    "Add a race, or start with the ballots that are open today.": "加入一場賽事，或從今天仍開放的抽籤開始。",
    "Add races that are open": "加入目前開放的賽事",
    "A calendar you can keep, and a feed other apps can read.": "一份你可以留著的行事曆，也是其他程式讀得懂的資料。",
    "Marathon Race tracks the dates that decide whether you are on the start line: ballot open, ballot close, result, payment, expo, and race day. It began as a personal deadline list for the World Marathon Majors. The pages are the public view. The JSON is the product underneath.": "馬拉松賽事追蹤決定你能不能站上起跑線的日期：抽籤開始、抽籤截止、結果、繳費、博覽會與比賽日。它起初是一份世界馬拉松大滿貫的個人截止日期。頁面是公開的看法，底下的產品是 JSON。",
    "Use the data": "使用資料",
    "Two files, both generated from the same source.": "兩個檔案都從同一份來源產生。",
    "is nested by race.": "依賽事分層。",
    "is one row per date, already sorted, which is the file to filter. Schema version": "一行一個日期，而且已經排序，適合拿來篩選。綱要版本",
    "Fields are not renamed or removed without a version bump.": "欄位不會在未升級版本時改名或刪除。",
    "is an ISO-8601 instant with a numeric offset. Sort and count down with": "是帶有數字時差的 ISO-8601 時刻。請用",
    "Do not sort the strings.": "排序與倒數。不要用字串排序。",
    "is the civil date of that instant in the race city's time zone. Use it for an all-day cell.": "是該時刻在比賽城市時區的日期。全日格請用這個。",
    "is": "是",
    "or": "或",
    "Hide the clock when it is not": "不是",
    "instant.": "時刻時，請把時鐘藏起來。",
    "Expected rows have null dates on purpose.": "標記為預期的列故意把日期留空。",
    "Ballot close is its own milestone. It is not the": "抽籤截止是獨立的節點，不是抽籤開始的",
    "of ballot open.": "。",
    "is only for a range that belongs to one milestone, such as an expo.": "只用於同一個節點自己的一段時間，例如博覽會。",
    "GitHub Pages does not add CORS headers. A server can fetch the Pages URL. A browser app on another site should use jsDelivr, which does:": "GitHub Pages 不會加上 CORS 標頭。伺服器可以抓 Pages 網址。另一個網站上的瀏覽器程式請用有 CORS 的 jsDelivr：",
    "The same dates are also in": "同一批日期也在",
    "How a date is labelled": "日期怎麼標記",
    "Official means the organiser's own page states it. Reported means a published account of that page, kept because the organiser's wording was not captured directly. Expected means it is not published: the file stores null, and the note says why. Nothing here is a guess dressed up as a clock time.": "官方表示主辦單位自己的頁面寫了這個時間。轉述表示有公開文章記述該頁，因為沒有直接留下主辦單位的原文。預期表示尚未公布：檔案故意存 null，附註說明原因。這裡沒有任何被打扮成時刻的猜測。",
    "On the calendar, each race has one pale colour. The mark gets darker as the date matters more: a ballot is the lightest fill, a result is a dark circle with only a border, an expo is dark, and race day is the darkest. The hex values in": "月曆上每場賽事一種淺色。日期愈重要，標記愈深：抽籤是最淺的填色，結果是只有框線的深色圓，博覽會較深，比賽日最深。",
    "stay the feed's type key.": "裡的色碼仍是資料流的類型對照，不是頁面上的顏色。",
    "The pages can be read in English or Traditional Chinese. Event names stay as the organiser publishes them. The JSON file stays in English.": "頁面可以讀英文或繁體中文。賽事名稱維持主辦單位公布的原文。JSON 檔維持英文。",
    "What this is not": "這不是什麼",
    "Not an entry agent, not a charity broker, and not affiliated with Abbott World Marathon Majors, NYRR, the B.A.A., London Marathon Events, or any other organiser. Confirm the live entry page before you pay or book flights.": "不是代報服務，不是慈善名額仲介，也與 Abbott World Marathon Majors、NYRR、B.A.A.、London Marathon Events 或任何其他主辦單位無關。付款或訂機票之前，請先看正在開放的報名頁。",
    "What comes next": "接下來",
    "Email alerts, once the site has its own domain. Until then, subscribe to the calendar file or poll the JSON. The plan page is the personal layer: it stays on this device.": "等網站有自己的網域之後才會寄出電子郵件提醒。在那之前，請訂閱行事曆檔，或定期讀取 JSON。規劃頁是個人的一層，只留在這台裝置上。",
    "A calendar you can subscribe to today.": "今天就能訂閱的行事曆。",
    "Email delivery waits for the site's own domain. The dates already work in Google Calendar and Apple Calendar, and any app that can read the JSON.": "電子郵件要等網站有自己的網域。這些日期已經能放進 Google 日曆、Apple 日曆，以及任何讀得懂 JSON 的程式。",
    "Saved in this browser. Nothing was emailed.": "已存在這個瀏覽器。沒有寄出任何信。",
    "Save a reminder list": "儲存提醒清單",
    "Email": "電郵",
    "Stored only in this browser. It is not sent anywhere.": "只存在這個瀏覽器，不會送到別處。",
    "Save in this browser": "存在這個瀏覽器",
    "Download .ics": "下載 .ics",
    "Use my plan": "用我的計劃",
    "Subscribe": "訂閱",
    "In Google Calendar: Add calendar → From URL. Paste the feed. Apple Calendar can open the same file.": "在 Google 日曆：新增日曆 → 透過網址。貼上這份資料。Apple 日曆也能開啟同一個檔案。",
    "Copy feed URL": "複製訂閱網址",
    "The feed is rebuilt from": "這份資料由",
    "Poll": "若要自己發提醒，請改讀",
    "if you would rather send your own alerts.": "。",
    "Copied": "已複製",
    "Copy failed": "複製失敗",
    "Pick at least one race and one date type.": "至少選一場賽事和一種日期。",
    "All races": "全部賽事",
    "All milestones": "全部節點",
    "Milestones": "節點",
    "The calendar could not load": "行事曆無法載入",
    "Your time": "你的時間",
    "Days": "天",
    "Hours": "小時",
    "Minutes": "分",
    "Seconds": "秒",
    "Race": "比賽",
    "Expo": "博覽會",
    "Result": "結果",
    "Closes": "截止",
    "Opens": "開始",
    "Race week": "比賽週",
    "official": "官方",
    "reported": "轉述",
    "expected": "預期",
    "Event": "賽事",
    "Plan": "規劃",
    "That page is not on the calendar.": "行事曆上沒有這一頁。",
    "Back to the calendar": "回到行事曆",
    "Loading the calendar…": "行事曆載入中…",
    "The live countdown needs JavaScript. The same dates are in": "即時倒數需要 JavaScript。同一批日期在",
    "and": "與",
    "Counted to the end of that day in the race city.": "倒數到比賽城市那一天的結束。",
    "Counted to the start of that date in the race city. No clock time is published.": "倒數到比賽城市該日的開始。沒有公布鐘點。",
    "Entry opens": "報名開始",
    "Entry closes": "報名截止",
  };

  const PLACES = {
    city: {
      "New York": "紐約",
      Tokyo: "東京",
      Boston: "波士頓",
      London: "倫敦",
      "Cape Town": "開普敦",
      Sydney: "雪梨",
      Berlin: "柏林",
      Chicago: "芝加哥",
      Shanghai: "上海",
    },
    region: {
      "New York": "紐約",
      Tokyo: "東京",
      Massachusetts: "麻薩諸塞州",
      London: "倫敦",
      "Western Cape": "西開普省",
      "New South Wales": "新南威爾斯",
      Berlin: "柏林",
      Illinois: "伊利諾州",
      Shanghai: "上海",
    },
    country: {
      "United States": "美國",
      Japan: "日本",
      "United Kingdom": "英國",
      "South Africa": "南非",
      Australia: "澳洲",
      Germany: "德國",
      China: "中國",
    },
    noun: {
      drawing: "抽籤",
      lottery: "抽籤",
      registration: "報名",
      ballot: "抽籤",
      entry: "報名",
    },
  };

  const TYPES = {
    ballot_open: "抽籤開始",
    ballot_close: "抽籤截止",
    result: "結果",
    payment: "繳費",
    expo: "博覽會",
    race: "比賽日",
    qualifier_open: "達標報名開始",
    qualifier_close: "達標報名截止",
  };

  const DISCLAIMER = "報名、繳費或訂行程之前，請先在官方賽事網站確認每一個日期。主辦單位會更動時段。";

  const EVENTS = {
    "nyc-2026": {
      fee: "2026 年的報名費是數百美元，非會員更高。已公布的金額會因會員身分而不同，所以這份檔案不記單一費用。",
      odds: "2026 年一般抽籤已截止。",
      summary: "比賽日是 2026 年 11 月 1 日週日。號碼布必須本人到 Jacob K. Javits 會議中心領取，時間為 10 月 29 日週四至 10 月 31 日週六。比賽當天早上不發號碼布，也不能代領。",
      watchOut: "展覽廳關閉前 30 分鐘停止發放號碼布。請帶附照片的身分證件和確認信。",
      sources: ["NYRR — TCS New York City Marathon 官方頁"],
      milestones: {
        "ballot-open": { label: "抽籤開始", note: "2026 年抽籤自 2 月 4 日起。沒有記下小時。" },
        "ballot-close": { label: "抽籤截止", note: "2026 年抽籤於 2 月 25 日截止。" },
        result: { label: "抽籤結果", note: "結果於 2026 年 3 月 4 日公布。" },
        payment: { label: "繳費", note: "錄取跑者在 NYRR 確認名額時繳費。2026 年沒有另記一個公開截止時刻。" },
        expo: { label: "博覽會", endLabel: "博覽會結束", note: "Javits 中心，11 大道、西 35 街與 36 街之間。週四 10 月 29 日 10:00–20:00（號碼布至 19:30），週五 10 月 30 日 10:00–20:00（號碼布至 19:30），週六 10 月 31 日 09:00–17:00（號碼布至 16:30）。不能代領。" },
        race: { label: "比賽日", endLabel: "比賽日", note: "2026 年 11 月 1 日週日。美國當天凌晨 02:00 時鐘撥回，所以午夜仍是美東夏令時間，晚上則是美東標準時間。倒數用的是日曆上的那一天，不是分組起跑時刻。" },
      },
    },
    "tokyo-2027": {
      fee: "日本國內跑者約日圓 19,800，海外跑者約美元 230。請以報名頁為準；不同來源公布的金額並不一致。",
      odds: "近年一般抽籤大約十人取一人。2027 年的比例並沒有被保證公布。",
      summary: "一般抽籤於日本時間 2026 年 8 月 14 日 11:00 至 8 月 28 日 17:00。結果在 9 月 18 日寄出，繳費截止為 9 月 30 日。2027 年沒有第二次一般抽籤。",
      watchOut: "錄取還不是號碼布，費用繳了才算。錯過繳費時段，名額會被釋出。",
      sources: ["Tokyo Marathon 2027 官方頁"],
      milestones: {
        "ballot-open": { label: "抽籤開始", note: "一般報名於日本時間 2026 年 8 月 14 日週五 11:00 開放。" },
        "ballot-close": { label: "抽籤截止", note: "一般報名於日本時間 2026 年 8 月 28 日週五 17:00 截止。" },
        result: { label: "抽籤結果", note: "一般報名結果於 2026 年 9 月 18 日通知。沒有記下小時。" },
        payment: { label: "繳費截止", note: "錄取跑者須在 2026 年 9 月 30 日前繳費。若你還有未付款的名額，請再確認截止時間。" },
        expo: { label: "博覽會", note: "號碼布須於比賽週本人領取。這份檔案沒有 2027 年的日期。" },
        race: { label: "比賽日", endLabel: "比賽日", note: "2027 年 3 月 7 日週日。倒數用的是東京的日曆日，不是分組起跑時刻。" },
      },
    },
    "boston-2027": {
      fee: "達標者錄取時收取美元 260。",
      odds: "沒有公開抽籤。2027 年錄取 25,630 名達標者，實際門檻比公布標準快 5 分 17 秒。",
      fieldNote: "2027 年錄取 25,630 名達標者，其中約 1,000 人是達到公布標準、但沒有通過實際門檻後再抽中的。",
      summary: "Boston Marathon 沒有公開抽籤。達標跑者於 2026 年 9 月 14 日至 18 日報名，美東時間 17:00 截止。錄取通知自 9 月 29 日開始，錄取時扣款。沒有達標成績時，慈善名額是另一條路。",
      watchOut: "達標成績不是號碼布。每個年齡組取得的是該組最快的申請者，實際門檻通常比公布標準更嚴。",
      sources: ["B.A.A. — Boston Marathon 官方頁"],
      milestones: {
        "qualifier-open": { label: "達標報名開始", note: "達標報名週於 2026 年 9 月 14 日週一開放。沒有記下開始的小時。" },
        "qualifier-close": { label: "達標報名截止", note: "報名於美東時間 2026 年 9 月 18 日週五 17:00 截止。" },
        result: { label: "錄取通知", note: "B.A.A. 自 2026 年 9 月 29 日開始寄出錄取通知。共錄取 25,630 名達標者。門檻比標準快 5 分 17 秒。" },
        payment: { label: "繳費", note: "錄取通知寄出時即扣款。沒有另一個公開的繳費截止日。" },
        expo: { label: "博覽會", note: "2027 年的博覽會日期尚未公布。2026 年是比賽前的週五至週日，在 Hynes 會議中心。不要把那個規律當成 2027 年的日期。" },
        race: { label: "比賽日", endLabel: "比賽日", note: "2027 年 4 月 19 日週一，愛國者日。倒數用的是日曆日，不是分組起跑時刻。" },
      },
    },
    "london-2027": {
      fee: "英國抽籤報名費為英鎊 79.99。海外抽籤較高，已公布的數字並不一致，請確認目前費用。曾提供的英鎊 49.99 雙倍機會方案，當時已包含報名費。",
      odds: "2027 年抽籤收到 1,338,544 份申請。週末名額只有一部分經由抽籤分配，實際機率非常低。",
      fieldNote: "2027 年 4 月 24 日週六與 4 月 25 日週日合計約 100,000 名起跑者。",
      summary: "抽籤自 2026 年 4 月 24 日 09:00 至 5 月 1 日 16:00。結果於 2026 年 7 月 9 日以電子郵件寄出。中籤者須在 7 月 31 日 16:00 前確認。英國居民的年齡達標（Good for Age）於英國時間 2026 年 10 月 29 日 16:00 截止。慈善名額另計。",
      watchOut: "中籤者會被分到週六或週日。2027 年男子年齡達標場次排在週六，女子排在週日。兩天的名額不能互換。",
      sources: ["TCS London Marathon 官方頁", "London Marathon Events — 2027 抽籤結果"],
      milestones: {
        "ballot-open": { label: "抽籤開始", note: "於英國夏令時間 2026 年 4 月 24 日週五 09:00 開放。" },
        "ballot-close": { label: "抽籤截止", note: "於英國夏令時間 2026 年 5 月 1 日週五 16:00 截止。" },
        result: { label: "抽籤結果", note: "結果以電子郵件寄出，直到 2026 年 7 月 9 日週四。主辦單位請申請者若在 7 月 10 日週五 09:00 仍未收到，主動聯絡。" },
        payment: { label: "確認報名", note: "錄取者須於英國夏令時間 2026 年 7 月 31 日週五 16:00 前確認資料，並付清餘額。" },
        "good-for-age-open": { label: "年齡達標開始", note: "供持有達標成績的英國居民。時段於 2026 年 10 月 1 日開放。沒有記下開始的小時。約 6,000 個名額，由快到慢錄取，所以只達到標準並不保證有名額。" },
        "good-for-age-close": { label: "年齡達標截止", note: "於英國時間 2026 年 10 月 29 日週四 16:00 截止。時鐘已經撥回，所以這是格林威治標準時間。" },
        expo: { label: "博覽會", note: "號碼布須本人在倫敦博覽會領取，地點通常是 ExCeL。這份檔案沒有 2027 年的日期。" },
        race: { label: "比賽週末", endLabel: "比賽週末", note: "2027 年 4 月 24 日週六與 4 月 25 日週日。確認信會寫你是哪一天。倒數從倫敦的週六開始算。" },
      },
    },
    "cape-town-2027": {
      fee: "抽籤申請費為南非蘭特 5 元。抽中之後才收比賽費用。比賽費用的金額沒有記在這裡。",
      odds: "2027 年抽籤沒有公布錄取率。",
      summary: "Cape Town Marathon 自 2027 年 5 月 23 日週日這一屆加入世界馬拉松大滿貫，是非洲的第一場大滿貫。2027 年抽籤於 2026 年 6 月 10 日至 24 日，結果於 6 月 26 日通知。沒有成績達標標準。抽籤之後，慈善與旅行團名額仍然開放。",
      watchOut: "申請費不是報名費。抽中之後才會收取比賽費用。",
      sources: ["Sanlam Cape Town Marathon 官方頁", "Tokyo Marathon — 開普敦加入系列賽"],
      milestones: {
        "ballot-open": { label: "抽籤開始", note: "2027 年抽籤於 2026 年 6 月 10 日開放。沒有記下小時。" },
        "ballot-close": { label: "抽籤截止", note: "2027 年抽籤於 2026 年 6 月 24 日截止。沒有記下小時。" },
        result: { label: "抽籤結果", note: "結果於 2026 年 6 月 26 日通知。" },
        payment: { label: "收取比賽費用", note: "結果發出時即收取比賽費用，不是事後另開發票。申請費為南非蘭特 5 元。" },
        expo: { label: "博覽會", note: "這份檔案沒有 2027 年的博覽會日期。" },
        race: { label: "比賽日", endLabel: "比賽日", note: "2027 年 5 月 23 日週日。作為世界馬拉松大滿貫的第一屆。南非不實施日光節約時間。" },
      },
    },
    "sydney-2027": {
      fee: "澳洲居民澳幣 280，其他人澳幣 330，抽中才收費。參加抽籤本身免費。",
      odds: "2026 年抽籤大約三人取一人。2027 年的比例還沒公布。",
      summary: "2027 年公開抽籤自 2026 年 9 月 29 日至雪梨時間 10 月 19 日 10:00。結果預定 2026 年 11 月 3 日公布，抽中就扣款。慈善名額與旅行套裝是另外的途徑。",
      watchOut: "沒有另開的繳費時段。抽中之後，會扣你報名時留下的卡。",
      sources: ["TCS Sydney Marathon 官方頁"],
      milestones: {
        "ballot-open": { label: "抽籤開始", note: "於 2026 年 9 月 29 日開放。當天早上仍是澳洲東部標準時間。沒有記下開始的小時。" },
        "ballot-close": { label: "抽籤截止", note: "於澳洲東部夏令時間 2026 年 10 月 19 日週一 10:00 截止，即 10 月 18 日 23:00 UTC。" },
        result: { label: "抽籤結果", note: "申請者於 2026 年 11 月 3 日收到通知。沒有公布小時。" },
        payment: { label: "抽中即扣款", note: "結果出來時自動扣除報名費。之後沒有公開的繳費截止日。" },
        expo: { label: "博覽會", note: "這份檔案沒有 2027 年的博覽會日期。" },
        race: { label: "比賽日", endLabel: "比賽日", note: "2027 年 8 月 29 日週日。八月是澳洲東部標準時間。倒數用的是日曆日，不是分組起跑時刻。" },
      },
    },
    "berlin-2027": {
      fee: "抽中為歐元 215；若要行李寄存再加歐元 5。沒被選中就不會扣款。",
      odds: "主辦單位不會事先公布錄取率。",
      summary: "2027 年抽籤於 2026 年 10 月 1 日開放，11 月 12 日截止。所有申請者會在 12 月 3 日收到結果電子郵件。若被選中，自 12 月 4 日起扣款，銀行入帳最多可能要一週。快跑者報名、Jubilee Club、慈善與旅行團是另外的途徑。",
      watchOut: "遞延到 2027 年的折價券也在 2026 年 11 月 12 日中歐時間 23:59 失效。把那個時刻當成截止日最後的安全時間；若你在最後一天申請，請再確認抽籤表單自己的小時。",
      sources: ["Generali Berlin Marathon — 報名頁"],
      milestones: {
        "ballot-open": { label: "抽籤開始", note: "2027 年抽籤於 2026 年 10 月 1 日開放。沒有記下開始的小時。當時仍是中歐夏令時間。" },
        "ballot-close": { label: "抽籤截止", note: "抽籤於 2026 年 11 月 12 日週四截止。主辦單位公布的遞延報名代碼截止時間是當天中歐時間 23:59。若在最後一天申請，請確認表單自己的小時。" },
        result: { label: "抽籤結果", note: "結果於 2026 年 12 月 3 日週四以電子郵件寄出。沒有公布小時。" },
        payment: { label: "繳費處理", endLabel: "繳費時段結束", note: "若被選中，報名費自 2026 年 12 月 4 日起處理。主辦單位說銀行最多可能需要一週。" },
        expo: { label: "博覽會", note: "這份檔案沒有 2027 年的博覽會日期。" },
        race: { label: "比賽日", endLabel: "比賽日", note: "2027 年 9 月 26 日週日。倒數用的是柏林的日曆日，不是分組起跑時刻。" },
      },
    },
    "chicago-2027": {
      fee: "美國居民美元 250，其他人美元 260，另加手續費。只有申請核准或抽中之後才收費。",
      odds: "近年一般抽籤大約四人取一人。2027 年的比例不會事先公布。",
      summary: "保證與非保證申請於美國中部時間 2026 年 10 月 8 日 08:00 開放，10 月 29 日 14:00 截止。不是先到先得。保證名額的申請者須於中部時間 11 月 10 日 23:59 前繳費。抽籤結果於 12 月 8 日以電子郵件寄出，抽中的跑者須於中部時間 12 月 15 日 23:59 前繳費。",
      watchOut: "錯過你那一條路徑的繳費期限，名額就會被釋出。你不會拿到號碼布。",
      sources: ["Chicago Marathon — 申請頁", "Chicago Marathon — 活動問答"],
      milestones: {
        "ballot-open": { label: "申請開始", note: "保證與非保證申請於美國中部時間 2026 年 10 月 8 日週四 08:00 開放。" },
        "ballot-close": { label: "申請截止", note: "申請於美國中部時間 2026 年 10 月 29 日週四 14:00 截止。" },
        "payment-guaranteed": { label: "保證名額繳費", note: "已核准的保證名額申請者須於美國中部時間 2026 年 11 月 10 日週二 23:59 前繳費。當時是中部標準時間。" },
        result: { label: "抽籤結果", note: "非保證申請者會在 2026 年 12 月 8 日週二之前收到電子郵件。沒有單一的寄出時刻。" },
        "payment-drawing": { label: "抽籤繳費", note: "抽中的跑者須於美國中部時間 2026 年 12 月 15 日週二 23:59 前繳費並完成報名。" },
        expo: { label: "博覽會", endLabel: "博覽會結束", note: "Abbott 健康與體能博覽會，McCormick Place。2027 年 10 月 7 日週四 10:00–18:00、10 月 8 日週五 09:00–18:00、10 月 9 日週六 09:00–18:00，美國中部時間。時段可能更改。比賽當天早上不發號碼布。需要附照片的身分證件。" },
        race: { label: "比賽日", endLabel: "比賽日", note: "2027 年 10 月 10 日週日。倒數用的是芝加哥的日曆日，不是分組起跑時刻。" },
      },
    },
    "nyc-2027": {
      fee: "2027 年的費用尚未公布。2026 年的報名費是數百美元，非會員更高。",
      odds: "一般抽籤只占申請的個位數百分比。2027 年的比例尚未公布。",
      summary: "2027 年一般抽籤還沒有寫上行事曆。2026 年是 2 月 4 日至 25 日，結果在 3 月 4 日。預期是 2027 年 2 月的一個時段，在 NYRR 公布之前，不要把任何日期當成確定。成績達標、慈善與旅行團各有自己的時段。2026 年完成的 9+1 計劃取得的是 2028 年的名額，不是 2027 年。",
      watchOut: "不要為了 NYRR 尚未公布的抽籤日期，去訂不能退的行程。",
      sources: ["NYRR — TCS New York City Marathon 官方頁"],
      milestones: {
        "ballot-open": { label: "抽籤開始", note: "尚未公布。2026 年抽籤於 2 月 4 日開放。預期是 2027 年 2 月的一個時段。" },
        "ballot-close": { label: "抽籤截止", note: "尚未公布。2026 年抽籤於 2 月 25 日截止。" },
        result: { label: "抽籤結果", note: "尚未公布。2026 年的結果在 3 月 4 日。" },
        payment: { label: "繳費", note: "尚未公布。錄取跑者在 NYRR 確認名額時扣款。" },
        expo: { label: "博覽會", note: "尚未公布。須本人領取。比賽當天早上不發號碼布。" },
        race: { label: "比賽日", endLabel: "比賽日", note: "2027 年 11 月 7 日週日。美國當天凌晨 02:00 時鐘撥回。倒數用的是日曆日，不是分組起跑時刻。抽籤日期仍未公布。" },
      },
    },
    "shanghai-2026": {
      fee: "沒有記下 2026 年的費用。本地與海外價格曾隨該報名時段公布，現已截止。",
      odds: "入選名單於 2026 年 6 月 30 日公布。沒有記下錄取率。",
      summary: "Shanghai Marathon 是第九場世界馬拉松大滿貫的候選，尚未成為成員。評估賽是 2026 年 12 月 6 日週日。2026 年報名時段已截止，入選名單於 2026 年 6 月 30 日公布。這份檔案沒有編造開始與截止的時刻。",
      watchOut: "不要把上海列成大滿貫，在主辦單位公布之前也不要規劃 2027 年的報名。",
      sources: ["Shanghai Marathon 官方頁", "Tokyo Marathon — 上海評估賽日期"],
      milestones: {
        "ballot-open": { label: "報名開始", note: "2026 年的時段在當年稍早開放，現已截止。沒有記下確切的開始時刻。" },
        "ballot-close": { label: "報名截止", note: "2026 年的時段已截止。沒有記下確切的截止時刻。" },
        result: { label: "入選名單", note: "主辦單位於 2026 年 6 月 30 日公布入選名單。中國不實施日光節約時間。" },
        payment: { label: "繳費", note: "沒有記下 2026 年的公開繳費期限。" },
        expo: { label: "博覽會", note: "這份檔案沒有記下 2026 年的博覽會日期。" },
        race: { label: "比賽日", endLabel: "比賽日", note: "2026 年 12 月 6 日週日，第二場 Abbott World Marathon Majors 評估賽。還沒有成為大滿貫。" },
      },
    },
  };

  function text(lang, value) {
    if (lang !== "zh-Hant" || value == null || value === "") return value;
    return Object.prototype.hasOwnProperty.call(UI, value) ? UI[value] : value;
  }

  function has(lang, key) {
    return lang !== "zh-Hant" || Object.prototype.hasOwnProperty.call(UI, key);
  }

  function localize(data, lang) {
    if (!data || lang !== "zh-Hant") return data;
    return {
      ...data,
      disclaimer: DISCLAIMER,
      milestoneTypes: data.milestoneTypes.map((type) => ({ ...type, label: TYPES[type.id] || type.label })),
      events: data.events.map(localizeEvent),
    };
  }

  function localizeEvent(event) {
    const copy = EVENTS[event.id] || {};
    return {
      ...event,
      name: event.name,
      shortName: event.shortName,
      city: PLACES.city[event.city] || event.city,
      region: PLACES.region[event.region] || event.region,
      country: PLACES.country[event.country] || event.country,
      entryNoun: PLACES.noun[event.entryNoun] || event.entryNoun,
      summary: copy.summary || event.summary,
      watchOut: copy.watchOut || event.watchOut,
      fieldNote: event.fieldNote ? (copy.fieldNote || event.fieldNote) : event.fieldNote,
      fee: { ...event.fee, summary: copy.fee || event.fee.summary },
      odds: { ...event.odds, summary: copy.odds || event.odds.summary },
      sources: event.sources.map((source, index) => ({
        ...source,
        label: (copy.sources && copy.sources[index]) || source.label,
      })),
      milestones: event.milestones.map((milestone) => {
        const translated = (copy.milestones && copy.milestones[milestone.id]) || {};
        return {
          ...milestone,
          label: translated.label || milestone.label,
          endLabel: milestone.endLabel ? (translated.endLabel || milestone.endLabel) : milestone.endLabel,
          note: milestone.note ? (translated.note || milestone.note) : milestone.note,
        };
      }),
    };
  }

  function initialLang() {
    try {
      const saved = globalThis.localStorage && localStorage.getItem("marathon-race-lang");
      if (saved === "zh-Hant" || saved === "en") return saved;
      const list = (globalThis.navigator && (navigator.languages || [navigator.language])) || [];
      if (list.some((item) => /zh-(Hant|TW|HK|MO)/i.test(String(item)))) return "zh-Hant";
    } catch (error) {
      return "en";
    }
    return "en";
  }

  function coverageErrors(data) {
    const errors = [];
    const zh = localize(data, "zh-Hant");
    if (!zh || zh.disclaimer === data.disclaimer) errors.push("disclaimer was not translated");
    data.milestoneTypes.forEach((type, index) => {
      if (zh.milestoneTypes[index].label === type.label) errors.push(`milestone type ${type.id} was not translated`);
    });
    data.events.forEach((event, index) => {
      const copy = zh.events[index];
      if (copy.name !== event.name || copy.shortName !== event.shortName) errors.push(`${event.id} changed the event name`);
      ["summary", "watchOut"].forEach((field) => {
        if (copy[field] === event[field] || !/[\u4e00-\u9fff]/.test(copy[field])) errors.push(`${event.id} ${field} was not translated`);
      });
      if (event.fieldNote && (copy.fieldNote === event.fieldNote || !/[\u4e00-\u9fff]/.test(copy.fieldNote))) errors.push(`${event.id} field note was not translated`);
      if (copy.fee.summary === event.fee.summary) errors.push(`${event.id} fee was not translated`);
      if (copy.odds.summary === event.odds.summary) errors.push(`${event.id} odds were not translated`);
      if (copy.city === event.city) errors.push(`${event.id} city was not translated`);
      if (copy.region === event.region) errors.push(`${event.id} region was not translated`);
      if (copy.country === event.country) errors.push(`${event.id} country was not translated`);
      if (copy.entryNoun === event.entryNoun) errors.push(`${event.id} entry noun was not translated`);
      event.milestones.forEach((milestone, milestoneIndex) => {
        const next = copy.milestones[milestoneIndex];
        if (next.label === milestone.label) errors.push(`${event.id} ${milestone.id} label was not translated`);
        if (milestone.note && next.note === milestone.note) errors.push(`${event.id} ${milestone.id} note was not translated`);
        if (milestone.endLabel && next.endLabel === milestone.endLabel) errors.push(`${event.id} ${milestone.id} end label was not translated`);
      });
      event.sources.forEach((source, sourceIndex) => {
        if (copy.sources[sourceIndex].label === source.label) errors.push(`${event.id} source ${sourceIndex} was not translated`);
      });
    });
    return errors;
  }

  return { text, has, localize, initialLang, coverageErrors };
});
