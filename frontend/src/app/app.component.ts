import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectsComponent } from './projects/projects.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ProjectsComponent],
  template: `
    <div class="header">
      <div class="container">
        <h1>🌐 CNCF Explorer</h1>
        <p>Explore CNCF projects with health snapshots and enterprise solutions</p>
      </div>
    </div>
    <div class="container">
      <app-projects></app-projects>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'CNCF Explorer';
}

