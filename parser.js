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

  const CUR = /^(руб|рубл|р\.?$|₽|rub|копе)/;
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
    let t = norm(raw).replace(/[«»"!?;:]/g, ' ');
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
    const words = toks.filter((w, i) => i !== idx && !CUR.test(w) && !/^\d+(\.\d+)?$/.test(w) && !NOISE.includes(w));
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

  root.Parser = { parse, categorize, fallbackOf, DEFAULTS, norm };
  if (typeof module !== 'undefined') module.exports = root.Parser;
})(typeof window !== 'undefined' ? window : globalThis);
