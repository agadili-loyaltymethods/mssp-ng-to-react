export class ProductHelper {    
    static getCategories(products: any): string[]{
        return Array.from(new Set(products.map((product: any) => product.category).filter(Boolean)));
    }
  }
  