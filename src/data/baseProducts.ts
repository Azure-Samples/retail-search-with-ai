import { Product } from '../components/types';

export const baseProducts: Product[] = [
  {
    id: 1,
    title: "Sony WH-1000XM4 Wireless Headphones",
    basePrice: 349.99,
    brand: "Sony",
    category: "Electronics",
    image: "https://placehold.co/400x300/2563eb/ffffff?text=Sony+Headphones",
    features: [
      "Industry-leading noise cancellation",
      "30-hour battery life",
      "Multi-device pairing",
      "Touch controls"
    ],
    sustainability: "Recyclable packaging",
    rating: 4.8,
    reviews: 12453,
    aiReasoning: {
      text: "These premium Sony headphones align with your preference for high-quality audio equipment. Their industry-leading noise cancellation makes them perfect for your frequent travel based on your browsing history.",
      confidenceScore: 92,
      factors: [
        {
          factor: "Brand Preference",
          weight: 85,
          description: "Your profile shows affinity for premium Sony products"
        },
        {
          factor: "Feature Match",
          weight: 92,
          description: "Noise cancellation matches your previous purchases"
        },
        {
          factor: "Price Point",
          weight: 78,
          description: "Within your typical spending range for premium electronics"
        }
      ]
    },
    standardRank: 3,
    aiRank: 1,
    rankChange: 2
  },
  {
    id: 2,
    title: "Organic Cotton Bedding Set",
    basePrice: 129.99,
    brand: "EcoHome",
    category: "Home & Kitchen",
    image: "https://placehold.co/400x300/16a34a/ffffff?text=Organic+Bedding",
    features: [
      "100% organic cotton",
      "GOTS certified",
      "Chemical-free process",
      "Hypoallergenic"
    ],
    sustainability: "Sustainable manufacturing",
    rating: 4.6,
    reviews: 3422,
    aiReasoning: {
      text: "This EcoHome bedding set matches your preference for sustainable home products. The organic materials align with your previous purchases of eco-friendly household items.",
      confidenceScore: 87,
      factors: [
        {
          factor: "Sustainability",
          weight: 95,
          description: "Strong match with your preference for eco-friendly products"
        },
        {
          factor: "Material Quality",
          weight: 88,
          description: "Organic cotton matches your preference for natural materials"
        },
        {
          factor: "Price Value",
          weight: 75,
          description: "Offers good value within your typical price range for bedding"
        }
      ]
    },
    standardRank: 5,
    aiRank: 2,
    rankChange: 3
  },
  {
    id: 3,
    title: "Smart Home Security System",
    basePrice: 299.99,
    brand: "SecureNet",
    category: "Electronics",
    image: "https://placehold.co/400x300/dc2626/ffffff?text=Security+System",
    features: [
      "AI-powered detection",
      "4K HDR cameras",
      "Mobile app control",
      "24/7 monitoring"
    ],
    sustainability: "Energy efficient",
    rating: 4.7,
    reviews: 8876,
    aiReasoning: {
      text: "Based on your recent searches for home security and smart home products, this system offers the advanced features you've been looking for. The AI capabilities align with your interest in cutting-edge technology.",
      confidenceScore: 89,
      factors: [
        {
          factor: "Tech Preferences",
          weight: 90,
          description: "AI features match your interest in advanced technology"
        },
        {
          factor: "Recent Searches",
          weight: 88,
          description: "You've been actively researching home security options"
        },
        {
          factor: "Integration",
          weight: 85,
          description: "Compatible with other smart home devices you own"
        }
      ]
    },
    standardRank: 1,
    aiRank: 3,
    rankChange: -2
  }
];