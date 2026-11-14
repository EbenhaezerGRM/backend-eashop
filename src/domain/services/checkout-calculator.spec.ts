import { CheckoutCalculator } from './checkout-calculator';

describe('CheckoutCalculator', () => {
  const calculator = new CheckoutCalculator();

  const shipping = {
    serviceType: 'REGULAR' as const,
    shippingCost: 19_000,
  };

  it('menghitung total tanpa diskon', () => {
    const result = calculator.calculate(
      100_000,
      0,
      shipping,
      0,
    );

    expect(result.totalPayable).toBe(119_000);
    expect(result.shippingDiscount).toBe(0);
  });

  it('menghitung diskon produk dan diskon ongkir', () => {
    const result = calculator.calculate(
      200_000,
      20_000,
      shipping,
      10_000,
    );

    expect(result.productDiscount).toBe(20_000);
    expect(result.shippingDiscount).toBe(10_000);
    expect(result.totalPayable).toBe(189_000);
  });

  it('membatasi diskon agar tidak melebihi subtotal atau ongkir', () => {
    const result = calculator.calculate(
      100_000,
      150_000,
      shipping,
      30_000,
    );

    expect(result.productDiscount).toBe(100_000);
    expect(result.shippingDiscount).toBe(19_000);
    expect(result.totalPayable).toBe(0);
  });
});