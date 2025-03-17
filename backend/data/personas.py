# app/data/personas.py
from typing import Dict
from models.user import UserPersona, UserPersonaPreferences


def load_personas() -> Dict[str, UserPersona]:
    """
    Load predefined user personas.
    
    Returns:
        Dictionary of user personas
    """
    personas = {
        "luxury": UserPersona(
            id="luxury",
            name="Luxury Diva",
            type="Premium Shopper",
            avatar="https://placehold.co/100x100",
            preferences=UserPersonaPreferences(
                priceWeight=0.2,
                qualityWeight=0.9,
                brandWeight=0.9,
                description="Focuses on premium brands and luxury items"
            )
        ),
        "smart": UserPersona(
            id="smart",
            name="Smart Saver",
            type="Value Hunter",
            avatar="https://placehold.co/100x100",
            preferences=UserPersonaPreferences(
                priceWeight=0.9,
                qualityWeight=0.6,
                brandWeight=0.4,
                description="Hunts for the best deals and discounts"
            )
        ),
        "tech": UserPersona(
            id="tech",
            name="Tech Maven",
            type="Early Adopter",
            avatar="https://placehold.co/100x100",
            preferences=UserPersonaPreferences(
                priceWeight=0.5,
                qualityWeight=0.8,
                brandWeight=0.7,
                description="Loves latest gadgets and innovations"
            )
        ),
        "eco": UserPersona(
            id="eco",
            name="Eco Warrior",
            type="Sustainable Shopper",
            avatar="https://placehold.co/100x100",
            preferences=UserPersonaPreferences(
                priceWeight=0.4,
                qualityWeight=0.8,
                brandWeight=0.6,
                description="Prioritizes eco-friendly and sustainable products"
            )
        )
    }
    
    return personas