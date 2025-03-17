import { Product } from '../components/types';

export const baseProducts: Product[] = [
  {
    id: 1,
    title: "Sony WH-1000XM4 Wireless Headphones",
    basePrice: 349.99,
    brand: "Sony",
    category: "Electronics",
    image: "https://placehold.co/400x300",
    features: [
      "Industry-leading noise cancellation",
      "30-hour battery life",
      "Multi-device pairing",
      "Touch controls"
    ],
    sustainability: "Recyclable packaging",
    rating: 4.8,
    reviews: 12453
  },
  {
    id: 2,
    title: "Organic Cotton Bedding Set",
    basePrice: 129.99,
    brand: "EcoHome",
    category: "Home & Kitchen",
    image: "https://placehold.co/400x300",
    features: [
      "100% organic cotton",
      "GOTS certified",
      "Chemical-free process",
      "Hypoallergenic"
    ],
    sustainability: "Sustainable manufacturing",
    rating: 4.6,
    reviews: 3422
  },
  {
    id: 3,
    title: "Smart Home Security System",
    basePrice: 299.99,
    brand: "SecureNet",
    category: "Electronics",
    image: "https://placehold.co/400x300",
    features: [
      "AI-powered detection",
      "4K HDR cameras",
      "Mobile app control",
      "24/7 monitoring"
    ],
    sustainability: "Energy efficient",
    rating: 4.7,
    reviews: 8876
  }
];
