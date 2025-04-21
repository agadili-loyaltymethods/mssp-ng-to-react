
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chip, ChipSet } from '@material-ui/core';
import { useProductService } from '../../hooks/useProductService';
import { useAlertService } from '../../hooks/useAlertService';
import { ProductHelper } from '../../utils/productHelper';
import { Product } from '../product/Product';
import { NoData } from '../common/NoData';

export const Purchase: React.FC = () => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const productService = useProductService();
  const alertService = useAlertService();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const fragment = location.hash.replace('#', '');
    if (fragment && allCategories.includes(fragment)) {
      selectCategory(fragment);
    }
  }, [location.hash, allCategories]);

  const loadProducts = async () => {
    try {
      const products = await productService.getProducts().toPromise();
      const categories = ProductHelper.getCategories(products);
      
      setAllProducts(products);
      setAllCategories(categories);
      
      if (categories.length > 0) {
        navigate({ hash: categories[0] });
      }
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    navigate({ hash: category });
    setFilteredProducts(allProducts.filter(x => x.category === category));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center w-[1300px] mt-5">
          <div className="flex flex-col gap-5 w-full">
            <div className="flex flex-wrap items-center gap-5 mb-10 w-full">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex-[0_0_20%] skeleton-card">
                  <div className="skeleton">
                    <div className="h-[150px] w-full mb-4 bg-gray-200 animate-pulse" />
                    <div className="h-5 w-full mb-2.5 bg-gray-200 animate-pulse" />
                    <div className="h-2.5 w-full mb-2.5 bg-gray-200 animate-pulse" />
                    <div className="h-10 w-full mb-5 bg-gray-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center w-[1300px] mt-5">
        <div className="flex justify-center items-center filter-container mb-5">
          <ChipSet>
            {allCategories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => selectCategory(category)}
                className={`pl-2.5 pr-2.5 ${
                  selectedCategory === category ? 'selected' : ''
                }`}
              />
            ))}
          </ChipSet>
        </div>

        <div className="flex flex-wrap gap-4 items-start w-[1300px]">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="flex-[0_0_23%]">
                <Product product={product} />
              </div>
            ))
          ) : (
            <NoData>No products available.</NoData>
          )}
        </div>
      </div>
    </div>
  );
};
