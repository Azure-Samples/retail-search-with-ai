import { UserPersona } from '../components/types';

export const userPersonas: UserPersona[] = [
  {
    id: 'luxury',
    name: 'Luxury Diva',
    type: 'Premium Shopper',
    avatar: 'https://placehold.co/100x100',
    preferences: { 
      priceWeight: 0.2,
      qualityWeight: 0.9,
      brandWeight: 0.9,
      description: 'Focuses on premium brands and luxury items'
    }
  },
  {
    id: 'smart',
    name: 'Smart Saver',
    type: 'Value Hunter',
    avatar: 'https://placehold.co/100x100',
    preferences: {
      priceWeight: 0.9,
      qualityWeight: 0.6,
      brandWeight: 0.4,
      description: 'Hunts for the best deals and discounts'
    }
  },
  {
    id: 'tech',
    name: 'Tech Maven',
    type: 'Early Adopter',
    avatar: 'https://placehold.co/100x100',
    preferences: {
      priceWeight: 0.5,
      qualityWeight: 0.8,
      brandWeight: 0.7,
      description: 'Loves latest gadgets and innovations'
    }
  },
  {
    id: 'eco',
    name: 'Eco Warrior',
    type: 'Sustainable Shopper',
    avatar: 'https://placehold.co/100x100',
    preferences: {
      priceWeight: 0.4,
      qualityWeight: 0.8,
      brandWeight: 0.6,
      description: 'Prioritizes eco-friendly and sustainable products'
    }
  }
];
