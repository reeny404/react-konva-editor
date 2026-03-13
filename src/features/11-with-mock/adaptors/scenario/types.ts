import type { Color } from '@/types/style';

export type DbId = string;

export type DbPoint = {
  x: number;
  y: number;
};

export type DbBounds = {
  min: DbPoint;
  max: DbPoint;
};

export type ScenarioDb = {
  _id: DbId;
  name: string;
  grid?: {
    cellSize: number;
    x: number;
    y: number;
  };
  backgroundImage?: DbBounds & {
    uploadFilePath?: string | null;
    opacity?: number | null;
    visible?: boolean | null;
    lock?: boolean | null;
  };
  batteryLimit?: DbBounds & {
    points?: DbPoint[];
    visible?: boolean | null;
    lock?: boolean | null;
  };
  mainRacks?: {
    items: Array<
      DbBounds & {
        rackNumber: string;
        rotation?: number | null;
        color?: string | null;
        opacity?: number | null;
        visible?: boolean | null;
        lock?: boolean | null;
        equipments: Array<
          {
            equipmentTag: string;
            min: DbPoint;
            max: DbPoint;
            equipmentRotation: number;
          } & Color
        >;
      }
    >;
    visible?: boolean | null;
    lock?: boolean | null;
  };
  subareaInfo?: Array<{
    id: DbId;
    name: string;
  }>;
};

export type SubareaDb = DbBounds & {
  _id: DbId;
  scenarioId: DbId;
  name: string;
  points?: DbPoint[];
  color?: string | null;
  opacity?: number | null;
  visible?: boolean | null;
  lock?: boolean | null;
  subRacks?: {
    items?: Array<
      DbBounds & {
        rackNumber: string;
        rotation?: number | null;
        color?: string | null;
        opacity?: number | null;
        visible?: boolean | null;
        lock?: boolean | null;
      }
    >;
    visible?: boolean | null;
    lock?: boolean | null;
  };
  buildings?: {
    items?: Array<
      DbBounds & {
        name: string;
        rotation?: number | null;
        color?: string | null;
        opacity?: number | null;
        visible?: boolean | null;
        lock?: boolean | null;
      }
    >;
    visible?: boolean | null;
    lock?: boolean | null;
  };
};
