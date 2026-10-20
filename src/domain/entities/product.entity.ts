export class Product {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly category: string,
    public readonly stock: number,
    public readonly sellerId: number | null = null,
  ) {}
}
