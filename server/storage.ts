import { users, roadmaps, type User, type InsertUser, type Roadmap, type InsertRoadmap } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getRoadmap(id: number): Promise<Roadmap | undefined>;
  createRoadmap(roadmap: InsertRoadmap): Promise<Roadmap>;
  getRoadmaps(): Promise<Roadmap[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private roadmaps: Map<number, Roadmap>;
  private currentUserId: number;
  private currentRoadmapId: number;

  constructor() {
    this.users = new Map();
    this.roadmaps = new Map();
    this.currentUserId = 1;
    this.currentRoadmapId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getRoadmap(id: number): Promise<Roadmap | undefined> {
    return this.roadmaps.get(id);
  }

  async createRoadmap(insertRoadmap: InsertRoadmap): Promise<Roadmap> {
    const id = this.currentRoadmapId++;
    const roadmap: Roadmap = { 
      ...insertRoadmap, 
      id,
      createdAt: new Date().toISOString()
    };
    this.roadmaps.set(id, roadmap);
    return roadmap;
  }

  async getRoadmaps(): Promise<Roadmap[]> {
    return Array.from(this.roadmaps.values());
  }
}

export const storage = new MemStorage();
