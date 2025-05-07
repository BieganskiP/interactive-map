export type FeatureType =
  | "room"
  | "corridor"
  | "stairs"
  | "elevator"
  | "shop"
  | "restaurant"
  | "gate"
  | "checkin"
  | "security"
  | "baggage"
  | "terminal"
  | "lounge"
  | "building"
  | "toilet"
  | "point";

export interface IndoorFeature {
  id: string;
  type: FeatureType;
  level: number;
  coordinates: [number, number][];
  properties: {
    name: string;
    description: string;
    fillColor?: string;
    borderColor?: string;
    [key: string]: any;
  };
}
