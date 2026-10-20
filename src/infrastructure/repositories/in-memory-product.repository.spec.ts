
import { InMemoryProductRepository } from
  './in-memory-product.repository';

describe('InMemoryProductRepository', () => {
  let repository: InMemoryProductRepository;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
  });

  it('berhasil menambahkan produk dengan sellerId', async () => {
    const product = await repository.create({
      name: 'Laptop',
      description: 'Laptop untuk kebutuhan kerja',
      price: 8000000,
      category: 'Electronics',
      stock: 10,
      sellerId: 1,
    });

    expect(product.id).toBe(4);
    expect(product.name).toBe('Laptop');
    expect(product.stock).toBe(10);
    expect(product.sellerId).toBe(1);

    const products = await repository.findAll();

    expect(products).toHaveLength(4);
  });

  it('berhasil mencari produk berdasarkan nama', async () => {
  const products = await repository.search('sepatu');

  expect(products).toHaveLength(1);
  expect(products[0].id).toBe(1);
  expect(products[0].name).toBe('Sepatu Sneakers');
  });

  it('berhasil mencari produk berdasarkan ID', async () => {
    const products = await repository.search('2');

    expect(products).toHaveLength(1);
    expect(products[0].id).toBe(2);
    expect(products[0].name).toBe('Tas Wanita');
  });

  it('mengembalikan array kosong jika produk tidak ditemukan', async () => {
    const products = await repository.search('produk-tidak-ada');

    expect(products).toHaveLength(0);
  });

  it('mengizinkan nama produk sama dari seller berbeda', async () => {
    const product = await repository.create({
      name: 'Sepatu Sneakers',
      description: 'Sepatu dari seller kedua',
      price: 650000,
      category: 'Fashion',
      stock: 25,
      sellerId: 2,
    });

    const products = await repository.findAll();

    const matchingProducts = products.filter(
      (item) => item.name === 'Sepatu Sneakers',
    );

    expect(matchingProducts).toHaveLength(2);

    expect(matchingProducts[0].id)
      .not.toBe(matchingProducts[1].id);

    expect(matchingProducts[0].sellerId).toBe(1);
    expect(matchingProducts[1].sellerId).toBe(2);
    expect(product.sellerId).toBe(2);
  });

  it('mengambil produk beserta sellerId berdasarkan ID', async () => {
    const product = await repository.findById(2);

    expect(product).not.toBeNull();
    expect(product?.name).toBe('Tas Wanita');
    expect(product?.sellerId).toBe(2);
  });
});
