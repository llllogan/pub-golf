// scorecard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For common directives like *ngFor
import { FormsModule } from '@angular/forms'; // For two-way data binding
import { ApiService } from '../../services/api.service'; // Adjust the path if necessary
import { HoleService } from '../../services/hole.service'; // To get the current hole

// Interfaces for data models
interface Team {
  id: number;
  name: string;
  players: Player[];
}

interface Player {
  id: number;
  name: string;
  team_id: number;
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
  teams: Team[] = [];
  currentHoleId: number = 0;

  constructor(
    private apiService: ApiService,
    private holeService: HoleService
  ) {}

  ngOnInit(): void {
    // Subscribe to the currentHoleId from HoleService
    this.holeService.currentHoleId$.subscribe((holeId) => {
      this.currentHoleId = holeId;
      this.loadTeamsAndPlayers();
    });
  }

  loadTeamsAndPlayers() {
    // Clear previous data
    this.teams = [];

    // Fetch all teams
    this.apiService.getTeams().subscribe(
      (teamsData) => {
        teamsData.forEach((team) => {
          // Fetch players for each team
          this.apiService.getPlayersByTeam(team.id).subscribe(
            (playersData) => {
              // Initialize players with their scores
              const playersWithScores: Player[] = playersData.map((player) => ({
                ...player,
                sips: null,
              }));

              // Fetch scores for each player
              playersWithScores.forEach((player) => {
                this.apiService
                  .getUserScore(player.id, this.currentHoleId)
                  .subscribe(
                    (score) => {
                      player.sips = score.sips;
                    },
                    (error) => {
                      // Handle error (e.g., no score exists)
                      player.sips = null;
                    }
                  );
              });

              // Add team with players to the teams array
              this.teams.push({
                ...team,
                players: playersWithScores,
              });
            },
            (error) => {
              console.error(`Error fetching players for team ${team.id}:`, error);
            }
          );
        });
      },
      (error) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

  // Method to update a player's score
  updatePlayerScore(player: Player) {
    if (player.sips !== null && player.sips >= 0) {
      this.apiService
        .updateUserScore(player.id, this.currentHoleId, player.sips)
        .subscribe(
          () => {
            // Successfully updated score
          },
          (error) => {
            console.error('Error updating player score:', error);
          }
        );
    } else {
      console.error('Invalid sips value');
    }
  }
}