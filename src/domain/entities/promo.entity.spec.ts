
import {
  Promo,
  PromoConfig,
} from './promo.entity';

describe('Promo Entity', () => {

  // Konfigurasi dasar untuk pengujian.
  const baseConfig: PromoConfig = {
    id: 1,
    name: 'Diskon Platform 10%',
    source: 'PLATFORM',
    sellerId: null,

    discountType: 'PERCENTAGE',
    discountValue: 10,
    minimumPurchase: 100000,
    maximumDiscount: 25000,

    isStackable: true,

    startsAt: new Date('2026-01-01T00:00:00Z'),
    endsAt: new Date('2026-02-01T00:00:00Z'),
  };

  it('berhasil membuat promo platform', () => {
    const promo = new Promo({
      ...baseConfig,
    });

    expect(promo.config.source).toBe('PLATFORM');
    expect(promo.config.sellerId).toBeNull();
    expect(promo.config.discountValue).toBe(10);
  });

  it('berhasil membuat promo seller', () => {
    const promo = new Promo({
      ...baseConfig,
      source: 'SELLER',
      sellerId: 5,
      name: 'Diskon Seller',
    });

    expect(promo.config.source).toBe('SELLER');
    expect(promo.config.sellerId).toBe(5);
  });

  it('menolak nilai diskon 0', () => {
    expect(() => {
      new Promo({
        ...baseConfig,
        discountValue: 0,
      });
    }).toThrow(
      'Nilai diskon harus lebih besar dari 0',
    );
  });

  it('menolak persentase diskon di atas 100%', () => {
    expect(() => {
      new Promo({
        ...baseConfig,
        discountValue: 110,
      });
    }).toThrow(
      'Persentase diskon tidak boleh melebihi 100%',
    );
  });

  it('menolak diskon nominal berupa pecahan', () => {
    expect(() => {
      new Promo({
        ...baseConfig,
        discountType: 'FIXED',
        discountValue: 25000.5,
      });
    }).toThrow(
      'Nominal diskon harus berupa bilangan bulat',
    );
  });

  it('menolak minimum pembelian negatif', () => {
    expect(() => {
      new Promo({
        ...baseConfig,
        minimumPurchase: -10000,
      });
    }).toThrow(
      'Minimum pembelian tidak valid',
    );
  });

  it('menolak maksimum diskon yang tidak valid', () => {
    expect(() => {
      new Promo({
        ...baseConfig,
        maximumDiscount: 0,
      });
    }).toThrow(
      'Batas maksimum diskon tidak valid',
    );
  });

  it('menolak promo seller tanpa sellerId', () => {
    expect(() => {
      new Promo({
        ...baseConfig,
        source: 'SELLER',
        sellerId: null,
      });
    }).toThrow(
      'Promo seller harus memiliki sellerId yang valid',
    );
  });

  it('menolak promo platform dengan sellerId', () => {
    expect(() => {
      new Promo({
        ...baseConfig,
        source: 'PLATFORM',
        sellerId: 5,
      });
    }).toThrow(
      'Promo platform tidak boleh memiliki sellerId',
    );
  });

  it('menolak periode promo tidak valid', () => {
    expect(() => {
      new Promo({
        ...baseConfig,
        startsAt: new Date('2026-02-01T00:00:00Z'),
        endsAt: new Date('2026-01-01T00:00:00Z'),
      });
    }).toThrow(
      'Periode promo tidak valid',
    );
  });

  it('memeriksa periode aktif promo', () => {
    const promo = new Promo({
      ...baseConfig,
    });

    // Sebelum promo dimulai.
    expect(
      promo.isActive(
        new Date('2025-12-31T23:59:59Z'),
      ),
    ).toBe(false);

    // Tepat saat promo dimulai.
    expect(
      promo.isActive(
        new Date('2026-01-01T00:00:00Z'),
      ),
    ).toBe(true);

    // Ketika promo sedang berlangsung.
    expect(
      promo.isActive(
        new Date('2026-01-15T12:00:00Z'),
      ),
    ).toBe(true);

    // Tepat saat promo berakhir.
    expect(
      promo.isActive(
        new Date('2026-02-01T00:00:00Z'),
      ),
    ).toBe(false);
  });

});
