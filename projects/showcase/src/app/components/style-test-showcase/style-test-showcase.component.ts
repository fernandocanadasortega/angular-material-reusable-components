import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StyleTestComponent } from "angular-material-reusable-components/style-test";

@Component({
  selector: 'app-style-test-showcase',
  templateUrl: './style-test-showcase.component.html',
  styleUrls: ['./style-test-showcase.component.scss'],
  standalone: true,
  imports: [CommonModule, StyleTestComponent]
})
export class StyleTestShowcaseComponent {

  constructor() { }
}
