declare namespace GeoJSON {
  interface Position {
    0: number;
    1: number;
    2?: number;
  }

  interface Geometry {
    type: string;
    coordinates: any;
  }

  interface Point extends Geometry {
    type: "Point";
    coordinates: Position;
  }

  interface LineString extends Geometry {
    type: "LineString";
    coordinates: Position[];
  }

  interface Polygon extends Geometry {
    type: "Polygon";
    coordinates: Position[][];
  }

  interface MultiPolygon extends Geometry {
    type: "MultiPolygon";
    coordinates: Position[][][];
  }

  interface Feature {
    type: "Feature";
    geometry: Geometry;
    properties: any;
  }

  interface FeatureCollection {
    type: "FeatureCollection";
    features: Feature[];
  }
}