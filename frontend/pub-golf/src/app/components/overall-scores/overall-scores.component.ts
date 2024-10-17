import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For common directives
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface Hole {
  id: number;
  name: string;
  par: number;
}

interface Team {
  id: number;
  name: string;
}

interface Player {
  id: number;
  name: string;
  team_id: number;
}

interface Score {
  player_id: number;
  hole_id: number;
  sips: number;
}

interface HoleResult {
  hole: Hole;
  teamResults: TeamResult[];
  winningTeam: Team | null;
}

interface TeamResult {
  team: Team;
  averageSips: number | null;
  differenceFromPar: number | null;
}

@Component({
  selector: 'app-overall-scores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overall-scores.component.html',
  styleUrls: ['./overall-scores.component.css'],
})
export class OverallScoresComponent implements OnInit {
  holes: HoleResult[] = [];
  teams: Team[] = [];
  overallWinningTeam: Team | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadOverallScores();
  }

  loadOverallScores() {
    // Fetch all teams and holes
    forkJoin({
      teams: this.apiService.getTeams(),
      holes: this.apiService.getHoles(),
    }).subscribe(({ teams, holes }) => {
      this.teams = teams;

      // For each hole, calculate team averages and determine the winning team
      const holeObservables = holes.map((hole) =>
        this.calculateHoleResults(hole, teams)
      );

      forkJoin(holeObservables).subscribe((holeResults) => {
        this.holes = holeResults;

        // Determine the overall winning team
        this.determineOverallWinningTeam();
      });
    });
  }

  calculateHoleResults(hole: Hole, teams: Team[]) {
    return this.apiService.getScoresByHole(hole.id).pipe(
      map((scores: Score[]) => {
        // Map scores to players
        const playerScoresMap = new Map<number, number>();
        scores.forEach((score) => {
          playerScoresMap.set(score.player_id, score.sips);
        });

        // Calculate average sips for each team
        const teamResults: TeamResult[] = teams.map((team) => {
          const teamPlayers$ = this.apiService.getPlayersByTeam(team.id);

          return {
            team,
            averageSips: null,
            differenceFromPar: null,
          };
        });

        // Since we cannot make async calls inside map, we'll handle this differently
        return {
          hole,
          teamResults: teamResults,
          winningTeam: null,
        };
      }),
      switchMap((holeResult: HoleResult) => {
        // For each team, fetch players and calculate averages
        const teamAveragesObservables = holeResult.teamResults.map(
          (teamResult) =>
            this.apiService.getPlayersByTeam(teamResult.team.id).pipe(
              map((players: Player[]) => {
                const teamScores = players
                  .map((player) => playerScoresMap.get(player.id))
                  .filter((sips) => sips !== undefined && sips !== null) as number[];

                const totalSips = teamScores.reduce((sum, sips) => sum + sips, 0);
                const averageSips =
                  teamScores.length > 0 ? totalSips / teamScores.length : null;

                const differenceFromPar =
                  averageSips !== null ? averageSips - hole.par : null;

                return {
                  ...teamResult,
                  averageSips,
                  differenceFromPar,
                };
              })
            )
        );

        return forkJoin(teamAveragesObservables).pipe(
          map((teamResults: TeamResult[]) => {
            // Determine the winning team for the hole
            let winningTeam: Team | null = null;
            let lowestAverage = Infinity;

            teamResults.forEach((teamResult) => {
              if (
                teamResult.averageSips !== null &&
                teamResult.averageSips < lowestAverage
              ) {
                lowestAverage = teamResult.averageSips;
                winningTeam = teamResult.team;
              }
            });

            return {
              hole: holeResult.hole,
              teamResults,
              winningTeam,
            };
          })
        );
      })
    );
  }

  determineOverallWinningTeam() {
    const teamWinCounts = new Map<number, number>();

    this.holes.forEach((holeResult) => {
      if (holeResult.winningTeam) {
        const teamId = holeResult.winningTeam.id;
        const currentCount = teamWinCounts.get(teamId) || 0;
        teamWinCounts.set(teamId, currentCount + 1);
      }
    });

    // Find the team with the highest win count
    let maxWins = 0;
    let overallWinner: Team | null = null;

    this.teams.forEach((team) => {
      const wins = teamWinCounts.get(team.id) || 0;
      if (wins > maxWins) {
        maxWins = wins;
        overallWinner = team;
      }
    });

    this.overallWinningTeam = overallWinner;
  }
}