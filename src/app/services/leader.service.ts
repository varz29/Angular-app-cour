import { Injectable } from '@angular/core';
import { Leader } from '../shared/leader';
import { LEADERS } from '../shared/leaders';

@Injectable({
  providedIn: 'root'
})
export class LeaderService {

  constructor() { }

  getLeaders(): Promise<Leader[]> {
    return new Promise(resolve => {
      setTimeout(() =>
        resolve(LEADERS)
        , 2000);
    });
  }

  getleader(id: string): Promise<Leader> {
    return new Promise(resolve => { setTimeout(() => resolve(LEADERS.filter((lead) => (lead.id == id))[0]), 2000); });
  }

  getFeaturedleader(): Promise<Leader> {
    return new Promise(resolve => { setTimeout(() => resolve(LEADERS.filter((lead) => (lead.featured))[0]), 2000); });
  }
}
