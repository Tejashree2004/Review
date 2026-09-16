
import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import Navbar from "../components/Navbar";
import CategoryCard from "../components/CategoryCard";
import BottomNavigation from "../components/BottomNavigation";

import { getCategories } from "../services/HomeService";

import "../styles/Global.css";
import "../styles/Navbar.css";
import "../styles/CategoryCard.css";
import "../styles/BottomNavigation.css";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();

      const categoryData = Array.isArray(response.data)
        ? response.data
        : [];

      // Remove duplicate categories by category name
      const uniqueCategories = categoryData.filter(
        (category, index, self) => {
          const categoryName = (
            category.name || category.categoryName || ""
          )
            .trim()
            .toLowerCase();

          return (
            index ===
            self.findIndex((item) => {
              const itemName = (
                item.name || item.categoryName || ""
              )
                .trim()
                .toLowerCase();

              return itemName === categoryName;
            })
          );
        }
      );

      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    console.log("Selected Category:", category);
  };

  return (
    <MainLayout>
      <Navbar />

      <div className="section-title">
        <span>All Categories</span>
      </div>

      <div className="categories categories-scrollable">
        {loading ? (
          <p>Loading Categories...</p>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <CategoryCard
              key={category.categoryId}
              category={category}
              onClick={handleCategoryClick}
            />
          ))
        ) : (
          <p>No Categories Found</p>
        )}
      </div>

      <BottomNavigation />
    </MainLayout>
  );
}

export default Categories;

