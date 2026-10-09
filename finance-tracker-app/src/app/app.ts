import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'finance-tracker-app';
  esOscuro = false;

  constructor() {
    const guardado = localStorage.getItem('tema');
    this.esOscuro = guardado
      ? guardado === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.aplicarTema();
  }

  alternarTema(): void {
    this.esOscuro = !this.esOscuro;
    localStorage.setItem('tema', this.esOscuro ? 'dark' : 'light');
    this.aplicarTema();
  }

  private aplicarTema(): void {
    document.body.style.colorScheme = this.esOscuro ? 'dark' : 'light';
  }
}