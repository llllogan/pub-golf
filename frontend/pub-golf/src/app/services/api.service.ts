import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Hole {
  id: number;
  name: string;
  par: number;
  time: Date; // Adjust if needed
  location?: string;
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

interface Team {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://192.168.1.11:8000'; // Adjust the URL to match your backend

  constructor(private http: HttpClient) {}

  /** Team Methods **/

  // Get all teams
  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/teams`);
  }

  // Get players by team
  getPlayersByTeam(teamId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/teams/${teamId}/users`);
  }

  /** Hole Methods **/

  // Get all holes
  getHoles(): Observable<Hole[]> {
    return this.http.get<Hole[]>(`${this.apiUrl}/holes`);
  }

  // Get a single hole by ID
  getHole(holeId: number): Observable<Hole> {
    return this.http.get<Hole>(`${this.apiUrl}/holes/${holeId}`);
  }

  // Update the par of a hole
  updateHolePar(holeId: number, par: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/holes/${holeId}`, { par });
  }

  /** User Methods **/

  // Get all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // Get users by team (if needed)
  getUsersByTeam(teamId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/teams/${teamId}/users`);
  }

  /** Score Methods **/

  // Get the score of a user for a hole
  getUserScore(userId: number, holeId: number): Observable<Score> {
    return this.http.get<Score>(
      `${this.apiUrl}/users/${userId}/holes/${holeId}/score`
    );
  }

  // Update the score of a user for a hole
  updateUserScore(
    userId: number,
    holeId: number,
    sips: number
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/users/${userId}/holes/${holeId}/score`,
      { sips }
    );
  }

  // Get all scores for a hole
  getScoresByHole(holeId: number): Observable<Score[]> {
    return this.http.get<Score[]>(`${this.apiUrl}/holes/${holeId}/scores`);
  }

  // Get all scores
  getAllScores(): Observable<Score[]> {
    return this.http.get<Score[]>(`${this.apiUrl}/scores`);
  }
}