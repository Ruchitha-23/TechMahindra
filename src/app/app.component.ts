import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">Task Manager</div>
      <div class="navbar-menu" *ngIf="isLoggedIn">
        <span class="user-name">Welcome, {{ currentUser?.name }}</span>
        <a routerLink="/tasks" 
           routerLinkActive="active" 
           [routerLinkActiveOptions]="{exact: true}"
           class="nav-link">Tasks</a>
        <button class="btn btn-logout" (click)="onLogout()">Logout</button>
      </div>
    </nav>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .navbar {
      background-color: #4a90e2;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .navbar-brand {
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .navbar-menu {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .user-name {
      color: white;
      font-size: 0.9rem;
      margin-right: 1rem;
      padding: 0.5rem 1rem;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 500;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 2px;
      background-color: white;
      border-radius: 2px;
    }

    .btn-logout {
      background-color: transparent;
      border: 1px solid white;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background-color: white;
      color: #4a90e2;
    }
  `]
})
export class AppComponent {
  isLoggedIn = false;
  currentUser: any = null;
  currentRoute: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => this.isLoggedIn = isAuthenticated
    );
    this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );

    // Subscribe to router events to track current route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
