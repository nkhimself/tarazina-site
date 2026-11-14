(function () {
  var C = window.CalcCore, S = window.SITE || {};
  var PAGE = window.PAGE || {};
  var U = PAGE.unit || 'عدد';
  var KEY = 'tarazina.calc.v1' + (PAGE.slug ? '.' + PAGE.slug : '');
  var $ = function (id) { return document.getElementById(id); };
  var UNIT_OPTS = [['g', 'گرم'], ['kg', 'کیلوگرم'], ['ml', 'میلی‌لیتر'], ['l', 'لیتر'], ['piece', 'عدد']];

  function nf(x, d) { return Number(x).toLocaleString('en-US', { maximumFractionDigits: d == null ? 0 : d }); }
  function pct(x) { return nf(x, 1) + '%'; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(read())); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }

  function sel(cls, val) {
    return '<select class="' + cls + '">' + UNIT_OPTS.map(function (u) {
      return '<option value="' + u[0] + '"' + (u[0] === val ? ' selected' : '') + '>' + u[1] + '</option>';
    }).join('') + '</select>';
  }
  function addRow(d) {
    d = d || { name: '', price: '', buyQty: '1', buyUnit: 'kg', useQty: '', useUnit: 'g', waste: '0' };
    var el = document.createElement('div'); el.className = 'ing';
    el.innerHTML =
      '<div class="row"><div><label>نام ماده</label><input class="name" value=""></div>' +
      '<div><label>قیمت خرید (تومان)</label><input class="price" inputmode="decimal"></div>' +
      '<div><label>مقدار خریداری‌شده</label><div class="two"><input class="buyQty" inputmode="decimal">' + sel('buyUnit', d.buyUnit) + '</div></div>' +
      '<div><label>مقدار مصرف در این دستور</label><div class="two"><input class="useQty" inputmode="decimal">' + sel('useUnit', d.useUnit) + '</div></div>' +
      '<div><label>ضایعات (٪)</label><input class="waste" inputmode="decimal"></div></div>' +
      '<div class="res"><span>هزینه این ماده: <b class="num lc">—</b></span><button class="link del" type="button">حذف</button></div>';
    el.querySelector('.name').value = d.name || '';
    el.querySelector('.price').value = d.price || '';
    el.querySelector('.buyQty').value = d.buyQty || '';
    el.querySelector('.useQty').value = d.useQty || '';
    el.querySelector('.waste').value = d.waste || '0';
    el.querySelector('.del').onclick = function () { el.remove(); update(); };
    $('ings').appendChild(el);
  }
  function read() {
    var lines = Array.prototype.map.call(document.querySelectorAll('.ing'), function (el) {
      var g = function (c) { return el.querySelector('.' + c).value; };
      return { name: g('name'), price: g('price'), buyQty: g('buyQty'), buyUnit: g('buyUnit'), useQty: g('useQty'), useUnit: g('useUnit'), waste: g('waste') };
    });
    return { lines: lines, portions: $('portions').value, packaging: $('packaging').value, overheadPct: $('overhead').value, marginPct: $('margin').value, step: $('step').value };
  }
  function write(s) {
    $('ings').innerHTML = '';
    (s.lines && s.lines.length ? s.lines : [null]).forEach(addRow);
    $('portions').value = s.portions; $('packaging').value = s.packaging; $('overhead').value = s.overheadPct; $('margin').value = s.marginPct; $('step').value = s.step;
  }
  var last = null;
  function update() {
    var inp = read(), r = C.compute(inp); last = r;
    Array.prototype.forEach.call(document.querySelectorAll('.ing'), function (el, i) {
      var l = r.lines[i];
      var span = el.querySelector('.res span');
      if (l.err === 'unit') span.innerHTML = '<span class="err">واحد خرید و مصرف هم‌نوع نیست (وزن با وزن، حجم با حجم)</span>';
      else if (l.err === 'waste') span.innerHTML = '<span class="err">ضایعات باید بین ۰ تا ۹۹ باشد</span>';
      else span.innerHTML = 'هزینه این ماده: <b class="num">' + (l.err ? '—' : nf(l.cost)) + '</b>';
    });
    var has = r.ingredientTotal > 0;
    $('rErr').textContent = !r.okMargin ? 'سود دلخواه باید بین ۰ تا ۹۹ باشد.' : (r.badLines ? 'یکی از مواد خطا دارد و در حساب نیامده است.' : '');
    var dash = '—';
    $('rPrice').textContent = has && r.okMargin ? nf(r.price) : dash;
    $('rCost').textContent = has ? nf(r.perPieceCost) + ' تومان' : dash;
    $('rIng').textContent = has ? nf(r.perPieceIngredients) + ' تومان' : dash;
    $('rProfit').textContent = has && r.okMargin ? nf(r.profit) + ' تومان' : dash;
    $('rMargin').textContent = has && r.okMargin ? pct(r.realMargin) : dash;
    $('rMarkup').textContent = has && r.okMargin ? pct(r.markup) : dash;
    $('rFood').textContent = has && r.okMargin ? pct(r.foodCostPct) : dash;
    save();
  }
  document.addEventListener('input', update);
  document.addEventListener('change', update);
  $('add').onclick = function () { addRow(); update(); };
  $('print').onclick = function () { window.print(); };
  $('reset').onclick = function () { if (confirm('همه اطلاعات این صفحه پاک شود؟')) { write({ lines: [], portions: '10', packaging: '0', overheadPct: '20', marginPct: '30', step: '1000' }); update(); } };
  $('copy').onclick = function () {
    if (!last) return;
    var t = 'قیمت تمام‌شده هر ' + U + ': ' + nf(last.perPieceCost) + ' تومان\nقیمت فروش پیشنهادی: ' + nf(last.price) + ' تومان\nسود هر عدد: ' + nf(last.profit) + ' تومان (' + pct(last.realMargin) + ' از قیمت فروش)';
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { $('copy').textContent = 'کپی شد'; setTimeout(function () { $('copy').textContent = 'کپی نتیجه'; }, 1500); });
  };

  // brand + links from config.js
  var b = S.brand || 'ترازینا'; if ($('brand2')) $('brand2').textContent = b;
  if (S.appUrl) { $('appcta').hidden = false; $('appbtn').href = S.appUrl; }

  // start: saved state, otherwise a small example so the page is not empty
  write(load() || PAGE.state || { lines: [
    { name: 'آرد', price: '50000', buyQty: '1', buyUnit: 'kg', useQty: '500', useUnit: 'g', waste: '0' },
    { name: 'تخم‌مرغ', price: '90000', buyQty: '30', buyUnit: 'piece', useQty: '3', useUnit: 'piece', waste: '0' },
    { name: 'شیر', price: '40000', buyQty: '1', buyUnit: 'l', useQty: '250', useUnit: 'ml', waste: '0' }
  ], portions: '10', packaging: '2000', overheadPct: '20', marginPct: '30', step: '1000' });
  update();
})();
