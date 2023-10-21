/**
 * @typedef {Object} Product
 * @property {number} id Auðkenni vöru, jákvæð heiltala stærri en 0.
 * @property {string} title Titill vöru, ekki tómur strengur.
 * @property {string} description Lýsing á vöru, ekki tómur strengur.
 * @property {number} price Verð á vöru, jákvæð heiltala stærri en 0.
 */

/**
 * Fylki af vörum sem hægt er að kaupa.
 * @type {Array<Product>}
 */
const products = [
  {
    id: 1,
    title: 'HTML húfa',
    description:
      'Húfa sem heldur hausnum heitum og hvíslar hugsanlega að þér hvaða element væri best að nota.',
    price: 5_000,
  },
  {
    id: 2,
    title: 'CSS sokkar',
    description: 'Sokkar sem skalast vel með hvaða fótum sem er.',
    price: 3_000,
  },
  {
    id: 3,
    title: 'JavaScript jakki',
    description: 'Mjög töff jakki fyrir öll sem skrifa JavaScript reglulega.',
    price: 20_000,
  },
];

/**
 * @typedef {Object} CartLine
 * @property {Product} product Vara í körfu.
 * @property {number} quantity Fjöldi af vöru.
 */

/**
 * @typedef {Object} Cart
 * @property {Array<CartLine>} lines Fylki af línum í körfu.
 * @property {string|null} name Nafn á kaupanda ef skilgreint, annars `null`.
 * @property {string|null} address Heimilisfang kaupanda ef skilgreint, annars `null`.
 */

/**
 * Karfa sem geymir vörur sem notandi vill kaupa.
 * @type {Cart}
 */
const cart = {
  lines: [],
  name: null,
  address: null,
};

// --------------------------------------------------------
// Hjálparföll

/**
 * Sníða (e. format) verð fyrir íslenskar krónur með því að nota `Intl` vefstaðalinn.
 * Athugið að Chrome styður ekki íslensku og mun því ekki birta verð formuð að íslenskum reglum.
 * @example
 * const price = formatPrice(123000);
 * console.log(price); // Skrifar út `123.000 kr.`
 * @param {number} price Verð til að sníða.
 * @returns Verð sniðið með íslenskum krónu.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
 */
function formatPrice(price) {
  return new Intl.NumberFormat('is-IS', {
    style: 'currency',
    currency: 'ISK',
  }).format(price);
}

function validateInteger(num, min = 0, max = Infinity) {
  return Number.isInteger(num) && num >= min && num <= max;
}

function formatProduct(product, quantity = undefined) {
  if (quantity !== undefined) {
    return `${product.title} — ${quantity}x${formatPrice(product.price)} samtals ${formatPrice(product.price * quantity)}`;
  }
  return `${product.title} — ${formatPrice(product.price)}`;
}

function cartInfo(cart) {
  const lines = cart.lines.map(line => formatProduct(line.product, line.quantity)).join('\n');
  const total = cart.lines.reduce((acc, line) => acc + line.product.price * line.quantity, 0);
  return `${lines}\nSamtals: ${formatPrice(total)}`;
}

// Föll fyrir forritið

function showProducts() {
  products.forEach(product => {
    console.info(`#${product.id} ${formatProduct(product)}`);
  });
}

function addProduct() {
  // Til einföldunar gerum við ekki greinarmun á „Cancel“ og „Escape“ og tómum gildum frá notanda.

  // Förum í gegnum hvort og eitt gildi sem við viljum og pössum að við höfum eitthvað gildi.
  // Gildi sem við fáum í gegnum `prompt` eru annaðhvort `null` ef notandi ýtir á „Cancel“ eða „Esc“
  // eða strengur.
  // Ef við fáum ógilt gildi hættum við í fallinu með því að nota `return` sem skilar `undefined`.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return
  // Þetta er kallað „early exit“ og er gott til að koma í veg fyrir að þurfa að skrifa auka
  // skilyrði í if-setningum en getur valdið vandræðum í einhverjum tilfellum.
  // https://en.wikipedia.org/wiki/Structured_programming#Early_exit
  const title = prompt('Titill:');
  if (!title) {
    console.error('Titill má ekki vera tómur.');
    return;
  }

  const description = prompt('Lýsing:');
  if (!description) {
    console.error('Lýsing má ekki vera tóm.');
    return;
  }

  // Gerum greinarmun á verði sem streng...
  const priceAsString = prompt('Verð:');
  if (!priceAsString) {
    console.error('Verð má ekki vera tómt.');
    return;
  }

  // og síðan verði sem við getum unnið með sem tölu.
  // Hér notum við `Number.parseInt` til að breyta streng í heiltölu.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseInt
  const price = Number.parseInt(priceAsString, 10);

  // Athugum hvort við fáum löglega heiltölu sem er stærri en 0 með því að nota hjálparfallið okkar.
  if (!validateInteger(price, 1)) {
    console.error('Verð verður að vera jákvæð heiltala.');
    return;
  }

  // Búum til auðkenni fyrir vöruna okkar sem einfaldlega næstu heiltölu út frá fjölda vara sem við
  // höfum nú þegar.
  const id = products.length + 1;

  // Búum til vöruna okkar sem hlut með því að nota „object literal“.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer

  // Notum jsdoc til að fá villuathugun í vscode

  /** @type {Product} */
  const product = {
    id,
    title,
    description,
    price,
};

products.push(product);

// Now add the product to the cart with a quantity of 1
cart.lines.push({ product, quantity: 1 });

console.info(`Vöru bætt við:\n${formatProduct(product)}`);
}

function addProductToCart() {
  const idAsString = prompt('Auðkenni vöru:');
  const id = Number.parseInt(idAsString, 10);

  if (!validateInteger(id, 1)) {
    console.error('Verð verður að vera jákvæð heiltala.');
    return;
  }

  const product = products.find(p => p.id === id);
  if (!product) {
    console.error('Vara fannst ekki.');
    return;
  }

  const quantityAsString = prompt('Fjöldi:');
  const quantity = Number.parseInt(quantityAsString, 10);

  if (!validateInteger(quantity, 1, 99)) {
    console.error('Fjöldi er ekki löglegur, lágmark 1 og hámark 99.');
    return;
  }

  const line = cart.lines.find(l => l.product.id === product.id);
  if (line) {
    line.quantity += quantity;
  } else {
    cart.lines.push({ product, quantity });
  }
}

function showCart() {
  if (cart.lines.length === 0) {
    console.info('Karfan er tóm.');
  } else {
    console.info(cartInfo(cart));
  }
}

function checkout() {
  if (cart.lines.length === 0) {
    console.error('Karfan er tóm.');
    return;
  }

  const name = prompt('Nafn:');
  if (!name) {
    console.error('Þarf að gefa upp nafn.');
    return;
  }

  const address = prompt('Heimilisfang:');
  if (!address) {
    console.error('Þarf að gefa upp heimilisfang.');
    return;
  }

  cart.name = name;
  cart.address = address;

  console.info(`Pöntun móttekin ${name}.\nVörur verða sendar á ${address}.\n\n${cartInfo(cart)}`);
}