import React, { useState } from "react";
import { Button, Card, Container, Row, Col, Badge } from "react-bootstrap";
import { StarFill, CartPlus, Eye } from "react-bootstrap-icons";
import useCartStore from "../context/cartStore";
import { useNavigate } from "react-router-dom";
import { featuredProducts } from "../data/ProductData";
import { categories } from '../data/CategoryData';
import "./productcss.css";

interface Product {
  id: number;
  name: string;
  description: string;
  category: number;       // désormais un ID
  price: number;
  image: string;
  rating?: number;
  stock: number;
}

const categoryList = [
  { id: 'All', name: 'All' },
  ...categories.map(cat => ({ id: cat.id, name: cat.name }))
];

const Products: React.FC = () => {
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  // selectedCategory est soit 'All', soit un number
  const [selectedCategory, setSelectedCategory] = useState<string | number>('All');
  const [sortOrder, setSortOrder] = useState<string>("Relevance");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const productsPerPage = 8;
  
  const totalPages = Math.ceil(featuredProducts.length / productsPerPage);
  // Filtrage sur categoryId
  const filteredProducts = featuredProducts.filter(product => {
    return selectedCategory === 'All'
      ? true
      : product.category === selectedCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOrder) {
      case "Price (ascending)":
        return a.price - b.price;
      case "Price (descending)":
        return b.price - a.price;
      case "Best ratings":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation();
  if (product.stock > 0) {
    addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        category: product.category.toString(),
        stock: product.stock,
        description: product.description,
      });
    } else {
      alert("Product out of stock");
    }
  };
  
  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  return (
    <Container className="products-page py-5">
      <h1 className="text-center mb-5 section-title">Our Products</h1>

      {/* Filtres et tri */}
      <div className="mb-4">
        {/* Boutons de catégorie */}
        <div className="mb-2">
          {categoryList.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'primary' : 'outline-secondary'}
              size="sm"
              className="me-2"
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Dropdown de tri */}
        <div>
          <select
            className="form-select form-select-sm"
            value={sortOrder}
            onChange={e => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Sort products by"
            title="Sort products by"
          >
            <option value="Relevance">Sort by: Relevance</option>
            <option value="Price (ascending)">Price (ascending)</option>
            <option value="Price (descending)">Price (descending)</option>
            <option value="Best ratings">Best ratings</option>
          </select>
        </div>
      </div>

      {/* Cartes produit */}
      <Row xs={1} sm={1} md={2} lg={3} xl={3} className="g-4">
        {currentProducts.map(product => (
          <Col key={product.id}>
            <Card
              className="h-100 product-card shadow-lg"
              onClick={() => handleProductClick(product.id)}
              style={{ cursor: "pointer", minHeight: "500px" }}
            >
              <div className="product-badge position-absolute top-0 end-0 m-2 z-1">
                <Badge bg={product.stock > 0 ? "success" : "danger"}>
                  {product.stock > 0 ? "In stock" : "Out of stock"}
                </Badge>
              </div>
              <Card.Img
                variant="top"
                src={product.image}
                alt={product.name}
                className="product-img"
                style={{ height: "280px", objectFit: "cover" }}
              />
              <Card.Body className="d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg="light" text="dark">
                      {categories.find(c => c.id === product.categoryId)?.name}
                    </Badge>
                    {product.rating && (
                      <div className="d-flex align-items-center">
                        <StarFill className="text-warning me-1" />
                        <small>{product.rating}</small>
                      </div>
                    )}
                  </div>
                  <Card.Title className="product-title">{product.name}</Card.Title>
                  <Card.Text className="product-description" style={{ minHeight: "60px" }}>
                    {product.description}
                  </Card.Text>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <h5 className="price mb-0">{product.price.toLocaleString()} $</h5>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleProductClick(product.id);
                      }}
                    >
                      <Eye className="me-1" /> View
                    </Button>
                    <Button
                      variant={product.stock > 0 ? "danger" : "secondary"}
                      size="sm"
                      onClick={e => handleAddToCart(product, e)}
                      disabled={product.stock <= 0}
                    >
                      <CartPlus className="me-1" /> {product.stock > 0 ? "Add" : "Unavailable"}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-5">
        <nav aria-label="Page navigation">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <Button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
            </li>
            <li className="page-item active">
              <span className="page-link">{currentPage}</span>
            </li>
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <Button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </Container>
  );
};

export default Products;
