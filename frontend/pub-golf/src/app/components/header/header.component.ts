import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HoleService } from '../../services/hole.service';
import { ApiService } from '../../services/api.service';

interface Hole {
  id: number;
  name: string;
  par: number;
  time: Date; // Adjust if needed
  location?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentHoleId: number;
  currentHole: Hole | undefined;
  nextHole: Hole | undefined;
  countdown: string;

  constructor(private holeService: HoleService, private apiService: ApiService) { 
    this.countdown = '';
    this.currentHoleId = 0;
   }

  ngOnInit(): void {
    // Subscribe to currentHoleId$
    this.holeService.currentHoleId$.subscribe((holeId) => {
      this.currentHoleId = holeId;
      // Fetch or update data based on the new Hole Id
      this.loadHoleData();
    });

    this.updateCountdown();
    setInterval(() => this.updateCountdown(), 1000);
  }

  // Example method to load hole data based on currentHoleId
  loadHoleData() {
    this.apiService.getHole(this.currentHoleId).subscribe((hole) => {
      this.currentHole = hole;
    });

    this.apiService.getHole(this.currentHoleId + 1).subscribe((hole) => {
      this.nextHole = hole;
      this.updateCountdown();
    });
  }

  // Method to change the Hole Id (e.g., user clicks "Next Hole")
  changeHole(holeId: number) {
    this.holeService.setCurrentHoleId(holeId);
  }

  updateCountdown() {
    if (this.nextHole) {
      const now = new Date();
      const diff = new Date(this.nextHole.time).getTime() - now.getTime();
      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        this.countdown = `${hours}h ${minutes}m ${seconds}s`;
      } else {
        this.countdown = 'Started';
      }
    } else {
      this.countdown = '';
    }
  }
}