
export class Seller {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly storeName: string,
    public readonly description: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
