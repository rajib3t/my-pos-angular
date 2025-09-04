import { Component } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-main',
  imports: [Header, Sidebar, RouterOutlet],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class MainLayout {

}
