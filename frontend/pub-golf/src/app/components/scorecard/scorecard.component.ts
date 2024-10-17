// scorecard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For common directives like *ngFor
import { FormsModule } from '@angular/forms'; // For two-way data binding
import { ApiService } from '../../services/api.service'; // Adjust the path if necessary
import { HoleService } from '../../services/hole.service'; // To get the current hole
import { map, switchMap, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

// Interfaces for data models
interface Team {
  id: number;
  name: string;
  players: Player[];
  averageSips?: number | null; // Average sips for the team
  differenceFromPar?: number | null; // Difference from the par
  isLeading?: boolean; // Indicates if the team is leading
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
  currentPar: number = 0;
  leadingTeamId: number | null = null;

  constructor(
    private apiService: ApiService,
    private holeService: HoleService
  ) {}

  ngOnInit(): void {
    // Subscribe to the currentHoleId from HoleService
    this.holeService.currentHoleId$.subscribe((holeId) => {
      this.currentHoleId = holeId;
      this.loadHoleData();
      this.loadTeamsAndPlayers();
    });
  }

  loadHoleData() {
    this.apiService.getHole(this.currentHoleId).subscribe(
      (hole) => {
        this.currentPar = hole.par;
      },
      (error) => {
        console.error('Error fetching hole data:', error);
      }
    );
  }

  loadTeamsAndPlayers() {
    // Clear previous data
    this.teams = [];
    this.leadingTeamId = null;

    // Fetch all teams
    this.apiService.getTeams().subscribe(
      (teamsData) => {
        // For each team, fetch players and their scores
        const teamObservables = teamsData.map((team) =>
          this.apiService.getPlayersByTeam(team.id).pipe(
            switchMap((playersData) => {
              const playerScoreObservables = playersData.map((player) =>
                this.apiService
                  .getUserScore(player.id, this.currentHoleId)
                  .pipe(
                    map((score) => ({
                      ...player,
                      sips: score.sips,
                    })),
                    catchError(() =>
                      of({
                        ...player,
                        sips: null,
                      })
                    )
                  )
              );
              return forkJoin(playerScoreObservables).pipe(
                map((playersWithScores) => {
                  // Calculate average sips for the team
                  const totalSips = playersWithScores.reduce(
                    (sum, player) => sum + (player.sips || 0),
                    0
                  );
                  const numPlayersWithScores = playersWithScores.filter(
                    (player) => player.sips !== null
                  ).length;
                  const averageSips =
                    numPlayersWithScores > 0
                      ? totalSips / numPlayersWithScores
                      : null;

                  // Calculate difference from par
                  const differenceFromPar =
                    averageSips !== null && this.currentPar !== undefined
                      ? averageSips - this.currentPar
                      : null;

                  return {
                    ...team,
                    players: playersWithScores,
                    averageSips,
                    differenceFromPar,
                  };
                })
              );
            })
          )
        );

        forkJoin(teamObservables).subscribe(
          (teamsWithPlayers) => {
            this.teams = teamsWithPlayers;

            // Identify the leading team (team with the lowest average sips)
            this.identifyLeadingTeam();
          },
          (error) => {
            console.error('Error fetching teams and players:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

  // New method to identify the leading team
  identifyLeadingTeam() {
    let lowestAverage = Infinity;
    let leadingTeamId = null;

    this.teams.forEach((team) => {
      if (
        team.averageSips !== null &&
        team.averageSips! < lowestAverage &&
        team.averageSips! >= 0
      ) {
        lowestAverage = team.averageSips!;
        leadingTeamId = team.id;
      }
    });

    this.leadingTeamId = leadingTeamId;

    // Mark the leading team
    this.teams = this.teams.map((team) => ({
      ...team,
      isLeading: team.id === this.leadingTeamId,
    }));
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