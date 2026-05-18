import { createRoot } from 'react-dom/client'
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';

function ProductCard({ product }) {
  const stars = Math.round(product.rating || 0);

  return (
    <div style={styles.card}>
      <div style={styles.imageWrapper}>
        <img src={product.thumbnail} alt={product.title} style={styles.image} />
      </div>
      <div style={styles.cardContent}>
        <h3 style={styles.title}>{product.title}</h3>
        <p style={styles.price}>{product.price}$</p>
        <div style={styles.rating}>
          {"★".repeat(stars)}{"☆".repeat(5 - stars)}
        </div>
        <span style={styles.category}>{product.category}</span>
      </div>
    </div>
  );
}

function RatingFilter({ value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '10px' }}>
      <span style={{ marginRight: '8px', fontWeight: 'bold' }}>Рейтинг от:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star === value ? 0 : star)}
          style={{
            cursor: 'pointer',
            fontSize: '24px',
            color: star <= value ? '#ffc107' : '#ccc',
            transition: 'color 0.2s'
          }}
        >
          {star <= value ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { register, watch, reset, setValue, control } = useForm({
    defaultValues: {
      search: "",
      category: "all",
      maxPrice: "",
      minRating: 0
    }
  });

  const watchAllFields = watch();
  const { search, category, maxPrice, minRating } = watchAllFields;
 
  useEffect(() => {
    axios.get('https://dummyjson.com/products?limit=150')
      .then(res => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "all" || p.category === category;
      const matchPrice = !maxPrice || p.price <= Number(maxPrice);
      const productStars = Math.round(p.rating);
      const matchRating = minRating === 0 || productStars === minRating;
      
      return matchSearch && matchCategory && matchPrice && matchRating;
    });
  }, [search, category, maxPrice, minRating, products]);

  const handleResetAll = () => {
    reset();
  };

  if (loading) return <h2 style={{ textAlign: 'center' }}>Загрузка товаров...</h2>;

  return (
    <div style={styles.container}>
      <h2>Каталог товаров</h2>

      <form style={styles.filters} onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Поиск..."
          {...register("search")}
          style={styles.input} />

        <select  {...register("category")} style={styles.input}>
          <option value="all">Все категории</option>
          <option value="smartphones">Смартфоны</option>
          <option value="mens-shirts">Мужская одежда</option>
          <option value="mens-shoes">Мужская обувь</option>
          <option value="mens-watches">Мужские наручные часы</option>
          <option value="mobile-accessories">Мобильные аксессуары</option>
          <option value="motorcycle">Мотоциклы</option>
          <option value="sports-accessories">Спортивные аксессуары</option>
          <option value="furniture">Мебель</option>
          <option value="laptops">Ноутбуки</option>
          <option value="fragrances">Парфюмерия</option>
          <option value="skin-care">Уход за кожей</option>
          <option value="kitchen-accessories">Кухонные приборы</option>
          <option value="groceries">Продукты</option>
          <option value="home-decoration">Декор</option>
          <option value="beauty">Косметика</option>
        </select>

      <input
        type="number"
        placeholder="Макс цена"
        {...register("maxPrice")}
        style={styles.input} />

      <button
        type="button"
        onClick={handleResetAll}
        style={styles.resetButton}
      >
        Сбросить все
      </button>
    </form> 
    <div style={{ marginBottom: '30px' }}>
        <Controller
          name="minRating"
          control={control}
          render={({ field }) => (
            <RatingFilter value={field.value} onChange={field.onChange} />
          )} />

        {minRating > 0 && (
          <button
            onClick={() => setValue("minRating", 0)}
            style={{ marginLeft: '10px', cursor: 'pointer', border: 'none', background: 'none', color: '#007bff' }}
          >
            сбросить
          </button>
        )}
      </div><div style={styles.grid}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div style={styles.emptyState}>
            <h3>По вашему запросу ничего не найдено</h3>
            <p>Попробуйте изменить параметры поиска или категорию</p>
          </div>
        )}
      </div>
      </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
  },
  filters: {
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px"
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #eee",
    borderRadius: "15px",
    width: "240px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
  },
  imageWrapper: {
    width: "100%",
    height: "180px",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  cardContent: {
    padding: "15px"
  },
  title: {
    fontSize: "16px",
    margin: "0 0 10px 0",
    color: "#333",
    height: "40px",
    overflow: "hidden",
  },
  price: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "5px 0",
    color: "#000",
  },
  rating: {
    color: "#ffc107",
    margin: "5px 0",
  },
  category: {
    fontSize: "12px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  resetButton:{
    cursor:'pointer',
    padding: '0 15px',
    height:'42px',
    fontSize:'15px',
    border:'1px solid #ccc',
    borderRadius:'8px',
    fontWeight:'bold',
    color:'#676767',
    backgroundColor: '#fff'
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '40px',
    color: '#666'
  }
};

createRoot(document.getElementById('root')).render(
  <>
    <App />
  </>
)