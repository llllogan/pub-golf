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

interface User {
  id: number;
  name: string;
  team_id: number;
}

interface Score {
  user_id: number;
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
  players: User[] = [];
  scores: Score[] = [];
  overallWinningTeam: Team | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadOverallScores();
  }

  loadOverallScores() {
    // Fetch all necessary data
    forkJoin({
      teams: this.apiService.getTeams(),
      holes: this.apiService.getHoles(),
      players: this.apiService.getUsers(),
      scores: this.apiService.getAllScores(),
    }).subscribe(({ teams, holes, players, scores }) => {
      this.teams = teams;
      this.players = players;
      this.scores = scores;

      // Process data
      this.holes = holes.map((hole) => this.calculateHoleResults(hole));

      // Determine the overall winning team
      this.determineOverallWinningTeam();
    });
  }

  calculateHoleResults(hole: Hole): HoleResult {
    // Filter scores for the hole
    const holeScores = this.scores.filter((score) => score.hole_id === hole.id);

    // Map player IDs to team IDs
    const playerTeamMap = new Map<number, number>();
    this.players.forEach((player) => {
      playerTeamMap.set(player.id, player.team_id);
    });

    // Map team IDs to their players' scores
    const teamScoresMap = new Map<number, number[]>();
    this.teams.forEach((team) => {
      teamScoresMap.set(team.id, []);
    });

    holeScores.forEach((score) => {
      const teamId = playerTeamMap.get(score.user_id);
      if (teamId !== undefined) {
        const teamScores = teamScoresMap.get(teamId);
        if (teamScores !== undefined) {
          teamScores.push(score.sips);
        }
      }
    });

    // Calculate average sips and difference from par for each team
    const teamResults: TeamResult[] = this.teams.map((team) => {
      const teamScores = teamScoresMap.get(team.id) || [];
      const totalSips = teamScores.reduce((sum, sips) => sum + sips, 0);
      const averageSips =
        teamScores.length > 0 ? totalSips / teamScores.length : null;

      const differenceFromPar =
        averageSips !== null ? averageSips - hole.par : null;

      return {
        team,
        averageSips,
        differenceFromPar,
      };
    });

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
      hole,
      teamResults,
      winningTeam,
    };
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