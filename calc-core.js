/* Core maths of the cost / price calculator. Works in browsers and Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CalcCore = factory();
})(this, function () {
  var UNITS = { g: { k: 'm', f: 1 }, kg: { k: 'm', f: 1000 }, ml: { k: 'v', f: 1 }, l: { k: 'v', f: 1000 }, piece: { k: 'p', f: 1 } };

  // accepts English, Persian and Arabic digits, thousand separators
  function num(x) {
    if (typeof x === 'number') return isFinite(x) ? x : 0;
    var s = String(x == null ? '' : x)
      .replace(/[۰-۹]/g, function (c) { return c.charCodeAt(0) - 0x06F0; })
      .replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 0x0660; })
      .replace(/[,٬،\s]/g, '').replace(/٫/g, '.');
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }

  // one ingredient: price paid for buyQty buyUnit; recipe uses useQty useUnit; waste % is lost when trimming
  function lineCost(l) {
    var b = UNITS[l.buyUnit], u = UNITS[l.useUnit];
    var price = num(l.price), bq = num(l.buyQty), uq = num(l.useQty), w = num(l.waste);
    if (!b || !u || b.k !== u.k) return { cost: 0, err: 'unit' };
    if (price <= 0 || bq <= 0 || uq <= 0) return { cost: 0, err: 'empty' };
    if (w < 0 || w >= 100) return { cost: 0, err: 'waste' };
    var perBase = price / (bq * b.f);
    return { cost: uq * u.f * perBase / (1 - w / 100), err: null };
  }

  function roundUp(x, step) {
    step = num(step);
    if (step <= 0) return x;
    return Math.ceil(x / step - 1e-9) * step;
  }

  // in: {lines[], portions, packaging, overheadPct, marginPct, step}
  function compute(inp) {
    var lines = (inp.lines || []).map(lineCost);
    var ing = 0, bad = 0;
    lines.forEach(function (r) { if (!r.err) ing += r.cost; else if (r.err !== 'empty') bad++; });
    var portions = Math.max(1, num(inp.portions) || 1);
    var over = ing * num(inp.overheadPct) / 100;
    var perIng = ing / portions;                 // ingredients per piece
    var perCost = (ing + over) / portions + num(inp.packaging);   // full cost per piece
    var m = num(inp.marginPct);
    var okMargin = m >= 0 && m < 100;
    var rawPrice = okMargin ? perCost / (1 - m / 100) : 0;
    var price = roundUp(rawPrice, inp.step);
    var profit = price - perCost;
    return {
      lines: lines, badLines: bad, ingredientTotal: ing, overheadTotal: over,
      perPieceIngredients: perIng, perPieceCost: perCost, okMargin: okMargin,
      rawPrice: rawPrice, price: price, profit: profit,
      realMargin: price > 0 ? profit / price * 100 : 0,
      markup: perCost > 0 ? profit / perCost * 100 : 0,
      foodCostPct: price > 0 ? perIng / price * 100 : 0
    };
  }
  return { num: num, lineCost: lineCost, compute: compute, roundUp: roundUp, UNITS: UNITS };
});
