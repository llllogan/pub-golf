import { Component, OnInit } from '@angular/core';

interface Hole {
  name: string;
  par: number;
  startTime: Date;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentHoleIndex: number;
  currentHole: any;
  nextHole: any;
  countdown: string;

  constructor() {
    this.currentHoleIndex = 0;
    this.currentHole = null;
    this.nextHole = null;
    this.countdown = '';
  }

  ngOnInit(): void {
    // Initialize current hole index
    this.currentHoleIndex = 1; // Start from the first hole

    // Initialize holes data
    const holes = [
      {
        name: 'Red Brick Hotel',
        par: 3,
        startTime: new Date('2024-10-14T14:00:00'),
      },
      {
        name: 'Brisbane Brewing Co',
        par: 4,
        startTime: new Date('2024-10-14T15:34:00'),
      },
      // Add more holes as needed
    ];

    // Set current and next holes based on the current index
    this.currentHole = holes[this.currentHoleIndex - 1];
    this.nextHole = holes[this.currentHoleIndex];

    this.updateCountdown();
    setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown() {
    if (this.nextHole) {
      const now = new Date();
      const diff = this.nextHole.startTime.getTime() - now.getTime();
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