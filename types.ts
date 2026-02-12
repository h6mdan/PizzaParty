
export type GameState = 'MENU' | 'ORDERING' | 'COOKING' | 'SERVING' | 'SUCCESS';

export interface PizzaVariables {
  baseType: 'Pizza' | 'Pie' | null;
  size: 'Small' | 'Big' | 'Super' | null;
  toppings: string[];
  sauce: 'Red' | 'White' | 'Pink' | 'Green' | null;
  extraCheese: boolean;
}

export interface PizzaOrder {
  id: string;
  customer: string;
  message: string;
  requirements: PizzaVariables;
}

export interface ToyVariables {
  model: string;
  color: string;
  size: number;
  hasHat: boolean;
}

export interface AnimalDNA {
  head: string;
  body: string;
  color: string;
  isFlying: boolean;
  powerLevel: number;
}
