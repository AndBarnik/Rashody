// Разбор фраз вида «йогурт 44 рубля» / «зарплата 50 тысяч» -> {amount, title, type, cat, dayOffset}
(function (root) {
  const D = (id, name, icon, color, type, kw, fallback) => ({ id, name, icon, color, type, kw, fallback: !!fallback });
  const DEFAULTS = [
    D('food', 'Продукты', '🛒', '#16a34a', 'expense', ['йогурт','молок','хлеб','батон','сыр','мяс','колбас','сосиск','яблок','банан','овощ','фрукт','яйц','яиц','масл','кефир','творог','макарон','круп','рис','гречк','сахар','мук','вода','воду','сок','шоколад','конфет','печень','пирожн','торт','морожен','курица','курицу','куриц','рыб','помидор','огурц','картошк','картофел','лук','пятероч','магнит','перекрест','лент','ашан','вкусвилл','продукт','супермаркет','сметан','пельмен','орех','чипс','фарш','свинин','говядин','чай','чая']),
    D('cafe', 'Кафе и рестораны', '🍔', '#f97316', 'expense', ['кафе','ресторан','обед','ужин','завтрак','пицц','бургер','суши','ролл','шаурм','кофе','капучино','латте','макдон','кфс','столов','бар','доставк','еда','перекус']),
    D('transport', 'Транспорт', '🚕', '#eab308', 'expense', ['такси','метро','автобус','бензин','заправк','проезд','парковк','маршрутк','трамва','электричк','поезд','самолет','авиабилет','убер','каршеринг','тройк','топлив','мойк']),
    D('home', 'Жильё и ЖКХ', '🏠', '#0ea5e9', 'expense', ['квартплат','коммунал','аренд','свет','электричеств','жкх','отоплен','ипотек','домофон','газ']),
    D('house', 'Дом и быт', '🧽', '#14b8a6', 'expense', ['порошок','мыло','шампун','лампочк','посуд','ремонт','хозтовар','гель','салфетк','пакет','мебел','подушк','полотенц','губк','бумаг','швабр','инструмент']),
    D('health', 'Здоровье', '💊', '#ef4444', 'expense', ['аптек','лекарств','таблетк','врач','стоматолог','анализ','витамин','больниц','клиник','массаж','очки','линз']),
    D('clothes', 'Одежда и обувь', '👕', '#8b5cf6', 'expense', ['куртк','джинс','кроссовк','футболк','обув','одежд','ботинк','платье','свитер','шапк','носки','брюки','рубашк','пальто']),
    D('fun', 'Развлечения', '🎬', '#ec4899', 'expense', ['кино','игр','театр','концерт','подписк','нетфликс','netflix','боулинг','бильярд','парк','музей','билет','стим','steam','ютуб','спотифай']),
    D('mobile', 'Связь и интернет', '📱', '#6366f1', 'expense', ['телефон','связь','интернет','мобильн','симк','мтс','билайн','мегафон','теле2','тариф']),
    D('beauty', 'Красота', '💇', '#d946ef', 'expense', ['парикмахер','стрижк','маникюр','косметик','крем','духи','помад','барбер','салон']),
    D('edu', 'Образование', '📚', '#2563eb', 'expense', ['книг','курс','школ','учебник','репетитор','универ','тетрад']),
    D('gifts', 'Подарки', '🎁', '#f43f5e', 'expense', ['подарок','подарк','цветы','цветов','букет','открытк']),
    D('pets', 'Животные', '🐾', '#a16207', 'expense', ['корм','ветеринар','кошк','собак','наполнител','лоток']),
    D('other', 'Прочее', '📦', '#64748b', 'expense', [], true),
    D('salary', 'Зарплата', '💼', '#16a34a', 'income', ['зарплат','зп','оклад','аванс']),
    D('side', 'Подработка', '🛠️', '#0ea5e9', 'income', ['подработ','фриланс','халтур','заказчик','проект']),
    D('bonus', 'Премия', '🏆', '#eab308', 'income', ['прем','бонус']),
    D('giftin', 'Подарили', '🎉', '#ec4899', 'income', ['подарили','подарил','подарила','одолжили','вернули долг']),
    D('cashback', 'Кэшбэк и проценты', '💳', '#8b5cf6', 'income', ['кэшбэк','кешбэк','кэшбек','кэшбак','cashback','процент']),
    D('refund', 'Возврат', '↩️', '#14b8a6', 'income', ['возврат','вернули','вернул','компенсац']),
    D('otherin', 'Другие доходы', '💰', '#64748b', 'income', [], true)
  ];

  const norm = s => (s || '').toLowerCase().replace(/ё/g, 'е');

  const UNITS = {ноль:0,один:1,одна:1,одну:1,два:2,две:2,три:3,четыре:4,пять:5,шесть:6,семь:7,восемь:8,девять:9,десять:10,одиннадцать:11,двенадцать:12,тринадцать:13,четырнадцать:14,пятнадцать:15,шестнадцать:16,семнадцать:17,восемнадцать:18,девятнадцать:19};
  const TENS = {двадцать:20,тридцать:30,сорок:40,пятьдесят:50,шестьдесят:60,семьдесят:70,восемьдесят:80,девяносто:90};
  const HUND = {сто:100,двести:200,триста:300,четыреста:400,пятьсот:500,шестьсот:600,семьсот:700,восемьсот:800,девятьсот:900};
  const isNumWord = w => w in UNITS || w in TENS || w in HUND || /^тысяч/.test(w);
  function wordsToDigits(text) {
    const toks = text.split(/\s+/), out = [];
    let i = 0;
    while (i < toks.length) {
      if (!isNumWord(toks[i])) { out.push(toks[i]); i++; continue; }
      let total = 0, cur = 0;
      while (i < toks.length && isNumWord(toks[i])) {
        const w = toks[i];
        if (/^тысяч/.test(w)) { total += (cur || 1) * 1000; cur = 0; }
        else cur += UNITS[w] ?? TENS[w] ?? HUND[w] ?? 0;
        i++;
      }
      out.push(String(total + cur));
    }
    return out.join(' ');
  }

  const CUR = /^(руб(л[а-я]*|\.)?|р\.?|₽|rub|коп[а-я]*)$/;
  const INCOME_CUES = ['получил','получила','пришло','пришла','заработал','заработала','доход','поступил','поступило','перевели'];
  const NOISE = ['за','на','потратил','потратила','купил','купила','заплатил','заплатила','расход','рублей','вчера','позавчера','сегодня'].concat(INCOME_CUES);

  const stemOf = w => (w.length > 4 ? w.slice(0, -1) : w);
  function kwOf(c) {
    const own = norm(c.name).split(/[^a-zа-я0-9]+/).filter(w => w.length >= 3 && !['для','при','и'].includes(w)).map(stemOf);
    return (c.kw || []).map(norm).map(s => s.trim()).filter(Boolean).concat(own);
  }

  // ищет категорию по словам; restrict — 'expense'|'income'|undefined
  function categorize(words, cats, learned, restrict) {
    learned = learned || {};
    for (const w of words) {
      const id = learned[w];
      const c = id && cats.find(x => x.id === id);
      if (c && (!restrict || c.type === restrict)) return c;
    }
    let best = null, bs = 0;
    for (const c of cats) {
      if (restrict && c.type !== restrict) continue;
      let s = 0;
      for (const k of kwOf(c)) for (const w of words) if (w.startsWith(k)) s += k.length;
      if (s > bs) { bs = s; best = c; }
    }
    return best;
  }
  function fallbackOf(cats, type) {
    return cats.find(c => c.type === type && c.fallback) || cats.find(c => c.type === type) || null;
  }

  function parse(raw, cats, learned) {
    cats = cats || DEFAULTS;
    let t = norm(raw).replace(/[«»"!?;:]/g, ' ').replace(/(\d),(\d)/g, '$1.$2').replace(/,/g, ' ').replace(/\.(?=\s|$)/g, ' ');
    t = t.replace(/(\d+(?:[.,]\d+)?)\s*(?:тысяч[а-я]*|тыс\.?|к)(?=\s|$)/g, (m, n) => String(parseFloat(n.replace(',', '.')) * 1000));
    t = wordsToDigits(t.replace(/(\d)\s+(?=\d{3}(?:\s|$))/g, '$1'));
    t = t.replace(/(\d),(\d)/g, '$1.$2').replace(/₽/g, ' ₽ ');
    const toks = t.split(/\s+/).filter(Boolean);
    let amount = null, idx = -1;
    for (let i = 0; i < toks.length; i++)
      if (/^\d+(\.\d+)?$/.test(toks[i]) && toks[i + 1] && CUR.test(toks[i + 1])) { amount = parseFloat(toks[i]); idx = i; break; }
    if (idx < 0) for (let i = 0; i < toks.length; i++) {
      const m = toks[i].match(/^(\d+(\.\d+)?)(р|руб|₽)?\.?$/);
      if (m) { amount = parseFloat(m[1]); idx = i; break; }
    }
    const dayOffset = toks.includes('позавчера') ? -2 : toks.includes('вчера') ? -1 : 0;
    const words = toks.filter((w, i) => i !== idx && !/^[-–—.]+$/.test(w) && !CUR.test(w) && !/^\d+(\.\d+)?$/.test(w) && !NOISE.includes(w));
    let cat = categorize(words, cats, learned);
    let type;
    if (cat) type = cat.type;
    else {
      type = toks.some(w => INCOME_CUES.includes(w)) ? 'income' : 'expense';
      cat = fallbackOf(cats, type);
    }
    const title = words.join(' ').trim();
    return { amount, type, cat: cat ? cat.id : null, dayOffset, title: title ? title[0].toUpperCase() + title.slice(1) : '' };
  }

  const CONJ = ['и','а','потом','затем','еще','также','плюс','ну','вот','итого','всего'];
  const TAGW = ['метка','метку','метки','тег','хештег','хэштег','событие'];
  const DAYW = { 'сегодня': 0, 'вчера': -1, 'позавчера': -2 };
  const CASH = ['нал','налом','наличкой','наличными','наличка','наличные','налик'];
  const CARD = ['карта','картой','карту','карты','картами'];
  function accMatcher(accts) {
    accts = accts || [];
    const defs = accts.map(a => {
      const n = norm(a.name), ex = [], st = [];
      n.split(/[^a-zа-я0-9]+/).filter(w => w.length >= 6).forEach(w => st.push(w.slice(0, -1)));
      if (a.id === 'cash' || /налич/.test(n)) { ex.push(...CASH); st.push('налич'); }
      if (a.id === 'card' || /карт/.test(n)) ex.push(...CARD);
      return { id: a.id, ex, st };
    });
    return w => { for (const d of defs) if (d.ex.includes(w) || d.st.some(s => w.startsWith(s))) return d.id; return null; };
  }

  // Несколько трат в одной фразе: «йогурт 44, хлеб 30, такси 350», «два по 50», «вчера кофе 200 сегодня такси 300»
  function parseMany(raw, cats, learned, accts) {
    cats = cats || DEFAULTS; learned = learned || {};
    let t = norm(raw).replace(/[«»"!?;:()]/g, ' ').replace(/(\d),(\d)/g, '$1.$2').replace(/,/g, ' ').replace(/\.(?=\s|$)/g, ' ');
    t = t.replace(/(\d+(?:\.\d+)?)\s*(?:тысяч[а-я]*|тыс\.?|к)(?=\s|$)/g, (m, n) => String(parseFloat(n) * 1000));
    t = wordsToDigits(t.replace(/(\d)\s+(?=\d{3}(?:\s|$))/g, '$1')).replace(/₽/g, ' ₽ ');
    t = t.replace(/(\d+)\s+([а-я-]+(?:\s+[а-я-]+){0,2}?)\s+по\s+(\d+(?:\.\d+)?)/g, (m, q, w, p) => w + ' ' + (+q * +p));
    t = t.replace(/(\d+)\s+по\s+(\d+(?:\.\d+)?)/g, (m, q, p) => String(+q * +p));
    const toks = t.split(/\s+/).filter(Boolean), am = accMatcher(accts), ev = [];
    const isN = w => w !== undefined && /^\d+(\.\d+)?$/.test(w);
    for (let i = 1; i < toks.length - 1; i++) if (toks[i] === 'за' && isN(toks[i - 1]) && isN(toks[i + 1]) && +toks[i + 1] > +toks[i - 1] * 3) toks[i - 1] = '\u0001' + toks[i - 1];
    for (let ti = 0; ti < toks.length; ti++) {
      const w = toks[ti];
      if (w[0] === '#' && w.length > 1) { ev.push({ k: 'tag', v: w.slice(1) }); continue; }
      if (TAGW.includes(w)) { const nx = toks[ti + 1]; if (nx && !/^\d/.test(nx)) { ev.push({ k: 'tag', v: nx }); ti++; } continue; }
      if (w[0] === '\u0001') { ev.push({ k: 'w', v: w.slice(1) }); continue; }
      if (w in DAYW) { ev.push({ k: 'day', v: DAYW[w] }); continue; }
      if (INCOME_CUES.includes(w)) { ev.push({ k: 'cue' }); continue; }
      const a = am(w); if (a) { ev.push({ k: 'acc', v: a }); continue; }
      if (CUR.test(w) || /^[-–—.]+$/.test(w) || NOISE.includes(w)) continue;
      const m = w.match(/^(\d+(?:\.\d+)?)(р|руб|₽)?\.?$/);
      if (m) { ev.push({ k: 'num', v: parseFloat(m[1]) }); continue; }
      ev.push({ k: 'w', v: w });
    }
    const first = ev.find(e => e.k === 'num' || e.k === 'w');
    const priceFirst = !!first && first.k === 'num';
    const segs = []; let words = [], off = 0, acc = null, cue = false, cur = null, stags = [];
    if (!priceFirst) {
      for (const e of ev) {
        if (e.k === 'day') off = e.v;
        else if (e.k === 'acc') { if (!words.length && segs.length) segs[segs.length - 1].acc = e.v; else acc = e.v; }
        else if (e.k === 'cue') cue = true;
        else if (e.k === 'tag') { if (!words.length && segs.length) segs[segs.length - 1].tags.push(e.v); else stags.push(e.v); }
        else if (e.k === 'w') words.push(e.v);
        else { segs.push({ amount: e.v, words, off, acc, cue, tags: stags.slice() }); words = []; cue = false; }
      }
      if (words.length) { if (segs.length) segs[segs.length - 1].words = segs[segs.length - 1].words.concat(words); else segs.push({ amount: null, words, off, acc, cue, tags: stags.slice() }); }
    } else {
      for (const e of ev) {
        if (e.k === 'day') off = e.v;
        else if (e.k === 'acc') { acc = e.v; if (cur && cur.acc == null) cur.acc = e.v; }
        else if (e.k === 'cue') { if (cur) cur.cue = true; else cue = true; }
        else if (e.k === 'tag') { if (cur) cur.tags.push(e.v); else stags.push(e.v); }
        else if (e.k === 'num') { cur = { amount: e.v, words: [], off, acc, cue, tags: stags.slice() }; cue = false; segs.push(cur); }
        else if (e.k === 'w') { if (cur) cur.words.push(e.v); else words.push(e.v); }
      }
      if (segs.length && words.length) segs[0].words = words.concat(segs[0].words);
    }
    return segs.map(s => {
      const ws = s.words.slice();
      while (ws.length && CONJ.includes(ws[0])) ws.shift();
      while (ws.length && CONJ.includes(ws[ws.length - 1])) ws.pop();
      let c = categorize(ws, cats, learned), type;
      if (c) type = c.type; else { type = s.cue ? 'income' : 'expense'; c = fallbackOf(cats, type); }
      const title = ws.join(' ');
      return { amount: s.amount, type, cat: c ? c.id : null, dayOffset: s.off, acc: s.acc || null, tags: [...new Set((s.tags || []).map(t => t.replace(/[^a-zа-я0-9_-]+/g, '').slice(0, 24)).filter(Boolean))], title: title ? title[0].toUpperCase() + title.slice(1) : '' };
    });
  }

  root.Parser = { parse, parseMany, categorize, fallbackOf, DEFAULTS, norm };
  if (typeof module !== 'undefined') module.exports = root.Parser;
})(typeof window !== 'undefined' ? window : globalThis);
