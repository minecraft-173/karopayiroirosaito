alert("app.js読み込み成功");
const products = [
{
id: 'golden-apple',
kind: 'food',
name: '金のリンゴ',
category: '食料',
amount: 90,
description: '戦闘時に役立つ回復アイテム'
},
{
id: 'aojiru',
kind: 'food',
name: '青汁',
category: '食料',
amount: 80,
description: '特製ドリンク'
},
{
id: 'netherite-ingot',
kind: 'material',
name: 'ネザライトインゴット',
category: '素材',
amount: 3000,
description: '最強装備への強化素材'
},
{
id: 'mending-book',
kind: 'book',
name: '修繕のエンチャント本',
category: 'エンチャント本',
amount: 500,
description: '経験値で耐久値を回復'
},
{
id: 'unbreaking-book',
kind: 'book',
name: '耐久力のエンチャント本',
category: 'エンチャント本',
amount: 500,
description: '耐久値の消費を軽減'
},
{
id: 'protection-book',
kind: 'book',
name: 'ダメージ軽減のエンチャント本',
category: 'エンチャント本',
amount: 500,
description: '受けるダメージを軽減'
},
{
id: 'thorns-book',
kind: 'book',
name: '棘の鎧のエンチャント本',
category: 'エンチャント本',
amount: 500,
description: '攻撃した相手に反射ダメージ'
},
{
id: 'depth-strider-book',
kind: 'book',
name: '水中歩行のエンチャント本',
category: 'エンチャント本',
amount: 500,
description: '水中での移動速度を向上'
},
{
id: 'feather-falling-book',
kind: 'book',
name: '落下耐性のエンチャント本',
category: 'エンチャント本',
amount: 500,
description: '落下ダメージを軽減'
},
{
id: 'war-loot',
kind: 'equipment',
name: '鹵獲品',
category: '装備',
amount: 40000,
description: '戦争で獲得した戦利品。内容によって価値が異なる。'
},
{
id: 'elytra',
kind: 'equipment',
name: 'エリトラ',
category: '装備',
amount: 2000,
description: '空を飛べるレア装備'
},
{
id: 'totem',
kind: 'equipment',
name: '不死のトーテム',
category: '装備',
amount: 400,
description: '致命傷を一度だけ防ぐ'
},
{
id: 'beacon',
kind: 'special',
name: 'ビーコン',
category: '特殊アイテム',
amount: 3200,
description: '周囲のプレイヤーに強力な効果を付与'
}
];

const defaultApiBase = 'https://karopay.karon.jp';
const apiBaseInput = document.getElementById('api-base');
const receiveCodeInput = document.getElementById('receive-code');
const statusOutput = document.getElementById('shop-status');
const configForm = document.getElementById('shop-config');
const productGrid = document.getElementById('product-grid');
const template = document.getElementById('product-card-template');

apiBaseInput.value = localStorage.getItem('sampleShop.apiBase') || defaultApiBase;
receiveCodeInput.value = localStorage.getItem('sampleShop.receiveCode') || '';

configForm.addEventListener('submit', event => {
event.preventDefault();
saveConfig();
});

for (const product of products) {
productGrid.appendChild(renderProduct(product));
}

updateStatus();

function renderProduct(product) {
const node = template.content.cloneNode(true);
const card = node.querySelector('.product-card');
const small = node.querySelector('small');
const title = node.querySelector('h3');
const description = node.querySelector('p');
const price = node.querySelector('.product-buy strong');
const button = node.querySelector('button');

card.classList.add(product.kind);
small.textContent = product.category;
title.textContent = product.name;
description.textContent = product.description;
price.textContent = `$${product.amount.toLocaleString('en-US')}`;
button.addEventListener('click', () => buyProduct(product, button));

return node;
}

function saveConfig() {
localStorage.setItem('sampleShop.apiBase', cleanApiBase());
localStorage.setItem('sampleShop.receiveCode', receiveCodeInput.value.trim());
updateStatus('保存しました', 'ready');
}

function updateStatus(message, tone = '') {
const receiveCode = receiveCodeInput.value.trim();
statusOutput.className = tone;

if (message) {
statusOutput.textContent = message;
return;
}

if (!receiveCode) {
statusOutput.textContent = 'サイト用コードを入力してください';
return;
}

statusOutput.className = 'ready';
statusOutput.textContent = 'KaroPay Checkoutに接続できます';
}

async function buyProduct(product, button) {
const receiveCode = receiveCodeInput.value.trim();

if (!receiveCode) {
updateStatus('サイト用コードを入力してください', 'error');
receiveCodeInput.focus();
return;
}

saveConfig();
button.disabled = true;
button.textContent = '作成中';

updateStatus(`${product.name} の支払いページを作成中`, 'ready');

try {
const apiBase = cleanApiBase();


const response = await fetch(`${apiBase}/api/checkout/public/sessions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    receiveCode,
    amount: product.amount,
    description: product.name,
    clientReferenceId: `${product.id}-${Date.now()}`,
    successUrl: `${location.origin}/KaroPayAPISampleSite/success.html`,
    cancelUrl: `${location.origin}/KaroPayAPISampleSite/index.html`
  })
});

const data = await response.json();

if (!response.ok || !data.ok) {
  throw new Error(data.error || 'CHECKOUT_FAILED');
}

sessionStorage.setItem('sampleShop.apiBase', apiBase);
sessionStorage.setItem('sampleShop.lastProduct', JSON.stringify(product));

location.href = data.url;


} catch (error) {
updateStatus(errorMessage(error.message), 'error');
button.disabled = false;
button.textContent = '購入';
}
}

function cleanApiBase() {
return (apiBaseInput.value.trim() || defaultApiBase).replace(/\/+$/, '');
}

function errorMessage(error) {
if (error === 'CODE_NOT_FOUND') return 'サイト用コードが無効です';
if (error === 'INVALID_AMOUNT') return '金額が無効です';
if (error === 'RATE_LIMITED') return '少し待ってからもう一度試してください';
return '支払いページを作成できませんでした';
}
