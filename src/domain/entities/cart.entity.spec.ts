
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from './product.entity';

describe('Cart dan CartItem Entity', () => {
  let cart: Cart;
  let sneakers: Product;
  let bag: Product;
  

  beforeEach(() => {
    cart = new Cart(1, 100);

    sneakers = new Product(
      1,
      'Sepatu Sneakers',
      'Sepatu untuk aktivitas sehari-hari',
      500000,
      'Fashion',
      15,
    );

    bag = new Product(
      2,
      'Tas Wanita',
      'Tas dengan desain elegan',
      250000,
      'Fashion',
      20,
    );
  });

it('menghitung sisa stok produk di keranjang', () => {
  const item = new CartItem(sneakers, 2);

  expect(item.product.stock).toBe(15);
  expect(item.getRemainingStock()).toBe(13);
});


it('mempertahankan informasi seller pada produk di keranjang', () => {
  const sellerProduct = new Product(
    10,
    'Sepatu Running',
    'Sepatu olahraga',
    750000,
    'Fashion',
    20,
    3,
  );

  cart.addItem(
    new CartItem(sellerProduct, 2),
  );

  const items = cart.getItems();

  expect(items).toHaveLength(1);
  expect(items[0].product.sellerId).toBe(3);
  expect(items[0].getSubtotal()).toBe(1500000);
});

  it('keranjang baru memiliki total 0', () => {
    expect(cart.getItems()).toHaveLength(0);
    expect(cart.getTotal()).toBe(0);
  });

  it('menghitung subtotal CartItem', () => {
    const item = new CartItem(sneakers, 2);

    expect(item.getSubtotal()).toBe(1000000);
  });

  it('menghitung total dua produk berbeda', () => {
    cart.addItem(new CartItem(sneakers, 2));
    cart.addItem(new CartItem(bag, 1));

    expect(cart.getItems()).toHaveLength(2);
    expect(cart.getTotal()).toBe(1250000);
  });

  it('menggabungkan jumlah produk yang sama', () => {
    cart.addItem(new CartItem(sneakers, 2));
    cart.addItem(new CartItem(sneakers, 1));

    const items = cart.getItems();

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
    expect(cart.getTotal()).toBe(1500000);
  });

  it('melindungi array internal keranjang', () => {
    cart.addItem(new CartItem(sneakers, 1));

    const items = cart.getItems();

    // Mengubah array hasil getItems()
    items.push(new CartItem(bag, 1));

    // Keranjang asli tidak boleh ikut berubah
    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getTotal()).toBe(500000);
  });

  it('menolak jumlah produk yang tidak valid', () => {
    expect(
      () => new CartItem(sneakers, 0),
    ).toThrow();

    expect(
      () => new CartItem(sneakers, -1),
    ).toThrow();

    expect(
      () => new CartItem(sneakers, 1.5),
    ).toThrow();
  });
});
