import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HoleService {
  // Initialize with a default Hole Id, e.g., 1
  private currentHoleIdSubject = new BehaviorSubject<number>(1);

  // Expose the observable part of the BehaviorSubject
  currentHoleId$: Observable<number> = this.currentHoleIdSubject.asObservable();

  constructor() {}

  // Method to update the current Hole Id
  setCurrentHoleId(holeId: number): void {
    this.currentHoleIdSubject.next(holeId);
  }

  // Method to get the current Hole Id value
  getCurrentHoleId(): number {
    return this.currentHoleIdSubject.getValue();
  }
}