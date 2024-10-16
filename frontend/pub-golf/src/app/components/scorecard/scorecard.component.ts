// scorecard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngFor and *ngIf
import { FormsModule } from '@angular/forms'; // For two-way data binding
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service'; // Adjust the path as needed

interface Player {
  id: number;
  name: string;
  sips: number | null;
}

@Component({
  selector: 'app-scorecard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.css'],
})
export class ScorecardComponent implements OnInit {
  players: Player[] = [];
  par: number;
  currentHoleId: number;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get current hole ID from route parameters
    this.route.paramMap.subscribe((params) => {
      this.currentHoleId = Number(params.get('id')) || 1;

      // Load hole data
      this.loadHoleData();

      // Load players and their scores
      this.loadPlayers();
    });
  }

  loadHoleData() {
    // Fetch the hole details from the API
    this.apiService.getHole(this.currentHoleId).subscribe((hole) => {
      this.par = hole.par;
    });
  }

  loadPlayers() {
    // Fetch the list of players (users)
    this.apiService.getUsers().subscribe((users) => {
      this.players = users.map((user) => ({
        id: user.id,
        name: user.name,
        sips: null, // Initialize sips as null
      }));

      // Load existing scores for the current hole
      this.players.forEach((player) => {
        this.apiService
          .getUserScore(player.id, this.currentHoleId)
          .subscribe(
            (score) => {
              player.sips = score.sips;
            },
            (error) => {
              // Handle case where no score exists
              player.sips = null;
            }
          );
      });
    });
  }

  updateSip(player: Player) {
    if (player.sips !== null) {
      // Update the user's score via the API
      this.apiService
        .updateUserScore(player.id, this.currentHoleId, player.sips)
        .subscribe(
          () => {
            // Success handling if needed
          },
          (error) => {
            // Error handling if needed
          }
        );
    }
  }

  updatePar() {
    // Update the hole's par via the API
    this.apiService.updateHolePar(this.currentHoleId, this.par).subscribe(
      () => {
        // Success handling if needed
      },
      (error) => {
        // Error handling if needed
      }
    );
  }
}